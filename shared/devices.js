// Turns <div class="device" data-os="ios|android" data-src="screen.html?view=login" data-bar="light|dark"></div>
// into a scaled phone mockup with a live iframe inside.
(function () {
  const SIZE = { ios: { w: 393 + 26, h: 852 + 26 }, android: { w: 412 + 20, h: 915 + 20 } };

  const ICONS = {
    ios: `
      <svg width="19" height="12" viewBox="0 0 19 12"><rect x="0" y="8" width="3.2" height="4" rx="1"/><rect x="5" y="5.5" width="3.2" height="6.5" rx="1"/><rect x="10" y="3" width="3.2" height="9" rx="1"/><rect x="15" y="0" width="3.2" height="12" rx="1"/></svg>
      <svg width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 2.4c2.4 0 4.6.9 6.3 2.5l1.3-1.3A10.7 10.7 0 0 0 8.5.5C5.6.5 2.9 1.6.9 3.6l1.3 1.3A8.9 8.9 0 0 1 8.5 2.4Zm0 3.7c1.4 0 2.7.5 3.7 1.4l1.3-1.3a7.1 7.1 0 0 0-10 0l1.3 1.3c1-.9 2.3-1.4 3.7-1.4Zm0 3.6c-.5 0-1 .2-1.3.6L8.5 11.6l1.3-1.3c-.3-.4-.8-.6-1.3-.6Z"/></svg>
      <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2.5"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" opacity=".45"/></svg>`,
    android: `
      <svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 21 0 7.5C3.3 4.7 7.4 3 12 3s8.7 1.7 12 4.5L12 21Z"/></svg>
      <svg width="16" height="16" viewBox="0 0 24 24"><path d="M2 22 22 2v20H2Z"/></svg>
      <svg width="10" height="16" viewBox="0 0 10 18"><rect x="0" y="2" width="10" height="16" rx="1.6"/><rect x="3" y="0" width="4" height="2.5" rx=".6"/></svg>`,
  };

  function build(el) {
    const os = el.dataset.os === 'android' ? 'android' : 'ios';
    const src = el.dataset.src + (el.dataset.src.includes('?') ? '&' : '?') + 'os=' + os;
    const label = el.dataset.label || 'App screen';
    const buttons = os === 'ios'
      ? '<i class="btn action"></i><i class="btn vol-up"></i><i class="btn vol-dn"></i><i class="btn power"></i>'
      : '<i class="btn power"></i><i class="btn vol"></i>';
    el.innerHTML = `
      <div class="device-scale">
        <div class="frame ${os}">
          ${buttons}
          <div class="screen">
            <iframe src="${src}" title="${label}"></iframe>
            <div class="statusbar"><span>9:41</span><span class="icons">${ICONS[os]}</span></div>
            <div class="homebar"></div>
          </div>
          ${os === 'ios' ? '<div class="island"></div>' : '<div class="punch"></div>'}
          <div class="glare"></div>
        </div>
      </div>`;
    const { w, h } = SIZE[os];
    const fit = () => {
      const s = el.clientWidth / w;
      el.style.setProperty('--s', s);
      el.style.height = h * s + 'px';
    };
    new ResizeObserver(fit).observe(el);
    fit();
  }

  document.querySelectorAll('.device').forEach(build);
})();
