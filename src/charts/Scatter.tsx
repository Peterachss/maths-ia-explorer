import { useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { area, line } from 'd3-shape';
import type { Country } from '../data/schema';
import type { Analysis, Fit } from '../math';
import { lifeColour, lifeT } from '../theme';
import { useStore } from '../store';
import { H, M, W, Y_LABEL, innerH, innerW, sampleX, xScale } from './common';
import { XAxisView, YAxisView } from './Axes';
import { ChartData, ChartExport } from '../ui/ChartExport';

const ALWAYS = ['ZWE', 'SGP', 'VNM'];

export interface UserCurve { a: number; b: number; kind: 'linear' | 'log'; }

const equation = (fit: Fit) =>
  fit.kind === 'log'
    ? `y = ${fit.a.toFixed(3)} ln x + ${fit.b.toFixed(2)}`
    : `y = ${fit.a.toFixed(6)} x + ${fit.b.toFixed(2)}`;

export function Scatter({ countries, analysis, user }: { countries: Country[]; analysis: Analysis; user?: UserCurve }) {
  const { xAxis, compareCurves, model, selected, excluded, select, hover, hovered } = useStore();
  const [focusIso, setFocusIso] = useState(() => selected[0] ?? countries[0]?.iso3 ?? '');
  const sx = xScale(xAxis);
  // The straight line predicts above 90 years at the top incomes, so leave headroom for it.
  const sy = scaleLinear().domain([45, 96]).range([innerH, 0]);
  const xs = sampleX(xAxis);
  const path = (f: (x: number) => number) =>
    line<number>().x((x) => sx(x)).y((x) => sy(f(x)))(xs) ?? '';
  const active = model === 'log' ? analysis.log : analysis.linear;
  const other = model === 'log' ? analysis.linear : analysis.log;
  const fits: { fit: Fit; colour: string; dash?: string; label: string; active: boolean }[] = [];
  if (compareCurves) {
    fits.push({
      fit: other,
      colour: other.kind === 'log' ? 'var(--chart-log)' : 'var(--chart-linear)',
      dash: '6 5',
      label: other.kind === 'log' ? 'Logarithmic' : 'Straight line',
      active: false
    });
  }
  fits.push({
    fit: active,
    colour: active.kind === 'log' ? 'var(--chart-log)' : 'var(--chart-linear)',
    label: active.kind === 'log' ? 'Logarithmic' : 'Straight line',
    active: true
  });
  const userPath = user ? path((x) => user.a * (user.kind === 'log' ? Math.log(x) : x) + user.b) : null;
  // 95% confidence band for the mean response of the active model.
  const u = (x: number) => (active.kind === 'log' ? Math.log(x) : x);
  const ci = (x: number) =>
    1.96 * active.se * Math.sqrt(1 / active.n + ((u(x) - active.meanU) ** 2) / active.sxx);
  const band = area<number>()
    .x((x) => sx(x))
    .y0((x) => sy(active.predict(x) - ci(x)))
    .y1((x) => sy(active.predict(x) + ci(x)))(xs) ?? '';
  const hoveredCountry = countries.find((c) => c.iso3 === hovered);
  const labelled = new Set([...ALWAYS, ...selected]);
  const modelName = active.kind === 'log' ? 'logarithmic' : 'straight-line';
  const summary = `Scatter plot of life expectancy against GDP per capita for ${analysis.points.length} countries in 2019, with the ${modelName} model fitted.`;
  const csv = ['country,iso3,gdp_pc_ppp_2019,life_exp_2019', ...countries.map((c) => `${JSON.stringify(c.name)},${c.iso3},${c.gdp},${c.life}`)].join('\n');
  const focusPoint = (iso3: string) => {
    setFocusIso(iso3);
    requestAnimationFrame(() => document.querySelector<SVGGElement>(`[data-point="${iso3}"]`)?.focus());
  };
  const activeEndY = Math.max(18, Math.min(innerH - 8, sy(active.predict(118000)) - 10));

  return (
    <figure className="chart chart-scatter">
      <div className="chart-actions"><ChartExport filename="life-expectancy-scatter-2019" csv={csv} /></div>
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={summary} aria-describedby="scatter-data">
        <title>Life expectancy against GDP per capita, 2019</title>
        <desc>{summary} Each dot is a country. Tab enters the points; arrow keys move between countries and Enter selects one.</desc>
        <text x={0} y={16} className="chart-title">Life expectancy and income, 2019</text>
        <defs>
          <clipPath id="scatter-plot">
            <rect x={0} y={0} width={innerW} height={innerH} />
          </clipPath>
        </defs>
        <g transform={`translate(${M.l},${M.t})`}>
          <YAxisView scale={sy} ticks={[50, 60, 70, 80, 90]} label={Y_LABEL} />
          <XAxisView scale={sx} axis={xAxis} />
          <g clipPath="url(#scatter-plot)">
            <path d={band} fill={active.kind === 'log' ? 'var(--chart-log)' : 'var(--chart-linear)'} opacity={0.09} />
            {fits.map((f) => (
              <path
                key={f.fit.kind}
                d={path((x) => f.fit.predict(x))}
                fill="none"
                stroke={f.colour}
                strokeWidth={f.active ? 2.4 : 1.5}
                strokeOpacity={f.active ? 1 : 0.55}
                strokeDasharray={f.dash}
              />
            ))}
            <text x={innerW - 6} y={activeEndY} textAnchor="end" className="curve-label" fill={active.kind === 'log' ? 'var(--chart-log)' : 'var(--chart-linear)'}>
              {equation(active)}
            </text>
            {hoveredCountry && (
              <line x1={sx(hoveredCountry.gdp)} x2={sx(hoveredCountry.gdp)} y1={0} y2={innerH} stroke="var(--chart-muted)" strokeDasharray="2 3" pointerEvents="none" />
            )}
            {userPath && <path d={userPath} fill="none" stroke="var(--chart-user)" strokeWidth={2} strokeDasharray="2 4" />}
            {countries.map((c) => {
              const out = excluded.includes(c.iso3);
              const isSel = selected.includes(c.iso3);
              const cx = sx(c.gdp);
              const cy = sy(c.life);
              return (
                <g
                  key={c.iso3}
                  className="scatter-point"
                  data-point={c.iso3}
                  role="button"
                  tabIndex={c.iso3 === focusIso ? 0 : -1}
                  aria-pressed={isSel}
                  aria-label={`${c.name}: life expectancy ${c.life.toFixed(1)} years, GDP per capita ${Math.round(c.gdp).toLocaleString('en-GB')} dollars${isSel ? ', selected' : ''}`}
                  onClick={() => select(c.iso3)}
                  onPointerEnter={() => hover(c.iso3)}
                  onPointerLeave={() => hover(null)}
                  onFocus={() => { setFocusIso(c.iso3); hover(c.iso3); }}
                  onBlur={() => hover(null)}
                  onKeyDown={(event) => {
                    const index = countries.findIndex((country) => country.iso3 === c.iso3);
                    let next = -1;
                    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % countries.length;
                    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + countries.length) % countries.length;
                    else if (event.key === 'Home') next = 0;
                    else if (event.key === 'End') next = countries.length - 1;
                    if (next >= 0) {
                      const target = countries[next];
                      if (target) {
                        event.preventDefault();
                        focusPoint(target.iso3);
                      }
                    } else if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      select(c.iso3);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <title>{c.name}: {c.life.toFixed(1)} years, {Math.round(c.gdp).toLocaleString('en-GB')} dollars</title>
                  {isSel && (
                    <line x1={cx} x2={cx} y1={cy} y2={sy(active.predict(c.gdp))} stroke={active.kind === 'log' ? 'var(--chart-log)' : 'var(--chart-linear)'} strokeWidth={1.4} />
                  )}
                  <circle cx={cx} cy={cy} r={13} fill="transparent" />
                  <circle
                    cx={cx} cy={cy} r={isSel ? 6.5 : 4.5}
                    fill={out ? 'none' : lifeColour(lifeT(c.life))}
                    stroke={isSel ? 'var(--chart-thread)' : out ? 'var(--chart-muted)' : 'var(--chart-dot-ring)'}
                    strokeWidth={isSel ? 2 : out ? 1.2 : 0.9}
                    strokeDasharray={out ? '2 2' : undefined}
                  />
                  {(labelled.has(c.iso3) || hovered === c.iso3) && (
                    <text
                      x={cx > innerW - 62 ? cx - 9 : cx + 9}
                      y={cy < 96 ? cy + 16 : cy - 8}
                      textAnchor={cx > innerW - 62 ? 'end' : 'start'}
                      className="point-label"
                    >{c.name}</text>
                  )}
                </g>
              );
            })}
          </g>
          {hoveredCountry && (
            <g transform="translate(8,8)" pointerEvents="none">
              <rect width={176} height={46} rx={4} fill="var(--surface-0)" stroke="var(--line-2)" />
              <text x={8} y={16} className="point-label">{hoveredCountry.name}</text>
              <text x={8} y={33} className="tick" fill="var(--text-1)">{Math.round(hoveredCountry.gdp).toLocaleString('en-GB')} · {hoveredCountry.life.toFixed(1)} years</text>
            </g>
          )}
        </g>
      </svg>
      <ChartData
        caption="Life expectancy and GDP per capita, 2019"
        columns={['Country', 'ISO3', 'GDP per capita', 'Life expectancy']}
        rows={countries.map((c) => [c.name, c.iso3, Math.round(c.gdp), c.life.toFixed(3)])}
      />
      <span id="scatter-data" className="visually-hidden">The data table follows the chart.</span>
      <figcaption className="legend">
        <span className="legend-active"><i style={{ borderTop: `2px solid ${active.kind === 'log' ? 'var(--chart-log)' : 'var(--chart-linear)'}` }} />Active {active.kind === 'log' ? 'logarithmic' : 'straight-line'} model: {equation(active)}</span>
        {compareCurves && <span><i style={{ borderTop: `2px dashed ${other.kind === 'log' ? 'var(--chart-log)' : 'var(--chart-linear)'}` }} />Comparison: {equation(other)}</span>}
        {analysis.points.length < countries.length && <span>Dashed hollow dots are excluded from the fit.</span>}
        <span className="chart-source">Source: World Bank WDI 2019, {analysis.points.length} countries in the fit. Computed from the Appendix A rows.</span>
      </figcaption>
    </figure>
  );
}
