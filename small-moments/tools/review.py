"""Capture every screen at native device sizes and exercise the demo flows."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'shots';OUT.mkdir(exist_ok=True)
results=[];errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch(channel='msedge',headless=True)
    page=browser.new_page(viewport={'width':1280,'height':1100},device_scale_factor=1)
    page.on('pageerror',lambda e:errors.append(str(e)))
    for theme in ['murmur','kin','inkling','draft','pulse']:
        for device,w,h in [('ios',393,852),('android',412,915)]:
            page.set_viewport_size({'width':w,'height':h})
            page.goto(f'http://127.0.0.1:5173/v2/themes/{theme}/index.html?device={device}',wait_until='networkidle')
            page.wait_for_function('window.App && App.current()')
            for screen in ['signin','signup','forgot','home']:
                page.evaluate('(s)=>App.go(s)',screen);page.wait_for_timeout(850)
                page.screenshot(path=str(OUT/f'{theme}-{screen}-{device}.png'))
                info=page.evaluate('''()=>{const s=App.screens[App.current()];return {route:App.current(),width:s.clientWidth,scrollWidth:s.scrollWidth,height:s.clientHeight,contentHeight:s.scrollHeight,fonts:document.fonts.status,buttons:[...s.querySelectorAll('form button[type=submit]')].map(b=>({bottom:Math.round(b.getBoundingClientRect().bottom),visible:!!b.offsetHeight}))}}''')
                results.append(dict(theme=theme,device=device,screen=screen,**info))
            page.evaluate("App.go('signin')");page.wait_for_timeout(750)
            page.locator('[data-screen=signin] button[type=submit]').click()
            assert page.locator('#si-id[aria-invalid=true],#si-email[aria-invalid=true]').count()==1,(theme,'validation')
            page.locator('#si-id,#si-email').fill('ana@example.com');page.locator('#si-pw').fill('Example123!')
            page.locator('[data-screen=signin] [data-toggle-pw]').click();assert page.locator('#si-pw').get_attribute('type')=='text'
            page.locator('[data-screen=signin] button[type=submit]').click()
            assert page.locator('[data-screen=signin] button[type=submit]').get_attribute('aria-busy')=='true'
            page.wait_for_function("App.current()==='home'")
            page.wait_for_timeout(850)
            page.evaluate("App.go('forgot')");page.wait_for_timeout(850);page.locator('#fp-email').fill('ana@example.com');page.locator('[data-screen=forgot] button[type=submit]').click()
            page.wait_for_function("App.screens.forgot.dataset.state==='sent'")
            assert page.locator('[data-resend]').is_disabled()
            assert page.locator('[data-sent-email]').inner_text()=='ana@example.com'
            page.screenshot(path=str(OUT/f'{theme}-sent-{device}.png'))
            page.evaluate("App.go('signup')");page.wait_for_timeout(850)
            page.locator('#su-name').fill('Ana');page.locator('#su-email').fill('ana@example.com');page.locator('#su-pw').fill('Example123!')
            assert page.locator('.meter').get_attribute('data-level')=='4'
            page.locator('[data-screen=signup] input[type=checkbox]').check();page.locator('[data-screen=signup] button[type=submit]').click();page.wait_for_function("App.current()==='home'");page.wait_for_timeout(850)
            print(theme,device,'screens, validation, reveal, loading, reset and signup PASS',flush=True)
    page.set_viewport_size({'width':1440,'height':1400});page.goto('http://127.0.0.1:5173/v2/index.html?theme=kin&screen=signin',wait_until='networkidle');page.screenshot(path=str(OUT/'gallery.png'),full_page=True)
    browser.close()
(OUT/'review.json').write_text(json.dumps({'screens':results,'errors':errors},indent=2))
assert not errors,errors
assert not [r for r in results if r['scrollWidth']>r['width']], 'Horizontal overflow'
print('40 native-size screen captures + 10 success states. No JS errors or horizontal overflow.')
