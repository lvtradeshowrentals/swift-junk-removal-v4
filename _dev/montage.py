"""python -I _dev/montage.py <name> [per_sheet]  -> shots/<name>_sheetN.png (frames side by side with a thin gap)"""
import glob, os, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
name = sys.argv[1]
per = int(sys.argv[2]) if len(sys.argv) > 2 else 4
files = sorted(glob.glob(os.path.join(HERE, 'shots', name + '_[0-9][0-9].png')))
for s in range(0, len(files), per):
    ims = [Image.open(f).convert('RGB') for f in files[s:s + per]]
    w, h = ims[0].size
    sheet = Image.new('RGB', (len(ims) * (w + 8) - 8, h), (30, 30, 30))
    for i, im in enumerate(ims):
        sheet.paste(im, (i * (w + 8), 0))
    out = os.path.join(HERE, 'shots', f'{name}_sheet{s // per}.png')
    sheet.save(out)
    print(out)
