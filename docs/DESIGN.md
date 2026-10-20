# Design

## The world

The point of view sentence is the one from the brief:

> It feels like a printed star chart of the Earth, held under a desk lamp at night: matte, precise, quiet, with one thread of colour that connects two places.

That sentence decides almost everything. The background is not pure black, it is warm ink. The type is a serif with a slightly old instrument feel, paired with a neutral grotesque for numbers and controls. There is one saturated colour, vermilion, and it is reserved for the thread between Zimbabwe and Singapore. Gold is the model. Blue is the line. Nothing else is allowed to be loud.

## Palette

| Token | Hex | Use |
|---|---|---|
| ink-0 | `#0d0c0a` | page and stage background |
| ink-1 | `#16140f` | panel background |
| ink-2 | `#211e17` | raised controls and cards |
| rule | `#3a3529` | hairlines, borders |
| paper-0 | `#f1e9d7` | headings and primary text |
| paper-1 | `#c9bfa6` | body text |
| paper-2 | `#a39a82` | secondary text |
| thread | `#e4572e` | the Singapore to Zimbabwe arc, selection |
| thread-text | `#f07a56` | vermilion text, lightened for contrast |
| model-linear | `#86a9d1` | straight line |
| model-log | `#e9b44c` | logarithmic curve |
| land | `#1b1912` | land on the globe |
| sea | `#0a0907` | ocean on the globe |
| grat | `#4a4435` | graticule and grid lines |

The land is only one step above the sea. That is deliberate: the continents are a frame for the pillars, not the subject. The graticule is fainter still.

## Type

- Display: **Fraunces Variable**, a serif with a slightly worn, printed quality. Used for h1, h2 and h3 only.
- Text and UI: **Instrument Sans Variable**, a neutral grotesque with a tall x-height. Used for body, tables, controls, axis labels and numbers.
- Numbers use tabular figures throughout, so a column of GDP values lines up.
- Sizes follow a 1.25 modular scale from 0.875rem to 2.441rem. The h1 is the only thing above 2rem.
- Line height is 1.55 for body, 1.15 for display.

Both fonts are self-hosted through Fontsource, so there is no request to a font CDN and no layout shift from a late font.

## Layout

Desktop is a two column grid: a flexible stage and a 30rem panel. The stage is sticky by virtue of the grid's fixed height; the panel scrolls inside itself. The split keeps the globe visible while the argument unfolds. At 860 pixels and below the grid becomes one column, the stage becomes 48dvh and sticky, and the panel scrolls with the page.

The panel is a single column of sections with a 3rem gap. There are no cards inside cards. The only raised surfaces are the search field, the preview card, the bowl controls and the model toggles. Rules, not shadows, do most of the separations.

## Motion

- Camera flights ease with an exponential curve over about 0.9 seconds.
- The globe drifts at a slow constant rate until the reader touches it.
- Section entry uses an IntersectionObserver with a narrow middle band, so the camera does not fly on every small scroll.
- All motion collapses to zero duration under `prefers-reduced-motion`, and the Three.js drift and flight are skipped in code as well as in CSS.

## Charts

Charts are drawn as SVG in a 520 by 340 viewBox with a 58 pixel left margin, a 30 pixel top margin and a 50 pixel bottom margin. Axis lines are hairlines in `rule`. Tick labels are `paper-2`. The model colour is the only strong colour in a chart, apart from the vermilion used for the observed gap and the selected country.

Point labels sit above the point and flip to the left of the point near the right edge. They have a 3 pixel ink stroke behind the text so they stay readable over the grid. There are no drop shadows, no rounded bars, no gradients behind data.

## What was rejected

- **A dashboard with cards and KPI tiles.** It would make 42 countries feel like a quarterly report and would put the numbers above the argument.
- **A photographic globe.** It would compete with the pillars, cost megabytes, and make the page feel like a product demo.
- **A dark neon "data science" theme.** Purple gradients and glowing lines are the generic AI look the brief explicitly bans.
- **Animating every element on scroll.** Motion is used for the camera, which carries meaning, and almost nowhere else.
- **A separate colour per income group.** Income group is already encoded by position on the income axis. A second colour scale would add noise without adding information.
