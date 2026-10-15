# Builds the 8 video-wall textures (1040 x 800, aspect matches each screen's active area).
import sys
from PIL import Image, ImageFilter, ImageEnhance
ref, tex, out = sys.argv[1], sys.argv[2], sys.argv[3]
W, H = 1040, 800
A = W / H

def cover_crop(im, cx=0.5, cy=0.5):
    w, h = im.size
    if w / h > A:  # too wide: crop sides
        nw = round(h * A); x0 = round((w - nw) * cx); im = im.crop((x0, 0, x0 + nw, h))
    else:
        nh = round(w / A); y0 = round((h - nh) * cy); im = im.crop((0, y0, w, y0 + nh))
    return im.resize((W, H), Image.LANCZOS)

def contain_pad(im, bg):
    w, h = im.size; s = min(W / w, H / h)
    im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    c = Image.new('RGB', (W, H), bg); c.paste(im, ((W - im.width) // 2, (H - im.height) // 2)); return c

def sharpen(im): return im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=2))

# Left: dashboard wall supplied with the request (4 panels), letterboxed on its own navy
dash = Image.open(f'{ref}/dash_wall.jpg').convert('RGB')
boxes = [(46, 93, 768, 485), (784, 94, 1510, 486), (42, 500, 770, 900), (786, 500, 1510, 900)]
for i, b in enumerate(boxes, 1):
    p = dash.crop(b)
    bg = p.resize((1, 1), Image.BOX).getpixel((0, 0))
    edge = p.crop((0, 0, p.width, 6)).resize((1, 1), Image.BOX).getpixel((0, 0))
    sharpen(contain_pad(p, edge)).save(f'{out}/vw_left_{i}.jpg', quality=88)

# Right: approved marketing artwork, arranged as in the reference wall
og = Image.open(f'{tex}/screen_back_right.jpg').convert('RGB')     # Oil & Gas Industries
ex = Image.open(f'{tex}/screen_back_left.jpg').convert('RGB')      # Engineering Excellence
rel = Image.open(f'{tex}/tv_sms.jpg').convert('RGB')               # Engineering Reliable ... 2024
mk = Image.open(f'{ref}/marketing_wall.jpg').convert('RGB').crop((580, 522, 1064, 912))  # Oil & Gas industries (variant)
cover_crop(og).save(f'{out}/vw_right_1.jpg', quality=88)
cover_crop(ex).save(f'{out}/vw_right_2.jpg', quality=88)
sharpen(cover_crop(rel.crop((20, 0, 768, 432)), cx=0.0)).save(f'{out}/vw_right_3.jpg', quality=88)
sharpen(cover_crop(mk)).save(f'{out}/vw_right_4.jpg', quality=88)
