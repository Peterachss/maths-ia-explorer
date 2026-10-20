import { quantile } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import type { Country } from '../data/schema';
import { theme } from '../theme';

const GROUPS = ['Low', 'Lower middle', 'Upper middle', 'High'] as const;

export function GroupBoxes({ countries }: { countries: Country[] }) {
  const W = 520;
  const L = 152;
  const H = 210;
  const sx = scaleLinear().domain([50, 86]).range([0, W - L - 22]);

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Box plots of life expectancy by World Bank income group">
        <title>Life expectancy by income group</title>
        <desc>
          Each row is one World Bank income group. The box runs from the lower to the upper quartile, the bright line is
          the median, and the thin line spans the minimum to the maximum.
        </desc>
        <text x={0} y={17} className="chart-title">Life expectancy by income group (years)</text>
        {GROUPS.map((g, i) => {
          const v = countries
            .filter((c) => c.incomeGroup === g)
            .map((c) => c.life)
            .sort((a, b) => a - b);
          if (!v.length) return null;
          const [q1, med, q3] = [0.25, 0.5, 0.75].map((p) => quantile(v, p)!);
          const y = 52 + i * 38;
          return (
            <g key={g} transform={`translate(${L},${y})`}>
              <text x={0} y={5} textAnchor="start" className="tick">
                {g} (n = {v.length})
              </text>
              <line x1={sx(v[0]!)} x2={sx(v[v.length - 1]!)} y1={0} y2={0} stroke={theme.paper1} strokeWidth={1} />
              <line x1={sx(v[0]!)} x2={sx(v[0]!)} y1={-4} y2={4} stroke={theme.paper1} />
              <line x1={sx(v[v.length - 1]!)} x2={sx(v[v.length - 1]!)} y1={-4} y2={4} stroke={theme.paper1} />
              <rect
                x={sx(q1!)}
                y={-9}
                width={Math.max(2, sx(q3!) - sx(q1!))}
                height={18}
                fill={theme.land}
                stroke={theme.paper1}
                strokeWidth={1}
              />
              <line x1={sx(med!)} x2={sx(med!)} y1={-9} y2={9} stroke={theme.log} strokeWidth={2.4} />
            </g>
          );
        })}
        <g transform={`translate(${L},${52 + 4 * 38 - 14})`}>
          {[50, 60, 70, 80, 85].map((t) => (
            <text key={t} x={sx(t)} y={14} textAnchor="middle" className="tick">
              {t}
            </text>
          ))}
        </g>
      </svg>
    </figure>
  );
}
