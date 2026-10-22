import { useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree, type ThreeEvent } from '@react-three/fiber';
import {
  AdditiveBlending,
  BackSide,
  Color,
  DoubleSide,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  type Group
} from 'three';
import { makeBorderTexture } from '../geo/borders';
import { latLon } from '../geo/project';
import { prefersReducedMotion } from '../reducedMotion';
import { useStore } from '../store';
import type { Country } from '../data/schema';

const base = import.meta.env.BASE_URL;

/**
 * Clicking the map itself picks a country. The beams are only a few pixels
 * wide, so a click on a country's territory must also work: any point within
 * this angle of a marker selects the nearest country.
 */
const PICK_COS = Math.cos((7 * Math.PI) / 180);
const pickDir = new Vector3();

/** A drag orbits the globe, so only an almost-still click picks a country. */
export const PICK_DRAG_PX = 8;

/**
 * A photoreal Earth built from NASA Blue Marble imagery, a terrain normal map,
 * an ocean specular map and a separate cloud shell. The borders are a thin
 * transparent layer so the imagery stays in charge.
 */
export function Earth({ countries }: { countries: Country[] }) {
  const compact = useThree((s) => s.size.width < 900);
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());

  const markers = useMemo(
    () => countries.map((c) => ({ iso3: c.iso3, dir: latLon(c.lat, c.lon, 1).normalize() })),
    [countries]
  );

  const [day, normal, specular, clouds] = useLoader(TextureLoader, [
    `${base}textures/${compact ? 'earth-day-2k.jpg' : 'earth-day.jpg'}`,
    `${base}textures/earth-normal.jpg`,
    `${base}textures/earth-specular.jpg`,
    `${base}textures/earth-clouds.png`
  ]) as [Texture, Texture, Texture, Texture];

  useMemo(() => {
    day.colorSpace = SRGBColorSpace;
    clouds.colorSpace = SRGBColorSpace;
    for (const t of [day, normal, specular, clouds]) {
      t.anisotropy = maxAniso;
      t.needsUpdate = true;
    }
  }, [day, normal, specular, clouds, maxAniso]);

  const borders = useMemo(() => makeBorderTexture(compact ? 2048 : 4096), [compact]);
  const cloudGroup = useRef<Group>(null);

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

  useFrame((_, dt) => {
    if (cloudGroup.current && !prefersReducedMotion()) {
      cloudGroup.current.rotation.y += dt * 0.0035;
    }
  });

  return (
    <group>
      <mesh onClick={surfaceClick} onPointerOver={surfaceOver}>
        <sphereGeometry args={[1, 160, 96]} />
        <meshPhongMaterial
          map={day}
          normalMap={normal}
          normalScale={new Vector2(0.72, 0.72)}
          specularMap={specular}
          specular={new Color('#79add8')}
          shininess={16}
        />
      </mesh>

      <mesh renderOrder={1}>
        <sphereGeometry args={[1.0015, 160, 96]} />
        <meshBasicMaterial
          map={borders}
          transparent
          opacity={0.42}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>

      <group ref={cloudGroup}>
        <mesh renderOrder={2}>
          <sphereGeometry args={[1.012, 128, 80]} />
          <meshPhongMaterial
            map={clouds}
            transparent
            opacity={0.82}
            alphaTest={0.008}
            depthWrite={false}
            side={DoubleSide}
          />
        </mesh>
      </group>

      <Atmosphere />
    </group>
  );
}

/** A thin blue limb, the detail that makes a sphere read as a planet. */
function Atmosphere() {
  return (
    <mesh scale={1.045} renderOrder={3}>
      <sphereGeometry args={[1, 96, 64]} />
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

/** The simple ocean sphere shown while the satellite textures load. */
export function LoadingGlobe() {
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 48]} />
      <meshStandardMaterial color="#0a1a2b" roughness={0.85} metalness={0.15} />
    </mesh>
  );
}
