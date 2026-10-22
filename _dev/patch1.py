import io
ROOT = r'C:\Users\Cleo\Desktop\swift-junk-removal-v4'


def edit(rel, pairs):
    p = ROOT + '\\' + rel
    s = io.open(p, encoding='utf8').read()
    for a, b in pairs:
        assert a in s, (rel, a[:70])
        s = s.replace(a, b, 1)
    io.open(p, 'w', encoding='utf8', newline='').write(s)


edit('css/site.css', [
    ("@media (max-width: 959px) { .hero-chip { left: 14px; top: auto; bottom: 14px; right: 14px; max-width: none; } }\n",
     ".hero-chip small, .hero-prom small, .next small { display: block; font-size: inherit; }\n.sub-b { display: inline; }\n"),
    ("@media (max-width: 959px) { .hero-prom { grid-template-columns: 1fr 1fr; gap: 20px; } }\n@media (max-width: 520px) { .hero-prom { grid-template-columns: 1fr; gap: 14px; padding-bottom: 32px; } }\n", ""),
])
edit('index.html', [
    ('<link rel="stylesheet" href="css/site.css">', '<link rel="stylesheet" href="css/site.css">\n<link rel="stylesheet" href="css/phone.css">'),
])
print('patched')
