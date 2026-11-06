// Capture every story section by scrolling the desktop reading panel.
import { chromium } from 'playwright';

const url = process.argv[2] ?? process.env.URL ?? 'http://127.0.0.1:4173/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);

await page.getByRole('button', { name: 'Compare Zimbabwe and Singapore' }).click();
await page.waitForTimeout(1600);

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
    const panel = document.querySelector('.panel-scroll');
    const el = [...document.querySelectorAll('.panel h2')].find((n) => n.textContent?.includes(h));
    if (panel && el) {
      const panelTop = panel.getBoundingClientRect().top;
      panel.scrollTop += el.getBoundingClientRect().top - panelTop - 96;
    }
  }, heading);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `docs/screens/section-${name}.png` });
}

await page.evaluate(() => { const p = document.querySelector('.panel-scroll'); if (p) p.scrollTop = 0; });
await page.getByRole('tab', { name: 'Least squares bowl' }).click();
await page.waitForTimeout(2600);
await page.screenshot({ path: 'docs/screens/desktop-bowl.png' });

console.log(errors.length ? `errors: ${errors.join(' | ')}` : 'no console errors');
await browser.close();
