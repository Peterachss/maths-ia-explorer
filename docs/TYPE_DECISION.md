# Type decision

## Display: Fraunces Variable

Fraunces is a serif with a soft, slightly worn finish. At large sizes it reads like a printed plate or an old scientific instrument, which is exactly the star chart world. It has enough personality to carry the title and the section headings without needing colour or decoration.

It is used only for h1, h2 and h3. Body text in Fraunces would be too mannered for a data page, and the tall x-height of the sans is easier at 16 pixels.

## Text and UI: Instrument Sans Variable

Instrument Sans is a neutral grotesque with a tall x-height, open apertures and tabular figures. It is used for body text, tables, buttons, axis labels and numbers. The tabular figures matter: a column of GDP values has to line up, and proportional figures make a table look broken even when the numbers are right.

## Sizes

| Token | Size | Use |
|---|---|---|
| step -1 | 0.875rem / 14px | notes, captions, table cells |
| step 0 | 1rem / 16px | body |
| step 1 | 1.25rem / 20px | h3 |
| step 2 | 1.563rem / 25px | h2 |
| step 3 | 1.953rem / 31px | unused |
| step 4 | 2.441rem / 39px | h1 |

Body line height is 1.55; display line height is 1.15. Headings use `text-wrap: balance`, paragraphs use `text-wrap: pretty`.

## Loading

Both families are self-hosted through Fontsource, as variable woff2 with the latin and latin-ext subsets. There is no request to Google Fonts, no third party connection, and no flash of invisible text. `font-display: swap` is set, and the fallback stacks are:

```
'Iowan Old Style', 'Palatino Linotype', serif
'Segoe UI', system-ui, sans-serif
```

There is no metric override, so a swap could shift a line by a few pixels. In practice the fonts are local and load in the same tick as the CSS.

## What was rejected

- **Inter or Roboto.** Competent, but they read as "default dashboard" and would fight the printed-chart world.
- **A monospace for numbers.** It would be excellent for columns but would make every label feel like code. Tabular figures in the sans give the alignment without the costume.
- **All caps for headings.** It would add a second strong voice next to the serif. The page already has one display face and one text face; a third treatment would be noise.
- **A display face with a lot of swash or contour.** Fraunces at a large size is already expressive. More would tip into pastiche.

## Accessibility

- Body text is 16 pixels and `paper-1` on `ink-1`, a contrast ratio of 10.07:1.
- Secondary text is 14 pixels and `paper-2`, a ratio of 6.57:1, above the 4.5:1 requirement for normal text.
- No text is smaller than 12 pixels.
- Line length is capped at 70 characters for paragraphs, which is inside the comfortable range.
- The display face is never used below 20 pixels.
