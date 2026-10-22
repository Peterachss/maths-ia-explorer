import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, CatmullRomCurve3, TubeGeometry, type Mesh } from 'three';
import { arcPoints, angleBetween, latLon } from '../geo/project';
import { theme } from '../theme';
import { prefersReducedMotion } from '../reducedMotion';
import type { Country } from '../data/schema';

interface Props {
  from: Country;
  to: Country;
  observedGap: number; // years, computed
  modelFraction: number; // 0 to 1, predicted gap divided by observed gap, computed
  modelColour: string;
}

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

function Tube({
  pts,
  radius,
  colour,
  dashed = false,
  glow = false
}: {
  pts: ReturnType<typeof arcPoints>;
  radius: number;
  colour: string;
  dashed?: boolean;
  glow?: boolean;
}) {
  const geo = useMemo(() => new TubeGeometry(new CatmullRomCurve3(pts), 160, radius, 8, false), [pts, radius]);
  const mesh = useRef<Mesh>(null);
  const t0 = useRef(performance.now());
  useEffect(() => { t0.current = performance.now(); }, [pts]);
  useFrame(() => {
    const total = geo.index?.count ?? 0;
    const p = prefersReducedMotion() ? 1 : easeOutExpo((performance.now() - t0.current - 400) / 1600);
    geo.setDrawRange(0, Math.floor((total * Math.max(0, p)) / 3) * 3);
  });
  return (
    <mesh ref={mesh} geometry={geo} renderOrder={glow ? 3 : 4}>
      <meshBasicMaterial
        color={colour}
        transparent
        opacity={glow ? 0.1 : dashed ? 0.88 : 0.96}
        blending={glow ? AdditiveBlending : undefined}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/** The thread: the one authored moment. Outer arc is the observed gap, inner arc is what the model matches. */
export function Arc({ from, to, observedGap, modelFraction, modelColour }: Props) {
  const a = useMemo(() => latLon(from.lat, from.lon), [from]);
  const b = useMemo(() => latLon(to.lat, to.lon), [to]);
  const angle = angleBetween(a, b);
  const outer = useMemo(() => arcPoints(a, b, 0.12 + angle * 0.1), [a, b, angle]);
  const inner = useMemo(() => arcPoints(a, b, 0.05 + angle * 0.04, Math.min(1, Math.max(0.02, modelFraction))), [a, b, angle, modelFraction]);
  return (
    <group>
      <Tube pts={outer} radius={0.01} colour={theme.thread} glow />
      <Tube pts={outer} radius={0.0038} colour={theme.thread} />
      <Tube pts={inner} radius={0.008} colour={modelColour} glow />
      <Tube pts={inner} radius={0.0032} colour={modelColour} dashed />
    </group>
  );
}
