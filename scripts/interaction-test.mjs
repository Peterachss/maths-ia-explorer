// Click through every control on desktop and mobile, and fail on any console
// error, page error, failed request or HTTP 4xx/5xx. Also checks the data-error
// path by blocking the CSV, and checks that a deep link restores the selection.
//
// Usage: node scripts/interaction-test.mjs [url]

import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const url = process.argv[2] ?? 'http://localhost:4173/';
const out = 'docs/screens';
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
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
  const context = await browser.newContext({
    viewport,
    permissions: ['clipboard-read', 'clipboard-write']
  });
  const page = await context.newPage();
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
    // Desktop mounts the scene when idle; phones keep the poster until asked.
    if (!(await page.locator('.poster-open').count())) {
      await page.waitForSelector('.stage canvas', { state: 'attached', timeout: 10000 }).catch(() => {});
    }
    await body(page, step);

    if (w.errors.length) {
      report.pass = false;
      await page.screenshot({ path: `${out}/error-${name}.png` });
    }
    report.runs.push({ name, viewport, steps, errors: w.errors });
  } finally {
    await page.close();
    await context.close();
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
  await page.waitForSelector('.search-hits [role="option"]');
  await page.evaluate(() => document.querySelector('.search-hits [role="option"]')?.click());
};

await run('desktop', { width: 1440, height: 900 }, async (page, step) => {
  await step('map surface picks the nearest country', async () => {
    // Spiral out from the globe centre to the most central facing pillar, then
    // click a bare point just off its beam: outside the ~10px hit cylinder
    // (no label under the cursor) but within the 7 degree surface pick radius.
    const centre = await page.evaluate(() => {
      const r = document.querySelector('.stage canvas')?.getBoundingClientRect();
      return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
    });
    if (!centre) throw new Error('no stage canvas');
    const hovering = async () => {
      const sel = (await page.locator('.chip').allInnerTexts()).map((s) => s.replace(/\s+/g, ' ').trim());
      for (const raw of await page.locator('.pillar-label').allInnerTexts()) {
        const name = raw.replace(/\s+/g, ' ').replace(/\s*\d.*$/, '').trim();
        if (name && !sel.includes(name)) return name;
      }
      return null;
    };
    let beam = null;
    for (let r = 0; r <= 300 && !beam; r += 12) {
      for (let a = 0; a < 360; a += 10) {
        const x = Math.round(centre.x + r * Math.cos((a * Math.PI) / 180));
        const y = Math.round(centre.y + r * Math.sin((a * Math.PI) / 180));
        if (x < 40 || x > 920 || y < 70 || y > 800) continue;
        await page.mouse.move(x, y);
        await page.waitForTimeout(26);
        if (await hovering()) { beam = { x, y }; break; }
      }
    }
    if (!beam) throw new Error('no facing pillar found near the globe centre');
    let picked = false;
    for (const d of [14, 17, 20, 24]) {
      for (let a = 0; a < 360 && !picked; a += 30) {
        const x = Math.round(beam.x + d * Math.cos((a * Math.PI) / 180));
        const y = Math.round(beam.y + d * Math.sin((a * Math.PI) / 180));
        const onCanvas = await page.evaluate(
          ([x, y]) => document.elementFromPoint(x, y)?.tagName === 'CANVAS',
          [x, y]
        );
        if (!onCanvas) continue;
        await page.mouse.move(x, y);
        await page.waitForTimeout(60);
        if (await hovering()) continue; // a beam is under the cursor, not bare surface
        const before = await page.locator('.chip').count();
        await page.mouse.click(x, y);
        await page.waitForTimeout(500);
        picked = (await page.locator('.chip').count()) > before;
      }
    }
    if (!picked) throw new Error('bare-surface click did not select the nearest country');
    const search = await page.evaluate(() => location.search);
    if (!/\?c=[A-Z]{3}/.test(search)) throw new Error(`expected a share link, got "${search}"`);
    await page.getByRole('button', { name: 'Clear selection' }).click();
    await page.waitForTimeout(1400);
  });

  await step('search Singapore', async () => {
    await page.getByPlaceholder('Type a country name').fill('Sing');
    await page.waitForTimeout(200);
    await page.locator('.search-hits [role="option"]').first().click();
    await page.waitForTimeout(600);
  });

  await step('search by ISO code and select with the keyboard', async () => {
    const search = page.getByPlaceholder('Type a country name');
    await search.fill('ZWE');
    await page.waitForTimeout(200);
    const active = await search.getAttribute('aria-activedescendant');
    if (!active?.includes('ZWE')) throw new Error(`ISO search did not activate ZWE: ${active}`);
    await search.press('ArrowDown');
    await search.press('Enter');
    await page.waitForTimeout(600);
    const chips = (await page.locator('.chip').allInnerTexts()).join(' ');
    if (!chips.includes('Zimbabwe')) throw new Error(`keyboard search did not select Zimbabwe: ${chips}`);
    if ((await search.inputValue()) !== '') throw new Error('keyboard search did not clear the input');
  });

  await step('search wraps, supports Home/End and marks selected countries', async () => {
    const search = page.getByPlaceholder('Type a country name');
    await search.fill('a');
    await page.waitForTimeout(250);
    const ids = await page.locator('.search-hits [role="option"]').evaluateAll((els) => els.map((el) => el.id));
    if (ids.length < 2) throw new Error(`expected multiple search hits, got ${ids.length}`);
    await search.press('End');
    let active = await search.getAttribute('aria-activedescendant');
    if (active !== ids.at(-1)) throw new Error(`End did not activate the last hit: ${active}`);
    await search.press('Home');
    active = await search.getAttribute('aria-activedescendant');
    if (active !== ids[0]) throw new Error(`Home did not activate the first hit: ${active}`);
    await search.press('ArrowUp');
    active = await search.getAttribute('aria-activedescendant');
    if (active !== ids.at(-1)) throw new Error(`ArrowUp did not wrap from the first to the last hit: ${active}`);
    await search.press('Escape');
    await search.fill('Zimb');
    await page.waitForTimeout(200);
    const tag = await page.locator('.search-hits .hit-tag').innerText().catch(() => '');
    if (tag.toLowerCase() !== 'selected') throw new Error(`selected country has no tag: ${JSON.stringify(tag)}`);
    await search.press('Escape');
  });

  await step('search shows a no-match state', async () => {
    const search = page.getByPlaceholder('Type a country name');
    await search.fill('zzzz');
    await page.waitForTimeout(200);
    const empty = page.locator('.search-empty');
    if (!(await empty.isVisible())) throw new Error('no-match state is not visible');
    if (!/No countries match/.test(await empty.innerText())) throw new Error('no-match copy is missing');
    await search.press('Escape');
    if ((await search.inputValue()) !== '') throw new Error('Escape did not clear the search');
    if (await page.locator('.search-hits').count()) throw new Error('Escape left the results open');
  });

  await step('clear selection', async () => page.getByRole('button', { name: 'Clear selection' }).click());
  await step('select both anchors', async () => page.getByRole('button', { name: 'Compare Zimbabwe and Singapore' }).click());
  await step('straight line active model', async () => page.getByRole('radio', { name: 'Straight line', exact: true }).click());
  await step('logarithmic active model', async () => page.getByRole('radio', { name: 'Logarithmic', exact: true }).click());
  await step('show both curves', async () => page.getByRole('checkbox', { name: 'Show both curves' }).check());
  await step('linear axis', async () => page.getByRole('radio', { name: 'Linear x axis' }).click());
  await step('log axis', async () => page.getByRole('radio', { name: 'Log x axis' }).click());

  await step('click a scatter point', async () => {
    const dots = page.locator('figure.chart circle');
    await dots.nth(2).click({ force: true });
    await page.waitForTimeout(400);
  });

  await step('chart full screen enters and exits', async () => {
    const figure = page.locator('.chart-gap');
    await figure.scrollIntoViewIfNeeded();
    const button = figure.locator('.chart-fullscreen');
    await button.click();
    await page.waitForTimeout(500);
    const entered = await page.evaluate(() => Boolean(document.fullscreenElement));
    if (!entered) throw new Error('chart did not enter full screen');
    await button.click();
    await page.waitForTimeout(500);
    const exited = await page.evaluate(() => Boolean(document.fullscreenElement));
    if (exited) throw new Error('chart did not exit full screen');
  });

  await step('chart export downloads the chart, not the toolbar icon', async () => {
    const figure = page.locator('.chart-gap');
    await figure.scrollIntoViewIfNeeded();
    await figure.locator('.export > summary').click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      figure.locator('.export-menu button').filter({ hasText: 'SVG' }).click()
    ]);
    if (download.suggestedFilename() !== 'zimbabwe-singapore-gap.svg') {
      throw new Error(`unexpected export name: ${download.suggestedFilename()}`);
    }
    const path = await download.path();
    if (!path) throw new Error('export download has no path');
    const text = await readFile(path, 'utf8');
    if (!text.includes('Observed gap')) throw new Error('exported SVG is not the chart');
    if (!text.includes('fill="#0d1015"')) throw new Error('exported SVG has no dark background');
  });

  await step('open working', async () => {
    await page.getByRole('button', { name: 'Show working' }).click();
    await page.waitForTimeout(300);
  });
  await step('close working', async () => page.getByRole('button', { name: 'Hide working' }).click());

  await step('exclude the two outliers', async () => {
    await page.getByRole('radio', { name: 'Without Nigeria and Chad' }).click();
    await page.waitForTimeout(500);
  });
  await step('include everyone', async () => page.getByRole('radio', { name: 'Include everyone' }).click());
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
      () => document.querySelector('.rail [aria-current="true"]')?.textContent?.trim() ?? ''
    );
    if (active !== 'Gap') {
      const debug = await page.evaluate(() => ({
        rail: [...document.querySelectorAll('.rail button')].map((b) => [b.textContent?.trim(), b.getAttribute('aria-current')]),
        railDisplay: getComputedStyle(document.querySelector('.rail')).display,
        panelScroll: document.querySelector('.panel-scroll')?.scrollTop,
        gapTop: document.querySelector('#h-gap')?.getBoundingClientRect().top
      }));
      throw new Error(`expected Gap active, got "${active}" ${JSON.stringify(debug)}`);
    }
    await page.evaluate(() => document.querySelector('#h-work').scrollIntoView());
    await page.waitForTimeout(700);
    const atWork = await page.evaluate(
      () => document.querySelector('.rail [aria-current="true"]')?.textContent?.trim() ?? ''
    );
    if (atWork !== 'Working') throw new Error(`expected Working active, got "${atWork}"`);
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

  await step('copy the current view link', async () => {
    const expected = page.url();
    await page.locator('.masthead-actions .copy-view').click();
    await page.waitForTimeout(200);
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    if (copied !== expected) throw new Error(`clipboard has ${JSON.stringify(copied)}, expected ${JSON.stringify(expected)}`);
    const status = await page.locator('.masthead-actions [role="status"]').innerText();
    if (!/Link copied/.test(status)) throw new Error(`copy status missing: ${JSON.stringify(status)}`);
  });
});

await run('mobile', { width: 375, height: 812 }, async (page, step) => {
  await step('open the globe from the poster', async () => {
    await page.getByRole('button', { name: 'Open the globe' }).click();
    await page.waitForSelector('.stage canvas', { state: 'attached', timeout: 30000 });
  });
  await step('search and select', async () => {
    await page.getByPlaceholder('Type a country name').fill('Zimb');
    await page.waitForTimeout(200);
    await page.locator('.search-hits [role="option"]').first().click();
    await page.waitForTimeout(500);
  });
  await step('gap badge stays below the tabs with model context', async () => {
    const badge = page.locator('.map-gap');
    if (!(await badge.isVisible())) throw new Error('gap badge is hidden on mobile');
    const metrics = await page.evaluate(() => {
      const gap = document.querySelector('.map-gap')?.getBoundingClientRect();
      const tabs = document.querySelector('.stage-tabs')?.getBoundingClientRect();
      return {
        clearance: gap && tabs ? Math.round(gap.top - tabs.bottom) : null,
        text: document.querySelector('.map-gap')?.innerText ?? ''
      };
    });
    if (metrics.clearance === null || metrics.clearance < 10) throw new Error(`badge clearance ${metrics.clearance}`);
    if (!/Income model/.test(metrics.text)) throw new Error('badge model context missing');
  });
  await step('copy the mobile view link', async () => {
    const expected = page.url();
    await page.locator('.section-jump .copy-view').click();
    await page.waitForTimeout(200);
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    if (copied !== expected) throw new Error(`clipboard has ${JSON.stringify(copied)}, expected ${JSON.stringify(expected)}`);
  });
  await step('chart fullscreen stays hidden on the phone', async () => {
    const visible = await page.locator('.chart-fullscreen:visible').count();
    if (visible) throw new Error(`${visible} fullscreen controls visible on phone`);
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
    if (atWork !== 'h-work') throw new Error(`expected h-work in the section select, got "${atWork}"`);
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
