import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { logFit, type Point } from './regression';
import { makeBowl } from './bowl';

const lines = readFileSync('data/sample42.csv', 'utf8').trim().split(/\r?\n/);
const head = lines[0]!.split(',');
const pts: Point[] = lines.slice(1).map((l) => {
  const f = l.split(',');
  return { iso3: f[0]!, name: f[1]!, x: Number(f[head.indexOf('gdp_pc_ppp')]), y: Number(f[head.indexOf('life_exp')]) };
});

describe('the least squares bowl', () => {
  const fit = logFit(pts);
  const bowl = makeBowl(pts, 'log', fit.a, fit.meanY);
  it('has its minimum at the fitted line, equal to SSE', () => {
    expect(bowl.sse0).toBeCloseTo(fit.sse, 8);
    expect(fit.meanY).toBeCloseTo(fit.a * fit.meanU + fit.b, 10); // the line passes through the means
  });
  it('rises as Sxx times the squared change in slope', () => {
    const d = 0.7;
    expect(bowl.sse(fit.a + d, fit.meanY) - bowl.sse0).toBeCloseTo(fit.sxx * d * d, 7);
  });
  it('rises as n times the squared change in level', () => {
    const d = 1.3;
    expect(bowl.sse(fit.a, fit.meanY + d) - bowl.sse0).toBeCloseTo(pts.length * d * d, 7);
  });
  it('is higher in every direction (a true minimum)', () => {
    for (const [da, dc] of [[0.3, 0], [-0.3, 0], [0, 0.5], [0, -0.5], [0.2, 0.2], [-0.2, 0.2]] as const) {
      expect(bowl.sse(fit.a + da, fit.meanY + dc)).toBeGreaterThan(bowl.sse0);
    }
  });
});
