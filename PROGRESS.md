# Progress

Branch: `rebuild/nasa-grade`  
Last update: 22 October 2026  
Build status: `npm run build` passes; `npm test` passes 46/46; axe 16/16 clean; Lighthouse desktop 100/100/100/100, mobile 98/100/100/100.

| ID | Status | Evidence | Commit |
|---|---|---|---|
| A1 | done | Country/year API URLs on every row; `scripts/verify-data.ts` re-downloads 84 values. `npm run data:verify-live` passes: 42 rows, GDP max difference $0.0049, life max difference 0.000463 years. | `6f8698f` |
| A2 | done | FY2020 (July 2019) and FY2027 (July 2026) groups from OGHIST; toggle and fiscal-year limits in the UI; four changed countries recorded in `SOURCES.md` and `DECISIONS.md`. | `6f8698f` |
| A3 | done | Preston 1975 DOI `10.1080/00324728.1975.10410201`; Crossref metadata checked and cited in `SOURCES.md` S5. | `6f8698f` |
| A4 | done | OWID further-reading URL `https://ourworldindata.org/grapher/life-expectancy-vs-gdp-per-capita`; marked background, not a calculation source. | `6f8698f` |
| A5 | done | NASA Blue Marble Next Generation December 2004, exact file and credit in `SOURCES.md` S6. | `6f8698f` |
| A6 | done | Natural Earth Admin 0 1:110m and Populated Places 1:10m recorded; `world-atlas` build limitation stated. | `6f8698f` |
| A7 | done | Five untraceable textures deleted; only two Blue Marble derivatives plus `earth-poster.jpg` remain. | `d22452a` |
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
| C1 | done | Four numbered chapters, section observer, progress rail and mobile chapter select. | `d22452a` |
| C2 | done | Shared section template: number, title, question, body, source line, calculation disclosure. | `d22452a` |
| C3 | done | Sticky context bar with sample, equation, r², selection and limits. | `d22452a` |
| C4 | done | Glossary disclosure covers residual, SSE, r², interpolation, extrapolation, PPP and residual standard error. | `d22452a` |
| C5 | done | Selection is shared by globe, scatter, table and context bar; default ZWE/SGP labels visible on first paint. | `d22452a` |
| C6 | done | Landing answer states the 42-country, 2019, logarithmic result before the chapters. | `d22452a` |
| D1 | partial | Tokens cover palette, type, spacing and motion; some literal colours/paddings remain in `src/styles/app.css`. Logged in `DECISIONS.md` D1. | `d22452a` |
| D2 | open | Light analytics panel kept per the earlier collage; near-black used for the stage. Owner decision recorded in `DECISIONS.md`. | `d22452a` |
| D3 | done | Mono numerals via `--font-mono`; no extra webfont. | `d22452a` |
| D4 | partial | Fixed `clamp(36rem,45vw,44rem)` panel and constrained prose; freeform resizer not added. Logged as D4. | `d22452a` |
| D5 | done | Desktop stage/panel frame with solid chrome and light reading surface. | `d22452a` |
| D6 | done | Shared button, chip, segmented, card, disclosure and table components. | `d22452a` |
| D7 | done | Motion timings, reduced-motion override, no scroll hijack. | `d22452a` |
| D8 | done | Lucide icons only; no icon font. | `d22452a` |
| E1 | done | Extruded pillars, back-face hiding and the 80-year ghost pillar. | `d22452a` |
| E2 | done | Blue Marble globe, runtime graticule/borders, atmosphere; cloud/specular/normal files removed. | `d22452a` |
| E3 | done | Hover/click/keyboard selection, reset and selection labels. | `d22452a` |
| E4 | done | Selected labels are clamped in the stage; ZWE/SGP visible at 1440 and 375. | `d22452a` |
| E5 | done | Legend ticks use sample min/max; selected markers and arc. | `d22452a` |
| E6 | done | Bowl axes, contours, minimum, colour bar, shadow and snap control; tablet strip layout fixed. | `d22452a` |
| E7 | done | WebGL-off run: 0 canvases, fallback text, 7 charts, 0 page errors, `audit/after/1024-webgl-off.png`. | `fe27549` |
| F1 | partial | Shared chart export/data-table plumbing; a single shared SVG frame abstraction is not complete. | `d22452a` |
| F2 | done | Axes, units, hairlines and mono ticks. | `d22452a` |
| F3 | done | Direct model labels and selected-country labels. | `d22452a` |
| F4 | partial | Hover and visible data-table keyboard access; point-level arrow-key navigation on every SVG is not implemented. | `d22452a` |
| F5 | done | Model labels and confidence band. | `d22452a` |
| F6 | done | Residual histogram. | `d22452a` |
| F7 | done | Extrapolation shading. | `d22452a` |
| F8 | done | PNG, SVG and CSV export via `ChartExport.tsx`. | `d22452a` |
| F9 | done | Sortable `CountryTable`; every sort button and row has a 44px target. | `d22452a` |
| G1 | done | 44px targets for non-inline controls; chips 44px; checkbox labels 44px. Inline prose/citation exception documented. Phone globe 45dvh; tablet 52dvh. | `d22452a` |
| G2 | done | Skip link is first Tab target and moves focus to `#main-content`; reduced motion true, animation `1e-05s`, scroll behaviour `auto`. | `fe27549` |
| G3 | done | Lighthouse desktop 100/100/100/100; mobile 98/100/100/100 (performance/accessibility/best-practices/SEO). | `fe27549` |
| G4 | done | axe 0 violations across 16 width/chapter combinations; console clean; WebGL fallback clean. | `fe27549` |
| H1 | done | `REPORT.md` with ID table, source status, data diffs, screenshot index, audits, timings, decisions. | `9a9fa4b` |
| H2 | done | `docs/DESIGN.md` reconciled with shipped textures, panel widths, stage heights and type. | `9a9fa4b` |
| H3 | done | Before/after screenshot index and final audit artefacts under `audit/`. | `fe27549` |

## Checkpoint

- All rebuild changes are committed in phase groups on `rebuild/nasa-grade`: A `6f8698f`, B–G `d22452a`, G evidence `6e9e110` and `fe27549`.
- Final docs commit contains `REPORT.md`, this table, `DECISIONS.md`, `docs/DESIGN.md` and `AGENTS.md`.
- Build, unit tests, anchors, live verification and 68 statistic checks pass after the final UI change.
- Known partials: D1 tokenisation, D4 fixed panel, F1 shared chart frame, F4 chart arrow-key navigation. Known blocker: B11 KaTeX. Open owner decision: D2.
- `data:fetch`/`data:all` deliberately not run; see `DECISIONS.md`.

Rebuild complete. No build, test or evidence work is pending; only the owner decisions in DECISIONS.md remain open.
