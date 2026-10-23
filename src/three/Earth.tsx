import { useMemo } from 'react';
import { useLoader, useThree, type ThreeEvent } from '@react-three/fiber';
import {
  AdditiveBlending,
  BackSide,
  DoubleSide,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector3
} from 'three';
import { makeBorderTexture } from '../geo/borders';
import { latLon } from '../geo/project';
import { useStore } from '../store';
import type { Country } from '../data/schema';

const base = import.meta.env.BASE_URL;

/**
 * A Blue Marble Earth. The day image is NASA Blue Marble Next Generation,
 * December 2004, with topography and bathymetry, credited in Sources. Borders
 * and a 30 degree graticule are drawn into one transparent overlay. There are
 * no clouds, bloom or lens flare; the pillars carry the data.
 *
 * Clicking the map itself picks a country. The beams are only a few pixels
 * wide, so a click on a country's territory must also work: any point within
 * this angle of a marker selects the nearest country.
 */
const PICK_COS = Math.cos((7 * Math.PI) / 180);
const pickDir = new Vector3();

/** A drag orbits the globe, so only an almost-still click picks a country. */
export const PICK_DRAG_PX = 8;

export function Earth({ countries }: { countries: Country[] }) {
  const compact = useThree((s) => s.size.width < 900);
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const [day] = useLoader(TextureLoader, [
    `${base}textures/${compact ? 'earth-day-1k.jpg' : 'earth-day-2k.jpg'}`
  ]) as [Texture];

  const markers = useMemo(
    () => countries.map((c) => ({ iso3: c.iso3, dir: latLon(c.lat, c.lon, 1).normalize() })),
    [countries]
  );

  useMemo(() => {
    day.colorSpace = SRGBColorSpace;
    day.anisotropy = maxAniso;
    day.needsUpdate = true;
  }, [day, maxAniso]);

  const borders = useMemo(() => makeBorderTexture(2048), [compact]);

  /** Nearest marker to a point on the sphere, or null if none is close. */
  const pick = (point: Vector3): string | null => {
    pickDir.copy(point).normalize();
    let iso3: string | null = null;
    let best = PICK_COS;
    for (const marker of markers) {
      const dot = pickDir.dot(marker.dir);
      if (dot > best) {
        best = dot;
        iso3 = marker.iso3;
      }
    }
    return iso3;
  };

  const surfaceClick = (event: ThreeEvent<MouseEvent>) => {
    if (event.delta > PICK_DRAG_PX) return;
    // The sphere is the front-most surface: a beam in front already had its own
    // turn (and stops propagation), so whatever is still behind this hit is
    // occluded — a far-side beam must never claim the click.
    event.stopPropagation();
    const iso3 = pick(event.point);
    if (!iso3) return;
    useStore.getState().select(iso3);
  };

  /** Far-side beams lie behind the sphere; they must not respond to hover. */
  const surfaceOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
  };

  return (
    <group>
      <mesh onClick={surfaceClick} onPointerOver={surfaceOver}>
        <sphereGeometry args={[1, 64, 42]} />
        <meshPhongMaterial
          map={day}
          specular="#17334f"
          shininess={7}
        />
      </mesh>

      <mesh renderOrder={1}>
        <sphereGeometry args={[1.0015, 96, 64]} />
        <meshBasicMaterial
          map={borders}
          transparent
          opacity={0.46}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>

      <Atmosphere />
    </group>
  );
}

/** A thin blue limb, the detail that makes a sphere read as a planet. */
function Atmosphere() {
  return (
    <mesh scale={1.045} renderOrder={3}>
      <sphereGeometry args={[1, 64, 42]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        side={BackSide}
        toneMapped={false}
        vertexShader={`
          varying vec3 vNormalW;
          varying vec3 vPosW;
          void main() {
            vNormalW = normalize(mat3(modelMatrix) * normal);
            vec4 world = modelMatrix * vec4(position, 1.0);
            vPosW = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `}
        fragmentShader={`
          varying vec3 vNormalW;
          varying vec3 vPosW;
          void main() {
            vec3 viewDir = normalize(cameraPosition - vPosW);
            float rim = 1.0 - abs(dot(viewDir, normalize(vNormalW)));
            rim = pow(clamp(rim, 0.0, 1.0), 3.4);
            vec3 colour = mix(vec3(0.16, 0.46, 1.0), vec3(0.62, 0.86, 1.0), rim);
            gl_FragColor = vec4(colour, rim * 0.8);
          }
        `}
      />
    </mesh>
  );
}

/** The simple ocean sphere shown while the satellite texture loads. */
export function LoadingGlobe() {
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 48]} />
      <meshStandardMaterial color="#0a1a2b" roughness={0.85} metalness={0.15} />
    </mesh>
  );
}
