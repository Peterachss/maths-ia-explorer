# Claim register

Every factual or statistical sentence rendered by the site, with its source and the calculation that produces it. “Computed” means `src/math/analyse.ts` from the 42 rows in `data/sample42.csv`; `scripts/verify-stats.ts` checks 68 of these values against fixed anchors.

| ID | Claim (as written on the page) | Source | Check |
|---|---|---|---|
| C01 | “In 2019, the logarithmic model explains 77% of the variation in life expectancy across these 42 countries.” | Computed: `log.r2 = 0.7687` | `verify-stats.ts` → log r² 0.768662883 |
| C02 | “The straight line explains 55%.” | Computed: `linear.r2 = 0.5549` | `verify-stats.ts` → linear r² 0.554885 |
| C03 | “The model reproduces 18.9 of the 22.5-year gap between Zimbabwe and Singapore.” | Computed: `gap.predictedGap = 18.879`, `gap.observedGap = 22.535` | `verify-stats.ts` → gap 18.879168, observed 22.535 |
| C04 | “42 countries in 2019.” | S1, S2; `data/sample42.csv` has 42 rows | contract test, `verify-data.ts` |
| C05 | “Median life expectancy 71.9 years.” | Computed: `ySummary.median = 71.919` | `verify-stats.ts` → y median 71.919 |
| C06 | “Range 53.0–84.4.” | Computed: `ySummary.min/max`; S2 | `verify-stats.ts` → 52.993 to 84.356 |
| C07 | “Best model y = 5.928 ln x + 16.02.” | Computed: `log.a`, `log.b`; method after S5 | `verify-stats.ts` → 5.927678825, 16.024564 |
| C08 | “r² = 0.769.” | Computed: `log.r2` | `verify-stats.ts` |
| C09 | “Life expectancy 83.6 years in Singapore and 61.1 in Zimbabwe.” | S2; `sample42.csv` | `verify-data.ts`; Singapore API returned 83.5951219512195 |
| C10 | “22.5 years apart.” | Computed: `gap.observedGap` | `verify-stats.ts` → 22.535 |
| C11 | “Singapore’s GDP per capita was 24.2 times as large ($120,678 against $4,994).” | S1; computed ratio 120678.34 / 4993.87 | `verify-stats.ts`; ratio 24.1653 |
| C12 | “Mean income $24,987.37 is above the median $13,555.23, so the income distribution is skewed to the right.” | Computed: `xSummary.mean`, `xSummary.median` | `verify-stats.ts` → 24,987.370714 and 13,555.23 |
| C13 | “The sample spans $1,054.73 to $120,678.34 in income and 53.0 to 84.4 years.” | Computed: `xSummary.min/max`, `ySummary.min/max`; S1, S2 | `verify-stats.ts` |
| C14 | “The four income groups overlap.” | S3, S4 and the 42 rows | contract test; box-plot ranges overlap in every adjacent pair |
| C15 | “Income groups: FY2027 (July 2026) today; FY2020 (July 2019) for 2019.” | S3, S4 | contract test checks `income_group` and `income_group_2019` |
| C16 | “Four countries changed group: Nepal (Low → Lower middle); Indonesia, the Philippines and Vietnam (Lower middle → Upper middle).” | S4 | contract test expects exactly `IDN, NPL, PHL, VNM` |
| C17 | “The straight line adds the same years for every extra dollar.” | Mathematical definition of a linear function | model equation; `verify-stats.ts` checks linear slope |
| C18 | “The logarithmic model assumes extra dollars matter less as income rises.” | Mathematical property of `a ln x + b` with a > 0; context S5 | derivative `a/x`; `verify-stats.ts` checks slopes |
| C19 | “Switch the horizontal axis to a log scale and the logarithmic curve becomes a straight line.” | Mathematical identity `y = a ln x + b` versus `u = ln x` | chart implementation; regression test `logFit` |
| C20 | “Preston (1975) described a concave relationship between mortality and income that shifts upward over time.” | S5 | Crossref metadata verified; wording follows the paper’s argument. The site does not reuse Preston’s coefficients. |
| C21 | “The logarithmic form is one simple cross-sectional way to represent that idea, fitted here only to this 2019 sample.” | Method statement; S5 for context | model code; sample is 2019 only |
| C22 | “The logarithmic model explains 76.9% of the variation, with residual standard error 4.35 years.” | Computed: `log.r2`, `log.se` | `verify-stats.ts` → 0.768662883, 4.346608 |
| C23 | “The curved model leaves smaller residuals than the straight line.” | Computed: `log.sse = 755.720`, `linear.sse = 1454.078` | `verify-stats.ts` |
| C24 | “The improvement is largest at the high-income end, where the straight line keeps climbing while the observed gains flatten.” | Computed residuals and model curves; visual | chart and residual data; stable under refit |
| C25 | “The observed gap is 22.53 years. The model predicts 18.88 years, or 83.8%.” | Computed: `gap` | `verify-stats.ts` → 22.535, 18.879168, 83.777093 |
| C26 | “The remaining 3.66 years are the difference between the two residuals.” | Computed: `gap.remainder`, `residualHigh - residualLow` | `verify-stats.ts` → 3.655832; identity error 0 |
| C27 | “At Zimbabwe’s income one extra $1,000 goes with about 1.19 years. At Singapore’s, about 0.049.” | Computed: `gap.per1000Low/High` (tangent) | `verify-stats.ts` → 1.186991, 0.0491197 |
| C28 | “The ratio of the slopes is 24.2, the same as the ratio of the two incomes.” | Computed: `slopeRatio = 24.1653`; income ratio 24.1653 | `verify-stats.ts` |
| C29 | “The curve falls steeply at low incomes and flattens at high incomes.” | Mathematical derivative `a/x` | `verify-stats.ts` and chart |
| C30 | “Every doubling of income adds a ln 2 = 4.109 years.” | Computed: `5.927678825 × ln 2` | `verify-stats.ts` → 4.108754 |
| C31 | “The derivative is a local slope. A $1,000 increase is a large step at low incomes, so tangent and exact change can differ.” | Mathematical caveat; exact changes computed | `verify-stats.ts` → tangent 1.186991 vs exact 1.081956 at Zimbabwe |
| C32 | “The model puts Singapore’s 83.6 years at $89,245 per person.” | Computed: `inverse.requiredX` | `verify-stats.ts` → 89,244.866 |
| C33 | “$89,245 is 17.9 times Zimbabwe’s income.” | Computed: `inverse.multipleOfLow` | `verify-stats.ts` → 17.870883 |
| C34 | “$89,245 is below the sample maximum of $120,678, so this is interpolation.” | Computed: `inverse.extrapolated = false`, `dataMax = 120678.34` | `verify-stats.ts` |
| C35 | “The reverse regression of ln x on y gives $55,983; it minimises horizontal distances and is a different calculation.” | Computed: `xOnY.requiredX` | `verify-stats.ts` → 55,983.446629 |
| C36 | “Reading a fitted relationship backwards is not the same as estimating the causal income needed to reach a given lifespan.” | Method caveat; S5 and standard regression interpretation | no causal claim is made |
| C37 | “Removing Nigeria and Chad lowers the share reproduced from 83.8% to 79.3% and the slope from 5.928 to 5.613.” | Computed: sensitivity analysis | `verify-stats.ts` → 83.777093, 79.327627, 5.927679, 5.612855 |
| C38 | “The sign and the main message survive, but the exact numbers are sensitive to the sample.” | Computed: sensitivity table | slope remains positive; r² 0.856; share 79.3% |
| C39 | “The sample is 42 selected countries, not every country, and it was not chosen at random.” | `data/sample42.csv`, IA method | 42 rows; no sampling frame |
| C40 | “The data are for one year, 2019, so this is a snapshot, not a change over time.” | S1, S2 | all rows are 2019 |
| C41 | “Health spending, education, conflict and disease also matter.” | S9 | WHO report on social determinants of health |
| C42 | “GDP per capita is an average. It says nothing about how income is shared within a country.” | S1 definition | indicator metadata |
| C43 | “Life expectancy at birth is a period measure built from current mortality rates, not a forecast for a particular baby.” | S2 definition | WDI indicator metadata: prevailing patterns at the time of birth |
| C44 | “The t test assumes independent observations from a random sample. These countries are purposive, so the p-value is indicative.” | Mathematical assumption; sample design | model caveat; no random sample |
| C45 | “Results outside the observed range of incomes are extrapolations and are marked.” | Computed: `inverse.extrapolated`; chart shading | model + UI |
| C46 | “The 42 rows in Appendix A are the authority for every number. The World Bank series was pulled again on 22 October 2026 and all 42 rows matched at the printed precision.” | IA Appendix A; S1, S2; `scripts/verify-data.ts` | PASS: 42 rows, 84 values, max GDP difference 0.0004%, max life difference 0.000463 years |
| C47 | “Every row has country- and year-specific API URLs for both indicators.” | S1, S2; CSV columns | contract test checks the exact URL patterns |
| C48 | “KaTeX is not bundled; the formulas use native MathML.” | Package manifest and build output | KaTeX is absent from `package.json`; MathML is in `Working.tsx` |
| C49 | “This explorer was built with AI assistance. The data, IA and argument are the student’s own work.” | Project provenance | owner statement; not a statistical claim |

## Claims that were rewritten or removed

- **“Health spending, education, conflict and disease also matter.”** Kept, but now cites S9. The old page had no citation.
- **“This lies inside the range of the data, so it is interpolation.”** Kept as C34, now computed from `inverse.extrapolated`.
- **“The ratio is 24.2, exactly the ratio of the two incomes.”** Kept as C28, with both sides computed to full precision and displayed to 1 decimal.
- **“Mean income is far above the median, so income is skewed to the right.”** Kept as C12, with the actual mean and median shown.
- **“The IA prints the intercept as 16.03…”** Removed (B12). It was a note about the IA, not a claim about the data.
- **“Current World Bank classification.”** Replaced with explicit FY2027 and FY2020 labelling (C15, C16).
- **“The three.js Earth relief maps.”** Removed. The old textures had no traceable source and were deleted; the new basemap is S6.
