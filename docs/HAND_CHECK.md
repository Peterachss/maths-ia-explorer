# Hand check

This is the arithmetic a reader can do with a calculator and the 42 rows, without trusting the app. The full recomputation is in `scripts/crosscheck.py`; this is the short version.

## 1. Count and means

There are 42 rows. Sum the income column and divide by 42:

```
mean x = 1,049,469.57 / 42 = 24,987.37
mean y = 3,009.13 / 42 = 71.646
```

The IA prints $24,987 and 71.6. Both round correctly.

## 2. Standard deviations

Using the sample formula with n - 1 = 41:

```
s_x = sqrt(sum((x - mean x)^2) / 41) = 30,185.84
s_y = sqrt(3,266.748 / 41) = 8.926
```

The IA prints $30,186 and 8.93.

## 3. Medians

With 42 values, average the 21st and 22nd in order:

```
median x = 13,555.23
median y = 71.919
```

The IA prints $13,555 and 71.9. The income mean is nearly twice the median, which is the skew the IA points out.

## 4. The log fit

Take u = ln x for each country. Then:

```
mean u = 9.38335
Sxx = sum((u - mean u)^2) = 71.4632
Sxy = sum((u - mean u)(y - mean y)) = 423.6107
a = Sxy / Sxx = 423.6107 / 71.4632 = 5.92768
b = mean y - a * mean u = 71.6460 - 5.92768 * 9.38335 = 16.02456
```

The IA prints a = 5.92765 and b = 16.02477. The difference is in the fifth decimal place.

## 5. Correlation

```
r = Sxy / sqrt(Sxx * Syy)
  = 423.6107 / sqrt(71.4632 * 3266.748)
  = 423.6107 / 483.17
  = 0.8767
```

The IA prints 0.877. Squaring gives 0.7687, printed as 0.769.

## 6. Residual standard error

```
SSE = Syy - a * Sxy
    = 3266.748 - 5.92768 * 423.6107
    = 755.72
s_e = sqrt(755.72 / 40) = 4.347
```

The IA prints 755.7 and 4.35. The straight line gives SSE 1,454.08 and s_e 6.029, printed as 1,454.1 and 6.03.

## 7. Predictions

```
Singapore: 5.92768 * ln(120,678.34) + 16.02456 = 85.3836
Zimbabwe:  5.92768 * ln(4,993.87)  + 16.02456 = 66.5045
gap = 85.3836 - 66.5045 = 18.8792
share = 18.8792 / 22.535 = 0.8378
```

The IA prints 85.38, 66.50, 18.88 and 83.8 percent.

## 8. Derivative

```
at Zimbabwe:  5.92768 / 4,993.87 = 0.001187 years per dollar = 1.187 per $1,000
at Singapore: 5.92768 / 120,678.34 = 0.0000491 years per dollar = 0.049 per $1,000
ratio = 1.187 / 0.0491 = 24.17
```

The IA prints 1.19, 0.049 and 24.2.

## 9. Inverse

```
x = exp((83.6 - 16.02456) / 5.92768)
  = exp(11.39998)
  = 89,320
```

Using Singapore's unrounded 83.595 gives 89,245. The IA prints 89,247. All three are the same answer within rounding, and all are about 17.9 times Zimbabwe's income.

## 10. Sensitivity

Remove Nigeria and Chad, refit the same log model on 40 rows:

```
a = 5.6129
b = 19.648
r = 0.9250
r squared = 0.8556
s_e = 3.098
predicted gap = 17.876
share = 17.876 / 22.535 = 0.7933
```

The IA prints 5.613, 19.65, 0.925, 0.856, 3.10, and 79.3 percent.

## 11. Checks that must hold

- The residuals of each fitted model sum to zero, up to rounding.
- The mean of the fitted values equals the mean of the observed values.
- The least squares slope is the value that minimises the sum of squared errors; moving it by a small amount in either direction increases SSE.
- The predicted gap is positive, and the share is below 100 percent for the log model and above 100 percent for the line.

## 12. If a number disagrees

1. Check whether the row is included or excluded in the current view.
2. Check whether the target for the inverse is 83.595 or 83.6.
3. Check rounding: coefficients are stored at full precision and rounded only for display.
4. Run `npm test`. The contract tests should localise the disagreement.
5. If the tests pass and the hand check disagrees, the hand check is probably using rounded intermediate values. Carry more decimals.
