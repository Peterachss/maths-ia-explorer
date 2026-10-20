// Capture every story section by scrolling the panel itself.
import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

await page.getByRole('button', { name: 'Compare Zimbabwe and Singapore' }).click();
await page.waitForTimeout(2000);

const sections = [
  ['sample', 'A sample of 42'],
  ['models', 'Two models'],
  ['gap', 'The gap'],
  ['rate', 'Rate of change'],
  ['inverse', 'What income would match?'],
  ['sensitivity', 'How sensitive is it?'],
  ['limits', 'What this shows']
];

for (const [name, heading] of sections) {
  await page.evaluate((h) => {
    const panel = document.querySelector('.panel');
    const el = [...document.querySelectorAll('.panel h2')].find((n) => n.textContent?.includes(h));
    if (panel && el) panel.scrollTop = el.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop - 16;
  }, heading);
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `docs/screens/section-${name}.png` });
}

await page.evaluate(() => { const p = document.querySelector('.panel'); if (p) p.scrollTop = 0; });
await page.getByRole('tab', { name: 'Least squares bowl' }).click();
await page.waitForTimeout(2600);
await page.screenshot({ path: 'docs/screens/desktop-bowl.png' });

console.log(errors.length ? `errors: ${errors.join(' | ')}` : 'no console errors');
await browser.close();
