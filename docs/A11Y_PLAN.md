# Accessibility plan and audit

## Standard

The target is WCAG 2.2 level AA, with the brief's 44 pixel touch target treated as a comfort goal rather than a hard requirement. The audit is mechanical where possible: `scripts/audit.mjs` loads the built app at 1440 by 900 and 375 by 812, measures the DOM, and writes `docs/audit.json`.

## Results

| Check | Desktop 1440 | Mobile 375 |
|---|---|---|
| Horizontal overflow | none | none |
| Document scroll width | 1440 | 375 |
| Interactive controls | 99 | 99 |
| Controls with no accessible name | 0 | 0 |
| SVG charts | 8 | 8 |
| SVGs with `role="img"` and a name | 8 | 8 |
| Images without alt text | 0 | 0 |
| h1 count | 1 | 1 |
| Skipped heading levels | 0 | 0 |
| Visible targets under 24 by 24 | 0 effective | 0 effective |
| Reduced motion honoured | yes | yes |

The 12 checkbox inputs that measure 16 by 16 are wrapped in labels with a minimum height of 24 pixels, and clicking the label toggles the box. The effective target is the label, not the square. The range inputs are 24 pixels high.

## Contrast

| Pair | Ratio | AA normal text (4.5:1) |
|---|---|---|
| paper-0 on ink-1 | 15.23 | pass |
| paper-1 on ink-1 | 10.07 | pass |
| paper-2 on ink-1 | 6.57 | pass |
| thread-text on ink-1 | 6.68 | pass |
| model-log on ink-1 | 9.73 | pass |
| model-linear on ink-1 | 7.55 | pass |

The pure thread colour `#e4572e` is used for the arc and for borders, not for small text. Text that needs vermilion uses `thread-text`, which is lighter.

## Keyboard

- Tab reaches the skip link, the stage tabs, search, the model toggles, the axis toggles, the country list, the sensitivity controls, the working button and the table row buttons.
- The stage tabs use `role="tab"` and `aria-selected`. They do not implement arrow key roving, because they are two buttons rather than a full tab panel; this is a deliberate simplification and is recorded as a minor gap.
- Escape clears the search field when it has focus.
- The globe itself is canvas and is not keyboard navigable. Every country is reachable through the search field and through the hidden 42 row table, which is the accessible equivalent of the scene.
- Focus is always visible: a 2 pixel vermilion outline with a 3 pixel offset.

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

1. **36 pixel buttons.** The stage tabs and toggles are below the 44 pixel comfort target. They pass WCAG 2.2 AA, whose minimum is 24 by 24.
2. **No roving tab index on the model toggles.** They are grouped visually but each is a separate tab stop.
3. **The globe has no keyboard rotation.** The search and the table are the accessible route to the same information.
4. **Colour is not the only encoding for life expectancy.** Pillar height carries the same value, and the selected country also has a label and a ring. The income group boxes use position and labels, not colour.
5. **The bowl's surface is not described in text beyond its summary paragraph.** The sliders and the SSE readout give the same information numerically.

## How to re-run

```bash
npm run build
npm run preview -- --port 4173
node scripts/audit.mjs
```

The JSON is written to `docs/audit.json`. Contrast is computed from the palette constants in the same script, so a palette change is caught by the next run.
