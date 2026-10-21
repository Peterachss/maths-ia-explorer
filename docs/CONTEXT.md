# Context for a future session

You are picking up a finished static app, not a greenfield build.

## What it is

`maths-ia-explorer` is an interactive companion to Peter's IB Mathematics AA SL Internal Assessment. The IA models life expectancy against GDP per capita for 42 countries in 2019. The app has a 3D globe, a least squares bowl, seven SVG charts, a country picker, a working panel and a sensitivity view.

## Where it lives

`C:\Users\peter\OneDrive\Desktop\PETER _ CLAUDE\Maths IA Explorer\maths-ia-explorer`

The original brief is one level up: `IA_MASTER_PROMPT_40K.md`. The student's IA is at `C:\Users\peter\Downloads\IA (1).pdf`. A text extraction is at `C:\Users\peter\AppData\Local\Temp\opencode\ia1.txt`, which may not survive a reboot.

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
node scripts/shoot.mjs
node scripts/shoot-sections.mjs
```

The preview server must be running on 4173 before the audit or screenshot scripts.

## Architecture

- `src/data/load.ts` fetches `public/data/sample42.csv` and parses it into `Country` objects.
- `src/math/analyse.ts` is the single entry point for every number: both fits, the gap, the inverse, the summaries, the correlation tests.
- `src/store.ts` is Zustand, with selection, exclusion, stage, axis and model state. It syncs to the URL.
- `src/App.tsx` composes the stage and the panel, and runs the IntersectionObserver that flies the camera to the countries a section is about.
- `src/three/` holds the globe, pillars, arc, camera rig, bowl and preview pillar.
- `src/charts/` holds the SVG figures.
- `src/ui/` holds controls, tables, the working drawer and the tools.

## Numbers that must not drift

- 2019, n = 42, World Bank, Singapore 83.6 and $120,678, Zimbabwe 61.1 and $4,994, gap 22.5.
- Log model `y = 5.92768 ln x + 16.02456`, r = 0.8767, r squared = 0.7687, s_e = 4.347.
- Linear model `y = 0.00022027x + 66.1419`, r = 0.7449, r squared = 0.5549, s_e = 6.029.
- Predicted gap 18.8792, which is 83.78 percent of the observed gap.
- Without Nigeria and Chad: a = 5.6129, r = 0.9250, share 79.33 percent.

If a change moves one of these, the contract tests in `src/math/ia.contract.test.ts` should fail. Do not update the tests to match a changed number; find out why the number moved.

## Data authority

`data/sample42.csv` is the IA's Appendix A. It is authoritative. `data/worldbank_2019_pull.csv` is a check and matched exactly on 20 October 2026. Do not replace the appendix values with a fresh pull without recording the difference in `docs/INTEGRITY_NOTE.md`.

## Known issues

- The IA PDF is missing Appendix A and B. The data exist in the sheet and in this repository, but a moderator reading only the PDF cannot see them.
- The IA's Works Cited entry for AI assistance says "this practice draft" and should be rewritten.
- The app is live at https://peterachss.github.io/maths-ia-explorer/.
- The 3D chunk is 312 kB gzip, which is within budget but close.
- Buttons are 36 pixels tall, below the brief's 44 pixel comfort target.

## Style rules

- British spelling in the interface and docs.
- No em dashes.
- No invented numbers, ever. If data are missing, stop and ask.
- The visual world is a printed star chart: warm ink, cream paper, one vermilion thread, gold for the log model, blue for the line. Do not add gradients, glassmorphism, neon or a second accent colour.
- Charts are hand built SVG. Do not introduce a chart library.
