"""Package an interactive, self-contained two-phone preview for the conversation."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
pages={}
for theme in ['murmur','kin','inkling','draft','pulse']:
    p=root/'themes'/theme/'index.html';s=p.read_text(encoding='utf-8')
    def style(m):
        href=m.group(1)
        return m.group(0) if href.startswith('http') else '<style>'+(p.parent/href).resolve().read_text(encoding='utf-8')+'</style>'
    s=re.sub(r'<link rel="stylesheet" href="([^"]+)">',style,s)
    def script(m):
        text=(p.parent/m.group(1)).resolve().read_text(encoding='utf-8')
        text=text.replace("html.dataset.device = params.get('device') || 'web';","html.dataset.device = window.name === 'android' ? 'android' : 'ios';")
        text=text.replace("history.replaceState(null, '', '#' + name)","void 0")
        return '<script>'+text+'</script>'
    s=re.sub(r'<script src="([^"]+)"></script>',script,s)
    s=s.replace('100vh','915px').replace('100vw','412px')
    s=s.replace('html, body { margin: 0; height: 100%; }','html, body { margin: 0; height: var(--preview-height,852px); }')
    s=s.replace('<body>','<body><script>document.documentElement.style.setProperty("--preview-height",window.name==="android"?"915px":"852px");</script>')
    pages[theme]=s
outer='''<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box}body{margin:0;font:12px var(--font-sans,system-ui);color:var(--foreground,#343b32)}.controls{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}.controls button{font:inherit;cursor:pointer;padding:9px 13px;border:1px solid var(--border,#ddd);border-radius:20px;background:var(--card,#fff);color:var(--foreground,#333)}.controls button[aria-pressed=true]{background:var(--accent,#e4eadb);color:var(--accent-foreground,#28362b)}.devices{display:flex;justify-content:space-around;gap:12px;height:705px;padding-top:10px}.slot{position:relative;width:304px;height:690px}.label{display:block;font-size:10px;color:var(--muted-foreground,#75806e);margin-bottom:12px}.phone{width:407px;height:866px;border:7px solid #32372e;border-radius:50px;overflow:hidden;position:relative;transform:scale(.72);transform-origin:left top;box-shadow:0 0 0 1px #9ba08e,0 20px 45px -25px #0004}.phone.android{width:426px;height:929px;border-radius:42px}.phone iframe{width:393px;height:852px;border:0;display:block}.phone.android iframe{width:412px;height:915px}.island{position:absolute;top:10px;left:50%;translate:-50% 0;background:#151914;border-radius:24px;width:118px;height:32px;z-index:4;pointer-events:none}.android .island{width:13px;height:13px;top:12px}.time{position:absolute;top:18px;left:27px;font:600 12px system-ui;color:#29362c;pointer-events:none;z-index:4}.gesture{position:absolute;bottom:8px;left:50%;translate:-50% 0;width:125px;height:4px;border-radius:4px;background:#303a2f;pointer-events:none;z-index:4}.android .gesture{width:100px;height:3px}.hint{font-size:10px;color:var(--muted-foreground,#77816e);margin:0 0 10px}@media(max-width:600px){.slot:nth-child(2){display:none}.devices{height:675px;justify-content:center}.phone{transform:scale(.72)}.slot{width:294px}.controls button{padding:8px 11px;font-size:11px}}
</style></head><body><div class="controls" id="themes"><button data-theme="murmur" aria-pressed="false">Murmur</button><button data-theme="kin" aria-pressed="true">Kin</button><button data-theme="inkling" aria-pressed="false">Inkling</button><button data-theme="draft" aria-pressed="false">Draft</button><button data-theme="pulse" aria-pressed="false">Pulse</button></div><div class="controls" id="screens"><button data-screen="signin" aria-pressed="true">Sign in</button><button data-screen="signup" aria-pressed="false">Sign up</button><button data-screen="forgot" aria-pressed="false">Reset</button><button data-screen="home" aria-pressed="false">Home</button></div><p class="hint">Touch, type, drag. These are live demos. Accounts and data are simulated.</p><div class="devices"><div class="slot"><span class="label">iPhone 15 Pro · 393 × 852</span><div class="phone"><iframe name="ios" title="iPhone interactive concept"></iframe><span class="time">9:41</span><div class="island"></div><div class="gesture"></div></div></div><div class="slot"><span class="label">Pixel 8 · 412 × 915</span><div class="phone android"><iframe name="android" title="Android interactive concept"></iframe><span class="time">9:41</span><div class="island"></div><div class="gesture"></div></div></div></div><script>
const pages=__PAGES__;let theme='kin',screen='signin';const frames=[...document.querySelectorAll('iframe')];function send(f){f.contentWindow.postMessage({type:'go',screen,instant:true},'*');}function load(){frames.forEach(f=>{f.onload=()=>send(f);f.srcdoc=pages[theme];});}function mark(){document.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.theme===theme));document.querySelectorAll('[data-screen]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.screen===screen));}document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{theme=b.dataset.theme;load();mark();});document.querySelectorAll('[data-screen]').forEach(b=>b.onclick=()=>{screen=b.dataset.screen;frames.forEach(send);mark();});addEventListener('message',e=>{if(!frames.some(f=>f.contentWindow===e.source)||e.data?.type!=='route'||e.data.screen===screen)return;screen=e.data.screen;frames.filter(f=>f.contentWindow!==e.source).forEach(send);mark();});load();
</script></body></html>'''
outer=outer.replace('__PAGES__',json.dumps(pages).replace('</','<\\/'))
(root/'preview.html').write_text(outer,encoding='utf-8')
print('Wrote self-contained preview.html')
