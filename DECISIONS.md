# Decisions

## Open

### B11: KaTeX
KaTeX is 4.0 MB unpacked and its browser bundle is well above the 50 kB gzipped rule. The brief also says to ask before adding a dependency larger than 50 kB gzipped. I did not add it. The Working section was repaired with native MathML, aligned layout and a normalised p-value. If the owner approves, KaTeX can replace MathML in a follow-up.

Options:
1. Keep native MathML and fix layout/precision (current).
2. Add KaTeX after approval.
3. Use a smaller server-side rendered subset (not appropriate for a static site).

Recommendation: option 1 now; option 2 if the owner explicitly approves the size.

### A9: KaTeX credit
KaTeX is not bundled, so the Credits block lists the software actually shipped (three.js, react-three-fiber, D3, Instrument Sans, Lucide) and notes that KaTeX is not used. It would be inaccurate to credit a library the page does not load.

### A2: fiscal-year wording
The OGHIST workbook's FY2027 column is the current classification; the brief's example says "FY2027, July 2026". The site states both the fiscal year and the July date so there is no ambiguity. The 2019 comparison uses FY2020 (July 2019).

### D1: tokenisation is partial
The palette, type, spacing and motion tokens are in `src/styles/tokens.css`, but some component CSS still contains literal colours, radii and paddings. Those literals are consistent with the adjacent tokens and were left rather than risking a late global replacement. This is a maintainability gap, not a rendered-style inconsistency.

### Natural Earth version
The installed `world-atlas` package supplies `countries-110m.json`, derived from Natural Earth Admin 0 Countries at 1:110m. The exact Natural Earth release is not printed in the package metadata. The site names the dataset and scale and states that the boundary file is the `world-atlas` 1:110m build, rather than inventing a version number. A direct Natural Earth v5.1.2 download was used for the citation and for the coordinates source link.

## Resolved / recorded

- D4 is complete: the desktop panel is a pointer- and keyboard-resizable split view. Width ranges from 560px to 760px; the separator is a focusable `role="separator"` with `aria-valuenow`, arrow-key steps of 24px (48px with Shift), and Home/End. The visible rule is 8px wide, with a 44px effective pointer hit area. The splitter is hidden below 1201px, where the stage becomes a sticky band.
- Data values remain Appendix A values. The live World Bank pull is a verification only. `data:all` is deliberately not run because its first step (`data:fetch`) could overwrite the authoritative Appendix A values. `data:anchor`, `data:cross`, `data:verify`, `data:verify-live` and `data:verify-stats` are run individually.
- Coordinates are approximate capital-city positions, not World Bank country-endpoint coordinates, and do not enter the regression.
- The default selection is Zimbabwe and Singapore when the URL has no `c` parameter. This makes the IA exemplar visible on first paint instead of showing a pair in the context bar that was not actually selected. An explicit `c=` query still wins, and clearing selection stays cleared for the session.
- The initial 3D canvas is deferred for 2.8 s behind the Blue Marble poster. React, vendor, d3, three and react-three-fiber are separate chunks; module preloading is off and the deferred 3D preloads are stripped from `dist/index.html`. This is a performance decision, not a visual one.
- Lighthouse is run through `chrome-launcher` against the installed Chrome 150, with a fresh headless profile for each form factor. Playwright also launches the installed Chrome with `channel: 'chrome'` because the bundled Playwright browser is not installed in this checkout.
- Numerals use the system `--font-mono` stack. A webfont was rejected because it adds a download and a second licence for a small visual gain.
- The 641–1200px stage is 52dvh so the bowl controls can be a compact three-column strip and the bowl surface is not buried. The phone stage stays at 45dvh; the bowl's 3D target is shifted slightly up so its axis labels clear the control plate.
- G1 applies 44px targets to tabs, map tools, segmented controls, buttons, chips, search, disclosures, table sort buttons and rows, range inputs, and checkbox labels. Inline prose links, citation markers and inline text buttons are left at type size under the WCAG 2.5.8 inline exception. The 20px checkbox glyph sits inside a 44px label that is the actual target.
- F4 is complete for the scatter, the chart with individual country points: a roving tab stop, arrow/Home/End movement, Enter/Space selection, visible focus and an accessible name per point, verified by `npm run check:ui`. The other six charts use `role="img"` plus keyboard-accessible data tables, which is their point-level alternative.
- E4: phone country labels are lifted 12px so the Singapore label clears the zoom plate at 375px; the label and plate no longer overlap.
- D2 is settled by R5: the near-black colour is used for the stage and dark surfaces, and the reading panel stays warm paper. The remote `8ba8bce` black-console commit was rejected during the merge because it changed only tokens and an override block, left the screenshots and `docs/DESIGN.md` describing the light console, and would have inverted the primary button text.
- B16: the reported black band after scrolling was not the stage or panel losing height. The visually hidden accessible tables used `position: absolute` without `top`/`left`, so they took a static position down the reading column while their containing block was the page. They therefore escaped the panel's clipping and extended the document scroll height (900px viewport, 9489px document at 1440×900). Anchoring the 1px boxes at `top: 0; left: 0` with `clip-path: inset(50%)` keeps them available to assistive technology and removes the phantom page scroll. `check:ui` now asserts desktop document height equals the viewport and `window.scrollTo` leaves `scrollY` at 0, while 1024/768/375 still page-scroll normally.
- Deployment authorization: the repository rule “never deploy” was superseded by the owner’s explicit request on 22 October 2026 to publish the final version. The rebuild, the country-stats reveal and the globe surface pick were merged into `main` and pushed normally, without force-pushing. GitHub Actions run 39887371851 deployed https://peterachss.github.io/maths-ia-explorer/ as the canonical release; https://maths-ia-explorer.surge.sh/ remains a mirror. The earlier “blocked by missing credentials” note is resolved: `gh` is authenticated as `Peterachss` and `gh auth setup-git` configures the credential helper.
- B17 globe surface selection: a click on the sphere selects the nearest of the 42 capital markers within 7 degrees. The beams stay narrow data marks, so clicking a country's territory (not just its beam) works. A click is ignored after a drag longer than 8 px so orbiting cannot change the selection. The sphere stops propagation on hover and click, and because it is the front-most surface a far-side beam cannot hover or select. This is the owner's interaction feature ported onto the rebuilt Blue Marble globe rather than a revert to the older photoreal texture set.
- H4 GitHub Pages base path: `BASE_PATH=/maths-ia-explorer/` initially left the CSS external because `optimize-dist.mjs` resolved the stylesheet href without stripping the base prefix. The poster URL inside that external CSS then resolved to `/maths-ia-explorer/assets/textures/earth-poster.jpg` and returned 404. The script now strips `BASE_PATH` before resolving and inlining the stylesheet. The live build has no failed requests at any of the four widths.
- B18 Contents rail footer: the live rail ended with a two pixel reading-progress bar and an 11 pixel `2019` label. At the foot of the dark rail this read as a red and blue glitch. The footer is removed rather than restyled, so the rail ends at Sources; the scroll spy still marks the active destination, and 2019 remains in the context bar and the data tables.
- E8 Blue Marble texture: the published globe used a 1024 or 2048 pixel render, which blurred at the closest zoom. It now selects 8K when `maxTextureSize` is at least 8192, 4K below that, and 2K only when both the stage and the viewport are under 900 pixels. The viewport check matters: at 1440 the stage is about 830 pixels because the reading panel takes the rest, so a stage-only test served 2K to desktop. The border overlay is generated at 4096 and the sphere and border use 128 by 84 segments. This is a post-release fix on top of the parallel rebuild, not a revert to the older globe; surface picking remains.
- The B18/E8 fixes were published on 23 October 2026 under the same owner authorization. They are a normal commit on `main`, not a force-push, and preserve the H4 base-path fix, the D4 resizer, the B16 scroll fix and the B17 surface pick. Run 39919923719 deployed `ef05eaa`; the live 8K/2K selection, rail footer absence, anchors and four-width checks pass.

## Redesign, 26-27 October 2026

### R1: redesign shipped on main
The repository rules say to stay on `rebuild/nasa-grade` and never commit to main. The owner's 26 October request explicitly asked for the redesign to be finished, committed and verified on the live `main` branch, so that rule is superseded for this change. `origin/main` advanced five commits during the redesign, so the release is a normal merge of `origin/main` at `8ba8bce`, with no force-push. The earlier `rebuild/nasa-grade` history and the B18/E8 fixes are preserved.

### R2: phones keep the poster until asked
Phones (viewport at most 900px) do not auto-mount the Three.js scene. The 30 KiB Blue Marble poster is the first view and the "Open the globe" button mounts the canvas. Reason: on a 4x-throttled mobile CPU the scene costs 1-3 seconds of main-thread work; auto-mounting it competes with the report and made the mobile Lighthouse trace worse (56-77). The poster is a circular crop of the same NASA image, so the globe is still the first visual. Trade-off: rotation and zoom need one tap on a phone. Desktop and tablet mount on `requestIdleCallback` with a 6 s timeout.

### R3: texture tier changed from 8K-everywhere to device pixels
E8 previously served 8K to any desktop GPU with an 8192 texture limit. At 1440 the stage is about 600 CSS px, so the 8K file was a 4.3 MB download and a 134 MB GPU upload; profiling showed a 1.9 s long task immediately after the JPEG arrived. The tier is now 8K only when stage width times capped DPR is at least 2000; 1440 gets 4K (1.5 MB, about 0.5 s worst task) and phones get 2K. The border canvas is 4096 only on the same large stages and 2048 otherwise. The 8K tier still exists for large displays. This supersedes the E8 wording that every 8K-capable desktop gets 8K.

### R4: Lighthouse numbers are single-run evidence
The latest full-suite run (30 October 2026) is desktop 84/100/100/100 and mobile 93/100/100/100. Across repeated runs on this machine desktop performance ranged 78–99 and mobile 93–96. The spread follows whether the deferred r3f/three mount and the 4K texture decode land inside the Lighthouse trace: when the mount is captured, total blocking time is 330–470 ms; when it falls outside, the score reaches 99. The desktop payload is 1.9 MB; the mobile trace is 180 KiB with no Three.js. These are single-run observations, not guarantees. The durable evidence is the bundle sizes, the mount profile (`audit/perf-mount.mjs`) and the 0-violation axe sweep.

### R5: warm-paper panel retained; remote black console rejected
`origin/main` commit `8ba8bce` changed `tokens.css` to a black console and added a short block of dark-state overrides. It did not update the remote screenshots, and `docs/DESIGN.md` still said “Retain the globe and the light analysis console.” The black block also contained `.panel .btn.primary { color: #080808 }`, which has higher specificity than the redesign's `.btn.primary` and would have put black text on the dark button. The merge therefore restored the light token set and removed the dark override block. The warm-paper panel is the settled direction; the remote commit's functional improvements were kept: ISO-code matching, the explicit no-match state, keyboard navigation and larger citation/calculation superscripts. The remote one-off `scripts/ui-refinement-check.mjs` was retired because those assertions now live in `scripts/interaction-test.mjs`.
