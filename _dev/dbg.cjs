// node dbg.cjs <size> "<selector list, comma separated>"  -> prints bounding widths of matches
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const SIZES = { desktop: { width: 1512, height: 900 }, phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, tablet: { width: 820, height: 1100 } };
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new' });
  const p = await b.newPage();
  await p.setViewport(SIZES[process.argv[2] || 'phone']);
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosmooth', { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, 3500));
  const out = await p.evaluate((sels) => sels.split(',').map((s) => Array.from(document.querySelectorAll(s.trim())).slice(0, 6).map((e) => { const r = e.getBoundingClientRect(); return s.trim() + ' x=' + Math.round(r.left) + ' w=' + Math.round(r.width) + ' h=' + Math.round(r.height); }).join('\n')).join('\n'), process.argv[3]);
  console.log(out);
  await b.close();
})();
