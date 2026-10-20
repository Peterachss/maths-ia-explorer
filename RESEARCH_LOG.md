# Research log

The specification asked for about 60 entries. This log contains the sources that were actually opened and used. Padding it with searches that did not happen would make it useless as a record, so it is shorter and true instead. Each entry says what the source was used for and what it changed.

Grades follow the brief: A is a primary or official statistical source, B is reputable secondary processing, C is reference or journalism, D is a forum or unsourced claim.

---

## R1. The Internal Assessment itself

**Source:** `IA (1).pdf`, 17 pages, the student's complete draft.
**Grade:** A (primary, the object the app serves).
**Used for:** every anchor, both model equations, the gap, the inverse, the sensitivity result, the bibliography and the intended structure.
**What it changed:** the app's copy follows the IA's framing and numbers rather than a generic "GDP and health" story. It also exposed the gaps recorded in `docs/IA_RECONCILIATION.md`, including the missing Appendix A and B in the PDF and the repeated "113.1 percent" defensive sentence.

## R2. The build brief

**Source:** `IA_MASTER_PROMPT_40K.md`, 322,777 characters, 5,377 lines.
**Grade:** not a research source; the specification.
**Used for:** product scope, the maths contract, the design system, the file layout, the test list and the acceptance checks.
**What it changed:** the app was built against the brief's exact numbers and tolerances. Where the brief asked for something that could not be done honestly (60 padded research entries, a deployment, 44 pixel controls), the deviation is recorded in `DECISIONS.md` instead of being faked.

## R3. World Bank country list and capital coordinates

**Source:** World Bank API, `https://api.worldbank.org/v2/country?format=json&per_page=400`.
**Grade:** A.
**Used for:** latitude and longitude of each country's capital, and the current income group classification.
**What it changed:** the 42 pillars are placed at real coordinates rather than guessed centroids. Small countries such as Singapore, which are absent from simplified boundary files, still get a pillar.

## R4. GDP per capita, PPP, constant 2021 international dollars

**Source:** World Bank API, indicator `NY.GDP.PCAP.PP.KD`, 2019, 42 country codes.
**Grade:** A.
**Used for:** an independent pull of the x variable, written to `data/worldbank_2019_pull.csv`.
**What it changed:** the pull matched Appendix A to 0.00 percent on all 42 countries, which removed the main data risk from the build.

## R5. Life expectancy at birth

**Source:** World Bank API, indicator `SP.DYN.LE00.IN`, 2019, 42 country codes.
**Grade:** A.
**Used for:** an independent pull of the y variable.
**What it changed:** the pull matched Appendix A to 0.000 years, so the app could use the appendix without a reconciliation caveat.

## R6. World Bank indicator page for GDP per capita PPP

**Source:** `https://data.worldbank.org/indicator/NY.GDP.PCAP.PP.KD`.
**Grade:** A.
**Used for:** the indicator definition, the PPP sources (ICP, Eurostat, OECD), the constant 2021 base year, and the CC BY 4.0 licence.
**What it changed:** the axis label and the data definitions doc now say "constant 2021 international dollars at PPP" rather than the looser "GDP per capita". The licence line in the README comes from this page.

## R7. Our World in Data, life expectancy versus GDP per capita

**Source:** `https://ourworldindata.org/grapher/life-expectancy-vs-gdp-per-capita`.
**Grade:** B (secondary processing of World Bank and UN data).
**Used for:** a sanity check on the shape of the relationship and on the correct description of the income measure, "adjusted for inflation and differences in living costs".
**What it changed:** the explanatory copy describes the curve as flattening at high income without claiming a threshold. The page itself is an interactive chart and did not supply any of the 42 values, which all come from grade A sources.

## R8. Natural Earth boundaries through world-atlas

**Source:** `world-atlas` npm package, derived from Natural Earth 1:110m cultural vectors. Natural Earth is public domain.
**Grade:** A for geometry, not for statistics.
**Used for:** the land mask that is drawn to a canvas texture and wrapped on the globe.
**What it changed:** the first globe attempt used a flat dark sphere with no land. The texture makes the planet readable without turning it into a satellite image.

## R9. WCAG 2.2, success criterion 2.5.8 Target Size (Minimum)

**Source:** W3C, WCAG 2.2. The Understanding page returned HTTP 403 to the fetcher, so the criterion used is the published 24 by 24 CSS pixel minimum from the specification.
**Grade:** A (standard).
**Used for:** the mechanical target size audit in `scripts/audit.mjs`.
**What it changed:** every interactive control is at least 24 by 24 CSS pixels. The buttons are 36 pixels tall. The brief's 44 pixel comfort target is not met and is recorded as a known deviation.

## R10. Preston, "The Changing Relation between Mortality and Level of Economic Development"

**Source:** *Population Studies* 29(2), 1975, pp. 231-248, as cited in the IA.
**Grade:** A (peer reviewed), but read through the IA's summary rather than in full.
**Used for:** background on why the income-mortality relation is curved rather than linear.
**What it changed:** the app avoids saying "each extra dollar buys the same health". The copy says the log model assumes extra dollars matter less as income rises, and labels that as an assumption of the model, not a law.

## R11. IB Mathematics AA guide

**Source:** International Baccalaureate Organization, *Mathematics: Analysis and Approaches Guide*, 2019, as cited in the IA.
**Grade:** A for the assessment context.
**Used for:** the scope of the IA and the language of "aim", "rationale" and "mathematical processes".
**What it changed:** the interface never presents the model as a proof or a causal claim, because the IA criteria reward interpretation and validity, not just fit statistics.

## R12. The IA's Works Cited entry for AI assistance

**Source:** the Works Cited page of `IA (1).pdf`.
**Grade:** A for the fact of disclosure.
**Used for:** the integrity note.
**What it changed:** both `DECISIONS.md` and the app's own note say that AI assistance was used, rather than hiding it. This also flags a risk for the student: the current wording ("this practice draft") reads like a disclaimer and should be rewritten before submission.

---

## Sources deliberately not used

- Wikipedia and other encyclopaedias, for any number.
- Blog posts and news articles about "the secret to long life".
- Any figure that could not be traced to the World Bank pull or to the IA's Appendix A.
- The specification's own illustrative numbers, where they differed from the student's data.

## What the research did not settle

- Why Nigeria and Chad sit so far below the curve. The app shows the residuals and offers the sensitivity view, but it does not assert a cause.
- Whether the log curve is the best functional form. It fits better than the line on these 42 countries, which is all the IA claims.
- Whether the association is causal. It is not established, and the copy says so.
