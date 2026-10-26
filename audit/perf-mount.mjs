import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

await page.addInitScript(() => {
  window.__long = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      window.__long.push({ start: Math.round(e.startTime), duration: Math.round(e.duration) });
    }
  }).observe({ entryTypes: ['longtask'] });
});

const t0 = Date.now();
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'load' });
await page.waitForTimeout(7000);

const after = await page.evaluate(() => ({
  now: Math.round(performance.now()),
  hasCanvas: Boolean(document.querySelector('canvas')),
  long: window.__long.slice(),
  resources: performance
    .getEntriesByType('resource')
    .filter((e) => /textures|three|r3f|Stage|index-/.test(e.name))
    .map((e) => ({
      name: e.name.split('/').pop(),
      start: Math.round(e.startTime),
      duration: Math.round(e.duration),
      transfer: e.transferSize
    }))
}));

console.log('elapsed wall:', Date.now() - t0, 'ms');
console.log('canvas mounted:', after.hasCanvas);
console.log('long tasks:');
for (const t of after.long) console.log(`  start ${t.start} duration ${t.duration}`);
console.log('resources:');
for (const r of after.resources) console.log(' ', JSON.stringify(r));

await browser.close();
