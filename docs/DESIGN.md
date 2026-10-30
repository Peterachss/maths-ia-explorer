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

The reading panel is warm paper, not white: `surface-0 #fffdf8`, `surface-1 #faf6ee`, `surface-2 #f3eee4`, `line-1 #e5ded1`, `text-0 #1b1a17`, `text-1 #514c45`, `text-2 #635c52`, `text-3 #686156`, `accent-blue #1f5f5a`, `chart-thread #c34e31` and `chart-thread-ink #a33f28`. The coral rule is reserved for the observed gap and selection; small coral text uses the darker ink token. The light/dark split is a settled direction (R5), not an open question: the stage is dark, the reading surface is warm paper.

The palette lives in `src/styles/tokens.css` and `src/theme.ts`. The audit reads the real values, not a separate copy.

## Type

Instrument Sans Variable carries the interface. It is a neutral grotesque with a tall x-height and open apertures. Headings gain weight and size, not a second family. Body text is 1rem at 1.55 line height. Labels are sentence case at 12px or larger. Numbers use the `--font-mono` system stack so computed values read as measurements rather than prose; no extra font dependency is loaded. The full reasoning is in `docs/TYPE_DECISION.md`.

The reading panel uses a `clamp(26px, 2.6vw, 34px)` product title, 16–23px section headings and 16px body copy. The smallest functional text is the 8–9.5px map attribution; chart tick labels are 12.5px in CSS and 19–20 SVG units on phones. The attribution is deliberately tiny because it is a persistent credit, not a control, and it remains legible against the dark plate.

## Layout

The desktop view is a split view: a stage on the left, a 152px typographic contents rail, and a scrolling reading panel on the right. The panel starts at 53 percent of the viewport, capped at 800px and floored at 600px; a 6px visual rule has a 44px pointer hit area and a keyboard separator contract. The stage stays in view while the argument moves. The contents rail is a report index, not an icon dock: each chapter is a group heading with its pages underneath, and the active page is marked by a coral rule.

Below 1201px the rail disappears and the stage becomes a sticky band above the report. The band is 48dvh at tablet widths and 40dvh on a phone; it grows to 48dvh only when the least-squares bowl is active. The contents index becomes a native select in one 44px row, and headings carry a scroll margin that lands them below the stage, context strip and select. The bowl controls become a compact one-line strip on a phone, with a full-width snap button.

The split view was chosen over a full page scrollytelling site because it keeps the globe available at every step and avoids scroll hijacking. The trade-off is that a full page screenshot only captures one panel position, which is why the screenshots are taken section by section.

## Map chrome

The stage tabs, zoom buttons, reset, legend and attribution use solid graphite surfaces; only the 3D labels float. Frosted glass was rejected because it smeared the globe behind the controls and made the panel feel like a generic dashboard. The legend reads the actual minimum and maximum in the sample (53.0 to 84.4 years), not the two anchor countries, so the bar cannot imply a range it does not cover. The attribution is always visible and says the basemap is illustrative.

## Charts

Seven hand-built SVG figures: scatter with the active fit, residuals for the active model, the gap, the derivative, the inverse, the leave-two-out sensitivity dumbbell and box plots by income group. One active-model control drives the scatter, residuals, gap, derivative, inverse, headline and working, so a reader cannot compare a logarithmic chart with a straight-line claim. Life expectancy is a single sequential teal ramp, shared by the pillars, the preview and the scatter dots, so hue never pretends that a continuous variable is a category. The straight line is blue, the logarithmic curve is gold, the observed gap and the selected country are coral. The axes use thin rules and tabular numbers, and each figure has a sentence-length accessible name. Six use `role="img"`; the scatter uses `role="group"` so its individual country points can be reached and moved with the keyboard. The least squares bowl is a separate 3D view with a blue to sand error ramp, not a category rainbow.

## Motion

Camera flights are slow and interruptible. The globe has a gentle idle rotation only when the user has not taken control. Sections rise 14px into place once, with a 50ms stagger across their children; the scene itself supplies the continuous motion. Buttons respond with a 0.975 scale press, not a lift.

The 3D canvas is deferred behind a Blue Marble poster. Desktop and tablet mount the scene on `requestIdleCallback` with a 6s timeout; phones keep the 30 KiB poster until the reader presses “Open the globe”, because the scene costs one to three seconds of main-thread work on a mid-range phone. Reduce-motion disables the flight, idle rotation, section reveal and CSS transitions. If 3D cannot start, the stage reports it in text and the seven charts and tables remain. The boot screen is a quiet loading state, not a performance.

## What was rejected

- A business dashboard: it would make 42 countries feel like a quarterly report.
- A printed star chart: it made the planet feel like a diagram, not a place.
- Frosted glass chrome: it reduced contrast and looked like a generic product demo.
- A rainbow error bowl: hue implied categories where the surface is continuous.
- A second display typeface: it added a voice the instrument panel did not need.


## October 24 reading refinement

Retain the globe and the light analysis console. Evidence blocks use a flat pale teal surface and tabular Instrument Sans numerals. Reading content has 22px desktop gutters and 16px phone gutters; evidence cards have 20px and 16px padding. Titles and questions share a clear hierarchy without nested accent rules. Mobile overview statistics stay in a single three-column strip. Country search is an ARIA combobox with name/code matching, arrow-key navigation, Enter selection, Escape dismissal and an explicit no-match state.

Verified with 46 unit/data tests and browser checks at 1440, 1024, 768 and 375px, including the splitter, keyboard scatter selection, reduced motion and no-WebGL fallback.

## October 26 redesign

The published explorer was rebuilt as an app screen rather than restyled. The icon rail became a 152px typographic contents index; the stacked header bands became one masthead and a context strip; the panel widened to 53 percent (600–800px); and the opening screen now states the finding in four figures before the first chapter.

One active-model control (`log` or `linear`, URL `m=linear`) drives every model-dependent surface: scatter, residuals, gap, derivative, inverse, headline, working and tables. Sensitivity is always recomputed from the current sample, and the headline uses explicit overshoot wording when the straight line predicts a gap wider than the observed one.

The black analysis console proposed in `8ba8bce` was not adopted. That commit changed only `tokens.css` and a short override block, while the remote screenshots and `docs/DESIGN.md` still showed and specified the light console. The warm-paper panel is the settled direction (R5); the remote commit's keyboard search, ISO-code matching, no-match state and larger citation text were kept. The remote one-off `scripts/ui-refinement-check.mjs` was replaced by two maintained steps in `scripts/interaction-test.mjs`.

Verified on the merged tree with 46 unit/data tests, 68 statistic checks, 11 anchors, 27 desktop and 8 mobile interaction steps, 0 axe violations across 16 width/chapter combinations, and Lighthouse desktop 84 / mobile 93 in the latest full-suite run (desktop ranged 78–99 across repeats as the deferred 4K globe mount moved in and out of the trace). The 3D scene remains opt-in on phones; the report, not the globe, is the main mobile cost.
