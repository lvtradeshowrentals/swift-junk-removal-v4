/* ============================================================================
   Swift Junk Removal v4. Small on purpose: smooth scroll, one hero sequence,
   the services photo that follows the list, the three "how" mock-ups, the load
   gauge + three-step quote form, the FAQ, and the mobile dock.
   ========================================================================== */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const qs = (s, r) => (r || document).querySelector(s);
  const qsa = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params = new URLSearchParams(location.search);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && !params.has('nosmooth') && window.Lenis) {
    lenis = new Lenis({ lerp: .11, wheelMultiplier: .95, smoothWheel: true });
    const tick = (t) => { lenis.raf(t); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }
  const scrollTo = (target, off) => {
    const el = typeof target === 'string' ? qs(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: off || 0, duration: 1.5, easing: (x) => 1 - Math.pow(1 - x, 4) });
    else window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + (off || 0), behavior: reduce ? 'auto' : 'smooth' });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = qs(id);
    if (!el) return;
    e.preventDefault();
    closeMenu();
    if (id === '#top') scrollTo(0); else scrollTo(el, el.tagName === 'SECTION' ? (parseFloat(getComputedStyle(el).paddingTop) || 0) - 120 : 0);
    history.replaceState(null, '', id);
  });

  /* ---------- menu (small screens) ---------- */
  const burger = $('burger'), sheet = $('sheet');
  function closeMenu() {
    if (!burger || burger.getAttribute('aria-expanded') !== 'true') return;
    burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Open menu');
    sheet.classList.remove('open'); setTimeout(() => { sheet.hidden = true; }, 300);
    if (lenis) lenis.start();
    if (window.SWIFT4) window.SWIFT4.navTone();
  }
  if (burger) burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    if (open) { closeMenu(); return; }
    sheet.hidden = false; void sheet.offsetWidth; sheet.classList.add('open');
    burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Close menu');
    $('nav').classList.add('dark');
    if (lenis) lenis.stop();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- ZIP lookup (used by the hero and the form) ---------- */
  const HENDERSON = ['89002', '89011', '89012', '89014', '89015', '89044', '89052', '89053', '89074'];
  const NORTH_LV = ['89030', '89031', '89032', '89081', '89084', '89085', '89086', '89087'];
  function zone(raw) {
    const zip = String(raw || '').trim().slice(0, 5);
    if (!/^\d{5}$/.test(zip)) return null;
    if (HENDERSON.indexOf(zip) > -1) return { zip, city: 'Henderson', level: 'ok' };
    if (NORTH_LV.indexOf(zip) > -1) return { zip, city: 'North Las Vegas', level: 'near' };
    const n = +zip;
    if (n >= 89101 && n <= 89199) return { zip, city: 'Las Vegas', level: 'ok' };
    return { zip, city: '', level: 'out' };
  }
  function zoneText(z) {
    if (!z) return ['', ''];
    if (z.level === 'ok') return ['Yes, we cover ' + z.city + '.', 'ok'];
    if (z.level === 'near') return [z.city + ' is just outside our usual area. Send it and we will confirm.', 'warn'];
    return ["That's outside our usual area. Send it anyway and we'll tell you.", 'warn'];
  }

  /* ---------- hero: one sequence once the font is ready ---------- */
  const root = document.documentElement;
  let started = false;
  /* the photo sequence (reveal, scan, pins) waits until the card is mostly on screen, so a phone visitor sees all of it */
  const heroCard = $('heroCard');
  let cardSeen = !('IntersectionObserver' in window);
  const tryCard = () => { if (started && cardSeen) heroCard.classList.add('card-go'); };
  if (!cardSeen) {
    const ioc = new IntersectionObserver((es) => { if (es[0].isIntersecting) { cardSeen = true; tryCard(); ioc.disconnect(); } }, { threshold: .6 });
    ioc.observe(heroCard);
  }
  const go = () => { if (started) return; started = true; root.classList.add('go'); tryCard(); };
  if (document.fonts && document.fonts.load) {
    Promise.race([
      Promise.all([document.fonts.load('500 100px Archivo'), document.fonts.load('400 16px Archivo')]),
      new Promise((r) => setTimeout(r, 1800)),
    ]).then(go);
  } else go();
  setTimeout(go, 2200);

  /* hero ZIP bar: live coverage note, then hand the ZIP to the quote form */
  const heroZip = $('heroZip'), heroNote = $('heroNote'), zipbar = $('zipbar');
  const noteDefault = heroNote ? heroNote.innerHTML : '';
  if (heroZip) {
    heroZip.addEventListener('input', () => {
      heroZip.value = heroZip.value.replace(/\D/g, '');
      const z = zone(heroZip.value), t = zoneText(z);
      if (!z) { heroNote.className = 'zipnote'; heroNote.innerHTML = noteDefault; return; }
      heroNote.className = 'zipnote ' + t[1]; heroNote.textContent = t[0];
    });
    zipbar.addEventListener('submit', (e) => {
      e.preventDefault();
      const fz = $('f-zip');
      if (heroZip.value) { fz.value = heroZip.value; fz.dispatchEvent(new Event('input')); }
      scrollTo('#quote', (parseFloat(getComputedStyle($('quote')).paddingTop) || 0) - 120);
    });
  }

  /* ---------- services: the photo follows the row in the middle of the screen ---------- */
  const rows = qsa('.svc-row'), imgs = qsa('#svcFrame img'), dots = qsa('#svcDots li');
  let zTop = 2, activeRow = 0;
  function setRow(i) {
    if (i === activeRow) return;
    activeRow = i;
    rows.forEach((r, k) => r.classList.toggle('on', k === i));
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
    imgs.forEach((m, k) => {
      if (k === i) { m.style.zIndex = ++zTop; void m.offsetWidth; m.classList.add('on'); }
      else if (m.classList.contains('on')) { m.classList.remove('on'); }
    });
  }
  if (rows.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) setRow(+en.target.dataset.i); }), { rootMargin: '-42% 0px -42% 0px' });
    rows.forEach((r) => io.observe(r));
  }

  /* services swipe deck on phones: dots follow the card in view and can be tapped */
  const svcList = $('svcList'), pager = $('svcPager');
  if (svcList && pager) {
    const pLis = qsa('li', pager);
    const cardW = () => rows[0].getBoundingClientRect().width + 12;
    let pt = false;
    svcList.addEventListener('scroll', () => {
      if (pt) return; pt = true;
      requestAnimationFrame(() => { pt = false; const i = Math.min(rows.length - 1, Math.max(0, Math.round(svcList.scrollLeft / cardW()))); pLis.forEach((l, k) => l.classList.toggle('on', k === i)); });
    }, { passive: true });
    pLis.forEach((l, i) => qs('button', l).addEventListener('click', () => svcList.scrollTo({ left: i * cardW(), behavior: reduce ? 'auto' : 'smooth' })));
  }

  /* ---------- how: each mock-up plays once when it arrives ---------- */
  const steps = qsa('.step');
  function playStep(s) {
    if (s.classList.contains('play')) return;
    s.classList.add('play');
    if (s.querySelector('.mock-price')) setTimeout(() => qs('.pr-ok', s).classList.add('press'), 1500);
    if (s.querySelector('.mock-crew')) qsa('.mock-crew li', s).forEach((li, i) => setTimeout(() => li.classList.add('on'), 500 + i * 650));
  }
  if ('IntersectionObserver' in window && !reduce) {
    const io2 = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { playStep(en.target); io2.unobserve(en.target); } }), { threshold: .45 });
    steps.forEach((s) => io2.observe(s));
  } else steps.forEach(playStep);

  /* ---------- FAQ ---------- */
  qsa('.qa button').forEach((b) => b.addEventListener('click', () => {
    const li = b.closest('.qa'), open = li.classList.contains('on');
    qsa('.qa.on').forEach((o) => { if (o !== li) { o.classList.remove('on'); qs('button', o).setAttribute('aria-expanded', 'false'); } });
    li.classList.toggle('on', !open); b.setAttribute('aria-expanded', String(!open));
  }));

  /* ---------- finale headline opens when it arrives ---------- */
  const fin = $('finale');
  if (fin && 'IntersectionObserver' in window && !reduce) {
    const io3 = new IntersectionObserver((es) => { if (es[0].isIntersecting) { fin.classList.add('in'); io3.disconnect(); } }, { threshold: .35 });
    io3.observe(fin);
  } else if (fin) fin.classList.add('in');

  /* ---------- the statement lights up word by word as it crosses the screen ---------- */
  const sayP = $('sayP');
  let words = [];
  if (sayP) {
    sayP.innerHTML = sayP.textContent.trim().split(/\s+/).map((w) => '<span class="w">' + w + '</span>').join(' ');
    words = qsa('.w', sayP);
  }
  function sayTick() {
    if (!words.length || reduce) return;
    const r = sayP.getBoundingClientRect(), vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh * .86 - r.top) / (vh * .5 + r.height)));
    const n = words.length;
    words.forEach((w, i) => { const o = Math.min(1, Math.max(0, p * (n + 3) - i)); w.style.opacity = (.16 + .84 * o).toFixed(3); });
  }

  /* ---------- nav goes dark over the dark sections ---------- */
  const nav = $('nav'), darks = qsa('.how, .fin, .foot');
  let navTick = false;
  function navTone() {
    navTick = false;
    sayTick();
    const y = 40;
    const d = darks.some((s) => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
    nav.classList.toggle('dark', d);
  }
  addEventListener('scroll', () => { if (!navTick) { navTick = true; requestAnimationFrame(navTone); } }, { passive: true });
  navTone();

  /* on phones the nav and dock slide away while you scroll down and come back when you scroll up or pause */
  const dockEl = $('dock');
  let lastY = scrollY, quietT = 0;
  addEventListener('scroll', () => {
    const y = scrollY, dy = y - lastY;
    if (Math.abs(dy) < 6) return;
    lastY = y;
    if (innerWidth > 959) { nav.classList.remove('hide'); return; }
    const down = dy > 0 && y > 140, menuOpen = burger && burger.getAttribute('aria-expanded') === 'true';
    nav.classList.toggle('hide', down && !menuOpen);
    if (dockEl) dockEl.classList.toggle('quiet', down);
    clearTimeout(quietT);
    if (down && dockEl) quietT = setTimeout(() => dockEl.classList.remove('quiet'), 700);
  }, { passive: true });

  /* ---------- mobile dock appears after the hero ---------- */
  const dock = $('dock'), hero = $('top');
  if (dock && 'IntersectionObserver' in window) {
    const quote = $('quote');
    let heroIn = true, quoteIn = false, endIn = false;
    const upd = () => dock.classList.toggle('show', !heroIn && !quoteIn && !endIn);
    new IntersectionObserver((es) => { heroIn = es[0].isIntersecting; upd(); }, { threshold: 0, rootMargin: '-40% 0px 0px 0px' }).observe(hero);
    new IntersectionObserver((es) => { quoteIn = es[0].isIntersecting; upd(); }, { threshold: .15 }).observe(quote);
    /* the finale and footer already carry the same two buttons */
    new IntersectionObserver((es) => { endIn = es[0].isIntersecting; upd(); }, { threshold: 0, rootMargin: '-30% 0px 0px 0px' }).observe($('finale'));
  }

  /* ==========================================================================
     QUOTE: the load gauge (a truck bed made of blocks) and the three-step form
     ========================================================================== */
  const NS = 'http://www.w3.org/2000/svg';
  const L = 6, W = 3, H = 3, S = 40; // bed is 6 long, 3 wide, 3 high (cubes)
  const X = S * .866, Y = S * .5;
  const STOPS = [
    { n: 'A few items', c: 6, sub: 'A couch, a chair or a few boxes. Quick and light.' },
    { n: 'A quarter load', c: 14, sub: 'A small room clear-out, or a handful of big pieces.' },
    { n: 'About half a load', c: 27, sub: 'A garage of boxes and a couple of mattresses.' },
    { n: 'Three-quarters of a load', c: 40, sub: 'Most of a room, a patio set and the extras.' },
    { n: 'A full load', c: 54, sub: 'A big garage, or a small home cleared out.' },
    { n: 'More than one load', c: 54, sub: "Bigger than a truck bed. We'll plan the trips or a larger truck." },
  ];
  const SERVICES = { garage: 'Home, garage or estate', furniture: 'Furniture and appliances', construction: 'Construction debris', commercial: 'Office or property', yard: 'Yard or outdoor', general: 'Not sure yet' };
  const NEXT = ['Next: where and when', 'Next: your details', 'Send my request'];
  const FINE = ['Takes about a minute. Nothing is sent until the last step.', 'We use the ZIP to pick the nearest crew.', "We'll only use your number to text or call about this job."];

  const form = $('quoteForm'), card = $('formCard');
  if (!form) return;
  const St = { step: 1, sel: new Set(), files: [], no: '', loadSet: false };
  let cubes = [];

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  /* isometric projection: x runs right-down, y runs left-down, z runs up */
  const proj = (i, j, k, ox, oy) => [ox + (i - j) * X, oy + (i + j) * Y - k * S];
  function buildGauge() {
    const svg = $('gaugeSvg');
    const ox = 260 - (L - W) * X / 2, oy = (400 - (H * S + (L + W) * Y)) / 2 + H * S;
    const gh = el('g', { class: 'gh' }, svg), gc = el('g', { class: 'gc' }, svg);
    const pts = (a) => a.map((p) => p.join(',')).join(' ');
    // ghost grid: every cell of the bed drawn as hairlines
    for (let k = 0; k < H; k++) for (let i = 0; i < L; i++) for (let j = 0; j < W; j++) {
      const P = (a, b, c) => proj(i + a, j + b, k + c, ox, oy);
      el('polygon', { points: pts([P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)]) }, gh);
      if (i === L - 1) el('polygon', { points: pts([P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)]) }, gh);
      if (j === W - 1) el('polygon', { points: pts([P(0, 1, 0), P(1, 1, 0), P(1, 1, 1), P(0, 1, 1)]) }, gh);
    }
    // fill order: bottom layer first, back (low i) to front, so it reads as loading a bed
    const order = [];
    for (let k = 0; k < H; k++) for (let i = 0; i < L; i++) for (let j = 0; j < W; j++) order.push({ i, j, k });
    const byDraw = order.map((c, n) => Object.assign({ n }, c)).sort((a, b) => (a.i + a.j) - (b.i + b.j) || a.k - b.k);
    cubes = new Array(order.length);
    byDraw.forEach((c) => {
      const { i, j, k, n } = c, P = (a, b, cc) => proj(i + a, j + b, k + cc, ox, oy);
      const g = el('g', { class: 'cb' }, gc);
      el('polygon', { class: 't', points: pts([P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)]) }, g);
      el('polygon', { class: 'l', points: pts([P(0, 1, 0), P(1, 1, 0), P(1, 1, 1), P(0, 1, 1)]) }, g);
      el('polygon', { class: 'r', points: pts([P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)]) }, g);
      g.dataset.k = k;
      cubes[n] = g;
    });
  }
  function setLoad(idx, touched) {
    const s = STOPS[idx], count = s.c;
    cubes.forEach((g, n) => {
      const on = n < count;
      g.style.setProperty('--dl', (on ? Math.min(n * 0.012, .5) : 0) + 's');
      g.classList.toggle('f', on);
    });
    // the top occupied layer is copper: it shows the fill level at a glance
    const topK = count ? Math.floor((count - 1) / (L * W)) : -1;
    cubes.forEach((g, n) => g.classList.toggle('top', n < count && +g.dataset.k === topK && topK >= 0));
    const range = $('f-load'), p = (idx / 5) * 100;
    range.style.setProperty('--p', p + '%');
    if (touched) { St.loadSet = true; range.classList.remove('untouched'); }
    $('sizeOut').textContent = St.loadSet ? s.n : 'Not set';
    $('gVal').textContent = St.loadSet ? s.n : 'Slide to size your load';
    $('gSub').textContent = St.loadSet ? s.sub : 'A rough guess is fine. We confirm the price before we lift.';
    range.setAttribute('aria-valuetext', s.n);
  }

  function orderNo() {
    const d = new Date(), p = (n) => String(n).padStart(2, '0');
    return 'SW-' + p(d.getMonth() + 1) + p(d.getDate()) + '-' + String(Math.floor(1000 + Math.random() * 9000));
  }
  const panes = qsa('.pane', form), stepLis = qsa('#fSteps li');
  const nextBtn = $('fNext'), backBtn = $('fBack'), fine = $('fFine');

  function setStep(n, dir) {
    dir = dir || (n > St.step ? 1 : -1);
    const from = panes[St.step - 1], to = panes[n - 1];
    if (from !== to) {
      to.style.transition = 'none'; to.classList.toggle('back', dir < 0); void to.offsetWidth; to.style.transition = '';
      from.classList.toggle('back', dir > 0);
      from.classList.remove('on'); from.inert = true;
      to.classList.add('on'); to.inert = false;
    }
    St.step = n;
    stepLis.forEach((li, i) => {
      li.classList.toggle('on', i === n - 1); li.classList.toggle('done', i < n - 1);
      const b = qs('button', li); b.disabled = i >= n;
      if (i === n - 1) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    backBtn.hidden = n === 1;
    $('fNextTx').textContent = NEXT[n - 1];
    fine.textContent = FINE[n - 1];
    const h = qs('h3', to); if (h && from !== to) h.focus({ preventScroll: true });
    if (from !== to && card.getBoundingClientRect().top < 80) scrollTo(card, -90);
  }
  const err = (field, errId, msg) => {
    const f = typeof field === 'string' ? $(field) : field, e = $(errId);
    if (f) { if (msg) f.setAttribute('aria-invalid', 'true'); else f.removeAttribute('aria-invalid'); }
    e.textContent = msg || '';
    return !msg;
  };
  function validate(n) {
    if (n === 1) return err(null, 'e-service', St.sel.size ? '' : 'Pick at least one, or choose Not sure yet.');
    if (n === 2) {
      const v = $('f-zip').value.trim();
      return err('f-zip', 'e-zip', !v ? 'Enter your ZIP so we know where to send the crew.' : /^\d{5}(-\d{4})?$/.test(v) ? '' : 'Use a 5-digit ZIP code, like 89101.');
    }
    const name = $('f-name').value.trim(), phone = $('f-phone').value.replace(/\D/g, '');
    const a = err('f-name', 'e-name', name ? '' : 'Enter your name so we know who to ask for.');
    const b = err('f-phone', 'e-phone', phone.length >= 10 ? '' : 'Enter a number with area code so we can text you.');
    return a && b;
  }
  function advance() {
    if (!validate(St.step)) { const bad = qs('[aria-invalid="true"]', panes[St.step - 1]); if (bad) bad.focus(); else qs('.tile input', panes[0]).focus(); return; }
    if (St.step < 3) setStep(St.step + 1, 1); else send();
  }

  /* photos */
  function renderThumbs() {
    const ul = $('thumbs'); ul.innerHTML = '';
    St.files.forEach((f, i) => {
      const li = document.createElement('li'), img = document.createElement('img'), b = document.createElement('button');
      img.alt = ''; img.src = f._url; b.type = 'button'; b.textContent = '×'; b.setAttribute('aria-label', 'Remove photo ' + (i + 1));
      b.addEventListener('click', () => { URL.revokeObjectURL(f._url); St.files.splice(i, 1); syncFiles(); renderThumbs(); });
      li.appendChild(img); li.appendChild(b); ul.appendChild(li);
    });
    $('dropLabel').innerHTML = St.files.length ? '<b>' + St.files.length + (St.files.length === 1 ? ' photo' : ' photos') + ' added</b>. Add more' : '<b>Add photos</b> or drop them here';
  }
  function syncFiles() { try { const dt = new DataTransfer(); St.files.forEach((f) => dt.items.add(f)); $('f-photos').files = dt.files; } catch (e) { /* older browsers keep the picker's own list */ } }
  function addFiles(list) {
    Array.from(list || []).forEach((f) => {
      if (!/^image\//.test(f.type) || f.size > 15 * 1024 * 1024 || St.files.length >= 6) return;
      f._url = URL.createObjectURL(f); St.files.push(f);
    });
    syncFiles(); renderThumbs();
  }

  /* send: counts as sent only when the inbox service says so */
  function send() {
    const endpoint = form.getAttribute('data-endpoint'), fail = $('sendFail'), btn = nextBtn;
    const done = () => {
      fail.hidden = true; $('doneNo').textContent = St.no;
      card.classList.add('sent');
      $('success').focus({ preventScroll: true });
      if (card.getBoundingClientRect().top < 80) scrollTo(card, -90);
    };
    const failed = () => { btn.disabled = false; fail.hidden = false; fail.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
    const fd = new FormData(form);
    fd.delete('service');
    fd.append('reference', St.no);
    fd.append('_subject', 'New quote request ' + St.no + ' (Swift Junk Removal)');
    fd.append('_template', 'table'); fd.append('_captcha', 'false');
    fd.append('services', Array.from(St.sel).map((k) => SERVICES[k]).join(', '));
    fd.append('load_size', St.loadSet ? STOPS[+$('f-load').value].n : 'Not set');
    btn.disabled = true;
    fetch(endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
      .then((r) => r.json().catch(() => ({})).then((j) => { if (r.ok && j.success !== 'false' && j.success !== false) { btn.disabled = false; done(); } else failed(); }))
      .catch(failed);
  }
  function reset() {
    form.reset(); St.sel.clear(); St.files.forEach((f) => URL.revokeObjectURL(f._url)); St.files = []; renderThumbs();
    qsa('[aria-invalid]', form).forEach((e) => e.removeAttribute('aria-invalid'));
    qsa('.err', form).forEach((e) => { e.textContent = ''; });
    $('zipNote').textContent = ''; $('zipNote').className = 'zip-note';
    St.no = orderNo(); St.loadSet = false; $('f-load').classList.add('untouched'); $('f-load').value = 2; setLoad(2, false);
    $('sendFail').hidden = true;
    card.classList.remove('sent');
    panes.forEach((p, i) => { p.classList.toggle('on', i === 0); p.classList.remove('back'); p.inert = i !== 0; });
    St.step = 1; setStep(1, -1);
  }

  /* wiring */
  buildGauge(); setLoad(2, false);
  const gaugeEl = $('gauge'), qGrid = qs('.q-grid'), sizeBlock = qs('.size', form), phoneMq = matchMedia('(max-width: 959px)');
  /* on a phone the gauge moves next to the slider, so you watch it react to your thumb */
  const placeGauge = () => { if (phoneMq.matches) sizeBlock.insertBefore(gaugeEl, $('f-load')); else qGrid.insertBefore(gaugeEl, qGrid.firstChild); };
  placeGauge();
  (phoneMq.addEventListener ? phoneMq.addEventListener('change', placeGauge) : phoneMq.addListener(placeGauge));
  /* one short demo of the gauge the first time it is on screen, so it reads as interactive */
  if ('IntersectionObserver' in window && !reduce) {
    const iog = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return;
      iog.disconnect();
      [0, 1, 3, 4, 2].forEach((idx, n) => setTimeout(() => { if (!St.loadSet) setLoad(idx, false); }, 500 + n * 620));
    }, { threshold: .7 });
    iog.observe(gaugeEl);
  }
  St.no = orderNo();
  const rng = $('f-load');
  rng.addEventListener('input', () => setLoad(+rng.value, true));
  qsa('.range-ticks span').forEach((s, i) => s.addEventListener('click', () => { rng.value = i; setLoad(i, true); }));

  qsa('input[name="service"]', form).forEach((inp) => inp.addEventListener('change', () => {
    if (inp.checked && inp.value === 'general') { St.sel.clear(); qsa('input[name="service"]', form).forEach((o) => { if (o !== inp) o.checked = false; }); }
    else if (inp.checked) { St.sel.delete('general'); const g = qs('input[value="general"]', form); if (g) g.checked = false; }
    if (inp.checked) St.sel.add(inp.value); else St.sel.delete(inp.value);
    err(null, 'e-service', '');
  }));
  const fz = $('f-zip');
  fz.addEventListener('input', () => {
    const z = zone(fz.value), t = zoneText(z), n = $('zipNote');
    n.className = 'zip-note' + (t[1] ? ' ' + t[1] : ''); n.textContent = t[0];
    if (fz.getAttribute('aria-invalid')) validate(2);
  });
  ['f-name', 'f-phone'].forEach((id) => $(id).addEventListener('input', () => { if ($(id).getAttribute('aria-invalid')) validate(3); }));
  nextBtn.addEventListener('click', advance);
  backBtn.addEventListener('click', () => setStep(St.step - 1, -1));
  stepLis.forEach((li, i) => qs('button', li).addEventListener('click', () => { if (i + 1 < St.step) setStep(i + 1, -1); }));
  form.addEventListener('submit', (e) => { e.preventDefault(); advance(); });
  form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'checkbox' && e.target.type !== 'radio' && e.target.tagName !== 'BUTTON') { e.preventDefault(); advance(); } });
  const drop = $('drop');
  $('f-photos').addEventListener('change', (e) => { const picked = Array.from(e.target.files); St.files.forEach((f) => URL.revokeObjectURL(f._url)); St.files = []; addFiles(picked); });
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => addFiles(e.dataTransfer && e.dataTransfer.files));
  $('fAgain').addEventListener('click', reset);

  /* "Get a price" links elsewhere choose their service first */
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[data-service]');
    if (!a) return;
    const k = a.getAttribute('data-service');
    if (card.classList.contains('sent')) reset();
    if (k && k !== 'general') {
      const inp = qs('input[name="service"][value="' + k + '"]', form);
      if (inp && !inp.checked) { inp.checked = true; inp.dispatchEvent(new Event('change')); }
    }
    if (St.step !== 1) setStep(1, -1);
  });

  window.SWIFT4 = { scrollTo, setLoad, go, navTone };
})();
