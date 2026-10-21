import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { Box, ChevronDown, Earth as EarthIcon, Globe2 } from 'lucide-react';
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
import { MapChrome } from './ui/MapChrome';
import { prefersReducedMotion } from './reducedMotion';
import type { ViewCommand } from './three/view';

const Stage = lazy(() => import('./three/Stage').then((m) => ({ default: m.Stage })));
const ModelStage = lazy(() => import('./three/ModelStage').then((m) => ({ default: m.ModelStage })));

/** When a section scrolls into view, fly the camera to the countries it is about. */
function useStoryFocus(ready: boolean) {
  const flyTo = useStore((s) => s.flyTo);
  const setActiveSection = useStore((s) => s.setActiveSection);
  useEffect(() => {
    if (!ready) return;
    const els = document.querySelectorAll<HTMLElement>('[data-focus]');
    // On a phone the map owns the top half, so read the section band below it.
    const mobile = window.matchMedia('(max-width: 860px)').matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const section = e.target as HTMLElement;
          flyTo((section.dataset.focus ?? '').split(',').filter(Boolean));
        }
      },
      { rootMargin: mobile ? '-52% 0px -10% 0px' : '-45% 0px -45% 0px' }
    );
    els.forEach((el) => io.observe(el));

    // The section index follows the heading nearest the top of the reading area,
    // not the last section that happens to enter the observer band. Short
    // sections such as Gap were otherwise overtaken by the next heading.
    const panel = document.querySelector<HTMLElement>('.panel');
    const navSections = [...els].filter((el) =>
      copy.nav.some((item) => item.id === el.getAttribute('aria-labelledby'))
    );
    let frame = 0;
    const update = () => {
      frame = 0;
      const isMobile = window.matchMedia('(max-width: 860px)').matches;
      const panelTop = panel?.getBoundingClientRect().top ?? 0;
      const cutoff = isMobile
        ? window.innerHeight * 0.52 + 40
        : panelTop + (panel?.clientHeight ?? window.innerHeight) * 0.2;
      let current: HTMLElement | null = null;
      for (const section of navSections) {
        if (section.getBoundingClientRect().top <= cutoff) current = section;
      }
      const id = current?.getAttribute('aria-labelledby') ?? copy.nav[0]?.id;
      if (id) setActiveSection(id);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    panel?.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      panel?.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ready, flyTo, setActiveSection]);
}

/** A slim report index. It sits under the header, then sticks while the analysis scrolls. */
function SectionNav() {
  const active = useStore((s) => s.activeSection);
  const setActiveSection = useStore((s) => s.setActiveSection);
  const go = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };
  return (
    <>
      <nav className="section-nav" aria-label="Report sections">
        {copy.nav.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={active === item.id ? 'true' : undefined}
            onClick={() => go(item.id)}
          >{item.label}</button>
        ))}
      </nav>
      <div className="section-jump">
        <label htmlFor="section-jump">Section</label>
        <select id="section-jump" value={active} onChange={(e) => go(e.target.value)}>
          {copy.nav.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
      </div>
    </>
  );
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
  const view = useRef<ViewCommand>({ zoom: null });
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

  useStoryFocus(Boolean(countries && analysis && bowl));

  if (error) return <div className="boot" role="alert"><p className="fatal">{error}</p></div>;
  if (!countries || !analysis || !bowl) {
    return (
      <div className="boot" role="status">
        <span className="brand-mark"><EarthIcon size={18} strokeWidth={1.6} aria-hidden="true" /></span>
        <p className="boot-title">{copy.title}</p>
        <i className="load-line" aria-hidden="true" />
        <p className="note">Loading the 2019 data</p>
      </div>
    );
  }
  const g = analysis.gap;
  const fit = analysis.better === 'log' ? analysis.log : analysis.linear;
  const user = stage === 'model' ? { a, b: c - a * bowl.ubar, kind: bowlKind } : undefined;

  return (
    <div className="app">
      <Live />
      <div className="stage" aria-label="3D view">
        <div className="stage-tabs" role="tablist" aria-label="3D view">
          <button role="tab" aria-selected={stage === 'globe'} onClick={() => setStage('globe')}>
            <Globe2 size={15} strokeWidth={1.8} aria-hidden="true" />
            {copy.controls.globe}
          </button>
          <button role="tab" aria-selected={stage === 'model'} onClick={() => setStage('model')}>
            <Box size={15} strokeWidth={1.8} aria-hidden="true" />
            {copy.controls.bowl}
          </button>
        </div>
        <div className="stage-meta" aria-hidden="true">
          <span>2019</span><i /><span>42 countries</span>
        </div>
        {gl ? (
          <Suspense fallback={<div className="stage-loading" role="status"><span>{stage === 'globe' ? 'Loading the globe' : 'Loading the bowl'}</span><i className="load-line" aria-hidden="true" /></div>}>
            {stage === 'globe' ? <Stage countries={countries} analysis={analysis} view={view} /> : <ModelStage bowl={bowl} a={a} c={c} />}
          </Suspense>
        ) : (
          <div className="stage-fallback" role="alert"><p>{copy.errors.webgl}</p></div>
        )}
        {stage === 'globe' && gl && (
          <MapChrome view={view} onReset={() => useStore.getState().flyTo(['ZWE', 'SGP'])} />
        )}
        {stage === 'model' && <BowlControls bowl={bowl} a={a} c={c} setA={setBowlA} setC={setBowlC} kind={bowlKind} />}
      </div>

      <aside className="panel">
        <header>
          <div className="brand">
            <span className="brand-mark"><EarthIcon size={18} strokeWidth={1.6} aria-hidden="true" /></span>
            <p className="eyebrow">{copy.brand}</p>
          </div>
          <h1>{copy.title}</h1>
          <p className="lede">{copy.subtitle}</p>
        </header>

        <SectionNav />

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

        <section data-focus="" aria-labelledby="h-limits">
          <h2 id="h-limits">{copy.limits.heading}</h2>
          <ul className="plain">{copy.limits.items.map((t) => <li key={t}>{t}</li>)}</ul>
          <h3>Sources</h3>
          <ul className="plain">{copy.sources.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="note">{copy.imagery}</p>
          <p className="note">This explorer was built with AI assistance as a companion to the IA. The data, the IA and its argument are the student's own work.</p>
        </section>

        <section data-focus="" aria-labelledby="h-work">
          <h2 id="h-work">Working</h2>
          <button type="button" className="btn disclosure" aria-expanded={working} aria-controls="working" onClick={() => setWorking(!working)}>
            <span>{working ? copy.controls.hideWorking : copy.controls.showWorking}</span>
            <ChevronDown size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
          <div id="working" hidden={!working}>{working && <Working analysis={analysis} />}</div>
        </section>
      </aside>
      <AccessibleData countries={countries} analysis={analysis} />
    </div>
  );
}
