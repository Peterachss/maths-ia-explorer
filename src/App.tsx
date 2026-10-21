import { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import type { Country } from './data/schema';
import { loadCountries } from './data/load';
import { analyse, dollars, num, percent, type Point } from './math';
import { syncUrl, useStore } from './store';
import { copy } from './copy';
import { webglAvailable } from './webgl';
import { makeBowl } from './math/bowl';
import { Scatter } from './charts/Scatter';
import { Residuals } from './charts/Residuals';
import { GapChart } from './charts/GapChart';
import { DerivativeChart } from './charts/DerivativeChart';
import { InverseChart } from './charts/InverseChart';
import { GroupBoxes } from './charts/GroupBoxes';
import { SearchBox, SelectionBar, ModelToggles } from './ui/Controls';
import { PreviewCard } from './ui/PreviewCard';
import { AccessibleData, FitTable, SummaryTable } from './ui/Tables';
import { BowlControls, ChangeTool, SensitivityPanel } from './ui/Tools';
import { Working } from './ui/Working';

const Stage = lazy(() => import('./three/Stage').then((m) => ({ default: m.Stage })));
const ModelStage = lazy(() => import('./three/ModelStage').then((m) => ({ default: m.ModelStage })));

/** When a section scrolls into view, fly the camera to the countries it is about. */
function useStoryFocus() {
  const flyTo = useStore((s) => s.flyTo);
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-focus]');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) flyTo((e.target as HTMLElement).dataset.focus!.split(',').filter(Boolean));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [flyTo]);
}

function Live() {
  const msg = useStore((s) => s.announce);
  return <div className="visually-hidden" aria-live="polite" role="status">{msg}</div>;
}

export function App() {
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gl] = useState(webglAvailable);
  const [working, setWorking] = useState(false);
  const { stage, setStage, excluded } = useStore();

  useEffect(() => {
    const stopUrlSync = syncUrl();
    loadCountries().then(setCountries).catch(() => setError(copy.errors.data));
    return stopUrlSync;
  }, []);
  const points = useMemo<Point[]>(() => (countries ?? []).map((c) => ({ iso3: c.iso3, name: c.name, x: c.gdp, y: c.life })), [countries]);
  const analysis = useMemo(() => (points.length ? analyse(points, new Set(excluded)) : null), [points, excluded]);

  // the bowl
  const bowlKind = analysis?.better ?? 'log';
  const bowl = useMemo(() => {
    if (!analysis) return null;
    const fit = bowlKind === 'log' ? analysis.log : analysis.linear;
    return makeBowl(analysis.points, bowlKind, fit.a, fit.meanY);
  }, [analysis, bowlKind]);
  const [bowlA, setBowlA] = useState<number | null>(null);
  const [bowlC, setBowlC] = useState<number | null>(null);
  const a = bowlA ?? bowl?.a0 ?? 0;
  const c = bowlC ?? bowl?.c0 ?? 0;

  useStoryFocus();

  if (error) return <p role="alert" className="fatal">{error}</p>;
  if (!countries || !analysis || !bowl) return <p className="fatal" role="status">Loading the data</p>;
  const g = analysis.gap;
  const fit = analysis.better === 'log' ? analysis.log : analysis.linear;
  const user = stage === 'model' ? { a, b: c - a * bowl.ubar, kind: bowlKind } : undefined;

  return (
    <div className="app">
      <Live />
      <div className="stage" aria-label="3D view">
        <div className="stage-tabs" role="tablist" aria-label="3D view">
          <button role="tab" aria-selected={stage === 'globe'} onClick={() => setStage('globe')}>{copy.controls.globe}</button>
          <button role="tab" aria-selected={stage === 'model'} onClick={() => setStage('model')}>{copy.controls.bowl}</button>
        </div>
        {gl ? (
          <Suspense fallback={<p className="fatal" role="status">Loading 3D view</p>}>
            {stage === 'globe' ? <Stage countries={countries} analysis={analysis} /> : <ModelStage bowl={bowl} a={a} c={c} />}
          </Suspense>
        ) : (
          <p className="fatal" role="alert">{copy.errors.webgl}</p>
        )}
        {stage === 'model' && <BowlControls bowl={bowl} a={a} c={c} setA={setBowlA} setC={setBowlC} kind={bowlKind} />}
      </div>

      <aside className="panel">
        <header>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </header>

        <section data-focus="ZWE,SGP" aria-labelledby="h-two">
          <h2 id="h-two">Two places</h2>
          {g && (
            <p>
              In 2019 life expectancy at birth was {num(g.high.y, 1)} years in Singapore and {num(g.low.y, 1)} in Zimbabwe, {num(g.observedGap, 1)} years apart.
              Singapore's GDP per capita was {num(g.high.x / g.low.x, 0)} times larger ({dollars(g.high.x)} against {dollars(g.low.x)}).
            </p>
          )}
          <SearchBox countries={countries} />
          <SelectionBar countries={countries} />
          <PreviewCard countries={countries} analysis={analysis} />
        </section>

        <section data-focus="" aria-labelledby="h-sample">
          <h2 id="h-sample">A sample of {analysis.points.length}</h2>
          <p>Each pillar's height is life expectancy. Each dot on the chart is a country's income and life expectancy. Mean income is far above the median, so income is skewed to the right.</p>
          <SummaryTable analysis={analysis} />
          <GroupBoxes countries={countries} />
        </section>

        <section data-focus="" aria-labelledby="h-models">
          <h2 id="h-models">Two models</h2>
          <p>The straight line adds the same years for every extra dollar. The logarithmic model assumes extra dollars matter less as income rises. Switch the horizontal axis to a log scale and the logarithmic curve becomes a straight line.</p>
          <ModelToggles />
          <Scatter countries={countries} analysis={analysis} user={user} />
          <FitTable analysis={analysis} />
          <p>The {analysis.better === 'log' ? 'logarithmic' : 'straight line'} model fits better: it explains {percent(fit.r2 * 100, 1)} of the variation in life expectancy, with residual standard error {num(fit.se, 2)} years.</p>
          <Residuals countries={countries} analysis={analysis} model="linear" />
          <Residuals countries={countries} analysis={analysis} model="log" />
        </section>

        <section data-focus="ZWE,SGP" aria-labelledby="h-gap">
          <h2 id="h-gap">The gap</h2>
          <GapChart analysis={analysis} />
        </section>

        <section data-focus="ZWE,SGP,VNM" aria-labelledby="h-rate">
          <h2 id="h-rate">Rate of change</h2>
          {g && <p>At Zimbabwe's income one extra $1,000 goes with about {num(g.per1000Low, 2)} years. At Singapore's, about {num(g.per1000High, 3)}. The ratio is {num(g.slopeRatio, 1)}, exactly the ratio of the two incomes.</p>}
          <DerivativeChart analysis={analysis} />
          <ChangeTool analysis={analysis} />
        </section>

        <section data-focus="ZWE,SGP" aria-labelledby="h-inv">
          <h2 id="h-inv">What income would match?</h2>
          <InverseChart analysis={analysis} />
        </section>

        <section data-focus="NGA,TCD" aria-labelledby="h-sens">
          <h2 id="h-sens">How sensitive is it?</h2>
          <SensitivityPanel countries={countries} points={points} />
        </section>

        <section aria-labelledby="h-limits">
          <h2 id="h-limits">{copy.limits.heading}</h2>
          <ul className="plain">{copy.limits.items.map((t) => <li key={t}>{t}</li>)}</ul>
          <h3>Sources</h3>
          <ul className="plain">{copy.sources.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="note">This explorer was built with AI assistance as a companion to the IA. The data, the IA and its argument are the student's own work.</p>
        </section>

        <section aria-labelledby="h-work">
          <h2 id="h-work">Working</h2>
          <button type="button" className="btn" aria-expanded={working} onClick={() => setWorking(!working)}>
            {working ? copy.controls.hideWorking : copy.controls.showWorking}
          </button>
          {working && <Working analysis={analysis} />}
        </section>
      </aside>
      <AccessibleData countries={countries} analysis={analysis} />
    </div>
  );
}
