import type { Country } from '../data/schema';
import type { Analysis } from '../math';
import { dollars, signed, years } from '../math';
import { useStore } from '../store';

const COORDINATES =
  'https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/';

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
