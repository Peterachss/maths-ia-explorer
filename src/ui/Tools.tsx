import { useMemo, useState } from 'react';
import type { Country } from '../data/schema';
import { analyse, dollars, doublingEffect, num, percent, type Analysis, type Point } from '../math';
import { useStore } from '../store';
import { makeBowl, type Bowl } from '../math/bowl';
import { SegmentedControl } from './Segmented';

/** IA sections 7 and 10: tangent change versus exact change, and the doubling effect. */
export function ChangeTool({ analysis }: { analysis: Analysis }) {
  const fit = analysis.model === 'log' ? analysis.log : analysis.linear;
  const [lx, setLx] = useState(Math.log(4994));
  const [step, setStep] = useState(1000);
  const x = Math.exp(lx);
  const tangent = fit.derivative(x) * step;
  const exact = fit.predict(x + step) - fit.predict(x);
  const modelName = analysis.model === 'log' ? 'logarithmic' : 'straight-line';
  return (
    <div className="tool">
      <label>
        GDP per capita: <output>{dollars(x)}</output>
        <input type="range" aria-label="GDP per capita in dollars" min={Math.log(1000)} max={Math.log(125000)} step={0.005} value={lx} onChange={(e) => setLx(Number(e.target.value))} />
      </label>
      <label>
        Increase: <output>{dollars(step)}</output>
        <input type="range" aria-label="Increase in dollars" min={100} max={20000} step={100} value={step} onChange={(e) => setStep(Number(e.target.value))} />
      </label>
      <dl className="pairs">
        <dt>Rate dy/dx at this income</dt><dd>{num(fit.derivative(x) * 1000, 3)} years per $1,000</dd>
        <dt>Tangent estimate for the increase</dt><dd>{num(tangent, 3)} years</dd>
        <dt>Exact change in the model</dt><dd>{num(exact, 3)} years</dd>
        {analysis.model === 'log' && (<><dt>Every doubling of GDP per capita adds</dt><dd>{num(doublingEffect(fit.a), 2)} years</dd></>)}
      </dl>
      <p className="note">These values follow the active {modelName} model. Change the model above the scatter plot to compare.</p>
    </div>
  );
}

const PRESET = ['NGA', 'TCD'];

/** IA section 12: exclude countries and watch everything refit. */
export function SensitivityPanel({ countries, points }: { countries: Country[]; points: Point[] }) {
  const { excluded, setExcluded, toggleExcluded, model } = useStore();
  const base = useMemo(() => analyse(points, new Set(), model), [points, model]);
  const out = useMemo(() => analyse(points, new Set(PRESET), model), [points, model]);
  const slopeLabel = model === 'log' ? 'Slope a' : 'Slope a (years per $1,000)';
  const slope = (a: Analysis) => (model === 'log' ? num(a.log.a, 3) : num(a.linear.a * 1000, 3));
  const rows: [string, (a: Analysis) => string][] = [
    [slopeLabel, slope],
    ['r', (a) => num(model === 'log' ? a.log.r : a.linear.r, 3)],
    ['Residual SE (years)', (a) => num(model === 'log' ? a.log.se : a.linear.se, 2)],
    ['Predicted gap, share of observed', (a) => (a.gap ? percent(a.gap.percentReproduced, 1) : 'n/a')],
    ['GDP for Singapore life expectancy', (a) => (a.inverse ? dollars(a.inverse.requiredX) : 'n/a')]
  ];
  const on = PRESET.every((c) => excluded.includes(c)) && excluded.length === PRESET.length;
  const custom = excluded.length > 0 && !on;
  return (
    <div className="tool">
      <SegmentedControl
        label="Sensitivity fit"
        value={on ? 'without' : custom ? 'custom' : 'all'}
        onChange={(next) => {
          if (next === 'without') setExcluded(PRESET);
          if (next === 'all') setExcluded([]);
        }}
        options={[
          { value: 'all', label: 'Include everyone' },
          { value: 'without', label: 'Without Nigeria and Chad' },
          ...(custom ? [{ value: 'custom', label: 'Custom selection' }] : [])
        ]}
      />
      {custom && (
        <p className="note">
          {excluded.length} countries are excluded. <button type="button" className="text-link" onClick={() => setExcluded([])}>Include everyone</button>
        </p>
      )}
      <div className="table-scroll" tabIndex={0} role="region" aria-label="Sensitivity comparison table">
        <table className="data">
          <caption>{model === 'log' ? 'Logarithmic' : 'Straight-line'} model with and without Nigeria and Chad</caption>
          <thead><tr><th scope="col">Quantity</th><th scope="col">All {base.points.length}</th><th scope="col">Without the two</th></tr></thead>
          <tbody>{rows.map(([n, f]) => (<tr key={n}><th scope="row">{n}</th><td>{f(base)}</td><td>{f(out)}</td></tr>))}</tbody>
        </table>
      </div>
      <details>
        <summary>Exclude any country</summary>
        <ul className="checks">
          {countries.map((c) => (
            <li key={c.iso3}>
              <label><input type="checkbox" checked={excluded.includes(c.iso3)} onChange={() => toggleExcluded(c.iso3)} /> {c.name}</label>
            </li>
          ))}
        </ul>
      </details>
      <p className="note">Every chart, the KPIs and the globe follow the current choice. The table keeps the all-versus-preset comparison so the sensitivity check stays fixed.</p>
    </div>
  );
}

/** Sliders for the least squares bowl. State lives in App so the scatter can draw the user's curve. */
export function BowlControls({ bowl, a, c, setA, setC, kind }: { bowl: Bowl; a: number; c: number; setA: (v: number) => void; setC: (v: number) => void; kind: 'linear' | 'log' }) {
  const b = c - a * bowl.ubar;
  const ratio = bowl.sse(a, c) / bowl.sse0;
  return (
    <div className="bowl-controls">
      <label>Slope a <output>{kind === 'log' ? a.toFixed(3) : a.toFixed(6)}</output>
        <input type="range" aria-label="Slope a" min={bowl.a0 - 4 * bowl.sigmaA} max={bowl.a0 + 4 * bowl.sigmaA} step={bowl.sigmaA / 40} value={a} onChange={(e) => setA(Number(e.target.value))} />
      </label>
      <label>Level at the mean <output>{c.toFixed(2)} years</output>
        <input type="range" aria-label="Level at the mean, in years" min={bowl.c0 - 4 * bowl.sigmaC} max={bowl.c0 + 4 * bowl.sigmaC} step={bowl.sigmaC / 40} value={c} onChange={(e) => setC(Number(e.target.value))} />
      </label>
      <p>y = {kind === 'log' ? `${a.toFixed(3)} ln x + ${b.toFixed(2)}` : `${a.toFixed(6)} x + ${b.toFixed(2)}`}. Sum of squared errors {bowl.sse(a, c).toFixed(1)}, which is {ratio.toFixed(2)} times the least squares minimum {bowl.sse0.toFixed(1)}.</p>
      <button type="button" className="btn" onClick={() => { setA(bowl.a0); setC(bowl.c0); }}>Snap to least squares</button>
    </div>
  );
}
export { makeBowl };
