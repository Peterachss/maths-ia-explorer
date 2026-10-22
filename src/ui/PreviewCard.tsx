import { useEffect, useRef } from 'react';
import type { Country } from '../data/schema';
import type { Analysis } from '../math';
import { dollars, signed, years } from '../math';
import { useStore } from '../store';

const COORDINATES =
  'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/';

export function PreviewCard({ countries, analysis }: { countries: Country[]; analysis: Analysis }) {
  const { selected, hovered, excluded, selectionEvent } = useStore();
  const iso = hovered ?? selected[selected.length - 1];
  const c = countries.find((k) => k.iso3 === iso);
  const card = useRef<HTMLElement>(null);
  const lastEvent = useRef(selectionEvent);

  useEffect(() => {
    if (selectionEvent === lastEvent.current) return;
    lastEvent.current = selectionEvent;
    const node = card.current;
    if (!node || !selected.length) return;
    const mobile = window.matchMedia('(max-width: 1200px)').matches;
    const panel = node.closest<HTMLElement>('.panel');
    const frame = mobile ? null : panel?.getBoundingClientRect();
    const stage = mobile ? document.querySelector<HTMLElement>('.stage')?.getBoundingClientRect() : null;
    const box = node.getBoundingClientRect();
    const top = stage ? stage.bottom : frame?.top ?? 0;
    const bottom = frame?.bottom ?? window.innerHeight;
    if (box.top >= top + 8 && box.bottom <= bottom - 8) return;
    // On desktop, align the selection bar under the sticky index so the search
    // field cannot peek through as a clipped strip above the card. If the bar
    // is already in view but the card is not, fall back to the card itself.
    // (The card is itself a section, so walk up from its parent.)
    const host = node.parentElement?.closest<HTMLElement>('section');
    const bar = host?.querySelector<HTMLElement>('.selection');
    let target: HTMLElement = mobile || !bar ? node : bar;
    if (target !== node) {
      const tb = target.getBoundingClientRect();
      if (tb.top >= top + 8 && tb.bottom <= bottom - 8) target = node;
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }, [selectionEvent, selected.length]);

  if (!c) return null;
  const fit = analysis.better === 'log' ? analysis.log : analysis.linear;
  const pred = fit.predict(c.gdp);
  const res = c.life - pred;
  const rank = [...countries].sort((a, b) => b.life - a.life).findIndex((k) => k.iso3 === c.iso3) + 1;
  return (
    <section ref={card} className="preview" aria-label={`Preview: ${c.name}`}>
      <div className="preview-text">
        <div className="preview-head">
          <h3>{c.name}</h3>
          <span className="preview-coords">{Math.abs(c.lat).toFixed(1)}°{c.lat >= 0 ? 'N' : 'S'} {Math.abs(c.lon).toFixed(1)}°{c.lon >= 0 ? 'E' : 'W'}</span>
        </div>
        <dl>
          <dt>GDP per capita</dt><dd>{dollars(c.gdp)}</dd>
          <dt>Life expectancy</dt><dd>{years(c.life, 1)}</dd>
          <dt>Model value</dt><dd>{years(pred, 1)}</dd>
          <dt>Residual</dt><dd>{signed(res, 1)} years {res >= 0 ? 'above' : 'below'} the model</dd>
          <dt>Life expectancy rank</dt><dd>{rank} of {countries.length}</dd>
          <dt>Income group, today</dt><dd>{c.incomeGroup}</dd>
          <dt>Income group, 2019</dt><dd>{c.incomeGroup2019}</dd>
        </dl>
        {excluded.includes(c.iso3) && <p className="note">Excluded from the fit.</p>}
        <p className="preview-source">
          Each pillar is placed at the country&rsquo;s capital. Coordinates are approximate and come from{' '}
          <a href={COORDINATES} target="_blank" rel="noreferrer">Natural Earth Populated Places</a> (1:10m, public domain).
          Values: <a href={c.gdpSourceUrl} target="_blank" rel="noreferrer">GDP</a> and{' '}
          <a href={c.lifeSourceUrl} target="_blank" rel="noreferrer">life expectancy</a> (World Bank WDI, 2019).
        </p>
      </div>
    </section>
  );
}
