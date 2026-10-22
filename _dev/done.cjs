const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 1512, height: 900 });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosmooth', { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, 2500));
  await p.evaluate(() => { document.querySelector('#formCard').classList.add('sent'); });
  const r = await p.evaluate(() => { const h = document.querySelector('.done h3'), s = getComputedStyle(h); const ok = getComputedStyle(document.querySelector('.done-ok svg')); return { color: s.color, op: s.opacity, fs: s.fontSize, tr: s.transform, okColor: ok.color, okW: ok.width, ancestors: [h.parentElement, h.parentElement.parentElement].map((e) => e.className + ':' + getComputedStyle(e).opacity) }; });
  console.log(JSON.stringify(r));
  await b.close();
})();
