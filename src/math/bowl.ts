// src/math/bowl.ts : the sum of squared errors as a function of slope and level at the mean.
import type { Point } from './regression';

export interface Bowl {
  a0: number; // least squares slope
  c0: number; // least squares level: predicted y at the mean of the fitting variable
  ubar: number;
  sigmaA: number;
  sigmaC: number;
  sse0: number;
  mse: number;
  sse: (a: number, c: number) => number;
}

/** Build the bowl for y = a u + b where u = x (linear) or ln x (log). c = a * ubar + b. */
export function makeBowl(pts: readonly Point[], kind: 'linear' | 'log', a0: number, c0: number): Bowl {
  const us = pts.map((p) => (kind === 'log' ? Math.log(p.x) : p.x));
  const ys = pts.map((p) => p.y);
  const n = pts.length;
  const ubar = us.reduce((s, u) => s + u, 0) / n;
  const sse = (a: number, c: number) => {
    let s = 0;
    for (let i = 0; i < n; i++) {
      const e = ys[i]! - (a * (us[i]! - ubar) + c);
      s += e * e;
    }
    return s;
  };
  const sse0 = sse(a0, c0);
  const mse = sse0 / (n - 2);
  const sxx = us.reduce((s, u) => s + (u - ubar) ** 2, 0);
  return { a0, c0, ubar, sigmaA: Math.sqrt(mse / sxx), sigmaC: Math.sqrt(mse / n), sse0, mse, sse };
}
