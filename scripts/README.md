# Scripts

All browser scripts use the bundled Playwright Chromium (currently revision 1248). The installed Chrome 150 stalls under automation on this machine, so screenshots, UI checks, interaction tests and Lighthouse launch the bundled executable. No browser download happens at run time when the checkout's Playwright browser is present.

| Script | What it does | Output |
|---|---|---|
| `fetch_worldbank.mjs` | Pulls `NY.GDP.PCAP.PP.KD` and `SP.DYN.LE00.IN` for 2019 and compares them with Appendix A. **Do not run during a release**: the pull can overwrite authoritative values. | `data/worldbank_2019_pull.csv`, console summary |
| `anchor_check.mjs` | Re-derives the four anchors and the two predictions from the CSV; exits 1 on failure. | 11 checks |
| `crosscheck.mjs` / `crosscheck.py` | Independent Python recomputation of every statistic in the IA. | `docs/crosscheck.json` |
| `verify_sources.mjs` | Checks rows, codes, ranges, provenance, metadata, saved pull and cross-check. | 19 checks |
| `verify-data.ts` | Re-downloads all 84 World Bank values. | console, 42 rows / 84 values |
| `verify-stats.ts` | Recomputes every statistic rendered on the site. | 68 checks |
| `check-ui.mjs` | Four-width black-theme, contrast, overflow, target, badge, heading, keyboard, reduced-motion and WebGL checks. | `audit/black-release/ui-checks.json` |
| `interaction-test.mjs` | Desktop and mobile interaction sweep, including data-error, search, copy, fullscreen and export. | `docs/interaction-report.json` |
| `audit.ts` | axe-core over 16 width/chapter combinations, then Lighthouse desktop and mobile. Canonical `npm run audit`. | `audit/black-release/axe.json`, `lighthouse-*.json` |
| `audit.mjs` | Quick DOM, target, overflow and contrast audit. | `docs/audit.json` |
| `screenshot.ts` | Four-width release matrix: landing, globe, four chapters, bowl, full page. | `audit/black-release/` |
| `shoot.mjs` | Curated hero/full-page desktop and mobile screenshots. | `docs/screens/` |
| `shoot-sections.mjs` | One desktop screenshot per story section plus the bowl. | `docs/screens/` |
| `shoot-review.mjs` | Curated mobile screenshots, including the opened globe. | `docs/screens/` |

## Order for a full re-check

```bash
npm run build
npm run preview -- --port 4173     # separate terminal
npm test
npm run data:anchor
npm run data:cross
npm run data:verify
npm run data:verify-live
npm run data:verify-stats
npm run check:ui
npm run shots:release
npm run shots
npm run audit
```

`URL=http://127.0.0.1:4173/` can be set for scripts that accept a URL. `npm run check:ui` takes an optional output path, defaulting to `audit/black-release/ui-checks.json`. `npm run audit` fills the axe and Lighthouse files in the same directory.

## Rules

- Never run `data:fetch` or `data:all` for a normal verification: they can overwrite the authoritative Appendix A values. Run the verification scripts individually.
- The canonical deploy is a normal push to `main`; GitHub Actions builds with `BASE_PATH=/maths-ia-explorer/`. Surge is a mirror built from a normal root build.
- Do not force-push.
- Read `PROGRESS.md` and `DECISIONS.md` before changing the release.
