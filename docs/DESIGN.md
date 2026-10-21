# Design

## The world

The explorer is a photoreal Earth held inside a graphite instrument panel. The globe supplies place and atmosphere; the panel supplies the argument. The interface should feel like a map someone uses, not a dashboard someone presents.

The visual direction is deliberately narrow. The stage is a NASA Blue Marble globe with a terrain normal map, ocean specular, a thin cloud layer, an atmospheric rim and a quiet star field. The chrome is solid graphite, separated by one-pixel rules, with a single blue accent and a coral thread for the observed gap. There is no frosted glass, no neon, no rainbow bowl and no decorative statistic.

The imagery is illustrative. It is a visual basemap, not a 2019 data layer, and the map attribution and the Sources note both say so.

## Palette

| Token | Hex | Use |
|---|---|---|
| ink-0 | `#05080d` | page and stage background |
| ink-1 | `#0f141b` | panel background |
| ink-2 | `#171f28` | raised controls and cards |
| rule | `#26303c` | hairlines and borders |
| rule-soft | `#1d2631` | quiet separators |
| paper-0 | `#f4f7fb` | headings and primary text |
| paper-1 | `#c2ccd8` | body text |
| paper-2 | `#8b98a8` | secondary text |
| thread | `#ff6b4a` | the Singapore to Zimbabwe arc and selection |
| thread-text | `#ff8a70` | coral text, lightened for contrast |
| model-linear | `#5aa7ff` | straight line |
| model-log | `#ffc247` | logarithmic curve |
| land | `#1b2634` | globe land tint |
| sea | `#08111c` | globe ocean tint |
| accent | `#4c9aff` | links and active highlights |
| accent-2 | `#1a73e8` | primary button, white text |
| focus | `#6cb2ff` | focus ring |

The palette lives in `src/styles/tokens.css` and `src/theme.ts`. The audit reads the real values, not a separate copy.

## Type

Instrument Sans Variable is the only typeface. It is a neutral grotesque with a tall x-height, open apertures and tabular figures. Headings gain weight and size, not a second family. Body text is 1rem at 1.55 line height; small labels use uppercase and tracking; numbers use tabular figures so columns line up. The full reasoning is in `docs/TYPE_DECISION.md`.

## Layout

The desktop view is a split view: a stage on the left and a scrolling panel on the right. The stage stays in view while the argument moves. A sticky section index sits under the panel header and fits in one line at 1440. On mobile the stage becomes a 52dvh sticky band and the section index becomes a native select in one 44 pixel row. The panel is the reading surface, not a second dashboard.

The split view was chosen over a full page scrollytelling site because it keeps the globe available at every step and avoids scroll hijacking. The trade-off is that a full page screenshot only captures one panel position, which is why the screenshots are taken section by section.

## Map chrome

The stage tabs, zoom buttons, reset, legend and attribution use solid graphite surfaces. Frosted glass was rejected because it smeared the globe behind the controls and made the panel feel like a generic dashboard. The attribution is always visible and says the basemap is illustrative.

## Charts

Seven hand-built SVG figures: scatter with both fits, residuals for each model, the gap, the derivative, the inverse and box plots by income group. The straight line is blue, the logarithmic curve is gold, the observed gap is coral. The axes use thin rules and tabular numbers, and each figure has a `role="img"` and a sentence-length accessible name. The least squares bowl is a separate 3D view with a blue to sand error ramp, not a category rainbow.

## Motion

Camera flights are slow and interruptible. The globe has a gentle idle rotation only when the user has not taken control. Reduced motion disables the flight, the idle rotation and CSS transitions. The boot screen is a quiet loading state, not a performance.

## What was rejected

- A business dashboard: it would make 42 countries feel like a quarterly report.
- A printed star chart: it made the planet feel like a diagram, not a place.
- Frosted glass chrome: it reduced contrast and looked like a generic product demo.
- A rainbow error bowl: hue implied categories where the surface is continuous.
- A second display typeface: it added a voice the instrument panel did not need.
