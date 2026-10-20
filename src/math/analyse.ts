// src/math/analyse.ts
// One call that produces every number the interface needs, for a chosen set of countries.
import { fitBoth, type Fit, type ModelKind, type Point } from './regression';
import { gapAnalysis, inverseTarget, xOnYTarget, type GapAnalysis, type InverseResult } from './gap';
import { correlationTest, spearman, summarise, type CorrelationTest, type Summary } from './stats';

export interface Analysis {
  points: Point[];
  linear: Fit;
  log: Fit;
  better: ModelKind;
  xSummary: Summary;
  ySummary: Summary;
  spearman: number;
  logTest: CorrelationTest;
  gap: GapAnalysis | null; // null if Zimbabwe or Singapore is excluded
  inverse: InverseResult | null;
  xOnY: ReturnType<typeof xOnYTarget> | null;
}

export function analyse(all: readonly Point[], excluded: ReadonlySet<string> = new Set()): Analysis {
  const points = all.filter((p) => !excluded.has(p.iso3));
  const { linear, log, better } = fitBoth(points);
  const zwe = points.find((p) => p.iso3 === 'ZWE');
  const sgp = points.find((p) => p.iso3 === 'SGP');
  const fit = better === 'log' ? log : linear;
  const xs = points.map((p) => p.x);
  return {
    points, linear, log, better,
    xSummary: summarise(xs),
    ySummary: summarise(points.map((p) => p.y)),
    spearman: spearman(xs, points.map((p) => p.y)),
    logTest: correlationTest(log.r, points.length),
    gap: zwe && sgp ? gapAnalysis(fit, zwe, sgp) : null,
    inverse: zwe && sgp ? inverseTarget(fit, zwe, sgp.y, xs) : null,
    xOnY: sgp ? xOnYTarget(points, sgp.y) : null
  };
}
