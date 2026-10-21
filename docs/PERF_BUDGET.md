# Performance budget

## Measured build

From `npm run build` on 21 October 2026. Sizes are before gzip unless stated.

| Asset | Raw | Gzip | Loaded |
|---|---|---|---|
| `index.html` | 0.97 kB | 0.48 kB | immediately |
| App code `index-*.js` | 53.69 kB | 17.07 kB | immediately |
| d3 bundle | 46.06 kB | 18.05 kB | immediately |
| CSS | 18.67 kB | 4.97 kB | immediately |
| Fonts, two woff2 files | 41.23 kB | n/a | immediately, `font-display: swap` |
| Globe stage chunk | 119.20 kB | 44.66 kB | lazy, on first paint of the stage |
| React Three Fiber | 304.49 kB | 98.21 kB | lazy, with the stage |
| Three.js | 666.65 kB | 172.43 kB | lazy, with the stage |
| Model stage chunk | 2.15 kB | 1.05 kB | lazy, on tab switch |
| Preview pillar chunk | 1.60 kB | 0.81 kB | lazy, on first selection |
| Globe textures, six images | 1.97 MB | n/a | lazy, with the stage |

Initial JavaScript and CSS, excluding fonts: about 118 kB raw, 40 kB gzip. The 3D code, once the stage mounts: about 1.09 MB raw, 315 kB gzip. The textures add about 1.97 MB on a cold cache.

## Budget

| Item | Budget | Measured | Status |
|---|---|---|---|
| Initial JS + CSS, gzip | 120 kB | 40.1 kB | pass |
| 3D code, gzip | 350 kB | 315.3 kB | pass, close |
| Fonts | 150 kB | 41.2 kB | pass |
| Requests before interaction | 10 | not instrumented | unknown |
| Layout shift from fonts | 0 | 0, self-hosted with size-adjust fallbacks | pass |
| Main thread long tasks at load | under 200 ms | not instrumented | unknown |

The 3D code is the one to watch. Three.js is 172 kB gzip on its own. It is lazy loaded so that the text, tables and SVG charts are usable before WebGL arrives, and the app shows a short status line while it loads. The globe textures are lazy loaded with the stage; mobile requests the 2k day map, desktop the 4k map, plus the normal, specular and cloud maps.

## Techniques used

- Route level `lazy()` for the two 3D stages and the preview pillar.
- Manual chunking in Vite for three, React Three Fiber and d3, so a change to app code does not invalidate the vendor chunks.
- Self-hosted Instrument Sans in woff2, with only the latin and latin-ext subsets.
- No image asset blocks the panel. The globe textures load with the 3D stage and are not in the initial text path.
- CSS is a single 18.7 kB file; no CSS-in-JS runtime.
- No analytics, no tag manager, no third party scripts.

## What is not measured

- Lighthouse scores. The audit is structural and bundle based, not a Lighthouse run.
- Real device performance on a low-end phone. The 3D scene is capped at device pixel ratio 2 and uses simple cylinder geometry, but this has not been profiled on hardware.
- Time to interactive on a cold cache over a slow network, including the 1.97 MB of globe textures.
