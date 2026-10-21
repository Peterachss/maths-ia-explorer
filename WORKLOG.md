# Worklog

Times are local, 20-21 October 2026. The order is the order the work happened, not a tidy retrospective.

## 22:30 Reading the brief and finding the starter

Read `IA_MASTER_PROMPT_40K.md` (322,777 characters, 5,377 lines) in sections: mission and rules, the mathematics, the research protocol, the product specification, the design system, the appendices, and the starter code. Found `Maths_IA_Explorer_starter.zip` beside the prompt and unpacked it to `maths-ia-explorer/`. The starter already contained the data layer, the maths engine, the charts, the Three.js stage, the copy and the docs scaffolding, so the job became verification, repair and finishing rather than a blank page build.

## 22:33 Install and first test run

`npm install` added 202 packages in 18 seconds. `npm test` passed 39 tests across four files: regression, bowl, cross check and the IA contract. `npm run build` completed with no TypeScript errors. Bundle sizes: 45 kB app, 48 kB d3, 301 kB React Three Fiber, 667 kB Three.js before gzip.

## 22:34 First visual check

Started `npm run preview` on port 4173. Chrome headless screenshots showed the app rendering, but the globe was cropped at the top and left, and the panel was cut off. The camera was flying to a distance of 3.4 globe radii to frame Zimbabwe and Singapore, which put the pillar tips outside the frame.

## 22:36 Camera and pillar scale

Changed the flight distance to `min(6.2, 4.2 + spread * 1.5)` and the initial camera to `[0, 1.1, 5.4]`. Reduced pillar height from 0.4 to 0.3 globe radii at the top of the range. Re-shot: the sphere and all pillars now fit at 1440 by 900.

## 22:38 Layout overflow

A Playwright measurement found the document scroll width was 710 pixels at a 375 pixel viewport. Two causes: the mobile grid used `1fr` (which has an automatic minimum), and the visually hidden 42 row table was expanding the page. Fixed with `minmax(0, 1fr)`, `min-width: 0` on grid children, a wrapper around the hidden table, and horizontal scrolling for data tables. Overflow is now zero at 375, 414, 768 and 1440.

## 22:40 Chart legibility

The charts were drawn in a 520 unit viewBox and scaled down, which made 11 pixel labels render at about 9 pixels. Bumped tick, axis and title sizes. Flipped point labels near the right edge so "Singapore" stopped being clipped. Rebuilt the income group box plot, whose domain ended at 80 while the high group sat at 82.3, so the top box had been invisible.

## 22:42 Pillar labels and the back of the globe

Labels were rendered through drei's `Html`, which ignores depth, so Singapore's label floated beside the globe even when its pillar was round the back. Added a `FacingLabel` component that compares the pillar's outward normal with the camera direction each frame and fades the label when the country is behind the sphere.

## 22:43 The bowl

The least squares surface filled the screen. The plane spanned plus or minus four standard errors and the vertical scale was 1.1 units, so the near wall sat between the camera and the minimum. Reduced the span to 2.5 standard errors, halved the vertical scale, capped it at 0.9, and moved the camera back. The bowl now reads as a bowl with the minimum visible.

## 22:44 Preview card

The miniature pillar in the country preview overflowed its box. Lowered the group and shortened the pillar. The card now shows the country's GDP, life expectancy, model value, residual, rank and income group without clipping.

## 22:45 Data verification

Wrote `scripts/anchor_check.mjs` and `scripts/fetch_worldbank.mjs`. All 11 anchors pass: n = 42, Singapore 83.595 and 120,678.34, Zimbabwe 61.060 and 4,993.87, observed gap 22.535, log slope 5.9277, intercept 16.0246, predictions 85.3836 and 66.5045, model gap 18.8792. The live World Bank pull returned all 42 countries with no missing values and matched Appendix A to 0.00 percent on GDP and 0.000 years on life expectancy.

## 22:46 Accessibility audit

Wrote `scripts/audit.mjs`. Results at 1440 and 375: no horizontal overflow, one h1, no skipped heading levels, zero unlabelled SVGs, zero images without alt text. Contrast on the panel ranges from 6.57:1 to 15.23:1. Two range inputs were initially unnamed because their wrapping label also contained an `<output>`, which is itself labelable; they now have explicit `aria-label` attributes. Buttons are 36 pixels tall, above the WCAG AA minimum of 24 but below the 44 pixel comfort target.

## 22:47 Documentation and screenshots

Wrote the README, this worklog, the decisions record, the research log and the reference docs. Captured desktop and mobile screenshots plus one per story section into `docs/screens`. Saved the test transcript to `docs/TEST_RUN.txt`.

## 22:50 Repository

Initialised git, committed the app, and pushed to GitHub. See the repository link in the final message.

## 09:20 Interaction sweep

Wrote `scripts/interaction-test.mjs`. It clicks the search, both country presets, every model and axis toggle, a scatter point, the working drawer, the exclusion presets, the country checklist, both bowl sliders, the snap button and the stage tabs. It reloads a share link and resizes between phone and tablet. It also blocks the CSV to check the data error message. The first run found six failures in the test itself, not the app: the model toggles are radios rather than buttons, and sharing uses a query string rather than a hash. After fixing the selectors, all 22 desktop steps and 5 mobile steps pass with no console, page, request or HTTP errors.

## 09:25 Deployment

Added `base` support to `vite.config.ts`, made the CSV path follow `import.meta.env.BASE_URL`, made the URL subscription return an unsubscribe, and added `.github/workflows/deploy.yml`. Enabled GitHub Pages with the Actions build type, pushed, and watched the workflow pass. The live site is https://peterachss.github.io/maths-ia-explorer/. Re-ran the full interaction sweep against the live URL: 22 desktop steps, 5 mobile steps, 0 problems. Fresh desktop and mobile screenshots were taken from the live site.

## 10:15 Taste audit

Reviewed the live page against the Google Earth direction. The globe was cropped and the stage read as a dark diagram rather than a place. The map chrome was translucent, the primary button was below AA contrast, the fit table had a redundant column that squeezed the numbers, the scatter clipped the linear overprediction, and the bowl used a rainbow that implied categories. On mobile the brand and eyebrow clipped, the eight-item section nav wrapped into two rows with Limits orphaned, the bowl controls were three cramped columns, and the lower axis labels sat under the controls card. A stale section state also left the last index item active after the Working section.

## 10:35 Taste pass

Replaced the drawn globe with a photoreal NASA Blue Marble stage, a terrain normal map, ocean specular and a cloud layer, with a restrained atmosphere and star field. Rebuilt the chrome in solid graphite with one-pixel rules instead of frosted glass. Moved the primary action to `#1a73e8` with white text, raised it to 44 pixels, and kept the rest of the blue for focus and the active section rule. Removed the redundant fitted-value column, extended the scatter domain to 96 years, and changed the bowl to a blue to sand ramp with lower camera and labels. Raised the two lower bowl axis labels above the mobile controls card. Added a mobile native section select in one 44 pixel row and kept the desktop index sticky and on one line.

## 10:50 Section index

Replaced the observer-only active state with a scroll spy that chooses the heading nearest the top of the reading area. Short sections such as Gap were previously overtaken by the next heading as soon as it entered the observer band. The camera fly-through still uses the observer; the index now uses the scroll position. The Working section is excluded from the index candidates, so Limits stays active while Working is open. Added interaction assertions for Gap and Working on desktop and mobile.

## 11:00 Verification

Production build passes with no TypeScript errors. 39 tests pass in four files. All 11 IA anchors pass. The interaction sweep now covers 23 desktop steps and 6 mobile steps, including the section index, with no console, page, request or HTTP errors. The accessibility audit at 1440 and 375 reports no horizontal overflow, no unnamed controls, 16 labelled SVGs, one h1, no heading skips and no visible targets under 24 by 24. The country checkboxes were raised from 16 to 24 pixels. Contrast runs from 4.51:1 on the primary button to 17.2:1 for primary text; body text is 6.3:1 or better. The audit now reads the real palette rather than the first-palette constants. A separate Playwright check confirmed no overflow at 414 and 768 as well.

## 11:20 IA revisions

Treated the seven issues in `docs/IA_RECONCILIATION.md` as a separate editorial job. Added Appendix A (42 raw rows) and Appendix B (income-group summary) after Works Cited and added both to the contents page. Tightened the 113.1 percent sentence to remove the defensive "not invalid" framing. Rewrote the Claude Works Cited entry. Shortened the personal introduction and removed the essay-prize details while keeping the motivation and methods. Corrected the Figure 6 caption by stating the conversion to years per $1,000. Added the 22.54 rounding clarification at first use and changed the conclusion's 83.8 percent denominator to 22.54. Corrected "data is" to "data are". The assessed body remains 14 pages (pages 3 to 16); the cover, contents, Works Cited and the two appendices are outside it. The revised PDF is saved outside the public repository and is not published to the site.
