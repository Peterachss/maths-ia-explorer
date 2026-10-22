// scripts/verify_sources.mjs
// Local source and data-integrity check. Runs without the network.
// It answers one question: can every published row be traced to the appendix
// and does the saved live pull still agree with it at the printed precision?
//
// Usage: node scripts/verify_sources.mjs

import { readFileSync } from 'node:fs';

const SAMPLE = 'data/sample42.csv';
const LIVE = 'data/worldbank_2019_pull.csv';
const META = 'data/sample42.meta.json';
const CROSSCHECK = 'docs/crosscheck.json';

const GDP = 'NY.GDP.PCAP.PP.KD';
const LIFE = 'SP.DYN.LE00.IN';
const INCOME = new Set(['Low', 'Lower middle', 'Upper middle', 'High']);

let failures = 0;
const pass = (message) => console.log(`PASS  ${message}`);
const fail = (message) => {
  failures += 1;
  console.log(`FAIL  ${message}`);
};

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const head = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const cells = line.split(',');
    if (cells.length !== head.length) throw new Error(`Row has ${cells.length} cells, expected ${head.length}: ${line}`);
    return Object.fromEntries(head.map((h, i) => [h, cells[i]]));
  });
}

function close(actual, expected, tolerance) {
  return Math.abs(actual - expected) <= tolerance;
}

const rows = parseCsv(readFileSync(SAMPLE, 'utf8'));
const live = parseCsv(readFileSync(LIVE, 'utf8'));
const meta = JSON.parse(readFileSync(META, 'utf8'));
const cross = JSON.parse(readFileSync(CROSSCHECK, 'utf8'));

// --- The appendix ----------------------------------------------------------
if (rows.length === 42) pass('Appendix A has 42 rows');
else fail(`Appendix A has ${rows.length} rows, expected 42`);

const iso = rows.map((r) => r.iso3);
if (new Set(iso).size === 42) pass('42 unique ISO3 codes');
else fail(`ISO3 codes are not unique: ${iso.filter((x, i) => iso.indexOf(x) !== i).join(', ')}`);

const required = ['iso3', 'name', 'region', 'income_group', 'lat', 'lon', 'gdp_pc_ppp', 'life_exp', 'source_url', 'indicator_code', 'retrieved_on', 'vintage_note', 'status'];
const missingFields = rows.flatMap((r) => required.filter((k) => !(k in r)).map((k) => `${r.iso3}:${k}`));
if (!missingFields.length) pass('Every row has all required columns');
else fail(`Missing fields: ${missingFields.join(', ')}`);

const badRows = [];
let minLife = Infinity;
let maxLife = -Infinity;
let minGdp = Infinity;
let maxGdp = -Infinity;
for (const r of rows) {
  const gdp = Number(r.gdp_pc_ppp);
  const life = Number(r.life_exp);
  const lat = Number(r.lat);
  const lon = Number(r.lon);
  minLife = Math.min(minLife, life);
  maxLife = Math.max(maxLife, life);
  minGdp = Math.min(minGdp, gdp);
  maxGdp = Math.max(maxGdp, gdp);
  if (!/^[A-Z]{3}$/.test(r.iso3)) badRows.push(`${r.iso3}: ISO3`);
  if (!r.name || !r.region || !r.vintage_note) badRows.push(`${r.iso3}: empty text`);
  if (!INCOME.has(r.income_group)) badRows.push(`${r.iso3}: income group ${r.income_group}`);
  if (!Number.isFinite(gdp) || gdp < 500 || gdp > 250000) badRows.push(`${r.iso3}: GDP ${r.gdp_pc_ppp}`);
  if (!Number.isFinite(life) || life < 40 || life > 90) badRows.push(`${r.iso3}: life ${r.life_exp}`);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) badRows.push(`${r.iso3}: latitude ${r.lat}`);
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) badRows.push(`${r.iso3}: longitude ${r.lon}`);
  if (!r.indicator_code.includes(GDP) || !r.indicator_code.includes(LIFE)) badRows.push(`${r.iso3}: indicator code ${r.indicator_code}`);
  const apiUrl = /^https:\/\/api\.worldbank\.org\/v2\/country\/[A-Z]{3}\/indicator\/(NY\.GDP\.PCAP\.PP\.KD|SP\.DYN\.LE00\.IN)\?date=2019&format=json$/;
  if (!apiUrl.test(r.source_url)) badRows.push(`${r.iso3}: source URL`);
  if (!r.gdp_source_url?.includes(GDP) || !r.life_source_url?.includes(LIFE)) badRows.push(`${r.iso3}: indicator URLs`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.retrieved_on)) badRows.push(`${r.iso3}: retrieved date`);
  if (r.status !== 'ia_appendix_a') badRows.push(`${r.iso3}: status ${r.status}`);
}
if (!badRows.length) pass('Every row passes range, type, code and provenance checks');
else fail(`Row problems: ${badRows.join('; ')}`);

if (rows.every((r) => INCOME.has(r.income_group)) && new Set(rows.map((r) => r.income_group)).size === 4) {
  pass('All four income groups are present and labelled correctly');
} else {
  fail('Income groups are missing or outside the four published labels');
}
pass(`Observed ranges: life ${minLife.toFixed(1)} to ${maxLife.toFixed(1)} years; GDP $${Math.round(minGdp).toLocaleString('en-GB')} to $${Math.round(maxGdp).toLocaleString('en-GB')}`);

// --- Dataset metadata ------------------------------------------------------
if (meta.rows === 42 && meta.year === 2019) pass('Metadata says 42 rows for 2019');
else fail(`Metadata mismatch: rows ${meta.rows}, year ${meta.year}`);
if (meta.indicators?.gdp_pc_ppp === GDP && meta.indicators?.life_exp === LIFE) pass('Metadata indicator codes match the appendix and the interface');
else fail('Metadata indicator codes are wrong');
if (/^\d{4}-\d{2}-\d{2}$/.test(meta.retrieved_on) && /^\d{4}-\d{2}-\d{2}$/.test(meta.live_pull_on)) pass('Metadata carries ISO retrieval and live-pull dates');
else fail('Metadata dates are not ISO dates');

// --- The saved live pull ---------------------------------------------------
if (live.length === 42) pass('Saved World Bank pull has 42 rows');
else fail(`Saved World Bank pull has ${live.length} rows, expected 42`);

const liveByIso = new Map(live.map((r) => [r.iso3, r]));
let missingLive = 0;
let maxGdpDiff = 0;
let maxLifeDiff = 0;
let gdpDiffRow = '';
let lifeDiffRow = '';
for (const r of rows) {
  const l = liveByIso.get(r.iso3);
  if (!l || l.gdp_pc_ppp === '' || l.life_exp === '') {
    missingLive += 1;
    continue;
  }
  const gdpDiff = Math.abs(Number(l.gdp_pc_ppp) - Number(r.gdp_pc_ppp)) / Number(r.gdp_pc_ppp);
  const lifeDiff = Math.abs(Number(l.life_exp) - Number(r.life_exp));
  if (gdpDiff > maxGdpDiff) gdpDiffRow = r.iso3;
  if (lifeDiff > maxLifeDiff) lifeDiffRow = r.iso3;
  maxGdpDiff = Math.max(maxGdpDiff, gdpDiff);
  maxLifeDiff = Math.max(maxLifeDiff, lifeDiff);
}
if (missingLive === 0) pass('Every appendix row has both live values');
else fail(`${missingLive} appendix rows are missing from the live pull`);

const gdpTolerance = 1e-4; // 0.01 percent, stricter than the 0.00 percent display
const lifeTolerance = 1e-3; // 0.001 years, stricter than the 0.000 display
if (maxGdpDiff <= gdpTolerance) pass(`GDP max relative difference ${(maxGdpDiff * 100).toFixed(4)} percent (row ${gdpDiffRow})`);
else fail(`GDP difference too large: ${(maxGdpDiff * 100).toFixed(4)} percent (row ${gdpDiffRow})`);
if (maxLifeDiff <= lifeTolerance) pass(`Life expectancy max absolute difference ${maxLifeDiff.toFixed(6)} years (row ${lifeDiffRow})`);
else fail(`Life expectancy difference too large: ${maxLifeDiff.toFixed(6)} years (row ${lifeDiffRow})`);

// --- The independent recomputation ----------------------------------------
if (cross.all?.n === 42 && cross.without_nga_tcd?.n === 40) pass('Cross-check covers 42 countries and the 40-country sensitivity fit');
else fail(`Cross-check sizes are wrong: ${cross.all?.n} and ${cross.without_nga_tcd?.n}`);

const crossChecks = [
  ['log r squared', cross.all?.log?.r2, 0.7687, 0.0005],
  ['linear r squared', cross.all?.linear?.r2, 0.5549, 0.0005],
  ['observed gap', cross.all?.gap?.observed, 22.535, 0.001],
  ['share reproduced', cross.all?.gap?.percent, 83.78, 0.05],
  ['sensitivity share', cross.without_nga_tcd?.gap?.percent, 79.33, 0.05]
];
for (const [name, actual, expected, tolerance] of crossChecks) {
  if (typeof actual === 'number' && close(actual, expected, tolerance)) pass(`Cross-check ${name}: ${actual}`);
  else fail(`Cross-check ${name}: ${actual}, expected ${expected} plus or minus ${tolerance}`);
}

console.log('');
if (failures) {
  console.log(`${failures} check${failures === 1 ? '' : 's'} failed.`);
  process.exit(1);
}
console.log('All source and data checks pass.');
