import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import type { Analysis } from '../math';
import { num } from '../math';
import { useStore } from '../store';
import { H, M, W, innerH, innerW, sampleX, xScale } from './common';
import { XAxisView, YAxisView } from './Axes';
import { ChartData, ChartExport } from '../ui/ChartExport';

export function DerivativeChart({ analysis }: { analysis: Analysis }) {
  const { xAxis } = useStore();
  const model = analysis.model;
  const fit = model === 'log' ? analysis.log : analysis.linear;
  const modelName = model === 'log' ? 'logarithmic' : 'straight-line';
  const sx = xScale(xAxis);
  const rawMax = Math.max(...sampleX(xAxis).map((x) => fit.derivative(x) * 1000));
  const yMax = Math.max(1, Math.ceil(rawMax * 1.15));
  const sy = scaleLinear().domain([0, yMax]).range([innerH, 0]);
  const xs = sampleX(xAxis);
  const d = line<number>().x((x) => sx(x)).y((x) => sy(fit.derivative(x) * 1000))(xs) ?? '';
  const marks = ([analysis.gap?.low, analysis.gap?.high, analysis.points.find((p) => p.iso3 === 'VNM')].filter(Boolean) as {
    iso3: string;
    name: string;
    x: number;
  }[]).map((m) => ({ ...m, v: fit.derivative(m.x) * 1000 })).sort((a, b) => a.x - b.x);
  const markText = marks.map((m) => `${m.name} ${num(m.v, 3)}`).join(', ');
  const ticks = Array.from({ length: yMax + 1 }, (_, i) => i);
  const csv = ['gdp_per_capita,years_per_1000', ...xs.map((x) => `${Math.round(x)},${(fit.derivative(x) * 1000).toFixed(6)}`)].join('\n');
  return (
    <figure className="chart chart-derivative">
      <div className="chart-actions"><ChartExport filename="rate-of-change" csv={csv} /></div>
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Rate of change of life expectancy with GDP per capita under the ${modelName} model, in years per 1,000 dollars. Marked countries: ${markText}.`}>
        <title>dy/dx in years per $1,000</title>
        <text x={0} y={16} className="chart-title">{model === 'log' ? 'Diminishing returns to income' : 'A constant return to income'}</text>
        <text x={0} y={31} className="chart-subtitle">Rate of change, dy/dx, in years per $1,000</text>
        <g transform={`translate(${M.l},${M.t})`}>
          <YAxisView scale={sy} ticks={ticks} label="Years per $1,000" />
          <XAxisView scale={sx} axis={xAxis} />
          <rect x={0} y={0} width={sx(analysis.xSummary.min)} height={innerH} fill="var(--chart-extrapolation)" />
          <rect x={sx(analysis.xSummary.max)} y={0} width={Math.max(0, innerW - sx(analysis.xSummary.max))} height={innerH} fill="var(--chart-extrapolation)" />
          <path d={d} fill="none" stroke={model === 'log' ? 'var(--chart-log)' : 'var(--chart-linear)'} strokeWidth={2.4} />
          {marks.map((m) => (
            <g key={m.iso3}>
              <line x1={sx(m.x)} x2={sx(m.x)} y1={sy(m.v)} y2={innerH} stroke="var(--chart-thread)" strokeDasharray="3 3" />
              <circle cx={sx(m.x)} cy={sy(m.v)} r={5} fill="var(--chart-thread)" />
            </g>
          ))}
        </g>
      </svg>
      <ChartData caption="Rate of change of life expectancy with GDP per capita" columns={['GDP per capita', 'Years per $1,000']} rows={xs.filter((_, i) => i % 12 === 0).map((x) => [Math.round(x), (fit.derivative(x) * 1000).toFixed(3)])} />
      <figcaption className="legend">
        <span className="mark-key">
          {marks.map((m) => (
            <span key={m.iso3}><i />{m.name} <b>{num(m.v, 3)}</b></span>
          ))}
        </span>
        <span>Derivative of the {modelName} model, in years per $1,000. The tangent is a local rate; the exact change for a finite increase is in the tool below. Shaded areas lie outside the observed income range, where the rate is an extrapolation.</span>
        <span className="chart-source">Source: World Bank WDI 2019, {analysis.points.length} countries in the fit. Computed from the Appendix A rows.</span>
      </figcaption>
    </figure>
  );
}
