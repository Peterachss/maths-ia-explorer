import type { Country } from '../data/schema';
import type { Analysis } from '../math';
import { dollars, num, signed } from '../math';
import { useStore } from '../store';

export function FitTable({ analysis }: { analysis: Analysis }) {
  const rows = [
    { name: 'Straight line', f: analysis.linear, eq: `y = ${analysis.linear.a.toFixed(6)} x + ${analysis.linear.b.toFixed(2)}` },
    { name: 'Logarithmic', f: analysis.log, eq: `y = ${analysis.log.a.toFixed(3)} ln x + ${analysis.log.b.toFixed(2)}` }
  ];
  return (
    <div className="table-scroll">
      <table className="data">
        <caption>Comparison of the two models (n = {analysis.points.length})</caption>
        <thead>
          <tr>
            <th scope="col">Model</th>
            <th scope="col">Equation</th>
            <th scope="col">r</th>
            <th scope="col">r squared</th>
            <th scope="col">Residual SE (years)</th>
            <th scope="col">SSE</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className={analysis.better === r.f.kind ? 'best' : ''}>
              <th scope="row">{r.name}{analysis.better === r.f.kind ? ' (better fit)' : ''}</th>
              <td>{r.eq}</td>
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
    <div className="table-scroll">
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
      <table>
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
