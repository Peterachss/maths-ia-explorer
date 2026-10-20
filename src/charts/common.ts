import { scaleLinear, scaleLog } from 'd3-scale';
import type { XAxis } from '../store';

export const W = 520;
export const H = 340;
export const M = { l: 58, r: 18, t: 30, b: 50 };
export const innerW = W - M.l - M.r;
export const innerH = H - M.t - M.b;

export const X_LABEL = 'GDP per capita (constant 2021 international $, PPP)';
export const Y_LABEL = 'Life expectancy at birth (years)';

export function xScale(axis: XAxis) {
  return axis === 'log'
    ? scaleLog().domain([800, 160000]).range([0, innerW])
    : scaleLinear().domain([0, 130000]).range([0, innerW]);
}
export const xTicks = (axis: XAxis) =>
  axis === 'log' ? [1000, 2000, 5000, 10000, 20000, 50000, 100000] : [0, 20000, 40000, 60000, 80000, 100000, 120000];
export const kfmt = (v: number) => (v >= 1000 ? `${v / 1000}k` : String(v));

export function sampleX(axis: XAxis, n = 140): number[] {
  const lo = 900, hi = 125000;
  return Array.from({ length: n }, (_, i) =>
    axis === 'log' ? lo * Math.pow(hi / lo, i / (n - 1)) : lo + ((hi - lo) * i) / (n - 1)
  );
}
