import io
ROOT = r'C:\Users\Cleo\Desktop\swift-junk-removal-v4'


def edit(rel, pairs):
    p = ROOT + '\\' + rel
    s = io.open(p, encoding='utf8').read()
    for a, b in pairs:
        assert a in s, (rel, a[:70])
        s = s.replace(a, b, 1)
    io.open(p, 'w', encoding='utf8', newline='').write(s)


edit('js/site.js', [
    # --- gauge: sits beside the slider on phones, demo plays once when first seen
    ("  /* wiring */\n  buildGauge(); setLoad(2, false);",
     """  /* wiring */
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
  }"""),
    # --- services pager (phone swipe deck)
    ("  /* ---------- how: each mock-up plays once when it arrives ---------- */",
     """  /* services swipe deck on phones: dots follow the card in view and can be tapped */
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

  /* ---------- how: each mock-up plays once when it arrives ---------- */"""),
    # --- nav + dock get out of the way while scrolling down on phones
    ("  /* ---------- mobile dock appears after the hero ---------- */",
     """  /* on phones the nav and dock slide away while you scroll down and come back when you scroll up or pause */
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

  /* ---------- mobile dock appears after the hero ---------- */"""),
])
print('patched js')
