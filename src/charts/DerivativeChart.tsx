import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import type { Analysis } from '../math';
import { theme } from '../theme';
import { useStore } from '../store';
import { H, M, W, innerH, sampleX, xScale } from './common';
import { XAxisView, YAxisView } from './Axes';

export function DerivativeChart({ analysis }: { analysis: Analysis }) {
  const { xAxis } = useStore();
  const fit = analysis.better === 'log' ? analysis.log : analysis.linear;
  const sx = xScale(xAxis);
  const sy = scaleLinear().domain([0, 6]).range([innerH, 0]);
  const xs = sampleX(xAxis);
  const d = line<number>().x((x) => sx(x)).y((x) => sy(Math.min(6, fit.derivative(x) * 1000)))(xs) ?? '';
  const marks = [analysis.gap?.low, analysis.gap?.high, analysis.points.find((p) => p.iso3 === 'VNM')].filter(Boolean) as { iso3: string; name: string; x: number }[];
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Rate of change of life expectancy with GDP per capita, in years per 1,000 dollars">
        <title>dy/dx in years per $1,000</title>
        <text x={M.l} y={16} className="chart-title">Rate of change, dy/dx, in years per $1,000</text>
        <g transform={`translate(${M.l},${M.t})`}>
          <YAxisView scale={sy} ticks={[0, 1, 2, 3, 4, 5, 6]} label="Years per $1,000" />
          <XAxisView scale={sx} axis={xAxis} />
          <path d={d} fill="none" stroke={theme.log} strokeWidth={2.2} />
          {marks.map((m) => {
            const v = fit.derivative(m.x) * 1000;
            return (
              <g key={m.iso3}>
                <line x1={sx(m.x)} x2={sx(m.x)} y1={sy(v)} y2={innerH} stroke={theme.thread} strokeDasharray="3 3" />
                <circle cx={sx(m.x)} cy={sy(v)} r={5} fill={theme.thread} />
                <text x={sx(m.x) + 8} y={sy(v) - 8} className="point-label">{m.name} {v.toFixed(2)}</text>
              </g>
            );
          })}
        </g>
      </svg>
    </figure>
  );
}
