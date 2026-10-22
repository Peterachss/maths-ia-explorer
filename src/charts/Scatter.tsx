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

export function Scatter({ countries, analysis, user }: { countries: Country[]; analysis: Analysis; user?: UserCurve }) {
  const { xAxis, modelShow, selected, excluded, select, hover, hovered } = useStore();
  const sx = xScale(xAxis);
  // The straight line predicts above 90 years at the top incomes, so leave headroom for it.
  const sy = scaleLinear().domain([45, 96]).range([innerH, 0]);
  const xs = sampleX(xAxis);
  const path = (f: (x: number) => number) =>
    line<number>().x((x) => sx(x)).y((x) => sy(f(x)))(xs) ?? '';
  const fits: { fit: Fit; colour: string; dash?: string; label: string }[] = [];
  if (modelShow !== 'log') fits.push({ fit: analysis.linear, colour: 'var(--chart-linear)', dash: '7 5', label: 'Straight line' });
  if (modelShow !== 'linear') fits.push({ fit: analysis.log, colour: 'var(--chart-log)', label: 'Logarithmic' });
  const userPath = user ? path((x) => user.a * (user.kind === 'log' ? Math.log(x) : x) + user.b) : null;
  // 95% confidence band for the mean response of the logarithmic model.
  const logFit = analysis.log;
  const ci = (x: number) => {
    const u = Math.log(x);
    return 1.96 * logFit.se * Math.sqrt(1 / logFit.n + ((u - logFit.meanU) ** 2) / logFit.sxx);
  };
  const band = area<number>()
    .x((x) => sx(x))
    .y0((x) => sy(logFit.predict(x) - ci(x)))
    .y1((x) => sy(logFit.predict(x) + ci(x)))(xs) ?? '';
  const hoveredCountry = countries.find((c) => c.iso3 === hovered);
  const labelled = new Set([...ALWAYS, ...selected]);
  const summary = `Scatter plot of life expectancy against GDP per capita for ${analysis.points.length} countries in 2019.`;
  const csv = ['country,iso3,gdp_pc_ppp_2019,life_exp_2019', ...countries.map((c) => `${JSON.stringify(c.name)},${c.iso3},${c.gdp},${c.life}`)].join('\n');

  return (
    <figure className="chart">
      <div className="chart-actions"><ChartExport filename="life-expectancy-scatter-2019" csv={csv} /></div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} aria-describedby="scatter-data">
        <title>Life expectancy against GDP per capita, 2019</title>
        <desc>{summary} Each dot is a country. The curves are the fitted models.</desc>
        <text x={M.l} y={16} className="chart-title">Life expectancy and income, 2019</text>
        <defs>
          <clipPath id="scatter-plot">
            <rect x={0} y={0} width={innerW} height={innerH} />
          </clipPath>
        </defs>
        <g transform={`translate(${M.l},${M.t})`}>
          <YAxisView scale={sy} ticks={[50, 60, 70, 80, 90]} label={Y_LABEL} />
          <XAxisView scale={sx} axis={xAxis} />
          <g clipPath="url(#scatter-plot)">
            {modelShow !== 'linear' && <path d={band} fill="var(--chart-log)" opacity={0.1} />}
            {fits.map((f) => (
              <g key={f.fit.kind}>
                <path d={path((x) => f.fit.predict(x))} fill="none" stroke={f.colour} strokeWidth={2.2} strokeDasharray={f.dash} />
                <text x={innerW - 6} y={Math.max(16, sy(f.fit.predict(125000)) - 9)} textAnchor="end" className="curve-label" fill={f.colour}>
                  {f.fit.kind === 'log' ? `y = ${f.fit.a.toFixed(3)} ln x + ${f.fit.b.toFixed(2)}` : `y = ${f.fit.a.toFixed(6)} x + ${f.fit.b.toFixed(2)}`}
                </text>
              </g>
            ))}
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
                  onClick={() => select(c.iso3)}
                  onPointerEnter={() => hover(c.iso3)}
                  onPointerLeave={() => hover(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <title>{c.name}: {c.life.toFixed(1)} years, {Math.round(c.gdp).toLocaleString('en-GB')} dollars</title>
                  {isSel && fits.map((f) => (
                    <line key={f.fit.kind} x1={cx} x2={cx} y1={cy} y2={sy(f.fit.predict(c.gdp))} stroke={f.colour} strokeWidth={1.4} />
                  ))}
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
              <rect width={168} height={44} rx={3} fill="var(--surface-0)" stroke="var(--line-2)" />
              <text x={7} y={15} className="point-label">{hoveredCountry.name}</text>
              <text x={7} y={31} className="tick" fill="var(--text-1)">{Math.round(hoveredCountry.gdp).toLocaleString('en-GB')} · {hoveredCountry.life.toFixed(1)} years</text>
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
        {fits.map((f) => (
          <span key={f.fit.kind}><i style={{ borderTop: `2px ${f.dash ? 'dashed' : 'solid'} ${f.colour}` }} />{f.label}: y = {f.fit.kind === 'log' ? `${f.fit.a.toFixed(3)} ln x + ${f.fit.b.toFixed(2)}` : `${f.fit.a.toFixed(6)} x + ${f.fit.b.toFixed(2)}`}</span>
        ))}
        {analysis.points.length < countries.length && <span>Dashed hollow dots are excluded from the fit.</span>}
        <span className="chart-source">Source: World Bank WDI 2019, 42 countries. Computed from the Appendix A rows.</span>
      </figcaption>
    </figure>
  );
}
