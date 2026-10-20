import { scaleLinear } from 'd3-scale';
import type { Country } from '../data/schema';
import type { Analysis } from '../math';
import { theme } from '../theme';
import { useStore } from '../store';
import { H, M, W, innerH, xScale } from './common';
import { XAxisView, YAxisView } from './Axes';

export function Residuals({ countries, analysis, model }: { countries: Country[]; analysis: Analysis; model: 'linear' | 'log' }) {
  const { xAxis, selected, select } = useStore();
  const fit = model === 'log' ? analysis.log : analysis.linear;
  const sx = xScale(xAxis);
  const sy = scaleLinear().domain([-18, 8]).range([innerH, 0]);
  const colour = model === 'log' ? theme.log : theme.linear;
  const rows = analysis.points.map((p, i) => ({ p, e: fit.residuals[i]! }));
  const worst = new Set([...rows].sort((a, b) => Math.abs(b.e) - Math.abs(a.e)).slice(0, 3).map((r) => r.p.iso3));
  const name = (iso: string) => countries.find((c) => c.iso3 === iso)?.name ?? iso;
  const title = `Residuals of the ${model === 'log' ? 'logarithmic' : 'straight line'} model`;
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}. Observed minus predicted life expectancy, in years.`}>
        <title>{title}</title>
        <text x={M.l} y={16} className="chart-title">{title}</text>
        <g transform={`translate(${M.l},${M.t})`}>
          <YAxisView scale={sy} ticks={[-15, -10, -5, 0, 5]} label="Residual (years)" />
          <XAxisView scale={sx} axis={xAxis} />
          <line x1={0} x2={W - M.l - M.r} y1={sy(0)} y2={sy(0)} stroke={theme.paper1} strokeWidth={1.2} />
          {rows.map(({ p, e }) => (
            <g key={p.iso3} onClick={() => select(p.iso3)} style={{ cursor: 'pointer' }}>
              <line x1={sx(p.x)} x2={sx(p.x)} y1={sy(0)} y2={sy(e)} stroke={colour} strokeOpacity={0.45} />
              <circle cx={sx(p.x)} cy={sy(e)} r={selected.includes(p.iso3) ? 6 : 4} fill={colour} stroke={selected.includes(p.iso3) ? theme.thread : theme.ink0} strokeWidth={selected.includes(p.iso3) ? 2 : 1} />
              {worst.has(p.iso3) && <text x={sx(p.x) + 8} y={sy(e) + 4} className="point-label">{name(p.iso3)}</text>}
            </g>
          ))}
        </g>
      </svg>
    </figure>
  );
}
