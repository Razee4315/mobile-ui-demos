"""Trim transparent margins, resize, convert to WebP, record dimensions.
Usage: python -I tools/process.py [raw_dir] [out_dir] [bg_width]   (run from the project root)"""
import glob, json, os, sys
from PIL import Image

RAW = sys.argv[1] if len(sys.argv) > 1 else 'assets/raw'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'assets/web'
os.makedirs(OUT, exist_ok=True)
MAX_OBJ = 900          # transparent objects: longest side
BG_W = int(sys.argv[3]) if len(sys.argv) > 3 else 828   # opaque images: 2x a ~414pt phone width

dims = {}
for f in sorted(glob.glob(f'{RAW}/*.png')):
    name = os.path.splitext(os.path.basename(f))[0]
    im = Image.open(f)
    if im.mode == 'RGBA':
        a = im.getchannel('A').point(lambda v: 255 if v > 8 else 0)
        box = a.getbbox()
        if box:
            pad = 12
            box = (max(0, box[0]-pad), max(0, box[1]-pad), min(im.width, box[2]+pad), min(im.height, box[3]+pad))
            im = im.crop(box)
        im.thumbnail((MAX_OBJ, MAX_OBJ), Image.LANCZOS)
        im.save(f'{OUT}/{name}.webp', 'WEBP', quality=86, method=6, exact=False)
    else:
        im = im.convert('RGB')
        h = round(im.height * BG_W / im.width)
        im = im.resize((BG_W, h), Image.LANCZOS)
        im.save(f'{OUT}/{name}.webp', 'WEBP', quality=82, method=6)
    dims[name] = {'w': im.width, 'h': im.height, 'kb': round(os.path.getsize(f'{OUT}/{name}.webp') / 1024)}
    print(f'{name:16} {im.width}x{im.height}  {dims[name]["kb"]} KB')

with open(f'{OUT}/dims.json', 'w') as fh:
    json.dump(dims, fh, indent=1)
