import { useMemo, useState } from 'react';
import type { Country } from '../data/schema';
import { analyse, dollars, doublingEffect, num, percent, type Analysis, type Point } from '../math';
import { useStore } from '../store';
import { makeBowl, type Bowl } from '../math/bowl';

/** IA sections 7 and 10: tangent change versus exact change, and the doubling effect. */
export function ChangeTool({ analysis }: { analysis: Analysis }) {
  const fit = analysis.better === 'log' ? analysis.log : analysis.linear;
  const [lx, setLx] = useState(Math.log(4994));
  const [step, setStep] = useState(1000);
  const x = Math.exp(lx);
  const tangent = fit.derivative(x) * step;
  const exact = fit.predict(x + step) - fit.predict(x);
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
        {analysis.better === 'log' && (<><dt>Every doubling of GDP per capita adds</dt><dd>{num(doublingEffect(fit.a), 2)} years</dd></>)}
      </dl>
    </div>
  );
}

const PRESET = ['NGA', 'TCD'];

/** IA section 12: exclude countries and watch everything refit. */
export function SensitivityPanel({ countries, points }: { countries: Country[]; points: Point[] }) {
  const { excluded, setExcluded, toggleExcluded } = useStore();
  const base = useMemo(() => analyse(points), [points]);
  const out = useMemo(() => analyse(points, new Set(PRESET)), [points]);
  const rows: [string, (a: Analysis) => string][] = [
    ['Slope a', (a) => num(a.log.a, 3)],
    ['r', (a) => num(a.log.r, 3)],
    ['Residual SE (years)', (a) => num(a.log.se, 2)],
    ['Predicted gap, share of observed', (a) => (a.gap ? percent(a.gap.percentReproduced, 1) : 'n/a')],
    ['GDP for Singapore life expectancy', (a) => (a.inverse ? dollars(a.inverse.requiredX) : 'n/a')]
  ];
  const on = PRESET.every((c) => excluded.includes(c)) && excluded.length === PRESET.length;
  return (
    <div className="tool">
      <div className="button-row">
        <button type="button" className="btn" aria-pressed={on} onClick={() => setExcluded(on ? [] : PRESET)}>
          {on ? 'Include Nigeria and Chad again' : 'Exclude Nigeria and Chad'}
        </button>
        <button type="button" className="btn ghost" onClick={() => setExcluded([])} disabled={!excluded.length}>Include everyone</button>
      </div>
      <table className="data">
        <caption>Logarithmic model with and without Nigeria and Chad</caption>
        <thead><tr><th scope="col">Quantity</th><th scope="col">All 42</th><th scope="col">Without the two</th></tr></thead>
        <tbody>{rows.map(([n, f]) => (<tr key={n}><th scope="row">{n}</th><td>{f(base)}</td><td>{f(out)}</td></tr>))}</tbody>
      </table>
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
      <p className="note">The charts above and the globe use the current choice. The table always compares all 42 with the preset.</p>
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
