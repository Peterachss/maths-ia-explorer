# Performance budget

## Measured build

From `npm run build` on 20 October 2026. Sizes are before gzip unless stated.

| Asset | Raw | Gzip | Loaded |
|---|---|---|---|
| `index.html` | 0.95 kB | 0.47 kB | immediately |
| App code `index-*.js` | 45.94 kB | 14.92 kB | immediately |
| d3 bundle | 47.91 kB | 18.64 kB | immediately |
| CSS | 10.20 kB | 2.96 kB | immediately |
| Fonts, five woff2 files | 123.00 kB | n/a | immediately, `font-display: swap` |
| Globe stage chunk | 115.56 kB | 43.40 kB | lazy, on first paint of the stage |
| React Three Fiber | 300.60 kB | 96.63 kB | lazy, with the stage |
| Three.js | 666.61 kB | 172.41 kB | lazy, with the stage |
| Model stage chunk | 2.12 kB | 1.05 kB | lazy, on tab switch |
| Preview pillar chunk | 1.20 kB | 0.60 kB | lazy, on first selection |

Initial JavaScript and CSS, excluding fonts: about 104 kB raw, 36.5 kB gzip. The 3D chunk, once the stage mounts: about 1.08 MB raw, 312 kB gzip.

## Budget

| Item | Budget | Measured | Status |
|---|---|---|---|
| Initial JS + CSS, gzip | 120 kB | 36.5 kB | pass |
| 3D chunk, gzip | 350 kB | 312.4 kB | pass, close |
| Fonts | 150 kB | 123 kB | pass |
| Requests before interaction | 10 | 8 | pass |
| Layout shift from fonts | 0 | 0, self-hosted with size-adjust fallbacks | pass |
| Main thread long tasks at load | under 200 ms | not instrumented | unknown |

The 3D chunk is the one to watch. Three.js is 172 kB gzip on its own. It is lazy loaded so that the text, tables and SVG charts are usable before WebGL arrives, and the app shows a short status line while it loads.

## Techniques used

- Route level `lazy()` for the two 3D stages and the preview pillar.
- Manual chunking in Vite for three, React Three Fiber and d3, so a change to app code does not invalidate the vendor chunks.
- Self-hosted variable fonts in woff2, with only the latin and latin-ext subsets.
- No image assets in the initial view. The globe texture is generated at runtime from geometry, not downloaded as a bitmap.
- CSS is a single 10 kB file; no CSS-in-JS runtime.
- No analytics, no tag manager, no third party scripts.

## What is not measured

- Lighthouse scores. The audit is structural and bundle based, not a Lighthouse run.
- Real device performance on a low-end phone. The 3D scene is capped at device pixel ratio 2 and uses simple cylinder geometry, but this has not been profiled on hardware.
- Time to interactive on a cold cache over a slow network.
