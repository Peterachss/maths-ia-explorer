// The least squares bowl: sum of squared errors as a 3D surface over (slope, level at the mean).
import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { BufferAttribute, Color, DoubleSide, PlaneGeometry } from 'three';
import type { Bowl } from '../math/bowl';
import { lifeColour, theme } from '../theme';

const N = 61;
const SPAN = 2.5; // the surface spans plus and minus 2.5 standard errors on each axis

function Surface({ bowl }: { bowl: Bowl }) {
  const geo = useMemo(() => {
    const g = new PlaneGeometry(2, 2, N - 1, N - 1);
    g.rotateX(-Math.PI / 2);
    const pos = g.getAttribute('position');
    const col = new Float32Array(pos.count * 3);
    const hMax = 8 * bowl.mse;
    const tmp = new Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const a = bowl.a0 + x * SPAN * bowl.sigmaA;
      const c = bowl.c0 + z * SPAN * bowl.sigmaC;
      const excess = Math.min(bowl.sse(a, c) - bowl.sse0, hMax * 1.4);
      pos.setY(i, Math.min(0.9, (excess / hMax) * 0.5));
      tmp.set(lifeColour(1 - Math.min(1, excess / hMax)));
      col.set([tmp.r, tmp.g, tmp.b], i * 3);
    }
    g.setAttribute('color', new BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, [bowl]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial vertexColors roughness={0.8} side={DoubleSide} />
    </mesh>
  );
}

export function ModelStage({ bowl, a, c }: { bowl: Bowl; a: number; c: number }) {
  const hMax = 16 * bowl.mse;
  const x = (a - bowl.a0) / (SPAN * bowl.sigmaA);
  const z = (c - bowl.c0) / (SPAN * bowl.sigmaC);
  const y = Math.min(0.9, (Math.min(bowl.sse(a, c) - bowl.sse0, hMax * 1.4) / hMax) * 0.5);
  return (
    <Canvas camera={{ fov: 38, position: [3.4, 3.1, 3.6] }} dpr={[1, 2]}>
      <color attach="background" args={[theme.ink0]} />
      <ambientLight intensity={0.7} />
      <directionalLight color="#ffd9a0" intensity={2} position={[2, 4, 3]} />
      <Surface bowl={bowl} />
      <gridHelper args={[2.4, 8, theme.rule, theme.grat]} position={[0, -0.001, 0]} />
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.06, 0.008, 8, 32]} />
        <meshBasicMaterial color={theme.thread} />
      </mesh>
      <mesh position={[x, y + 0.04, z]}>
        <sphereGeometry args={[0.045, 24, 16]} />
        <meshStandardMaterial color={theme.paper0} roughness={0.4} />
      </mesh>
      <Html position={[1.05, 0, 0]} center style={{ pointerEvents: 'none' }}><span className="axis-label">slope a</span></Html>
      <Html position={[0, 0, 1.05]} center style={{ pointerEvents: 'none' }}><span className="axis-label">level at the mean</span></Html>
      <Html position={[-1, 1.15, -1]} center style={{ pointerEvents: 'none' }}><span className="axis-label">sum of squared errors</span></Html>
      <OrbitControls enablePan={false} minDistance={2} maxDistance={7} />
    </Canvas>
  );
}
