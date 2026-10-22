import { useMemo } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  BackSide,
  DoubleSide,
  SRGBColorSpace,
  Texture,
  TextureLoader
} from 'three';
import { makeBorderTexture } from '../geo/borders';

const base = import.meta.env.BASE_URL;

/**
 * A Blue Marble Earth. The day image is NASA Blue Marble Next Generation,
 * December 2004, with topography and bathymetry, credited in Sources. Borders
 * and a 30 degree graticule are drawn into one transparent overlay. There are
 * no clouds, bloom or lens flare; the pillars carry the data.
 */
export function Earth() {
  const compact = useThree((s) => s.size.width < 900);
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  const [day] = useLoader(TextureLoader, [
    `${base}textures/${compact ? 'earth-day-1k.jpg' : 'earth-day-2k.jpg'}`
  ]) as [Texture];

  useMemo(() => {
    day.colorSpace = SRGBColorSpace;
    day.anisotropy = maxAniso;
    day.needsUpdate = true;
  }, [day, maxAniso]);

  const borders = useMemo(() => makeBorderTexture(2048), [compact]);

  return (
    <group>
      <mesh>
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
