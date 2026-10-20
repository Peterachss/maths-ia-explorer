# Scripts

| Script | What it does | Output |
|---|---|---|
| `fetch_worldbank.mjs` | Pulls `NY.GDP.PCAP.PP.KD` and `SP.DYN.LE00.IN` for 2019 and compares them with Appendix A | `data/worldbank_2019_pull.csv`, console summary |
| `anchor_check.mjs` | Re-derives the four anchors and the two predictions from the CSV; exits 1 on failure | console, 11 checks |
| `crosscheck.py` | Independent recomputation of every statistic in the IA, written in Python so it does not share code with the app | `docs/crosscheck.json` |
| `audit.mjs` | Measures overflow, names, targets, headings and contrast at 1440 and 375, with and without reduced motion | `docs/audit.json` |
| `shoot.mjs` | Desktop and mobile screenshots of the hero and the full page | `docs/screens/` |
| `shoot-sections.mjs` | One screenshot per story section plus the bowl stage | `docs/screens/` |

## Order for a full re-check

```bash
npm run build
npm run preview -- --port 4173     # separate terminal
npm test
npm run data:anchor
npm run data:fetch
npm run data:cross
npm run audit
npm run shots
```

The screenshot and audit scripts need the preview server. They use the locally installed Chrome through Playwright's `channel: 'chrome'`, so no browser download is required.

## Rules

- Do not let a script write a number into `data/sample42.csv`. The appendix values are authoritative.
- The fetch script writes a separate pull file. It never overwrites the sample.
- If a check fails, fix the cause, not the tolerance.
