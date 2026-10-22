import type { ScaleContinuousNumeric } from 'd3-scale';
import { M, innerH, innerW, X_LABEL, kfmt, xTicks } from './common';
import type { XAxis } from '../store';

export function XAxisView({ scale, axis, label = X_LABEL }: { scale: ScaleContinuousNumeric<number, number>; axis: XAxis; label?: string }) {
  return (
    <g transform={`translate(0,${innerH})`}>
      <line x1={0} x2={innerW} stroke="var(--chart-axis)" />
      {xTicks(axis).map((t) => (
        <g key={t} transform={`translate(${scale(t)},0)`}>
          <line y2={5} stroke="var(--chart-axis)" />
          <text y={19} textAnchor="middle" className="tick">${kfmt(t)}</text>
        </g>
      ))}
      <text x={innerW / 2} y={M.b - 6} textAnchor="middle" className="axis-title">{label}</text>
    </g>
  );
}

export function YAxisView({ scale, ticks, label, fmt = String }: { scale: ScaleContinuousNumeric<number, number>; ticks: number[]; label: string; fmt?: (v: number) => string }) {
  return (
    <g>
      {ticks.map((t) => (
        <g key={t} transform={`translate(0,${scale(t)})`}>
          <line x2={innerW} stroke="var(--chart-axis)" strokeOpacity={0.45} />
          <text x={-9} dy="0.32em" textAnchor="end" className="tick">{fmt(t)}</text>
        </g>
      ))}
      <text transform={`translate(${-M.l + 18},${innerH / 2}) rotate(-90)`} textAnchor="middle" className="axis-title">{label}</text>
    </g>
  );
}
