import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { AdditiveBlending, DoubleSide, Quaternion, Vector3, type Group, type Mesh } from 'three';
import type { Country } from '../data/schema';
import type { Analysis } from '../math';
import { dollars, num } from '../math';
import { latLon } from '../geo/project';
import { lifeColour, lifeT, theme } from '../theme';
import { useStore } from '../store';
import { prefersReducedMotion } from '../reducedMotion';
import { PICK_DRAG_PX } from './Earth';

const UP = new Vector3(0, 1, 0);
const SELECTED = theme.thread;
const RADIUS = 0.014; // about 0.8 degrees at the equator
const height = (life: number) => 0.02 + ((life - 50) / 36) * 0.24;

interface Props {
  countries: Country[];
  analysis: Analysis;
}

/** A label that disappears when its pillar rotates round the back of the globe. */
function FacingLabel({
  at,
  top,
  colour,
  children
}: {
  at: Vector3;
  top: number;
  colour: string;
  children: ReactNode;
}) {
  const camera = useThree((s) => s.camera);
  const [visible, setVisible] = useState(true);
  const outward = useMemo(() => new Vector3(), []);
  const toward = useMemo(() => new Vector3(), []);

  useFrame(() => {
    outward.copy(at).normalize();
    toward.copy(camera.position).normalize();
    const next = outward.dot(toward) > 0.12;
    if (next !== visible) setVisible(next);
  });

  return (
    <Html position={[0, top, 0]} center style={{ pointerEvents: 'none', opacity: visible ? 1 : 0 }}>
      <span className="pillar-label" style={{ boxShadow: `inset 2px 0 0 ${colour}` }}>{children}</span>
    </Html>
  );
}

/** A slow ring at the foot of a selected marker. */
function Pulse({ colour }: { colour: string }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = prefersReducedMotion() ? 0.45 : (Math.sin(clock.elapsedTime * 2.1) + 1) / 2;
    const s = 1 + t * 0.85;
    ref.current.scale.set(s, s, 1);
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} renderOrder={4}>
      <ringGeometry args={[0.018, 0.023, 40]} />
      <meshBasicMaterial color={colour} transparent opacity={0.5} side={DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function Pillar({
  c,
  base,
  quat,
  h,
  normal,
  analysis
}: {
  c: Country;
  base: Vector3;
  quat: Quaternion;
  h: number;
  normal: Vector3;
  analysis: Analysis;
}) {
  const { selected, hovered, excluded, select, hover } = useStore();
  const group = useRef<Group>(null);
  const camera = useThree((s) => s.camera);
  const direction = useMemo(() => new Vector3(), []);
  const fit = analysis.better === 'log' ? analysis.log : analysis.linear;
  const residual = c.life - fit.predict(c.gdp);
  const isSel = selected.includes(c.iso3);
  const isHover = hovered === c.iso3;
  const isOut = excluded.includes(c.iso3);
  const colour = isSel ? SELECTED : isHover ? '#ffffff' : lifeColour(lifeT(c.life));
  const opacity = isOut ? 0.12 : isHover ? 1 : isSel ? 0.95 : 0.82;

  useFrame(() => {
    if (!group.current) return;
    direction.copy(camera.position).normalize();
    group.current.visible = normal.dot(direction) > -0.08;
  });

  return (
    <group ref={group} position={base} quaternion={quat}>
      <mesh position={[0, h / 2, 0]} renderOrder={3}>
        <cylinderGeometry args={[RADIUS, RADIUS, h, 16, 1, false]} />
        <meshBasicMaterial color={colour} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, h + 0.004, 0]} renderOrder={4}>
        <sphereGeometry args={[0.011, 12, 8]} />
        <meshBasicMaterial color={colour} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} renderOrder={3}>
        <ringGeometry args={[0.012, 0.017, 32]} />
        <meshBasicMaterial color={colour} transparent opacity={isOut ? 0.12 : isHover || isSel ? 0.75 : 0.45} side={DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>

      {isSel && <Pulse colour={SELECTED} />}

      <mesh
        position={[0, h / 2, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          hover(c.iso3);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          hover(null);
          document.body.style.cursor = '';
        }}
        onClick={(e) => {
          if (e.delta > PICK_DRAG_PX) return;
          e.stopPropagation();
          select(c.iso3);
        }}
      >
        <cylinderGeometry args={[0.045, 0.045, Math.max(h, 0.09), 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {isHover && (
        <Html position={[0, h + 0.08, 0]} center style={{ pointerEvents: 'none' }}>
          <span className="pillar-tooltip">
            <strong>{c.name}</strong>
            <span>{num(c.life, 1)} years · {dollars(c.gdp)}</span>
            <span>Residual {num(residual, 2)} years</span>
          </span>
        </Html>
      )}

      {(isSel || isHover) && (
        <FacingLabel at={normal} top={h + 0.055} colour={colour}>
          <strong>{c.name}</strong>
          <span>{c.life.toFixed(1)} years</span>
        </FacingLabel>
      )}
    </group>
  );
}

export function Pillars({ countries, analysis }: Props) {
  const items = useMemo(
    () =>
      countries.map((c) => {
        const base = latLon(c.lat, c.lon, 1);
        const normal = base.clone().normalize();
        const quat = new Quaternion().setFromUnitVectors(UP, normal);
        return { c, base, quat, h: height(c.life), normal };
      }),
    [countries]
  );
  const ghostLat = 4;
  const ghostLon = 20;
  const ghostBase = latLon(ghostLat, ghostLon, 1);
  const ghostNormal = ghostBase.clone().normalize();
  const ghostQuat = new Quaternion().setFromUnitVectors(UP, ghostNormal);
  const ghostH = height(80);

  return (
    <group>
      {items.map((item) => (
        <Pillar key={item.c.iso3} {...item} analysis={analysis} />
      ))}
      <group position={ghostBase} quaternion={ghostQuat}>
          <mesh position={[0, ghostH / 2, 0]} renderOrder={2}>
            <cylinderGeometry args={[0.006, 0.006, ghostH, 12, 1, true]} />
            <meshBasicMaterial color="#9fc7ff" transparent opacity={0.22} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
          </mesh>
          <Html position={[0, ghostH + 0.04, 0]} center style={{ pointerEvents: 'none' }}>
            <span className="ghost-label">80 years</span>
          </Html>
      </group>
    </group>
  );
}
