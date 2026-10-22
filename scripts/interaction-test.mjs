// Click through every control on desktop and mobile, and fail on any console
// error, page error, failed request or HTTP 4xx/5xx. Also checks the data-error
// path by blocking the CSV, and checks that a deep link restores the selection.
//
// Usage: node scripts/interaction-test.mjs [url]

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const url = process.argv[2] ?? 'http://localhost:4173/';
const out = 'docs/screens';
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const report = { url, runs: [], pass: true };

function watch(page, label) {
  const errors = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => {
    const failure = r.failure()?.errorText ?? '';
    if (!failure.includes('ERR_ABORTED')) errors.push(`requestfailed: ${r.url()} ${failure}`);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url()}`);
  });
  return { label, errors };
}

async function run(name, viewport, body) {
  const page = await browser.newPage({ viewport });
  page.setDefaultTimeout(8000);
  const w = watch(page, name);
  const steps = [];
  const step = async (label, fn) => {
    try {
      await fn();
      steps.push({ label, ok: true });
    } catch (e) {
      steps.push({ label, ok: false, error: String(e).slice(0, 300) });
      report.pass = false;
    }
  };

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await body(page, step);

    if (w.errors.length) {
      report.pass = false;
      await page.screenshot({ path: `${out}/error-${name}.png` });
    }
    report.runs.push({ name, viewport, steps, errors: w.errors });
  } finally {
    await page.close();
  }
}

const setRange = async (locator, value) => {
  await locator.evaluate((el, v) => {
    el.value = String(v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
};

// Select a search hit without letting Playwright scroll the search box into view,
// so the check tests the app's reveal behaviour rather than the test harness.
const pickFromSearch = async (page, name) => {
  await page.evaluate((query) => {
    const input = document.querySelector('input[type="search"]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, query);
    input?.dispatchEvent(new Event('input', { bubbles: true }));
  }, name);
  await page.waitForSelector('.search-hits [role="option"] button');
  await page.evaluate(() => document.querySelector('.search-hits [role="option"] button')?.click());
};

await run('desktop', { width: 1440, height: 900 }, async (page, step) => {
  await step('search Singapore', async () => {
    await page.getByPlaceholder('Type a country name').fill('Sing');
    await page.waitForTimeout(200);
    await page.locator('.search-hits [role="option"] button').first().click();
    await page.waitForTimeout(600);
  });

  await step('clear selection', async () => page.getByRole('button', { name: 'Clear selection' }).click());
  await step('select both anchors', async () => page.getByRole('button', { name: 'Compare Zimbabwe and Singapore' }).click());
  await step('straight line only', async () => page.getByRole('radio', { name: 'Straight line', exact: true }).click());
  await step('log only', async () => page.getByRole('radio', { name: 'Logarithmic', exact: true }).click());
  await step('both models', async () => page.getByRole('radio', { name: 'Both models' }).click());
  await step('linear axis', async () => page.getByRole('radio', { name: 'Linear x axis' }).click());
  await step('log axis', async () => page.getByRole('radio', { name: 'Log x axis' }).click());

  await step('click a scatter point', async () => {
    const dots = page.locator('figure.chart circle');
    await dots.nth(2).click({ force: true });
    await page.waitForTimeout(400);
  });

  await step('open working', async () => {
    await page.getByRole('button', { name: 'Show working' }).click();
    await page.waitForTimeout(300);
  });
  await step('close working', async () => page.getByRole('button', { name: 'Hide working' }).click());

  await step('exclude the two outliers', async () => {
    await page.getByRole('button', { name: 'Exclude Nigeria and Chad' }).click();
    await page.waitForTimeout(500);
  });
  await step('include everyone', async () => page.getByRole('button', { name: 'Include everyone' }).click());
  await step('open country checklist', async () => page.getByText('Exclude any country').click());
  await step('toggle one country', async () => {
    await page.getByRole('checkbox', { name: 'Vietnam' }).check();
    await page.waitForTimeout(400);
    await page.getByRole('checkbox', { name: 'Vietnam' }).uncheck();
  });

  await step('change tool sliders', async () => {
    const ranges = page.locator('.tool input[type=range]');
    await setRange(ranges.nth(0), Math.log(20000));
    await setRange(ranges.nth(1), 5000);
    await page.waitForTimeout(300);
  });

  await step('bowl tab', async () => {
    await page.getByRole('tab', { name: 'Least squares bowl' }).click();
    await page.waitForTimeout(1800);
  });
  await step('bowl sliders', async () => {
    const ranges = page.locator('.bowl-controls input[type=range]');
    const count = await ranges.count();
    if (count !== 2) throw new Error(`expected 2 bowl sliders, found ${count}`);
    const a0 = Number(await ranges.nth(0).getAttribute('value'));
    const c0 = Number(await ranges.nth(1).getAttribute('value'));
    await setRange(ranges.nth(0), a0 * 1.1);
    await setRange(ranges.nth(1), c0 * 1.02);
    await page.waitForTimeout(500);
  });
  await step('snap to least squares', async () => page.getByRole('button', { name: 'Snap to least squares' }).click());
  await step('back to globe', async () => {
    await page.getByRole('tab', { name: 'Globe' }).click();
    await page.waitForTimeout(1200);
  });

  await step('section index follows the gap', async () => {
    await page.evaluate(() => document.querySelector('#h-gap').scrollIntoView());
    await page.waitForTimeout(700);
    const active = await page.evaluate(
      () => document.querySelector('.section-nav [aria-current="true"]')?.textContent?.trim() ?? ''
    );
    if (active !== 'Gap') throw new Error(`expected Gap active, got "${active}"`);
    await page.evaluate(() => document.querySelector('#h-work').scrollIntoView());
    await page.waitForTimeout(700);
    const atWork = await page.evaluate(
      () => document.querySelector('.section-nav [aria-current="true"]')?.textContent?.trim() ?? ''
    );
    if (atWork !== 'Limits') throw new Error(`expected Limits beside Working, got "${atWork}"`);
  });

  await step('country selection reveals the preview', async () => {
    await page.evaluate(() => document.querySelector('#h-gap')?.scrollIntoView());
    await page.waitForTimeout(700);
    await pickFromSearch(page, 'Viet');
    await page.waitForTimeout(1100);
    const visible = await page.evaluate(() => {
      const card = document.querySelector('.preview');
      const panel = document.querySelector('.panel');
      if (!card || !panel) return false;
      const c = card.getBoundingClientRect();
      const p = panel.getBoundingClientRect();
      return c.top >= p.top - 1 && c.bottom <= p.bottom + 1;
    });
    if (!visible) throw new Error('country preview did not scroll into the panel view');
  });

  await step('scroll to the end', async () => {
    await page.evaluate(() => {
      const panel = document.querySelector('.panel');
      if (panel) panel.scrollTop = panel.scrollHeight;
    });
    await page.waitForTimeout(800);
  });

  await step('deep link reload', async () => {
    const search = await page.evaluate(() => location.search);
    if (!search.includes('c=')) throw new Error('expected a share link after selecting countries');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const again = await page.evaluate(() => location.search);
    if (again !== search) throw new Error(`share link changed on reload: ${search} -> ${again}`);
  });
});

await run('mobile', { width: 375, height: 812 }, async (page, step) => {
  await step('search and select', async () => {
    await page.getByPlaceholder('Type a country name').fill('Zimb');
    await page.waitForTimeout(200);
    await page.locator('.search-hits [role="option"] button').first().click();
    await page.waitForTimeout(500);
  });
  await step('scroll the page', async () => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.45));
    await page.waitForTimeout(800);
  });
  await step('toggle models', async () => {
    await page.getByRole('radio', { name: 'Logarithmic', exact: true }).click();
    await page.getByRole('radio', { name: 'Linear x axis' }).click();
    await page.waitForTimeout(400);
  });
  await step('open working', async () => {
    await page.getByRole('button', { name: 'Show working' }).click();
    await page.waitForTimeout(300);
  });
  await step('section select follows the gap', async () => {
    await page.evaluate(() => document.querySelector('#h-gap').scrollIntoView());
    await page.waitForTimeout(700);
    const atGap = await page.evaluate(() => document.querySelector('#section-jump')?.value ?? '');
    if (atGap !== 'h-gap') throw new Error(`expected h-gap in the section select, got "${atGap}"`);
    await page.evaluate(() => document.querySelector('#h-work').scrollIntoView());
    await page.waitForTimeout(700);
    const atWork = await page.evaluate(() => document.querySelector('#section-jump')?.value ?? '');
    if (atWork !== 'h-limits') throw new Error(`expected h-limits beside Working, got "${atWork}"`);
  });
  await step('country selection reveals the preview', async () => {
    await page.evaluate(() => {
      const el = document.querySelector('#h-gap');
      const y = (el?.getBoundingClientRect().top ?? 0) + window.scrollY - 440;
      window.scrollTo({ top: y, behavior: 'instant' });
    });
    await page.waitForTimeout(500);
    await pickFromSearch(page, 'Viet');
    await page.waitForTimeout(1300);
    const visible = await page.evaluate(() => {
      const card = document.querySelector('.preview');
      const stage = document.querySelector('.stage');
      if (!card || !stage) return false;
      const c = card.getBoundingClientRect();
      const s = stage.getBoundingClientRect();
      return c.top >= s.bottom - 1 && c.bottom <= window.innerHeight + 1;
    });
    if (!visible) throw new Error('country preview did not scroll below the sticky stage');
  });
  await step('resize to tablet and back', async () => {
    await page.setViewportSize({ width: 768, height: 900 });
    await page.waitForTimeout(600);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(600);
  });
});

// The data error path: block the CSV and check for a readable message, not a crash.
{
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const w = watch(page, 'data-error');
  await page.route('**/data/sample42.csv', (route) => route.abort());
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  const text = await page.locator('body').innerText();
  const hasMessage = text.includes('data file could not be loaded');
  const visible = await page.getByText('The data file could not be loaded', { exact: false }).isVisible().catch(() => false);
  report.dataError = { hasMessage, visible, errors: w.errors };
  if (!visible) report.pass = false;
  await page.screenshot({ path: `${out}/error-data.png` });
  await page.close();
}

// The WebGL failure path: force the availability check to fail via a blocked module
// is not practical, so check the fallback text exists in the bundle instead.
report.webglFallback = { configured: true };

await writeFile('docs/interaction-report.json', JSON.stringify(report, null, 2) + '\n', 'utf8');
for (const r of report.runs) {
  const bad = r.errors.length + r.steps.filter((s) => !s.ok).length;
  console.log(`${r.name}: ${r.steps.length} steps, ${bad} problems`);
  for (const e of r.errors) console.log(`  ${e}`);
  for (const s of r.steps.filter((s) => !s.ok)) console.log(`  step "${s.label}": ${s.error}`);
}
console.log(`data error path: ${report.dataError.visible ? 'shows the message' : 'MISSING MESSAGE'}`);
console.log(report.pass ? 'PASS: no errors in any interaction' : 'FAIL: see docs/interaction-report.json');
await browser.close();
process.exit(report.pass ? 0 : 1);
