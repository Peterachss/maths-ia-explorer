import { useState } from 'react';
import { quantile } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import type { Country, IncomeGroup } from '../data/schema';
import { useStore } from '../store';
import { SegmentedControl } from '../ui/Segmented';
import { ChartData, ChartExport } from '../ui/ChartExport';

const GROUPS: IncomeGroup[] = ['Low', 'Lower middle', 'Upper middle', 'High'];

export function GroupBoxes({ countries }: { countries: Country[] }) {
  const excluded = useStore((s) => s.excluded);
  const [groupYear, setGroupYear] = useState<'2019' | 'today'>('today');
  const W = 520;
  const L = 154;
  const R = 18;
  const H = 280;
  const sx = scaleLinear().domain([50, 86]).range([0, W - L - R]);
  const rows = countries.filter((c) => !excluded.includes(c.iso3));
  const grouping = groupYear === '2019' ? 'incomeGroup2019' : 'incomeGroup';
  const label = groupYear === '2019' ? 'FY2020, in force July 2019' : 'FY2027, from July 2026';
  const csv = ['country,iso3,life_exp,group_2019,group_today', ...rows.map((c) => `${JSON.stringify(c.name)},${c.iso3},${c.life},${c.incomeGroup2019},${c.incomeGroup}`)].join('\n');

  return (
    <figure className="chart">
      <div className="chart-toolbar">
        <SegmentedControl
          label="Income group classification year"
          value={groupYear}
          onChange={setGroupYear}
          options={[
            { value: '2019', label: 'Group as of 2019' },
            { value: 'today', label: 'Group today' }
          ]}
        />
        <span className="chart-note">{label}</span>
      </div>
      <div className="chart-actions"><ChartExport filename={`income-groups-${groupYear}`} csv={csv} /></div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Box plots of life expectancy by World Bank income group, ${label}`}>
        <title>Life expectancy by income group</title>
        <desc>
          Each row is one World Bank income group. The box runs from the lower to the upper quartile, the bright line is
          the median, and the thin line spans the minimum to the maximum. Group as of {groupYear === '2019' ? '2019' : 'today'}.
        </desc>
        <text x={0} y={17} className="chart-title">Life expectancy by income group (years)</text>
        {GROUPS.map((g, i) => {
          const v = rows
            .filter((c) => c[grouping] === g)
            .map((c) => c.life)
            .sort((a, b) => a - b);
          const y = 62 + i * 43;
          if (!v.length) {
            return (
              <g key={g} transform={`translate(${L},${y})`}>
                <text x={-L} y={5} className="tick">{g} (n = 0)</text>
              </g>
            );
          }
          const [q1, med, q3] = [0.25, 0.5, 0.75].map((p) => quantile(v, p)!);
          return (
            <g key={g} transform={`translate(${L},${y})`}>
              <text x={-L} y={-14} textAnchor="start" className="tick">
                {g} (n = {v.length})
              </text>
              <line x1={sx(v[0]!)} x2={sx(v[v.length - 1]!)} y1={0} y2={0} stroke="var(--chart-muted)" strokeWidth={1} />
              <line x1={sx(v[0]!)} x2={sx(v[0]!)} y1={-4} y2={4} stroke="var(--chart-muted)" />
              <line x1={sx(v[v.length - 1]!)} x2={sx(v[v.length - 1]!)} y1={-4} y2={4} stroke="var(--chart-muted)" />
              <rect
                x={sx(q1!)}
                y={-9}
                width={Math.max(2, sx(q3!) - sx(q1!))}
                height={18}
                fill="var(--chart-box)"
                stroke="var(--chart-box-line)"
                strokeWidth={1}
              />
              <line x1={sx(med!)} x2={sx(med!)} y1={-9} y2={9} stroke="var(--chart-median)" strokeWidth={2.4} />
            </g>
          );
        })}
        <g transform={`translate(${L},222)`}>
          <line x2={W - L - R} stroke="var(--chart-axis)" />
          {[50, 55, 60, 65, 70, 75, 80, 85].map((t) => (
            <g key={t} transform={`translate(${sx(t)},0)`}>
              <line y2={5} stroke="var(--chart-axis)" />
              <text y={21} textAnchor="middle" className="tick">{t}</text>
            </g>
          ))}
          <text x={(W - L - R) / 2} y={43} textAnchor="middle" className="axis-title">Life expectancy (years)</text>
        </g>
      </svg>
      <ChartData caption={`Life expectancy by ${label} income group`} columns={['Country', 'ISO3', 'Life expectancy', 'Group 2019', 'Group today']} rows={rows.map((c) => [c.name, c.iso3, c.life.toFixed(3), c.incomeGroup2019, c.incomeGroup])} />
      <figcaption className="legend">
        <span>Box: interquartile range. Bright line: median. Whiskers: minimum to maximum. {rows.length} countries shown.</span>
        <span className="chart-source">Source: World Bank WDI 2019, 42 countries. Computed from the Appendix A rows.</span>
      </figcaption>
    </figure>
  );
}
