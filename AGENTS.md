# Agent ground rules

**Always read PROGRESS.md and DECISIONS.md before starting work.**

This repository is the companion site to an IB Maths AA SL Internal Assessment. It compares GDP per capita with life expectancy for 42 countries in 2019 and fits a straight line and a logarithmic curve. The rebuild must make every number, sentence and asset traceable, and make the interface feel calm, precise and organised in the spirit of NASA Earth Observatory.

## Rules

1. Work in phase order A to H. Do not start a phase until the previous phase passes its checks.
2. Every item has an ID (A1, B3, ...). Use the ID in commits and in PROGRESS.md.
3. Report evidence: a passing script, a screenshot path, or a URL and what it showed. If something cannot be verified, mark it `UNVERIFIED` and say why.
4. Screenshot at 1440x900, 1024x768, 768x1024 and 375x812 after every UI phase. Open the images and fix what is wrong.
5. Do not stop to ask questions. Put "ask me first" items in DECISIONS.md with the options and a recommendation, then continue.
6. Never change a data value or a number that appears in the IA. Log suspected errors in DECISIONS.md.
7. Stay on `rebuild/nasa-grade`. Never commit to main, deploy or force-push.
8. Commit small, with the ID in the message. `npm run build` must pass at every commit.
9. If context is compacted or work is resumed, re-read AGENTS.md, PROGRESS.md, DECISIONS.md and the brief.
10. If forced to stop, make the last line `CONTINUE FROM: <next ID>`.

## Brief summary

Audit every source and computed statistic (Phase A), fix the confirmed interface bugs (Phase B), reorganise the page into four numbered chapters with a shared section template and context bar (Phase C), document a tokenised design system (Phase D), rebuild the globe pillars and least-squares bowl (Phase E), give every chart one accessible frame with export and keyboard support (Phase F), and verify mobile, accessibility and performance (Phase G). Finish with REPORT.md (Phase H).

## Commands

- `npm run build` - type-check and production build
- `npm test` - Vitest contract tests
- `npm run data:all` - saved pull, anchors, Python cross-check, local source checks, live data check, stats check
- `npm run data:verify-live` - re-download all 84 World Bank values
- `npm run data:verify-stats` - recompute every rendered statistic
- `npx vite-node scripts/screenshot.ts audit/after` - capture the four widths and both 3D views
- `npx vite-node scripts/audit.ts audit/after` - axe-core and Lighthouse
