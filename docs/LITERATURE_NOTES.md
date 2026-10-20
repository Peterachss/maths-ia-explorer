# Literature notes

The IA cites a small, sensible set of sources. These notes say what each one contributes to the explorer, and what the explorer deliberately does not claim from it.

## Preston (1975)

Samuel H. Preston, "The Changing Relation between Mortality and Level of Economic Development", *Population Studies* 29(2), 1975, pp. 231-248.

Preston's central observation is that the relationship between income and mortality is not linear: the gains from additional income are large at low income and small at high income, and the position of the curve shifts over time with public health, medicine and education. That is the intellectual reason a logarithmic form is worth trying on these 42 countries.

What the explorer takes: the shape, and the caution. The copy says the log model assumes diminishing returns, and labels that as an assumption. It does not say Preston proved this for 2019, because he did not.

What the explorer does not take: Preston's historical decomposition, his mortality measures, or any of his coefficients. Those belong to a different dataset and a different question.

## Our World in Data

"Life expectancy vs. GDP per capita", Our World in Data, accessed 20 October 2026.

OWID's chart uses the same broad pairing of World Bank income and life expectancy data. Its description states that GDP per capita is adjusted for inflation and differences in living costs. That phrasing was used to tighten the axis label.

What the explorer takes: a sanity check on the shape and a careful description of the income measure.

What it does not take: any values. The 42 rows come from the World Bank API and the IA's appendix, not from a chart image.

## World Bank, World Development Indicators

`NY.GDP.PCAP.PP.KD` and `SP.DYN.LE00.IN`, 2019, accessed 20 October 2026.

These are the two indicators behind the whole project. The GDP series is constant 2021 international dollars at PPP, which makes cross-country comparison meaningful. The life expectancy series is a period measure, sensitive to infant mortality.

What the explorer takes: the definitions, the values, the licence, and the vintage.

What it does not take: the World Bank's own commentary on what drives health, which is more complex than one income variable.

## World Health Organization, Global Health Observatory

Cited by the IA as a health data source. The explorer does not use GHO values, because the IA's y variable is the World Bank life expectancy series and mixing two sources would make the residuals incomparable.

What the explorer takes: nothing numerically. It is listed in the sources because the IA lists it, and because a reader may want the health context.

## IB Mathematics: Analysis and Approaches guide

International Baccalaureate Organization, 2019.

The guide defines the assessment. It rewards a clear aim, a coherent mathematical process, correct notation, interpretation and evaluation, not just a high r squared.

What the explorer takes: the restraint. The interface avoids overclaiming, marks extrapolation, shows the sensitivity analysis, and keeps the working visible. Those are the habits the guide rewards.

## What the explorer refuses to claim

- That income causes longer life.
- That the log model is the true functional form.
- That 42 purposively chosen countries represent the world.
- That a high r squared makes the model useful for policy.
- That any of these sources say something they do not say.
