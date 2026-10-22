# Context for a future session

You are picking up a finished static app, not a greenfield build.

## What it is

`maths-ia-explorer` is an interactive companion to Peter's IB Mathematics AA SL Internal Assessment. The IA models life expectancy against GDP per capita for 42 countries in 2019. The app has a photoreal globe, a least squares bowl, seven SVG charts, a country picker, a working panel, a sensitivity view and a section index that follows the reading position.

## Where it lives

`C:\Users\peter\OneDrive\Desktop\PETER _ CLAUDE\Maths IA Explorer\maths-ia-explorer`

The original brief is one level up: `IA_MASTER_PROMPT_40K.md`. The student's IA is at `C:\Users\peter\Downloads\IA (1).pdf`. A revised IA PDF is kept one level up, outside the repository, and must not be published. The public site and repo do not contain the IA.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview -- --port 4173
npm test
npm run data:fetch
npm run data:anchor
python scripts/crosscheck.py
node scripts/audit.mjs
node scripts/interaction-test.mjs
node scripts/shoot.mjs
node scripts/shoot-review.mjs
node scripts/shoot-sections.mjs
```

The preview server must be running on 4173 before the audit or screenshot scripts.

## Architecture

- `src/data/load.ts` fetches `public/data/sample42.csv` and parses it into `Country` objects.
- `src/math/analyse.ts` is the single entry point for every number: both fits, the gap, the inverse, the summaries, the correlation tests.
- `src/store.ts` is Zustand, with selection, exclusion, stage, axis and model state. It syncs to the URL.
- `src/App.tsx` composes the stage and the panel. Its IntersectionObserver flies the camera to the countries a section is about, and a scroll spy sets the active section index from the heading nearest the top of the reading area. The Working section is excluded from index candidates.
- `src/three/` holds the globe, pillars, arc, camera rig, bowl and preview pillar.
- `src/charts/` holds the SVG figures.
- `src/ui/` holds controls, tables, the working drawer and the tools.

## Numbers that must not drift

- 2019, n = 42, World Bank, Singapore 83.6 and $120,678, Zimbabwe 61.1 and $4,994, gap 22.5 (22.54 unrounded).
- Log model `y = 5.92768 ln x + 16.02456`, r = 0.8767, r squared = 0.7687, s_e = 4.347.
- Linear model `y = 0.00022027x + 66.1419`, r = 0.7449, r squared = 0.5549, s_e = 6.029.
- Predicted gap 18.8792, which is 83.78 percent of the observed 22.54-year gap.
- Without Nigeria and Chad: a = 5.6129, r = 0.9250, share 79.33 percent.

If a change moves one of these, the contract tests in `src/math/ia.contract.test.ts` should fail. Do not update the tests to match a changed number; find out why the number moved.

## Data authority

`data/sample42.csv` is the IA's Appendix A. It is authoritative. `data/worldbank_2019_pull.csv` is a check and matched exactly on 20 October 2026. Do not replace the appendix values with a fresh pull without recording the difference in `docs/INTEGRITY_NOTE.md`.

## Known issues

- The revised IA PDF is outside the repository. The public site does not publish the IA, and the revised PDF should stay private.
- The app is live at https://peterachss.github.io/maths-ia-explorer/; https://maths-ia-explorer.surge.sh/ is a mirror.
- The 3D chunks total about 271 kB gzip (r3f 98 kB, three 172 kB) and are lazy loaded.
- The stage tabs remain 36 pixels tall; primary controls are 44 and every visible target is at least 24 by 24.

## Style rules

- British spelling in the interface and docs.
- No em dashes.
- No invented numbers, ever. If data are missing, stop and ask.
- The visual world is a photoreal Earth inside a graphite instrument panel: ink, blue, coral for the gap, gold for the log model, Instrument Sans only. Solid dark chrome, not frosted glass. No rainbow bowl, neon or second accent colour.
- The NASA Blue Marble basemap is illustrative, not a 2019 data layer. Keep the attribution.
- Charts are hand built SVG. Do not introduce a chart library.
