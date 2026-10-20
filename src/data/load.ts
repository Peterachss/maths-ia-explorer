// src/data/load.ts
import type { Country } from './schema';

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { out.push(cur); cur = ''; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

export function parseCountries(text: string): Country[] {
  const lines = text.trim().split(/\r?\n/);
  const head = splitCsvLine(lines[0]!);
  const ix = (k: string) => {
    const i = head.indexOf(k);
    if (i < 0) throw new Error(`Missing column: ${k}`);
    return i;
  };
  const c = Object.fromEntries(
    ['iso3', 'name', 'region', 'income_group', 'lat', 'lon', 'gdp_pc_ppp', 'life_exp',
     'source_url', 'indicator_code', 'retrieved_on', 'vintage_note'].map((k) => [k, ix(k)])
  ) as Record<string, number>;
  const rows = lines.slice(1).filter((l) => l.trim()).map((l) => splitCsvLine(l));
  const countries = rows.map((f) => ({
    iso3: f[c.iso3!]!, name: f[c.name!]!, region: f[c.region!]!,
    incomeGroup: f[c.income_group!]! as Country['incomeGroup'],
    lat: Number(f[c.lat!]), lon: Number(f[c.lon!]),
    gdp: Number(f[c.gdp_pc_ppp!]), life: Number(f[c.life_exp!]),
    sourceUrl: f[c.source_url!]!, indicatorCode: f[c.indicator_code!]!,
    retrievedOn: f[c.retrieved_on!]!, vintageNote: f[c.vintage_note!]!
  }));
  for (const k of countries) {
    if (!(k.gdp > 0) || !Number.isFinite(k.life)) throw new Error(`Bad numbers for ${k.iso3}`);
  }
  if (countries.length !== 42) throw new Error(`Expected 42 countries, found ${countries.length}`);
  return countries;
}

export async function loadCountries(): Promise<Country[]> {
  const res = await fetch('/data/sample42.csv');
  if (!res.ok) throw new Error(`Could not load sample42.csv (HTTP ${res.status})`);
  return parseCountries(await res.text());
}
