"""Builds web-ready WebP images in img/ from the owner's photo set (img/*.jpg stays as the source)."""
import os
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, '..', 'img')


def save(im, name, q=80):
    im.save(os.path.join(IMG, name), 'WEBP', quality=q, method=6)
    print(name, im.size, os.path.getsize(os.path.join(IMG, name)) // 1024, 'KB')


def sharpen(im):
    return im.filter(ImageFilter.UnsharpMask(radius=1.4, percent=60, threshold=2))


# hero: portrait crop of the garage scene, upscaled 1.6x so it holds up on retina cards
g = Image.open(os.path.join(IMG, 'garage.jpg')).convert('RGB')
crop = g.crop((330, 0, 330 + 627, 784))
hero = sharpen(crop.resize((1000, 1250), Image.LANCZOS))
save(hero, 'hero.webp', 82)

# service photos: native size slightly upscaled and sharpened
for n in ['garage', 'furniture', 'construction', 'commercial', 'yard']:
    im = Image.open(os.path.join(IMG, n + '.jpg')).convert('RGB')
    w, h = im.size
    im = sharpen(im.resize((int(w * 1.4), int(h * 1.4)), Image.LANCZOS))
    save(im, n + '.webp', 80)
