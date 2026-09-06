import { chromium } from 'playwright';

export async function exploreSite(url, { headless = true, maxPages = 12 } = {}) {
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  const visited = new Set();
  const pages = [];
  const queue = [url];
  try {
    while (queue.length && pages.length < maxPages) {
      const next = queue.shift();
      if (visited.has(next)) continue;
      visited.add(next);
      try {
        await page.goto(next, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(500);
        const snapshot = await page.evaluate(() => ({
          url: location.href,
          title: document.title,
          text: document.body.innerText.slice(0, 12000),
          links: [...document.querySelectorAll('a[href]')].slice(0, 50).map(a => ({ text: a.innerText.trim(), href: a.href })),
          forms: [...document.querySelectorAll('form')].map(form => ({
            action: form.action,
            method: form.method,
            controls: [...form.querySelectorAll('input,textarea,select,button')].map(el => ({
              tag: el.tagName.toLowerCase(), type: el.type, name: el.name, id: el.id,
              placeholder: el.getAttribute('placeholder'), aria: el.getAttribute('aria-label'), text: el.innerText?.trim()
            }))
          }))
        }));
        pages.push(snapshot);
        for (const link of snapshot.links) {
          try {
            const target = new URL(link.href);
            const origin = new URL(url).origin;
            if (target.origin === origin && !visited.has(target.href)) queue.push(target.href);
          } catch {}
        }
      } catch (error) {
        pages.push({ url: next, error: error.message });
      }
    }
  } finally { await browser.close(); }
  return pages;
}
