// scripts/verify-stats.ts
// Recompute every statistic shown in the explorer from Appendix A and compare
// it with the number printed on the page. The expected values are the IA's
// published values, held here as fixed anchors. A drift in the data or the
// formulas fails the data:all chain.
//
// Run: npm run data:verify-stats
import { readFileSync } from 'node:fs';
import { analyse } from '../src/math/analyse';
import { doublingEffect } from '../src/math/gap';
import type { Point } from '../src/math/regression';

type Row = Record<string, string>;

function parseCsv(path: string): Point[] {
  const lines = readFileSync(path, 'utf8').trim().split(/\r?\n/);
  const head = lines[0]!.split(',');
  return lines.slice(1).filter(Boolean).map((line) => {
    const cells = line.split(',');
    if (cells.length !== head.length) throw new Error(`Malformed row: ${line}`);
    const r: Row = Object.fromEntries(head.map((h, i) => [h, cells[i]!]));
    return { iso3: r.iso3!, name: r.name!, x: Number(r.gdp_pc_ppp), y: Number(r.life_exp) };
  });
}

const rows = parseCsv('data/sample42.csv');
if (rows.length !== 42) throw new Error(`Expected 42 rows, found ${rows.length}`);
const a = analyse(rows);
const s = analyse(rows.filter((p) => !['NGA', 'TCD'].includes(p.iso3)));

let failures = 0;
let checks = 0;

function near(label: string, actual: number | null | undefined, expected: number, tolerance: number) {
  checks += 1;
  if (actual === null || actual === undefined || !Number.isFinite(actual)) {
    failures += 1;
    console.error(`FAIL  ${label}: missing or not finite (expected ${expected})`);
    return;
  }
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    failures += 1;
    console.error(`FAIL  ${label}: got ${actual}, expected ${expected} (difference ${diff})`);
  } else {
    console.log(`PASS  ${label}: ${actual}`);
  }
}

function truth(label: string, condition: boolean, detail = '') {
  checks += 1;
  if (!condition) {
    failures += 1;
    console.error(`FAIL  ${label}${detail ? `: ${detail}` : ''}`);
  } else {
    console.log(`PASS  ${label}`);
  }
}

// Sample and summaries.
near('n', a.points.length, 42, 0);
near('x mean', a.xSummary.mean, 24987.370714, 0.00001);
near('x median', a.xSummary.median, 13555.23, 0.00001);
near('x sd', a.xSummary.sd, 30185.840590, 0.00001);
near('x min', a.xSummary.min, 1054.73, 0.00001);
near('x max', a.xSummary.max, 120678.34, 0.00001);
near('y mean', a.ySummary.mean, 71.646024, 0.000001);
near('y median', a.ySummary.median, 71.919, 0.000001);
near('y sd', a.ySummary.sd, 8.926185, 0.000001);
near('y min', a.ySummary.min, 52.993, 0.000001);
near('y max', a.ySummary.max, 84.356, 0.000001);
near('Spearman rho', a.spearman, 0.902925, 0.000001);

// Three sums of squares, in the fitting variable.
near('log Sxx', a.log.sxx, 71.463165, 0.000001);
near('log Sxy', a.log.sxy, 423.610692, 0.000001);
near('log Syy', a.log.syy, 3266.748251, 0.000001);
near('linear Sxx', a.linear.sxx, 37358583856.34188, 0.00001);

// Straight line.
near('linear slope', a.linear.a, 0.000220274474, 1e-12);
near('linear intercept', a.linear.b, 66.141944, 0.000001);
near('linear r', a.linear.r, 0.744906, 0.000001);
near('linear r squared', a.linear.r2, 0.554885, 0.000001);
near('linear SSE', a.linear.sse, 1454.078234, 0.000001);
near('linear residual SE', a.linear.se, 6.029258, 0.000001);

// Logarithmic model.
near('log slope', a.log.a, 5.927678825, 0.000000001);
near('log intercept', a.log.b, 16.024564, 0.000001);
near('log r', a.log.r, 0.876734, 0.000001);
near('log r squared', a.log.r2, 0.768662883, 0.000000001);
near('log SSE', a.log.sse, 755.720121, 0.000001);
near('log residual SE', a.log.se, 4.346608, 0.000001);
near('log mean X', a.log.meanU, 9.383346, 0.000001);
near('log mean y', a.log.meanY, 71.646024, 0.000001);

// Correlation test.
near('t statistic', a.logTest.t, 11.528566, 0.000001);
near('degrees of freedom', a.logTest.df, 40, 0);
truth('p value is below 0.001', a.logTest.p < 0.001, String(a.logTest.p));

// Gap and decomposition.
truth('gap analysis exists', Boolean(a.gap));
if (a.gap) {
  near('observed gap', a.gap.observedGap, 22.535, 0.000001);
  near('predicted gap', a.gap.predictedGap, 18.879168, 0.000001);
  near('share reproduced', a.gap.percentReproduced, 83.777093, 0.000001);
  near('remainder', a.gap.remainder, 3.655832, 0.000001);
  near('remainder share', a.gap.remainderPercent, 16.222907, 0.000001);
  near('predicted low', a.gap.predictedLow, 66.504478, 0.000001);
  near('predicted high', a.gap.predictedHigh, 85.383646, 0.000001);
  near('residual low', a.gap.residualLow, -5.444478, 0.000001);
  near('residual high', a.gap.residualHigh, -1.788646, 0.000001);
  near('gap identity error', a.gap.identityError, 0, 1e-12);
  near('slope at Zimbabwe', a.gap.per1000Low, 1.186991, 0.000001);
  near('slope at Singapore', a.gap.per1000High, 0.0491197, 0.0000001);
  near('slope ratio', a.gap.slopeRatio, 24.165295, 0.000001);
  near('exact $1,000 at Zimbabwe', a.gap.exact1000Low, 1.081956, 0.000001);
  near('exact $1,000 at Singapore', a.gap.exact1000High, 0.048917, 0.000001);
  near('doubling effect', doublingEffect(a.log.a), 4.108754, 0.000001);
}

// Inverse and reverse regression.
truth('inverse exists', Boolean(a.inverse));
if (a.inverse) {
  near('inverse income', a.inverse.requiredX, 89244.866191, 0.000001);
  near('inverse multiple of Zimbabwe', a.inverse.multipleOfLow, 17.870883, 0.000001);
  truth('inverse is interpolation', !a.inverse.extrapolated);
}
truth('reverse regression exists', Boolean(a.xOnY));
if (a.xOnY) {
  near('reverse regression slope', a.xOnY.slope, 0.129673504, 0.000000001);
  near('reverse regression intercept', a.xOnY.intercept, 0.092754771, 0.000000001);
  near('reverse regression income', a.xOnY.requiredX, 55983.446629, 0.000001);
}

// Leave-two-out sensitivity.
near('sensitivity log slope', s.log.a, 5.612855184, 0.000000001);
near('sensitivity log intercept', s.log.b, 19.648477414, 0.000000001);
near('sensitivity r', s.log.r, 0.925347, 0.000001);
near('sensitivity r squared', s.log.r2, 0.856267, 0.000001);
truth('sensitivity gap exists', Boolean(s.gap));
if (s.gap) {
  near('sensitivity predicted gap', s.gap.predictedGap, 17.876481, 0.000001);
  near('sensitivity share reproduced', s.gap.percentReproduced, 79.327627, 0.000001);
}
truth('sensitivity inverse exists', Boolean(s.inverse));
if (s.inverse) near('sensitivity inverse income', s.inverse.requiredX, 88687.016170, 0.000001);
near('sensitivity residual SE', s.log.se, 3.097577586, 0.000001);

if (failures) {
  console.error(`\n${failures} of ${checks} statistic checks failed.`);
  process.exit(1);
}
console.log(`\nPASS  ${checks} statistic checks match the values printed on the site.`);
