# Accessibility plan and audit

## Standard

The target is WCAG 2.2 level AA. The release gate combines `scripts/check-ui.mjs` across all four required widths, `scripts/interaction-test.mjs` for keyboard and control behaviour, and `scripts/audit.ts` (axe-core over 16 width/chapter combinations plus Lighthouse). `scripts/audit.mjs` is the quick DOM/contrast pass and writes `docs/audit.json`.

The 44px target is enforced for all non-inline controls and checkbox labels; the documented WCAG 2.5.8 inline-prose exception covers citation markers and inline text links.

## Results

| Check | Black release |
|---|---|---|
| Horizontal overflow at 1440/1024/768/375 | none |
| Document scroll width | equals the viewport at every width |
| Interactive controls (quick DOM pass) | 228 |
| Controls with no accessible name | 0 |
| SVG elements / unlabelled | 33 / 0 |
| Images without alt text | 0 |
| h1 count / skipped heading levels | 1 / 0 |
| Non-inline targets under 44px | 0 |
| Checkbox labels under 44px | 0 of 43 at 1440 |
| Reduced motion honoured | yes (animation `1e-05s`, scroll `auto`) |
| WebGL off | fallback text, 0 canvases, 7 charts, 0 page errors |
| axe-core | 0 violations across 16 width/chapter combinations |

The quick audit lists inline citation links and the nested checkbox glyph as small targets; `check-ui` measures the actual interactive label and the documented inline-prose exception. The gap badge, stage tabs, map tools, section select, copy controls and primary buttons meet the 44px goal.

## Contrast

| Pair | Ratio | AA normal text (4.5:1) |
|---|---|---|
| primary text on panel (`#f4f1ea` / `#080a0d`) | 17.6 | pass |
| body text on panel (`#c8c3b9` / `#080a0d`) | 11.3 | pass |
| secondary text on panel (`#9c978e` / `#080a0d`) | 6.8 | pass |
| smallest functional text on panel (`#817c73` / `#080a0d`) | 4.8 | pass |
| context mono on surface (`#9c978e` / `#0d1015`) | 6.6 | pass |
| coral ink on panel (`#ff9b84` / `#080a0d`) | 9.7 | pass |
| positive ink on pill (`#b7f0e2` / `#102a26`) | 12.0 | pass |
| dark ink on light primary button (`#090b0e` / `#f2efe8`) | 17.2 | pass |

Light backgrounds are limited to selected/primary controls and chart marks. The coral thread is used for the arc and borders; coral text uses the lighter `#ff9b84` ink.

## Keyboard

- Tab reaches the skip link, the stage tabs, copy-view, search, the model toggles, the axis toggles, the country list, the sensitivity controls, the chart actions, the working button and the table row buttons.
- Search is an ARIA combobox: wrapping ArrowUp/ArrowDown, Home/End, Enter, Escape, `aria-activedescendant`, selected-country tags and a no-match state.
- The stage tabs use `role="tab"` and `aria-selected`. They are two buttons rather than a full tab panel, so each remains a Tab stop.
- Escape clears or closes the search when it has focus.
- The globe itself is canvas and is not keyboard navigable. Every country is reachable through the search field and through the hidden 42 row table, which is the accessible equivalent of the scene.
- Focus is always visible: a 2 pixel blue outline (`#6cb2ff`) with a 3 pixel offset.

## Screen readers

- A polite live region announces selections, exclusions and resets.
- Every chart has a `<title>`, a `role="img"` and an `aria-label` that states the takeaway, not just the chart type. For example, the inverse chart's label says the income at which the model predicts Singapore's life expectancy.
- The hidden table gives all 42 rows with country, income group, GDP, life expectancy, model value and residual. The country name is a button that selects the row.
- Decorative SVG lines and grids are not announced.

## Motion

- CSS transitions and animations collapse to 0.01 ms under `prefers-reduced-motion`.
- `prefersReducedMotion()` is checked in the camera rig, the globe drift and the preview pillar, so the 3D scene stops moving as well.
- No parallax, no scroll hijack, no autoplaying video.

## Known gaps

1. **Manual screen-reader testing is UNVERIFIED.** The automated axe pass, landmark/heading checks, live regions and hidden tables are clean, but NVDA/VoiceOver sessions have not been run on this machine.
2. **The globe has no keyboard rotation.** Search and the 42-row table are the accessible route to the same information.
3. **Colour is not the only encoding for life expectancy.** Pillar height carries the same value, and the selected country also has a label and a ring. The income-group boxes use position and labels, not colour.
4. **The bowl's surface is not described in text beyond its summary paragraph.** The sliders and the SSE readout give the same information numerically.

## How to re-run

```bash
npm run build
npm run preview -- --port 4173
node scripts/audit.mjs
```

```bash
npm run check:ui
URL=http://127.0.0.1:4173/ npm run audit
```

The quick JSON is written to `docs/audit.json`; the release evidence is `audit/black-release/ui-checks.json`, `axe.json` and `lighthouse-*.json`. Contrast in the quick script is computed from the black palette constants, so a palette change is caught by the next run.
