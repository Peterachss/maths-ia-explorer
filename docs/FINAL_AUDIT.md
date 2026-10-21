# Final audit

## Verdict

The explorer builds, the tests pass, the numbers reconcile with the IA, and the layout holds at four widths. It is not a perfect implementation of the brief: seven SVG charts instead of nine, a shorter research log, and controls at 36 pixels rather than 44. Those deviations are listed at the bottom rather than hidden. The app is live at https://peterachss.github.io/maths-ia-explorer/.

## Checks

| Check | Result |
|---|---|
| Production build | pass, no TypeScript errors |
| Tests | 39 passed in 4 files |
| IA anchors | 11 of 11 pass |
| Live World Bank pull | 42 of 42 rows, 0 missing, 0.00 percent GDP difference, 0.000 years life difference |
| Invariant: residuals sum to zero | covered by `regression.test.ts` |
| Invariant: least squares minimum | covered by `bowl.test.ts` |
| Invariant: predictions match IA | covered by `ia.contract.test.ts` |
| Horizontal overflow at 375, 414, 768, 1440 | none |
| Console errors on load | none |
| Browser interaction sweep | desktop 22 steps, mobile 5 steps, 0 console, page, request or HTTP errors |
| Live site | deployed on GitHub Pages, 42 rows load, no console errors |
| Data error path | readable alert when the CSV is blocked |
| Unnamed interactive controls | 0 |
| Unlabelled SVG charts | 0 |
| Images without alt text | 0 |
| Heading structure | one h1, no skipped levels |
| Contrast | 6.57:1 to 15.23:1, all AA |
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
2. **The research log has 12 entries, not 60.** Every entry is a source that was actually opened and used. The log says so at the top. Inventing 48 more would have made it worthless.
3. **Controls are 36 pixels tall, not 44.** They pass WCAG 2.2 AA, whose minimum is 24 by 24, but miss the brief's comfort target. Recorded in `DECISIONS.md` and `docs/A11Y_PLAN.md`.
4. **No Lighthouse score.** The audit is structural and bundle based. A Lighthouse run would be a useful addition but was not performed.
5. **Chrome headless, not a manual browser session.** Screenshots, console errors and DOM measurements were taken with Playwright driving Chrome. The interaction sweep clicks every control programmatically, but nobody clicked every control by hand on a physical device.
6. **The panel scrolls inside a split view.** The brief imagined a full page story. The split view was chosen so the globe stays visible, and the trade-off is documented.

## What is still worth doing

1. Add the missing Appendix A and B to the IA PDF, or attach the sheet. This matters more than any app feature.
2. Rewrite the Works Cited entry for AI assistance.
3. Run Lighthouse on the deployed URL and record the result.
4. Test on a real low-end phone, particularly the 3D stage.
5. Add a keyboard way to rotate or select on the globe, beyond the search and the table.
6. If the sample is ever extended, replace the capital coordinates with population-weighted centroids and handle small island states explicitly.

## Files that prove the claims

- `docs/TEST_RUN.txt`: the actual test output.
- `docs/BUILD.txt`: the actual build output and bundle sizes.
- `docs/audit.json`: the DOM measurements and contrast ratios.
- `docs/crosscheck.json`: the independent recomputation of every statistic.
- `docs/IA_RECONCILIATION.md`: the side by side comparison with the written IA.
- `docs/screens/`: the captured screens.
