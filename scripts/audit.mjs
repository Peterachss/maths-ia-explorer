// A small, honest accessibility and layout audit of the built app.
// Writes docs/audit.json and prints a summary.
// Usage: node scripts/audit.mjs [url]

import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';

const url = process.argv[2] ?? 'http://localhost:4173/';
const browser = await chromium.launch({ channel: 'chrome' });
const results = {};

for (const [name, width, height] of [
  ['desktop', 1440, 900],
  ['mobile', 375, 812]
]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'no-preference' });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  results[name] = await page.evaluate(() => {
    const name = (el) =>
      (el.getAttribute('aria-label') || el.getAttribute('title') || (el.labels && [...el.labels].map((l) => l.textContent).join(' ')) || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);

    const interactive = [...document.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')];
    const unnamed = interactive.filter((el) => !name(el)).map((el) => el.tagName);

    const svgs = [...document.querySelectorAll('svg')];
    const svgUnlabelled = svgs.filter((s) => {
      const role = s.getAttribute('role');
      const hidden = s.getAttribute('aria-hidden') === 'true';
      const labelled = s.getAttribute('aria-label') || s.querySelector('title');
      return !hidden && (!role || role === 'img') && !labelled;
    }).length;

    const imgs = [...document.querySelectorAll('img')];
    const imgNoAlt = imgs.filter((i) => !i.hasAttribute('alt')).length;

    const headings = [...document.querySelectorAll('h1, h2, h3, h4')].map((h) => ({ level: Number(h.tagName[1]), text: name(h).slice(0, 50) }));
    let skips = 0;
    for (let i = 1; i < headings.length; i++) if (headings[i].level - headings[i - 1].level > 1) skips++;

    const smallTargets = interactive
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, text: name(el), w: Math.round(r.width), h: Math.round(r.height) };
      })
      .filter((t) => t.w > 0 && t.h > 0 && (t.h < 24 || t.w < 24));

    return {
      viewport: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      interactive: interactive.length,
      unnamed,
      svgs: svgs.length,
      svgUnlabelled,
      imgs: imgs.length,
      imgNoAlt,
      h1: headings.filter((h) => h.level === 1).length,
      headingSkips: skips,
      smallTargets: smallTargets.slice(0, 12)
    };
  });

  // Reduced motion: the CSS durations should collapse to 0ms.
  const reduced = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  await reduced.goto(url, { waitUntil: 'networkidle' });
  await reduced.waitForTimeout(1200);
  results[`${name}ReducedMotion`] = await reduced.evaluate(() => {
    const el = document.querySelector('.panel h1') ?? document.body;
    return { duration: getComputedStyle(el).transitionDuration, scrollBehaviour: getComputedStyle(document.documentElement).scrollBehavior };
  });
  await reduced.close();

  await page.close();
}

// WCAG contrast for the pairs used for text.
function luminance(hex) {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  const f = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Number(((l1 + 0.05) / (l2 + 0.05)).toFixed(2));
}
results.contrast = {
  'paper-0 on ink-1': ratio('#f1e9d7', '#16140f'),
  'paper-1 on ink-1': ratio('#c9bfa6', '#16140f'),
  'paper-2 on ink-1': ratio('#a39a82', '#16140f'),
  'thread-text on ink-1': ratio('#f07a56', '#16140f'),
  'model-log on ink-1': ratio('#e9b44c', '#16140f'),
  'model-linear on ink-1': ratio('#86a9d1', '#16140f')
};

await writeFile('docs/audit.json', JSON.stringify(results, null, 2) + '\n', 'utf8');
console.log(JSON.stringify(results, null, 1));
await browser.close();
