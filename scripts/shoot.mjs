// Capture desktop and mobile screenshots of the built app.
// Usage: node scripts/shoot.mjs [url]
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const url = process.argv[2] ?? 'http://localhost:4173/';
const out = 'docs/screens';
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });

async function shoot(name, width, height, fullPage) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage });
  console.log(name, errors.length ? `console errors: ${errors.join(' | ')}` : 'no console errors');
  await page.close();
}

await shoot('desktop-hero', 1440, 900, false);
await shoot('desktop-full', 1440, 900, true);
await shoot('mobile-hero', 375, 812, false);
await shoot('mobile-full', 375, 812, true);

await browser.close();
