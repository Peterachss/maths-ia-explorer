import type { Analysis } from '../math';
import { dollars, num } from '../math';

const L = ({ children }: { children: React.ReactNode }) => <p className="work-line">{children}</p>;

/** Every formula, substitution and result, computed from the data on this page. */
export function Working({ analysis: A }: { analysis: Analysis }) {
  const lg = A.log, ln = A.linear, g = A.gap, inv = A.inverse;
  return (
    <div className="working">
      <details open>
        <summary>Logarithmic model by least squares</summary>
        <math display="block"><mi>y</mi><mo>=</mo><mi>a</mi><mi>ln</mi><mo>&#x2061;</mo><mi>x</mi><mo>+</mo><mi>b</mi></math>
        <L>Let X = ln x. n = {lg.n}, X̄ = {num(lg.meanU, 4)}, ȳ = {num(lg.meanY, 3)}.</L>
        <L>Sxx = Σ(Xᵢ − X̄)² = {num(lg.sxx, 3)}, Syy = Σ(yᵢ − ȳ)² = {num(lg.syy, 2)}, Sxy = Σ(Xᵢ − X̄)(yᵢ − ȳ) = {num(lg.sxy, 3)}</L>
        <L>a = Sxy ÷ Sxx = {num(lg.sxy, 3)} ÷ {num(lg.sxx, 3)} = {num(lg.a, 4)}</L>
        <L>b = ȳ − a X̄ = {num(lg.meanY, 3)} − {num(lg.a, 4)} × {num(lg.meanU, 4)} = {num(lg.b, 4)}</L>
        <L>r = Sxy ÷ √(Sxx Syy) = {num(lg.r, 4)}, r² = {num(lg.r2, 4)}, SSE = {num(lg.sse, 1)}, residual SE = √(SSE ÷ (n − 2)) = {num(lg.se, 3)} years</L>
        <L>Test: t = r√(n − 2) ÷ √(1 − r²) = {num(A.logTest.t, 2)} on {A.logTest.df} degrees of freedom, p &lt; 0.001.</L>
        <L>Doubling x adds a ln 2 = {num(lg.a * Math.LN2, 3)} years.</L>
      </details>
      <details>
        <summary>Straight line model</summary>
        <L>a = Sxy ÷ Sxx = {ln.a.toExponential(4)}, b = {num(ln.b, 3)}, r = {num(ln.r, 4)}, r² = {num(ln.r2, 4)}, SSE = {num(ln.sse, 1)}</L>
      </details>
      {g && inv && (
        <>
          <details>
            <summary>Zimbabwe and Singapore</summary>
            <L>Observed gap = {num(g.high.y, 3)} − {num(g.low.y, 3)} = {num(g.observedGap, 3)} years</L>
            <L>Predicted gap = f({dollars(g.high.x)}) − f({dollars(g.low.x)}) = {num(g.predictedHigh, 3)} − {num(g.predictedLow, 3)} = {num(g.predictedGap, 3)} years</L>
            <L>Share reproduced = {num(g.predictedGap, 3)} ÷ {num(g.observedGap, 3)} × 100 = {num(g.percentReproduced, 1)}%</L>
            <L>Remainder = {num(g.remainder, 3)} years = residual(Singapore) − residual(Zimbabwe) = {num(g.residualHigh, 3)} − ({num(g.residualLow, 3)})</L>
          </details>
          <details>
            <summary>Rate of change</summary>
            <math display="block"><mfrac><mrow><mi>dy</mi></mrow><mrow><mi>dx</mi></mrow></mfrac><mo>=</mo><mfrac><mi>a</mi><mi>x</mi></mfrac><mo>,</mo><mspace width="1em" /><mfrac><mrow><msup><mi>d</mi><mn>2</mn></msup><mi>y</mi></mrow><mrow><mi>d</mi><msup><mi>x</mi><mn>2</mn></msup></mrow></mfrac><mo>=</mo><mo>−</mo><mfrac><mi>a</mi><msup><mi>x</mi><mn>2</mn></msup></mfrac><mo>&lt;</mo><mn>0</mn></math>
            <L>Zimbabwe: {num(g.slopeLow, 6)} years per $1 = {num(g.per1000Low, 3)} years per $1,000. Exact change for +$1,000: {num(g.exact1000Low, 3)} years.</L>
            <L>Singapore: {num(g.slopeHigh, 6)} years per $1 = {num(g.per1000High, 4)} years per $1,000. Exact change for +$1,000: {num(g.exact1000High, 4)} years.</L>
            <L>Ratio = x(Singapore) ÷ x(Zimbabwe) = {num(g.slopeRatio, 2)}</L>
          </details>
          <details>
            <summary>GDP per capita for Singapore's life expectancy</summary>
            <math display="block"><mi>x</mi><mo>=</mo><msup><mi>e</mi><mrow><mo>(</mo><mi>y</mi><mo>−</mo><mi>b</mi><mo>)</mo><mo>/</mo><mi>a</mi></mrow></msup></math>
            <L>x = e^(({num(inv.targetLife, 3)} − {num(lg.b, 4)}) ÷ {num(lg.a, 4)}) = {dollars(inv.requiredX)}, which is {num(inv.multipleOfLow, 1)} times Zimbabwe's GDP per capita.</L>
            <L>With the rounded 83.6 years the same formula gives {dollars(lg.inverse(83.6))}. The IA's figure uses the unrounded 83.595.</L>
            {A.xOnY && <L>Comparison only: the regression line of ln x on y has slope {num(A.xOnY.slope, 4)} and intercept {num(A.xOnY.intercept, 4)} and gives {dollars(A.xOnY.requiredX)}. It minimises horizontal distances, so it is a different calculation from reading the y on ln x model in reverse.</L>}
          </details>
        </>
      )}
    </div>
  );
}
