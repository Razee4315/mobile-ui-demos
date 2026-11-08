(() => {
const pals=[...document.querySelectorAll('.pal')],app=App.el;let pointer={x:200,y:220},privacy=false,peek=false,focus=null,kick=0,celebrate=0,nextBlink=2,blink=0;
App.on('pointer',p=>pointer=p);App.on('caret',d=>{pointer={x:d.caret.x,y:d.caret.y};});
App.on('focus',d=>{focus=d.el;privacy=d.kind==='password';app.classList.toggle('privacy',privacy);app.classList.add('happy');});
App.on('blur',()=>{focus=null;privacy=false;app.classList.remove('privacy','peek','happy');});App.on('reveal',d=>{peek=d.visible;app.classList.toggle('peek',peek);});
App.on('input',d=>{kick=.6;pointer={x:d.caret.x,y:d.caret.y};});
App.on('success',()=>{celebrate=1.4;app.classList.add('happy');});
App.on('invalid',()=>{kick=1;document.querySelectorAll('.crew-bubble').forEach(b=>b.textContent='One little typo. We’re here.');});
App.on('route',()=>{focus=null;privacy=false;app.classList.remove('privacy','peek');document.querySelectorAll('.crew-bubble').forEach(b=>b.textContent=App.current()==='home'?'A good day to help.':'We’ve got you.');});
pals.forEach((p,i)=>{p.onclick=()=>{kick=1;app.classList.add('happy');p.closest('.crew').querySelector('.crew-bubble').textContent=['Maya here. Let’s make it easy.','Jun says hello!','Theo’s ready to help.','Pip: small, but mighty.'][i%4];};});
App.loop((dt,t)=>{kick=Math.max(0,kick-dt*2);celebrate=Math.max(0,celebrate-dt);if(t>nextBlink){blink=.12;nextBlink=t+2.4+Math.random()*3;}blink=Math.max(0,blink-dt);pals.forEach((p,i)=>{if(!p.closest('.screen').classList.contains('is-active'))return;let r=App.rect(p),dx=Math.max(-4,Math.min(4,(pointer.x-r.cx)/35)),dy=Math.max(-2,Math.min(3,(pointer.y-r.cy)/50));p.style.setProperty('--eye-x',privacy?'0px':dx+'px');p.style.setProperty('--eye-y',privacy?'0px':dy+'px');p.querySelectorAll('b').forEach(b=>b.style.height=blink&&!privacy?'1px':'');if(App.reduce.matches){p.style.transform='';return;}let hop=celebrate?Math.max(0,Math.sin((1.4-celebrate)*10-i*.6))*14:0,lean=privacy?(-4+i%4*2):(focus?dx*.7:Math.sin(t*.8+i)*1.6);p.style.transform=`translateY(${-hop}px) rotate(${lean}deg) scale(${1+kick*.05},${1-kick*.09})`;});});
document.querySelectorAll('[data-ticket]').forEach(b=>b.onclick=()=>{let name=b.dataset.ticket;App.dialog('A hand for '+name,'<p>“'+b.querySelector('small').textContent+'”</p><div class="reply-preview"><small>Suggested reply · Edit before sending</small>Hi '+name+'! Happy to help. Let me take a look and find the simplest next step for you.</div><button class="btn" data-resolve>Mark resolved in demo</button>');document.querySelector('[data-resolve]').onclick=()=>{App.closeDialog();b.classList.add('resolved');setTimeout(()=>b.hidden=true,400);let n=document.querySelector('[data-queue]');n.textContent=Math.max(0,+n.textContent-1);celebrate=1.4;App.notify('One more person helped. Nicely done.');};});
document.querySelector('[data-action="queue"]').onclick=()=>App.notify('Showing your next three conversations.');
App.start();
})();
