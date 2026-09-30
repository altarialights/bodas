import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
await fs.mkdir('.impeccable/review', { recursive: true });
const browser = await chromium.launch({ headless: true });
const checks = [];
for (const [name, route, width, height] of [
  ['desktop', '/boda/elena-y-marcos', 1440, 1000],
  ['mobile', '/boda/elena-y-marcos', 390, 844],
  ['second-desktop', '/boda/ines-y-gabriel', 1440, 1000],
  ['rsvp-mobile', '/boda/elena-y-marcos/confirmar', 390, 844],
  ['management-desktop', '/gestion', 1440, 1000],
  ['memories-mobile', '/boda/elena-y-marcos/recuerdos', 390, 844],
]) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:4321' + route);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.loading-state').waitFor({ state: 'hidden' }).catch(() => {});
  await page.locator('[data-opening]').waitFor({ state: 'hidden' }).catch(() => {});
  await page.locator('img').evaluateAll(async images => { for (const image of images) { image.loading = 'eager'; await image.decode().catch(() => {}); } });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `.impeccable/review/${name}.png`, fullPage: true });
  if (['desktop', 'mobile', 'second-desktop'].includes(name)) await page.screenshot({ path: `.impeccable/review/${name}-hero.png` });
  if (name === 'mobile') { await page.locator('#programa').scrollIntoViewIfNeeded(); await page.screenshot({ path: '.impeccable/review/mobile-program.png' }); }
  checks.push({ name, route, width, metrics: await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth, images: [...document.images].map(img => ({ src: img.currentSrc, width: img.naturalWidth })), headings: [...document.querySelectorAll('h1,h2')].map(el => ({ text: el.textContent, width: Math.round(el.getBoundingClientRect().width) })) })) });
  await page.close();
}
await fs.writeFile('.impeccable/review/capture-report.json', JSON.stringify(checks, null, 2));
await browser.close();
console.log('Captured desktop/mobile invitation, second wedding, RSVP, management and memories.');
