# Product

## Who it is for

Three readers, in order:

1. **The student.** Checking that the numbers in the written IA are the numbers the data actually produce, and seeing the model rather than only reading about it.
2. **The teacher or moderator.** Following one calculation from the raw row to the printed value without having to trust a black box.
3. **A curious visitor.** Understanding in under a minute that richer countries tend to live longer, that the relationship bends, and that the bend is the interesting part.

## The job it does

The IA makes four claims: the log model fits better than the line, the model reproduces most of the Singapore to Zimbabwe gap, the derivative falls as income rises, and the result survives excluding two outliers. The explorer lets a reader test each claim by changing something and watching every view respond.

## Views

| View | What it must do | What it must not do |
|---|---|---|
| Globe | Show all 42 countries as pillars, let the reader select one or two, keep the 22.5 year arc visible | Turn into a decorative spinning earth with no data |
| Model | Show the least squares bowl and let the reader move away from the minimum | Pretend the surface is a probability or a confidence region |
| Story panel | Explain each claim in plain language with the chart that supports it | Print a wall of statistics without a sentence saying what they mean |
| Working | List each calculation with formula, inputs and result | Hide a step behind "it can be shown" |
| Tables | Give every number, including the 42 rows, in text | Be the only way to see the data |

## Interaction contract

- Selecting a country updates the preview card, the charts that depend on selection, the globe highlight and the URL hash.
- Changing the model toggles updates the scatter, the residual panels, the gap, the derivative and the inverse together. There is no state where the chart says log and the caption says linear.
- Changing the axis to log changes only the horizontal scale, never the fitted values.
- Excluding a country refits the models and the globe pillars fade; the sensitivity table always shows all 42 against the preset so the comparison does not move under the reader.
- Every action is announced through a polite live region, and every control is reachable by keyboard.

## States

- **Loading.** A short status line, no spinner that blocks the page.
- **Data error.** A plain sentence naming the file and suggesting a reload.
- **No WebGL.** The 3D stage is replaced by a message, and every chart and table below still works.
- **Empty selection.** A sentence telling the reader where to click, not an empty box.
- **Extrapolation.** Any inverse result outside the observed income range is labelled as an extrapolation.

## Non-goals

- It is not a dashboard for comparing arbitrary indicators. Two indicators, one year, one sample.
- It is not a causal model. No regression control, no instrument, no claim about what would happen if a country got richer.
- It is not a replacement for the IA. The written argument, the interpretation and the evaluation belong to the student.
- It is not a data download site, although the CSV and the pull are both in the repository.

## Acceptance

A reader can:

1. Load the page and see the globe, the observed gap and the two anchors without reading instructions.
2. Find any of the 42 countries in under five seconds by typing two letters.
3. Switch between the two models and see exactly which one the residual panels and the fit table call better.
4. Open the working panel and match every printed coefficient to a formula.
5. Exclude Nigeria and Chad, watch the fit statistics change, and read the new share of the gap.
6. Resize to 375 pixels wide and use every control without horizontal scrolling.
7. Reach the whole 42 row table with a screen reader.
