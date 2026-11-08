// The Pinterest research images are kept locally and are not published.
// Render a moodboard only when its images exist; never request them on GitHub Pages.
window.moodboard = (el, srcs) => {
  if (!el || !srcs.length || /github\.io$/.test(location.hostname)) return;
  const probe = new Image();
  probe.onload = () => {
    el.innerHTML = srcs.map(s => `<img src="${s}" alt="Pinterest reference" loading="lazy">`).join('');
    document.querySelectorAll('.local-only').forEach(n => { n.hidden = false; });
  };
  probe.src = srcs[0];
};
