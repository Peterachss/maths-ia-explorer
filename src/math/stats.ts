// src/math/stats.ts
import { mean, sum, olsLine } from './regression';

export interface Summary {
  n: number;
  mean: number;
  sd: number; // sample standard deviation (divide by n - 1)
  median: number;
  min: number;
  max: number;
}

export function summarise(values: readonly number[]): Summary {
  const n = values.length;
  const m = mean(values);
  const sd = Math.sqrt(sum(values.map((v) => (v - m) ** 2)) / (n - 1));
  const s = [...values].sort((p, q) => p - q);
  const median = n % 2 ? s[(n - 1) / 2]! : (s[n / 2 - 1]! + s[n / 2]!) / 2;
  return { n, mean: m, sd, median, min: s[0]!, max: s[n - 1]! };
}

/** Average ranks (ties share the mean rank). */
export function ranks(values: readonly number[]): number[] {
  const idx = values.map((_, i) => i).sort((i, j) => values[i]! - values[j]!);
  const out = new Array<number>(values.length).fill(0);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && values[idx[j + 1]!] === values[idx[i]!]) j++;
    const r = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) out[idx[k]!] = r;
    i = j + 1;
  }
  return out;
}

/** Spearman rank correlation: Pearson r of the ranks. */
export function spearman(xs: readonly number[], ys: readonly number[]): number {
  return olsLine(ranks(xs), ranks(ys)).r;
}

// ---- Student t distribution (for the correlation significance test) ----

function lnGamma(z: number): number {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = z;
  const tmp = z + 5.5 - (z + 0.5) * Math.log(z + 5.5);
  let ser = 1.000000000190015;
  for (const cj of c) ser += cj / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / z);
}

/** Continued fraction for the incomplete beta function (modified Lentz). */
function betaCf(a: number, b: number, x: number): number {
  const tiny = 1e-300;
  let c = 1;
  let d = 1 - ((a + b) * x) / (a + 1);
  if (Math.abs(d) < tiny) d = tiny;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((a + m2 - 1) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c; if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d; h *= d * c;
    aa = (-(a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1));
    d = 1 + aa * d; if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c; if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return h;
}

/** Regularised incomplete beta function I_x(a, b). */
export function incBeta(a: number, b: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2)
    ? (bt * betaCf(a, b, x)) / a
    : 1 - (bt * betaCf(b, a, 1 - x)) / b;
}

/** Two sided p-value for a t statistic with df degrees of freedom. */
export function tTwoSidedP(t: number, df: number): number {
  return incBeta(df / 2, 0.5, df / (df + t * t));
}

export interface CorrelationTest {
  r: number;
  n: number;
  df: number;
  t: number; // r sqrt(n - 2) / sqrt(1 - r^2)
  p: number;
}

export function correlationTest(r: number, n: number): CorrelationTest {
  const df = n - 2;
  const t = (r * Math.sqrt(df)) / Math.sqrt(1 - r * r);
  return { r, n, df, t, p: tTwoSidedP(t, df) };
}
