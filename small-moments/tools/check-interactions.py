"""Exercise the signature interactions and gallery controls, beyond the auth flows."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
root=Path(__file__).resolve().parents[1];checks=[];errors=[]
with sync_playwright() as p:
    b=p.chromium.launch(channel='msedge',headless=True)
    page=b.new_page(viewport={'width':393,'height':852})
    page.on('pageerror',lambda e:errors.append(str(e)))
    def visit(theme,screen='home'):
        page.goto(f'http://127.0.0.1:5173/v2/themes/{theme}/index.html?device=ios#{screen}',wait_until='networkidle')
    visit('kin');page.locator('[data-ticket=Lena]').click();page.locator('[data-resolve]').click();assert page.locator('[data-queue]').inner_text()=='7';checks.append('Kin ticket resolution updates the queue')
    page.evaluate("App.go('signin')");page.wait_for_timeout(750);page.locator('#si-pw').focus();assert page.locator('.app').evaluate("e=>e.classList.contains('privacy')");page.locator('[data-screen=signin] [data-toggle-pw]').click();assert page.locator('.app').evaluate("e=>e.classList.contains('peek')");checks.append('Kin privacy and peek reactions')
    visit('inkling');page.locator('.timeline').fill('11');assert page.locator('[data-frame]').inner_text()=='11';page.locator('[data-action=new]').click();page.locator('#loop-name').fill('A very small wave');page.locator('[data-create]').click();assert page.locator('.sketch-projects button').count()==3;checks.append('Inkling frame scrub and local project creation')
    visit('draft');scene=page.locator('[data-screen=home] .board-scene');r=scene.bounding_box();page.mouse.move(r['x']+60,r['y']+50);page.mouse.down();page.mouse.move(r['x']+90,r['y']+65);page.mouse.up();assert scene.evaluate("e=>e.style.getPropertyValue('--pan-x')")=='30px';page.locator('[data-action=new]').click();page.locator('#board-name').fill('A gentler handoff');page.locator('[data-create]').click();assert page.locator('.boards button').count()==3;checks.append('Draft note panning and board creation')
    visit('pulse');chart=page.locator('.chart-interact');chart.focus();chart.press('ArrowRight');assert chart.get_attribute('aria-valuenow')=='15';page.locator('[data-service=API]').click();page.locator('[data-day="13"]').click();assert '99.4%' in page.locator('.bar-note').inner_text();checks.append('Pulse keyboard chart and daily uptime inspection')
    visit('murmur');page.locator('[data-prompt]').first.click();assert page.locator('#ask').input_value()=='Plan a slow Sunday for me';page.locator('.send').click();page.wait_for_function("document.querySelector('[data-status]').textContent.startsWith('Demo')");checks.append('Murmur prompt selection and reply state')
    page.evaluate("App.go('signin')");page.wait_for_timeout(850);page.locator('[data-screen=signin] [data-social=Apple]').click();assert page.locator('.modal').is_visible();page.keyboard.press('Escape');assert not page.locator('.modal').is_visible();checks.append('Social demo disclosure and keyboard modal dismissal')
    page.emulate_media(reduced_motion='reduce')
    for theme in ['murmur','kin','inkling','draft','pulse']:
        visit(theme,'signin');assert page.evaluate('App.reduce.matches');page.screenshot(path=str(root/'shots'/f'{theme}-reduced-motion.png'))
        animations=page.evaluate("[...document.getAnimations()].filter(a=>a.playState==='running'&&a.effect.getTiming().iterations===Infinity).length")
        assert animations==0,(theme,animations)
    checks.append('All themes suppress infinite CSS animations under reduced motion')
    page.emulate_media(reduced_motion='no-preference')
    page.set_viewport_size({'width':1280,'height':1000});page.goto('http://127.0.0.1:5173/v2/index.html',wait_until='networkidle');page.locator('[data-theme=pulse]').click();page.wait_for_function("document.querySelector('#ios').contentWindow.App?.current()==='signin'");page.locator('[data-screen=home]').click();page.wait_for_function("[...document.querySelectorAll('iframe')].every(f=>f.contentWindow.App?.current()==='home')");checks.append('Gallery theme switch and dual-device route synchronization')
    page.locator('#state').select_option('sent');page.wait_for_function("[...document.querySelectorAll('iframe')].every(f=>f.contentDocument.querySelector('[data-screen=forgot]').dataset.state==='sent')");checks.append('Gallery reset-success state synchronizes both phones')
    page.set_viewport_size({'width':390,'height':844});page.screenshot(path=str(root/'shots'/'gallery-mobile.png'),full_page=True);assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');checks.append('Mobile gallery has no page-level horizontal overflow')
    b.close()
(root/'shots'/'interactions.json').write_text(json.dumps({'checks':checks,'errors':errors},indent=2))
assert not errors,errors
for c in checks: print('PASS',c)
