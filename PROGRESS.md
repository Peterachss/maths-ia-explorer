# Progress

Branch: `main` (`rebuild/nasa-grade` merged)

Last update: 27 October 2026

Release: published at https://peterachss.github.io/maths-ia-explorer/ (canonical). https://maths-ia-explorer.surge.sh/ is a verified mirror.

Build status: `npm run build` passes; `npm test` passes 46/46; the interaction sweep passes 25 desktop and 8 mobile steps; `check:ui` passes at all four widths, desktop page scroll stays at y=0; axe 16/16 clean; final redesign Lighthouse desktop 97/100/100/100, mobile 96/100/100/100 (the desktop trace includes the 4K globe; the mobile trace is the poster path).

| ID | Status | Evidence | Commit |
|---|---|---|---|
| A1 | done | Country/year API URLs on every row; `scripts/verify-data.ts` re-downloads 84 values. `npm run data:verify-live` passes: 42 rows, GDP max difference $0.0049, life max difference 0.000463 years. | `6f8698f` |
| A2 | done | FY2020 (July 2019) and FY2027 (July 2026) groups from OGHIST; toggle and fiscal-year limits in the UI; four changed countries recorded in `SOURCES.md` and `DECISIONS.md`. | `6f8698f` |
| A3 | done | Preston 1975 DOI `10.1080/00324728.1975.10410201`; Crossref metadata checked and cited in `SOURCES.md` S5. | `6f8698f` |
| A4 | done | OWID further-reading URL `https://ourworldindata.org/grapher/life-expectancy-vs-gdp-per-capita`; marked background, not a calculation source. | `6f8698f` |
| A5 | done | NASA Blue Marble Next Generation December 2004, exact file and credit in `SOURCES.md` S6. | `6f8698f` |
| A6 | done | Natural Earth Admin 0 1:110m and Populated Places 1:10m recorded; `world-atlas` build limitation stated. | `6f8698f` |
| A7 | done | Five untraceable textures deleted; the 2K, 4K and 8K Blue Marble derivatives plus `earth-poster.jpg` remain. | `d22452a` |
| A8 | done | Approximate capital coordinates and the “not used in the regression” sentence are in the UI and `SOURCES.md` S8. | `d22452a` |
| A9 | done | Credits block lists shipped software; KaTeX explicitly not shipped. See `DECISIONS.md` A9. | `d22452a` |
| A10 | done | `CLAIMS.md` maps C01–C49 to sources and checks. | `6f8698f` |
| A11 | done | `npm run data:verify-stats` passes 68 checks. | `6f8698f` |
| A12 | done | APA references, inline citation markers, CSV download and “cite this page” block. | `d22452a` |
| B1 | done | Sticky opaque context/nav chrome with hairline separators and scroll margins; chapter headings verified at 1024/768/375. | `d22452a` |
| B2 | done | Map chrome re-laid out; tabs, zoom/reset, legend, gap badge and attribution occupy separate bands. | `d22452a` |
| B3 | done | Box labels moved above whiskers; ticks span the observed 50–85 range. | `d22452a` |
| B4 | done | Scatter domain extended and clipped; no points cut by the frame. | `d22452a` |
| B5 | done | Residual edge labels and histogram present. | `d22452a` |
| B6 | done | Derivative domain and precision repaired. | `d22452a` |
| B7 | done | Gap values use the IA precision (22.535 / 18.879 / 83.78%). | `d22452a` |
| B8 | done | Arc label clamped/readable on the globe. | `d22452a` |
| B9 | done | Loading poster and deferred canvas replace blank/failed loading. | `d22452a` |
| B10 | done | Shared `Segmented` control used for model and group toggles. | `d22452a` |
| B11 | blocked | KaTeX exceeds the 50 kB gzipped rule; native MathML shipped instead. `DECISIONS.md` B11. | — |
| B12 | done | Intercept annotation removed; explanation lives in the text. | `d22452a` |
| B13 | done | Mini globe removed; capital-coordinate source and note retained. | `d22452a` |
| B14 | done | Open Graph/Twitter tags and `public/og-image.jpg` added. | `d22452a` |
| B15 | done | One basemap credit used in the map, sources and imagery sections. | `d22452a` |
| B16 | done | Visually hidden tables no longer escape the reading panel or extend the page; desktop stays 100dvh with page scroll locked at y=0, stacked layouts still scroll normally. `check:ui` asserts both. | `745cd09` |
| B17 | done | Globe surface click picks the nearest country within 7 degrees; beam clicks still select exactly; drags over 8 px and far-side beams cannot select or hover. Hint text names the behaviour. `scripts/interaction-test.mjs` passes 25 desktop and 7 mobile steps against the live build. | `57df98f` |
| C1 | done | Four numbered chapters, section observer, progress rail and mobile chapter select. | `d22452a` |
| C2 | done | Shared section template: number, title, question, body, source line, calculation disclosure. | `d22452a` |
| C3 | done | Sticky context bar with sample, equation, r², selection and limits. | `d22452a` |
| C4 | done | Glossary disclosure covers residual, SSE, r², interpolation, extrapolation, PPP and residual standard error. | `d22452a` |
| C5 | done | Selection is shared by globe, scatter, table and context bar; default ZWE/SGP labels visible on first paint. | `d22452a` |
| C6 | done | Landing answer states the 42-country, 2019, logarithmic result before the chapters. | `d22452a` |
| D1 | partial | Tokens cover palette, type, spacing and motion; some literal colours/paddings remain in `src/styles/app.css`. Logged in `DECISIONS.md` D1. | `d22452a` |
| D2 | open | Light analytics panel held for this release; near-black used for the stage. Owner can choose a dark panel in a follow-up. | `421fdda` |
| D3 | done | Mono numerals via `--font-mono`; no extra webfont. | `d22452a` |
| D4 | done | Pointer/keyboard splitter, 560–760px, ARIA separator, 44px hit area; hidden below 1201px. `npm run check:ui` verifies ArrowLeft 648→672. | `421fdda` |
| D5 | done | Desktop stage/panel frame with solid chrome and light reading surface. | `d22452a` |
| D6 | done | Shared button, chip, segmented, card, disclosure and table components. | `d22452a` |
| D7 | done | Motion timings, reduced-motion override, no scroll hijack. | `d22452a` |
| D8 | done | Lucide icons only; no icon font. | `d22452a` |
| E1 | done | Extruded pillars, back-face hiding and the 80-year ghost pillar. | `d22452a` |
| E2 | done | Blue Marble globe, runtime graticule/borders, atmosphere; cloud/specular/normal files removed. | `d22452a` |
| E3 | done | Hover/click/keyboard selection, reset and selection labels. | `d22452a` |
| E4 | done | Selected labels are clamped in the stage; phone labels lift 12px clear of the zoom plate; ZWE/SGP visible at 1440 and 375. | `421fdda` |
| E5 | done | Legend ticks use sample min/max; selected markers and arc. | `d22452a` |
| E6 | done | Bowl axes, contours, minimum, colour bar, shadow and snap control; tablet strip layout fixed. | `d22452a` |
| E7 | done | WebGL-off run: 0 canvases, fallback text, 7 charts, 0 page errors, `audit/after/1024-webgl-off.png`. | `fe27549` |
| F1 | partial | Shared chart export/data-table plumbing; a single shared SVG frame abstraction is not complete. | `d22452a` |
| F2 | done | Axes, units, hairlines and mono ticks. | `d22452a` |
| F3 | done | Direct model labels and selected-country labels. | `d22452a` |
| F4 | done | Scatter has a roving tab stop, arrow/Home/End movement, Enter/Space selection, visible focus and per-point names; other charts retain data tables. `npm run check:ui` verifies BDI→TCD + Enter. | `421fdda` |
| F5 | done | Model labels and confidence band. | `d22452a` |
| F6 | done | Residual histogram. | `d22452a` |
| F7 | done | Extrapolation shading. | `d22452a` |
| F8 | done | PNG, SVG and CSV export via `ChartExport.tsx`. | `d22452a` |
| F9 | done | Sortable `CountryTable`; every sort button and row has a 44px target. | `d22452a` |
| G1 | done | 44px targets for non-inline controls; chips 44px; checkbox labels 44px; splitter 44px effective hit area. Inline prose/citation exception documented. Phone globe 45dvh; tablet 52dvh. | `421fdda` |
| G2 | done | Skip link is first Tab target and moves focus to `#main-content`; reduced motion true, animation `1e-05s`, scroll behaviour `auto`. | `fe27549` |
| G3 | done | Lighthouse desktop 100/100/100/100; mobile 98/100/100/100 (performance/accessibility/best-practices/SEO). | `fe27549` |
| G4 | done | axe 0 violations across 16 width/chapter combinations; console clean; WebGL fallback clean. | `fe27549` |
| H1 | done | `REPORT.md` with ID table, source status, data diffs, screenshot index, audits, timings, decisions. | `9a9fa4b` |
| H2 | done | `docs/DESIGN.md` reconciled with shipped textures, panel widths, stage heights and type. | `9a9fa4b` |
| H3 | done | Before/after screenshot index and final audit artefacts under `audit/`. | `fe27549` |
| H4 | done | GitHub Pages release at https://peterachss.github.io/maths-ia-explorer/; canonical and OG URLs, `BASE_PATH` build and sitemap match. `optimize-dist.mjs` now strips `BASE_PATH` before inlining CSS, so the poster and styles no longer 404. Workflow run 39887371851 passed; live checks at 1440/1024/768/375, deep link `?c=THA%2CKEN`, page-scroll lock and drag guard recorded in `audit/live/`. | `57df98f` |

## Checkpoint

- All rebuild changes are committed in phase groups on `rebuild/nasa-grade`: A `6f8698f`, B–G `d22452a`, G evidence `6e9e110` and `fe27549`, and final UI `421fdda`.
- Final UI evidence was regenerated after `421fdda` and the merge of `origin/main` (`8df22f8`): screenshots at all four widths, `check:ui`, axe 16/16 and both Lighthouse runs.
- `origin/main` then added the country-stats reveal, the globe surface pick (`728c879`) and a live-verification record (`855e291`). These were merged in `57df98f` without force-pushing. The surface pick, 7 degree radius, 8 px drag guard and far-side beam guard were ported onto the rebuilt globe and pillars; the rebuilt textures and layout were kept.
- The `8df22f8` country-stats reveal was preserved; its breakpoint was adapted from 860px to the rebuild’s 1200px stage/panel breakpoint.
- The GitHub Pages build exposed a real `BASE_PATH` bug: `optimize-dist.mjs` could not find the stylesheet under `/maths-ia-explorer/`, so CSS stayed external and the poster resolved to `/assets/textures/earth-poster.jpg` (404). The script now strips `BASE_PATH` before inlining; the live build has no failed requests.
- Build, unit tests, anchors, live verification and 68 statistic checks pass after the final UI change.
- B16 fixed the reported post-scroll glitch: the screen-reader-only tables were absolutely positioned without a top/left anchor, so their static positions in the long reading column extended `documentElement.scrollHeight` from 900 to 9489 at 1440×900. The page could scroll the 100dvh app upward and leave a black band. They are now anchored at 0,0 with `clip-path`; desktop document height equals the viewport and the page cannot scroll. `check:ui` now covers this, and the four-width screenshots were regenerated.
- Remaining internal partials: D1 tokenisation and F1 shared chart-frame abstraction. Neither changes a rendered style or a user interaction. Known blocker: B11 KaTeX. Held owner choice: D2 light panel.
- `data:fetch`/`data:all` deliberately not run; see `DECISIONS.md`.
- The owner authorized publication on 22 October 2026. `main` was pushed normally (no force-push) and GitHub Actions run 39887371851 built and deployed the site in 69 seconds. The canonical release is https://peterachss.github.io/maths-ia-explorer/; Surge remains a mirror.
- Live verification at 1440×900, 1024×768, 768×1024 and 375×812: no failed requests or console errors; 7 charts and 93 data rows; `?c=THA%2CKEN` restores Thailand and Kenya; canonical URL is GitHub Pages. At 1440 the document stays 900px, page scroll remains y=0 and the stage tabs stay visible after the panel scrolls; stacked widths scroll normally. The drag guard preserves Zimbabwe and Singapore after an 80 px orbit drag. Evidence: `audit/live/github-checks.json`, `audit/live/ui-checks.json`, `docs/interaction-report.json` and `audit/live/github-*.png`.

Release complete. Only the two internal refactors and the optional design choices remain.

## Post-release fixes, 23 October 2026

The owner reported two defects on the published build: a red and blue glitch at the foot of the Contents rail, and a soft globe at the closest zoom. Both were visible at https://peterachss.github.io/maths-ia-explorer/.

- **B18: rail footer removed.** The rail ended with a two pixel blue reading-progress bar and an 11 pixel `2019` label, which read as a red and blue glitch at the foot of the dark rail. The footer is removed rather than restyled, so the rail ends at Sources; the scroll spy still marks the active destination.
- **E8: 8K globe.** The globe used a 1024 or 2048 pixel Blue Marble render. It now requests 8K when `maxTextureSize` is at least 8192, 4K on GPUs capped below that, and 2K on phone-sized viewports. The border overlay is generated at 4096 and the sphere at 128 by 84 segments. At 1440 the stage is about 830 pixels because the reading panel takes the rest, so the compact test requires both a narrow stage and a viewport under 900 pixels; a stage-only test served 2K to desktop.
- Verification: `npm run build` passes, `npm test` passes 46/46, the GitHub base-path preview serves the 8K texture at 1440 and the 2K at 375, the rail footer is absent, all 11 anchors are present and there are no failed requests or console errors. The audit remains clean at 1440 and 375. The live release (run 39919923719, commit `ef05eaa`) repeats those results: 8K at 1440, 2K at 375, the deep link shows Thailand vs Kenya, the 1K texture is gone, and all assets return 200. Evidence: `audit/live/b18-e8-checks.json`, `audit/live/github-1440.png`, `audit/live/github-1440-zoom.png`, `audit/live/github-375.png` and `audit/live/ui-checks.json`.

## Redesign, 26-27 October 2026

Branch: `main`, on top of `75cf6df`. The redesign is one normal commit group, `R1`; nothing was force-pushed.

Scope: a full app-screen redesign of the published explorer while keeping the React/Vite/Three.js stack, the 42-row dataset, the regression code and every working interaction. The `design-taste-frontend` and `impeccable` skills were used.

- **Shell.** Replaced the 56px icon rail with a 152px typographic contents index. Merged the stacked header bands into one masthead plus a compact context strip. Widened the reading panel to 53% of the viewport (600-800px). Added a four-KPI finding strip and a headline computed from the active model.
- **One active model.** A single `model` store value (`log` or `linear`, URL `m=linear`) now drives the scatter, residuals, gap, derivative and inverse charts, the working, the tables and the headline. Sensitivity is always recomputed from the current sample. The linear model uses explicit overshoot wording rather than capping the predicted share at 100%.
- **Charts.** All seven were rewritten for dynamic axes, consistent colours, direct labels, readable ticks and active-model values. Added `SensitivityChart` (four-row dumbbell) in place of hardcoded prose. Added the residual histogram label and axis, moved derivative country values into a legend key, anchored inverse labels away from the plot edge, and kept the gap percent label inside the bar.
- **Globe.** FOV/aspect-aware camera fit. 4K Blue Marble at laptop size, 8K only when the stage is at least 2000 device pixels wide; the border canvas follows the same threshold (2048 below it). Phones use a 96x64 sphere, 2400 stars and a 1.5 DPR cap. Mobile keeps the poster until the reader presses "Open the globe"; desktop and tablet mount the scene when the main thread is idle.
- **Mobile and tablet.** Sticky contents bar with a native section select. 44px targets, compact one-line bowl controls, and a stage that grows to 48dvh only when the bowl tab is active. The phone poster is a circular, shaded hemisphere; the stage gap badge is hidden below 640px because the headline immediately below states the same gap.
- **Accessibility.** Darkened the small-text tokens to meet WCAG AA without changing the coral rules or chart accents. axe reports 0 violations across all 16 width/chapter combinations. The keyboard scatter, skip link, reduced motion and WebGL fallback checks still pass.
- **Data.** Both CSV copies were re-hashed (`0b0a1624...f37f66d`), the full-precision values were recomputed independently, and no data value changed. The log fit remains `y = 5.927678825 ln x + 16.024564`, r2 = 0.768662883; the observed gap is 22.535 years and the predicted gap 18.879168 years (83.777093%).
- **Verification.** `npm test` 46/46, `data:verify-stats` 68/68, `data:anchor` 11/11, `check:ui` at all four widths, interaction sweep 25 desktop and 8 mobile steps, axe 16/16 clean, build passing. Final Lighthouse: desktop 97/100/100/100 and mobile 96/100/100/100. The desktop trace includes the 4K globe and the 4K texture; the mobile trace is the 180 KiB poster path. Screenshots: `audit/after/`; chart set: `audit/charts/`; before set: `audit/baseline/`; audits: `audit/after-redesign/`.
- **Remaining limitation.** The mobile 3D scene is opt-in and still costs roughly 1-3 seconds of main-thread work when opened on a mid-range phone. The report itself, not the globe, is now the main mobile cost (seven SVG charts). The panel remains light (D2).
