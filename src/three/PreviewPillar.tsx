import { useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { AdditiveBlending, BackSide, Quaternion, SRGBColorSpace, TextureLoader, Vector3 } from 'three';
import { latLon } from '../geo/project';
import { lifeColour, lifeT } from '../theme';
import { glowTexture } from './glow';

function MiniEarth({ life, lat, lon }: { life: number; lat: number; lon: number }) {
  const day = useLoader(TextureLoader, `${import.meta.env.BASE_URL}textures/earth-preview.jpg`);
  const glow = useMemo(() => glowTexture(), []);
  const normal = useMemo(() => latLon(lat, lon, 1).normalize(), [lat, lon]);
  const target = useMemo(() => new Vector3(0.42, 0.2, 0.88).normalize(), []);
  const quat = useMemo(() => new Quaternion().setFromUnitVectors(normal, target), [normal, target]);
  const colour = lifeColour(lifeT(life));
  const marker = normal.clone().multiplyScalar(0.832);

  useMemo(() => {
    day.colorSpace = SRGBColorSpace;
  }, [day]);

  return (
    <group quaternion={quat}>
      <mesh>
        <sphereGeometry args={[0.82, 96, 64]} />
        <meshPhongMaterial map={day} specular="#5b8fc9" shininess={14} />
      </mesh>
      <mesh scale={1.04}>
        <sphereGeometry args={[0.82, 64, 48]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.12} side={BackSide} depthWrite={false} />
      </mesh>
      <mesh position={marker}>
        <sphereGeometry args={[0.012, 12, 8]} />
        <meshBasicMaterial color={colour} toneMapped={false} />
      </mesh>
      <sprite position={marker} scale={0.24}>
        <spriteMaterial
          map={glow}
          color={colour}
          transparent
          opacity={0.65}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
    </group>
  );
}

export function PreviewPillar({ life, lat, lon }: { life: number; lat: number; lon: number }) {
  return (
    <Canvas camera={{ fov: 32, position: [0, 0, 3.2], near: 0.1, far: 10 }} dpr={[1, 2]} aria-hidden="true">
      <ambientLight intensity={1.05} />
      <directionalLight color="#fff4e4" intensity={2.3} position={[2, 2.4, 3]} />
      <MiniEarth life={life} lat={lat} lon={lon} />
    </Canvas>
  );
}
