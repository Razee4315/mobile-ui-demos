from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'themes/murmur/index.html';s=p.read_text(encoding='utf-8')
s=s.replace('class="btn-ghost" data-go="home"><i class="ph-fill ph-apple-logo"','class="btn-ghost" data-social="Apple"><i class="ph-fill ph-apple-logo"').replace('class="btn-ghost" data-go="home"><i class="ph ph-google-logo"','class="btn-ghost" data-social="Google"><i class="ph ph-google-logo"')
s=s.replace('href="#" onclick="return false">Terms','href="#" data-legal="Terms">Terms').replace('href="#" onclick="return false">Privacy Policy','href="#" data-legal="Privacy">Privacy Policy')
s=s.replace('<a class="btn" href="#" onclick="return false"><span class="btn-label">Open mail <i class="ph ph-arrow-up-right" aria-hidden="true"></i></span></a>','<button class="btn" type="button" data-mail-preview><span class="btn-label">Email delivery preview <i class="ph ph-arrow-up-right" aria-hidden="true"></i></span></button>')
if 'class="modal"' not in s:
    s=s.replace('<div class="stage"','<div class="toast" role="status" aria-live="polite"></div><div class="modal" hidden><div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" aria-label="Close">×</button><p class="eyebrow">Murmur · Interactive concept</p><h2 id="modal-title"></h2><div class="modal-body"></div></div></div>\n<div class="stage"')
    s=s.replace('<script src="theme.js">','<script src="../../shared/interactions.js"></script>\n<script src="theme.js">')
p.write_text(s,encoding='utf-8')
