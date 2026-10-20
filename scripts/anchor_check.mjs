// Check the four anchors the written IA prints, straight from data/sample42.csv,
// then recompute the model gap and the two predictions. Exits 1 on failure.
// Usage: node scripts/anchor_check.mjs

import { readFile } from 'node:fs/promises';

const text = await readFile('data/sample42.csv', 'utf8');
const lines = text.trim().split(/\r?\n/);
const head = lines[0].split(',');
const rows = lines.slice(1).map((line) => {
  const cells = line.split(',');
  return Object.fromEntries(head.map((h, i) => [h, cells[i]]));
});

const checks = [];
function check(name, actual, expected, tol) {
  const pass = Math.abs(actual - expected) <= tol;
  checks.push({ name, actual, expected, tol, pass });
}

const byIso = Object.fromEntries(rows.map((r) => [r.iso3, r]));

check('n', rows.length, 42, 0);
check('Singapore life expectancy', Number(byIso.SGP.life_exp), 83.6, 0.05);
check('Singapore GDP per capita', Number(byIso.SGP.gdp_pc_ppp), 120678, 0.5);
check('Zimbabwe life expectancy', Number(byIso.ZWE.life_exp), 61.1, 0.05);
check('Zimbabwe GDP per capita', Number(byIso.ZWE.gdp_pc_ppp), 4994, 0.5);

const gap = Number(byIso.SGP.life_exp) - Number(byIso.ZWE.life_exp);
check('observed gap Singapore minus Zimbabwe', gap, 22.5, 0.05);

const pts = rows.map((r) => ({ x: Number(r.gdp_pc_ppp), y: Number(r.life_exp) }));
const n = pts.length;
const sum = (f) => pts.reduce((s, p) => s + f(p), 0);
const u = pts.map((p) => Math.log(p.x));
const ubar = u.reduce((a, b) => a + b, 0) / n;
const ybar = pts.reduce((a, p) => a + p.y, 0) / n;
const sxx = u.reduce((s, v) => s + (v - ubar) ** 2, 0);
const sxy = pts.reduce((s, p, i) => s + (u[i] - ubar) * (p.y - ybar), 0);
const a = sxy / sxx;
const b = ybar - a * ubar;
const pred = (x) => a * Math.log(x) + b;
check('log slope a', a, 5.92765, 0.0005);
check('log intercept b', b, 16.02477, 0.005);
check('predicted Singapore', pred(Number(byIso.SGP.gdp_pc_ppp)), 85.38, 0.02);
check('predicted Zimbabwe', pred(Number(byIso.ZWE.gdp_pc_ppp)), 66.50, 0.02);
check('model gap', pred(Number(byIso.SGP.gdp_pc_ppp)) - pred(Number(byIso.ZWE.gdp_pc_ppp)), 18.88, 0.02);

let failed = 0;
for (const c of checks) {
  if (!c.pass) failed++;
  console.log(`${c.pass ? 'PASS' : 'FAIL'}  ${c.name}: ${typeof c.actual === 'number' ? c.actual.toFixed(4) : c.actual} (expected ${c.expected} +/- ${c.tol})`);
}
console.log(`\n${checks.length - failed}/${checks.length} anchors pass.`);
process.exit(failed ? 1 : 0);
