/* v2 runtime: router, event bus, caret tracking, springs, forms, gallery bridge.
   Themes listen with App.on(event, fn) and drive their living characters. */
(() => {
  const html = document.documentElement;
  const params = new URLSearchParams(location.search);
  html.dataset.device = params.get('device') || 'web';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- event bus ---------- */
  const handlers = {};
  const App = window.App = {
    reduce,
    config: { successDelay: 0, routeMs: null },
    on(ev, fn) { (handlers[ev] = handlers[ev] || []).push(fn); return App; },
    emit(ev, d) { (handlers[ev] || []).forEach((fn) => { try { fn(d || {}); } catch (e) { console.error(e); } }); },
  };

  /* ---------- frame loop + springs ---------- */
  const loops = new Set(); let last = performance.now(), raf = 0;
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    loops.forEach((fn) => fn(dt, now / 1000));
    raf = requestAnimationFrame(tick);
  }
  App.loop = (fn) => { loops.add(fn); if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } return () => loops.delete(fn); };
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else if (loops.size && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); } });

  /* critically-damped-ish spring, stiffness k, damping c */
  class Spring {
    constructor(v = 0, k = 170, c = 22) { this.v = v; this.t = v; this.vel = 0; this.k = k; this.c = c; }
    set(t) { this.t = t; return this; }
    snap(v) { this.v = this.t = v; this.vel = 0; return this; }
    kick(f) { this.vel += f; return this; }
    step(dt) {
      if (reduce.matches) { this.v = this.t; this.vel = 0; return this.v; }
      const n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n;
      for (let i = 0; i < n; i++) { const a = -this.k * (this.v - this.t) - this.c * this.vel; this.vel += a * h; this.v += this.vel * h; }
      return this.v;
    }
    get resting() { return Math.abs(this.v - this.t) < 0.001 && Math.abs(this.vel) < 0.001; }
  }
  App.Spring = Spring;
  App.lerp = (a, b, t) => a + (b - a) * t;
  App.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- geometry ---------- */
  const app = document.querySelector('.app');
  App.el = app;
  App.rect = (el) => { const a = app.getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: r.left - a.left, y: r.top - a.top, w: r.width, h: r.height, cx: r.left - a.left + r.width / 2, cy: r.top - a.top + r.height / 2 }; };
  App.size = () => ({ w: app.clientWidth, h: app.clientHeight });

  const mirror = document.createElement('span');
  mirror.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;left:-9999px;top:0';
  document.body.appendChild(mirror);
  /* caret position (relative to .app) for an <input> */
  App.caret = (input) => {
    const cs = getComputedStyle(input);
    mirror.style.font = cs.font; mirror.style.letterSpacing = cs.letterSpacing;
    const n = input.selectionStart == null ? input.value.length : input.selectionStart;
    mirror.textContent = input.type === 'password' ? '•'.repeat(n) : input.value.slice(0, n);
    const r = App.rect(input);
    const x = r.x + parseFloat(cs.paddingLeft) + mirror.offsetWidth - input.scrollLeft;
    return { x: Math.min(x, r.x + r.w - parseFloat(cs.paddingRight)), y: r.cy, field: r };
  };
  const kindOf = (el) => el.type === 'password' || el.dataset.pw != null ? 'password' : (el.type === 'email' || el.dataset.kind ? 'email' : (el.type === 'search' ? 'search' : 'text'));

  /* ---------- pointer / tap ---------- */
  app.addEventListener('pointermove', (e) => { const a = app.getBoundingClientRect(); App.emit('pointer', { x: e.clientX - a.left, y: e.clientY - a.top }); });
  app.addEventListener('pointerleave', () => App.emit('pointerleave'));
  app.addEventListener('pointerdown', (e) => { const a = app.getBoundingClientRect(); App.emit('tap', { x: e.clientX - a.left, y: e.clientY - a.top, target: e.target, event: e }); });

  /* ---------- router ---------- */
  const screens = Object.fromEntries([...document.querySelectorAll('[data-screen]')].map((s) => [s.dataset.screen, s]));
  const ORDER = { signin: 0, signup: 1, forgot: 1, home: 2 };
  let current = null, busy = false;
  App.screens = screens;
  App.current = () => current;
  Object.values(screens).forEach((s) => s.querySelectorAll('[data-in]').forEach((el, i) => el.style.setProperty('--i', el.dataset.in || i)));

  function show(name, instant) {
    const next = screens[name];
    if (!next || name === current) return;
    const prev = screens[current], from = current;
    if (from === 'forgot') clearInterval(timer);
    const dir = current && ORDER[name] < ORDER[current] ? 'back' : 'fwd';
    app.dataset.dir = dir; app.dataset.route = name;
    resetScreen(next);
    const ms = App.config.routeMs || parseFloat(getComputedStyle(html).getPropertyValue('--route-ms')) || 700;
    current = name;
    Object.values(screens).forEach((s) => { const hidden = s !== next; s.inert = hidden; s.setAttribute('aria-hidden', String(hidden)); });
    App.emit('route', { to: name, from, dir, instant: !prev || instant });
    if (!prev || instant || reduce.matches) {
      Object.values(screens).forEach((s) => s.classList.remove('is-active', 'enter', 'leave'));
      next.classList.add('is-active'); next.scrollTop = 0;
    } else {
      busy = true; next.scrollTop = 0;
      next.classList.add('is-active', 'enter'); prev.classList.add('leave');
      setTimeout(() => { prev.classList.remove('is-active', 'leave'); next.classList.remove('enter'); busy = false; App.emit('routed', { to: name }); }, ms);
    }
    if (location.hash.slice(1) !== name) history.replaceState(null, '', '#' + name);
    parent !== window && parent.postMessage({ type: 'route', screen: name }, '*');
  }
  App.go = (name) => !busy && show(name);
  document.addEventListener('click', (e) => { const l = e.target.closest('[data-go]'); if (l) { e.preventDefault(); App.go(l.dataset.go); } });
  addEventListener('hashchange', () => show(location.hash.slice(1) || 'signin'));

  /* ---------- fields: focus, typing, caret ---------- */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, PHONE = /^\+?[\d\s()-]{7,}$/;
  document.querySelectorAll('.app input:not([type=checkbox])').forEach((input) => {
    const payload = () => ({ el: input, kind: kindOf(input), length: input.value.length, caret: App.caret(input), screen: current });
    input.addEventListener('focus', () => App.emit('focus', payload()));
    input.addEventListener('blur', () => setTimeout(() => { if (!document.activeElement || !document.activeElement.matches('input')) App.emit('blur', { el: input, kind: kindOf(input) }); }, 30));
    input.addEventListener('input', () => App.emit('input', payload()));
    ['keyup', 'click', 'select'].forEach((ev) => input.addEventListener(ev, () => App.emit('caret', payload())));
  });

  function setError(field, msg) {
    const wrap = field.closest('.field'), out = wrap && wrap.querySelector('.field-error');
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    wrap && wrap.classList.toggle('has-error', !!msg);
    if (out) out.textContent = msg || '';
  }
  App.setError = setError;
  function validate(form) {
    let bad = null;
    form.querySelectorAll('input').forEach((f) => {
      let msg = ''; const v = f.value.trim();
      if (f.type === 'checkbox') { if (f.required && !f.checked) msg = f.dataset.msg || 'Please accept to continue'; }
      else if (f.required && !v) msg = f.dataset.msgEmpty || 'This field is required';
      else if (f.dataset.kind === 'email-or-phone' && v && !EMAIL.test(v) && !PHONE.test(v)) msg = 'Enter a valid email or phone number';
      else if (f.type === 'email' && v && !EMAIL.test(v)) msg = f.dataset.msg || "That email doesn't look right";
      else if (f.dataset.minlength && v.length < +f.dataset.minlength) msg = `Use at least ${f.dataset.minlength} characters`;
      setError(f, msg); if (msg && !bad) bad = f;
    });
    if (bad) { bad.focus(); App.emit('invalid', { el: bad, kind: kindOf(bad), form }); }
    return !bad;
  }
  function setLoading(btn, on) { btn.classList.toggle('is-loading', on); btn.setAttribute('aria-busy', String(on)); btn.disabled = on; }
  App.setLoading = setLoading;

  document.querySelectorAll('form[data-form]').forEach((form) => {
    form.noValidate = true;
    form.addEventListener('input', (e) => e.target.getAttribute('aria-invalid') === 'true' && setError(e.target, ''));
    form.addEventListener('change', (e) => e.target.type === 'checkbox' && setError(e.target, ''));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate(form)) return;
      const btn = form.querySelector('[type=submit]');
      setLoading(btn, true); App.emit('submit', { form });
      setTimeout(() => {
        setLoading(btn, false);
        if (form.dataset.form === 'forgot') {
          const scr = form.closest('[data-screen]');
          scr.querySelectorAll('[data-sent-email]').forEach((el) => (el.textContent = form.querySelector('input').value.trim()));
          scr.dataset.state = 'sent'; startCountdown(scr); App.emit('sent', { screen: scr });
        } else {
          App.emit('success', { form, next: form.dataset.next || 'home' });
          setTimeout(() => App.go(form.dataset.next || 'home'), reduce.matches ? 0 : App.config.successDelay);
        }
      }, 1200);
    });
  });

  /* ---------- password reveal ---------- */
  document.querySelectorAll('[data-toggle-pw]').forEach((btn) => btn.addEventListener('click', () => {
    const input = btn.closest('.field').querySelector('input');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password'; input.dataset.pw = '';
    btn.setAttribute('aria-pressed', String(show)); btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    btn.classList.toggle('is-on', show);
    App.emit('reveal', { visible: show, el: input });
  }));

  /* ---------- strength meter ---------- */
  function score(v) { if (v.length < 6) return v.length ? 1 : 0; let s = 1; if (v.length >= 10) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) s++; return Math.min(4, s); }
  document.querySelectorAll('input[data-strength]').forEach((input) => {
    const meter = document.getElementById(input.dataset.strength), label = meter.querySelector('[data-meter-label]');
    const labels = (meter.dataset.labels || 'Too short|Weak|Okay|Strong|Excellent').split('|');
    const upd = () => { const s = input.value ? score(input.value) : 0; meter.dataset.level = s; meter.style.setProperty('--level', s); label.textContent = input.value ? labels[s] : meter.dataset.empty || ''; App.emit('strength', { level: s }); };
    input.addEventListener('input', upd); upd();
  });

  /* ---------- forgot countdown ---------- */
  let timer;
  function startCountdown(scr) {
    const btn = scr.querySelector('[data-resend]'), out = scr.querySelector('[data-count]'), total = +(btn.dataset.seconds || 30);
    let n = total; clearInterval(timer); btn.disabled = true; btn.classList.add('is-waiting');
    const t = () => { out.textContent = `0:${String(n).padStart(2, '0')}`; scr.style.setProperty('--progress', n / total); if (n-- <= 0) { clearInterval(timer); btn.disabled = false; btn.classList.remove('is-waiting'); out.textContent = 'now'; } };
    t(); timer = setInterval(t, 1000);
  }
  document.querySelectorAll('[data-resend]').forEach((b) => b.addEventListener('click', () => { startCountdown(b.closest('[data-screen]')); App.emit('resend'); }));
  document.querySelectorAll('[data-reset-state]').forEach((b) => b.addEventListener('click', () => { const s = b.closest('[data-screen]'); s.dataset.state = ''; clearInterval(timer); App.emit('unsent'); }));
  function resetScreen(scr) {
    if (scr.dataset.screen === 'forgot' && scr.dataset.state === 'sent') { scr.dataset.state = ''; clearInterval(timer); }
    scr.querySelectorAll('[aria-invalid=true]').forEach((f) => setError(f, ''));
  }

  /* ---------- tablists / toggle groups (visual) ---------- */
  document.querySelectorAll('[role=tablist]').forEach((list) => list.addEventListener('click', (e) => { const t = e.target.closest('[role=tab]'); if (!t) return; list.querySelectorAll('[role=tab]').forEach((x) => x.setAttribute('aria-selected', String(x === t))); App.emit('tab', { tab: t }); }));
  document.querySelectorAll('[data-toggle-group]').forEach((g) => g.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b || !g.contains(b)) return; g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }));

  /* ---------- gallery bridge ---------- */
  addEventListener('message', (e) => {
    if (e.source !== parent || (location.origin !== 'null' && e.origin !== location.origin)) return;
    const d = e.data || {};
    if (d.type === 'go') show(d.screen, d.instant);
    if (d.type === 'state') demo(d.state);
  });
  function demo(state) {
    const scr = screens[current], form = scr && scr.querySelector('form[data-form]');
    scr.querySelectorAll('.is-loading').forEach((b) => setLoading(b, false));
    scr.querySelectorAll('[aria-invalid=true]').forEach((f) => setError(f, ''));
    if (current === 'forgot') { scr.dataset.state = state === 'sent' ? 'sent' : ''; if (state === 'sent') { startCountdown(scr); App.emit('sent', { screen: scr }); } }
    App.emit('demo', { state });
    if (!form || state === 'default' || state === 'sent') return;
    if (state === 'error') {
      const f = form.querySelector('input[type=email], input[data-kind]');
      f.value = f.dataset.demoBad || 'sam@mail';
      setError(f, f.dataset.kind ? 'Enter a valid email or phone number' : f.dataset.msg || "That email doesn't look right");
      App.emit('invalid', { el: f, kind: 'email', form });
    }
    if (state === 'loading') { setLoading(form.querySelector('[type=submit]'), true); App.emit('submit', { form }); }
  }

  App.start = () => { show(location.hash.slice(1) in screens ? location.hash.slice(1) : 'signin', true); requestAnimationFrame(() => html.classList.add('is-ready')); };
  /* themes call App.start() after registering listeners; fall back automatically */
  setTimeout(() => { if (!current) App.start(); }, 0);
})();

/* Fit (added for the Mobile UI Demos site): auth screens never need scrolling.
   If sign-in / sign-up / reset is taller than the device, scale its content just enough
   to fit (never below 88%); safe areas stay exact. Home is a feed and keeps scrolling. */
(() => {
  const fit = () => document.querySelectorAll('.screen[data-screen]').forEach((s) => {
    if (s.dataset.screen === 'home') return;
    s.classList.remove('fit'); s.style.removeProperty('--fit');
    let z = 1;
    for (let i = 0; i < 6; i++) {
      if (s.scrollHeight - s.clientHeight <= 1) break;
      z = Math.max(0.88, z * (s.clientHeight / s.scrollHeight) - 0.004);
      s.classList.add('fit'); s.style.setProperty('--fit', z.toFixed(3));
      if (z <= 0.88) break;
    }
  });
  addEventListener('resize', fit);
  addEventListener('load', fit);
  if (document.fonts) document.fonts.ready.then(fit);
})();
