# Final audit

## Verdict

The explorer builds, the tests pass, the numbers reconcile with the IA, and the layout holds at four widths. The stage is a photoreal Blue Marble globe with a dark stage and a light reading panel, the mobile section index is a native select, and every non-inline control is at least 44 by 44 CSS pixels. It is not a perfect implementation of the brief: seven SVG charts instead of nine and a shorter research log. Those deviations are listed at the bottom rather than hidden. The app is live at https://peterachss.github.io/maths-ia-explorer/; https://maths-ia-explorer.surge.sh/ is a mirror.

## IA revision

The seven editorial issues in `docs/IA_RECONCILIATION.md` were fixed in a revised PDF kept outside this repository. It adds Appendix A (42 raw rows) and Appendix B (income group summary), tightens the 113.1 percent explanation, rewrites the Claude Works Cited entry, shortens the personal introduction, corrects the Figure 6 caption, clarifies 22.5 versus 22.54 and keeps the assessed body at 14 pages. The public site does not publish the IA or the revised PDF.

## Checks

| Check | Result |
|---|---|
| Production build | pass, no TypeScript errors |
| Tests | 46 passed in 5 files |
| IA anchors | 11 of 11 pass |
| Live World Bank pull | 42 of 42 rows, 0 missing, 0.00 percent GDP difference, 0.000 years life difference |
| Invariant: residuals sum to zero | covered by `regression.test.ts` |
| Invariant: least squares minimum | covered by `bowl.test.ts` |
| Invariant: predictions match IA | covered by `ia.contract.test.ts` |
| Horizontal overflow at 375, 768, 1024, 1440 | none |
| Console errors on load | none |
| Browser interaction sweep | desktop 25 steps, mobile 7 steps, 0 console, page, request or HTTP errors |
| Section index | Gap and Working assertions pass on desktop and mobile |
| Country selection reveal | clicking a pillar, chart point or search hit scrolls the stats card into view; desktop tucks the selection bar under the sticky index, mobile places the card below the sticky stage |
| Map surface click | a click on a country's territory, or any bare point within 7 degrees of a marker, selects the nearest country; a beam click selects exactly that country; far-side beams cannot hover or select; drags never select |
| Live site | deployed on GitHub Pages; the CSV, fonts and 8K/4K/2K textures return 200; no failed requests or console errors at 1440, 1024, 768 and 375; deep link `?c=THA%2CKEN` shows Thailand and Kenya |
| Post-release rail and globe fixes | B18 removes the rail footer; E8 requests the 8K texture at 1440, the 2K at 375 and the 4K on GPUs capped below 8K; no failed requests or console errors under the Pages base path. |
| Data error path | readable alert when the CSV is blocked |
| Unnamed interactive controls | 0 |
| Unlabelled SVG charts | 0 |
| Images without alt text | 0 |
| Heading structure | one h1, no skipped levels |
| Visible targets under 44 by 44 (non-inline) | 0 |
| Contrast | 4.51:1 on the primary button to 17.2:1 on primary text; body text 6.3:1 or better, all AA |
| Reduced motion | honoured in CSS and in the Three.js code |
| Keyboard reach | all controls, except globe rotation |
| Screenshots | desktop hero, desktop bowl, seven story sections, mobile hero and full page |
| Documentation | README, decisions, worklog, research log and 16 reference docs |

## Numbers

| Quantity | Value |
|---|---|
| Countries | 42 |
| Log slope | 5.92768 |
| Log intercept | 16.02456 |
| Log r | 0.8767 |
| Log r squared | 0.7687 |
| Log s_e | 4.347 years |
| Linear slope | 0.00022027 |
| Linear intercept | 66.1419 |
| Linear r | 0.7449 |
| Linear r squared | 0.5549 |
| Linear s_e | 6.029 years |
| Predicted Singapore | 85.3836 |
| Predicted Zimbabwe | 66.5045 |
| Model gap | 18.8792 |
| Share of observed gap | 83.78 percent |
| Income for Singapore's life expectancy | $89,245 |
| Sensitivity share | 79.33 percent |

## Deviations from the brief

1. **Seven SVG charts, not nine.** The brief counted the fit comparison and the sensitivity table as charts. They are tables, and counting them twice would be padding. The seven figures are scatter, two residual panels, gap, derivative, inverse and box plots, plus the bowl in 3D.
2. **The research log has 13 entries, not 60.** Every entry is a source that was actually opened and used. The log says so at the top. Inventing 48 more would have made it worthless.
3. **Playwright with installed Chrome, not a manual browser session.** Screenshots, console errors and DOM measurements were taken with Playwright driving the installed Chrome through `channel: 'chrome'`. The bundled Playwright browser is not installed in this checkout, so `check-ui.mjs` and `interaction-test.mjs` now use the same Chrome channel as the screenshot and audit scripts. Nobody clicked every control by hand on a physical device; that remains a useful follow-up.
4. **The panel scrolls inside a split view.** The brief imagined a full page story. The split view was chosen so the globe stays visible, and the trade-off is documented.

## What is still worth doing

1. Check the revised IA PDF against the school's current page limit and AI disclosure wording before submission. The appendices and Works Cited edits are done; the school policy is the remaining judgement.
2. Run Lighthouse on the deployed URL and record the result.
3. Test on a real low-end phone, particularly the 3D stage.
4. Add a keyboard way to rotate or select on the globe, beyond the search and the table.
5. If the sample is ever extended, replace the capital coordinates with population-weighted centroids and handle small island states explicitly.

## Files that prove the claims

- `docs/TEST_RUN.txt`: the actual test output.
- `docs/BUILD.txt`: the actual build output and bundle sizes.
- `docs/audit.json`: the DOM measurements and contrast ratios.
- `docs/crosscheck.json`: the independent recomputation of every statistic.
- `docs/IA_RECONCILIATION.md`: the side by side comparison with the written IA.
- `docs/interaction-report.json`: the 27 desktop + 8 mobile interaction run.
- `audit/live/ui-checks.json`: the live four-width UI, keyboard, reduced-motion and WebGL checks.
- `audit/live/github-checks.json`: live canonical URL, deep link, scroll-lock and drag-guard measurements.
- `audit/live/b18-e8-checks.json`: the live B18/E8 texture, rail and deep-link checks.
- `audit/live/github-1440-zoom.png`: the live 8K globe at the closest zoom.
- `docs/screens/`: the captured screens.
