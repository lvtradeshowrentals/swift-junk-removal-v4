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
    ("    const quote = $('quote');\n    let heroIn = true, quoteIn = false;\n    const upd = () => dock.classList.toggle('show', !heroIn && !quoteIn);",
     "    const quote = $('quote');\n    let heroIn = true, quoteIn = false, endIn = false;\n    const upd = () => dock.classList.toggle('show', !heroIn && !quoteIn && !endIn);"),
    ("    new IntersectionObserver((es) => { quoteIn = es[0].isIntersecting; upd(); }, { threshold: .15 }).observe(quote);",
     "    new IntersectionObserver((es) => { quoteIn = es[0].isIntersecting; upd(); }, { threshold: .15 }).observe(quote);\n    /* the finale and footer already carry the same two buttons */\n    new IntersectionObserver((es) => { endIn = es[0].isIntersecting; upd(); }, { threshold: 0, rootMargin: '-30% 0px 0px 0px' }).observe($('finale'));"),
])
edit('css/phone.css', [
    ("  .hero-card { order: 3; width: 100%; max-width: none; min-width: 0; justify-self: auto; margin-top: 2px; }",
     "  .hero-card { order: 3; width: 100%; max-width: 620px; min-width: 0; justify-self: auto; align-self: center; margin-top: 2px; }\n  .zipbar { align-self: stretch; }"),
])
print('ok')
