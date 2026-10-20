import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import type { Country } from '../data/schema';
import type { Analysis, Fit } from '../math';
import { lifeColour, lifeT, theme } from '../theme';
import { useStore } from '../store';
import { H, M, W, Y_LABEL, innerH, innerW, sampleX, xScale } from './common';
import { XAxisView, YAxisView } from './Axes';

const ALWAYS = ['ZWE', 'SGP', 'VNM'];

export interface UserCurve { a: number; b: number; kind: 'linear' | 'log'; }

export function Scatter({ countries, analysis, user }: { countries: Country[]; analysis: Analysis; user?: UserCurve }) {
  const { xAxis, modelShow, selected, excluded, select, hover, hovered } = useStore();
  const sx = xScale(xAxis);
  const sy = scaleLinear().domain([45, 90]).range([innerH, 0]);
  const xs = sampleX(xAxis);
  const path = (f: (x: number) => number) =>
    line<number>().x((x) => sx(x)).y((x) => sy(f(x)))(xs) ?? '';
  const fits: { fit: Fit; colour: string; dash?: string; label: string }[] = [];
  if (modelShow !== 'log') fits.push({ fit: analysis.linear, colour: theme.linear, dash: '7 5', label: 'Straight line' });
  if (modelShow !== 'linear') fits.push({ fit: analysis.log, colour: theme.log, label: 'Logarithmic' });
  const userPath = user ? path((x) => user.a * (user.kind === 'log' ? Math.log(x) : x) + user.b) : null;
  const labelled = new Set([...ALWAYS, ...selected]);
  const summary = `Scatter plot of life expectancy against GDP per capita for ${analysis.points.length} countries in 2019.`;

  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary}>
        <title>Life expectancy against GDP per capita, 2019</title>
        <desc>{summary} Each dot is a country. The curves are the fitted models.</desc>
        <text x={M.l} y={16} className="chart-title">Life expectancy against GDP per capita, 42 countries, 2019</text>
        <g transform={`translate(${M.l},${M.t})`}>
          <YAxisView scale={sy} ticks={[50, 60, 70, 80, 90]} label={Y_LABEL} />
          <XAxisView scale={sx} axis={xAxis} />
          {fits.map((f) => (
            <path key={f.fit.kind} d={path((x) => f.fit.predict(x))} fill="none" stroke={f.colour} strokeWidth={2.2} strokeDasharray={f.dash} />
          ))}
          {userPath && <path d={userPath} fill="none" stroke={theme.paper0} strokeWidth={2} strokeDasharray="2 4" />}
          {countries.map((c) => {
            const out = excluded.includes(c.iso3);
            const isSel = selected.includes(c.iso3);
            const cx = sx(c.gdp);
            const cy = sy(c.life);
            return (
              <g key={c.iso3} onClick={() => select(c.iso3)} onPointerEnter={() => hover(c.iso3)} onPointerLeave={() => hover(null)} style={{ cursor: 'pointer' }}>
                {isSel && fits.map((f) => (
                  <line key={f.fit.kind} x1={cx} x2={cx} y1={cy} y2={sy(f.fit.predict(c.gdp))} stroke={f.colour} strokeWidth={1.4} />
                ))}
                <circle cx={cx} cy={cy} r={13} fill="transparent" />
                <circle
                  cx={cx} cy={cy} r={isSel ? 6.5 : 4.5}
                  fill={out ? 'none' : lifeColour(lifeT(c.life))}
                  stroke={isSel ? theme.thread : out ? theme.paper1 : theme.ink0}
                  strokeWidth={isSel ? 2.2 : out ? 1.4 : 1}
                  strokeDasharray={out ? '2 2' : undefined}
                />
                {(labelled.has(c.iso3) || hovered === c.iso3) && (
                  <text
                    x={cx > innerW - 62 ? cx - 9 : cx + 9}
                    y={cy - 8}
                    textAnchor={cx > innerW - 62 ? 'end' : 'start'}
                    className="point-label"
                  >{c.name}</text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <figcaption className="legend">
        {fits.map((f) => (
          <span key={f.fit.kind}><i style={{ borderTop: `2px ${f.dash ? 'dashed' : 'solid'} ${f.colour}` }} />{f.label}: y = {f.fit.kind === 'log' ? `${f.fit.a.toFixed(3)} ln x + ${f.fit.b.toFixed(2)}` : `${f.fit.a.toFixed(6)} x + ${f.fit.b.toFixed(2)}`}</span>
        ))}
        {analysis.points.length < countries.length && <span>Dashed hollow dots are excluded from the fit.</span>}
      </figcaption>
    </figure>
  );
}
