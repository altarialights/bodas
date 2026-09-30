import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
const browser = await chromium.launch({ headless: true });
const results = [];
for (const width of [390, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    window.__measure = { lcp: 0, cls: 0 };
    new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__measure.lcp = entry.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__measure.cls += entry.value; }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto('http://127.0.0.1:4322/boda/elena-y-marcos');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('[data-personalize]').waitFor({ state: 'visible' });
  await page.waitForTimeout(1200);
  results.push(await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource');
    return { viewport: innerWidth, ...window.__measure, audioRequested: resources.some(r => r.name.includes('/audio/')), jsBytes: resources.filter(r => r.name.includes('.js')).reduce((n, r) => n + r.encodedBodySize, 0), imageBytes: resources.filter(r => r.initiatorType === 'img').reduce((n, r) => n + r.encodedBodySize, 0), fontBytes: resources.filter(r => /woff/.test(r.name)).reduce((n, r) => n + r.encodedBodySize, 0), resourceCount: resources.length };
  }));
  await page.close();
}
const files = await fs.readdir('dist/_astro');
const sizes = [];
for (const file of files.filter(f => /\.(js|css)$/.test(f))) { const content = await fs.readFile(`dist/_astro/${file}`); sizes.push({ file, bytes: content.length, gzipBytes: gzipSync(content).length }); }
const report = { conditions: 'Local production preview; Chromium headless; no throttling; reduced motion; a single cold page per viewport; not a field performance or Lighthouse score.', measurements: results, bundles: sizes };
await fs.mkdir('docs', { recursive: true }); await fs.writeFile('docs/performance.json', JSON.stringify(report, null, 2));
await browser.close(); console.log(JSON.stringify(report, null, 2));
