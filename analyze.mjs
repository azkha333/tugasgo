// Jalankan: npm i && npx playwright install chromium && npm run analyze
import { chromium } from 'playwright';
import fs from 'fs';
const URL = process.argv[2] || 'https://demo-tugasgo.rsby.cloud/';
const out = 'analysis'; fs.mkdirSync(out + '/js', { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, permissions: ['geolocation','camera'], geolocation: { latitude: -6.3, longitude: 107.15 } });
const page = await ctx.newPage();
const report = { url: URL, requests: [], consoleErrors: [], buttons: [], clicks: [] };
page.on('request', r => report.requests.push({ method: r.method(), url: r.url(), type: r.resourceType() }));
page.on('console', m => m.type() === 'error' && report.consoleErrors.push(m.text()));
page.on('pageerror', e => report.consoleErrors.push(String(e)));
page.on('response', async r => {
  if (r.request().resourceType() === 'script') {
    try { fs.writeFileSync(`${out}/js/${new URL(r.url()).pathname.split('/').pop() || 'inline.js'}`, await r.text()); } catch {}
  }
});
await page.goto(URL, { waitUntil: 'networkidle' });
await page.screenshot({ path: `${out}/00-home.png`, fullPage: true });
fs.writeFileSync(`${out}/rendered.html`, await page.content());
report.manifest = await page.evaluate(async () => { const l = document.querySelector('link[rel=manifest]'); return l ? (await fetch(l.href)).text() : null; });
report.serviceWorker = await page.evaluate(async () => (await navigator.serviceWorker?.getRegistrations())?.length || 0);
report.buttons = await page.$$eval('button, a, [role=button], input[type=submit], [onclick]', els => els.map((e, i) => ({ i, tag: e.tagName, text: (e.innerText || e.value || e.getAttribute('aria-label') || '').trim().slice(0, 60), href: e.getAttribute('href') })));
for (const b of report.buttons) {
  try {
    await page.goto(URL, { waitUntil: 'networkidle' });
    const el = (await page.$$('button, a, [role=button], input[type=submit], [onclick]'))[b.i];
    await el.click({ timeout: 3000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${out}/click-${b.i}-${(b.text || b.tag).replace(/\W+/g, '_')}.png` });
    report.clicks.push({ ...b, result: 'ok', nowAt: page.url() });
  } catch (e) { report.clicks.push({ ...b, result: 'ERROR: ' + e.message.split('\n')[0] }); }
}
fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
console.log(`Selesai. Buka folder ${out}/ (report.json, screenshot, js/).`);
await browser.close();
