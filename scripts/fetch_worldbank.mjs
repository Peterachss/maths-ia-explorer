// Pull the two World Bank indicators for the 42 countries in the IA sample.
// Writes data/worldbank_2019_pull.csv. This is a verification pull: the IA's
// Appendix A values stay authoritative for the app, and anchor_check.mjs
// records how far the live data has moved since the IA was written.
//
// Usage: node scripts/fetch_worldbank.mjs 2019

import { readFile, writeFile } from 'node:fs/promises';

const year = process.argv[2] ?? '2019';
const BASE = 'https://api.worldbank.org/v2';

const INDICATORS = {
  gdp_pc_ppp: 'NY.GDP.PCAP.PP.KD',
  life_exp: 'SP.DYN.LE00.IN'
};

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const head = lines[0].split(',');
  return lines.slice(1).map((line) => {
    // The sample file has no quoted commas, so a plain split is safe here.
    const cells = line.split(',');
    return Object.fromEntries(head.map((h, i) => [h, cells[i]]));
  });
}

async function pull(indicator, iso3) {
  const url = `${BASE}/country/${iso3.join(';')}/indicator/${indicator}?date=${year}&format=json&per_page=500`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${indicator}: HTTP ${res.status}`);
  const json = await res.json();
  if (!Array.isArray(json) || !Array.isArray(json[1])) throw new Error(`${indicator}: unexpected response`);
  const out = new Map();
  for (const row of json[1]) {
    if (row.value != null) out.set(row.countryiso3code, Number(row.value));
  }
  return out;
}

const rows = parseCsv(await readFile('data/sample42.csv', 'utf8'));
const iso3 = rows.map((r) => r.iso3);
console.log(`Pulling ${iso3.length} countries for ${year}`);

const [gdp, life] = await Promise.all([pull(INDICATORS.gdp_pc_ppp, iso3), pull(INDICATORS.life_exp, iso3)]);

const out = rows.map((r) => ({
  iso3: r.iso3,
  name: r.name,
  gdp_pc_ppp: gdp.get(r.iso3) ?? '',
  life_exp: life.get(r.iso3) ?? '',
  ia_gdp_pc_ppp: r.gdp_pc_ppp,
  ia_life_exp: r.life_exp
}));

const header = 'iso3,name,gdp_pc_ppp,life_exp,ia_gdp_pc_ppp,ia_life_exp';
const csv = [header, ...out.map((o) => [o.iso3, `"${o.name}"`, o.gdp_pc_ppp, o.life_exp, o.ia_gdp_pc_ppp, o.ia_life_exp].join(','))].join('\n');
await writeFile('data/worldbank_2019_pull.csv', csv + '\n', 'utf8');

const missing = out.filter((o) => o.gdp_pc_ppp === '' || o.life_exp === '');
const gdpDelta = out
  .filter((o) => o.gdp_pc_ppp !== '')
  .map((o) => Math.abs(Number(o.gdp_pc_ppp) - Number(o.ia_gdp_pc_ppp)) / Number(o.ia_gdp_pc_ppp));
const lifeDelta = out
  .filter((o) => o.life_exp !== '')
  .map((o) => Math.abs(Number(o.life_exp) - Number(o.ia_life_exp)));

const max = (xs) => (xs.length ? xs.reduce((a, b) => Math.max(a, b), 0) : 0);
console.log(`Missing values: ${missing.length}${missing.length ? ' (' + missing.map((m) => m.iso3).join(', ') + ')' : ''}`);
console.log(`GDP: max relative difference from Appendix A ${(max(gdpDelta) * 100).toFixed(2)}%, mean ${((gdpDelta.reduce((a, b) => a + b, 0) / Math.max(1, gdpDelta.length)) * 100).toFixed(2)}%`);
console.log(`Life expectancy: max absolute difference ${max(lifeDelta).toFixed(3)} years, mean ${(lifeDelta.reduce((a, b) => a + b, 0) / Math.max(1, lifeDelta.length)).toFixed(3)}`);
console.log('Wrote data/worldbank_2019_pull.csv');
