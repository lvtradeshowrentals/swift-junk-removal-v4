# Swift Junk Removal v4 - "Clear"

Bright, calm, precise. Goal: look like the most professional junk-removal company in the valley and beat the
plain 1-800-GOT-JUNK page on first impression, without the cartoon (v1) or the heavy effects (v3).

- Palette: paper #f2f4f6, ink #0b1220, copper #e8803f (brand), white cards. Dark sections: How, finale, footer.
- Type: Archivo only. The width axis (font-stretch 62-125) is the voice: display runs wide, body stays normal.
  Hero headline starts squeezed (62) and opens to 125 on load, like space being cleared. Same move on the finale.
- Signature moments (kept to four): hero type-open + photo scan with item pins; services list with a sticky photo that
  wipes to the row in the middle of the screen; "How" mock-ups that play once; the quote load gauge (a truck bed of
  isometric blocks that fills as you slide) beside a 3-step form.
- No build step: index.html + css/site.css + js/site.js (+ Lenis in js/vendor). Images: `python -I _dev/images.py`
  makes img/*.webp from the source jpgs. `_dev/shoot.cjs`, `flow.cjs` (form with FormSubmit mocked), `intro.cjs`.
- Copy keeps v1's facts: phone (702) 929-6544, swift-junkremoval@outlook.com, FormSubmit ajax endpoint. No prices,
  no reviews, no stats, no licence claims.
- Photos are the AI placeholders from v1 (garage, furniture, construction, commercial, yard): replace with real jobs.
