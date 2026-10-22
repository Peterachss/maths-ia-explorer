// scripts/verify-data.ts
// Re-download every 2019 value from the World Bank API and compare it with the
// appendix at the precision printed in the CSV. Fails the build on any drift.
//
// Run: npm run data:verify-live
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type Row = Record<string, string>;

const SAMPLE = resolve('data/sample42.csv');
const PUBLIC_COPY = resolve('public/data/sample42.csv');
const GDP = 'NY.GDP.PCAP.PP.KD';
const LIFE = 'SP.DYN.LE00.IN';
const YEAR = '2019';
const GDP_TOLERANCE = 0.005; // the CSV stores dollars to 2 decimals
const LIFE_TOLERANCE = 0.0005; // the CSV stores years to 3 decimals

function parseCsv(text: string): Row[] {
  const lines = text.trim().split(/\r?\n/);
  const head = lines[0]!.split(',');
  return lines.slice(1).filter(Boolean).map((line) => {
    const cells = line.split(',');
    if (cells.length !== head.length) throw new Error(`Malformed row: ${line}`);
    return Object.fromEntries(head.map((h, i) => [h, cells[i]!]));
  });
}

async function json(url: string, attempts = 3): Promise<unknown> {
  let last: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      last = error;
      if (i < attempts) await new Promise((r) => setTimeout(r, 600 * i));
    }
  }
  throw last;
}

interface Observation {
  countryiso3code: string;
  date: string;
  value: number | null;
}

async function download(isoCodes: string[], indicator: string): Promise<Map<string, number>> {
  const codes = isoCodes.join(';');
  const url = `https://api.worldbank.org/v2/country/${codes}/indicator/${indicator}?date=${YEAR}&format=json&per_page=500`;
  const payload = await json(url);
  if (!Array.isArray(payload) || payload.length < 2 || !Array.isArray(payload[1])) {
    throw new Error(`Unexpected API response for ${indicator}`);
  }
  const rows = payload[1] as Observation[];
  const out = new Map<string, number>();
  for (const row of rows) {
    if (row.date !== YEAR || row.value === null) continue;
    out.set(row.countryiso3code, row.value);
  }
  return out;
}

const text = await readFile(SAMPLE, 'utf8');
const publicText = await readFile(PUBLIC_COPY, 'utf8');
if (text !== publicText) {
  console.error('FAIL  public/data/sample42.csv is not byte-identical to data/sample42.csv');
  process.exit(1);
}

const rows = parseCsv(text);
if (rows.length !== 42) {
  console.error(`FAIL  expected 42 rows, found ${rows.length}`);
  process.exit(1);
}

const isoCodes = rows.map((r) => r.iso3);
const [gdp, life] = await Promise.all([
  download(isoCodes, GDP),
  download(isoCodes, LIFE)
]);

let failures = 0;
let maxGdpAbs = 0;
let maxLifeAbs = 0;
const fail = (message: string) => { failures += 1; console.error(`FAIL  ${message}`); };

for (const r of rows) {
  const expectedGdp = Number(r.gdp_pc_ppp);
  const expectedLife = Number(r.life_exp);
  const liveGdp = gdp.get(r.iso3);
  const liveLife = life.get(r.iso3);
  if (liveGdp === undefined) fail(`${r.iso3}: GDP missing from the 2019 API response`);
  if (liveLife === undefined) fail(`${r.iso3}: life expectancy missing from the 2019 API response`);
  if (liveGdp !== undefined) {
    const diff = Math.abs(liveGdp - expectedGdp);
    maxGdpAbs = Math.max(maxGdpAbs, diff);
    if (diff > GDP_TOLERANCE) fail(`${r.iso3}: GDP ${expectedGdp} vs API ${liveGdp} (difference ${diff.toFixed(4)})`);
  }
  if (liveLife !== undefined) {
    const diff = Math.abs(liveLife - expectedLife);
    maxLifeAbs = Math.max(maxLifeAbs, diff);
    if (diff > LIFE_TOLERANCE) fail(`${r.iso3}: life ${expectedLife} vs API ${liveLife} (difference ${diff.toFixed(6)})`);
  }
  const expectedGdpUrl = `https://api.worldbank.org/v2/country/${r.iso3}/indicator/${GDP}?date=${YEAR}&format=json`;
  const expectedLifeUrl = `https://api.worldbank.org/v2/country/${r.iso3}/indicator/${LIFE}?date=${YEAR}&format=json`;
  if (r.gdp_source_url !== expectedGdpUrl) fail(`${r.iso3}: GDP source URL is not country/year specific`);
  if (r.life_source_url !== expectedLifeUrl) fail(`${r.iso3}: life source URL is not country/year specific`);
  if (r.source_url !== expectedLifeUrl) fail(`${r.iso3}: source_url does not point to the life-expectancy row source`);
}

if (failures) {
  console.error(`\n${failures} data check${failures === 1 ? '' : 's'} failed.`);
  process.exit(1);
}
console.log(`PASS  42 rows, 84 values re-downloaded from the World Bank API (${YEAR}).`);
console.log(`PASS  GDP max absolute difference ${maxGdpAbs.toFixed(4)} dollars; life max absolute difference ${maxLifeAbs.toFixed(6)} years.`);
console.log('PASS  Every row carries country- and year-specific API URLs.');
console.log('PASS  public/data/sample42.csv is byte-identical to data/sample42.csv.');
