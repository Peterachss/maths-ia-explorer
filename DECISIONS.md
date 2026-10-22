# Decisions

## Open

### D2: light panel versus near-black interface
The new brief asks for a near-black app background (`#0B0D10`). The earlier approved direction, based on the supplied collage, is a light analytics dashboard with the globe on a near-black stage. Changing the panel to near-black now would reverse that approved visual direction and discard the working light tokens.

Options:
1. Keep the light panel and treat near-black as the stage colour (current).
2. Convert the whole interface to near-black and rebuild the light tokens.
3. Offer a light/dark preference.

Recommendation: option 1 for this rebuild, because the earlier collage request is explicit and the current panel already meets the calm, source-led brief. Logged for the owner to confirm.

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

### D4: resizable desktop panel
The phase table mentions a resizable panel. The shipped desktop layout uses `clamp(36rem, 45vw, 44rem)` so the map keeps a predictable 55 percent at 1440px. A drag handle was not added because it would introduce a second layout state, a pointer and keyboard contract, and new screenshot coverage without improving the IA. The prose is constrained inside the panel instead.

Options:
1. Keep the fixed clamp (current).
2. Add a pointer/keyboard splitter with persisted width.
3. Offer two named widths (map-first, reading-first).

Recommendation: option 1 for this submission; option 3 if the owner wants a choice without freeform dragging.

### D1: tokenisation is partial
The palette, type, spacing and motion tokens are in `src/styles/tokens.css`, but some component CSS still contains literal colours, radii and paddings. Those literals are consistent with the adjacent tokens and were left rather than risking a late global replacement. This is a maintainability gap, not a rendered-style inconsistency.

### Natural Earth version
The installed `world-atlas` package supplies `countries-110m.json`, derived from Natural Earth Admin 0 Countries at 1:110m. The exact Natural Earth release is not printed in the package metadata. The site names the dataset and scale and states that the boundary file is the `world-atlas` 1:110m build, rather than inventing a version number. A direct Natural Earth v5.1.2 download was used for the citation and for the coordinates source link.

## Resolved / recorded

- Data values remain Appendix A values. The live World Bank pull is a verification only. `data:all` is deliberately not run because its first step (`data:fetch`) could overwrite the authoritative Appendix A values. `data:anchor`, `data:cross`, `data:verify`, `data:verify-live` and `data:verify-stats` are run individually.
- Coordinates are approximate capital-city positions, not World Bank country-endpoint coordinates, and do not enter the regression.
- The default selection is Zimbabwe and Singapore when the URL has no `c` parameter. This makes the IA exemplar visible on first paint instead of showing a pair in the context bar that was not actually selected. An explicit `c=` query still wins, and clearing selection stays cleared for the session.
- The initial 3D canvas is deferred for 2.8 s behind the Blue Marble poster. React, vendor, d3, three and react-three-fiber are separate chunks; module preloading is off and the deferred 3D preloads are stripped from `dist/index.html`. This is a performance decision, not a visual one.
- Lighthouse is run through Playwright's Chromium with `CHROME_PATH` because installed Chrome 150 hangs past the 30-second navigation timeout. The scores in `REPORT.md` are from that pinned browser.
- Numerals use the system `--font-mono` stack. A webfont was rejected because it adds a download and a second licence for a small visual gain.
- The 641–1200px stage is 52dvh so the bowl controls can be a compact three-column strip and the bowl surface is not buried. The phone stage stays at 45dvh; the bowl's 3D target is shifted slightly up so its axis labels clear the control plate.
- G1 applies 44px targets to tabs, map tools, segmented controls, buttons, chips, search, disclosures, table sort buttons and rows, range inputs, and checkbox labels. Inline prose links, citation markers and inline text buttons are left at type size under the WCAG 2.5.8 inline exception. The 20px checkbox glyph sits inside a 44px label that is the actual target.
- F1/F4 remain partial: charts share export and hidden data-table plumbing, but point-level keyboard navigation is provided by the visible sortable country table rather than arrow keys on each SVG. This is an honest accessibility trade-off, not a claim of full chart interaction.
- The light panel/dark stage conflict (D2) remains open for the owner. The near-black colour is used for the stage and dark surfaces; the reading panel stays light because that was the earlier approved collage direction.
