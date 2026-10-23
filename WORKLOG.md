# Worklog

Times are local, 20-22 October 2026. The order is the order the work happened, not a tidy retrospective.

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

## 12:05 Live deployment

Pushed commit `74f3d4a` to `main`. The Pages workflow built and deployed in 41 seconds. Verified the live URL at desktop 1440 and mobile 390: the title and h1 load, the CSV returns 200, all six textures return 200 under `/maths-ia-explorer/textures/`, the map attribution reads "Basemap: NASA Blue Marble (illustrative), Natural Earth. Data: World Bank 2019.", Gap is active after scrolling to `#h-gap`, and the mobile select shows `h-gap` then `h-limits` beside Working. No console errors, failed requests or HTTP errors.

## 13:10 Country selection reveal

Clicking a country on the globe should show its stats, but the preview card lives at the top of the panel and was 2,276 pixels above the viewport once the reader had scrolled to a lower section. A click on a pillar at Gap selected the country and flew the camera, yet nothing visible changed in the panel. Added a `selectionEvent` counter to the store; the preview card now scrolls itself into view whenever a selection event fires and the card is not fully inside the reading frame. Hover never triggers it, and re-selecting an already selected country still reveals because the counter bumps either way. On mobile the visibility frame is the sticky stage, so the card lands just below it. On desktop the reveal scrolls the selection bar under the sticky section index, which keeps the search field fully hidden instead of peeking through as a clipped strip; if the bar is already visible but the card is not, as on a short laptop panel, it falls back to the card itself.

The same pass fixed the cause of that clipped strip: the sticky index floated 28 pixels below the scrollport because of the panel's top padding, so scrolling text showed through the gap above it. The top inset moved to the panel header and the index now sits flush with the scrollport edge. Added a `.selection` scroll margin of 3.5 rem to place the bar 11 pixels under the index, and a 11 rem card margin as the short-viewport fallback.

Two new interaction steps lock the behaviour in, one desktop and one mobile. They set the search field through the native value setter and click the first hit via the DOM so the test harness cannot scroll the search box into view and hide the behaviour under test; both then assert the card lands fully inside the panel view, and the mobile step asserts it lands below the sticky stage. Pillar clicks at Gap were verified by hand at 1440 by 900 (Cambodia), 1440 by 700 (Singapore) and 375 by 812 (Kenya), with the reveal geometry measured in each case. The sweep is now 24 desktop steps and 7 mobile steps with no problems; build, 39 unit tests, 11 anchors and the accessibility audit all still pass.

## 20:45 Picking countries off the map

The map did not respond to a click on a country. Only the thin pillar beams had a click handler, about 13 pixels wide at the default view, so clicking a country's own territory missed everything and nothing happened. The sphere now picks as well: any bare point within 7 degrees of a marker selects the nearest country, a point over open ocean or far from any marker selects nothing, and both the sphere and the beams ignore a drag longer than 8 pixels, so orbiting the globe can never change the selection.

The first version of the fix leaked in the wrong direction. React Three Fiber sends a raycast event to every object the ray hits, including beams behind the Earth, so a click over open ocean could light up a country on the far side of the globe. The sphere now stops propagation on hover and on click, and because it is the front-most surface the event reaches it first; a far-side beam can neither hover, which would have put the wrong country in the preview card, nor select.

One failing test had nothing to do with picking. Scrolling the panel into a section fires the observer's `flyTo`, so reaching the Gap section re-frames the camera on Zimbabwe and Singapore. A screen point derived while the camera sat on Madagascar means nothing in the anchors framing, which is why the same coordinates picked a country twice and then, after the Gap scroll, picked nothing at all. The test now waits for that flight to settle and derives its surface click after the scroll. The five scenarios all pass: an off-globe click selects nothing, a beam click selects exactly that country, a bare-surface click selects the nearest, a surface click at the Gap selects and scrolls the card fully into the panel from 2,565 to 372 pixels, and a 10 pixel nudge inside a beam plus an 80 pixel orbit drag select nothing.

The hint bar now reads "Click a country for its stats", and "Tap a country for its stats" on touch screens. A permanent desktop step, "map surface picks the nearest country", spirals out from the globe centre to the most central facing pillar and clicks bare points 14 to 24 pixels off it until a chip appears and the share link gains a `?c=` parameter. The sweep is now 25 desktop steps and 7 mobile steps with no problems; the build, 39 unit tests, 11 anchors and the accessibility audit, no overflow, no unnamed controls, no small targets and no console errors at 1440 and 375, all still pass.

## 09:20 23 October 2026: GitHub release and final bug sweep

Integrated `origin/main` (`855e291`) with a normal merge, no force-push. The four conflicts were `copy.ts`, `Earth.tsx`, `Pillars.tsx` and `Stage.tsx`. Kept the rebuilt Blue Marble globe, the rebuilt pillar geometry and the GitHub canonical citation, then ported the owner's surface-pick feature onto them: `Earth({ countries })`, nearest marker within 7 degrees, `PICK_DRAG_PX = 8`, the sphere's far-side hover/click guard and the pillar drag guard. The new hint copy was kept. The merge commit is `57df98f`.

The interaction sweep needed repair before it could prove the feature. It now waits for the deferred 3D canvas, uses the rebuilt `.rail` selector rather than the old `.section-nav`, expects the rebuilt Working section rather than the old Limits grouping, and clicks the sensitivity options as radios rather than buttons. It also uses Playwright's pinned Chromium because the installed Chrome 150 cannot create pages through Playwright 1.64. Result: 25 desktop steps and 7 mobile steps, 0 problems, locally and against the live URL.

The GitHub base path exposed one real release bug. `optimize-dist.mjs` tried to find the stylesheet under `dist/maths-ia-explorer/assets/...`, failed, and left the CSS external. The poster URL inside that CSS then resolved to `/maths-ia-explorer/assets/textures/earth-poster.jpg` and returned 404. The script now strips `BASE_PATH` before inlining; the live build has no failed requests at 1440, 1024, 768 or 375.

Pushed `57df98f` normally. GitHub Actions run 39887371851 built in 40 seconds and deployed in 29. Verified the live site: 7 charts, 93 table rows, Thailand and Kenya restored from `?c=THA%2CKEN`, canonical URL correct, desktop document height 900 and page scroll locked at y=0 with the stage tabs visible after the panel scroll, stacked widths scroll normally, no console errors or failed requests. An 80 px orbit drag left Zimbabwe and Singapore selected. Live screenshots and measurements are in `audit/live/`; `check:ui` passes against the live URL and its output is `audit/live/ui-checks.json`.

## 14:10 23 October 2026: rail footer and 8K globe

The owner reported two defects on the published build: a red and blue glitch at the foot of the Contents rail, and a soft globe at the closest zoom. The rail footer was present in the live build at 1440, and the 2K render softened under zoom.

B18 removed the rail footer. It held a two pixel `reading-progress` bar and an 11 pixel `2019` label. At the foot of the dark rail the pair read as a red and blue glitch. Removing the footer removes the artifact; the rail now ends at Sources and the scroll spy still drives the active item.

E8 replaced the 1024/2048 day map with three renders from NASA's 21,600 by 10,800 master: 8K (8192 by 4096, 4.46 MB), 4K (1.52 MB) and 2K (416 kB). The globe asks for 8K when `maxTextureSize` is at least 8192, falls back to 4K below that, and uses 2K only on phone-sized viewports. At 1440 the stage is about 830 pixels because the reading panel takes the rest, so the compact test now requires both a narrow stage and a viewport under 900 pixels; a stage-only test was still serving 2K to desktop. The border overlay rose from 2048 to 4096 and the sphere and border from 64 by 42 and 96 by 64 to 128 by 84.

The GitHub base-path preview at `/maths-ia-explorer/` serves the 8K texture at 1440 and the 2K at 375, with no failed requests, no console errors, all 11 anchors and no rail footer. Build passes, 46 tests pass, and the refreshed screenshots are in `docs/screens/`.

The bundled Playwright browser is not installed in this checkout, so `check-ui.mjs` and `interaction-test.mjs` now launch the installed Chrome with `channel: 'chrome'`; the 25/7 sweep and the four-width UI check pass with it.

Also removed the orphaned `src/three/PreviewPillar.tsx`; nothing imported it, and it still pointed at the deleted `earth-preview.jpg`. The live preview is `src/ui/PreviewCard.tsx`.

Pushed `ef05eaa` normally. GitHub Actions run 39919923719 built in 34 seconds and deployed in 17. Live verification: 11 rail buttons and no footer, 8K requested at 1440, 2K at 375, all five anchor values (83.6, 120,678, 61.1, 4,994, 22.5), `?c=THA%2CKEN` reads "Thailand vs Kenya", the 8K/4K/2K/CSV/OG/favicon/robots/sitemap return 200, the retired 1K returns 404, and there are no failed requests or console errors. `check-ui` passes at 1440/1024/768/375, including the splitter, scatter keyboard, reduced-motion and WebGL-off checks. Evidence is in `audit/live/`.
