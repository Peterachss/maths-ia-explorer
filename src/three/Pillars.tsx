import { useMemo, useRef, useState, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { AdditiveBlending, DoubleSide, Quaternion, Vector3, type Mesh } from 'three';
import type { Country } from '../data/schema';
import { latLon } from '../geo/project';
import { lifeColour, lifeT, theme } from '../theme';
import { useStore } from '../store';
import { prefersReducedMotion } from '../reducedMotion';
import { glowTexture } from './glow';

const UP = new Vector3(0, 1, 0);
const SELECTED = '#5ad1ff';
const height = (life: number) => 0.02 + ((life - 50) / 36) * 0.24;

interface Props {
  countries: Country[];
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

export function Pillars({ countries }: Props) {
  const { selected, hovered, excluded, select, hover } = useStore();
  const glow = useMemo(() => glowTexture(), []);
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

  return (
    <group>
      {items.map(({ c, base, quat, h, normal }) => {
        const isSel = selected.includes(c.iso3);
        const isHover = hovered === c.iso3;
        const isOut = excluded.includes(c.iso3);
        const colour = isSel ? SELECTED : isHover ? '#ffffff' : lifeColour(lifeT(c.life));
        const opacity = isOut ? 0.12 : isHover ? 1 : isSel ? 0.92 : 0.6;
        return (
          <group key={c.iso3} position={base} quaternion={quat}>
            {/* the beam is the data: its height is life expectancy */}
            <mesh position={[0, h / 2, 0]} renderOrder={3}>
              <cylinderGeometry args={[0.0026, 0.0062, h, 12, 1, true]} />
              <meshBasicMaterial
                color={colour}
                transparent
                opacity={opacity}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>

            {/* a wider, softer aura around the beam */}
            <mesh position={[0, h / 2, 0]} renderOrder={3}>
              <cylinderGeometry args={[0.0065, 0.012, h, 12, 1, true]} />
              <meshBasicMaterial
                color={colour}
                transparent
                opacity={isOut ? 0.015 : isHover ? 0.11 : 0.035}
                depthWrite={false}
                blending={AdditiveBlending}
                side={DoubleSide}
                toneMapped={false}
              />
            </mesh>

            {/* the point on the ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} renderOrder={3}>
              <ringGeometry args={[0.009, 0.014, 32]} />
              <meshBasicMaterial
                color={colour}
                transparent
                opacity={isOut ? 0.12 : isHover || isSel ? 0.75 : 0.45}
                side={DoubleSide}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>

            {isSel && <Pulse colour={SELECTED} />}

            {!isOut && (
              <>
                <mesh position={[0, h, 0]} renderOrder={4}>
                  <sphereGeometry args={[0.007, 12, 8]} />
                  <meshBasicMaterial color={colour} toneMapped={false} />
                </mesh>
                <sprite position={[0, h, 0]} scale={isSel || isHover ? 0.14 : 0.06} renderOrder={4}>
                  <spriteMaterial
                    map={glow}
                    color={colour}
                    transparent
                    opacity={isOut ? 0.08 : isHover ? 0.75 : isSel ? 0.62 : 0.28}
                    depthWrite={false}
                    blending={AdditiveBlending}
                    toneMapped={false}
                  />
                </sprite>
              </>
            )}

            {/* generous invisible hit target, independent of the country's area */}
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
                e.stopPropagation();
                select(c.iso3);
              }}
            >
              <cylinderGeometry args={[0.035, 0.035, Math.max(h, 0.09), 8]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {(isSel || isHover) && (
              <FacingLabel at={normal} top={h + 0.055} colour={colour}>
                <strong>{c.name}</strong>
                <span>{c.life.toFixed(1)} years</span>
              </FacingLabel>
            )}
          </group>
        );
      })}
    </group>
  );
}
