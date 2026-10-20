// src/math/gap.ts
import type { Fit, Point } from './regression';
import { olsLine } from './regression';

export interface GapAnalysis {
  low: Point;
  high: Point;
  observedGap: number; // y_high minus y_low, years
  predictedGap: number; // f(x_high) minus f(x_low), years
  percentReproduced: number; // predicted / observed times 100
  remainder: number; // observed minus predicted, years
  remainderPercent: number;
  predictedLow: number;
  predictedHigh: number;
  residualLow: number;
  residualHigh: number;
  identityError: number; // (observed - predicted) - (resHigh - resLow), about 0
  slopeLow: number; // dy/dx, years per dollar
  slopeHigh: number;
  slopeRatio: number;
  per1000Low: number; // tangent approximation, years per $1,000
  per1000High: number;
  exact1000Low: number; // f(x + 1000) - f(x)
  exact1000High: number;
}

export function gapAnalysis(fit: Fit, low: Point, high: Point): GapAnalysis {
  const observedGap = high.y - low.y;
  const predictedLow = fit.predict(low.x);
  const predictedHigh = fit.predict(high.x);
  const predictedGap = predictedHigh - predictedLow;
  const residualLow = low.y - predictedLow;
  const residualHigh = high.y - predictedHigh;
  const slopeLow = fit.derivative(low.x);
  const slopeHigh = fit.derivative(high.x);
  return {
    low, high, observedGap, predictedGap,
    percentReproduced: (predictedGap / observedGap) * 100,
    remainder: observedGap - predictedGap,
    remainderPercent: ((observedGap - predictedGap) / observedGap) * 100,
    predictedLow, predictedHigh, residualLow, residualHigh,
    identityError: observedGap - predictedGap - (residualHigh - residualLow),
    slopeLow, slopeHigh, slopeRatio: slopeLow / slopeHigh,
    per1000Low: slopeLow * 1000, per1000High: slopeHigh * 1000,
    exact1000Low: fit.predict(low.x + 1000) - predictedLow,
    exact1000High: fit.predict(high.x + 1000) - predictedHigh
  };
}

export interface InverseResult {
  targetLife: number;
  requiredX: number; // f inverse of target, dollars
  multipleOfLow: number; // requiredX / low.x
  extrapolated: boolean; // outside the observed range of x
  dataMin: number;
  dataMax: number;
}

export function inverseTarget(fit: Fit, low: Point, targetLife: number, xs: readonly number[]): InverseResult {
  const requiredX = fit.inverse(targetLife);
  const dataMin = Math.min(...xs);
  const dataMax = Math.max(...xs);
  return {
    targetLife, requiredX, multipleOfLow: requiredX / low.x,
    extrapolated: requiredX > dataMax || requiredX < dataMin, dataMin, dataMax
  };
}

/** Comparison method: regression of ln x on y (the x on y line), then x = e^X. */
export function xOnYTarget(pts: readonly Point[], targetLife: number) {
  const line = olsLine(pts.map((p) => p.y), pts.map((p) => Math.log(p.x)));
  return { slope: line.a, intercept: line.b, r: line.r, requiredX: Math.exp(line.a * targetLife + line.b) };
}

/** Change in y when x doubles under y = a ln x + b: a ln 2. */
export const doublingEffect = (a: number) => a * Math.LN2;
