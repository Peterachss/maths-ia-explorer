// src/math/regression.ts
// Notation follows IB Mathematics: Analysis and Approaches SL.
// Two pass formulas and compensated summation keep rounding error tiny.

export interface Point {
  iso3: string;
  name: string;
  x: number; // GDP per capita, constant 2021 international dollars
  y: number; // life expectancy at birth, years
}

export type ModelKind = 'linear' | 'log';

export interface Fit {
  kind: ModelKind;
  a: number;
  b: number;
  n: number;
  r: number; // Pearson r between x (or ln x) and y
  r2: number; // 1 - SSE / SST
  sse: number; // residual sum of squares, years squared
  sst: number; // total sum of squares of y
  se: number; // residual standard error, sqrt(SSE / (n - 2)), years
  rmse: number; // sqrt(SSE / n), years
  sxx: number; // in the fitting variable (x or ln x)
  sxy: number;
  syy: number;
  meanU: number; // mean of the fitting variable
  meanY: number;
  predict: (x: number) => number;
  derivative: (x: number) => number; // dy/dx, years per dollar
  inverse: (y: number) => number; // x for a given y, dollars
  residuals: number[]; // observed minus predicted, input order
  fitted: number[];
}

/** Kahan compensated sum. */
export function sum(values: readonly number[]): number {
  let s = 0;
  let c = 0;
  for (const v of values) {
    const y = v - c;
    const t = s + y;
    c = t - s - y;
    s = t;
  }
  return s;
}

export function mean(values: readonly number[]): number {
  if (values.length === 0) throw new Error('mean of an empty list');
  return sum(values) / values.length;
}

interface Line {
  a: number;
  b: number;
  sxx: number;
  sxy: number;
  syy: number;
  r: number;
  meanU: number;
  meanY: number;
}

/** Ordinary least squares for y = a u + b (regression of y on u). */
export function olsLine(us: readonly number[], ys: readonly number[]): Line {
  const n = us.length;
  if (n !== ys.length) throw new Error('length mismatch');
  if (n < 3) throw new Error('need at least 3 points');
  const meanU = mean(us);
  const meanY = mean(ys);
  const sxx = sum(us.map((u) => (u - meanU) ** 2));
  const syy = sum(ys.map((y) => (y - meanY) ** 2));
  const sxy = sum(us.map((u, i) => (u - meanU) * (ys[i]! - meanY)));
  if (sxx === 0) throw new Error('zero variance in the explanatory variable');
  if (syy === 0) throw new Error('zero variance in y');
  const a = sxy / sxx;
  return { a, b: meanY - a * meanU, sxx, sxy, syy, r: sxy / Math.sqrt(sxx * syy), meanU, meanY };
}

function build(
  kind: ModelKind,
  pts: readonly Point[],
  line: Line,
  transform: (x: number) => number,
  invU: (u: number) => number,
  slope: (a: number, x: number) => number
): Fit {
  const { a, b } = line;
  const predict = (x: number) => a * transform(x) + b;
  const fitted = pts.map((p) => predict(p.x));
  const residuals = pts.map((p, i) => p.y - fitted[i]!);
  const sse = sum(residuals.map((e) => e * e));
  const n = pts.length;
  return {
    kind, a, b, n, r: line.r,
    r2: 1 - sse / line.syy, sse, sst: line.syy,
    se: Math.sqrt(sse / (n - 2)), rmse: Math.sqrt(sse / n),
    sxx: line.sxx, sxy: line.sxy, syy: line.syy, meanU: line.meanU, meanY: line.meanY,
    predict, derivative: (x) => slope(a, x), inverse: (y) => invU((y - b) / a),
    residuals, fitted
  };
}

export function linearFit(pts: readonly Point[]): Fit {
  const line = olsLine(pts.map((p) => p.x), pts.map((p) => p.y));
  return build('linear', pts, line, (x) => x, (u) => u, (a) => a);
}

export function logFit(pts: readonly Point[]): Fit {
  for (const p of pts) if (!(p.x > 0)) throw new Error(`the log model needs x > 0 (${p.iso3})`);
  const line = olsLine(pts.map((p) => Math.log(p.x)), pts.map((p) => p.y));
  return build('log', pts, line, Math.log, Math.exp, (a, x) => a / x);
}

export function fitBoth(pts: readonly Point[]): { linear: Fit; log: Fit; better: ModelKind } {
  const linear = linearFit(pts);
  const log = logFit(pts);
  return { linear, log, better: log.sse < linear.sse ? 'log' : 'linear' };
}
