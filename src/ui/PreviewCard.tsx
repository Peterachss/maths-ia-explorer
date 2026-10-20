import { lazy, Suspense } from 'react';
import type { Country } from '../data/schema';
import type { Analysis } from '../math';
import { dollars, signed, years } from '../math';
const PreviewPillar = lazy(() => import('../three/PreviewPillar').then((m) => ({ default: m.PreviewPillar })));
import { useStore } from '../store';

export function PreviewCard({ countries, analysis }: { countries: Country[]; analysis: Analysis }) {
  const { selected, hovered, excluded } = useStore();
  const iso = hovered ?? selected[selected.length - 1];
  const c = countries.find((k) => k.iso3 === iso);
  if (!c) return null;
  const fit = analysis.better === 'log' ? analysis.log : analysis.linear;
  const pred = fit.predict(c.gdp);
  const res = c.life - pred;
  const rank = [...countries].sort((a, b) => b.life - a.life).findIndex((k) => k.iso3 === c.iso3) + 1;
  return (
    <section className="preview" aria-label={`Preview: ${c.name}`}>
      <div className="preview-3d"><Suspense fallback={null}><PreviewPillar life={c.life} /></Suspense></div>
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
