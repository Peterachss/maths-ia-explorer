# Release report — Life Expectancy Explorer

**Release:** all-black console, 6 November 2026
**Branch:** `main`, on top of `dd805f3`
**Live site:** https://peterachss.github.io/maths-ia-explorer/ (canonical)
**Mirror:** https://maths-ia-explorer.surge.sh/

This is the companion page for the IB Mathematics AA SL Internal Assessment comparing GDP per capita with life expectancy for 42 countries in 2019. It fits a straight line and a logarithmic curve, shows the Singapore–Zimbabwe gap, and lets the reader interrogate the model without changing the IA's data.

## Result

The four-chapter report, photoreal globe, least-squares bowl and seven charts are unchanged in structure. The reading console is now black throughout, with light surfaces only on selected or primary controls. The gap badge has its own typographic voice and model context and no longer collides with the stage tabs. Chart export, chart full-screen, copy-view links and keyboard search were repaired or added.

| Area | Result |
|---|---|
| Data | No IA value changed. Appendix A remains 42 rows, 84 values. |
| Mathematics | Same log fit, r², gap and sensitivity values as the submitted IA. |
| Theme | Panel `rgb(8, 10, 13)`; 17.6:1 primary, 11.3:1 body, 6.8:1 secondary, 4.8:1 smallest functional. Light selected controls use dark ink at 17.2:1. |
| Layout | Verified at 1440×900, 1024×768, 768×1024 and 375×812. No horizontal page overflow. |
| Badge | 14px clear of the Globe / Least squares bowl tabs at all four widths. Shows observed 22.5 years and income model 18.9 years · 83.8% of gap. |
| Charts | Seven charts; seven full-screen controls; PNG/SVG/CSV export repaired with a dark export backdrop. |
| Sharing | Desktop and mobile copy-view controls copy `c`, `x` and `m` state and announce success. |
| Keyboard | Search wraps, supports Home/End, Enter/Escape, `aria-activedescendant`, selected tags and no-match. |
| Accessibility | axe 0 violations across 16 width/chapter combinations; skip link, 44px targets, reduced motion and WebGL fallback pass. |
| Performance | Lighthouse desktop 100/100/100/100 (final run; 84 on the preceding run); mobile 97/100/100/100. Mobile keeps the poster until the reader opts into 3D. |
| Deployment | Normal push to `main`; no force-push. GitHub Pages is canonical, Surge is the mirror. |

## Release changes

| ID | Change | Evidence |
|---|---|---|
| B19 | All-black console. A final `src/styles/black.css` layer overrides every reading surface, card, table, rail, masthead and mobile chrome while preserving R1's layout, 152px contents rail, globe and charts. Selected/primary control surfaces remain light intentionally. | `audit/black-release/ui-checks.json`, `audit/black-release/1440-*.png`, `docs/screens/` |
| B20 | Gap badge rebuilt in Instrument Sans with mono numerals and model context; moved below the tabs with 14px clearance at every width. | `ui-checks.json`, `375-landing.png`, interaction badge step |
| B21 | Chart full-screen added; export now selects the chart SVG rather than the toolbar icon and paints `#0d1015` behind SVG/PNG output. | interaction export/full-screen steps, 7 controls in `check:ui` |
| B22 | Copy-view link added to the desktop masthead and mobile contents row, including selected countries, axis and model. | interaction desktop/mobile copy steps; 2 controls at 1440 |
| B23 | Keyboard search improved: wrapping arrows, Home/End, Enter/Escape, `aria-activedescendant`, selected-country tags, no-match announcement. | 31 desktop + 11 mobile interaction steps |

The visual direction is recorded as R6 in `DECISIONS.md`; R5's warm-paper panel is historical and superseded. The earlier backup branch contains a different black implementation on an older base and is not shipped.

## Verification

All commands were run on 6 November 2026 on macOS with Node 22 and the bundled Playwright Chromium (revision 1248).

| Check | Command | Result |
|---|---|---|
| Type-check and build | `npm run build` | PASS. CSS 83.14 kB / 16.29 kB gzipped; 3D chunks lazy. |
| Unit and contract tests | `npm test` | PASS. 5 files, 46 tests. |
| Anchor values | `npm run data:anchor` | PASS. 11/11 anchors. |
| Independent cross-check | `npm run data:cross` | PASS. Writes `docs/crosscheck.json`. |
| Source and data checks | `npm run data:verify` | PASS. Appendix rows, provenance, ranges, metadata, saved pull and cross-check. |
| Live World Bank values | `npm run data:verify-live` | PASS. 42 rows, 84 values re-downloaded. Max GDP difference $0.0049; max life difference 0.000463 years. |
| Rendered statistics | `npm run data:verify-stats` | PASS. 68 checks. |
| Four-width UI | `npm run check:ui` | PASS. All four widths; panel black; contrast; badge clearance; 43 checkbox labels ≥44px; 7 full-screen controls; 2 copy controls; reduced motion; WebGL off. |
| Interaction sweep | `node scripts/interaction-test.mjs URL` | PASS. 31 desktop steps + 11 mobile steps; data-error path; no console, page, request or HTTP errors. |
| Accessibility | `npm run audit` (axe phase) | PASS. 16/16 width/chapter combinations, 0 violations. |
| Lighthouse | `npm run audit` (Lighthouse phase) | Desktop 100/100/100/100 (final run; 84 on the preceding run); mobile 97/100/100/100. Single run, not a guarantee. |
| GitHub Pages base path | `BASE_PATH=/maths-ia-explorer/ npm run build` then static subpath server | PASS. No failed requests at four widths; 4K at 1440/1024; poster at 768/375; `?c=THA%2CKEN` restores Thailand and Kenya. |
| Screenshot matrix | `npm run shots:release` | PASS. `landing`, `globe`, `data`, `models`, `use`, `reliability`, `bowl`, plus full-page 1440/375. Console clean. |

Evidence lives in `audit/black-release/`:

- `ui-checks.json` — four-width computed styles, contrast, clearances and counts.
- `axe.json` — 16 combinations, 0 violations.
- `lighthouse-desktop.json` and `lighthouse-mobile.json` — full reports.
- `basepath-checks.json` — base-path network and deep-link evidence.
- `1440-*`, `1024-*`, `768-*`, `375-*` — official four-width matrix.
- `1024-webgl-off.png` — WebGL-disabled fallback.
- `console.json` — clean console log from the matrix.

`docs/screens/` contains the curated black screenshots used by the README and this report. `docs/interaction-report.json` is the machine-readable interaction transcript.

## Data and mathematics

No data value or IA number changed. The authoritative values remain Appendix A in `data/sample42.csv`.

- n = 42, 2019.
- Log fit: y = 5.927678825 ln x + 16.024564; r² = 0.768662883.
- Observed Singapore − Zimbabwe gap: 22.535 years.
- Model gap: 18.879168 years, 83.777093% of the observed gap.
- Linear r²: 0.554885127.
- Sensitivity excludes Nigeria and Chad: 40 countries, r = 0.925, 79.3276% of the gap reproduced.
- Life expectancy range: 53.0–84.4 years; GDP range $1,055–$120,678.

`data:fetch` and `data:all` were deliberately not run because the fetch step can overwrite authoritative Appendix A values. Verification scripts were run individually against the shipped CSV and the saved World Bank pull.

## Accessibility and performance

- axe: 0 violations across 1440/1024/768/375 × Data/Models/Using the model/Reliability.
- Primary text 17.6:1, body 11.3:1, secondary 6.8:1, smallest functional 4.8:1 on the black panel. Selected light controls use dark ink at 17.2:1.
- 44px targets for non-inline controls; skip link first; keyboard search and roving scatter points; visible focus; reduced motion disables camera flight, idle rotation, reveal and CSS transitions.
- No horizontal document overflow at any required width.
- 3D is deferred: desktop/tablet mount on idle; phones keep a 30 KiB poster and mount after “Open the globe”. If WebGL is unavailable, the stage reports why and the seven charts/tables remain.
- Bundle: app 114.62 kB, React 145.99 kB, React Three Fiber 153.40 kB, Three.js 666.65 kB, map 108.82 kB, d3 47.61 kB, shared vendor 10.90 kB, CSS 83.14 kB (16.29 kB gzipped) before minified gzip for JS. 3D chunks are lazy-loaded.

## Known limitations

- Physical-device validation (iOS Safari, Android Chrome) and screen-reader validation are **UNVERIFIED** on this machine. Automated Chromium coverage is complete.
- Mobile 3D is opt-in and still costs roughly 1–3 seconds of main-thread work on a mid-range phone. The report itself, not the globe, is the main mobile cost.
- B11 KaTeX remains blocked by the 50 kB gzipped dependency rule; native MathML is shipped.
- D1 is a partial tokenisation and F1 is a partial shared chart-frame abstraction. Neither changes a rendered style or interaction.
- Lighthouse performance is a single-run observation; desktop ranged 78–100 across repeated runs depending on whether the deferred 4K globe mount landed inside the trace. Mobile scored 97 on the final run.

## Deployment

The release is a normal commit on `main`, pushed without force. GitHub Actions builds with `BASE_PATH=/maths-ia-explorer/` and deploys GitHub Pages. The Surge mirror is rebuilt from the normal root build. Live verification and the release run ID are recorded in `PROGRESS.md` and `audit/live/` after deployment.
