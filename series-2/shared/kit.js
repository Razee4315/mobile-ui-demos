// Series 2 motion kit: springs, a shared animation loop that sleeps off-screen, a pointer that
// wanders when nobody is touching, streamed text, caret tracking, haptics, and screen behaviour.
(function () {
  const root = document.documentElement;
  const q = new URLSearchParams(location.search);
  const os = q.get('os');
  root.classList.add(os ? 'os-' + os : 'os-real');
  if (os) root.classList.add('in-mockup');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Spring ---------- */
  class Spring {
    constructor(value = 0, { stiffness = 170, damping = 18, mass = 1 } = {}) {
      this.value = value; this.target = value; this.v = 0;
      this.k = stiffness; this.c = damping; this.m = mass;
    }
    set(t) { this.target = t; return this; }
    jump(t) { this.value = this.target = t; this.v = 0; return this; }
    kick(v) { this.v += v; return this; }
    step(dt) {
      const steps = Math.ceil(dt / (1 / 120));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        const a = (-this.k * (this.value - this.target) - this.c * this.v) / this.m;
        this.v += a * h; this.value += this.v * h;
      }
      return this.value;
    }
    get idle() { return Math.abs(this.v) < 1e-3 && Math.abs(this.value - this.target) < 1e-3; }
  }

  /* ---------- One rAF loop for the page, paused when off-screen or hidden ---------- */
  const tasks = new Set();
  let visible = true, running = false, last = 0;
  const frame = now => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    tasks.forEach(fn => fn(dt, now / 1000));
    requestAnimationFrame(frame);
  };
  const sync = () => {
    const should = visible && !document.hidden && tasks.size > 0;
    if (should && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    if (!should) running = false;
  };
  const loop = fn => { tasks.add(fn); sync(); return () => { tasks.delete(fn); sync(); }; };
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }).observe(root);
  }

  /* ---------- Pointer: real finger/mouse, or a gentle wander when idle ---------- */
  const pointer = { x: innerWidth / 2, y: innerHeight * 0.4, down: false, active: false, lastMove: -1e9 };
  let wanderT = 0, wanderTarget = { x: innerWidth / 2, y: innerHeight * 0.35 };
  const onMove = e => {
    pointer.x = e.clientX; pointer.y = e.clientY;
    pointer.active = true; pointer.lastMove = performance.now();
  };
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerdown', e => { onMove(e); pointer.down = true; }, { passive: true });
  addEventListener('pointerup', () => { pointer.down = false; }, { passive: true });
  document.addEventListener('pointerleave', () => { pointer.active = false; });
  // gaze(): where characters should look. Real pointer if recent, otherwise a slow wander.
  const gaze = { x: pointer.x, y: pointer.y };
  loop((dt, t) => {
    const idle = performance.now() - pointer.lastMove > 2500;
    if (idle) {
      wanderT -= dt;
      if (wanderT <= 0) {
        wanderT = 1.6 + Math.random() * 2.4;
        wanderTarget = { x: innerWidth * (0.15 + Math.random() * 0.7), y: innerHeight * (0.15 + Math.random() * 0.6) };
      }
      gaze.x += (wanderTarget.x - gaze.x) * Math.min(1, dt * 2.2);
      gaze.y += (wanderTarget.y - gaze.y) * Math.min(1, dt * 2.2);
    } else {
      gaze.x = pointer.x; gaze.y = pointer.y;
    }
  });

  /* ---------- Caret position of a text input, in viewport px ---------- */
  const measureCtx = document.createElement('canvas').getContext('2d');
  const caret = input => {
    const r = input.getBoundingClientRect();
    const cs = getComputedStyle(input);
    measureCtx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const text = input.type === 'password' ? '•'.repeat(input.value.length) : input.value.slice(0, input.selectionStart ?? input.value.length);
    const w = Math.min(measureCtx.measureText(text).width, r.width - 4);
    return { x: r.left + parseFloat(cs.paddingLeft || 0) + w, y: r.top + r.height / 2 };
  };

  /* ---------- Streamed text, LLM-style ---------- */
  const stream = (el, text, { speed = 28, caretEl = true, onDone } = {}) => {
    el._streamId = (el._streamId || 0) + 1;
    const id = el._streamId;
    el.textContent = '';
    const tokens = text.match(/\S+\s*|\s+/g) || [];
    const c = caretEl ? Object.assign(document.createElement('span'), { className: 'stream-caret' }) : null;
    if (c) el.append(c);
    let i = 0;
    if (reduced) { el.textContent = text; onDone && onDone(); return; }
    const tick = () => {
      if (el._streamId !== id) return;
      if (i >= tokens.length) { setTimeout(() => c && c.remove(), 900); onDone && onDone(); return; }
      const span = document.createElement('span');
      span.className = 'tok'; span.textContent = tokens[i++];
      c ? el.insertBefore(span, c) : el.append(span);
      setTimeout(tick, speed + Math.random() * speed * 1.4);
    };
    setTimeout(tick, 120);
  };

  // Vibrate only after a real tap (browsers block and log it otherwise).
  const haptic = (ms = 8) => {
    try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(ms); } catch (e) {}
  };

  /* ---------- Ripple on [data-ripple] ---------- */
  addEventListener('pointerdown', e => {
    const host = e.target.closest('[data-ripple]');
    if (!host) return;
    const r = host.getBoundingClientRect();
    const d = Math.max(r.width, r.height) * 2.2;
    const s = Object.assign(document.createElement('span'), { className: 'ripple' });
    Object.assign(s.style, { left: e.clientX - r.left + 'px', top: e.clientY - r.top + 'px', width: d + 'px', height: d + 'px' });
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.style.overflow = 'hidden';
    host.append(s); setTimeout(() => s.remove(), 750);
  }, { passive: true });

  /* ---------- Screen behaviour: views, password reveal, strength, submit ---------- */
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
  // The panes box takes the height of the active pane (animated), so heroes above can breathe.
  const fitPanes = () => {
    const panes = document.querySelector('.panes');
    const pane = panes && panes.querySelector('.pane.' + root.dataset.view);
    if (pane) panes.style.height = pane.offsetHeight + 'px';
  };
  addEventListener('resize', fitPanes);
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(fitPanes);
    document.querySelectorAll('.pane').forEach(p => ro.observe(p));
  }
  if (document.fonts) document.fonts.ready.then(fitPanes);

  const setView = (v, animate) => {
    if (root.dataset.view === v) return;
    root.dataset.view = v;
    fitPanes();
    if (animate) haptic(6);
    emit('kit:view', { view: v, animate });
  };
  setView(q.get('view') === 'signup' ? 'signup' : 'login', false);
  setTimeout(() => { root.classList.add('ready'); emit('kit:ready'); }, 60);

  document.addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    if (go) { e.preventDefault(); setView(go.dataset.go, true); return; }
    const eye = e.target.closest('[data-eye]');
    if (eye) {
      e.preventDefault();
      const input = eye.closest('.field').querySelector('input');
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      eye.classList.toggle('on', show);
      eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      emit('kit:reveal', { input, show });
      haptic(5);
    }
    if (e.target.closest('[data-fake]')) e.preventDefault();
  });

  document.addEventListener('input', e => {
    const input = e.target.closest('[data-strength]');
    if (!input) return;
    const v = input.value;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/\d/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v) || v.length >= 14) score++;
    emit('kit:strength', { input, score: v ? score : 0 });
    const meter = input.closest('form') && input.closest('form').querySelector('.strength');
    if (meter) meter.dataset.score = v ? score : 0;
  });

  document.addEventListener('submit', e => {
    if (e.defaultPrevented) return;
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('[type=submit]');
    const email = form.querySelector('input[type=email]');
    if (email && email.value && !/^\S+@\S+\.\S+$/.test(email.value)) {
      const f = email.closest('.field') || email;
      f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake');
      haptic([10, 40, 10]);
      emit('kit:error', { input: email });
      return;
    }
    if (!btn || btn.classList.contains('loading')) return;
    btn.classList.add('loading'); haptic(8);
    emit('kit:submit', { form });
    setTimeout(() => { btn.classList.remove('loading'); btn.classList.add('done'); emit('kit:success', { form }); }, 1300);
    setTimeout(() => btn.classList.remove('done'), 2800);
  });

  window.Kit = { Spring, loop, pointer, gaze, caret, stream, haptic, setView, reduced, emit, fitPanes };
})();
