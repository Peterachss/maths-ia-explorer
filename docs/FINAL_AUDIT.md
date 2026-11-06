# Final audit — black release

**Date:** 6 November 2026
**Build:** all-black console rebased onto `da24f24`; release commit `b9c594a`
**Scope:** interface, accessibility, data integrity, base path, build and tests
**Viewports:** 1440×900, 1024×768, 768×1024, 375×812

## Verdict

PASS for the automated release criteria. The upstream `da24f24` hierarchy pass is preserved, the reading console is black at every rendered width, every IA value is unchanged, all four widths render without document overflow, all seven charts have export and full-screen controls, and the GitHub Pages base path loads without a failed request.

Two items remain explicitly **UNVERIFIED**: physical-device testing (iOS Safari / Android Chrome) and a manual screen-reader pass. They are limits of this machine, not observed failures. B11 KaTeX remains blocked by the 50 kB gzipped dependency rule; native MathML is shipped.

## Data integrity

| Check | Result |
|---|---|
| Appendix A | 42 rows, 42 unique ISO3 codes, every required column present. |
| Saved World Bank pull | 42 rows; every appendix row has both live values. |
| Live values | 84 values re-downloaded; GDP max relative difference 0.0004% (BDI); life max absolute difference 0.000463 years (NOR). |
| Anchors | 11/11 pass. |
| Statistics | 68/68 pass. |
| Cross-check | 42 countries plus the 40-country sensitivity fit; Python recomputation agrees. |
| Values | No IA number changed. The log fit, r², 22.535-year gap, 18.879-year model gap and 83.777% share are unchanged. |

`data:fetch` and `data:all` were not run; they can overwrite the authoritative Appendix A values.

## Visual and interaction checks

- Panel background computed as `rgb(8, 10, 13)` at all four widths. A rendered-element scan found light backgrounds only on intentional selected/primary controls and chart marks.
- Contrast: primary 17.6:1, body 11.3:1, secondary 6.8:1, smallest functional 4.8:1, light primary-button ink 17.2:1. All pass WCAG AA; most pass AAA.
- Gap badge: 14px clear of the stage tabs at 1440, 1024, 768 and 375. It retains the model context on mobile and displays the measured 22.5-year gap.
- Sticky chapter headings land 24px (1024), 24px (768) and 26px (375) below the sticky chrome.
- No horizontal document overflow at any required width. The 1440 country table uses its natural width so the residual column is not clipped.
- 43 checkbox labels meet the 44px target at 1440; interactive controls, chips, table sort buttons and rows follow the same rule with the documented inline-prose exception.
- Seven chart full-screen controls; two copy-view controls; chart export targets the chart SVG and produces a dark PNG/SVG.
- Keyboard search: wrapping ArrowUp/ArrowDown, Home/End, Enter/Escape, `aria-activedescendant`, selected-country tags, no-match state.
- The interaction sweep passes 31 desktop steps and 11 mobile steps, including the data-error path. No console, page, request or HTTP errors.
- Reduced motion resolves CSS transitions to `1e-05s` and scroll behaviour to `auto`.
- WebGL-off fallback shows the explanatory text, zero canvases, seven charts and zero page errors.

## Accessibility

- axe-core: 0 violations across 16 width/chapter combinations.
- Skip link is the first Tab target and moves focus to `#main-content`.
- The scatter has roving keyboard points; other charts provide accessible names and data tables.
- Headings, landmarks, table captions, form labels and live-region copy feedback were checked as part of the axe sweep.
- Automated scans cannot replace a manual screen-reader session. That session is **UNVERIFIED**.

## Performance

- Lighthouse desktop: 100 performance, 100 accessibility, 100 best practices, 100 SEO (final run; 84 on the preceding run).
- Lighthouse mobile: 97 / 100 / 100 / 100.
- Desktop trace includes the deferred 4K globe; mobile is the poster path. Desktop varied 78–100 across repeated runs depending on when the deferred mount landed in the trace.
- Build: CSS 80.60 kB / 15.74 kB gzipped. JS: app 112.89 kB, React 145.99 kB, r3f 153.40 kB, Three.js 666.65 kB, map 108.82 kB, d3 47.61 kB, vendor 10.90 kB before JavaScript gzip. The 3D chunks are lazy loaded.
- Mobile keeps the poster until “Open the globe”; the scene costs roughly 1–3 seconds of main-thread work on a mid-range phone.

## Live deployment

GitHub Pages run 42253556050 passed for commit `d34138a`. The live site at 1440, 1024, 768 and 375 showed the black panel, 14px badge clearance, the deep link restoring Thailand and Kenya, working clipboard copy, full-screen charts, and no console, request or HTTP errors. The live interaction sweep passed 31 desktop and 11 mobile steps. The live axe sweep returned 0 violations across 16 combinations; live Lighthouse measured desktop 100/100/100/100 and mobile 98/100/100/100 (single run). The Surge mirror passed the same width, deep-link, copy and full-screen checks. Evidence: `audit/live/black-release/checks.json`, `audit/live/black-release/interaction-report.json`, `audit/live/surge/checks.json`.

## Base path and deployment

`BASE_PATH=/maths-ia-explorer/ npm run build` was served from a subpath and checked at all four widths: no failed requests, 4K texture at 1440 and 1024, poster at 768 and 375, deep link `?c=THA%2CKEN` restores Thailand and Kenya. GitHub Pages is canonical; Surge is the mirror. Deployment is a normal push to `main`, never a force-push.

## Evidence

- `audit/black-release/ui-checks.json`
- `audit/black-release/axe.json`
- `audit/black-release/lighthouse-desktop.json`
- `audit/black-release/lighthouse-mobile.json`
- `audit/black-release/basepath-checks.json`
- `audit/black-release/{1440,1024,768,375}-{landing,globe,data,models,use,reliability,bowl}.png`
- `audit/black-release/1440-full.png`, `375-full.png`, `1024-webgl-off.png`, `console.json`
- `docs/interaction-report.json`
- `docs/screens/` — curated black screenshots
- `docs/BUILD.txt`, `docs/TEST_RUN.txt`
