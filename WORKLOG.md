# Worklog

Times are local, 20 October 2026. The order is the order the work happened, not a tidy retrospective.

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
