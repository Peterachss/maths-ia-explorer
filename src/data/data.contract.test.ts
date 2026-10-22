// The data contract: the app may only publish rows that are complete,
// in range, labelled with the right indicators and still in step with the
// saved World Bank pull. These checks are local and deterministic.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

type Row = Record<string, string>;

function parse(path: string): Row[] {
  const lines = readFileSync(path, 'utf8').trim().split(/\r?\n/);
  const head = lines[0]!.split(',');
  return lines.slice(1).map((line) => {
    const cells = line.split(',');
    expect(cells).toHaveLength(head.length);
    return Object.fromEntries(head.map((h, i) => [h, cells[i]!]));
  });
}

const source = readFileSync('data/sample42.csv', 'utf8');
const publicSource = readFileSync('public/data/sample42.csv', 'utf8');
const rows = parse('data/sample42.csv');
const live = parse('data/worldbank_2019_pull.csv');
const meta = JSON.parse(readFileSync('data/sample42.meta.json', 'utf8'));
const GDP = 'NY.GDP.PCAP.PP.KD';
const LIFE = 'SP.DYN.LE00.IN';
const INCOME = ['Low', 'Lower middle', 'Upper middle', 'High'];

describe('appendix data', () => {
  it('has 42 distinct countries and one runtime copy', () => {
    expect(rows).toHaveLength(42);
    expect(new Set(rows.map((r) => r.iso3)).size).toBe(42);
    expect(publicSource).toBe(source);
  });

  it('has complete, correctly coded provenance', () => {
    for (const r of rows) {
      expect(r.iso3).toMatch(/^[A-Z]{3}$/);
      expect(r.name!.length).toBeGreaterThan(0);
      expect(r.region!.length).toBeGreaterThan(0);
      expect(r.status).toBe('ia_appendix_a');
      expect(r.indicator_code).toContain(GDP);
      expect(r.indicator_code).toContain(LIFE);
      const gdpUrl = `https://api.worldbank.org/v2/country/${r.iso3}/indicator/${GDP}?date=2019&format=json`;
      const lifeUrl = `https://api.worldbank.org/v2/country/${r.iso3}/indicator/${LIFE}?date=2019&format=json`;
      expect(r.source_url).toBe(lifeUrl);
      expect(r.gdp_source_url).toBe(gdpUrl);
      expect(r.life_source_url).toBe(lifeUrl);
      expect(r.retrieved_on).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('keeps every value inside a defensible range', () => {
    for (const r of rows) {
      const gdp = Number(r.gdp_pc_ppp);
      const life = Number(r.life_exp);
      const lat = Number(r.lat);
      const lon = Number(r.lon);
      expect(Number.isFinite(gdp) && gdp >= 500 && gdp <= 250000).toBe(true);
      expect(Number.isFinite(life) && life >= 40 && life <= 90).toBe(true);
      expect(Number.isFinite(lat) && lat >= -90 && lat <= 90).toBe(true);
      expect(Number.isFinite(lon) && lon >= -180 && lon <= 180).toBe(true);
    }
  });

  it('uses only the four published income labels, today and in 2019', () => {
    for (const r of rows) {
      expect(INCOME).toContain(r.income_group);
      expect(INCOME).toContain(r.income_group_2019);
    }
    expect(new Set(rows.map((r) => r.income_group)).size).toBe(4);
    expect(new Set(rows.map((r) => r.income_group_2019)).size).toBe(4);
  });

  it('names the four countries whose group changed between FY2020 and FY2027', () => {
    const changed = rows.filter((r) => r.income_group !== r.income_group_2019).map((r) => r.iso3).sort();
    expect(changed).toEqual(['IDN', 'NPL', 'PHL', 'VNM']);
  });

  it('has matching metadata for the 2019 pull and classification years', () => {
    expect(meta.rows).toBe(42);
    expect(meta.year).toBe(2019);
    expect(meta.indicators).toEqual({ gdp_pc_ppp: GDP, life_exp: LIFE });
    expect(meta.retrieved_on).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(meta.live_pull_on).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(meta.income_groups?.today).toContain('FY2027');
    expect(meta.income_groups?.in_2019).toContain('FY2020');
  });
});

describe('live World Bank pull', () => {
  it('covers every row and agrees at the printed precision', () => {
    expect(live).toHaveLength(42);
    const byIso = new Map(live.map((r) => [r.iso3, r]));
    let maxGdp = 0;
    let maxLife = 0;
    for (const r of rows) {
      const l = byIso.get(r.iso3);
      expect(l).toBeDefined();
      expect(l!.gdp_pc_ppp).not.toBe('');
      expect(l!.life_exp).not.toBe('');
      maxGdp = Math.max(maxGdp, Math.abs(Number(l!.gdp_pc_ppp) - Number(r.gdp_pc_ppp)) / Number(r.gdp_pc_ppp));
      maxLife = Math.max(maxLife, Math.abs(Number(l!.life_exp) - Number(r.life_exp)));
    }
    expect(maxGdp).toBeLessThanOrEqual(1e-4);
    expect(maxLife).toBeLessThanOrEqual(1e-3);
  });
});
