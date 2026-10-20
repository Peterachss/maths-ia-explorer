# Integrity note

## Status

- Data rows: 42, one year (2019), no missing values.
- Source of record: the values printed in the IA's Appendix A.
- Placeholders: none. The real data were available, so no value in the interface is a stand-in.
- Invented values: none. Every number is a cell from `data/sample42.csv` or a calculation in `src/math` applied to those cells.
- Live check: the World Bank pull on 20 October 2026 matched Appendix A exactly.

## The two rules

**No number without a source.** If a value cannot be traced to the CSV or to a formula in the repository, it does not go on screen. The app has no decorative statistics, no "typical country" invented for a caption, and no illustrative figures that look like data.

**No silent substitution.** If the live World Bank series and the appendix ever disagree, the appendix wins and the disagreement is written down here. The app never quietly updates a value to make a chart look better.

## Live pull result

`node scripts/fetch_worldbank.mjs 2019` returned:

```
Pulling 42 countries for 2019
Missing values: 0
GDP: max relative difference from Appendix A 0.00%, mean 0.00%
Life expectancy: max absolute difference 0.000 years, mean 0.000
Wrote data/worldbank_2019_pull.csv
```

This is a strong result. The constant 2021 PPP series has not been revised for 2019 in a way that affects this sample, and the life expectancy series is unchanged. The app can therefore use the appendix values with no reconciliation caveat in the interface.

## Anchor check

`node scripts/anchor_check.mjs` checks 11 values and all 11 pass:

```
PASS  n: 42.0000
PASS  Singapore life expectancy: 83.5950
PASS  Singapore GDP per capita: 120678.3400
PASS  Zimbabwe life expectancy: 61.0600
PASS  Zimbabwe GDP per capita: 4993.8700
PASS  observed gap: 22.5350
PASS  log slope a: 5.9277
PASS  log intercept b: 16.0246
PASS  predicted Singapore: 85.3836
PASS  predicted Zimbabwe: 66.5045
PASS  model gap: 18.8792
```

## What is not verified

- The values in Appendix A were typed into the CSV from the IA. The live pull matches them, which is good evidence that the typing is correct, but it is not a check of the IA's own transcription from the World Bank site.
- The income group labels are the current World Bank classification, not necessarily the classification in force in 2019. The app says so.
- The capital coordinates come from the World Bank country endpoint, not from a survey. They are accurate enough to place a pillar on a globe at this scale.

## Risks to disclose

1. **The appendices are missing from the PDF.** The IA refers to Appendix A and B but they are not in the file. This is an academic risk independent of the app, and it is recorded in `docs/IA_RECONCILIATION.md`.
2. **The Works Cited wording.** The entry for AI assistance currently says "this practice draft", which reads like a disclaimer. It should be rewritten in line with the school's policy.
3. **Future revisions.** A later World Bank pull may differ. If it does, rerun `data:fetch`, record the difference here, and do not change the appendix values.

## AI assistance

The explorer was built with AI assistance. The data, the IA and its argument are the student's. The interface now carries a short note to that effect in the Sources section, and `DECISIONS.md` records it as a deliberate choice rather than an omission.
