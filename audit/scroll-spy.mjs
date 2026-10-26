import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chrome' });

for (const [width, height] of [[768, 1024], [1024, 768], [375, 812]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4200);

  const read = () =>
    page.evaluate(() => {
      const rect = (sel) => {
        const el = document.querySelector(sel);
        return el ? el.getBoundingClientRect().toJSON() : null;
      };
      const select = document.querySelector('#section-jump');
      return {
        innerHeight,
        stageVar: getComputedStyle(document.documentElement).getPropertyValue('--stage-h').trim(),
        stage: rect('.stage'),
        bar: rect('.section-jump'),
        app: rect('.app'),
        chapterModels: rect('[data-chapter-heading="models"]'),
        label: select?.selectedOptions?.[0]?.textContent ?? null,
        scrollY
      };
    });

  console.log(`--- ${width}x${height} initial ---`);
  console.log(JSON.stringify(await read(), null, 2));

  await page.evaluate(() => {
    document.querySelector('[data-chapter-heading="models"]')?.scrollIntoView({ block: 'start' });
  });
  await page.waitForTimeout(1200);
  console.log(`--- ${width}x${height} after scrollIntoView(models) ---`);
  console.log(JSON.stringify(await read(), null, 2));

  await page.close();
}

await browser.close();
