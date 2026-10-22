// Compares recomputed results with the values reported in the student's IA (Part 17 tolerances).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { analyse, type Point, doublingEffect } from './index';

function load(): Point[] {
  const lines = readFileSync('data/sample42.csv', 'utf8').trim().split(/\r?\n/);
  const head = lines[0]!.split(',');
  const ix = (k: string) => head.indexOf(k);
  return lines.slice(1).map((l) => {
    const f = l.split(',');
    return { iso3: f[ix('iso3')]!, name: f[ix('name')]!, x: Number(f[ix('gdp_pc_ppp')]), y: Number(f[ix('life_exp')]) };
  });
}

const all = load();
const A = analyse(all);
const full = A.log;
const gap = A.gap!;
const inv = A.inverse!;

describe('dataset structure', () => {
  it('has 42 distinct countries', () => {
    expect(all.length).toBe(42);
    expect(new Set(all.map((p) => p.iso3)).size).toBe(42);
  });
});

describe('IA section 5: first look', () => {
  it('matches the summary table', () => {
    expect(A.xSummary.mean).toBeCloseTo(24987, -1);
    expect(A.xSummary.sd).toBeCloseTo(30186, -1);
    expect(A.xSummary.median).toBeCloseTo(13555, 0);
    expect(A.ySummary.mean).toBeCloseTo(71.6, 1);
    expect(A.ySummary.sd).toBeCloseTo(8.93, 2);
    expect(A.ySummary.median).toBeCloseTo(71.9, 1);
    expect(A.spearman).toBeCloseTo(0.903, 3);
  });
});

describe('IA section 6: linear model', () => {
  it('matches y = 0.000220x + 66.14', () => {
    expect(A.linear.a).toBeCloseTo(0.00022, 6);
    expect(A.linear.b).toBeCloseTo(66.14, 2);
    expect(A.linear.r).toBeCloseTo(0.745, 3);
    expect(A.linear.r2).toBeCloseTo(0.555, 3);
    expect(A.linear.se).toBeCloseTo(6.03, 2);
    expect(A.linear.sse).toBeCloseTo(1454.1, 1);
  });
});

describe('IA section 7: logarithmic model', () => {
  it('matches the IA coefficients a = 5.92765 and b = 16.02477', () => {
    expect(full.a).toBeCloseTo(5.92765, 4);
    expect(full.b).toBeCloseTo(16.02477, 3);
    expect(full.r).toBeCloseTo(0.877, 3);
    expect(full.r2).toBeCloseTo(0.769, 3);
    expect(full.se).toBeCloseTo(4.35, 2);
    expect(full.sse).toBeCloseTo(755.7, 1);
  });
  it('matches the hand check sums', () => {
    expect(full.meanU).toBeCloseTo(9.3833, 4);
    expect(full.meanY).toBeCloseTo(71.646, 3);
    expect(full.sxx).toBeCloseTo(71.463, 3);
    expect(Math.abs(full.syy - 3266.73)).toBeLessThan(0.05);
    expect(full.sxy).toBeCloseTo(423.609, 2);
  });
  it('the intercept rounds to 16.02', () => {
    expect(Number(full.b.toFixed(2))).toBe(16.02);
  });
  it('matches the significance test', () => {
    expect(A.logTest.t).toBeCloseTo(11.5, 1);
    expect(A.logTest.p).toBeLessThan(1e-12);
    expect(A.logTest.p / 2.7e-14).toBeGreaterThan(0.5);
    expect(A.logTest.p / 2.7e-14).toBeLessThan(2);
  });
  it('doubling GDP adds about 4.11 years', () => {
    expect(doublingEffect(full.a)).toBeCloseTo(4.11, 2);
  });
});

describe('IA sections 8 and 9: the gap', () => {
  it('log model predictions and residuals for Zimbabwe and Singapore', () => {
    expect(gap.predictedLow).toBeCloseTo(66.504, 2);
    expect(gap.predictedHigh).toBeCloseTo(85.384, 2);
    expect(gap.residualLow).toBeCloseTo(-5.44, 2);
    expect(gap.residualHigh).toBeCloseTo(-1.79, 2);
  });
  it('83.8 percent of the observed 22.54 year gap', () => {
    expect(gap.observedGap.toFixed(2)).toBe('22.54');
    expect(gap.predictedGap).toBeCloseTo(18.88, 2);
    expect(gap.percentReproduced).toBeCloseTo(83.8, 1);
    expect(gap.remainder).toBeCloseTo(3.66, 2);
    expect(gap.remainderPercent).toBeCloseTo(16.2, 1);
  });
  it('linear model overshoots: 92.7 years for Singapore, 113.1 percent', () => {
    const lin = analyse(all).linear;
    const sg = all.find((p) => p.iso3 === 'SGP')!;
    const zw = all.find((p) => p.iso3 === 'ZWE')!;
    expect(lin.predict(sg.x)).toBeCloseTo(92.7, 1);
    const pg = lin.predict(sg.x) - lin.predict(zw.x);
    expect(pg).toBeCloseTo(25.48, 2);
    expect((pg / (sg.y - zw.y)) * 100).toBeCloseTo(113.1, 1);
  });
});

describe('IA section 10: rate of change', () => {
  it('derivative values and ratio', () => {
    expect(gap.per1000Low).toBeCloseTo(1.19, 2);
    expect(gap.per1000High).toBeCloseTo(0.049, 3);
    expect(gap.slopeRatio).toBeCloseTo(24.2, 1);
    expect(gap.exact1000Low).toBeCloseTo(1.082, 3);
    expect(gap.exact1000High).toBeCloseTo(0.0489, 4);
  });
});

describe('IA section 11: the inverse', () => {
  it('$89,248 using the unrounded 83.5951', () => {
    expect(inv.targetLife).toBeCloseTo(83.5951, 4);
    expect(Math.round(inv.requiredX)).toBe(89248);
    expect(inv.multipleOfLow).toBeCloseTo(17.9, 1);
    expect(inv.extrapolated).toBe(false);
  });
  it('using exactly 83.6 gives a slightly larger value (documented difference)', () => {
    expect(full.inverse(83.6)).toBeGreaterThan(inv.requiredX);
  });
  it('the x on y line gives a very different answer (comparison only)', () => {
    expect(A.xOnY!.requiredX).toBeGreaterThan(50000);
    expect(A.xOnY!.requiredX).toBeLessThan(60000);
  });
});

describe('IA section 12: sensitivity', () => {
  const S = analyse(all, new Set(['NGA', 'TCD']));
  it('matches the refit without Nigeria and Chad', () => {
    expect(S.log.a).toBeCloseTo(5.61, 2);
    expect(S.log.r).toBeCloseTo(0.925, 3);
    expect(S.log.se).toBeCloseTo(3.10, 2);
    expect(S.gap!.percentReproduced).toBeCloseTo(79.3, 1);
    expect(Math.round(S.inverse!.requiredX)).toBe(88690);
  });
});

describe('IA section 13: Vietnam', () => {
  const v = all.find((p) => p.iso3 === 'VNM')!;
  it('predicted 71.5, residual +2.7, 0.51 years per $1,000', () => {
    expect(full.predict(v.x)).toBeCloseTo(71.5, 1);
    expect(v.y - full.predict(v.x)).toBeCloseTo(2.7, 1);
    expect(full.derivative(v.x) * 1000).toBeCloseTo(0.51, 2);
    expect(inv.requiredX / v.x).toBeCloseTo(7.7, 1);
  });
});
