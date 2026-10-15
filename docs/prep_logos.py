# Logo textures from Rahul's artwork (15 Oct): official SMT, high-res Fugro, Guidance Marine, Xplisi.
import sys
from PIL import Image, ImageDraw
import numpy as np
ref, out = sys.argv[1], sys.argv[2]

def to_alpha(im):
    """Keep real transparency; if the background is opaque white, derive alpha from whiteness."""
    a = np.asarray(im.convert('RGBA')).astype(float)
    if a[..., 3].min() > 250:
        rgb = a[..., :3]; white = rgb.min(axis=2)
        alpha = np.clip((255 - white) * 1.6, 0, 255)
        a[..., 3] = alpha
    return Image.fromarray(a.astype('uint8'), 'RGBA')

def trim(im, pad=0.03):
    bb = im.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
    im = im.crop(bb); w, h = im.size; p = int(max(w, h) * pad)
    c = Image.new('RGBA', (w + 2 * p, h + 2 * p), (255, 255, 255, 0)); c.paste(im, (p, p)); return c

def fit(im, maxw):
    if im.width > maxw: im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    return im

res = {}
smt = Image.open(f'{ref}/smtimg-001.png').convert('RGB'); smt.putalpha(Image.open(f'{ref}/smtimg-002.png').convert('L'))
res['logo_smt'] = fit(trim(smt), 1600)
res['logo_fugro'] = fit(trim(to_alpha(Image.open(f'{ref}/fugro_navy.png'))), 1600)
res['logo_guidance'] = fit(trim(to_alpha(Image.open(f'{ref}/guidance.png'))), 1600)
uk = Image.open(f'{ref}/smt_uk.png').convert('RGB'); uk = uk.resize((uk.width * 4, uk.height * 4), Image.LANCZOS)  # source is only 281 px wide
res['logo_smt_uk'] = trim(to_alpha(uk))
x = Image.open(f'{ref}/xplisi.png').convert('RGBA')
x.putalpha(255)
m = Image.new('L', x.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, x.width - 1, x.height - 1), radius=int(x.width * 0.06), fill=255)
x.putalpha(m); res['logo_xplisi'] = x
for k, im in res.items():
    im.save(f'{out}/{k}.png', optimize=True); print(k, im.size, round(im.width / im.height, 4))
