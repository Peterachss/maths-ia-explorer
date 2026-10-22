import { scaleLinear } from 'd3-scale';
import type { Country } from '../data/schema';
import type { Analysis } from '../math';
import { useStore } from '../store';
import { H, M, W, innerH, innerW, xScale } from './common';
import { XAxisView, YAxisView } from './Axes';
import { ChartData, ChartExport } from '../ui/ChartExport';

export function Residuals({ countries, analysis, model }: { countries: Country[]; analysis: Analysis; model: 'linear' | 'log' }) {
  const { xAxis, selected, select } = useStore();
  const fit = model === 'log' ? analysis.log : analysis.linear;
  const sx = xScale(xAxis);
  const sy = scaleLinear().domain([-18, 8]).range([innerH, 0]);
  const colour = model === 'log' ? 'var(--chart-log)' : 'var(--chart-linear)';
  const rows = analysis.points.map((p, i) => ({ p, e: fit.residuals[i]! }));
  const worst = new Set([...rows].sort((a, b) => Math.abs(b.e) - Math.abs(a.e)).slice(0, 3).map((r) => r.p.iso3));
  const name = (iso: string) => countries.find((c) => c.iso3 === iso)?.name ?? iso;
  const title = `Residuals of the ${model === 'log' ? 'logarithmic' : 'straight line'} model`;
  const bins = Array.from({ length: 9 }, (_, i) => ({ from: -18 + i * 3, n: rows.filter(({ e }) => e >= -18 + i * 3 && e < -15 + i * 3).length }));
  const maxBin = Math.max(...bins.map((b) => b.n), 1);
  const csv = ['country,iso3,residual_years', ...rows.map(({ p, e }) => `${JSON.stringify(p.name)},${p.iso3},${e.toFixed(6)}`)].join('\n');
  return (
    <figure className="chart">
      <div className="chart-actions"><ChartExport filename={`residuals-${model}`} csv={csv} /></div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}. Observed minus predicted life expectancy, in years.`}>
        <title>{title}</title>
        <text x={M.l} y={16} className="chart-title">{title}</text>
        <g transform={`translate(${M.l},${M.t})`}>
          <YAxisView scale={sy} ticks={[-15, -10, -5, 0, 5]} label="Residual (years)" />
          <XAxisView scale={sx} axis={xAxis} />
          <line x1={0} x2={innerW} y1={sy(0)} y2={sy(0)} stroke="var(--chart-axis)" strokeWidth={1.2} />
          {rows.map(({ p, e }) => {
            const end = sx(p.x) > innerW - 90;
            return (
              <g
                key={p.iso3}
                onClick={() => select(p.iso3)}
                style={{ cursor: 'pointer' }}
              >
                <title>{name(p.iso3)}: {e.toFixed(2)} years</title>
                <line x1={sx(p.x)} x2={sx(p.x)} y1={sy(0)} y2={sy(e)} stroke={colour} strokeOpacity={0.45} />
                <circle cx={sx(p.x)} cy={sy(e)} r={selected.includes(p.iso3) ? 6 : 4} fill={colour} stroke={selected.includes(p.iso3) ? 'var(--chart-thread)' : 'var(--chart-dot-ring)'} strokeWidth={selected.includes(p.iso3) ? 2 : 1} />
                {worst.has(p.iso3) && (
                  <text x={sx(p.x) + (end ? -8 : 8)} y={sy(e) + 4} textAnchor={end ? 'end' : 'start'} className="point-label">
                    {name(p.iso3)}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <div className="resid-hist" aria-hidden="true">
        {bins.map((b) => <i key={b.from} style={{ height: `${Math.max(2, (b.n / maxBin) * 28)}px` }} title={`${b.from} to ${b.from + 3} years: ${b.n}`} />)}
      </div>
      <ChartData caption={`${title}, residuals in years`} columns={['Country', 'ISO3', 'Residual (years)']} rows={rows.map(({ p, e }) => [p.name, p.iso3, e.toFixed(3)])} />
      <figcaption className="legend">
        <span>Observed minus predicted. Points on the zero line are fitted exactly. Stems show the size and sign of each residual.</span>
        <span className="chart-source">Source: World Bank WDI 2019, 42 countries. Computed from the Appendix A rows.</span>
      </figcaption>
    </figure>
  );
}
