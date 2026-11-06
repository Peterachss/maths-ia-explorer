# Performance budget

## Measured build

From the 6 November 2026 black release with `BASE_PATH=/maths-ia-explorer/`. Sizes are before gzip unless stated.

| Asset | Raw | Gzip | Loaded |
|---|---|---|---|
| `index.html` shell | 2.05 kB | 0.72 kB | immediately |
| App code `index-*.js` | 114.67 kB | 33.74 kB | immediately |
| React | 145.99 kB | 47.15 kB | immediately |
| Shared vendor | 10.92 kB | 3.60 kB | immediately |
| d3 bundle | 47.61 kB | 18.46 kB | immediately |
| CSS (inlined into the HTML) | 83.18 kB | 16.30 kB | immediately |
| Fonts, two woff2 files | 41.23 kB | n/a | immediately, `font-display: swap` |
| Globe stage and map geometry | 121.60 kB | 44.90 kB | lazy, with the stage |
| React Three Fiber | 153.40 kB | 49.73 kB | lazy, with the stage |
| Three.js | 666.65 kB | 172.43 kB | lazy, with the stage |
| Model stage chunk | 2.23 kB | 1.09 kB | lazy, on tab switch |
| Globe textures | 6.1 MB for all four files; one day render loads according to stage size | n/a | lazy, with the stage |

Initial JavaScript and CSS, excluding fonts: about 402 kB raw, 119 kB gzip, including the CSS inlined into the HTML. The 3D code, once the stage mounts: about 942 kB raw, 267 kB gzip. Textures add about 1.43 MB on a laptop cold cache (4K plus poster) and 436 kB on a phone after the reader opens the globe (2K plus poster). The 8K tier is reserved for stages at least 2000 device pixels wide.

## Budget

| Item | Budget | Measured | Status |
|---|---|---|---|
| Initial JS + CSS, gzip | 120 kB | 119.2 kB | pass |
| 3D code, gzip | 350 kB | 268.0 kB | pass |
| Fonts | 150 kB | 41.2 kB | pass |
| Requests before interaction | 10 | not instrumented | unknown |
| Layout shift from fonts | 0 | 0, self-hosted with size-adjust fallbacks | pass |
| Main thread long tasks at load | under 200 ms | not instrumented | unknown |

The 3D code is the one to watch. Three.js is 172 kB gzip on its own. It is lazy loaded so that the text, tables and SVG charts are usable before WebGL arrives, and the app shows a short status line while it loads. The globe textures are lazy loaded with the stage; the tier follows the stage width, so 1440 and 1024 use the 4K day map, phones use the 2K map after the poster is opened, and 8K is reserved for stages at least 2000 device pixels wide. The border overlay is 4096 on those large stages and 2048 otherwise. There are no normal, specular or cloud maps. The 4K render is 1.4 MB and the 2K is 406 kB; the 8K render is 4.3 MB for very large displays.

## Techniques used

- Route level `lazy()` for the two 3D stages.
- Manual chunking in Vite for React, React Three Fiber, three, d3 and map geometry, so a change to app code does not invalidate the vendor chunks.
- Self-hosted Instrument Sans in woff2, with only the latin and latin-ext subsets.
- No image asset blocks the panel. The globe textures load with the 3D stage and are not in the initial text path.
- CSS is a single 83.2 kB file, inlined into the HTML by `optimize-dist.mjs`; no CSS-in-JS runtime.
- No analytics, no tag manager, no third party scripts.

## What is not measured

- Real-device performance on a low-end phone. The 3D scene is capped at device pixel ratio 2 and uses simple cylinder geometry, but this has not been profiled on hardware.
- Time to interactive on a cold cache over a slow network. The structural budget is not a substitute for the live network trace.

Lighthouse is run separately by `npm run audit`; the final release measured desktop 100/100/100/100 and mobile 97/100/100/100, with desktop ranging 78–100 across repeats as the deferred 4K mount moved in and out of the trace.
