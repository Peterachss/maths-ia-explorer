import { useMemo, useRef, Suspense, type RefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { ACESFilmicToneMapping, Vector3, type DirectionalLight } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Country } from '../data/schema';
import type { Analysis } from '../math';
import { theme } from '../theme';
import { Earth, LoadingGlobe } from './Earth';
import { Pillars } from './Pillars';
import { Arc } from './Arc';
import { CameraRig } from './CameraRig';
import type { ViewCommand } from './view';
import { prefersReducedMotion } from '../reducedMotion';

/** A key light that follows the camera, so the visible hemisphere is always readable. */
function CameraSun() {
  const light = useRef<DirectionalLight>(null);
  const offset = useMemo(() => new Vector3(-1.9, 1.5, 0.7), []);
  useFrame(({ camera }) => {
    if (light.current) light.current.position.copy(camera.position).add(offset);
  });
  return <directionalLight ref={light} intensity={2.6} color="#fff7ec" />;
}

export function Stage({
  countries,
  analysis,
  view
}: {
  countries: Country[];
  analysis: Analysis;
  view: RefObject<ViewCommand>;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const zwe = countries.find((c) => c.iso3 === 'ZWE');
  const sgp = countries.find((c) => c.iso3 === 'SGP');
  const gap = analysis.gap;
  const modelColour = useMemo(() => (analysis.better === 'log' ? theme.log : theme.linear), [analysis.better]);
  const reduced = prefersReducedMotion();

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 32, position: [0, 1.1, 5.2], near: 0.05, far: 200 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.08;
      }}
    >
      <color attach="background" args={[theme.ink0]} />
      <ambientLight intensity={0.42} />
      <CameraSun />
      <directionalLight color="#5f8fce" intensity={0.55} position={[2.5, -2, -3]} />

      <Stars
        radius={80}
        depth={55}
        count={5600}
        factor={2.3}
        saturation={0}
        fade
        speed={reduced ? 0 : 0.1}
      />

      <Suspense fallback={<LoadingGlobe />}>
        <Earth countries={countries} />
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

      <CameraRig countries={countries} controls={controls} view={view} />
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={1.28}
        maxDistance={8.5}
        rotateSpeed={0.42}
        zoomSpeed={0.72}
        autoRotate={false}
      />
    </Canvas>
  );
}
