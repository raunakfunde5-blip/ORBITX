(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const lowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4);

  window.ORBITX_PERFORMANCE = Object.freeze({
    prefersReducedMotion: prefersReducedMotion.matches,
    lowPowerDevice: Boolean(lowPower),
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.75),
    animationInterval: prefersReducedMotion.matches ? 50 : lowPower ? 28 : 16
  });

  window.addEventListener('orbitx:module-error', event => {
    const canvas = document.querySelector(event.detail?.canvas || '');
    if (!canvas) return;
    canvas.classList.add('module-unavailable');
    canvas.setAttribute('aria-label', `${event.detail?.name || 'Module'} unavailable`);
  });

  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('orbitx-tab-hidden', document.hidden);
  });
})();
