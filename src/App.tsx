import { Fragment, useEffect, useMemo, useRef, useState, lazy, Suspense, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import {
  Box,
  ChevronDown,
  ChevronRight,
  Earth as EarthIcon,
  Globe2
} from 'lucide-react';
import type { Country } from './data/schema';
import { loadCountries } from './data/load';
import { analyse, dollars, num, percent, type Analysis, type Fit, type Point } from './math';
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
import { SensitivityChart } from './charts/SensitivityChart';
import { SearchBox, SelectionBar, ModelToggles } from './ui/Controls';
import { PreviewCard } from './ui/PreviewCard';
import { AccessibleData, CountryTable, FitTable, SummaryTable } from './ui/Tables';
import { BowlControls, ChangeTool, SensitivityPanel } from './ui/Tools';
import { Working } from './ui/Working';
import { MapChrome } from './ui/MapChrome';
import { prefersReducedMotion } from './reducedMotion';
import type { ViewCommand } from './three/view';

const Stage = lazy(() => import('./three/Stage').then((m) => ({ default: m.Stage })));
const ModelStage = lazy(() => import('./three/ModelStage').then((m) => ({ default: m.ModelStage })));

const CHAPTER_BY_ID = Object.fromEntries(copy.chapters.map((c) => [c.id, c]));
const NAV_GROUPS = copy.chapters;
const SENSITIVITY_EXCLUDED = ['NGA', 'TCD'];

const PANEL_MIN = 600;
const PANEL_MAX = 800;
const panelWidthForViewport = () =>
  typeof window === 'undefined' ? 760 : Math.min(PANEL_MAX, Math.max(PANEL_MIN, Math.round(window.innerWidth * 0.53)));
const clampPanel = (value: number) => Math.min(PANEL_MAX, Math.max(PANEL_MIN, Math.round(value)));

const fitOf = (analysis: Analysis): Fit => (analysis.model === 'log' ? analysis.log : analysis.linear);
const otherFitOf = (analysis: Analysis): Fit => (analysis.model === 'log' ? analysis.linear : analysis.log);
const modelWord = (model: 'linear' | 'log', capital = false) => {
  const word = model === 'log' ? 'logarithmic' : 'straight-line';
  return capital ? `${word[0]!.toUpperCase()}${word.slice(1)}` : word;
};
const equation = (fit: Fit) =>
  fit.kind === 'log'
    ? `y = ${fit.a.toFixed(3)} ln x + ${fit.b.toFixed(2)}`
    : `y = ${fit.a.toFixed(6)} x + ${fit.b.toFixed(2)}`;

function Citation({ n }: { n: number }) {
  return (
    <sup className="citation">
      <a href={`#ref-${n}`} aria-label={`Reference ${n}`}>[{n}]</a>
    </sup>
  );
}

function Question({ children }: { children: ReactNode }) {
  return <p className="section-question"><span>Question</span> {children}</p>;
}

function KeyResult({ value, unit, source = 'computed' }: { value: string; unit?: string; source?: string }) {
  return (
    <div className="key-result">
      <span className="key-result-label">Key result</span>
      <strong>{value}</strong>{unit && <span className="key-result-unit">{unit}</span>}
      <span className="key-result-source">[{source}]</span>
    </div>
  );
}

function WhatThisMeans({ children }: { children: ReactNode }) {
  return <div className="what-means"><span>What this means</span>{children}</div>;
}

function Calc({ children }: { children: ReactNode }) {
  return (
    <details className="calc">
      <summary>How it&rsquo;s calculated</summary>
      <div>{children}</div>
    </details>
  );
}

function Caveat({ children }: { children: ReactNode }) {
  return <p className="callout"><strong>Caveat</strong> {children}</p>;
}

const GLOSSARY = [
  ['Residual', 'Observed value minus the value predicted by the model, in years.'],
  ['SSE', 'Sum of squared errors: the sum of every residual squared. Least squares chooses the line that makes this smallest.'],
  ['r²', 'The proportion of the variation in life expectancy explained by the model. 1 is a perfect fit; 0 explains nothing.'],
  ['Interpolation', 'A prediction inside the observed range of incomes.'],
  ['Extrapolation', 'A prediction outside the observed range of incomes. It is less reliable.'],
  ['PPP', 'Purchasing power parity: incomes adjusted so that a dollar buys a comparable basket of goods in each country.'],
  ['Residual standard error', 'The typical size of a residual, in years: the square root of SSE divided by n − 2.'],
  ['Least squares', 'The method that chooses model coefficients by minimising the sum of squared residuals.']
] as const;

/** When a section scrolls into view, fly the camera to the countries it is about. */
function useStoryFocus(ready: boolean) {
  const flyTo = useStore((s) => s.flyTo);
  const setActiveSection = useStore((s) => s.setActiveSection);
  useEffect(() => {
    if (!ready) return;
    const els = document.querySelectorAll<HTMLElement>('[data-focus]');
    const stacked = window.matchMedia('(max-width: 1200px)').matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const section = e.target as HTMLElement;
          flyTo((section.dataset.focus ?? '').split(',').filter(Boolean));
        }
      },
      { rootMargin: stacked ? '-40% 0px -18% 0px' : '-40% 0px -40% 0px' }
    );
    els.forEach((el) => io.observe(el));

    const scroller = document.querySelector<HTMLElement>('.panel-scroll');
    const stage = document.querySelector<HTMLElement>('.stage');
    const contentsBar = document.querySelector<HTMLElement>('.section-jump');
    const navSections = [...document.querySelectorAll<HTMLElement>('[data-focus], [data-nav-id]')].filter((el) =>
      el.dataset.navId || copy.nav.some((item) => item.id === el.getAttribute('aria-labelledby'))
    );
    let frame = 0;
    const update = () => {
      frame = 0;
      const isStacked = window.matchMedia('(max-width: 1200px)').matches;
      const scrollerTop = scroller?.getBoundingClientRect().top ?? 0;
      // In the stacked layout the reading area starts below the sticky stage and
      // contents bar. Using a fraction of the viewport put the cutoff above that
      // boundary on tablets, so a visible chapter heading still read as the
      // previous chapter.
      const cutoff = isStacked
        ? (stage?.getBoundingClientRect().bottom ?? window.innerHeight * 0.4) +
          (contentsBar?.getBoundingClientRect().height ?? 0) +
          12
        : scrollerTop + (scroller?.clientHeight ?? window.innerHeight) * 0.16;
      let current: HTMLElement | null = null;
      for (const section of navSections) {
        if (section.getBoundingClientRect().top <= cutoff) current = section;
      }
      const id = current?.dataset.navId ?? current?.getAttribute('aria-labelledby') ?? copy.nav[0]?.id;
      if (id) setActiveSection(id);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    scroller?.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      scroller?.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ready, flyTo, setActiveSection]);
}

function useSectionGo() {
  const setActiveSection = useStore((s) => s.setActiveSection);
  return (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };
}

/** A typographic table of contents for one report, not an app switcher. */
function SectionRail() {
  const active = useStore((s) => s.activeSection);
  const go = useSectionGo();
  return (
    <nav className="rail" aria-label="Report contents">
      <div className="rail-head">
        <span className="rail-mark" aria-hidden="true">19</span>
        <div>
          <p className="rail-label">Contents</p>
          <p className="rail-sub">World Bank survey</p>
        </div>
      </div>
      <div className="rail-nav">
        {copy.chapters.map((chapter) => (
          <Fragment key={chapter.id}>
            <p className="rail-group"><span>{chapter.no}</span> {chapter.title}</p>
            {copy.nav.filter((item) => item.chapter === chapter.id).map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={active === item.id ? 'true' : undefined}
                onClick={() => go(item.id)}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </Fragment>
        ))}
      </div>
      <div className="rail-foot">
        <p>World Bank WDI<br />2019 · 42 countries</p>
        <a href={`${import.meta.env.BASE_URL}data/sample42.csv`} download="sample42.csv">Download CSV</a>
      </div>
    </nav>
  );
}

/** The phone and tablet fallback for the contents rail. */
function SectionJump() {
  const active = useStore((s) => s.activeSection);
  const go = useSectionGo();
  return (
    <div className="section-jump">
      <label htmlFor="section-jump">Contents</label>
      <select id="section-jump" value={active} onChange={(e) => go(e.target.value)} aria-label="Section">
        {NAV_GROUPS.map((group) => (
          <optgroup key={group.id} label={`${group.no} ${group.title}`}>
            {copy.nav.filter((item) => item.chapter === group.id).map((item) => (
              <option key={item.id} value={item.id}>{group.no} {group.title} · {item.label}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <ChevronDown size={15} strokeWidth={1.8} aria-hidden="true" />
    </div>
  );
}

function Live() {
  const msg = useStore((s) => s.announce);
  return <div className="visually-hidden" aria-live="polite" role="status">{msg}</div>;
}

/** The gap ruler translates the globe's coral arc into the dashboard: two lives on one scale. */
function GapRuler({ low, high, gap }: { low: { name: string; y: number; x: number }; high: { name: string; y: number; x: number }; gap: number }) {
  const scale = (v: number) => Math.min(100, Math.max(0, ((v - 50) / 40) * 100));
  const left = scale(low.y);
  const right = scale(high.y);
  return (
    <figure
      className="gap-ruler"
      aria-label={`In 2019 life expectancy was ${num(low.y, 1)} years in ${low.name} and ${num(high.y, 1)} years in ${high.name}, a gap of ${num(gap, 1)} years. GDP per capita was ${dollars(low.x)} and ${dollars(high.x)}.`}
    >
      <div className="gap-ruler-head">
        <div className="gap-end">
          <span className="gap-end-name">{low.name}</span>
          <span className="gap-end-value">{num(low.y, 1)}<span> yrs</span></span>
        </div>
        <p className="gap-figure">{num(gap, 1)}<span>years apart</span></p>
        <div className="gap-end gap-end--right">
          <span className="gap-end-name">{high.name}</span>
          <span className="gap-end-value">{num(high.y, 1)}<span> yrs</span></span>
        </div>
      </div>
      <div className="gap-track" aria-hidden="true">
        <span className="gap-fill" style={{ left: `${left}%`, width: `${right - left}%` }} />
        <span className="gap-dot" style={{ left: `${left}%` }} />
        <span className="gap-dot" style={{ left: `${right}%` }} />
      </div>
      <div className="gap-gdp" aria-hidden="true">
        <span>{dollars(low.x)}</span>
        <span>{dollars(high.x)}</span>
      </div>
    </figure>
  );
}

function KpiStrip({ analysis }: { analysis: Analysis }) {
  const fit = fitOf(analysis);
  const other = otherFitOf(analysis);
  const g = analysis.gap;
  const over = g ? g.percentReproduced > 100 : false;
  return (
    <dl className="kpi-strip" aria-label="Summary of the sample and the fit">
      <div className="kpi">
        <dt>Countries</dt>
        <dd className="kpi-value">{analysis.points.length}</dd>
        <dd className="kpi-sub">2019 sample</dd>
      </div>
      <div className="kpi">
        <dt>Median life expectancy</dt>
        <dd className="kpi-value">{num(analysis.ySummary.median, 1)}<span> yrs</span></dd>
        <dd className="kpi-sub">Range {num(analysis.ySummary.min, 1)}–{num(analysis.ySummary.max, 1)}</dd>
      </div>
      <div className="kpi">
        <dt>{modelWord(analysis.model, true)} model</dt>
        <dd className="kpi-value">{num(fit.r2, 2)}<span> R²</span></dd>
        <dd className="kpi-sub">{modelWord(other.kind, true)} {num(other.r2, 2)}</dd>
      </div>
      <div className="kpi">
        <dt>Gap reproduced</dt>
        <dd className="kpi-value">{g ? `${num(g.percentReproduced, 1)}` : 'n/a'}{g && <span>%</span>}</dd>
        <dd className="kpi-sub">{g ? (over ? `${num(g.predictedGap, 1)} yrs predicted vs ${num(g.observedGap, 1)} observed` : `${num(g.predictedGap, 1)} of ${num(g.observedGap, 1)} yrs`) : 'Zimbabwe or Singapore excluded'}</dd>
      </div>
    </dl>
  );
}

export function App() {
  const [countries, setCountries] = useState<Country[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gl] = useState(webglAvailable);
  const [working, setWorking] = useState(false);
  const [mount3d, setMount3d] = useState(false);
  const [panelW, setPanelW] = useState(panelWidthForViewport);
  const panelDrag = useRef<{ x: number; width: number } | null>(null);
  const view = useRef<ViewCommand>({ zoom: null });
  const { stage, setStage, excluded, selected, model } = useStore();

  const startPanelResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    panelDrag.current = { x: event.clientX, width: panelW };
    document.body.classList.add('resizing-panel');
  };
  const movePanelResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!panelDrag.current) return;
    setPanelW(clampPanel(panelDrag.current.width + panelDrag.current.x - event.clientX));
  };
  const stopPanelResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    panelDrag.current = null;
    document.body.classList.remove('resizing-panel');
  };
  const keyPanelResize = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 48 : 24;
    if (event.key === 'ArrowLeft') { event.preventDefault(); setPanelW((w) => clampPanel(w + step)); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); setPanelW((w) => clampPanel(w - step)); }
    else if (event.key === 'Home') { event.preventDefault(); setPanelW(PANEL_MIN); }
    else if (event.key === 'End') { event.preventDefault(); setPanelW(PANEL_MAX); }
  };

  useEffect(() => {
    const stopUrlSync = syncUrl();
    loadCountries().then(setCountries).catch(() => setError(copy.errors.data));
    return stopUrlSync;
  }, []);
  useEffect(() => {
    let cancel = () => {};
    const mount = () => setMount3d(true);
    // Phones keep the Blue Marble poster until the reader asks for WebGL: the
    // scene costs several seconds of main-thread work on a mid-range device,
    // and the report must stay scrollable first. Tablets and desktops mount it
    // when the main thread is actually free, not on a fixed timer.
    if (window.matchMedia('(max-width: 900px)').matches) return;
    const start = () => {
      if ('requestIdleCallback' in window) {
        const id = window.requestIdleCallback(mount, { timeout: 6000 });
        cancel = () => window.cancelIdleCallback(id);
      } else {
        const id = globalThis.setTimeout(mount, 5000);
        cancel = () => globalThis.clearTimeout(id);
      }
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      cancel();
    };
  }, []);

  const points = useMemo<Point[]>(() => (countries ?? []).map((c) => ({ iso3: c.iso3, name: c.name, x: c.gdp, y: c.life })), [countries]);
  const analysis = useMemo(() => (points.length ? analyse(points, new Set(excluded), model) : null), [points, excluded, model]);
  const baseAll = useMemo(() => (points.length ? analyse(points, new Set(), model) : null), [points, model]);
  const withoutTwo = useMemo(() => (points.length ? analyse(points, new Set(SENSITIVITY_EXCLUDED), model) : null), [points, model]);

  const bowlKind = analysis?.model ?? 'log';
  const bowl = useMemo(() => {
    if (!analysis) return null;
    const fit = fitOf(analysis);
    return makeBowl(analysis.points, bowlKind, fit.a, fit.meanY);
  }, [analysis, bowlKind]);
  const [bowlA, setBowlA] = useState<number | null>(null);
  const [bowlC, setBowlC] = useState<number | null>(null);
  const a = bowlA ?? bowl?.a0 ?? 0;
  const c = bowlC ?? bowl?.c0 ?? 0;

  useStoryFocus(Boolean(countries && analysis && bowl));
  const go = useSectionGo();

  if (error) return <div className="boot" role="alert"><p className="fatal">{error}</p></div>;
  if (!countries || !analysis || !bowl || !baseAll || !withoutTwo) {
    return (
      <div className="boot" role="status">
        <span className="brand-mark"><EarthIcon size={20} strokeWidth={1.5} aria-hidden="true" /></span>
        <p className="boot-kicker">Maths AA SL · Internal Assessment</p>
        <p className="boot-title">{copy.title}</p>
        <i className="load-line" aria-hidden="true" />
        <p className="note">Loading the 2019 data</p>
      </div>
    );
  }
  const g = analysis.gap;
  const fit = fitOf(analysis);
  const other = otherFitOf(analysis);
  const user = stage === 'model' ? { a, b: c - a * bowl.ubar, kind: bowlKind } : undefined;
  const activeWord = modelWord(analysis.model);
  const betterWord = modelWord(analysis.better);
  const gapOvershoot = g ? g.percentReproduced > 100 : false;
  const headline = g
    ? `In 2019, the ${activeWord} model explains ${num(fit.r2 * 100, 1)}% of the variation in life expectancy across these ${analysis.points.length} countries. The ${modelWord(other.kind)} model explains ${num(other.r2 * 100, 1)}%. The active model ${gapOvershoot ? `predicts a gap ${num(g.predictedGap - g.observedGap, 1)} years wider than` : `reproduces ${num(g.predictedGap, 1)} of`} the observed ${num(g.observedGap, 1)}-year gap between Zimbabwe and Singapore.`
    : `In 2019, the ${activeWord} model explains ${num(fit.r2 * 100, 1)}% of the variation in life expectancy across these ${analysis.points.length} countries. Add Zimbabwe and Singapore to compare the gap.`;

  return (
    <div className="app" data-stage={stage} style={{ '--panel-w': `${panelW}px` } as CSSProperties}>
      <a className="skip-link" href="#main-content">Skip to the analysis</a>
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
          <span>2019</span><i /><span>{analysis.points.length} countries</span>
        </div>
        {gl && mount3d ? (
          <Suspense fallback={<div className="stage-loading" role="status"><span>{stage === 'globe' ? 'Loading the globe' : 'Loading the bowl'}</span><i className="load-line" aria-hidden="true" /></div>}>
            {stage === 'globe' ? <Stage countries={countries} analysis={analysis} view={view} /> : <ModelStage bowl={bowl} a={a} c={c} />}
          </Suspense>
        ) : gl ? (
          <div className="stage-poster" role="group" aria-label="3D view preview">
            <span className="stage-poster-globe" aria-hidden="true" />
            <span>{stage === 'globe' ? 'The interactive globe is ready when you are.' : 'The interactive bowl is ready when you are.'}</span>
            <button type="button" className="poster-open" onClick={() => setMount3d(true)}>
              {stage === 'globe' ? 'Open the globe' : 'Open the bowl'}
            </button>
          </div>
        ) : (
          <div className="stage-fallback" role="alert"><p>{copy.errors.webgl}</p></div>
        )}
        {stage === 'globe' && gl && (
          <MapChrome countries={countries} view={view} gap={g?.observedGap} onReset={() => useStore.getState().flyTo(selected.length ? selected : ['ZWE', 'SGP'])} />
        )}
        {stage === 'model' && <BowlControls bowl={bowl} a={a} c={c} setA={setBowlA} setC={setBowlC} kind={bowlKind} />}
      </div>

      <div
        className="panel-resizer"
        role="separator"
        aria-label="Resize the reading panel"
        aria-orientation="vertical"
        aria-controls="analysis-panel"
        aria-valuemin={PANEL_MIN}
        aria-valuemax={PANEL_MAX}
        aria-valuenow={panelW}
        tabIndex={0}
        onPointerDown={startPanelResize}
        onPointerMove={movePanelResize}
        onPointerUp={stopPanelResize}
        onPointerCancel={stopPanelResize}
        onKeyDown={keyPanelResize}
      />

      <aside className="panel" id="analysis-panel" aria-label="Analysis dashboard">
        <SectionRail />
        <div className="panel-main">
          <header className="masthead">
            <div className="masthead-top">
              <p className="masthead-kicker">Maths AA SL <span aria-hidden="true">/</span> Internal Assessment</p>
              <p className="masthead-meta">World Bank WDI · 2019</p>
            </div>
            <div className="masthead-main">
              <h1>{copy.title}</h1>
              <p className="masthead-sub">{copy.subtitle}</p>
            </div>
          </header>

          <div className="context-bar" aria-label="Dataset context">
            <span><b>WDI 2019</b> · n={analysis.points.length}</span>
            <span><b>{modelWord(analysis.model, true)}</b> · {equation(fit)}</span>
            <span>r² = <b>{num(fit.r2, 3)}</b></span>
            <span className="context-selected" title="Selected countries"><span className="visually-hidden">Selected: </span><b>{selected.length ? selected.map((iso) => countries.find((c) => c.iso3 === iso)?.name ?? iso).join(' vs ') : 'none'}</b></span>
          </div>

          <div className="panel-scroll" id="main-content" role="main" tabIndex={-1}>
            <div className="panel-content">
              <SectionJump />

              <section className="finding" aria-labelledby="finding-heading">
                <p className="finding-kicker" id="finding-heading">The answer</p>
                <p className="finding-lede">{headline}</p>
                <KpiStrip analysis={analysis} />
                <p className="source-line">
                  <span>World Bank WDI 2019 · {analysis.points.length} countries <Citation n={1} /><Citation n={2} /></span>
                  <span aria-hidden="true">·</span>
                  <button type="button" className="text-link" onClick={() => go('h-sources')}>Sources and checks</button>
                </p>
              </section>

              <div className="chapter-intro" data-chapter-heading="data" data-nav-id="h-two">
                <span className="chapter-no">01</span>
                <div className="chapter-copy">
                  <p className="chapter-kicker">Chapter one</p>
                  <h2>Data</h2>
                  <p>{CHAPTER_BY_ID.data?.purpose}</p>
                </div>
              </div>

              <section className="card" data-chapter="data" data-focus="ZWE,SGP" aria-labelledby="h-two">
                <div className="card-head">
                  <h2 id="h-two">Singapore and Zimbabwe</h2>
                  <p className="card-meta">2019 · observed</p>
                </div>
                <Question>Which two countries frame the comparison, and how far apart are they?</Question>
                {g && <KeyResult value={`${num(g.observedGap, 2)}`} unit="years" />}
                {g && <GapRuler low={g.low} high={g.high} gap={g.observedGap} />}
                <WhatThisMeans>
                  {g && <p>In 2019 life expectancy at birth was {num(g.high.y, 1)} years in Singapore and {num(g.low.y, 1)} in Zimbabwe, {num(g.observedGap, 1)} years apart. Singapore&rsquo;s GDP per capita was {num(g.high.x / g.low.x, 1)} times as large ({dollars(g.high.x)} against {dollars(g.low.x)}).</p>}
                </WhatThisMeans>
                <Calc><p>Observed gap = Singapore life expectancy − Zimbabwe life expectancy = {num(g?.high.y ?? 0, 3)} − {num(g?.low.y ?? 0, 3)} = {num(g?.observedGap ?? 0, 3)} years. Income ratio = {dollars(g?.high.x ?? 0)} ÷ {dollars(g?.low.x ?? 0)} = {num((g?.high.x ?? 0) / (g?.low.x ?? 1), 3)}.</p></Calc>
                <SearchBox countries={countries} />
                <SelectionBar countries={countries} />
                <PreviewCard countries={countries} analysis={analysis} />
                <p className="note">Each pillar is placed at the country&rsquo;s capital. Coordinates are approximate and come from <a className="inline-link" href="https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/" target="_blank" rel="noreferrer">Natural Earth Populated Places</a> <Citation n={8} />; they are not World Bank country endpoints and do not enter the regression.</p>
              </section>

              <section className="card" data-chapter="data" data-focus="" aria-labelledby="h-sample">
                <div className="card-head">
                  <h2 id="h-sample">A sample of {analysis.points.length}</h2>
                  <p className="card-meta">World Bank groups</p>
                </div>
                <Question>What does the sample look like, and how is life expectancy distributed within income groups?</Question>
                <KeyResult value={`${analysis.points.length}`} unit="countries" />
                <p>Each pillar&rsquo;s height is life expectancy. Each dot on the chart is a country&rsquo;s income and life expectancy. Mean income ({dollars(analysis.xSummary.mean)}) is above the median ({dollars(analysis.xSummary.median)}), so the income distribution is skewed to the right.</p>
                <SummaryTable analysis={analysis} />
                <CountryTable countries={countries} analysis={analysis} />
                <GroupBoxes countries={countries} />
                <WhatThisMeans><p>The sample spans {dollars(analysis.xSummary.min)} to {dollars(analysis.xSummary.max)} in income and {num(analysis.ySummary.min, 1)} to {num(analysis.ySummary.max, 1)} years in life expectancy. The four income groups overlap, so group membership is a coarse summary rather than a boundary.</p></WhatThisMeans>
                <Calc><p>Median, quartiles and whiskers are computed from the {analysis.points.length} rows. The income-group labels use the World Bank FY2027 classification today and the FY2020 classification for 2019; four countries changed between them.</p></Calc>
              </section>

              <div className="chapter-intro" data-chapter-heading="models" data-nav-id="h-models">
                <span className="chapter-no">02</span>
                <div className="chapter-copy">
                  <p className="chapter-kicker">Chapter two</p>
                  <h2>Models</h2>
                  <p>{CHAPTER_BY_ID.models?.purpose}</p>
                </div>
              </div>

              <section className="card" data-chapter="models" data-focus="" aria-labelledby="h-models">
                <div className="card-head">
                  <h2 id="h-models">Two models</h2>
                  <p className="card-meta">Least squares</p>
                </div>
                <Question>Which model fits the observations better, and what does each one claim?</Question>
                <KeyResult value={`r² = ${num(fit.r2, 3)}`} unit={`active ${activeWord}`} />
                <p>The straight line adds the same years for every extra dollar. The logarithmic model assumes extra dollars matter less as income rises. Switch the horizontal axis to a log scale and the logarithmic curve becomes a straight line.</p>
                <p><a className="inline-link" href="#ref-5">Preston (1975)</a><Citation n={5} /> described a concave relationship between mortality and income that shifts upward over time: the health gain from extra income tends to shrink as income rises. The logarithmic form is one simple cross-sectional way to represent that idea, fitted here only to this 2019 sample.</p>
                <ModelToggles />
                <Scatter countries={countries} analysis={analysis} user={user} />
                <FitTable analysis={analysis} />
                <p>The {betterWord} model fits better: it explains {percent((analysis.better === 'log' ? analysis.log : analysis.linear).r2 * 100, 1)} of the variation in life expectancy, with residual standard error {num((analysis.better === 'log' ? analysis.log : analysis.linear).se, 2)} years. The active {activeWord} model has r² = {num(fit.r2, 3)} and residual standard error {num(fit.se, 2)} years.</p>
                <Residuals countries={countries} analysis={analysis} />
                <WhatThisMeans><p>{analysis.model === 'log' ? 'The curved model leaves smaller residuals than the straight line. The improvement is largest at the high-income end, where the straight line keeps climbing while the observed gains flatten.' : 'The straight line is the active model, so its residuals are shown. Look at the high-income end: the line keeps climbing while the observed gains flatten, which is where the logarithmic model does better.'}</p></WhatThisMeans>
                <Calc><p>Both models use ordinary least squares. The logarithmic model regresses y on X = ln x; the straight line regresses y on x. Full substitutions are in <button type="button" className="text-link" onClick={() => go('h-work')}>Working</button>.</p></Calc>
              </section>

              <section className="card" data-chapter="models" data-focus="ZWE,SGP" aria-labelledby="h-gap">
                <div className="card-head">
                  <h2 id="h-gap">The gap</h2>
                  <p className="card-meta">Observed vs predicted</p>
                </div>
                <Question>How much of the Zimbabwe–Singapore gap does the model reproduce?</Question>
                {g && <KeyResult value={`${num(g.percentReproduced, 1)}%`} unit="of the observed gap" />}
                <GapChart analysis={analysis} />
                <WhatThisMeans><p>{g && (gapOvershoot ? `The observed gap is ${num(g.observedGap, 2)} years. The ${activeWord} model predicts ${num(g.predictedGap, 2)} years, ${num(g.predictedGap - g.observedGap, 2)} years wider than observed. A share above 100% means the model overshoots, not that it explains more of the gap.` : `The observed gap is ${num(g.observedGap, 2)} years. The model predicts ${num(g.predictedGap, 2)} years, or ${num(g.percentReproduced, 1)}%. The remaining ${num(g.remainder, 2)} years are the difference between the two residuals.`)}</p></WhatThisMeans>
                <Calc><p>Predicted gap = f({dollars(g?.high.x ?? 0)}) − f({dollars(g?.low.x ?? 0)}) = {num(g?.predictedHigh ?? 0, 2)} − {num(g?.predictedLow ?? 0, 2)} = {num(g?.predictedGap ?? 0, 2)} years. Remainder = {num(g?.observedGap ?? 0, 2)} − {num(g?.predictedGap ?? 0, 2)} = {num(g?.remainder ?? 0, 2)} years. Check: {num(g?.residualHigh ?? 0, 2)} − ({num(g?.residualLow ?? 0, 2)}) = {num((g?.residualHigh ?? 0) - (g?.residualLow ?? 0), 2)}.</p></Calc>
              </section>

              <div className="chapter-intro" data-chapter-heading="use" data-nav-id="h-rate">
                <span className="chapter-no">03</span>
                <div className="chapter-copy">
                  <p className="chapter-kicker">Chapter three</p>
                  <h2>Using the model</h2>
                  <p>{CHAPTER_BY_ID.use?.purpose}</p>
                </div>
              </div>

              <section className="card" data-chapter="use" data-focus="ZWE,SGP,VNM" aria-labelledby="h-rate">
                <div className="card-head">
                  <h2 id="h-rate">Rate of change</h2>
                  <p className="card-meta">dy/dx</p>
                </div>
                <Question>What does the model say about the effect of an extra $1,000 at different incomes?</Question>
                {g && <KeyResult value={`${num(g.per1000High, 3)}`} unit="years per $1,000 at Singapore" />}
                {g && <p>{analysis.model === 'log' ? <>At Zimbabwe&rsquo;s income one extra $1,000 goes with about {num(g.per1000Low, 2)} years. At Singapore&rsquo;s, about {num(g.per1000High, 3)}. The ratio of the slopes is {num(g.slopeRatio, 1)}, the same as the ratio of the two incomes ({dollars(g.high.x)} ÷ {dollars(g.low.x)} = {num(g.high.x / g.low.x, 1)}).</> : <>The straight line has one slope, so an extra $1,000 adds the same {num(g.per1000High, 3)} years at Zimbabwe&rsquo;s income and at Singapore&rsquo;s. That constant return is the model&rsquo;s strongest assumption, and the chart shows why it is hard to defend across this range.</>}</p>}
                <DerivativeChart analysis={analysis} />
                <ChangeTool analysis={analysis} />
                <WhatThisMeans><p>{analysis.model === 'log' ? 'The curve falls steeply at low incomes and flattens at high incomes. A fixed dollar increase therefore buys fewer additional years in a rich country than in a poor one.' : 'The active straight line says each extra dollar buys the same number of years everywhere. The logarithmic model would instead flatten at high incomes. The comparison is the point, not a claim that either slope is causal.'}</p></WhatThisMeans>
                <Calc><p>{analysis.model === 'log' ? <>dy/dx = a ÷ x for y = a ln x + b. The tangent estimate for a finite increase is dy/dx × Δx; the exact change is f(x + Δx) − f(x). The tool shows both. Every doubling of income adds a ln 2 = {num(analysis.log.a * Math.LN2, 3)} years.</> : <>dy/dx = a for y = ax + b, so the derivative is constant. The tangent estimate and the exact change agree exactly: f(x + Δx) − f(x) = aΔx. There is no diminishing-returns term in this model.</>}</p></Calc>
                <Caveat>{analysis.model === 'log' ? 'The derivative is a local slope. A $1,000 increase is a large step at low incomes, so the tangent and the exact change can differ.' : 'A constant slope over this income range is a strong assumption. The fit is worse than the logarithmic model, and the chart marks where the data run out.'}</Caveat>
              </section>

              <section className="card" data-chapter="use" data-focus="ZWE,SGP" aria-labelledby="h-inv">
                <div className="card-head">
                  <h2 id="h-inv">What income would match?</h2>
                  <p className="card-meta">Model in reverse</p>
                </div>
                <Question>What income does the model associate with Singapore&rsquo;s life expectancy?</Question>
                {analysis.inverse && <KeyResult value={dollars(analysis.inverse.requiredX)} source="computed" />}
                <InverseChart analysis={analysis} />
                <WhatThisMeans><p>{analysis.inverse && <>The model puts Singapore&rsquo;s {num(analysis.inverse.targetLife, 1)} years at {dollars(analysis.inverse.requiredX)} per person, {num(analysis.inverse.multipleOfLow, 1)} times Zimbabwe&rsquo;s income. Because {dollars(analysis.inverse.requiredX)} is {analysis.inverse.extrapolated ? `outside the sample range of ${dollars(analysis.inverse.dataMin)} to ${dollars(analysis.inverse.dataMax)}` : `inside the sample range of ${dollars(analysis.inverse.dataMin)} to ${dollars(analysis.inverse.dataMax)}`}, this is {analysis.inverse.extrapolated ? 'extrapolation' : 'interpolation'}.</>}</p></WhatThisMeans>
                <Calc><p>{analysis.model === 'log' ? <>x = e<sup>(y − b) ÷ a</sup> = e<sup>({num(analysis.inverse?.targetLife ?? 0, 3)} − {num(analysis.log.b, 4)}) ÷ {num(analysis.log.a, 4)}</sup> = {dollars(analysis.inverse?.requiredX ?? 0)}.</> : <>x = (y − b) ÷ a = ({num(analysis.inverse?.targetLife ?? 0, 3)} − {num(analysis.linear.b, 4)}) ÷ {num(analysis.linear.a, 8)} = {dollars(analysis.inverse?.requiredX ?? 0)}.</>} The reverse regression of ln x on y gives {dollars(analysis.xOnY?.requiredX ?? 0)}; it minimises horizontal distances and is a different calculation.</p></Calc>
                <Caveat>Reading a fitted relationship backwards is not the same as estimating the causal income needed to reach a given lifespan.</Caveat>
              </section>

              <div className="chapter-intro" data-chapter-heading="reliability" data-nav-id="h-sens">
                <span className="chapter-no">04</span>
                <div className="chapter-copy">
                  <p className="chapter-kicker">Chapter four</p>
                  <h2>Reliability</h2>
                  <p>{CHAPTER_BY_ID.reliability?.purpose}</p>
                </div>
              </div>

              <section className="card" data-chapter="reliability" data-focus="NGA,TCD" aria-labelledby="h-sens">
                <div className="card-head">
                  <h2 id="h-sens">How sensitive is it?</h2>
                  <p className="card-meta">Leave two out</p>
                </div>
                <Question>How much do the conclusions move if Nigeria and Chad are removed?</Question>
                {withoutTwo.gap && <KeyResult value={`${num(withoutTwo.gap.percentReproduced, 1)}%`} unit="of the gap reproduced without them" />}
                <SensitivityPanel countries={countries} points={points} />
                <SensitivityChart points={points} analysis={analysis} />
                <WhatThisMeans><p>{withoutTwo.gap && baseAll.gap && <>Removing the two countries moves the share of the gap reproduced from {num(baseAll.gap.percentReproduced, 1)}% to {num(withoutTwo.gap.percentReproduced, 1)}% and changes the {activeWord} slope from {num(fitOf(baseAll).a, 3)} to {num(fitOf(withoutTwo).a, 3)}. The sign and the main message survive, but the exact numbers are sensitive to the sample.</>}</p></WhatThisMeans>
                <Calc><p>The table and chart refit the {activeWord} model to the {withoutTwo.points.length} countries that remain and compare the coefficients, correlation, residual standard error, reproduced gap and inverse prediction. They always use all 42 as the baseline, so the check stays fixed while the rest of the page follows your exclusions.</p></Calc>
              </section>

              <section className="card" data-chapter="reliability" data-focus="" aria-labelledby="h-limits">
                <div className="card-head">
                  <h2 id="h-limits">{copy.limits.heading}</h2>
                  <p className="card-meta">Reading the fit</p>
                </div>
                <Question>What are the limits of this comparison?</Question>
                <KeyResult value="4" unit="countries changed income group since 2019" source="World Bank OGHIST" />
                <ul className="plain">{copy.limits.items.map((t) => <li key={t}>{t}</li>)}</ul>
                <p className="note">Health and social factors are summarised by the WHO <Citation n={9} />. The data, references and verification record are in <button type="button" className="text-link" onClick={() => go('h-sources')}>Sources and checks</button>.</p>
              </section>

              <section className="card" data-chapter="reliability" data-focus="" aria-labelledby="h-glossary">
                <div className="card-head">
                  <h2 id="h-glossary">Glossary</h2>
                  <p className="card-meta">Terms used here</p>
                </div>
                <dl className="glossary">
                  {GLOSSARY.map(([term, definition]) => (
                    <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>
                  ))}
                </dl>
              </section>

              <section className="card" data-chapter="reliability" data-focus="" aria-labelledby="h-work">
                <div className="card-head">
                  <h2 id="h-work">Working</h2>
                  <p className="card-meta">Formulas</p>
                </div>
                <Question>How is each number derived from the rows?</Question>
                <KeyResult value="p < 0.001" unit="for the logarithmic correlation" />
                <button type="button" className="btn disclosure" aria-expanded={working} aria-controls="working" onClick={() => setWorking(!working)}>
                  <span>{working ? copy.controls.hideWorking : copy.controls.showWorking}</span>
                  <ChevronDown size={16} strokeWidth={1.8} aria-hidden="true" className={working ? 'flip' : undefined} />
                </button>
                <div id="working" hidden={!working}>{working && <Working analysis={analysis} />}</div>
              </section>

              <section className="card card-sources" data-chapter="reliability" data-focus="" aria-labelledby="h-sources">
                <div className="card-head">
                  <h2 id="h-sources">{copy.sources.heading}</h2>
                  <p className="card-meta">Checked 22 Oct 2026</p>
                </div>
                <Question>Where does each number and sentence come from?</Question>
                <p>{copy.sources.lede}</p>

                <dl className="provenance">
                  {copy.sources.provenance.map((row) => (
                    <div key={row.label}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="source-actions">
                  <a className="btn" href={`${import.meta.env.BASE_URL}data/sample42.csv`} download="sample42.csv">Download data (CSV)</a>
                  <button type="button" className="btn ghost" onClick={() => { void navigator.clipboard?.writeText(copy.sources.cite); }}>Copy citation</button>
                </div>
                <p className="cite-site"><strong>Cite this site</strong><br />{copy.sources.cite}</p>

                <h3>References</h3>
                <ol className="refs">
                  {copy.sources.references.filter((ref) => ref.kind === 'source').map((ref) => (
                    <li key={ref.id} id={`ref-${ref.n}`}>
                      <p className="ref-line">{ref.apa}</p>
                      <p className="ref-detail">{ref.detail} <span className="ref-meta">{ref.licence}. Accessed {ref.accessed}.</span></p>
                    </li>
                  ))}
                </ol>

                <h3>Further reading</h3>
                <ul className="refs refs-reading">
                  {copy.sources.references.filter((ref) => ref.kind === 'reading').map((ref) => (
                    <li key={ref.id} id={`ref-${ref.n}`}>
                      <p className="ref-line">{ref.apa}</p>
                      <p className="ref-detail">{ref.detail} <span className="ref-meta">{ref.licence}. Accessed {ref.accessed}.</span></p>
                    </li>
                  ))}
                </ul>

                <h3>Checks run</h3>
                <ul className="check-list">
                  {copy.sources.checks.map((check) => <li key={check}>{check}</li>)}
                </ul>

                <h3>Credits</h3>
                <dl className="credits">
                  {copy.credits.map((c) => (
                    <div key={c.name}><dt><a href={c.url} target="_blank" rel="noreferrer">{c.name}</a></dt><dd>{c.licence}</dd></div>
                  ))}
                </dl>
                <p className="note">{copy.creditsNote}</p>

                <h3>Imagery</h3>
                <p className="note">{copy.sources.imagery}</p>
                <p className="note">{copy.aiNote}</p>
              </section>
            </div>
          </div>
        </div>
      </aside>
      <AccessibleData countries={countries} analysis={analysis} />
    </div>
  );
}
