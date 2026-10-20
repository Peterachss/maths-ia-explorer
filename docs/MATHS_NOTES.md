# Mathematics notes

Everything here is implemented in `src/math` and covered by tests. The notation is the notation the interface uses, which is close to the IA's.

## Symbols

| Symbol | Meaning |
|---|---|
| x | GDP per capita in 2019, constant 2021 international dollars at PPP |
| y | life expectancy at birth in 2019, years |
| n | number of countries, 42 |
| u | the fitting variable: x for the line, ln x for the log model |
| a | slope in the fitted model |
| b | intercept in the fitted model |
| r | Pearson correlation between u and y |
| r squared | coefficient of determination |
| SSE | sum of squared residuals |
| s_e | residual standard error, `sqrt(SSE / (n - 2))` |

## The two models

Straight line:

```
y = ax + b
```

Logarithmic:

```
y = a ln x + b
```

The log model is **not** a regression of ln y on x. It keeps y in years on the left, so the residuals are in years and can be compared directly with the line's residuals. That is why the SSE and s_e of the two models are comparable, and why the app can say "4.35 years" for both.

## Least squares

For a fitting variable u with mean `u_bar` and response y with mean `y_bar`:

```
a = sum((u_i - u_bar)(y_i - y_bar)) / sum((u_i - u_bar)^2)
b = y_bar - a * u_bar
```

The implementation uses a single pass to accumulate the sums, then computes the slope and intercept. It also stores `sxx`, `sxy` and `syy` so the correlation and the standard error can be derived without a second pass over the data.

## Correlation and fit

```
r = sxy / sqrt(sxx * syy)
r squared = r^2
SSE = sum((y_i - (a u_i + b))^2)
s_e = sqrt(SSE / (n - 2))
```

For a model with one slope and one intercept there are two estimated parameters, hence `n - 2`. With n = 42 the divisor is 40.

## The gap

Let `f` be the fitted model, `x_low` Zimbabwe's income and `x_high` Singapore's income.

```
observed gap = y_high - y_low
model gap    = f(x_high) - f(x_low)
share        = model gap / observed gap
```

The app prints the share as a percentage. It also shows the observed gap and the model gap as two bars, so the share is never the only thing on screen.

## Derivative

For the log model:

```
dy/dx = a / x
```

This is years per dollar. The interface multiplies by 1,000 to print years per $1,000. For the line the derivative is the constant `a` years per dollar.

At Zimbabwe's income the log model gives `5.9277 / 4993.87 = 0.001187` years per dollar, or 1.187 years per $1,000. At Singapore's it gives `5.9277 / 120678 = 0.0000491`, or 0.049 years per $1,000. The ratio of the two derivatives is exactly the inverse ratio of the incomes, which is a property of the log form, not an empirical discovery.

## Doubling

For the log model, increasing x by a factor k adds `a ln k` years. Doubling adds `a ln 2`, which is 4.109 years for a = 5.9277. The app shows this in the change tool because it is easier to interpret than a slope per dollar.

## Inverse

Solving `y = a ln x + b` for x:

```
x = exp((y - b) / a)
```

With the unrounded coefficients and y = 83.6, this gives about $89,320. With Singapore's unrounded 83.595 it gives about $89,245. The IA prints $89,247, which is the same calculation rounded at an earlier step. The difference is 0.08 percent, well inside the tolerance.

The app also fits the reverse regression of ln x on y and reports its answer separately. That is a different model, not a correction. Showing both is the honest option.

## Sensitivity

Excluding Nigeria and Chad refits the same log model on the remaining 40 rows. The result:

| Quantity | All 42 | Without NGA and TCD |
|---|---|---|
| Slope a | 5.9277 | 5.6129 |
| r | 0.8767 | 0.9250 |
| r squared | 0.7687 | 0.8556 |
| s_e (years) | 4.347 | 3.098 |
| Model gap (years) | 18.879 | 17.876 |
| Share of observed gap | 83.78% | 79.33% |
| Income for 83.6 years | $89,245 | $88,687 |

The fit improves and the gap share falls by about 4.5 percentage points. Neither result overturns the other. The app says this in words rather than leaving the reader to infer it from a table.

## Domain and rounding

- The fitted curve is drawn over the observed income range, 1,054 to 120,678 dollars, and slightly beyond for the chart frame. The inverse result is checked against that range and labelled an extrapolation if it falls outside.
- Coefficients are stored at full precision and rounded only at display time. The IA prints a to 5 decimal places for the line and 3 for the log model.
- `r` and `r squared` are printed to 3 decimal places, `s_e` to 2, SSE to 1.
- Percentages are printed to 1 decimal place.
- Dollar values are printed with no decimals and a thousands separator.

## What the model does not say

A high r squared is not evidence that income causes longer life. The model is a summary of an association in one year across 42 countries that were not randomly selected. The interface repeats this in the limits section, and the copy avoids verbs like "drives", "causes" and "leads to".
