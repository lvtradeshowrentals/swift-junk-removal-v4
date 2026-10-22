// End-to-end check of the quote flow with FormSubmit mocked. node flow.cjs [desktop|phone]
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const size = process.argv[2] || 'desktop';
const SIZES = { desktop: { width: 1512, height: 900 }, phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
const OUT = path.join(__dirname, 'shots');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage();
  await p.setViewport(SIZES[size]);
  let posted = null;
  await p.setRequestInterception(true);
  p.on('request', (r) => {
    if (/formsubmit\.co/.test(r.url())) { posted = { url: r.url(), method: r.method(), body: (r.postData() || '').slice(0, 1500) }; r.respond({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"success":"true"}' }); }
    else r.continue();
  });
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosmooth', { waitUntil: 'load' });
  await wait(3800);
  const shot = async (n) => { await wait(900); await p.screenshot({ path: path.join(OUT, `flow_${size}_${n}.png`) }); console.log('shot', n); };
  // hero zip -> quote
  await p.type('#heroZip', '89052');
  console.log('hero note:', await p.$eval('#heroNote', (e) => e.textContent));
  await p.click('#zipbar button');
  await wait(1800);
  console.log('quote zip prefilled:', await p.$eval('#f-zip', (e) => e.value));
  // step 1: try empty next -> error
  await p.click('#fNext'); await wait(300);
  console.log('step1 error:', await p.$eval('#e-service', (e) => e.textContent));
  await p.evaluate(() => { document.querySelectorAll('.tile input')[1].click(); document.querySelectorAll('.tile input')[0].click(); });
  await p.$eval('#f-load', (e) => { e.value = 3; e.dispatchEvent(new Event('input', { bubbles: true })); });
  await p.evaluate(() => document.querySelector('#quote').scrollIntoView());
  await p.evaluate(() => scrollBy(0, 380));
  await shot('1_step1');
  await p.evaluate(() => document.querySelector('#fNext').click()); await wait(700);
  console.log('step now:', await p.$eval('#fSteps li.on button', (e) => e.dataset.s), 'zip note:', await p.$eval('#zipNote', (e) => e.textContent));
  await shot('2_step2');
  await p.evaluate(() => document.querySelector('#fNext').click()); await wait(700);
  await p.evaluate(() => document.querySelector('#fNext').click()); await wait(300);
  console.log('step3 errors:', await p.$eval('#e-name', (e) => e.textContent), '|', await p.$eval('#e-phone', (e) => e.textContent));
  await p.evaluate(() => { const n = document.querySelector('#f-name'), t = document.querySelector('#f-phone'); n.value = 'Test Person'; t.value = '7025550123'; });
  await shot('3_step3');
  await p.evaluate(() => document.querySelector('#fNext').click()); await wait(1200);
  console.log('sent class:', await p.$eval('#formCard', (e) => e.classList.contains('sent')), 'ref:', await p.$eval('#doneNo', (e) => e.textContent));
  console.log('posted:', posted && posted.method, posted && posted.url);
  await shot('4_done');
  await b.close();
})();
