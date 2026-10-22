# Rebuild report — Life Expectancy Explorer

Branch: `rebuild/nasa-grade` merged to `main`

Final verification: 22 October 2026

Live site: https://maths-ia-explorer.surge.sh/

Site: the companion page for the IB Maths AA SL Internal Assessment comparing GDP per capita with life expectancy for 42 countries in 2019.

## Result

The page is now a four-chapter report around a working 3D globe and least-squares bowl. Every rendered statistic is checked against `data/sample42.csv`; every source is in the S1–S12 register; every chapter and both 3D views have screenshots at the four required widths.

Final checks:

| Check | Result |
|---|---|
| `npm run build` | PASS. Type-check, Vite build, CSS inlining and deferred-3D preload removal all complete. |
| `npm test` | PASS. 5 files, 46 tests. |
| `npm run data:anchor` | PASS. 11/11 anchors. |
| `npm run data:cross` | PASS. Writes `docs/crosscheck.json`. |
| `npm run data:verify` | PASS. All source, provenance and cross-check assertions. |
| `npm run data:verify-live` | PASS. 42 rows, 84 values re-downloaded; GDP max absolute difference $0.0049; life max absolute difference 0.000463 years; public CSV byte-identical. |
| `npm run data:verify-stats` | PASS. 68 statistic checks. |
| `npm run check:ui` | PASS. No overflow, no page errors, all non-inline targets at least 44px, 42/42 checkbox labels at least 44px, splitter ArrowLeft 648→672, scatter BDI→TCD + Enter, selection reveal shows Chad, skip link, reduced motion and WebGL fallback pass. |
| axe via `scripts/audit.ts` | 16/16 width/chapter combinations, 0 violations. |
| Lighthouse desktop | 100 performance, 100 accessibility, 100 best practices, 100 SEO. |
| Lighthouse mobile | 98 performance, 100 accessibility, 100 best practices, 100 SEO. |
| Console | Clean after excluding Chromium's GL ReadPixels driver warning. |

The one deliberately blocked item is KaTeX (B11). The light panel is held for this release (D2), with the near-black colour reserved for the stage; a dark-panel alternative remains a follow-up option. The internal D1 tokenisation and F1 chart-frame refactors remain partial and do not affect a rendered style or interaction.

## Branch and commits

| Commit | Contents |
|---|---|
| `b0d0e1c` | Pre-rebuild baseline. Used for the before screenshots only. |
| `8df22f8` | `main` follow-up: reveal the country stats card on selection. Merged into the rebuild; the reveal breakpoint was adapted to the rebuild’s 1200px layout breakpoint. |
| `6f8698f` | `A1-A12`: sources, provenance, claims register and verification scripts. |
| `d22452a` | `B1-G4`: chapters, layout, tokens, 3D, charts, mobile chrome, accessibility and performance work. |
| `6e9e110` | `G1-G4`: first screenshot, axe and Lighthouse evidence set. |
| `fe27549` | `G1-G4`: final touch-target and UI checks, final screenshots, before captures. |
| `9a9fa4b` | `H`: `REPORT.md`, `PROGRESS.md`, `DECISIONS.md`, `docs/DESIGN.md`. |
| `421fdda` | `D4/F4/G1/E4`: pointer/keyboard splitter, keyboard scatter points, splitter hit area, phone label clearance and refreshed evidence. |
| release | Final docs and local `main` merge; published to Surge. GitHub Pages push remains blocked by missing credentials. No force-push was used. |

## ID table

The detailed evidence and commit for every ID is in `PROGRESS.md`; this is the complete status table.

| ID | Status | Evidence |
|---|---|---|
| A1 | done | Country/year API URLs on every row; live re-download of 84 values with max GDP difference $0.0049 and life difference 0.000463 years. |
| A2 | done | FY2020/FY2027 income groups, fiscal-year wording, four changed countries. |
| A3 | done | Preston (1975) DOI `10.1080/00324728.1975.10410201`, Crossref metadata checked. |
| A4 | done | OWID further-reading URL; not used in a calculation. |
| A5 | done | NASA Blue Marble Next Generation December 2004, exact file and credit. |
| A6 | done | Natural Earth Admin 0 1:110m and Populated Places 1:10m; exact point release marked unverified. |
| A7 | done | Five untraceable textures deleted; three Blue Marble derivatives remain. |
| A8 | done | Approximate capital coordinates documented and excluded from the regression. |
| A9 | done | Credits list shipped software; KaTeX explicitly not shipped. |
| A10 | done | `CLAIMS.md` C01–C49. |
| A11 | done | 68 statistic checks. |
| A12 | done | References, citation markers, CSV download and cite block. |
| B1 | done | Sticky context/nav chrome, hairline rules, scroll margins. |
| B2 | done | Map chrome re-laid out into separate tabs, legend, tools and credit bands. |
| B3 | done | Box labels above whiskers; 50–85 tick span. |
| B4 | done | Extended, clipped scatter domain. |
| B5 | done | Residual edge labels and histogram. |
| B6 | done | Derivative domain and precision. |
| B7 | done | Gap precision: 22.535 / 18.879 / 83.78%. |
| B8 | done | Arc label clamped and readable. |
| B9 | done | Poster and deferred canvas loading state. |
| B10 | done | Shared segmented control. |
| B11 | blocked | KaTeX exceeds the 50 kB gzipped rule; native MathML shipped. |
| B12 | done | Intercept note removed. |
| B13 | done | Mini globe removed; capital source retained. |
| B14 | done | Open Graph/Twitter tags and 1200×630 image. |
| B15 | done | One basemap credit shared by map, sources and imagery. |
| C1 | done | Four numbered chapters, observer, progress rail, mobile select. |
| C2 | done | Shared section template. |
| C3 | done | Context bar with sample, equation, r², selection and limits. |
| C4 | done | Glossary. |
| C5 | done | Selection shared by globe, scatter, table and context; ZWE/SGP visible initially. |
| C6 | done | Landing answer before the chapters. |
| D1 | partial | Tokens exist; some literal colours and paddings remain. |
| D2 | held | Light panel retained for this release; near-black stage. Optional dark-panel follow-up recorded. |
| D3 | done | System mono numerals; no new font dependency. |
| D4 | done | Pointer/keyboard splitter, 560–760px, ARIA separator and 44px effective hit area; verified by `check:ui`. |
| D5 | done | Desktop frame, solid chrome, light reading surface. |
| D6 | done | Shared buttons, chips, segmented controls, cards, disclosures, tables. |
| D7 | done | Motion timings and reduced-motion override. |
| D8 | done | Lucide only. |
| E1 | done | Extruded pillars, back-face hiding, 80-year ghost. |
| E2 | done | Blue Marble, runtime borders/graticule, atmosphere; no cloud/specular/normal textures. |
| E3 | done | Hover, click, keyboard selection and reset. |
| E4 | done | Selected labels visible at all four widths; phone labels lift 12px clear of the zoom plate. |
| E5 | done | Sample min/max legend and selected markers. |
| E6 | done | Bowl axes, contours, minimum, colour bar, shadow, snap control. |
| E7 | done | WebGL fallback: 0 canvases, text fallback, 7 charts, 0 page errors. |
| F1 | partial | Export/data-table plumbing shared; one SVG frame abstraction not complete. |
| F2 | done | Axes, units, hairlines, mono ticks. |
| F3 | done | Direct model and selected labels. |
| F4 | done | Scatter roving tab stop, arrow/Home/End movement, Enter/Space selection and per-point names; other charts keep data tables. |
| F5 | done | Model labels and confidence band. |
| F6 | done | Residual histogram. |
| F7 | done | Extrapolation shading. |
| F8 | done | PNG, SVG and CSV export. |
| F9 | done | Sortable country table with 44px targets. |
| G1 | done | 44px non-inline targets; inline prose links documented as WCAG 2.5.8 exception; splitter has a 44px effective hit area. |
| G2 | done | Skip link first in Tab order and moves focus to `#main-content`; reduced motion respected. |
| G3 | done | Lighthouse scores above. |
| G4 | done | axe clean, console clean, WebGL fallback clean. |
| H1 | done | This report. |
| H2 | done | `docs/DESIGN.md` reconciled with shipped assets and layout. |
| H3 | done | Before/after and audit evidence in `audit/`. |

## Source status

| ID | Source | Status |
|---|---|---|
| S1 | World Bank GDP per capita, PPP, `NY.GDP.PCAP.PP.KD` | Verified. Indicator page 200; every row has a country/year API URL; live pull passes. |
| S2 | World Bank life expectancy, `SP.DYN.LE00.IN` | Verified. Singapore 2019 API value 83.5951219512195; live pull passes. |
| S3 | World Bank country and lending groups, FY2027 | Verified. All 42 current labels match the API classification. |
| S4 | World Bank OGHIST, FY2020 column AH / FY2027 column AO | Verified. Nepal, Indonesia, the Philippines and Vietnam differ between July 2019 and July 2026. |
| S5 | Preston (1975), *Population Studies* 29(2), 231–248 | Verified via Crossref; DOI resolves. |
| S6 | NASA Blue Marble Next Generation, December 2004 | Verified; NASA page 200; 5400×2700 source resized locally. |
| S7 | Natural Earth Admin 0 Countries, 1:110m | Dataset and scale verified. Exact Natural Earth point release is **UNVERIFIED** because `world-atlas` does not print it; the site says this. |
| S8 | Natural Earth Populated Places, 1:10m | Verified. Coordinates approximate; not in the regression. |
| S9 | WHO, *Equity, social determinants and public health programmes* | Verified through stable IRIS record `10665/44289`; old health-topics URL returned 403. |
| S10 | Our World in Data grapher | Verified, background reading only. |
| S11 | Shipped software and licences | Verified from package metadata and project licences; KaTeX not bundled. |
| S12 | Font and icon licences | Verified: OFL 1.1 and ISC. |

Full URLs, versions, access dates and licence notes are in `SOURCES.md`.

## Data audit

### What changed

- The 42 country rows and both IA value columns are unchanged. A column-by-column comparison against `b0d0e1c` found 0 changes to `name`, `region`, `gdp_pc_ppp` or `life_exp`.
- Added `income_group_2019`, `gdp_source_url`, `life_source_url` and the country/year `source_url`. `indicator_code` and provenance text were updated.
- No IA number was edited. Appendix A remains authoritative.
- The live World Bank pull is verification only. `data:all` is not run because its first step (`data:fetch`) can overwrite the authoritative values; the individual checks are run instead.

### Live diffs

| Quantity | Result |
|---|---|
| Rows / values | 42 / 84 |
| GDP max absolute difference | $0.0049 |
| Life max absolute difference | 0.000463 years |
| Public CSV | byte-identical to `data/sample42.csv` |
| Per-row source URLs | present for both indicators on all 42 rows |

### Income groups

Current FY2027 counts: Low 10, Lower middle 9, Upper middle 12, High 11.
FY2020 (July 2019) counts: Low 11, Lower middle 11, Upper middle 9, High 11.

The four differences between FY2020 and FY2027 are Nepal (Low → Lower middle), Indonesia, the Philippines and Vietnam (Lower middle → Upper middle). The data values for those countries did not change.

### Statistics recomputed

| Quantity | Value |
|---|---|
| Observations | 42 |
| Log model | `y = 5.92768 ln x + 16.02456` |
| Log r² | 0.7687 |
| Log residual SE | 4.347 |
| Linear r² | 0.5549 |
| Observed gap | 22.535 years |
| Predicted gap | 18.879 years |
| Share of gap reproduced | 83.78% |
| Income matching Singapore | $89,245 (interpolation) |
| Reverse regression matching | $55,983 |
| Sensitivity share without Nigeria and Chad | 79.33% |
| Sensitivity log slope | 5.612855 |
| Sensitivity r² | 0.8563 |
| Zimbabwe life / Singapore life | 61.1 / 83.6 years |
| Zimbabwe GDP / Singapore GDP | $4,994 / $120,678 |
| Singapore ratio | 24.2× |

All values are checked in `scripts/verify-stats.ts`; the full machine-readable regression is in `docs/crosscheck.json`.

## Screenshots

### Before and after

The before set was captured from the pre-rebuild commit `b0d0e1c` in a detached worktree; the after set is from the final production build. The representative pair is at 1440×900 and 375×812.

| Width | Before | After |
|---|---|---|
| 1440×900 | [before](audit/before/1440-landing.png) | [after](audit/after/1440-landing.png) |
| 375×812 | [before](audit/before/375-landing.png) | [after](audit/after/375-landing.png) |

The before images show the old dark panel and single-page section tabs. The after images show the four-chapter light panel, the selected-country labels, the context bar, the desktop splitter and the 44px chrome. The final after set was regenerated after the `421fdda` UI commit.

### Required matrix

Every chapter and both 3D views at 1440×900, 1024×768, 768×1024 and 375×812:

| Width | Landing | Globe | Bowl | Data | Models | Use | Reliability |
|---|---|---|---|---|---|---|---|
| 1440 | [landing](audit/after/1440-landing.png) | [globe](audit/after/1440-globe.png) | [bowl](audit/after/1440-bowl.png) | [data](audit/after/1440-data.png) | [models](audit/after/1440-models.png) | [use](audit/after/1440-use.png) | [reliability](audit/after/1440-reliability.png) |
| 1024 | [landing](audit/after/1024-landing.png) | [globe](audit/after/1024-globe.png) | [bowl](audit/after/1024-bowl.png) | [data](audit/after/1024-data.png) | [models](audit/after/1024-models.png) | [use](audit/after/1024-use.png) | [reliability](audit/after/1024-reliability.png) |
| 768 | [landing](audit/after/768-landing.png) | [globe](audit/after/768-globe.png) | [bowl](audit/after/768-bowl.png) | [data](audit/after/768-data.png) | [models](audit/after/768-models.png) | [use](audit/after/768-use.png) | [reliability](audit/after/768-reliability.png) |
| 375 | [landing](audit/after/375-landing.png) | [globe](audit/after/375-globe.png) | [bowl](audit/after/375-bowl.png) | [data](audit/after/375-data.png) | [models](audit/after/375-models.png) | [use](audit/after/375-use.png) | [reliability](audit/after/375-reliability.png) |

Extras:

- [1440 full page](audit/after/1440-full.png)
- [375 full page](audit/after/375-full.png)
- [1024 WebGL-off fallback](audit/after/1024-webgl-off.png)
- Machine-readable checks: [axe.json](audit/after/axe.json), [lighthouse desktop](audit/after/lighthouse-desktop.json), [lighthouse mobile](audit/after/lighthouse-mobile.json), [console.json](audit/after/console.json), [ui-checks.json](audit/after/ui-checks.json).

The images were opened and inspected. Fixes made during the screenshot loop included: chapter headings hidden under sticky chrome at 1024/768, the mobile section select lagging one chapter behind, the bowl controls covering the bowl at tablet widths, missing selected labels because the canvas was remounted immediately before capture, the bowl title colliding with the mobile tabs, the Singapore label touching the zoom plate at 375px, and the splitter hit area.

## Accessibility and performance

### Lighthouse

Run through Playwright's Chromium, with `CHROME_PATH` pointing at the pinned browser because installed Chrome 150 exceeded the 30-second navigation timeout.

| Category | Desktop | Mobile |
|---|---|---|
| Performance | 100 | 98 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |

Metrics: desktop FCP 0.3s, LCP 0.5s, TBT 0ms, CLS 0; mobile FCP 1.4s, LCP 2.3s, TBT 50ms, CLS 0. Total page weight 170 KiB. The extra `agentic-browsing` category is 50 in both runs; it is an experimental Lighthouse category, not one of the four requested categories and it does not affect the scores above.

### axe

0 violations across the 16 combinations of four widths and four chapters; raw results are in `audit/after/axe.json`.

### Keyboard, motion and fallback

- First Tab lands on “Skip to the analysis”; Enter moves focus to `#main-content`.
- The desktop splitter is a focusable separator: ArrowLeft grew the panel 648→672 in the final check.
- The scatter has one roving tab stop; ArrowRight moved Burundi→Chad and Enter selected Chad in the final check.
- The country stats card reveal was verified: selecting Chad moved the preview into view with the label “Chad”.
- `prefers-reduced-motion: reduce` is true; the animation duration resolves to `1e-05s` and scroll behaviour to `auto`.
- With WebGL disabled there are 0 canvases, the text fallback is shown, all 7 charts remain and there are no page errors.

### Touch targets

`npm run check:ui` reports all non-inline targets at least 44×44 at 1440, 1024, 768 and 375. This includes stage tabs, map tools, model/group segmented controls, primary and ghost buttons, chips, search, disclosures, export menu items, table sort buttons, table rows, range inputs and the splitter’s 44px effective hit area. The 42 checkboxes have 44px labels that are the click target.

Inline prose links, citation markers and inline text buttons are left at type size under the WCAG 2.5.8 inline exception. This is recorded in `DECISIONS.md` rather than claimed as a 44px target.

## Phase timings

No stopwatch log was kept, so the active-time split is **UNVERIFIED** and approximate. The wall-clock interval is verified from the last pre-rebuild commit timestamp (`2026-10-21 13:35:09 +0700`) to the final verification (`2026-10-22 09:08 +0700`): about 19.6 hours including interruptions and repeated screenshot/audit runs.

| Phase | Approx. active | Work |
|---|---|---|
| A | 3.0 h | Source register, live pull, anchors, cross-check, claims and 68 stats. |
| B | 2.0 h | Interface bug fixes, map chrome, chart domains and loading. |
| C | 1.5 h | Four chapters, template, context bar, glossary, selection and landing answer. |
| D | 1.5 h | Tokens, mono numerals, frame, shared components, motion, icons. |
| E | 2.0 h | Pillars, globe, labels, bowl, controls, fallback. |
| F | 2.0 h | Chart frames, labels, band, histogram, export, sortable table. |
| G | 2.5 h | Mobile/tablet layout, target sizes, keyboard/motion, axe and Lighthouse, screenshots. |
| H | 0.75 h | Report, progress, decisions and design reconciliation. |

The screenshot and audit loops were repeated after layout fixes, so the G estimate includes three full screenshot passes and three Lighthouse pairs.

## Decisions and limitations

| Item | State | Resolution |
|---|---|---|
| D2 light panel vs near-black | Held | Keep the light panel and dark stage for this release; dark-panel alternative remains a follow-up. |
| B11 KaTeX | Blocked | Native MathML; KaTeX would exceed the 50 kB gzipped rule. |
| D1 tokenisation | Partial | Tokens exist, but some literal colours/paddings remain in `app.css`. |
| D4 panel resizer | Done | Pointer/keyboard splitter from 560–760px, ARIA separator and 44px hit area. |
| F1 shared chart frame | Partial | Shared export/table plumbing exists; a single SVG frame abstraction does not. |
| F4 chart keyboard points | Done | Scatter has roving arrow-key point navigation and Enter/Space selection; other charts use keyboard-accessible data tables. |
| D2 alternate | Not built | A near-black panel or light/dark preference was not built because it would reverse the earlier approved collage direction. |
| Data pull | Restricted | `data:all` is not run; individual checks pass. Appendix A is authoritative. |
| Screen-reader testing | UNVERIFIED | axe and keyboard checks were run; no NVDA/JAWS/VoiceOver session was recorded. |
| Physical-device testing | UNVERIFIED | Playwright viewport and touch-target checks only; no physical phone/tablet run. |
| Exact Natural Earth release | UNVERIFIED | `world-atlas` does not print the point release; dataset and 1:110m scale are verified. |

All other decisions, including the default Zimbabwe/Singapore selection, deferred 3D canvas, chunk splitting, system mono stack, tablet bowl layout, inline-link exception and Lighthouse browser workaround, are in `DECISIONS.md`.

## Design summary

The full design document is `docs/DESIGN.md`. The short version:

- **World:** NASA Blue Marble Next Generation December 2004, atmosphere, runtime borders and graticule. The old cloud/specular/normal maps are gone. The imagery is illustrative, not a 2019 data layer, and the credit says so.
- **Panel:** light analytics surface beside a near-black stage. Ink hairlines, one blue action colour, gold for the logarithmic fit, coral for the observed gap and selection, one sequential teal ramp for life expectancy.
- **Type:** Instrument Sans for interface; system monospace for numbers. No second webfont.
- **Layout:** desktop split view; below 1201px the stage is a sticky band and the report reads below it. The phone stage is 45dvh; the tablet stage is 52dvh so the bowl controls fit. Chapter headings use scroll margins that clear the stage, context bar and section select.
- **Motion:** slow interruptible camera flights, one 14px section reveal, press-scale buttons, and a 2.8s deferred 3D canvas behind a poster. Reduced motion disables the flights, idle rotation, reveals and transitions.
- **Charts:** seven hand-built SVG figures sharing the life-expectancy ramp, model colours and direct labels, with PNG/SVG/CSV export and hidden data tables.

### Published build

The live build was checked after upload:

- `https://maths-ia-explorer.surge.sh/` returns HTTP 200; the entry JS asset returns 200, and `robots.txt` and `sitemap.xml` return 200.
- `npm run check:ui` was re-run with `URL=https://maths-ia-explorer.surge.sh/`: no overflow, no page errors, all 44px targets, splitter, scatter keyboard, selection reveal, reduced motion and WebGL fallback pass. Output: `audit/live/ui-checks.json`.
- Live captures: `audit/live/1440-landing.png` and `audit/live/375-landing.png`.

## Reproduce

```bash
npm run build
npm test
npm run data:anchor
npm run data:cross
npm run data:verify
npm run data:verify-live
npm run data:verify-stats
npm run preview -- --host 127.0.0.1 --port 4173

# In another shell:
npx vite-node scripts/screenshot.ts audit/after
npm run check:ui
CHROME_PATH="$HOME/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing" \
  npx vite-node scripts/audit.ts audit/after
```

`npm run data:fetch` and `npm run data:all` are intentionally omitted; they can overwrite the authoritative Appendix A values.

## Closing status

`main` now contains the complete rebuild and evidence on the local release branch. The release build is published at https://maths-ia-explorer.surge.sh/; the GitHub Pages push is still blocked because this machine has no GitHub credentials. The remaining gaps are listed above rather than hidden: KaTeX (B11), the design-system token cleanup (D1), the shared chart-frame abstraction (F1), and the optional dark-panel direction (D2). D4 and F4 are no longer partial.

Release complete. The published build passed the build, unit tests, data anchors, live data verification, 68 statistic checks, UI checks, screenshots, axe and Lighthouse before publication. The live URL was checked again after upload.
