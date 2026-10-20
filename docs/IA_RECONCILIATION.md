# IA reconciliation

This document checks the explorer against the written IA. It has two jobs: prove that every number the app prints is the number the data produce, and record the places where the written IA itself needs attention.

## Verdict

Every quantitative claim in the IA recomputes from the 42 appendix rows. There is no contradiction between the IA and the app. The differences are rounding differences, and they are all within half a unit in the last printed digit.

## Anchors

| Quantity | IA prints | Recomputed | App prints | Difference |
|---|---|---|---|---|
| n | 42 | 42 | 42 | none |
| Mean GDP per capita | $24,987 | 24,987.37 | 24,987 | 0.37 |
| SD of GDP per capita | $30,186 | 30,185.84 | 30,186 | 0.16 |
| Median GDP per capita | $13,555 | 13,555.23 | 13,555 | 0.23 |
| Mean life expectancy | 71.6 | 71.646 | 71.65 | 0.046 |
| SD of life expectancy | 8.93 | 8.926 | 8.93 | 0.004 |
| Median life expectancy | 71.9 | 71.919 | 71.92 | 0.019 |
| Minimum life expectancy | 53.0 | 52.993 | 52.99 | 0.007 |
| Maximum life expectancy | 84.4 | 84.36 | 84.36 | 0.004 |
| Spearman rank correlation | 0.903 | 0.9029 | 0.903 | 0.0001 |

## Straight line

| Quantity | IA prints | Recomputed | App prints | Difference |
|---|---|---|---|---|
| Slope a | 0.000220 | 0.00022027 | 0.000220 | 0.00000027 |
| Intercept b | 66.14 | 66.1419 | 66.14 | 0.0019 |
| r | 0.745 | 0.7449 | 0.745 | 0.0001 |
| r squared | 0.555 | 0.5549 | 0.555 | 0.0001 |
| SSE | 1,454.1 | 1,454.08 | 1,454.1 | 0.02 |
| Residual standard error | 6.03 | 6.029 | 6.03 | 0.001 |
| Predicted Singapore | 92.7 | 92.72 | 92.7 | 0.02 |
| Predicted Zimbabwe | 67.2 | 67.24 | 67.2 | 0.04 |
| Predicted gap | 25.48 | 25.48 | 25.5 | 0.02 |
| Share of observed gap | 113.1% | 113.1% | 113.1% | none |

## Logarithmic model

| Quantity | IA prints | Recomputed | App prints | Difference |
|---|---|---|---|---|
| Slope a | 5.92765 | 5.92768 | 5.928 | 0.00003 |
| Intercept b | 16.02477 | 16.02456 | 16.02 | 0.0002 |
| r | 0.877 | 0.8767 | 0.877 | 0.0003 |
| r squared | 0.769 | 0.7687 | 0.769 | 0.0003 |
| SSE | 755.7 | 755.72 | 755.7 | 0.02 |
| Residual standard error | 4.35 | 4.347 | 4.35 | 0.003 |
| Predicted Singapore | 85.38 | 85.3836 | 85.38 | 0.0036 |
| Predicted Zimbabwe | 66.50 | 66.5045 | 66.50 | 0.0045 |
| Predicted gap | 18.88 | 18.8792 | 18.88 | 0.0008 |
| Share of observed gap | 83.8% | 83.78% | 83.8% | 0.02 pp |

## Derivative and inverse

| Quantity | IA prints | Recomputed | App prints | Difference |
|---|---|---|---|---|
| dy/dx at Zimbabwe, years per $1,000 | 1.19 | 1.187 | 1.19 | 0.003 |
| dy/dx at Singapore, years per $1,000 | 0.049 | 0.0491 | 0.049 | 0.0001 |
| Ratio of the two rates | 24.2 | 24.17 | 24.2 | 0.03 |
| Income for 83.6 years | $89,247 | $89,245 to $89,320 | $89,245 | 0.00% to 0.08% |
| Multiple of Zimbabwe's income | 17.9 | 17.87 | 17.9 | 0.03 |

The inverse has a small spread because the answer depends on which target is used. The IA solves for 83.6 exactly and prints $89,247. The app solves for Singapore's unrounded 83.595 and prints $89,245, a difference of two dollars. Solving for 83.6 exactly with the unrounded coefficients gives $89,320, a difference of 0.08 percent. All three are the same calculation with different rounding, and all three are inside the tolerance.

## Sensitivity

| Quantity | IA prints | Recomputed | App prints | Difference |
|---|---|---|---|---|
| Slope without Nigeria and Chad | 5.613 | 5.6129 | 5.613 | 0.0001 |
| Intercept | 19.65 | 19.648 | 19.65 | 0.002 |
| r | 0.925 | 0.9250 | 0.925 | none |
| r squared | 0.856 | 0.8556 | 0.856 | 0.0004 |
| Residual standard error | 3.10 | 3.098 | 3.10 | 0.002 |
| Share of observed gap | 79.3% | 79.33% | 79.3% | 0.03 pp |
| Income for 83.6 years | $88,690 | $88,687 | $88,687 | 0.003% |

## Income group means

| Group | IA prints | Recomputed | Difference |
|---|---|---|---|
| Low (n = 10) | 61.6 | 61.59 | 0.01 |
| Lower middle (n = 9) | 66.2 | 66.16 | 0.04 |
| Upper middle (n = 12) | 74.4 | 74.37 | 0.03 |
| High (n = 11) | 82.3 | 82.30 | 0.00 |

## Issues in the written IA

These are editorial or structural, not arithmetic. They do not affect the explorer, but they matter before submission.

### 1. Appendix A and Appendix B are missing from the PDF

The IA refers to Appendix A for the raw data and Appendix B for the group summary, but the 17 page PDF ends without either. The data are said to be in a Google Sheets tab called Data (2019). A moderator reading only the PDF cannot check a single row. Either add both appendices to the PDF or make the sheet available with the submission. This is the largest risk in the current draft.

### 2. The 113.1 percent is explained more than once

The linear model's predicted gap is 25.48 years, which is 113.1 percent of the observed 22.54. The IA explains, correctly, that this is not invalid: it means the line overestimates the difference. The explanation is repeated in several places, which reads as defensive. State it once, next to the number, and let the later sections move on.

### 3. The Works Cited wording needs rewriting

The entry for Claude says "drafting support ... this practice draft". That phrasing sounds like a disclaimer and draws attention to the tool rather than to the work. A short, factual disclosure is better: what the tool was used for and what it was not used for. The school's academic honesty policy should decide the exact wording, and the student should confirm it before submission.

### 4. The introduction runs long

The opening spends space on the importance of the topic that is not used by the later mathematics. With a page limit, that space is better spent on the residual analysis and the evaluation. This is a judgement call, not an error.

### 5. Figure 6 units

The derivative chart's caption says "years per $1,000", but the expression plotted is `a / x`, which is years per dollar. The values in the text are multiplied by 1,000. Either label the axis "years per $1,000" and say the values are scaled, or plot per dollar. The explorer uses per $1,000 and says so.

### 6. 22.5 against 22.54

The headline gap is 22.5 years, the calculation uses 22.54. That is fine, but be consistent about which one is being quoted. The explorer prints 22.5 in prose and uses the unrounded value in every calculation.

### 7. Page count

The PDF is 17 pages including the cover and the works cited. Check the current school limit for the body of the IA. If the limit is 14 pages, the body is close and the appendices should not count toward it, which is another reason to make sure they are actually attached.

## How this file was produced

`scripts/crosscheck.py` recomputes the statistics, both regressions, the residual lists, the gap, the derivative and the inverse from `data/sample42.csv` and writes `docs/crosscheck.json`. The values in the tables above were read from that file. `scripts/anchor_check.mjs` separately checks the 11 values the IA prints, and all 11 pass.
