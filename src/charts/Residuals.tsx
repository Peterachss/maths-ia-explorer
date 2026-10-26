import { useState } from 'react';
import { scaleLinear } from 'd3-scale';
import type { Country } from '../data/schema';
import type { Analysis } from '../math';
import { num } from '../math';
import { useStore } from '../store';
import { H, M, W, innerH, innerW, xScale } from './common';
import { XAxisView, YAxisView } from './Axes';
import { ChartData, ChartExport } from '../ui/ChartExport';

export function Residuals({ countries, analysis }: { countries: Country[]; analysis: Analysis }) {
  const { xAxis, selected, select, hover, hovered } = useStore();
  const model = analysis.model;
  const fit = model === 'log' ? analysis.log : analysis.linear;
  const [focusIso, setFocusIso] = useState(() => selected[0] ?? analysis.points[0]?.iso3 ?? '');
  const sx = xScale(xAxis);
  const rows = analysis.points.map((p, i) => ({ p, e: fit.residuals[i]! }));
  const eMin = Math.min(...rows.map((r) => r.e));
  const eMax = Math.max(...rows.map((r) => r.e));
  const sy = scaleLinear()
    .domain([Math.floor((eMin - 2) / 2) * 2, Math.ceil((eMax + 2) / 2) * 2])
    .range([innerH, 0])
    .nice();
  const [y0, y1] = sy.domain() as [number, number];
  const colour = model === 'log' ? 'var(--chart-log)' : 'var(--chart-linear)';
  const worst = new Set([...rows].sort((a, b) => Math.abs(b.e) - Math.abs(a.e)).slice(0, 3).map((r) => r.p.iso3));
  const name = (iso: string) => countries.find((c) => c.iso3 === iso)?.name ?? iso;
  const modelName = model === 'log' ? 'logarithmic' : 'straight line';
  const title = `Residuals of the ${modelName} model`;
  const step = (y1 - y0) / 9;
  const bins = Array.from({ length: 9 }, (_, i) => {
    const from = y0 + i * step;
    const to = from + step;
    return {
      from,
      to,
      n: rows.filter(({ e }) => e >= from && (i === 8 ? e <= to : e < to)).length
    };
  });
  const maxBin = Math.max(...bins.map((b) => b.n), 1);
  const csv = ['country,iso3,residual_years', ...rows.map(({ p, e }) => `${JSON.stringify(p.name)},${p.iso3},${e.toFixed(6)}`)].join('\n');
  const focusPoint = (iso3: string) => {
    setFocusIso(iso3);
    requestAnimationFrame(() => document.querySelector<SVGGElement>(`[data-resid="${iso3}"]`)?.focus());
  };

  return (
    <figure className="chart chart-residuals">
      <div className="chart-actions"><ChartExport filename={`residuals-${model}`} csv={csv} /></div>
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`${title}. Observed minus predicted life expectancy, in years.`} aria-describedby="resid-data">
        <title>{title}</title>
        <desc>Each stem is a country. Tab enters the points; arrow keys move between countries and Enter selects one.</desc>
        <text x={0} y={16} className="chart-title">{title}</text>
        <g transform={`translate(${M.l},${M.t})`}>
          <YAxisView scale={sy} ticks={sy.ticks(5)} label="Residual (years)" />
          <XAxisView scale={sx} axis={xAxis} />
          <line x1={0} x2={innerW} y1={sy(0)} y2={sy(0)} stroke="var(--chart-axis)" strokeWidth={1.2} />
          {rows.map(({ p, e }) => {
            const end = sx(p.x) > innerW - 90;
            const isSel = selected.includes(p.iso3);
            return (
              <g
                key={p.iso3}
                className="resid-point"
                data-resid={p.iso3}
                role="button"
                tabIndex={p.iso3 === focusIso ? 0 : -1}
                aria-pressed={isSel}
                aria-label={`${name(p.iso3)}: residual ${e.toFixed(2)} years${isSel ? ', selected' : ''}`}
                onClick={() => select(p.iso3)}
                onPointerEnter={() => hover(p.iso3)}
                onPointerLeave={() => hover(null)}
                onFocus={() => { setFocusIso(p.iso3); hover(p.iso3); }}
                onBlur={() => hover(null)}
                onKeyDown={(event) => {
                  const index = analysis.points.findIndex((point) => point.iso3 === p.iso3);
                  let next = -1;
                  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % analysis.points.length;
                  else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + analysis.points.length) % analysis.points.length;
                  else if (event.key === 'Home') next = 0;
                  else if (event.key === 'End') next = analysis.points.length - 1;
                  if (next >= 0) {
                    const target = analysis.points[next];
                    if (target) {
                      event.preventDefault();
                      focusPoint(target.iso3);
                    }
                  } else if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    select(p.iso3);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <title>{name(p.iso3)}: {e.toFixed(2)} years</title>
                <line x1={sx(p.x)} x2={sx(p.x)} y1={sy(0)} y2={sy(e)} stroke={colour} strokeOpacity={0.45} />
                <circle cx={sx(p.x)} cy={sy(e)} r={isSel ? 6 : 4} fill={colour} stroke={isSel ? 'var(--chart-thread)' : 'var(--chart-dot-ring)'} strokeWidth={isSel ? 2 : 1} />
                {(worst.has(p.iso3) || hovered === p.iso3) && (
                  <text x={sx(p.x) + (end ? -8 : 8)} y={sy(e) + 4} textAnchor={end ? 'end' : 'start'} className="point-label">
                    {name(p.iso3)}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <div className="resid-hist-wrap">
        <span className="resid-hist-label">Residual distribution · bar = countries</span>
        <div className="resid-hist" aria-hidden="true">
          {bins.map((b) => <i key={b.from} style={{ height: `${Math.max(2, (b.n / maxBin) * 28)}px` }} title={`${num(b.from, 1)} to ${num(b.to, 1)} years: ${b.n}`} />)}
        </div>
        <div className="resid-hist-axis" aria-hidden="true">
          <span>{num(y0, 0)}</span>
          <span>{num(y1, 0)}</span>
        </div>
      </div>
      <ChartData caption={`${title}, residuals in years`} columns={['Country', 'ISO3', 'Residual (years)']} rows={rows.map(({ p, e }) => [p.name, p.iso3, e.toFixed(3)])} />
      <span id="resid-data" className="visually-hidden">The data table follows the chart.</span>
      <figcaption className="legend">
        <span>Observed minus predicted. Points on the zero line are fitted exactly. Stems show the size and sign of each residual.</span>
        <span className="chart-source">Source: World Bank WDI 2019, {analysis.points.length} countries in the fit. Computed from the Appendix A rows.</span>
      </figcaption>
    </figure>
  );
}
