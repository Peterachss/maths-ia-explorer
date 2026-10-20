import { useMemo, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Country } from '../data/schema';
import type { Analysis } from '../math';
import { theme } from '../theme';
import { Globe } from './Globe';
import { Pillars } from './Pillars';
import { Arc } from './Arc';
import { CameraRig } from './CameraRig';
import { prefersReducedMotion } from '../reducedMotion';

export function Stage({ countries, analysis }: { countries: Country[]; analysis: Analysis }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const zwe = countries.find((c) => c.iso3 === 'ZWE');
  const sgp = countries.find((c) => c.iso3 === 'SGP');
  const gap = analysis.gap;
  const modelColour = useMemo(() => (analysis.better === 'log' ? theme.log : theme.linear), [analysis.better]);

  return (
    <Canvas dpr={[1, 2]} camera={{ fov: 35, position: [0, 1.1, 5.4], near: 0.1, far: 50 }} gl={{ antialias: true }}>
      <color attach="background" args={[theme.ink0]} />
      <ambientLight intensity={0.55} />
      <directionalLight color="#ffd9a0" intensity={2.4} position={[-3, 2, 4]} />
      <directionalLight color="#6f7a94" intensity={0.35} position={[4, -1, -3]} />
      <Suspense fallback={null}>
        <Globe />
        <Pillars countries={countries} />
        {zwe && sgp && gap && (
          <Arc
            from={zwe}
            to={sgp}
            observedGap={gap.observedGap}
            modelFraction={gap.predictedGap / gap.observedGap}
            modelColour={modelColour}
          />
        )}
      </Suspense>
      <CameraRig countries={countries} controls={controls} />
      <OrbitControls
        ref={controls}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={1.4}
        maxDistance={7}
        autoRotate={!prefersReducedMotion()}
        autoRotateSpeed={0.25}
        rotateSpeed={0.6}
      />
    </Canvas>
  );
}
