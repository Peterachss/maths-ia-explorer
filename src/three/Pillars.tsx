import { useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Quaternion, Vector3 } from 'three';
import type { Country } from '../data/schema';
import { latLon } from '../geo/project';
import { lifeColour, lifeT, theme } from '../theme';
import { useStore } from '../store';

const UP = new Vector3(0, 1, 0);
const height = (life: number) => 0.025 + ((life - 50) / 36) * 0.3;

interface Props {
  countries: Country[];
}

/** A label that disappears when its pillar rotates round the back of the globe. */
function FacingLabel({ at, top, text }: { at: Vector3; top: number; text: string }) {
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
      <span className="pillar-label">{text}</span>
    </Html>
  );
}

export function Pillars({ countries }: Props) {
  const { selected, hovered, excluded, select, hover } = useStore();
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
        const isOut = excluded.includes(c.iso3);
        const colour = isSel ? theme.thread : lifeColour(lifeT(c.life));
        return (
          <group key={c.iso3} position={base} quaternion={quat}>
            {/* visible rod */}
            <mesh position={[0, h / 2, 0]}>
              <cylinderGeometry args={[0.0065, 0.0065, h, 12]} />
              <meshStandardMaterial
                color={colour}
                roughness={0.55}
                metalness={0.1}
                transparent={isOut}
                opacity={isOut ? 0.25 : 1}
                wireframe={isOut}
              />
            </mesh>
            {/* flat cap */}
            <mesh position={[0, h, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.004, 16]} />
              <meshStandardMaterial color={colour} roughness={0.5} transparent={isOut} opacity={isOut ? 0.3 : 1} />
            </mesh>
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
              <cylinderGeometry args={[0.03, 0.03, Math.max(h, 0.08), 8]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            {(isSel || hovered === c.iso3) && (
              <FacingLabel at={normal} top={h + 0.04} text={c.name} />
            )}
          </group>
        );
      })}
    </group>
  );
}
