// Phone hero check: the photo sequence must wait until the card is on screen. Also measures service image heights.
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage();
  await p.setViewport({ width: 390, height: 664, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosmooth', { waitUntil: 'load' });
  await p.waitForFunction(() => document.documentElement.classList.contains('go'), { timeout: 15000 });
  await wait(3500);
  console.log('card-go before scroll:', await p.$eval('#heroCard', (e) => e.classList.contains('card-go')));
  await p.screenshot({ path: path.join(__dirname, 'shots', 'mh_0_load.png') });
  await p.evaluate(() => scrollTo(0, 330));
  await wait(600);
  console.log('card-go after scroll:', await p.$eval('#heroCard', (e) => e.classList.contains('card-go')));
  await p.screenshot({ path: path.join(__dirname, 'shots', 'mh_1_start.png') });
  await wait(3600);
  await p.screenshot({ path: path.join(__dirname, 'shots', 'mh_2_done.png') });
  console.log('svc image heights:', JSON.stringify(await p.$$eval('.svc-m', (a) => a.map((e) => Math.round(e.getBoundingClientRect().height)))));
  await b.close();
})();
