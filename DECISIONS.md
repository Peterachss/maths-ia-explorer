# Decisions

Short records of the choices that shaped the explorer. Each one names the alternative that was rejected and why.

## 1. Visual world: the star chart

Three directions were considered: a data dashboard, a satellite view, and a printed star chart. The dashboard was rejected because it would make the 42 countries feel like a business report. The satellite view was rejected because photographic Earth would compete with the data and make the page feel like a product demo. The star chart won: matte black paper, warm cream type, one vermilion thread, thin rules, and a globe that reads as a drawn instrument rather than a planet. The palette is in `src/styles/tokens.css` and `src/theme.ts`, and every screen follows it.

## 2. Appendix A is authoritative

The 42 rows in `data/sample42.csv` are the values printed in the IA. The World Bank API pull is a verification, not a source of replacement values. When the pull was run it matched the appendix to 0.00 percent on GDP and 0.000 years on life expectancy, so there was no conflict to resolve. If the pull had differed, the app would still have used the appendix and the difference would have been recorded in `docs/INTEGRITY_NOTE.md`. No number in the interface is invented, and no value is marked `PLACEHOLDER` because no placeholder was needed.

## 3. Ordinary least squares, twice

Both models are fitted by ordinary least squares in the form the IA uses: `y = ax + b` for the straight line, and `y = a ln x + b` for the logarithmic model. The log model is not a regression of `ln y` on `x`, and the app says so in the working panel. No robust regression, no weighting, and no standardised variables: those would answer a different question from the one the IA asks.

## 4. r, r squared, s_e and SSE, not p-values

The IA compares the models with r, r squared, the residual standard error and the sum of squared errors. The app reports the same four and adds a Spearman rank correlation as a check that the association is not an artefact of the curve. A p-value would be easy to compute but would overstate what a hand-picked 42 country sample can support, so it is not the headline.

## 5. The inverse is shown with its assumptions

Reading the curve backwards gives the income at which the model predicts Singapore's life expectancy. The app solves the fitted curve, reports whether the answer is interpolation or extrapolation, and also shows the reverse regression of `ln x` on `y` as a different calculation. The two answers differ, and hiding that would be dishonest.

## 6. A drawn globe, not a photographic one

The sphere uses an equirectangular land mask drawn from Natural Earth geometry and mapped as a texture. Country pillars stand at capital city coordinates from the World Bank country list. The globe is deliberately sparse: no borders as bright lines, no atmospheric glow, no city lights. The pillars carry the data, and the arc carries the comparison.

## 7. Pillar height is scaled, not proportional

Life expectancy runs from about 53 to 84 years. Mapping that directly to a radius one globe would make every pillar taller than the planet. The height is `0.025 + ((life - 50) / 36) * 0.3` globe radii, so differences are visible and the zero point is still meaningful in the caption. The app says the height is scaled; it does not pretend the pillar is a to scale bar chart.

## 8. Split stage and panel, not a single scrolling page

The specification imagined a full page scrollytelling site. A split view was chosen instead: the globe stays in view while the narrative panel scrolls beside it. This keeps the 3D context visible at every step, works on a laptop without a scroll hijack, and collapses to a sticky stage on mobile. The trade-off is that a full page screenshot only captures the current panel position, which is why the screenshots in `docs/screens` are taken section by section.

## 9. SVG charts, no chart library

Every chart is hand built with `d3-scale` and `d3-shape`. A chart library would have brought default styles, tooltips and legends that fight the star chart world, and the charts here are simple enough that the drawing code is shorter than the configuration would be. It also keeps the accessible names and the exact number formatting under our control.

## 10. Controls are 36 pixels tall

The specification asked for 44 pixel touch targets. The stage tabs and model toggles are 36 pixels tall. That passes WCAG 2.2 AA, whose minimum is 24 by 24 CSS pixels, but it is below the 44 pixel comfort target. Raising every control to 44 pixels would have added roughly 80 pixels of vertical chrome to a panel that is already dense. The deviation is recorded here and in `docs/A11Y_PLAN.md` rather than hidden.

## 11. Research was logged honestly, not padded

The specification asked for around 60 research entries. The log contains the sources that were actually read and used: the IA itself, the World Bank indicator pages and API, Natural Earth, the WCAG quick reference, Our World in Data, and the literature already cited by the IA. It does not contain invented searches. A shorter true log is worth more than a long false one.

## 12. Deployed to GitHub Pages

The app is built, tested, screenshotted and pushed to GitHub. It is also published at https://peterachss.github.io/maths-ia-explorer/. GitHub Pages was chosen because the build is already a static site, the repository is public, and the deploy needs no server, secrets or paid account. `.github/workflows/deploy.yml` runs the tests, builds with `BASE_PATH=/maths-ia-explorer/`, and publishes `dist/` on every push to `main`. The local build keeps the root path so `npm run preview` still works.

## 13. AI assistance is disclosed

The IA's own Works Cited already records that Claude was used for planning, checking calculations, drafting support and setting up the sheets. This explorer was built with AI assistance as well. It is a companion to the IA, not a substitute for the student's own analysis, and the interface does not claim otherwise. The student should describe the tool the same way in any submission.
