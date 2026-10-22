// Walk the whole page at phone size, one screen per frame, so animations get a chance to fire.
//   node mwalk.cjs <name> [width] [height] [step]   -> _dev/shots/<name>_NN.png  (then montage.py)
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const name = process.argv[2] || 'walk';
const W = +(process.argv[3] || 390), H = +(process.argv[4] || 664), STEP = +(process.argv[5] || 560);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosmooth', { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('go'), { timeout: 15000 });
  await wait(3600);
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  let i = 0;
  for (let y = 0; y < total - H + STEP; y += STEP) {
    await p.evaluate((y) => scrollTo(0, y), y);
    await wait(i === 0 ? 100 : 1500);
    await p.screenshot({ path: path.join(__dirname, 'shots', `${name}_${String(i).padStart(2, '0')}.png`) });
    i++;
  }
  console.log('frames', i, 'height', total, 'overflow', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  await b.close();
})();
