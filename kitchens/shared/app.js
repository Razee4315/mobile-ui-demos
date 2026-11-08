/* Shared runtime for every theme: router + themed transitions, forms, password tools,
   strength meter, reset countdown, parallax, gallery bridge. No dependencies. */
(() => {
  const html = document.documentElement;
  const params = new URLSearchParams(location.search);
  html.dataset.device = params.get('device') || 'web';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  const app = document.querySelector('.app');
  const screens = Object.fromEntries([...document.querySelectorAll('[data-screen]')].map((s) => [s.dataset.screen, s]));
  const ORDER = { signin: 0, signup: 1, forgot: 1, home: 2 };
  const DUR = parseFloat(getComputedStyle(html).getPropertyValue('--route-ms')) || 700;
  let current = null, busy = false;

  function show(name, instant) {
    const next = screens[name];
    if (!next || name === current) return;
    const prev = screens[current];
    app.dataset.dir = current && ORDER[name] < ORDER[current] ? 'back' : 'fwd';
    app.dataset.route = name;
    resetScreen(next);
    if (!prev || instant || reduce.matches) {
      Object.values(screens).forEach((s) => s.classList.remove('is-active', 'enter', 'leave'));
      next.classList.add('is-active');
      next.scrollTop = 0;
    } else {
      busy = true;
      next.scrollTop = 0;
      next.classList.add('is-active', 'enter');
      prev.classList.add('leave');
      setTimeout(() => {
        prev.classList.remove('is-active', 'leave');
        next.classList.remove('enter');
        busy = false;
      }, DUR);
    }
    current = name;
    if (location.hash.slice(1) !== name) history.replaceState(null, '', '#' + name);
    parent !== window && parent.postMessage({ type: 'route', screen: name }, '*');
    const focusTarget = next.querySelector('[data-autofocus]');
    if (focusTarget && !instant) setTimeout(() => focusTarget.focus({ preventScroll: true }), reduce.matches ? 0 : DUR * 0.6);
  }
  const go = (name) => !busy && show(name);
  window.appGo = go;

  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-go]');
    if (link) { e.preventDefault(); go(link.dataset.go); }
  });
  addEventListener('hashchange', () => show(location.hash.slice(1) || 'signin'));

  /* ---------- Fit: auth screens never need scrolling ----------
     If a sign-in / sign-up / forgot screen is taller than the device (e.g. 852px iPhone),
     scale its content just enough to fit (never below 88%). Safe areas stay exact.
     Home is a feed and keeps scrolling. */
  const fit = () => Object.values(screens).forEach((s) => {
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
  document.fonts && document.fonts.ready.then(fit);

  /* ---------- Forms ---------- */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE = /^\+?[\d\s()-]{7,}$/;

  function setError(field, msg) {
    const wrap = field.closest('.field');
    const out = wrap && wrap.querySelector('.field-error');
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    wrap && wrap.classList.toggle('has-error', !!msg);
    if (out) out.textContent = msg || '';
  }

  function validate(form) {
    let firstBad = null;
    form.querySelectorAll('input').forEach((f) => {
      let msg = '';
      const v = f.value.trim();
      if (f.type === 'checkbox') {
        if (f.required && !f.checked) msg = f.dataset.msg || 'Please accept to continue';
      } else if (f.required && !v) msg = f.dataset.msgEmpty || 'This field is required';
      else if (f.dataset.kind === 'email-or-phone' && v && !EMAIL.test(v) && !PHONE.test(v)) msg = 'Enter a valid email or phone number';
      else if (f.type === 'email' && v && !EMAIL.test(v)) msg = f.dataset.msg || "That email doesn't look right";
      else if (f.dataset.minlength && v.length < +f.dataset.minlength) msg = `Use at least ${f.dataset.minlength} characters`;
      setError(f, msg);
      if (msg && !firstBad) firstBad = f;
    });
    if (firstBad) {
      firstBad.focus();
      const card = form.closest('.shake-target') || form;
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    }
    return !firstBad;
  }

  function setLoading(btn, on) {
    btn.classList.toggle('is-loading', on);
    btn.setAttribute('aria-busy', on ? 'true' : 'false');
    btn.disabled = on;
  }

  document.querySelectorAll('form[data-form]').forEach((form) => {
    form.noValidate = true;
    form.addEventListener('input', (e) => e.target.getAttribute('aria-invalid') === 'true' && setError(e.target, ''));
    form.addEventListener('change', (e) => e.target.type === 'checkbox' && setError(e.target, ''));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate(form)) return;
      const btn = form.querySelector('[type=submit]');
      setLoading(btn, true);
      setTimeout(() => {
        setLoading(btn, false);
        if (form.dataset.form === 'forgot') {
          const scr = form.closest('[data-screen]');
          scr.querySelectorAll('[data-sent-email]').forEach((el) => (el.textContent = form.querySelector('input').value.trim()));
          scr.dataset.state = 'sent';
          startCountdown(scr);
        } else go(form.dataset.next || 'home');
      }, 1300);
    });
  });

  /* ---------- Password show / hide ---------- */
  document.querySelectorAll('[data-toggle-pw]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.field').querySelector('input');
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      btn.classList.toggle('is-on', show);
    });
  });

  /* ---------- Strength meter ---------- */
  const LABELS = ['Too short', 'Weak', 'Okay', 'Strong', 'Excellent'];
  function score(v) {
    if (v.length < 6) return v.length ? 1 : 0;
    let s = 1;
    if (v.length >= 10) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/\d/.test(v) && /[^A-Za-z0-9]/.test(v)) s++;
    return Math.min(4, s);
  }
  document.querySelectorAll('input[data-strength]').forEach((input) => {
    const meter = document.getElementById(input.dataset.strength);
    const label = meter.querySelector('[data-meter-label]');
    const custom = meter.dataset.labels ? meter.dataset.labels.split('|') : LABELS;
    const upd = () => {
      const s = input.value ? score(input.value) : 0;
      meter.dataset.level = s;
      meter.style.setProperty('--level', s);
      label.textContent = input.value ? custom[s] : meter.dataset.empty || 'Use 8+ characters with a number & symbol';
    };
    input.addEventListener('input', upd); upd();
  });

  /* ---------- Forgot: success state + resend countdown ---------- */
  let timer;
  function startCountdown(scr) {
    const btn = scr.querySelector('[data-resend]');
    const out = scr.querySelector('[data-count]');
    let n = +(btn.dataset.seconds || 30);
    clearInterval(timer);
    btn.disabled = true; btn.classList.add('is-waiting');
    const tick = () => {
      out.textContent = `0:${String(n).padStart(2, '0')}`;
      scr.style.setProperty('--progress', n / +(btn.dataset.seconds || 30));
      if (n-- <= 0) { clearInterval(timer); btn.disabled = false; btn.classList.remove('is-waiting'); out.textContent = 'now'; }
    };
    tick(); timer = setInterval(tick, 1000);
  }
  document.querySelectorAll('[data-resend]').forEach((btn) => btn.addEventListener('click', () => {
    const scr = btn.closest('[data-screen]');
    btn.classList.add('pulse'); setTimeout(() => btn.classList.remove('pulse'), 600);
    startCountdown(scr);
  }));
  document.querySelectorAll('[data-reset-state]').forEach((b) => b.addEventListener('click', () => {
    const scr = b.closest('[data-screen]'); scr.dataset.state = ''; clearInterval(timer);
  }));

  function resetScreen(scr) {
    if (scr.dataset.screen === 'forgot' && scr.dataset.state === 'sent' && !scr._keep) { scr.dataset.state = ''; clearInterval(timer); }
    scr._keep = false;
    scr.querySelectorAll('[aria-invalid=true]').forEach((f) => setError(f, ''));
  }

  /* ---------- Home: tab bar + chips (visual only) ---------- */
  document.querySelectorAll('[role=tablist]').forEach((list) => list.addEventListener('click', (e) => {
    const tab = e.target.closest('[role=tab]');
    if (!tab) return;
    list.querySelectorAll('[role=tab]').forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
  }));

  /* ---------- Parallax on depth layers ---------- */
  const layers = [...document.querySelectorAll('[data-depth]')];
  if (layers.length) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf;
    addEventListener('pointermove', (e) => {
      if (reduce.matches) return;
      tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2;
      raf = raf || requestAnimationFrame(step);
    });
    function step() {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      layers.forEach((l) => { const d = +l.dataset.depth; l.style.translate = `${(-cx * d).toFixed(2)}px ${(-cy * d).toFixed(2)}px`; });
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(step) : 0;
    }
  }

  /* ---------- Gallery bridge ---------- */
  addEventListener('message', (e) => {
    const d = e.data || {};
    if (d.type === 'go') show(d.screen, d.instant);
    if (d.type === 'state') applyDemoState(d.state);
  });
  function applyDemoState(state) {
    const scr = screens[current];
    const form = scr && scr.querySelector('form[data-form]');
    scr.querySelectorAll('.is-loading').forEach((b) => setLoading(b, false));
    scr.querySelectorAll('[aria-invalid=true]').forEach((f) => setError(f, ''));
    if (current === 'forgot') { scr.dataset.state = state === 'sent' ? 'sent' : ''; if (state === 'sent') startCountdown(scr); }
    if (!form || state === 'default' || state === 'sent') return;
    if (state === 'error') {
      const f = form.querySelector('input[type=email], input[data-kind]');
      f.value = f.dataset.demoBad || 'sam@pizza';
      setError(f, f.dataset.kind ? 'Enter a valid email or phone number' : f.dataset.msg || "That email doesn't look right");
    }
    if (state === 'loading') setLoading(form.querySelector('[type=submit]'), true);
  }

  show(location.hash.slice(1) in screens ? location.hash.slice(1) : 'signin', true);
  requestAnimationFrame(() => html.classList.add('is-ready'));
})();
