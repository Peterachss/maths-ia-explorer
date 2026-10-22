import { lazy, Suspense, useEffect, useRef } from 'react';
import type { Country } from '../data/schema';
import type { Analysis } from '../math';
import { dollars, signed, years } from '../math';
const PreviewPillar = lazy(() => import('../three/PreviewPillar').then((m) => ({ default: m.PreviewPillar })));
import { useStore } from '../store';

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
    const mobile = window.matchMedia('(max-width: 860px)').matches;
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
      <div className="preview-3d"><Suspense fallback={null}><PreviewPillar life={c.life} lat={c.lat} lon={c.lon} /></Suspense></div>
      <div className="preview-text">
        <h3>{c.name}</h3>
        <dl>
          <dt>GDP per capita</dt><dd>{dollars(c.gdp)}</dd>
          <dt>Life expectancy</dt><dd>{years(c.life, 1)}</dd>
          <dt>Model value</dt><dd>{years(pred, 1)}</dd>
          <dt>Residual</dt><dd>{signed(res, 1)} years {res >= 0 ? 'above' : 'below'} the model</dd>
          <dt>Life expectancy rank</dt><dd>{rank} of {countries.length}</dd>
          <dt>Income group</dt><dd>{c.incomeGroup}</dd>
        </dl>
        {excluded.includes(c.iso3) && <p className="note">Excluded from the fit.</p>}
      </div>
    </section>
  );
}
