"""Set width/height on every <img> in themes/*/index.html from assets/sizes.json."""
import json, os, re, glob

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sizes = json.load(open(os.path.join(ROOT, 'assets', 'sizes.json')))
for f in glob.glob(os.path.join(ROOT, 'themes', '*', 'index.html')):
    src = open(f, encoding='utf-8').read()
    missing = set()

    def fix(m):
        tag = m.group(0)
        s = re.search(r'src="\.\./\.\./assets/([^"]+)"', tag)
        if not s:
            return tag
        if s.group(1) not in sizes:
            missing.add(s.group(1)); return tag
        w, h = sizes[s.group(1)]
        tag = re.sub(r'\swidth="\d+"', '', tag)
        tag = re.sub(r'\sheight="\d+"', '', tag)
        return tag[:-1].rstrip() + f' width="{w}" height="{h}">'

    out = re.sub(r'<img\b[^>]*>', fix, src)
    open(f, 'w', encoding='utf-8').write(out)
    print(os.path.relpath(f, ROOT), 'missing:', sorted(missing) or 'none')
