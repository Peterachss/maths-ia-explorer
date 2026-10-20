import type { Analysis } from '../math';
import { theme } from '../theme';
import { dollars } from '../math';

export function GapChart({ analysis }: { analysis: Analysis }) {
  const g = analysis.gap;
  if (!g) return <p className="note">Zimbabwe and Singapore must both be in the fit to show the gap.</p>;
  const W = 520, scale = (v: number) => (v / 26) * 400;
  const col = analysis.better === 'log' ? theme.log : theme.linear;
  const rows = [
    { label: 'Observed gap', v: g.observedGap, colour: theme.thread },
    { label: 'Gap predicted by the model', v: g.predictedGap, colour: col }
  ];
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} 150`} role="img" aria-label={`Observed gap ${g.observedGap.toFixed(2)} years. Model predicted gap ${g.predictedGap.toFixed(2)} years, which is ${g.percentReproduced.toFixed(1)} percent.`}>
        <title>Observed and predicted life expectancy gap, Zimbabwe and Singapore</title>
        <text x={0} y={16} className="chart-title">Life expectancy gap, Zimbabwe to Singapore (years)</text>
        {rows.map((r, i) => (
          <g key={r.label} transform={`translate(0,${34 + i * 46})`}>
            <text x={0} y={12} className="tick">{r.label}</text>
            <rect x={0} y={18} width={scale(r.v)} height={14} fill={r.colour} />
            {i === 1 && g.remainder > 0 && (
              <rect x={scale(r.v)} y={18} width={scale(g.remainder)} height={14} fill="none" stroke={theme.paper1} strokeDasharray="3 3" />
            )}
            <text x={scale(i === 1 ? g.observedGap : r.v) + 8} y={30} className="point-label">{r.v.toFixed(2)} years</text>
          </g>
        ))}
      </svg>
      <figcaption className="legend">
        <span>{g.percentReproduced.toFixed(1)}% of the observed gap is reproduced. The remaining {g.remainder.toFixed(2)} years equal the difference of the two residuals ({g.residualHigh.toFixed(2)} minus ({g.residualLow.toFixed(2)})).</span>
        <span>GDP per capita: Zimbabwe {dollars(g.low.x)}, Singapore {dollars(g.high.x)}.</span>
      </figcaption>
    </figure>
  );
}
