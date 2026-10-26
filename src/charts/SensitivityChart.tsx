import { useMemo } from 'react';
import type { Analysis, Point } from '../math';
import { analyse, dollars, num } from '../math';
import { useStore } from '../store';
import { ChartData, ChartExport } from '../ui/ChartExport';

const PRESET = ['NGA', 'TCD'];

interface Row {
  label: string;
  unit: string;
  unitShort: string;
  all: number;
  without: number;
  format: (value: number) => string;
}

/**
 * A dumbbell chart: each row is scaled to its own range, so four statistics
 * with different units can be read side by side without a false shared axis.
 */
export function SensitivityChart({ points, analysis }: { points: Point[]; analysis: Analysis }) {
  const model = useStore((s) => s.model);
  const base = useMemo(() => analyse(points, new Set(), model), [points, model]);
  const out = useMemo(() => analyse(points, new Set(PRESET), model), [points, model]);
  const active = analysis.model === 'log' ? analysis.log : analysis.linear;
  const colour = analysis.model === 'log' ? 'var(--chart-log)' : 'var(--chart-linear)';
  const share = (a: Analysis) => (a.gap ? a.gap.percentReproduced : NaN);
  const inverse = (a: Analysis) => (a.inverse ? a.inverse.requiredX : NaN);
  const rows: Row[] = [
    {
      label: 'Slope a',
      unit: analysis.model === 'log' ? 'years per log dollar' : 'years per $1,000',
      unitShort: analysis.model === 'log' ? 'per ln unit' : 'per $1k',
      all: analysis.model === 'log' ? base.log.a : base.linear.a * 1000,
      without: analysis.model === 'log' ? out.log.a : out.linear.a * 1000,
      format: (v) => num(v, 3)
    },
    {
      label: 'r²',
      unit: 'share of variation',
      unitShort: 'of variation',
      all: analysis.model === 'log' ? base.log.r2 : base.linear.r2,
      without: analysis.model === 'log' ? out.log.r2 : out.linear.r2,
      format: (v) => num(v, 3)
    },
    {
      label: 'Gap reproduced',
      unit: '% of observed gap',
      unitShort: '% of gap',
      all: share(base),
      without: share(out),
      format: (v) => `${num(v, 1)}%`
    },
    {
      label: 'Inverse income',
      unit: 'for Singapore life expectancy',
      unitShort: `for ${num(analysis.inverse?.targetLife ?? 83.6, 1)} years`,
      all: inverse(base),
      without: inverse(out),
      format: (v) => dollars(v)
    }
  ];
  const W = 520;
  const H = 320;
  const left = 166;
  const right = 112;
  const plotW = W - left - right;
  const top = 102;
  const rowH = 52;
  const x = (v: number, a: number, b: number) => {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi - lo < 1e-12) return left + plotW / 2;
    return left + 12 + ((v - lo) / (hi - lo)) * (plotW - 24);
  };
  const csv = [
    'quantity,all_42,without_nigeria_chad,unit',
    ...rows.map((r) => `${JSON.stringify(r.label)},${r.all},${r.without},${JSON.stringify(r.unit)}`)
  ].join('\n');
  const modelName = analysis.model === 'log' ? 'logarithmic' : 'straight-line';
  return (
    <figure className="chart chart-sensitivity">
      <div className="chart-actions"><ChartExport filename={`sensitivity-${analysis.model}`} csv={csv} /></div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Sensitivity of four ${modelName} model statistics when Nigeria and Chad are removed. Each row has its own scale.`}>
        <title>Sensitivity to two countries</title>
        <desc>
          Each row compares the all-country fit with the fit without Nigeria and Chad. The rows use different units and
          are scaled independently; the printed values are the comparison.
        </desc>
        <text x={0} y={17} className="chart-title">How much moves when two countries leave</text>
        <g transform="translate(0,44)">
          <circle cx={0} cy={0} r={4} fill={colour} />
          <text x={9} y={4} className="tick">All {base.points.length}</text>
          <circle cx={100} cy={0} r={4} fill="var(--surface-0)" stroke={colour} strokeWidth={1.6} />
          <text x={109} y={4} className="tick">Without Nigeria and Chad</text>
        </g>
        {rows.map((row, i) => {
          const y = top + i * rowH;
          const xa = x(row.all, row.all, row.without);
          const xb = x(row.without, row.all, row.without);
          const pct = row.all === 0 ? NaN : ((row.without - row.all) / Math.abs(row.all)) * 100;
          const delta = Number.isFinite(pct) ? `${pct > 0 ? '+' : ''}${num(pct, 1)}%` : 'no change';
          const anchor = (value: number) => (value > W - right - 70 ? 'end' : 'middle');
          return (
            <g key={row.label} transform={`translate(0,${y})`}>
              <text x={0} y={-5} className="sens-label">{row.label}</text>
              <text x={0} y={19} className="tick sens-unit-long">{row.unit}</text>
              <text x={0} y={19} className="tick sens-unit-short">{row.unitShort}</text>
              <line x1={left + 12} x2={W - right - 12} y1={0} y2={0} stroke="var(--chart-grid)" />
              <line x1={Math.min(xa, xb)} x2={Math.max(xa, xb)} y1={0} y2={0} stroke={colour} strokeWidth={1.4} strokeOpacity={0.55} />
              <circle cx={xa} cy={0} r={4.5} fill={colour} />
              <circle cx={xb} cy={0} r={4.5} fill="var(--surface-0)" stroke={colour} strokeWidth={1.8} />
              <text x={xa} y={-9} textAnchor={anchor(xa)} className="point-label">{row.format(row.all)}</text>
              <text x={xb} y={-9} textAnchor={anchor(xb)} className="point-label">{row.format(row.without)}</text>
              <text x={W - right + 8} y={4} className="sens-delta">{delta}</text>
            </g>
          );
        })}
        <line x1={left} x2={left} y1={top - 12} y2={top + rows.length * rowH - 18} stroke="var(--chart-axis)" />
      </svg>
      <ChartData
        caption={`${modelName[0]!.toUpperCase()}${modelName.slice(1)} model with all 42 countries and without Nigeria and Chad`}
        columns={['Quantity', 'All 42', 'Without the two', 'Unit']}
        rows={rows.map((r) => [r.label, r.format(r.all), r.format(r.without), r.unit])}
      />
      <figcaption className="legend">
        <span>Each row is scaled to its own range; compare the printed values, not the distances between rows. The active model is {modelName} with {active.n} countries in the current fit.</span>
        <span className="chart-source">Source: World Bank WDI 2019. Computed from the Appendix A rows.</span>
      </figcaption>
    </figure>
  );
}
