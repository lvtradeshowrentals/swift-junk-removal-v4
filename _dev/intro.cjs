// Frames of the hero entrance sequence. node intro.cjs [desktop|phone]
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const SIZES = { desktop: { width: 1512, height: 900 }, phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
const size = process.argv[2] || 'desktop';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport(SIZES[size]);
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosmooth', { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('go'), { timeout: 15000 });
  const t0 = Date.now();
  for (const t of [350, 800, 1400, 2000, 2600]) {
    const d = t - (Date.now() - t0); if (d > 0) await wait(d);
    await p.screenshot({ path: path.join(__dirname, 'shots', `intro_${size}_${t}.png`) });
    console.log('frame', t, 'actual', Date.now() - t0);
  }
  await b.close();
})();
