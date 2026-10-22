# Design

## The world

The explorer is a photoreal Earth held inside a graphite instrument panel. The globe supplies place and atmosphere; the panel supplies the argument. The interface should feel like a map someone uses, not a dashboard someone presents.

The visual direction is deliberately narrow. The stage is a NASA Blue Marble Next Generation globe with an atmospheric rim, runtime country borders, a graticule and a quiet star field. The untraceable cloud, normal and specular textures were removed; the Blue Marble surface, not invented shading, carries the place. The chrome is solid graphite, separated by one-pixel rules, with a blue accent for actions, a warm gold for the logarithmic model and a coral thread for the observed gap. Life expectancy itself uses one sequential teal ramp, never a rainbow. There is no frosted glass, no neon, no rainbow bowl and no decorative statistic.

The imagery is illustrative. It is a visual basemap, not a 2019 data layer, and the map attribution and the Sources note both say so.

## Palette

| Token | Hex | Use |
|---|---|---|
| ink-0 | `#05080d` | page and stage background |
| ink-1 | `#0f141b` | raised dark stage surfaces |
| ink-2 | `#171f28` | raised controls and cards |
| rule | `#26303c` | hairlines and borders |
| rule-soft | `#1d2631` | quiet separators |
| paper-0 | `#f4f7fb` | headings and primary text |
| paper-1 | `#c2ccd8` | body text |
| paper-2 | `#8b98a8` | secondary text |
| thread | `#ff6b4a` | the Singapore to Zimbabwe arc, the selected pillar and selection |
| thread-text | `#ff8a70` | coral text, lightened for contrast |
| model-linear | `#5aa7ff` | straight line |
| model-log | `#ffc247` | logarithmic curve |
| life-0 | `#2f6f6a` | lowest life expectancy on the teal ramp |
| life-1 | `#59a79b` | low to middle life expectancy |
| life-2 | `#9bd8c9` | middle to high life expectancy |
| life-3 | `#d8f5ec` | highest life expectancy, also the box-plot median |
| land | `#1b2634` | globe land tint |
| sea | `#08111c` | globe ocean tint |
| accent | `#4c9aff` | links and active highlights |
| accent-2 | `#1a73e8` | primary button, white text |
| focus | `#6cb2ff` | focus ring |

The reading panel keeps its own light analytics ramp, because the earlier approved collage direction is a light panel beside a near-black globe. The tokens are `surface-0 #ffffff`, `surface-1 #fbfbfc`, `surface-2 #f4f5f7`, `line-1 #e8eaed`, `text-0 #16181d`, `text-1 #4b5058` and `accent-blue #2563eb`. This light/dark split is the unresolved D2 direction recorded in `DECISIONS.md`; the stage is dark, the reading surface is light.

The palette lives in `src/styles/tokens.css` and `src/theme.ts`. The audit reads the real values, not a separate copy.

## Type

Instrument Sans Variable carries the interface. It is a neutral grotesque with a tall x-height and open apertures. Headings gain weight and size, not a second family. Body text is 1rem at 1.55 line height. Labels are sentence case at 12px or larger. Numbers use the `--font-mono` system stack so computed values read as measurements rather than prose; no extra font dependency is loaded. The full reasoning is in `docs/TYPE_DECISION.md`.

The reading panel uses a 34px product title on desktop, 22px on a phone, 16–23px section headings and 16px body copy. The smallest functional text is the 8.5–9.5px map attribution; chart ticks are 11–13px. This is deliberately tiny because the attribution is a persistent credit, not a control, and it remains legible against the dark plate.

## Layout

The desktop view is a split view: a stage on the left and a scrolling panel on the right. The panel starts at 45 percent of the viewport (648px at 1440px) and can be dragged between 560px and 760px; an 8px visual rule has a 44px pointer hit area and a keyboard separator contract. The stage stays in view while the argument moves. A sticky section index sits flush at the top of the panel when it sticks, and section headings carry a 76px scroll margin so they clear the index.

Below 1201px the stage becomes a sticky band and the report reads underneath it. From 641 to 1200px the band is 52dvh; at 640px and below it is 45dvh. The section index becomes a native select in one 44px row, and headings carry a `52dvh + 84px` (tablet) or `45dvh + 88px` (phone) scroll margin so they land below the stage, context bar and select. The bowl controls become a compact three-column strip at tablet widths; on a phone they remain two columns with a full-width snap button.

The split view was chosen over a full page scrollytelling site because it keeps the globe available at every step and avoids scroll hijacking. The trade-off is that a full page screenshot only captures one panel position, which is why the screenshots are taken section by section.

## Map chrome

The stage tabs, zoom buttons, reset, legend and attribution use solid graphite surfaces; only the 3D labels float. Frosted glass was rejected because it smeared the globe behind the controls and made the panel feel like a generic dashboard. The legend reads the actual minimum and maximum in the sample (53.0 to 84.4 years), not the two anchor countries, so the bar cannot imply a range it does not cover. The attribution is always visible and says the basemap is illustrative.

## Charts

Seven hand-built SVG figures: scatter with both fits, residuals for each model, the gap, the derivative, the inverse and box plots by income group. Life expectancy is a single sequential teal ramp, shared by the pillars, the preview and the scatter dots, so hue never pretends that a continuous variable is a category. The straight line is blue, the logarithmic curve is gold, the observed gap and the selected country are coral. The axes use thin rules and tabular numbers, and each figure has a sentence-length accessible name. Six use `role="img"`; the scatter uses `role="group"` so its individual country points can be reached and moved with the keyboard. The least squares bowl is a separate 3D view with a blue to sand error ramp, not a category rainbow.

## Motion

Camera flights are slow and interruptible. The globe has a gentle idle rotation only when the user has not taken control. Sections rise 14px into place once, with a 50ms stagger across their children; the scene itself supplies the continuous motion. Buttons respond with a 0.975 scale press, not a lift.

The 3D canvas is deferred for 2.8s behind a Blue Marble poster and an “Open now” button, so the initial document does not pay for three.js or react-three-fiber. Reduce-motion disables the flight, idle rotation, section reveal and CSS transitions. If 3D cannot start, the stage reports it in text and the seven charts and tables remain. The boot screen is a quiet loading state, not a performance.

## What was rejected

- A business dashboard: it would make 42 countries feel like a quarterly report.
- A printed star chart: it made the planet feel like a diagram, not a place.
- Frosted glass chrome: it reduced contrast and looked like a generic product demo.
- A rainbow error bowl: hue implied categories where the surface is continuous.
- A second display typeface: it added a voice the instrument panel did not need.
