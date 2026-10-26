import { useEffect, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, type PerspectiveCamera } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { angleBetween, latLon, slerp } from '../geo/project';
import { prefersReducedMotion } from '../reducedMotion';
import type { Country } from '../data/schema';
import { useStore } from '../store';
import type { ViewCommand } from './view';

const ease = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

interface Flight {
  t0: number;
  dur: number;
  fromDir: Vector3;
  toDir: Vector3;
  fromDist: number;
  toDist: number;
}

/** Flies the camera along a great circle to frame one or two countries. */
export function CameraRig({
  countries,
  controls,
  view
}: {
  countries: Country[];
  controls: RefObject<OrbitControlsImpl>;
  view: RefObject<ViewCommand>;
}) {
  const camera = useThree((s) => s.camera);
  const focus = useStore((s) => s.focus);
  const flight = useRef<Flight | null>(null);
  const zoomTarget = useRef<number | null>(null);

  useEffect(() => {
    const el = controls.current?.domElement;
    if (!el) return;
    const cancel = () => { zoomTarget.current = null; };
    el.addEventListener('pointerdown', cancel);
    el.addEventListener('wheel', cancel, { passive: true });
    return () => {
      el.removeEventListener('pointerdown', cancel);
      el.removeEventListener('wheel', cancel);
    };
  }, [controls]);

  useEffect(() => {
    const pts = focus.iso3
      .map((i) => countries.find((c) => c.iso3 === i))
      .filter((c): c is Country => !!c)
      .map((c) => latLon(c.lat, c.lon));
    if (!pts.length) return;
    const first = pts[0]!;
    const toDir = (pts.length > 1 ? slerp(first, pts[1]!, 0.5) : first).clone().normalize();
    const spread = pts.length > 1 ? angleBetween(first, pts[1]!) : 0;
    // Fit the sphere to the narrower of the two fields of view. A fixed
    // distance cropped the globe horizontally in the tall desktop stage.
    const perspective = camera as PerspectiveCamera;
    const vFov = (perspective.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * perspective.aspect);
    const fitFov = Math.min(vFov, hFov);
    const radius = 1.24 + spread * 0.16;
    const toDist = Math.min(7.4, Math.max(3.2, radius / Math.sin(fitFov / 2)));
    const fromDir = camera.position.clone().normalize();
    zoomTarget.current = null;
    if (prefersReducedMotion() || focus.key === 0) {
      camera.position.copy(toDir.clone().multiplyScalar(toDist));
      return;
    }
    flight.current = {
      t0: performance.now(),
      dur: 800,
      fromDir,
      toDir,
      fromDist: camera.position.length(),
      toDist
    };
  }, [focus, countries, camera]);

  useFrame(() => {
    const f = flight.current;
    if (f) {
      const p = ease((performance.now() - f.t0) / f.dur);
      const dir = slerp(f.fromDir, f.toDir, p);
      const dist = f.fromDist + (f.toDist - f.fromDist) * p;
      camera.position.copy(dir.multiplyScalar(dist));
      camera.lookAt(0, 0, 0);
      if (p >= 1) flight.current = null;
    } else {
      const command = view.current?.zoom;
      if (command) {
        const current = camera.position.length();
        zoomTarget.current = Math.min(8.3, Math.max(1.3, current * command));
        view.current!.zoom = null;
      }
      if (zoomTarget.current !== null) {
        const current = camera.position.length();
        const next = current + (zoomTarget.current - current) * 0.18;
        if (Math.abs(next - zoomTarget.current) < 0.003) {
          camera.position.setLength(zoomTarget.current);
          zoomTarget.current = null;
        } else {
          camera.position.setLength(next);
        }
        camera.lookAt(0, 0, 0);
      }
    }
    controls.current?.update();
  });

  return null;
}
