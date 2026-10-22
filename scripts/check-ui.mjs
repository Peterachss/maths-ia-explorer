// Evidence for G1/G2/G4: target sizes, overflow, clean console, skip link,
// reduced motion and the no-WebGL fallback. Usage:
//   node scripts/check-ui.mjs audit/after/ui-checks.json
// Requires `npm run preview` (or URL=...).
import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const out = process.argv[2] ?? 'audit/after/ui-checks.json';
const base = process.env.URL ?? 'http://127.0.0.1:4173/';
const sizes = [
  [1440, 900],
  [1024, 768],
  [768, 1024],
  [375, 812]
];
const results = { base, widths: {}, keyboard: {}, reducedMotion: {}, webglOff: {} };
const failures = [];
const pass = (message) => console.log(`PASS  ${message}`);
const fail = (message) => {
  failures.push(message);
  console.log(`FAIL  ${message}`);
};

const browser = await chromium.launch();
for (const [width, height] of sizes) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4300);
  const state = await page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };
    // WCAG 2.5.8 inline exception: links and text buttons inside running prose.
    const inlineText = (el) => Boolean(el.closest('p, li, dt, dd, sup'));
    const controls = [...document.querySelectorAll('button, a, select, input, summary')]
      .filter(visible)
      .filter((el) => !(el instanceof HTMLInputElement && el.type === 'checkbox'));
    const small = [];
    for (const el of controls) {
      if (inlineText(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 44 || r.height < 44) {
        small.push({
          tag: el.tagName,
          text: (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40),
          width: Math.round(r.width),
          height: Math.round(r.height)
        });
      }
    }
    const checkboxTargets = [...document.querySelectorAll('input[type=checkbox]')].map((el) => {
      const label = el.closest('label');
      const r = label?.getBoundingClientRect();
      return r ? { width: Math.round(r.width), height: Math.round(r.height) } : null;
    });
    return {
      bodyWidth: document.body.scrollWidth,
      viewportWidth: document.documentElement.clientWidth,
      small,
      checkboxTargets,
      charts: document.querySelectorAll('.chart').length
    };
  });
  if (state.bodyWidth !== state.viewportWidth) fail(`${width}: horizontal overflow ${state.bodyWidth} > ${state.viewportWidth}`);
  else pass(`${width}: no horizontal overflow (${state.bodyWidth}px)`);
  if (errors.length) fail(`${width}: ${errors.length} page errors`);
  else pass(`${width}: no page errors`);
  if (state.small.length) fail(`${width}: ${state.small.length} non-inline controls under 44px: ${JSON.stringify(state.small.slice(0, 4))}`);
  else pass(`${width}: all non-inline targets are at least 44px`);
  const badLabels = state.checkboxTargets.filter((r) => !r || r.height < 44);
  if (badLabels.length) fail(`${width}: ${badLabels.length} checkbox labels under 44px`);
  else pass(`${width}: ${state.checkboxTargets.length} checkbox labels are at least 44px tall`);
  results.widths[`${width}x${height}`] = { ...state, errors: errors.length };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3600);
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    text: document.activeElement?.textContent?.trim()
  }));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => ({
    tag: document.activeElement?.tagName,
    id: document.activeElement?.id
  }));
  results.keyboard = { first, after };
  if (first.tag === 'A' && /Skip to the analysis/i.test(first.text ?? '') && after.id === 'main-content') {
    pass('keyboard: first Tab is the skip link and Enter moves focus to #main-content');
  } else {
    fail(`keyboard: unexpected focus ${JSON.stringify(results.keyboard)}`);
  }

  const splitter = page.locator('.panel-resizer');
  await splitter.focus();
  const splitBefore = await splitter.getAttribute('aria-valuenow');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(120);
  const splitAfter = await splitter.getAttribute('aria-valuenow');
  results.splitter = { before: splitBefore, after: splitAfter };
  if (Number(splitAfter) > Number(splitBefore)) pass(`splitter: ArrowLeft grew the panel ${splitBefore} → ${splitAfter}`);
  else fail(`splitter: ArrowLeft did not resize (${JSON.stringify(results.splitter)})`);

  const point = page.locator('.scatter-point').first();
  await point.focus();
  const pointBefore = await page.evaluate(() => ({
    iso: document.activeElement?.getAttribute('data-point'),
    label: document.activeElement?.getAttribute('aria-label')
  }));
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(120);
  const pointAfter = await page.evaluate(() => ({
    iso: document.activeElement?.getAttribute('data-point'),
    label: document.activeElement?.getAttribute('aria-label')
  }));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1300);
  const pressed = await page.evaluate(() => document.activeElement?.getAttribute('aria-pressed'));
  const preview = await page.evaluate(() => ({
    label: document.querySelector('.preview h3')?.textContent ?? '',
    top: Math.round(document.querySelector('.preview')?.getBoundingClientRect().top ?? -1)
  }));
  results.scatterKeyboard = { before: pointBefore.iso, after: pointAfter.iso, pressed, preview };
  if (pointBefore.iso && pointAfter.iso && pointBefore.iso !== pointAfter.iso && pressed === 'true') {
    pass(`scatter keyboard: ${pointBefore.iso} → ${pointAfter.iso}, Enter selected it`);
  } else {
    fail(`scatter keyboard: ${JSON.stringify(results.scatterKeyboard)}`);
  }
  if (preview.label === 'Chad' && preview.top >= 0) {
    pass(`selection reveal: preview shows ${preview.label} at y=${preview.top}`);
  } else {
    fail(`selection reveal: ${JSON.stringify(preview)}`);
  }
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3600);
  const state = await page.evaluate(() => ({
    media: matchMedia('(prefers-reduced-motion: reduce)').matches,
    animation: getComputedStyle(document.querySelector('.load-line') ?? document.body).animationDuration,
    scroll: getComputedStyle(document.documentElement).scrollBehavior
  }));
  results.reducedMotion = state;
  const seconds = Number.parseFloat(state.animation);
  if (state.media && Number.isFinite(seconds) && seconds <= 0.001 && state.scroll === 'auto') {
    pass(`reduced motion: media true, animation ${state.animation}, scroll ${state.scroll}`);
  } else {
    fail(`reduced motion: ${JSON.stringify(state)}`);
  }
  await context.close();
}
await browser.close();

{
  const noGl = await chromium.launch({ args: ['--disable-webgl', '--disable-gpu'] });
  const page = await noGl.newPage({ viewport: { width: 1024, height: 768 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2300);
  const state = await page.evaluate(() => ({
    canvases: document.querySelectorAll('canvas').length,
    fallback: document.querySelector('.stage-fallback')?.textContent?.trim() ?? '',
    charts: document.querySelectorAll('.chart').length
  }));
  results.webglOff = { ...state, errors: errors.length };
  if (state.canvases === 0 && /could not start 3D graphics/i.test(state.fallback) && state.charts >= 7 && errors.length === 0) {
    pass(`WebGL off: ${state.canvases} canvases, fallback shown, ${state.charts} charts, no page errors`);
  } else {
    fail(`WebGL off: ${JSON.stringify(results.webglOff)}`);
  }
  await page.screenshot({ path: 'audit/after/1024-webgl-off.png' });
  await noGl.close();
}

results.failures = failures;
await writeFile(out, JSON.stringify(results, null, 2));
if (failures.length) {
  console.log(`\n${failures.length} check(s) failed; see ${out}`);
  process.exitCode = 1;
} else {
  console.log(`\nAll UI checks pass; evidence written to ${out}`);
}
