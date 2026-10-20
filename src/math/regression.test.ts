import { describe, it, expect } from 'vitest';
import { linearFit, logFit, fitBoth, type Point } from './regression';
import { gapAnalysis, inverseTarget } from './gap';

const toy: Point[] = [[1, 2], [2, 4], [3, 5], [4, 4], [5, 5]].map(([x, y], i) => ({
  iso3: `T${i}`, name: `T${i}`, x: x!, y: y!
}));

describe('toy dataset worked by hand (docs/HAND_CHECK.md)', () => {
  const f = linearFit(toy);
  it('has a = 0.6 and b = 2.2', () => {
    expect(f.a).toBeCloseTo(0.6, 12);
    expect(f.b).toBeCloseTo(2.2, 12);
  });
  it('has r = 6 / sqrt(60)', () => expect(f.r).toBeCloseTo(6 / Math.sqrt(60), 12));
  it('has residuals -0.8, 0.6, 1.0, -0.6, -0.2 that sum to 0', () => {
    const want = [-0.8, 0.6, 1.0, -0.6, -0.2];
    f.residuals.forEach((e, i) => expect(e).toBeCloseTo(want[i]!, 12));
    expect(f.residuals.reduce((s, e) => s + e, 0)).toBeCloseTo(0, 12);
  });
  it('has r squared = 0.6 and SSE = 2.4', () => {
    expect(f.r2).toBeCloseTo(0.6, 12);
    expect(f.r2).toBeCloseTo(f.r * f.r, 12);
    expect(f.sse).toBeCloseTo(2.4, 12);
  });
});

describe('logarithmic model on exact data y = 3 ln x + 1', () => {
  const xs = [100, 500, 2000, 8000, 30000, 120000];
  const pts: Point[] = xs.map((x, i) => ({ iso3: `L${i}`, name: `L${i}`, x, y: 3 * Math.log(x) + 1 }));
  const f = logFit(pts);
  it('recovers a = 3, b = 1, r = 1', () => {
    expect(f.a).toBeCloseTo(3, 10);
    expect(f.b).toBeCloseTo(1, 9);
    expect(f.r).toBeCloseTo(1, 12);
  });
  it('inverse undoes predict', () => {
    for (const x of xs) expect(f.inverse(f.predict(x))).toBeCloseTo(x, 6);
  });
  it('derivative is a / x', () => expect(f.derivative(4994)).toBeCloseTo(3 / 4994, 14));
  it('rejects x <= 0', () => {
    expect(() => logFit([{ iso3: 'Z', name: 'Z', x: 0, y: 1 }, ...pts])).toThrow();
  });
});

describe('identities that hold for any data', () => {
  const messy: Point[] = [
    ['ZWE', 4994, 61.1], ['SGP', 120678, 83.6], ['A', 2300, 58.2], ['B', 9100, 71.4],
    ['C', 15500, 74.9], ['D', 31000, 78.2], ['E', 52000, 81.0], ['F', 7000, 66.3], ['G', 21000, 76.1]
  ].map(([iso3, x, y]) => ({ iso3: iso3 as string, name: iso3 as string, x: x as number, y: y as number }));
  const { linear, log } = fitBoth(messy);
  const zwe = messy[0]!;
  const sgp = messy[1]!;

  it('residuals sum to zero in both models', () => {
    expect(linear.residuals.reduce((s, e) => s + e, 0)).toBeCloseTo(0, 9);
    expect(log.residuals.reduce((s, e) => s + e, 0)).toBeCloseTo(0, 9);
  });
  it('R squared equals r squared', () => {
    expect(linear.r2).toBeCloseTo(linear.r ** 2, 12);
    expect(log.r2).toBeCloseTo(log.r ** 2, 12);
  });
  it('slope ratio under the log model equals the GDP ratio', () => {
    expect(gapAnalysis(log, zwe, sgp).slopeRatio).toBeCloseTo(sgp.x / zwe.x, 10);
  });
  it('observed gap minus predicted gap equals the difference of residuals', () => {
    expect(Math.abs(gapAnalysis(log, zwe, sgp).identityError)).toBeLessThan(1e-9);
    expect(Math.abs(gapAnalysis(linear, zwe, sgp).identityError)).toBeLessThan(1e-9);
  });
  it('log predicted gap equals a ln(x_high / x_low)', () => {
    expect(gapAnalysis(log, zwe, sgp).predictedGap).toBeCloseTo(log.a * Math.log(sgp.x / zwe.x), 10);
  });
  it('predict(inverse(target)) returns the target', () => {
    const inv = inverseTarget(log, zwe, sgp.y, messy.map((p) => p.x));
    expect(log.predict(inv.requiredX)).toBeCloseTo(sgp.y, 8);
  });
});

describe('numerical stability', () => {
  it('handles large x values', () => {
    const base = 1e6;
    const pts: Point[] = Array.from({ length: 50 }, (_, i) => ({
      iso3: `N${i}`, name: `N${i}`, x: base + i, y: 2 * (base + i) + 7
    }));
    const f = linearFit(pts);
    expect(f.a).toBeCloseTo(2, 8);
    expect(f.b).toBeCloseTo(7, 4);
  });
});
