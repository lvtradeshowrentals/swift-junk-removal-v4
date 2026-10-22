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
    # anchor the DOT (not the dot + label pair) on the item
    (".pin { position: absolute; left: var(--x); top: var(--y); display: flex; align-items: center; gap: 0; transform: translate(-50%, -50%); }",
     ".pin { --dot: 9px; --tx: calc(var(--dot) * -1); position: absolute; left: var(--x); top: var(--y); display: flex; align-items: center; gap: 0; transform: translate(var(--tx), -50%); transform-origin: var(--dot) 50%; }"),
    (".pin.rev { flex-direction: row-reverse; }",
     ".pin.rev { flex-direction: row-reverse; --tx: calc(-100% + var(--dot)); transform-origin: calc(100% - var(--dot)) 50%; }"),
    ("@keyframes pinIn { from { opacity: 0; transform: translate(-50%, -50%) scale(.6); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }",
     "@keyframes pinIn { from { opacity: 0; transform: translate(var(--tx), -50%) scale(.6); } to { opacity: 1; transform: translate(var(--tx), -50%) scale(1); } }"),
])
edit('css/phone.css', [
    ("  .pin i { width: 16px; height: 16px; } .pin i::after { inset: 4px; }",
     "  .pin { --dot: 8px; }\n  .pin i { width: 16px; height: 16px; } .pin i::after { inset: 4px; }"),
])
edit('index.html', [
    ('--x:41%;--y:61%;--my:41.5%;', '--x:39%;--y:61%;--my:41.5%;'),
])
print('ok')
