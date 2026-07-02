/*
 * Inicialización de LiquidGlass para la presentación + toggles de demo:
 *   C — vidrio cristal (sin tinte) ↔ tinte oscuro
 *   M — fondo monocromo (plata) ↔ color
 *   B — cicla el blur del vidrio: 6 → 3 → 0 → 10 px
 *   G — cicla la distorsión: 95 → 130 → 60
 */
(function () {
  const bg = LiquidGlass.background(document.getElementById('bg-canvas'), {
    mono: false,
    speed: 0.045
  });

  // Cristal: sin tinte oscuro — solo distorsión, blur y el canto de vidrio.
  // Un velo blanco casi imperceptible para que el canto tenga de dónde nacer.
  const glass = LiquidGlass.glass({
    selector: '.glass',
    blur: 6,
    scale: 170,       // fuerza del canto refractivo
    edgeWidth: 26,    // ancho de la banda del canto
    turbulence: 20,   // ondulación suave del interior
    tintTop: 'rgba(255,255,255,0.09)',
    tintBottom: 'rgba(255,255,255,0.02)',
    tintTopHover: 'rgba(255,255,255,0.14)',
    tintBottomHover: 'rgba(255,255,255,0.05)'
  });

  // Tinte oscuro alternativo (modo legibilidad, el look anterior)
  const DARK = {
    top: 'rgba(22,26,50,0.60)', bottom: 'rgba(9,11,26,0.44)',
    topH: 'rgba(28,33,62,0.62)', bottomH: 'rgba(12,14,32,0.46)'
  };
  let crystal = true;

  // --- Toast de estado ---
  let toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'lg-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1600);
  }

  // --- Hotkeys de demo ---
  const blurs = [6, 3, 0, 10];
  const scales = [170, 260, 90];
  let bi = 0, gi = 0;

  document.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'c') {
      crystal = !crystal;
      if (crystal) {
        glass.setTint(null); // vuelve a los tintes del init (cristal)
      } else {
        glass.setTint(DARK.top, DARK.bottom, DARK.topH, DARK.bottomH);
      }
      toast(crystal ? 'Vidrio: cristal' : 'Vidrio: tinte oscuro');
    } else if (k === 'm') {
      const mono = !bg.isMono();
      bg.setMono(mono);
      toast(mono ? 'Fondo: monocromo' : 'Fondo: color');
    } else if (k === 'b') {
      bi = (bi + 1) % blurs.length;
      glass.setBlur(blurs[bi]);
      toast('Blur: ' + blurs[bi] + 'px');
    } else if (k === 'g') {
      gi = (gi + 1) % scales.length;
      glass.setScale(scales[gi]);
      toast('Distorsión: ' + scales[gi]);
    }
  });
})();
