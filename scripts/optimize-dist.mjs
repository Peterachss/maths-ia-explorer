// Post-build: inline the small critical stylesheet and stop Vite's manual
// chunks for three.js from being modulepreloaded before the deferred canvas.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve('dist');
const indexPath = resolve(dist, 'index.html');
if (!existsSync(indexPath)) process.exit(0);
let html = readFileSync(indexPath, 'utf8');

// Remove early preloads for the deferred 3D chunks. The dynamic import will
// fetch them normally when the canvas mounts.
html = html.replace(/\s*<link rel="modulepreload" crossorigin href="[^"]*(?:three|r3f)-[^"]*\.js">/g, '');

// Inline the single stylesheet. It is under 10 kB gzipped and removes a
// render-blocking request from the critical path.
for (const link of [...html.matchAll(/<link rel="stylesheet" crossorigin href="([^"]+)">/g)]) {
  const assetPath = resolve(dist, link[1].replace(/^\//, ''));
  if (existsSync(assetPath)) {
    const css = readFileSync(assetPath, 'utf8');
    html = html.replace(link[0], `<style>${css}</style>`);
  }
}
writeFileSync(indexPath, html);
console.log('optimised dist/index.html: CSS inlined, deferred 3D preloads removed');
