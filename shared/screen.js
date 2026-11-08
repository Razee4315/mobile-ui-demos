// Shared behaviour for every app screen: OS safe areas, login <-> sign up switching,
// password reveal, strength meter, fake submit. Screens work standalone on a real phone too.
(function () {
  const root = document.documentElement;
  const q = new URLSearchParams(location.search);
  const os = q.get('os');
  root.classList.add(os ? 'os-' + os : 'os-real');
  if (os) root.classList.add('in-mockup');

  // Publishes --head-bottom and --content-top (px) so hero art can sit in the free space between them.
  const measure = () => {
    const head = document.querySelector('[data-head]') || document.querySelector('header');
    const panes = document.querySelector('.panes');
    const pane = panes && panes.querySelector('.pane.' + root.dataset.view);
    if (head) root.style.setProperty('--head-bottom', head.getBoundingClientRect().bottom + 'px');
    const content = document.querySelector('[data-content]');
    if (content) {
      root.style.setProperty('--content-top', content.getBoundingClientRect().top + 'px');
    } else if (pane && pane.firstElementChild) {
      root.style.setProperty('--content-top', panes.getBoundingClientRect().top + pane.firstElementChild.offsetTop + 'px');
    }
  };
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if (document.fonts) document.fonts.ready.then(measure);

  const setView = (v, animate) => {
    if (root.dataset.view === v) return;
    if (animate) {
      root.classList.add('switching');
      setTimeout(() => root.classList.remove('switching'), 700);
    }
    root.dataset.view = v;
    measure();
  };
  setView(q.get('view') === 'signup' ? 'signup' : 'login', false);
  setTimeout(() => root.classList.add('ready'), 40);

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
    }
    const fake = e.target.closest('[data-fake]');
    if (fake) e.preventDefault();
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
    const meter = input.closest('form').querySelector('.strength');
    if (meter) {
      meter.dataset.score = v ? score : 0;
      const label = meter.querySelector('.strength-label');
      if (label) label.textContent = v ? ['Too short', 'Weak', 'Okay', 'Strong', 'Excellent'][score] : '';
    }
  });

  document.addEventListener('submit', e => {
    e.preventDefault();
    const btn = e.target.querySelector('[type=submit]');
    if (!btn || btn.classList.contains('loading')) return;
    btn.classList.add('loading');
    setTimeout(() => { btn.classList.remove('loading'); btn.classList.add('done'); }, 1300);
    setTimeout(() => btn.classList.remove('done'), 2600);
  });
})();
