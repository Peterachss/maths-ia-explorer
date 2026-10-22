// scripts/audit.ts
// axe-core over every chapter, then Lighthouse desktop and mobile.
// Usage: npx vite-node scripts/audit.ts audit/after
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const out = process.argv[2] ?? 'audit/after';
const base = process.env.URL ?? 'http://127.0.0.1:4173/';
const widths = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '375', width: 375, height: 812 }
] as const;
const chapters = ['data', 'models', 'use', 'reliability'] as const;

await mkdir(out, { recursive: true });

async function axeSweep() {
  const browser = await chromium.launch();
  const results: Record<string, unknown> = {};
  for (const size of widths) {
    const context = await browser.newContext({ viewport: { width: size.width, height: size.height } });
    const page = await context.newPage();
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForTimeout(size.width < 800 ? 4500 : 2500);
    for (const chapter of chapters) {
      await page.evaluate((sel) => {
        const el = document.querySelector<HTMLElement>(sel);
        const panel = document.querySelector<HTMLElement>('.panel-scroll');
        if (!el) return;
        if (panel && panel.scrollHeight > panel.clientHeight + 10) panel.scrollTop = el.offsetTop - 64;
        else el.scrollIntoView({ block: 'start' });
      }, `[data-chapter="${chapter}"]`);
      await page.waitForTimeout(450);
      const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      results[`${size.name}-${chapter}`] = audit.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.length,
        targets: v.nodes.slice(0, 5).map((n) => n.target)
      }));
      console.log(`${size.name}-${chapter}: ${audit.violations.length} violations`);
    }
    await context.close();
  }
  await browser.close();
  await writeFile(`${out}/axe.json`, JSON.stringify(results, null, 2));
}

async function lighthouseRun(label: string, formFactor: 'desktop' | 'mobile') {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'] });
  try {
    const result = await lighthouse(base, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      formFactor,
      screenEmulation:
        formFactor === 'desktop'
          ? { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false }
          : { mobile: true, width: 375, height: 812, deviceScaleFactor: 1, disabled: false },
      throttling:
        formFactor === 'desktop'
          ? { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 }
          : { rttMs: 150, throughputKbps: 1638, cpuSlowdownMultiplier: 4 }
    });
    if (!result) throw new Error('Lighthouse returned no result');
    const lhr = result.lhr;
    const scores = Object.fromEntries(
      Object.entries(lhr.categories).map(([k, v]) => [k, Math.round((v.score ?? 0) * 100)])
    );
    await writeFile(`${out}/lighthouse-${label}.json`, JSON.stringify(lhr, null, 2));
    await writeFile(`${out}/lighthouse-summary.json`, JSON.stringify({ label, scores }, null, 2));
    console.log(`lighthouse ${label}:`, scores);
  } finally {
    await chrome.kill();
  }
}

if (process.env.LH_ONLY !== '1') await axeSweep();
if (process.env.AXE_ONLY !== '1') {
  await lighthouseRun('desktop', 'desktop');
  await lighthouseRun('mobile', 'mobile');
} else {
  console.log('AXE_ONLY=1, skipping Lighthouse');
}
