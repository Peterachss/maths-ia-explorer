import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import type { Analysis } from '../math';
import { dollars } from '../math';
import { theme } from '../theme';
import { useStore } from '../store';
import { H, M, W, Y_LABEL, innerH, innerW, sampleX, xScale } from './common';
import { XAxisView, YAxisView } from './Axes';

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
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`The model predicts ${inv.targetLife.toFixed(1)} years at a GDP per capita of ${dollars(inv.requiredX)}.`}>
        <title>GDP per capita at which the model predicts Singapore's life expectancy</title>
        <text x={M.l} y={16} className="chart-title">Reading the model in reverse</text>
        <g transform={`translate(${M.l},${M.t})`}>
          <YAxisView scale={sy} ticks={[50, 60, 70, 80, 90]} label={Y_LABEL} />
          <XAxisView scale={sx} axis={xAxis} />
          <path d={d} fill="none" stroke={analysis.better === 'log' ? theme.log : theme.linear} strokeWidth={2.2} />
          <line x1={0} x2={x0} y1={sy(inv.targetLife)} y2={sy(inv.targetLife)} stroke={theme.thread} strokeDasharray="4 4" />
          <line x1={x0} x2={x0} y1={sy(inv.targetLife)} y2={innerH} stroke={theme.thread} strokeDasharray="4 4" />
          <circle cx={x0} cy={sy(inv.targetLife)} r={5.5} fill={theme.thread} />
          <text x={Math.min(x0 + 8, innerW - 150)} y={sy(inv.targetLife) - 10} className="point-label">{dollars(inv.requiredX)} for {inv.targetLife.toFixed(1)} years</text>
          <circle cx={sx(g.low.x)} cy={sy(g.low.y)} r={4.5} fill={theme.paper0} />
          <text x={sx(g.low.x) + 8} y={sy(g.low.y) + 16} className="point-label">Zimbabwe {dollars(g.low.x)}</text>
        </g>
      </svg>
      <figcaption className="legend">
        <span>{inv.multipleOfLow.toFixed(1)} times Zimbabwe's GDP per capita. {inv.extrapolated ? 'This lies outside the data, so it is an extrapolation.' : 'This lies inside the range of the data, so it is interpolation.'}</span>
        {analysis.xOnY && <span>For comparison, the regression line of ln x on y gives {dollars(analysis.xOnY.requiredX)}. It is a different calculation, see Show working.</span>}
      </figcaption>
    </figure>
  );
}
