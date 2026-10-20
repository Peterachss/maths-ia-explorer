// src/geo/project.ts
import { Vector3 } from 'three';

/** Latitude and longitude in degrees to a point on a sphere, matching an equirectangular texture. */
export function latLon(lat: number, lon: number, r = 1): Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

/** Spherical linear interpolation between two unit vectors. */
export function slerp(a: Vector3, b: Vector3, t: number): Vector3 {
  const ua = a.clone().normalize();
  const ub = b.clone().normalize();
  const dot = Math.min(1, Math.max(-1, ua.dot(ub)));
  const omega = Math.acos(dot);
  if (omega < 1e-6) return ua;
  const s = Math.sin(omega);
  return ua.multiplyScalar(Math.sin((1 - t) * omega) / s).add(ub.multiplyScalar(Math.sin(t * omega) / s));
}

/** Points along a great circle, lifted above the surface by lift * sin(pi t). */
export function arcPoints(a: Vector3, b: Vector3, lift: number, upTo = 1, steps = 96): Vector3[] {
  const out: Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * upTo;
    const u = i / steps; // lift is shaped over the drawn part only
    out.push(slerp(a, b, t).multiplyScalar(1.004 + lift * Math.sin(Math.PI * u)));
  }
  return out;
}

export const angleBetween = (a: Vector3, b: Vector3) => a.clone().normalize().angleTo(b.clone().normalize());
