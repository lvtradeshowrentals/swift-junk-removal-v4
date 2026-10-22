const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 1200, height: 630 });
  await p.goto('file:///' + path.join(__dirname, 'og.html').split(path.sep).join('/'), { waitUntil: 'load' });
  await p.evaluate(() => document.fonts.load('500 100px Archivo').then(() => document.fonts.ready));
  await new Promise((r) => setTimeout(r, 600));
  await p.screenshot({ path: path.join(__dirname, '..', 'img', 'og.jpg'), type: 'jpeg', quality: 88 });
  console.log('og written');
  await b.close();
})();
