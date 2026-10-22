import type { Analysis } from '../math';
import { dollars, num } from '../math';
import { ChartData, ChartExport } from '../ui/ChartExport';

export function GapChart({ analysis }: { analysis: Analysis }) {
  const g = analysis.gap;
  if (!g) return <p className="note">Zimbabwe and Singapore must both be in the fit to show the gap.</p>;
  const W = 520, scale = (v: number) => (v / 26) * 400;
  const col = analysis.better === 'log' ? 'var(--chart-log)' : 'var(--chart-linear)';
  const csv = `quantity,years\nobserved_gap,${g.observedGap}\npredicted_gap,${g.predictedGap}\nremainder,${g.remainder}\npercent_reproduced,${g.percentReproduced}`;
  const rows = [
    { label: 'Observed gap', v: g.observedGap, colour: 'var(--chart-thread)' },
    { label: 'Gap predicted by the model', v: g.predictedGap, colour: col }
  ];
  return (
    <figure className="chart">
      <div className="chart-actions"><ChartExport filename="zimbabwe-singapore-gap" csv={csv} /></div>
      <svg viewBox={`0 0 ${W} 170`} role="img" aria-label={`Observed gap ${num(g.observedGap, 3)} years. Model predicted gap ${num(g.predictedGap, 3)} years, which is ${num(g.percentReproduced, 1)} percent.`}>
        <title>Observed and predicted life expectancy gap, Zimbabwe and Singapore</title>
        <text x={0} y={16} className="chart-title">Life expectancy gap, Zimbabwe to Singapore (years)</text>
        {rows.map((r, i) => (
          <g key={r.label} transform={`translate(0,${38 + i * 48})`}>
            <text x={0} y={12} className="tick">{r.label}</text>
            <rect x={0} y={18} width={scale(r.v)} height={14} fill={r.colour} />
            {i === 1 && g.remainder > 0 && (
              <rect x={scale(r.v)} y={18} width={scale(g.remainder)} height={14} fill="none" stroke="var(--chart-muted)" strokeDasharray="3 3" />
            )}
            <text x={scale(i === 1 ? g.observedGap : r.v) + 8} y={30} className="point-label">{num(r.v, 3)} years</text>
          </g>
        ))}
      </svg>
      <ChartData caption="Observed and model-predicted life expectancy gap" columns={['Quantity', 'Years']} rows={[['Observed gap', g.observedGap.toFixed(3)], ['Predicted gap', g.predictedGap.toFixed(3)], ['Remainder', g.remainder.toFixed(3)]]} />
      <figcaption className="legend">
        <span>{num(g.percentReproduced, 1)}% of the observed gap is reproduced. The remaining {num(g.remainder, 3)} years equal the difference of the two residuals ({num(g.residualHigh, 4)} − ({num(g.residualLow, 4)}) = {num(g.residualHigh - g.residualLow, 4)}).</span>
        <span>GDP per capita: Zimbabwe {dollars(g.low.x)}, Singapore {dollars(g.high.x)}.</span>
        <span className="chart-source">Source: World Bank WDI 2019, 42 countries. Computed from the Appendix A rows.</span>
      </figcaption>
    </figure>
  );
}
