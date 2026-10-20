import { useMemo } from 'react';
import { makeEarthTexture } from '../geo/texture';

export function Globe() {
  const map = useMemo(() => makeEarthTexture(2048), []);
  return (
    <mesh>
      <sphereGeometry args={[1, 96, 64]} />
      <meshStandardMaterial map={map} roughness={1} metalness={0} />
    </mesh>
  );
}
