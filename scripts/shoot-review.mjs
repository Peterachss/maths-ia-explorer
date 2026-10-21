// Mobile review shots: hero, the sticky section index, a model section and the bowl.
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: 'docs/screens/mobile-hero.png' });

await page.getByRole('button', { name: 'Compare Zimbabwe and Singapore' }).click();
await page.waitForTimeout(1600);

const go = async (heading, name) => {
  await page.evaluate((h) => {
    const el = [...document.querySelectorAll('.panel h2')].find((n) => n.textContent?.includes(h));
    el?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, heading);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `docs/screens/mobile-${name}.png` });
};

await go('A sample of 42', 'sample');
await go('Two models', 'models');
await go('The gap', 'gap');

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);
await page.getByRole('tab', { name: 'Least squares bowl' }).click();
await page.waitForTimeout(2400);
await page.screenshot({ path: 'docs/screens/mobile-bowl.png' });

console.log(errors.length ? `errors: ${errors.join(' | ')}` : 'no console errors');
await browser.close();
