/*
 * Motor de slides: transiciones 3D, entradas escalonadas con WAAPI,
 * count-up de cifras y navegación (teclado, rueda, swipe, dots).
 */
(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const dotsContainer = document.getElementById('dots');
  const counter = document.getElementById('counter');
  const progressFill = document.getElementById('progressFill');
  const hint = document.getElementById('hint');
  let current = 0;
  let locked = false;

  // --- Dots ---
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(d);
  });

  // --- Entradas escalonadas ---
  function animateIn(slide) {
    const els = slide.querySelectorAll('[data-anim]');
    els.forEach((el, i) => {
      el.classList.add('animated');
      const kind = el.dataset.anim;
      let keyframes;
      switch (kind) {
        case 'left':
          keyframes = [
            { opacity: 0, transform: 'translateX(-46px)' },
            { opacity: 1, transform: 'translateX(0)' }
          ];
          break;
        case 'right':
          keyframes = [
            { opacity: 0, transform: 'translateX(46px)' },
            { opacity: 1, transform: 'translateX(0)' }
          ];
          break;
        case 'pop':
          keyframes = [
            { opacity: 0, transform: 'scale(0.82)' },
            { opacity: 1, transform: 'scale(1)' }
          ];
          break;
        case 'blur':
          keyframes = [
            { opacity: 0, filter: 'blur(12px)', transform: 'translateY(14px)' },
            { opacity: 1, filter: 'blur(0)', transform: 'translateY(0)' }
          ];
          break;
        default: // 'up'
          keyframes = [
            { opacity: 0, transform: 'translateY(34px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ];
      }
      el.animate(keyframes, {
        duration: 750,
        delay: 250 + i * 110,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both'
      });
    });

    // Count-up de cifras
    slide.querySelectorAll('[data-count]').forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = (el.dataset.count.split('.')[1] || '').length;
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const dur = 1400;
      const t0 = performance.now();
      function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  function resetAnim(slide) {
    slide.querySelectorAll('[data-anim]').forEach((el) => {
      el.classList.remove('animated');
      el.getAnimations().forEach((a) => a.cancel());
    });
  }

  // --- Navegación ---
  function goTo(i) {
    if (locked || i < 0 || i >= slides.length || i === current) return;
    locked = true;

    const out = slides[current];
    const inc = slides[i];

    out.classList.remove('active');
    out.classList.add('leaving');
    resetAnim(out);
    setTimeout(() => out.classList.remove('leaving'), 900);

    current = i;
    inc.classList.add('active');
    inc.scrollTop = 0;
    animateIn(inc);

    document.querySelectorAll('.dot').forEach((d, idx) => d.classList.toggle('active', idx === current));
    counter.textContent = `${current + 1} / ${slides.length}`;
    progressFill.style.width = `${((current + 1) / slides.length) * 100}%`;
    if (hint) hint.style.display = 'none';

    setTimeout(() => (locked = false), 750);
  }

  document.getElementById('prevBtn').addEventListener('click', () => goTo(current - 1));
  document.getElementById('nextBtn').addEventListener('click', () => goTo(current + 1));

  document.addEventListener('keydown', (e) => {
    if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); goTo(current + 1); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); goTo(current - 1); }
    if (e.key === 'Home') goTo(0);
    if (e.key === 'End') goTo(slides.length - 1);
  });

  let touchX = 0, touchY = 0;
  document.addEventListener('touchstart', (e) => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      goTo(current + (dx < 0 ? 1 : -1));
    }
  }, { passive: true });

  let wheelAcc = 0, wheelTimer = null;
  document.addEventListener('wheel', (e) => {
    // Si el slide activo tiene scroll interno pendiente, dejarlo scrollear
    const s = slides[current];
    const canScroll = s.scrollHeight > s.clientHeight;
    if (canScroll) {
      const atTop = s.scrollTop <= 0 && e.deltaY < 0;
      const atBottom = s.scrollTop + s.clientHeight >= s.scrollHeight - 2 && e.deltaY > 0;
      if (!atTop && !atBottom) return;
    }
    wheelAcc += e.deltaY;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => (wheelAcc = 0), 180);
    if (Math.abs(wheelAcc) > 90) {
      goTo(current + (wheelAcc > 0 ? 1 : -1));
      wheelAcc = 0;
    }
  }, { passive: true });

  // --- Init ---
  counter.textContent = `1 / ${slides.length}`;
  progressFill.style.width = `${(1 / slides.length) * 100}%`;
  animateIn(slides[0]);
  setTimeout(() => { if (hint) hint.style.display = 'none'; }, 6000);
})();
