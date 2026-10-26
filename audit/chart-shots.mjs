// Capture each chart at desktop and phone widths, and report label metrics.
// Element screenshots re-scroll the page, which hides chart tops under the
// sticky stage on mobile. Scroll to a sensible reading position, then clip a
// viewport screenshot to the measured chart box.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.URL ?? 'http://127.0.0.1:4173/';
const out = 'audit/charts';
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const report = {};

for (const [name, width, height] of [
  ['1440', 1440, 900],
  ['375', 375, 812]
]) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4200);

  const charts = page.locator('.chart');
  const count = await charts.count();
  report[name] = { count, charts: [] };

  for (let i = 0; i < count; i++) {
    const chart = charts.nth(i);
    await chart.evaluate((el) => el.scrollIntoView({ block: 'center', inline: 'nearest' }));
    await page.waitForTimeout(600);

    // On stacked layouts the stage and contents bar are sticky at the top of
    // the viewport. Move the chart below them so its title is visible.
    if (width <= 1200) {
      const adjust = await page.evaluate((index) => {
        const chart = document.querySelectorAll('.chart')[index];
        if (!chart) return 0;
        const box = chart.getBoundingClientRect();
        const stage = document.querySelector('.stage');
        const bar = document.querySelector('.section-jump');
        const stageH = stage?.getBoundingClientRect().height ?? 0;
        const barH = bar?.getBoundingClientRect().height ?? 0;
        const desired = stageH + barH + 14;
        const delta = box.top - desired;
        if (Math.abs(delta) > 1) window.scrollBy(0, delta);
        return delta;
      }, i);
      if (adjust) await page.waitForTimeout(350);
    }

    const info = await chart.evaluate((el) => {
      const box = el.getBoundingClientRect();
      const svg = el.querySelector('svg');
      const tick = el.querySelector('.tick');
      const title = el.querySelector('.chart-title');
      const labels = [...el.querySelectorAll('text')].map((t) => {
        const r = t.getBoundingClientRect();
        return { text: (t.textContent ?? '').slice(0, 40), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
      }).filter((l) => l.w > 0 && l.h > 0);
      const overflow = labels.filter((l) =>
        l.x < box.x - 1 || l.x + l.w > box.x + box.width + 1 ||
        l.y < box.y - 1 || l.y + l.h > box.y + box.height + 1
      );
      return {
        className: el.className,
        box: { x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height) },
        width: Math.round(box.width),
        height: Math.round(box.height),
        svg: svg ? { width: Math.round(svg.getBoundingClientRect().width), height: Math.round(svg.getBoundingClientRect().height), viewBox: svg.getAttribute('viewBox') } : null,
        tickSize: tick ? getComputedStyle(tick).fontSize : null,
        titleSize: title ? getComputedStyle(title).fontSize : null,
        overflow,
        labels
      };
    });
    report[name].charts.push(info);
    await page.screenshot({
      path: `${out}/${name}-chart-${i + 1}.png`,
      clip: { x: info.box.x, y: info.box.y, width: info.box.w, height: info.box.h }
    });
  }

  report[name].errors = errors;
  await context.close();
}

await browser.close();
await writeFile(`${out}/report.json`, JSON.stringify(report, null, 2));
const overflows = Object.fromEntries(Object.entries(report).map(([k, v]) => [k, v.charts.flatMap((c) => c.overflow)]));
console.log(JSON.stringify({ '1440': report['1440'].count, '375': report['375'].count, errors: [...report['1440'].errors, ...report['375'].errors], overflows }, null, 2));
