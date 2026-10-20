import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { lifeColour, lifeT, theme } from '../theme';
import { prefersReducedMotion } from '../reducedMotion';

function Pillar({ life }: { life: number }) {
  const g = useRef<Group>(null);
  useFrame((_, dt) => { if (g.current && !prefersReducedMotion()) g.current.rotation.y += dt * 0.6; });
  const h = 0.3 + ((life - 50) / 36) * 0.9;
  return (
    <group ref={g} position={[0, -0.5, 0]}>
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.55, 0.6, 0.02, 48]} />
        <meshStandardMaterial color={theme.land} roughness={1} />
      </mesh>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, h, 24]} />
        <meshStandardMaterial color={lifeColour(lifeT(life))} roughness={0.5} />
      </mesh>
      <mesh position={[0, h + 0.01, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.03, 32]} />
        <meshStandardMaterial color={lifeColour(lifeT(life))} roughness={0.45} />
      </mesh>
    </group>
  );
}

export function PreviewPillar({ life }: { life: number }) {
  return (
    <Canvas camera={{ fov: 35, position: [2.1, 0.95, 2.1] }} dpr={[1, 2]} aria-hidden="true">
      <ambientLight intensity={0.6} />
      <directionalLight color="#ffd9a0" intensity={2.2} position={[2, 3, 2]} />
      <Pillar life={life} />
    </Canvas>
  );
}
