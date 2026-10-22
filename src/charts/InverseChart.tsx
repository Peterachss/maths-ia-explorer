import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import type { Analysis } from '../math';
import { dollars } from '../math';
import { useStore } from '../store';
import { H, M, W, Y_LABEL, innerH, innerW, sampleX, xScale } from './common';
import { XAxisView, YAxisView } from './Axes';
import { ChartData, ChartExport } from '../ui/ChartExport';

export function InverseChart({ analysis }: { analysis: Analysis }) {
  const { xAxis } = useStore();
  const inv = analysis.inverse;
  const g = analysis.gap;
  if (!inv || !g) return <p className="note">Zimbabwe and Singapore must both be in the fit to show the inverse.</p>;
  const fit = analysis.better === 'log' ? analysis.log : analysis.linear;
  const sx = xScale(xAxis);
  const sy = scaleLinear().domain([45, 90]).range([innerH, 0]);
  const d = line<number>().x((x) => sx(x)).y((x) => sy(fit.predict(x)))(sampleX(xAxis)) ?? '';
  const x0 = sx(inv.requiredX);
  const csv = `quantity,value\ntarget_life,${inv.targetLife}\nrequired_gdp,${inv.requiredX}\nmultiple_of_zimbabwe,${inv.multipleOfLow}\nreverse_regression_gdp,${analysis.xOnY?.requiredX ?? ''}`;
  return (
    <figure className="chart">
      <div className="chart-actions"><ChartExport filename="inverse-prediction" csv={csv} /></div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`The model predicts ${inv.targetLife.toFixed(1)} years at a GDP per capita of ${dollars(inv.requiredX)}.`}>
        <title>GDP per capita at which the model predicts Singapore's life expectancy</title>
        <text x={M.l} y={16} className="chart-title">Reading the model in reverse</text>
        <g transform={`translate(${M.l},${M.t})`}>
          <YAxisView scale={sy} ticks={[50, 60, 70, 80, 90]} label={Y_LABEL} />
          <XAxisView scale={sx} axis={xAxis} />
          <rect x={0} y={0} width={sx(analysis.xSummary.min)} height={innerH} fill="var(--chart-extrapolation)" />
          <rect x={sx(analysis.xSummary.max)} y={0} width={Math.max(0, innerW - sx(analysis.xSummary.max))} height={innerH} fill="var(--chart-extrapolation)" />
          <path d={d} fill="none" stroke={analysis.better === 'log' ? 'var(--chart-log)' : 'var(--chart-linear)'} strokeWidth={2.2} />
          <line x1={0} x2={x0} y1={sy(inv.targetLife)} y2={sy(inv.targetLife)} stroke="var(--chart-thread)" strokeDasharray="4 4" />
          <line x1={x0} x2={x0} y1={sy(inv.targetLife)} y2={innerH} stroke="var(--chart-thread)" strokeDasharray="4 4" />
          <circle cx={x0} cy={sy(inv.targetLife)} r={5.5} fill="var(--chart-thread)" />
          <text x={Math.min(x0 + 8, innerW - 150)} y={sy(inv.targetLife) - 10} className="point-label">{dollars(inv.requiredX)} for {inv.targetLife.toFixed(1)} years</text>
          <circle cx={sx(g.low.x)} cy={sy(g.low.y)} r={4.5} fill="var(--chart-user)" />
          <text x={sx(g.low.x) + 8} y={sy(g.low.y) + 16} className="point-label">Zimbabwe {dollars(g.low.x)}</text>
        </g>
      </svg>
      <ChartData caption="Reading the model in reverse" columns={['Quantity', 'Value']} rows={[['Target life expectancy (years)', inv.targetLife.toFixed(3)], ['Required GDP per capita', dollars(inv.requiredX)], ['Multiple of Zimbabwe', inv.multipleOfLow.toFixed(2)]]} />
      <figcaption className="legend">
        <span>{inv.multipleOfLow.toFixed(1)} times Zimbabwe's GDP per capita. {inv.extrapolated ? 'This lies outside the data, so it is an extrapolation.' : 'This lies inside the range of the data, so it is interpolation.'}</span>
        {analysis.xOnY && <span>For comparison, the regression line of ln x on y gives {dollars(analysis.xOnY.requiredX)}. It is a different calculation, see Show working.</span>}
        <span className="chart-source">Source: World Bank WDI 2019, 42 countries. Computed from the Appendix A rows.</span>
      </figcaption>
    </figure>
  );
}
