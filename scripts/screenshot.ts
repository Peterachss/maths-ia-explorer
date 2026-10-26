// scripts/screenshot.ts
// Capture every chapter and both 3D views at the four required widths.
// Starts `vite preview` when no server is already running.
//
// Usage: npx vite-node scripts/screenshot.ts audit/after
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium, type Page } from 'playwright';

const out = process.argv[2] ?? 'audit/after';
const explicitUrl = process.env.URL;
const base = explicitUrl ?? 'http://127.0.0.1:4173/';
const sizes = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '375', width: 375, height: 812 }
] as const;
const chapters = ['data', 'models', 'use', 'reliability'] as const;

let server: ChildProcess | null = null;
let started = false;

async function reachable(url: string) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1200) });
    return res.ok;
  } catch {
    return false;
  }
}

async function ensureServer() {
  if (await reachable(base)) return;
  if (explicitUrl) throw new Error(`No server at ${base}`);
  server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173'], {
    stdio: 'ignore',
    detached: false
  });
  started = true;
  for (let i = 0; i < 40; i++) {
    if (await reachable(base)) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('vite preview did not start');
}

async function settle(page: Page, ms: number) {
  await page.waitForSelector('canvas, .stage-fallback', { timeout: 20_000 }).catch(() => undefined);
  await page.waitForTimeout(ms);
}

/** Phones keep the Blue Marble poster until the reader asks for WebGL. */
async function open3d(page: Page) {
  const poster = page.locator('.poster-open');
  if (await poster.count()) await poster.first().click().catch(() => undefined);
  await page.waitForSelector('.stage canvas', { state: 'attached', timeout: 30_000 }).catch(() => undefined);
}

async function scrollPanelTo(page: Page, selector: string) {
  await page.evaluate((sel) => {
    const el = document.querySelector<HTMLElement>(sel);
    const panel = document.querySelector<HTMLElement>('.panel-scroll');
    if (!el) return;
    if (panel && panel.scrollHeight > panel.clientHeight + 10) {
      panel.scrollTop = el.offsetTop - 76;
    } else {
      el.scrollIntoView({ block: 'start' });
    }
  }, selector);
  await page.waitForTimeout(650);
}

async function run() {
  await ensureServer();
  await mkdir(out, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  const consoleLog: { width: string; type: string; text: string }[] = [];

  for (const size of sizes) {
    const context = await browser.newContext({
      viewport: { width: size.width, height: size.height },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference'
    });
    const page = await context.newPage();
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') {
        const text = m.text();
        // Headless Chromium emits this driver-level ReadPixels warning during WebGL
        // capture. It is not an application warning; page errors are still recorded.
        if (text.includes('GL Driver Message') || text.includes('GPU stall due to ReadPixels')) return;
        consoleLog.push({ width: size.name, type: m.type(), text });
      }
    });
    page.on('pageerror', (e) => consoleLog.push({ width: size.name, type: 'pageerror', text: String(e) }));

    await page.goto(base, { waitUntil: 'networkidle' });
    await settle(page, 5200);

    await page.screenshot({ path: `${out}/${size.name}-landing.png` });

    // Globe view. Keep this canvas mounted for the chapter shots so the selected
    // labels are already present when the panel scrolls.
    await page.getByRole('tab', { name: /Globe/i }).click().catch(() => undefined);
    await open3d(page);
    await settle(page, 1200);
    await page.screenshot({ path: `${out}/${size.name}-globe.png` });

    // Chapter views.
    for (const chapter of chapters) {
      await scrollPanelTo(page, `[data-chapter-heading="${chapter}"]`);
      await page.screenshot({ path: `${out}/${size.name}-${chapter}.png` });
    }

    // Bowl view, with the Models chapter in the reading panel.
    await scrollPanelTo(page, '[data-chapter-heading="models"]');
    await page.getByRole('tab', { name: /least squares bowl/i }).click().catch(() => undefined);
    await open3d(page);
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${out}/${size.name}-bowl.png` });

    // Full page as a final reference (only the first two widths to keep the set manageable).
    if (size.name === '1440' || size.name === '375') {
      await page.evaluate(() => {
        document.querySelector<HTMLElement>('.panel-scroll')?.scrollTo({ top: 0 });
        window.scrollTo({ top: 0 });
      });
      await page.getByRole('tab', { name: /Globe/i }).click().catch(() => undefined);
      await page.waitForTimeout(1800);
      await page.screenshot({ path: `${out}/${size.name}-full.png`, fullPage: true });
    }

    await context.close();
    console.log(`captured ${size.name}`);
  }

  await browser.close();
  await writeFile(`${out}/console.json`, JSON.stringify(consoleLog, null, 2));
  if (started && server) server.kill('SIGTERM');
  if (consoleLog.length) {
    console.log(`${consoleLog.length} console issue(s); see ${out}/console.json`);
  } else {
    console.log('console clean');
  }
}

await run();
