"""Download Dribbble video teasers and render 8-frame strips for motion study.
usage: python tools/motion_strips.py out.jpg group:idx [group:idx ...]"""
import sys, os, json, subprocess, urllib.request
from PIL import Image, ImageDraw, ImageFont
out, specs = sys.argv[1], sys.argv[2:]
root = os.path.join(os.path.dirname(__file__), '..', 'research'); vd = os.path.join(root, 'video'); os.makedirs(vd, exist_ok=True)
font = ImageFont.load_default(size=18); rows = []
for sp in specs:
    g, i = sp.split(':'); i = int(i)
    it = json.load(open(os.path.join(root, 'cand', g, 'index.json'), encoding='utf-8'))[i]
    if not it.get('video'): print('no video', sp); continue
    mp4 = os.path.join(vd, f'{g}_{i:03d}.mp4')
    if not os.path.exists(mp4):
        open(mp4, 'wb').write(urllib.request.urlopen(urllib.request.Request(it['video'], headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read())
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4], capture_output=True, text=True).stdout.strip() or 4)
    frames = []
    for k in range(8):
        t = dur * (k + .5) / 8; fp = os.path.join(vd, f'_f{k}.jpg')
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{t:.2f}', '-i', mp4, '-frames:v', '1', '-vf', 'scale=230:-1', fp])
        frames.append(Image.open(fp).copy())
    h = max(f.height for f in frames); row = Image.new('RGB', (8 * 232, h + 26), (30, 30, 34)); d = ImageDraw.Draw(row)
    for k, f in enumerate(frames): row.paste(f, (k * 232, 26))
    d.text((6, 3), f'{sp}  {it["title"][:60]}  ({dur:.1f}s)', fill=(255, 220, 0), font=font); rows.append(row)
W = max(r.width for r in rows); H = sum(r.height for r in rows)
sheet = Image.new('RGB', (W, H), (20, 20, 22)); y = 0
for r in rows: sheet.paste(r, (0, y)); y += r.height
sheet.save(out, quality=82); print(out, sheet.size)
