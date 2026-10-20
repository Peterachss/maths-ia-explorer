# Data definitions

## Files

| File | What it is |
|---|---|
| `data/sample42.csv` | The 42 rows printed in the IA's Appendix A, with coordinates and provenance. Authoritative for the app. |
| `data/worldbank_2019_pull.csv` | A fresh pull of the same two indicators for the same countries, used only as a check. |
| `data/sample42.meta.json` | Pull date, indicator codes, country count, and the note that income groups are current classifications. |

## Columns in `sample42.csv`

| Column | Type | Definition |
|---|---|---|
| `iso3` | text | ISO 3166-1 alpha-3 country code. Joins to the World Bank API and to Natural Earth. |
| `name` | text | Short English name used in the interface. |
| `region` | text | World Bank region. |
| `income_group` | text | World Bank income group at the time of writing: Low, Lower middle, Upper middle, High. |
| `lat` | decimal degrees | Latitude of the capital, from the World Bank country endpoint. Negative is south. |
| `lon` | decimal degrees | Longitude of the capital, east positive, west negative. |
| `gdp_pc_ppp` | decimal | GDP per capita, PPP, constant 2021 international dollars, 2019. Indicator `NY.GDP.PCAP.PP.KD`. |
| `life_exp` | decimal | Life expectancy at birth, total, 2019, years. Indicator `SP.DYN.LE00.IN`. |
| `source_url` | URL | The indicator page a reader can open. |
| `indicator_code` | text | Both codes, separated by a pipe. |
| `retrieved_on` | date | Date the values were retrieved for the IA. |
| `vintage_note` | text | How the row relates to the appendix and the income group. |
| `status` | text | `ia_appendix_a` for all 42 rows. |

## Indicator definitions

**GDP per capita, PPP (constant 2021 international $), `NY.GDP.PCAP.PP.KD`.** GDP divided by midyear population, converted to international dollars using purchasing power parities, at constant 2021 prices. The PPP conversion accounts for differences in price levels, so the number is comparable across countries in real terms. It is not a measure of household income, and it says nothing about the distribution within a country.

**Life expectancy at birth, total, `SP.DYN.LE00.IN`.** The number of years a newborn would live if current age-specific mortality rates stayed constant throughout its life. This is a period measure, not a prediction for an actual cohort. It is sensitive to infant mortality, which is one reason it moves so much at low income.

**Income groups.** The World Bank's current classification, used for the box plots. The groups can differ from the classification in force in 2019. The app says so in the limits section. The box plots are descriptive and are not used in any model.

## Missing data and coverage

- 42 countries, one year, no missing values in either indicator after the pull.
- The sample is a purposive selection, not a random sample of countries. It over-represents some regions and under-represents others.
- Singapore is too small to appear in the 1:110m boundary file, so its pillar uses capital coordinates rather than a polygon. This affects the globe only, not the statistics.
- The World Bank series can be revised. The pull on 20 October 2026 matched the appendix exactly, but a future pull might not. If it differs, the appendix stays authoritative and the difference goes in `docs/INTEGRITY_NOTE.md`.

## Units and rounding in the interface

- Income is always printed as dollars with no decimals: `$120,678`.
- Life expectancy is printed to one decimal place: `83.6`.
- Model coefficients use the precision shown in the IA: 5 decimal places for the straight line slope, 3 for the log slope, 2 for the intercepts.
- r, r squared and Spearman's rho use 3 decimal places.
- The derivative is printed per $1,000, not per dollar, because per-dollar values are too small to read.
- The inverse is printed to the nearest dollar, with a note when it is an extrapolation.

## Provenance rule

No number enters the interface unless it comes from one of these places:

1. A cell in `data/sample42.csv`.
2. A calculation in `src/math` applied to those cells.
3. A constant that describes the model rather than the world, such as `ln 2`.

The specification's illustrative values are not used where they differ from the student's data. There are no `PLACEHOLDER` values, because the real data were available.
