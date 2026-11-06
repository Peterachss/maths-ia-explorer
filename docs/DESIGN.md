# Design

## The world

The explorer is a photoreal Earth held inside an all-black instrument panel. The globe supplies place and atmosphere; the black console supplies the argument. The interface should feel like a map someone uses in a darkened reading room, not a dashboard someone presents.

The stage is a NASA Blue Marble Next Generation globe with an atmospheric rim, runtime country borders, a graticule and a quiet star field. The untraceable cloud, normal and specular textures were removed; the Blue Marble surface, not invented shading, carries the place. Chrome is solid black or near-black, separated by one-pixel rules. The coral thread marks the observed gap and selection; the logarithmic model is warm gold and the straight line is blue. Life expectancy itself uses one sequential teal ramp, never a rainbow. There are dark scrims behind the small stage controls, but no white frosted panels, no neon, no rainbow bowl and no decorative statistic.

The imagery is illustrative. It is a visual basemap, not a 2019 data layer, and the map attribution and the Sources note both say so.

## Palette

The base stage palette remains in `src/styles/tokens.css` and `src/theme.ts`. The console palette is applied by `src/styles/black.css`, loaded after `redesign.css`, so the R1 layout and chart geometry are preserved while every reading surface becomes black.

| Token | Hex | Use |
|---|---|---|
| page / stage | `#070a0e` | page background and the stage's own dark field |
| surface-0 | `#0d1015` | cards, tables and chart frames |
| surface-1 | `#12161c` | masthead, controls, toolbars |
| surface-2 | `#080a0d` | the reading panel |
| surface-3 | `#1c222b` | raised or hovered rows |
| line-1 | `#232933` | hairlines and borders |
| line-2 | `#363d48` | stronger boundaries and focus outlines |
| text-0 | `#f4f1ea` | headings and primary text |
| text-1 | `#c8c3b9` | body text |
| text-2 | `#9c978e` | secondary labels and metadata |
| text-3 | `#817c73` | smallest functional labels |
| ink-button | `#f2efe8` | selected/primary control surface |
| accent-blue | `#82b9ff` | links and focus |
| chart-thread | `#ff7457` | the Singapore–Zimbabwe arc, observed-gap bars and selection |
| chart-thread-ink | `#ff9b84` | coral text on black |
| chart-log | `#f1b95e` | logarithmic model |
| chart-linear | `#7cb2ff` | straight-line model |
| positive-bg / positive-ink | `#102a26` / `#b7f0e2` | selected and positive pills |
| chart-grid / chart-axis | `#20252d` / `#353b45` | chart rules and ticks |

The reading panel is `rgb(8, 10, 13)`. Only selected or primary controls invert to a light surface (`#f2efe8`), with dark ink at 17.2:1. Panel primary text measures 17.6:1, body text 11.3:1, secondary text 6.8:1 and the smallest functional label 4.8:1. These are deliberate control states, not a light theme.

## Type

Instrument Sans Variable carries the interface. It is a neutral grotesque with a tall x-height and open apertures. Headings gain weight and size, not a second family. Body text is 1rem at 1.55 line height. Labels are sentence case at 12px or larger. Numbers use the `--font-mono` system stack so computed values read as measurements rather than prose; no extra font dependency is loaded. The full reasoning is in `docs/TYPE_DECISION.md`.

The reading panel uses a `clamp(26px, 2.6vw, 34px)` product title, 16–23px section headings and 16px body copy. Chart ticks are 11–13.5px. The smallest functional text is the 8–9.5px map attribution or model-context line; attribution is a persistent credit, not a control, and stays legible against the dark plate. The gap badge uses the interface face for its headline and the mono face only for measured numbers.

## Layout

The desktop view is a split view: a stage on the left, a 152px typographic contents rail, and a scrolling black reading panel on the right. The panel starts at 53 percent of the viewport, capped at 800px and floored at 600px. A 6px visual rule has a 44px pointer hit area and a keyboard separator contract. The stage stays in view while the argument moves. The contents rail is a report index, not an icon dock: each chapter is a group heading with its pages underneath, and the active page is marked by a coral rule.

Below 1201px the rail disappears and the stage becomes a sticky band above the report. The band is 48dvh at tablet widths and 40dvh on a phone; it grows to 48dvh only when the least-squares bowl is active. The contents index becomes a native select in one 44px row, followed by a copy-link control. Headings carry a scroll margin that lands them below the stage, context strip and select; at 1024/768/375 the measured clearance is 24/24/26px.

At 1440 the reading column is about 550px wide. The country table keeps its natural width so the residual column is not clipped; wider stacked layouts already fit it.

The split view was chosen over a full page scrollytelling site because it keeps the globe available at every step and avoids scroll hijacking. The trade-off is that a full page screenshot only captures one panel position, which is why the screenshots are taken section by section.

## Map chrome

The stage tabs sit top left, zoom/reset bottom right, the life-expectancy legend bottom left and the attribution along the bottom. The observed-gap badge sits immediately below the tabs, aligned right on desktop/tablet and left on phones. Its top edge clears the tabs by 14px at 1440, 1024, 768 and 375. It reports the 22.5-year observed gap, then the income-model prediction and share of the gap reproduced; this keeps the map's headline and the model's explanation in one place without colliding with the Globe / Least squares bowl tabs.

The gap badge headline uses Instrument Sans, not the mono face. The measured number itself uses mono tabular numerals. On phones the model line stays visible while the redundant "Zimbabwe to Singapore" subtitle is hidden to save height.

The stage tabs, zoom buttons, legend and attribution use black/near-black scrims; only the 3D labels float. Light frosted glass was rejected because it smeared the globe behind the controls and made the panel feel like a generic dashboard. The legend reads the actual minimum and maximum in the sample (53.0 to 84.4 years), not the two anchor countries, so the bar cannot imply a range it does not cover. The attribution is always visible and says the basemap is illustrative.

## Charts

Seven hand-built SVG figures: scatter with the active fit, residuals for the active model, the gap, the derivative, the inverse, the leave-two-out sensitivity dumbbell and box plots by income group. One active-model control drives the scatter, residuals, gap, derivative, inverse, headline and working, so a reader cannot compare a logarithmic chart with a straight-line claim. Life expectancy is a single sequential teal ramp, shared by the pillars, the preview and the scatter dots, so hue never pretends that a continuous variable is a category. The straight line is blue, the logarithmic curve is gold, the observed gap and the selected country are coral. The axes use thin rules and tabular numbers, and each figure has a sentence-length accessible name. Six use `role="img"`; the scatter uses `role="group"` so its individual country points can be reached and moved with the keyboard.

Each chart exports PNG, SVG and, where it has a table, CSV. Exports target `svg[role="group"]` or `svg[role="img"]`, inline the computed styles and draw a `#0d1015` backdrop so the downloaded chart remains readable outside the app. The chart-actions bar also offers full screen above 640px; full screen centres the figure on a black surface and keeps the exit control in the same place.

## Motion

Camera flights are slow and interruptible. The globe has a gentle idle rotation only when the user has not taken control. Sections rise 14px into place once, with a 50ms stagger across their children; the scene itself supplies the continuous motion. Buttons respond with a 0.975 scale press, not a lift.

The 3D canvas is deferred behind a Blue Marble poster. Desktop and tablet mount the scene on `requestIdleCallback` with a 6s timeout; phones keep the 30 KiB poster until the reader presses “Open the globe”, because the scene costs one to three seconds of main-thread work on a mid-range phone. Reduce-motion disables the flight, idle rotation, section reveal and CSS transitions. If 3D cannot start, the stage reports it in text and the seven charts and tables remain. The boot screen is a quiet loading state, not a performance.

## Interaction details

- Country search is an ARIA combobox with name and ISO-code matching. ArrowUp/ArrowDown wrap, Home/End jump to the first/last hit, Enter selects, Escape clears, and already-selected countries carry a visible `Selected` tag.
- Copy-view controls in the desktop masthead and the mobile contents row copy the current URL, including `c`, `x` and `m` state, and announce success through a live region.
- The contents select updates from the same scroll observer as the desktop rail. Section headings land clear of the sticky chrome rather than under it.
- Every chart with tabular data retains its visually hidden accessible table. The scatter's country points are keyboard reachable with a roving tab stop.

## History and decisions

R1 introduced the dark stage and the warm-paper console. The owner then asked for an all-black interface, so the warm-paper direction (R5) is superseded by R6: the black layer keeps R1's three-column layout, 152px rail, globe and charts, and only changes surfaces, ink and the specific fixes above. The release was rebased onto the upstream `da24f24` hierarchy pass: chapter numbers, kickers, card metadata and the rail numeral stay removed, the masthead metadata sits below the title, and the KPI value precedes its label. The copy-view control sits at the end of the masthead metadata row. The older backup branch contains an earlier black layout on a different base and is not the shipped design. The remote warm-paper screenshots and the claims that depended on them were replaced by `audit/black-release/` and `docs/screens/`.

Verified with 46 unit/data tests, 31 desktop and 11 mobile interaction steps, a 16-combination axe sweep with zero violations, Lighthouse desktop 100 / mobile 97 on the final run (desktop 84 on the preceding run), the four-width UI checks and a GitHub Pages base-path run with no failed requests.
