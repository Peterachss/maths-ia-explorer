import type { Analysis } from '../math';
import { dollars, num } from '../math';
import { ChartData, ChartExport } from '../ui/ChartExport';

export function GapChart({ analysis }: { analysis: Analysis }) {
  const g = analysis.gap;
  if (!g) return <p className="note">Zimbabwe and Singapore must both be in the fit to show the gap.</p>;
  const W = 520;
  const H = 248;
  const L = 158;
  const valueRoom = 74;
  const barW = W - L - valueRoom;
  const max = Math.max(26, Math.ceil(Math.max(g.observedGap, g.predictedGap) / 5) * 5);
  const scale = (v: number) => (v / max) * barW;
  const model = analysis.model;
  const col = model === 'log' ? 'var(--chart-log)' : 'var(--chart-linear)';
  const modelName = model === 'log' ? 'Logarithmic' : 'Straight line';
  const csv = `quantity,years\nobserved_gap,${g.observedGap}\npredicted_gap,${g.predictedGap}\nremainder,${g.remainder}\npercent_reproduced,${g.percentReproduced}`;
  const rows = [
    { label: 'Observed gap', v: g.observedGap, colour: 'var(--chart-thread)' },
    { label: modelName, v: g.predictedGap, colour: col }
  ];
  const ticks = Array.from({ length: Math.floor(max / 5) + 1 }, (_, i) => i * 5);
  const overshoot = g.remainder < 0;
  return (
    <figure className="chart chart-gap">
      <div className="chart-actions"><ChartExport filename="zimbabwe-singapore-gap" csv={csv} /></div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Observed gap ${num(g.observedGap, 3)} years. The ${modelName.toLowerCase()} model predicts ${num(g.predictedGap, 3)} years, which is ${num(g.percentReproduced, 1)} percent of the observed gap.`}>
        <title>Observed and predicted life expectancy gap, Zimbabwe and Singapore</title>
        <text x={0} y={16} className="chart-title chart-title-long">Life expectancy gap, Zimbabwe to Singapore</text>
        <text x={0} y={16} className="chart-title chart-title-short">The Zimbabwe–Singapore gap</text>
        <text x={0} y={33} className="chart-subtitle">
          Years. {overshoot
            ? `The model overshoots by ${num(Math.abs(g.remainder), 2)} years.`
            : `The model leaves ${num(g.remainder, 2)} years unexplained.`}
        </text>
        <g transform={`translate(0,74)`}>
          {rows.map((r, index) => (
            <g key={r.label} transform={`translate(0,${index * 50})`}>
              <text x={0} y={16} className="tick">{r.label}</text>
              <rect x={L} y={4} width={barW} height={18} fill="var(--chart-grid)" />
              <rect x={L} y={4} width={scale(r.v)} height={18} fill={r.colour} />
              <text x={L + scale(r.v) + 8} y={17} className="point-label">{num(r.v, 2)}</text>
            </g>
          ))}
          <line x1={L + scale(g.observedGap)} x2={L + scale(g.observedGap)} y1={0} y2={92} stroke="var(--chart-thread)" strokeDasharray="3 3" strokeOpacity={0.7} />
          {overshoot && (
            <rect x={L + scale(g.observedGap)} y={54} width={scale(-g.remainder)} height={18} fill="none" stroke="var(--chart-thread)" strokeDasharray="3 3" />
          )}
          <g transform="translate(0,124)">
            <line x1={L} x2={L + barW} y1={0} y2={0} stroke="var(--chart-axis)" />
            {ticks.map((t) => (
              <g key={t} transform={`translate(${L + scale(t)},0)`}>
                <line y2={4} stroke="var(--chart-axis)" />
                <text y={16} textAnchor="middle" className="tick">{t}</text>
              </g>
            ))}
            <text x={L + barW / 2} y={34} textAnchor="middle" className="axis-title">Years</text>
          </g>
        </g>
      </svg>
      <ChartData caption="Observed and model-predicted life expectancy gap" columns={['Quantity', 'Years']} rows={[['Observed gap', g.observedGap.toFixed(3)], ['Predicted gap', g.predictedGap.toFixed(3)], ['Remainder', g.remainder.toFixed(3)]]} />
      <figcaption className="legend">
        <span>{num(g.percentReproduced, 1)}% of the observed gap is reproduced. The remaining {num(Math.abs(g.remainder), 3)} years {overshoot ? 'are the model overshoot' : 'equal the difference of the two residuals'} ({num(g.residualHigh, 4)} − ({num(g.residualLow, 4)}) = {num(g.residualHigh - g.residualLow, 4)}).</span>
        <span>GDP per capita: Zimbabwe {dollars(g.low.x)}, Singapore {dollars(g.high.x)}.</span>
        <span className="chart-source">Source: World Bank WDI 2019, {analysis.points.length} countries in the fit. Computed from the Appendix A rows.</span>
      </figcaption>
    </figure>
  );
}
