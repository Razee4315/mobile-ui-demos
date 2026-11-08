"""Download Dribbble stills per group and build numbered contact sheets with titles.
usage: python tools/dr_sheet.py <group>"""
import sys, os, json, urllib.request, concurrent.futures as cf
from PIL import Image, ImageDraw, ImageFont
g = sys.argv[1]
root = os.path.join(os.path.dirname(__file__), '..', 'research')
items, seen = [], set()
for it in json.load(open(os.path.join(root, 'dribbble.json'), encoding='utf-8'))[g]:
    if it['img'] and it['img'] not in seen and not it['img'].startswith('data:'):
        seen.add(it['img']); items.append(it)
out = os.path.join(root, 'cand', g); os.makedirs(out, exist_ok=True)
def dl(a):
    i, it = a; p = os.path.join(out, f'{i:03d}.jpg')
    if not os.path.exists(p):
        try:
            data = urllib.request.urlopen(urllib.request.Request(it['img'], headers={'User-Agent': 'Mozilla/5.0'}), timeout=30).read()
            open(p + '.tmp', 'wb').write(data); Image.open(p + '.tmp').convert('RGB').save(p, quality=90); os.remove(p + '.tmp')
        except Exception as e:
            return i, None
    return i, p
with cf.ThreadPoolExecutor(16) as ex: res = sorted(ex.map(dl, enumerate(items)))
json.dump(items, open(os.path.join(out, 'index.json'), 'w', encoding='utf-8'), indent=1)
W, H, cols, per = 300, 255, 6, 36
font = ImageFont.load_default(size=15); fb = ImageFont.load_default(size=20)
tiles = [(i, p) for i, p in res if p]
for k in range(0, len(tiles), per):
    chunk = tiles[k:k+per]; rows = (len(chunk)+cols-1)//cols
    sheet = Image.new('RGB', (cols*W, rows*H), (34, 34, 38)); d = ImageDraw.Draw(sheet)
    for j, (i, p) in enumerate(chunk):
        im = Image.open(p); im.thumbnail((W-6, H-36)); x, y = (j % cols)*W, (j//cols)*H
        sheet.paste(im, (x+3, y+3))
        tag = f'{i:03d}' + (' ▶' if items[i].get('video') else '')
        d.rectangle([x+3, y+3, x+66, y+28], fill=(0, 0, 0)); d.text((x+7, y+5), tag, fill=(255, 220, 0), font=fb)
        d.text((x+5, y+H-30), items[i]['title'][:36], fill=(220, 220, 220), font=font)
    sp = os.path.join(root, f'sheet_{g}_{k//per}.jpg'); sheet.save(sp, quality=82); print(sp)
