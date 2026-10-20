import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { analyse, type Point } from './index';

function load(): Point[] {
  const lines = readFileSync('data/sample42.csv', 'utf8').trim().split(/\r?\n/);
  const head = lines[0]!.split(',');
  const ix = (k: string) => head.indexOf(k);
  return lines.slice(1).map((l) => {
    const f = l.split(',');
    return { iso3: f[ix('iso3')]!, name: f[ix('name')]!, x: Number(f[ix('gdp_pc_ppp')]), y: Number(f[ix('life_exp')]) };
  });
}

describe('TypeScript engine agrees with the independent Python implementation', () => {
  it('has a crosscheck file (run npm run data:cross first)', () => {
    expect(existsSync('docs/crosscheck.json')).toBe(true);
  });
  const py = JSON.parse(readFileSync('docs/crosscheck.json', 'utf8'));
  const all = load();
  for (const [label, excl] of [['all', new Set<string>()], ['without_nga_tcd', new Set(['NGA', 'TCD'])]] as const) {
    it(`matches to 9 decimal places: ${label}`, () => {
      const A = analyse(all, excl);
      const P = py[label];
      expect(A.log.a).toBeCloseTo(P.log.a, 9);
      expect(A.log.b).toBeCloseTo(P.log.b, 9);
      expect(A.log.r).toBeCloseTo(P.log.r, 9);
      expect(A.log.r2).toBeCloseTo(P.log.r2, 9);
      expect(A.log.sse).toBeCloseTo(P.log.sse, 7);
      expect(A.linear.a).toBeCloseTo(P.linear.a, 12);
      expect(A.linear.sse).toBeCloseTo(P.linear.sse, 7);
      expect(A.spearman).toBeCloseTo(P.spearman, 9);
      expect(A.gap!.percentReproduced).toBeCloseTo(P.gap.percent, 8);
      expect(A.gap!.per1000Low).toBeCloseTo(P.gap.slope_zwe_per_1000, 9);
      expect(A.inverse!.requiredX).toBeCloseTo(P.gap.inverse_for_sgp_life, 4);
      expect(A.xOnY!.requiredX).toBeCloseTo(P.x_on_y.x_at_sgp_life, 4);
      A.log.residuals.forEach((e, i) => expect(e).toBeCloseTo(P.residuals_log[i], 9));
    });
  }
});
