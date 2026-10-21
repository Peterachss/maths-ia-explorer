# Type decision

## One family: Instrument Sans Variable

Instrument Sans is a neutral grotesque with a tall x-height, open apertures and tabular figures. It is used for everything: the title, section headings, body text, tables, buttons, axis labels and numbers. Hierarchy comes from weight, size, tracking and space, not from a second typeface.

The earlier design paired a display serif with Instrument Sans. The serif was rejected once the stage became a photoreal Earth inside an instrument panel. A literary serif made the interface feel like a printed plate, while the globe and the controls needed one precise, neutral voice. One family also removes a font request and keeps the panel visually calm.

## Why Instrument Sans

- The tall x-height stays readable at 12 to 14 pixels in dense tables and map chrome.
- The open apertures survive white text on graphite.
- The tabular figures keep GDP and life expectancy columns aligned.
- The variable weights cover 400 to 700 without loading separate files.
- The family has enough character to carry a large title without decoration.

## Sizes

| Token | Size | Use |
|---|---|---|
| step -1 | 0.875rem / 14px | notes, captions, table cells |
| step 0 | 1rem / 16px | body |
| step 1 | 1.25rem / 20px | h3 |
| step 2 | 1.563rem / 25px | h2 |
| step 4 | 2.441rem / 39px | h1, clamped down on phones |

Body line height is 1.55; display line height is 1.1. Headings use weight 620 to 680. Small labels use 0.6 to 0.7rem, uppercase and 0.1em tracking. Numbers use `font-variant-numeric: tabular-nums`.

## Loading

Instrument Sans is self-hosted through Fontsource and bundled by Vite. There is no third-party font request at runtime. The fallback stack is `Segoe UI, system-ui, sans-serif`, which keeps the layout close if the webfont is slow or blocked.

## Accessibility

White on the primary blue is 4.51:1, above the 4.5:1 AA threshold for normal text. Primary text on the panel is 17.2:1, body text is 11.37:1 and secondary text is 6.3:1. The focus ring uses `#6cb2ff` and is visible on both graphite and white surfaces.
