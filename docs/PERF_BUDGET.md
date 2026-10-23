# Performance budget

## Measured build

From `npm run build` on 23 October 2026 with `BASE_PATH=/maths-ia-explorer/`. Sizes are before gzip unless stated.

| Asset | Raw | Gzip | Loaded |
|---|---|---|---|
| `index.html` shell | 2.08 kB | 0.73 kB | immediately |
| App code `index-*.js` | 93.92 kB | 28.42 kB | immediately |
| React | 145.99 kB | 47.15 kB | immediately |
| Shared vendor | 13.88 kB | 4.24 kB | immediately |
| d3 bundle | 47.61 kB | 18.46 kB | immediately |
| CSS (inlined into the HTML) | 45.74 kB | 9.81 kB | immediately |
| Fonts, two woff2 files | 41.23 kB | n/a | immediately, `font-display: swap` |
| Globe stage and map geometry | 121.36 kB | 44.76 kB | lazy, with the stage |
| React Three Fiber | 153.40 kB | 49.73 kB | lazy, with the stage |
| Three.js | 666.65 kB | 172.43 kB | lazy, with the stage |
| Model stage chunk | 2.23 kB | 1.09 kB | lazy, on tab switch |
| Globe textures | 6.42 MB for all four files; one day render loads | n/a | lazy, with the stage |

Initial JavaScript and CSS, excluding fonts: about 347 kB raw, 108 kB gzip, including the CSS inlined into the HTML. The 3D code, once the stage mounts: about 944 kB raw, 268 kB gzip. The textures add about 4.5 MB on a desktop cold cache (8K plus poster), 1.55 MB on a 4K-capped GPU and 0.45 MB on a phone.

## Budget

| Item | Budget | Measured | Status |
|---|---|---|---|
| Initial JS + CSS, gzip | 120 kB | 108.1 kB | pass |
| 3D code, gzip | 350 kB | 268.0 kB | pass |
| Fonts | 150 kB | 41.2 kB | pass |
| Requests before interaction | 10 | not instrumented | unknown |
| Layout shift from fonts | 0 | 0, self-hosted with size-adjust fallbacks | pass |
| Main thread long tasks at load | under 200 ms | not instrumented | unknown |

The 3D code is the one to watch. Three.js is 172 kB gzip on its own. It is lazy loaded so that the text, tables and SVG charts are usable before WebGL arrives, and the app shows a short status line while it loads. The globe textures are lazy loaded with the stage; phones request the 2K day map, desktop the 8K map (4K on GPUs capped below 8192), and the border overlay is generated at 4K. There are no normal, specular or cloud maps. The 8K render is 4.46 MB, a deliberate quality trade for a crisp globe at the closest zoom; phones pay 0.42 MB.

## Techniques used

- Route level `lazy()` for the two 3D stages.
- Manual chunking in Vite for React, React Three Fiber, three, d3 and map geometry, so a change to app code does not invalidate the vendor chunks.
- Self-hosted Instrument Sans in woff2, with only the latin and latin-ext subsets.
- No image asset blocks the panel. The globe textures load with the 3D stage and are not in the initial text path.
- CSS is a single 45.7 kB file, inlined into the HTML by `optimize-dist.mjs`; no CSS-in-JS runtime.
- No analytics, no tag manager, no third party scripts.

## What is not measured

- Lighthouse scores. The audit is structural and bundle based, not a Lighthouse run.
- Real device performance on a low-end phone. The 3D scene is capped at device pixel ratio 2 and uses simple cylinder geometry, but this has not been profiled on hardware.
- Time to interactive on a cold cache over a slow network, including the 4.5 MB 8K texture on desktop.
