import { useState } from 'react';
import type { Country } from '../data/schema';
import type { Analysis } from '../math';
import { dollars, num, signed } from '../math';
import { useStore } from '../store';

export function FitTable({ analysis }: { analysis: Analysis }) {
  const rows = [
    { name: 'Straight line', f: analysis.linear },
    { name: 'Logarithmic', f: analysis.log }
  ];
  return (
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Model comparison table">
      <table className="data">
        <caption>Comparison of the two models (n = {analysis.points.length})</caption>
        <thead>
          <tr>
            <th scope="col">Model</th>
            <th scope="col">r</th>
            <th scope="col">r squared</th>
            <th scope="col">Residual SE (years)</th>
            <th scope="col">SSE</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className={analysis.better === r.f.kind ? 'best' : ''}>
              <th scope="row">
                {r.name}
                {analysis.better === r.f.kind && <span className="pill">Better fit</span>}
              </th>
              <td>{num(r.f.r, 3)}</td>
              <td>{num(r.f.r2, 3)}</td>
              <td>{num(r.f.se, 2)}</td>
              <td>{num(r.f.sse, 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SummaryTable({ analysis }: { analysis: Analysis }) {
  const s = [
    ['GDP per capita x ($)', analysis.xSummary, 0],
    ['Life expectancy y (years)', analysis.ySummary, 2]
  ] as const;
  return (
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Summary statistics table">
      <table className="data">
        <caption>Summary statistics, n = {analysis.points.length}. Spearman rank correlation {num(analysis.spearman, 3)}.</caption>
        <thead>
          <tr>
            <th scope="col">Variable</th>
            <th scope="col">Mean</th>
            <th scope="col">SD</th>
            <th scope="col">Median</th>
            <th scope="col">Min</th>
            <th scope="col">Max</th>
          </tr>
        </thead>
        <tbody>
          {s.map(([name, v, d]) => (
            <tr key={name}>
              <th scope="row">{name}</th>
              <td>{num(v.mean, d)}</td>
              <td>{num(v.sd, d)}</td>
              <td>{num(v.median, d)}</td>
              <td>{num(v.min, d)}</td>
              <td>{num(v.max, d)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A visually hidden table that mirrors the whole 3D scene for screen readers. */
export function AccessibleData({ countries, analysis }: { countries: Country[]; analysis: Analysis }) {
  const fit = analysis.better === 'log' ? analysis.log : analysis.linear;
  const { selected, select } = useStore();
  return (
    <div className="visually-hidden">
      <table className="data">
        <caption>All 42 countries: GDP per capita, life expectancy, model value and residual</caption>
        <thead>
          <tr>
            <th scope="col">Country</th>
            <th scope="col">Income group</th>
            <th scope="col">GDP per capita</th>
            <th scope="col">Life expectancy, years</th>
            <th scope="col">Model value</th>
            <th scope="col">Residual</th>
          </tr>
        </thead>
        <tbody>
          {countries.map((c) => (
            <tr key={c.iso3}>
              <th scope="row">
                <button type="button" aria-pressed={selected.includes(c.iso3)} onClick={() => select(c.iso3)}>
                  {c.name}
                </button>
              </th>
              <td>{c.incomeGroup}</td>
              <td>{dollars(c.gdp)}</td>
              <td>{c.life.toFixed(1)}</td>
              <td>{fit.predict(c.gdp).toFixed(1)}</td>
              <td>{signed(c.life - fit.predict(c.gdp), 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


type SortKey = 'name' | 'incomeGroup' | 'incomeGroup2019' | 'gdp' | 'life' | 'residual';

/** Sortable country table. Numbers are monospace and right aligned; selections persist. */
export function CountryTable({ countries, analysis }: { countries: Country[]; analysis: Analysis }) {
  const [key, setKey] = useState<SortKey>('life');
  const [dir, setDir] = useState<1 | -1>(-1);
  const selected = useStore((s) => s.selected);
  const select = useStore((s) => s.select);
  const fit = analysis.better === 'log' ? analysis.log : analysis.linear;
  const rows = countries.map((c) => ({ ...c, residual: c.life - fit.predict(c.gdp) }));
  const sorted = [...rows].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });
  const head = (label: string, k: SortKey, align: 'left' | 'right' = 'left') => (
    <th scope="col" aria-sort={key === k ? (dir === 1 ? 'ascending' : 'descending') : 'none'} style={{ textAlign: align }}>
      <button type="button" className="sort" onClick={() => { if (key === k) setDir(dir === 1 ? -1 : 1); else { setKey(k); setDir(k === 'name' || k === 'incomeGroup' || k === 'incomeGroup2019' ? 1 : -1); } }}>
        {label}{key === k ? (dir === 1 ? ' ↑' : ' ↓') : ''}
      </button>
    </th>
  );
  return (
    <div className="table-scroll" tabIndex={0} role="region" aria-label="All countries table">
      <table className="data country-table">
        <caption>All {rows.length} countries, sorted by {key === 'life' ? 'life expectancy' : key}. Click a row to select it.</caption>
        <thead><tr>
          {head('Country', 'name')}
          {head('Group today', 'incomeGroup')}
          {head('Group 2019', 'incomeGroup2019')}
          {head('GDP per capita', 'gdp', 'right')}
          {head('Life expectancy', 'life', 'right')}
          {head('Residual', 'residual', 'right')}
        </tr></thead>
        <tbody>
          {sorted.map((c) => (
            <tr key={c.iso3} className={selected.includes(c.iso3) ? 'selected' : ''} onClick={() => select(c.iso3)}>
              <th scope="row">{c.name}</th>
              <td>{c.incomeGroup}</td>
              <td>{c.incomeGroup2019}</td>
              <td>{dollars(c.gdp)}</td>
              <td>{c.life.toFixed(1)}</td>
              <td>{signed(c.residual, 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
