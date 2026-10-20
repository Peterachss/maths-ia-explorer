# Chart specification

There are seven SVG chart figures, plus the globe and the bowl. All seven share a 520 by 340 viewBox, a left margin of 58, a right margin of 18, a top margin of 30 and a bottom margin of 50, except the income group box plot, which has its own 520 by 210 frame so the group labels fit.

## 1. Scatter with both fits

- **File:** `src/charts/Scatter.tsx`
- **Encoding:** x is GDP per capita, y is life expectancy in years. One dot per country.
- **Scales:** x is linear from 0 to 130,000 or log from 800 to 160,000, controlled by the axis toggle. y is linear from 45 to 90.
- **Models:** the straight line is dashed blue, the log curve is solid gold. Both are drawn over the observed range, not across the whole frame.
- **Labels:** Zimbabwe, Singapore and Vietnam are always labelled; the selected or hovered country is labelled too. Labels flip to the left of the point near the right edge.
- **Annotation:** none beyond the labels. The fit table below carries the statistics.
- **Accessible name:** "Life expectancy against GDP per capita, 2019".

## 2 and 3. Residuals, one panel per model

- **File:** `src/charts/Residuals.tsx`, rendered twice.
- **Encoding:** x is GDP per capita on the current axis, y is observed minus predicted, in years. A horizontal zero line separates over and under prediction.
- **Purpose:** the linear panel should show a curve (positive in the middle, negative at the ends); the log panel should look more evenly scattered. That contrast is the visual argument for the log model.
- **Edge case:** if a country is excluded, its residual is removed from that panel, and the fit is refitted.
- **Accessible name:** "Residuals of the straight line model" or "Residuals of the logarithmic model".

## 4. Observed and predicted gap

- **File:** `src/charts/GapChart.tsx`
- **Encoding:** two horizontal bars, observed gap and model gap, in years. The observed bar is cream; the model bar is gold. The difference is the part the model does not reproduce.
- **Annotation:** the share of the gap reproduced, as a percentage, and the two values in years.
- **Why bars:** the gap is a difference between two countries, and a bar comparison is the clearest way to show how much of the 22.5 years the model accounts for.
- **Accessible name:** "Observed and predicted life expectancy gap, Zimbabwe and Singapore".

## 5. Derivative

- **File:** `src/charts/DerivativeChart.tsx`
- **Encoding:** x is GDP per capita on a log axis, y is dy/dx in years per $1,000. The curve falls as income rises.
- **Markers:** Zimbabwe and Singapore, with their values.
- **Message:** the same absolute increase in income buys fewer years at high income. The ratio of the two rates is the inverse ratio of the incomes, which is a property of the log form.
- **Accessible name:** "dy/dx in years per $1,000".

## 6. Inverse

- **File:** `src/charts/InverseChart.tsx`
- **Encoding:** the fitted curve, a horizontal dashed line at Singapore's life expectancy, a vertical dashed line down to the income axis, and a point at the intersection.
- **Annotation:** the income value, whether it is interpolation or extrapolation, the multiple of Zimbabwe's income, and the alternative reverse regression.
- **Edge case:** if either anchor is excluded, the chart is replaced by a sentence explaining that both countries must be in the fit.
- **Accessible name:** states the income and the life expectancy, not just "inverse chart".

## 7. Income group box plots

- **File:** `src/charts/GroupBoxes.tsx`
- **Encoding:** one row per World Bank income group. The box runs from the lower to the upper quartile, the gold line is the median, and the thin line spans the minimum to the maximum. The domain is 50 to 86 years, which contains every value.
- **Why:** it shows that the groups separate, but also that the within group spread is large. The high group's minimum overlaps the upper middle group's median.
- **Accessible name:** "Life expectancy by income group".

## Shared rules

- Axis lines are 1 px in `rule`; grid lines are 1 px in `grat` at low opacity; tick labels are `paper-2`.
- Text is SVG text, not HTML overlays, so it scales with the chart and is selectable.
- No chart uses a gradient fill, a drop shadow, a rounded bar or a 3D effect.
- Every chart has a `<title>` and either a `role="img"` with an `aria-label` or a `<desc>`.
- Missing or excluded data removes the mark; it never plots a zero.
- Values are formatted with the same helpers as the tables, so a number cannot be 1,054 in one place and 1054.00 in another.
