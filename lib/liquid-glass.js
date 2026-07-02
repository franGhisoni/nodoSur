/*!
 * LiquidGlass — fondo de aceite iridiscente (WebGL) + tarjetas liquid glass.
 * Sin dependencias. Un solo archivo, importable en cualquier proyecto.
 *
 * Uso:
 *   <canvas id="bg"></canvas>
 *   <div class="glass">...</div>
 *
 *   const bg = LiquidGlass.background(document.getElementById('bg'), {
 *     mono: false,      // true = plata/humo sin color
 *     speed: 0.045,     // velocidad del flujo
 *     renderScale: 0.6  // resolución interna (1 = nativa)
 *   });
 *
 *   const glass = LiquidGlass.glass({
 *     selector: '.glass',
 *     blur: 6,          // px — menos blur = refracción más nítida
 *     scale: 80,        // fuerza de la lente en el canto (px)
 *     edgeWidth: 30,    // ancho de la zona refractiva del borde (px)
 *     turbulence: 14    // ondulación orgánica extra (0 = lente pura)
 *   });
 *
 *   bg.setMono(true);       // transición suave a monocromo
 *   glass.setBlur(3);       // en vivo
 *   glass.setScale(140);    // en vivo
 *   glass.setTint('rgba(22,26,50,0.6)', 'rgba(9,11,26,0.44)'); // o (null) para volver
 *
 * Cómo funciona la refracción de borde: por cada tamaño de card se genera
 * un mapa de desplazamiento (canvas → dataURL) usando la SDF de un
 * rectángulo redondeado: neutro en el centro, vector normal saliente cerca
 * del canto. feDisplacementMap lo aplica sobre el backdrop ya difuminado.
 * Chromium ignora filtros SVG dentro de backdrop-filter, por eso el filtro
 * va como `filter:` del pseudo-elemento (su backdrop filtrado es su contenido).
 *
 * Requisitos: Chromium para la refracción; en otros navegadores degrada a
 * blur común. El canvas de fondo debe estar detrás del contenido.
 */
(function (global) {
  'use strict';

  /* ================= FONDO WEBGL ================= */

  var VERT = [
    'attribute vec2 a_pos;',
    'void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }'
  ].join('\n');

  var FRAG = [
    'precision highp float;',
    'uniform vec2 u_res;',
    'uniform float u_time;',
    'uniform vec2 u_mouse;',
    'uniform float u_mono;',
    '',
    'float hash(vec2 p) {',
    '  p = fract(p * vec2(123.34, 456.21));',
    '  p += dot(p, p + 45.32);',
    '  return fract(p.x * p.y);',
    '}',
    '',
    'float noise(vec2 p) {',
    '  vec2 i = floor(p);',
    '  vec2 f = fract(p);',
    '  vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(',
    '    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),',
    '    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),',
    '    u.y',
    '  );',
    '}',
    '',
    'float fbm(vec2 p) {',
    '  float v = 0.0;',
    '  float a = 0.5;',
    '  mat2 rot = mat2(0.87, -0.48, 0.48, 0.87);',
    '  for (int i = 0; i < 5; i++) {',
    '    v += a * noise(p);',
    '    p = rot * p * 2.0 + vec2(1.7, 4.1);',
    '    a *= 0.5;',
    '  }',
    '  return v;',
    '}',
    '',
    'void main() {',
    '  vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);',
    '  uv += (u_mouse - 0.5) * 0.25;',
    '',
    '  float t = u_time;',
    '',
    '  vec2 q = vec2(',
    '    fbm(uv * 1.1 + vec2(t, -t * 0.7)),',
    '    fbm(uv * 1.1 + vec2(5.2, 1.3) - t)',
    '  );',
    '  vec2 r = vec2(',
    '    fbm(uv + 3.2 * q + vec2(1.7, 9.2) + 0.20 * t),',
    '    fbm(uv + 3.2 * q + vec2(8.3, 2.8) - 0.15 * t)',
    '  );',
    '  float f = fbm(uv * 1.3 + 3.0 * r);',
    '',
    '  float phase = fract(f * 1.15 + r.x * 0.55 + q.y * 0.3 + t * 0.12);',
    '  vec3 cCyan    = vec3(0.00, 0.90, 0.80);',
    '  vec3 cBlue    = vec3(0.05, 0.55, 0.98);',
    '  vec3 cViolet  = vec3(0.55, 0.30, 0.95);',
    '  vec3 cMagenta = vec3(0.95, 0.30, 0.72);',
    '  vec3 irid = mix(cCyan, cBlue, smoothstep(0.00, 0.33, phase));',
    '  irid = mix(irid, cViolet,  smoothstep(0.33, 0.66, phase));',
    '  irid = mix(irid, cMagenta, smoothstep(0.66, 0.92, phase));',
    '  irid = mix(irid, cCyan,    smoothstep(0.92, 1.00, phase));',
    '',
    '  irid += vec3(0.85, 0.90, 1.0) * smoothstep(0.72, 0.98, f) * 0.30;',
    '',
    '  float intensity = smoothstep(0.18, 0.92, f);',
    '  vec3 base = vec3(0.012, 0.014, 0.035);',
    '  vec3 col = base + irid * intensity * 0.55;',
    '',
    '  float lum = dot(col, vec3(0.299, 0.587, 0.114));',
    '  vec3 mono = vec3(lum * 1.45) + vec3(0.9) * smoothstep(0.78, 0.98, f) * 0.22;',
    '  col = mix(col, mono, clamp(u_mono, 0.0, 1.0));',
    '',
    '  float vig = 1.0 - 0.55 * dot(uv * 0.62, uv * 0.62);',
    '  col *= clamp(vig, 0.25, 1.0);',
    '',
    '  col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;',
    '',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function background(canvas, opts) {
    var cfg = Object.assign({
      mono: false,
      speed: 0.045,
      renderScale: 0.6
    }, opts || {});

    var gl = canvas.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) {
      canvas.style.display = 'none';
      document.body.classList.add('no-webgl');
      return { setMono: function () {}, isMono: function () { return false; }, destroy: function () {} };
    }

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('[LiquidGlass]', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, 'u_res');
    var uTime = gl.getUniformLocation(prog, 'u_time');
    var uMouse = gl.getUniformLocation(prog, 'u_mouse');
    var uMono = gl.getUniformLocation(prog, 'u_mono');

    function resize() {
      canvas.width = Math.floor(innerWidth * devicePixelRatio * cfg.renderScale);
      canvas.height = Math.floor(innerHeight * devicePixelRatio * cfg.renderScale);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    addEventListener('resize', resize);

    var mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5;
    function onPointer(e) {
      tx = e.clientX / innerWidth;
      ty = 1.0 - e.clientY / innerHeight;
    }
    addEventListener('pointermove', onPointer);

    var monoNow = cfg.mono ? 1 : 0;
    var monoTarget = monoNow;

    var raf = 0;
    var start = performance.now();
    function frame(now) {
      mx += (tx - mx) * 0.03;
      my += (ty - my) * 0.03;
      monoNow += (monoTarget - monoNow) * 0.05;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, ((now - start) / 1000) * cfg.speed);
      gl.uniform2f(uMouse, mx, my);
      gl.uniform1f(uMono, monoNow);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return {
      setMono: function (on) { monoTarget = on ? 1 : 0; },
      isMono: function () { return monoTarget === 1; },
      destroy: function () {
        cancelAnimationFrame(raf);
        removeEventListener('resize', resize);
        removeEventListener('pointermove', onPointer);
      }
    };
  }

  /* ================= TARJETAS LIQUID GLASS ================= */

  var FILTER_ID = 'lg-lens';
  var EDGE_FILTER_ID = 'lg-lens-edge';

  /*
   * IMPORTANTE (Chromium): en la vía backdrop-filter + filter solo sobrevive
   * la cadena feTurbulence → feGaussianBlur → feDisplacementMap. Cualquier
   * feColorMatrix / feOffset / feComposite / feImage leyendo SourceGraphic
   * hace que Chromium descarte silenciosamente TODO el efecto.
   *
   * Por eso la refracción de borde no se hace con un mapa de lente dentro
   * del filtro, sino con DOS capas:
   *   · ::before — vidrio base: blur + ondulación suave en toda la card.
   *   · .lg-edge — un anillo (mask ring de `edgeWidth` px) con displacement
   *     de baja frecuencia y escala alta: curvas amplias solo en el canto,
   *     que es lo que da el efecto tridimensional de vidrio grueso.
   */
  function buildFilters(ns, cfg) {
    var frag = document.createDocumentFragment();

    var base = document.createElementNS(ns, 'filter');
    base.setAttribute('id', FILTER_ID);
    base.setAttribute('x', '-20%');
    base.setAttribute('y', '-20%');
    base.setAttribute('width', '140%');
    base.setAttribute('height', '140%');
    base.setAttribute('color-interpolation-filters', 'sRGB');
    base.innerHTML =
      '<feTurbulence type="fractalNoise" baseFrequency="' + cfg.frequency + '" numOctaves="2" seed="11" result="noise"/>' +
      '<feGaussianBlur in="noise" stdDeviation="1.6" result="soft"/>' +
      '<feDisplacementMap class="lg-disp-base" in="SourceGraphic" in2="soft" scale="' + cfg.turbulence + '" xChannelSelector="R" yChannelSelector="G"/>';
    frag.appendChild(base);

    var edge = document.createElementNS(ns, 'filter');
    edge.setAttribute('id', EDGE_FILTER_ID);
    edge.setAttribute('x', '-30%');
    edge.setAttribute('y', '-30%');
    edge.setAttribute('width', '160%');
    edge.setAttribute('height', '160%');
    edge.setAttribute('color-interpolation-filters', 'sRGB');
    edge.innerHTML =
      '<feTurbulence type="fractalNoise" baseFrequency="' + cfg.edgeFrequency + '" numOctaves="1" seed="4" result="n"/>' +
      '<feGaussianBlur in="n" stdDeviation="2" result="s"/>' +
      '<feDisplacementMap class="lg-disp-edge" in="SourceGraphic" in2="s" scale="' + cfg.scale + '" xChannelSelector="R" yChannelSelector="G"/>';
    frag.appendChild(edge);

    return frag;
  }

  function glassCSS(cfg) {
    var sel = cfg.selector;
    return [
      sel + '{position:relative;overflow:hidden;border:none;border-radius:' + cfg.radius + 'px;',
      'background:linear-gradient(150deg,var(--lg-tint-top,' + cfg.tintTop + '),var(--lg-tint-bottom,' + cfg.tintBottom + '));',
      'box-shadow:0 20px 50px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.32),',
      'inset 0 14px 28px -14px rgba(255,255,255,.10),inset 0 -16px 30px -16px rgba(0,0,0,.45);',
      'transition:box-shadow .45s ease,background .45s ease;}',

      /* Capa de refracción: backdrop-filter difumina; filter:url() dobla el resultado. */
      sel + '::before{content:"";position:absolute;inset:0;border-radius:inherit;',
      'backdrop-filter:blur(var(--lg-blur,' + cfg.blur + 'px)) saturate(' + cfg.saturate + ') brightness(' + cfg.brightness + ');',
      '-webkit-backdrop-filter:blur(var(--lg-blur,' + cfg.blur + 'px)) saturate(' + cfg.saturate + ') brightness(' + cfg.brightness + ');',
      'filter:url(#' + FILTER_ID + ');',
      'background:radial-gradient(240px circle at var(--px,50%) var(--py,-30%),rgba(255,255,255,calc(.16*var(--spec,0))),transparent 62%),',
      'linear-gradient(180deg,rgba(255,255,255,.075),transparent 46%);',
      'pointer-events:none;transition:background .2s ease;z-index:0;}',

      /* Anillo de refracción del canto: displacement agresivo de baja
         frecuencia, con mask de degradado que se DESVANECE hacia el centro
         (un corte duro deja una costura rectangular visible). El mask son
         dos gradientes (bandas horizontales + verticales) que se unen:
         mask-composite por defecto es "add" = unión = marco con fade. */
      sel + '>.lg-edge{position:absolute;inset:0;border-radius:inherit;z-index:1;pointer-events:none;',
      'backdrop-filter:blur(3px) saturate(1.4) brightness(1.04);',
      '-webkit-backdrop-filter:blur(3px) saturate(1.4) brightness(1.04);',
      'filter:url(#' + EDGE_FILTER_ID + ');',
      '-webkit-mask-image:linear-gradient(to right,#000 0,#000 5px,transparent ' + cfg.edgeWidth + 'px,transparent calc(100% - ' + cfg.edgeWidth + 'px),#000 calc(100% - 5px),#000 100%),',
      'linear-gradient(to bottom,#000 0,#000 5px,transparent ' + cfg.edgeWidth + 'px,transparent calc(100% - ' + cfg.edgeWidth + 'px),#000 calc(100% - 5px),#000 100%);',
      'mask-image:linear-gradient(to right,#000 0,#000 5px,transparent ' + cfg.edgeWidth + 'px,transparent calc(100% - ' + cfg.edgeWidth + 'px),#000 calc(100% - 5px),#000 100%),',
      'linear-gradient(to bottom,#000 0,#000 5px,transparent ' + cfg.edgeWidth + 'px,transparent calc(100% - ' + cfg.edgeWidth + 'px),#000 calc(100% - 5px),#000 100%);}',

      /* Canto de vidrio iluminado */
      sel + '::after{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.4px;',
      'background:linear-gradient(135deg,rgba(255,255,255,.60),rgba(255,255,255,.09) 28%,rgba(255,255,255,.03) 52%,rgba(255,255,255,.14) 78%,rgba(255,255,255,.45));',
      '-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);',
      '-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);',
      'mask-composite:exclude;pointer-events:none;z-index:1;}',

      sel + ':hover{background:linear-gradient(150deg,var(--lg-tint-top-hover,' + cfg.tintTopHover + '),var(--lg-tint-bottom-hover,' + cfg.tintBottomHover + '));',
      'box-shadow:0 26px 64px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.04),inset 0 1px 0 rgba(255,255,255,.42),',
      'inset 0 14px 28px -14px rgba(255,255,255,.14),inset 0 -16px 30px -16px rgba(0,0,0,.45);}',

      sel + '>*{position:relative;z-index:2;}'
    ].join('');
  }

  function glass(opts) {
    var cfg = Object.assign({
      selector: '.glass',
      blur: 6,
      saturate: 1.85,
      brightness: 1.07,
      scale: 170,               // fuerza del displacement del canto (px)
      edgeWidth: 26,            // ancho de la banda refractiva (px)
      edgeFrequency: '0.006 0.009', // baja frecuencia = curvas amplias de lente
      turbulence: 20,           // ondulación suave del interior (0 = quieto)
      frequency: '0.012 0.02',
      radius: 24,
      tintTop: 'rgba(22,26,50,0.60)',
      tintBottom: 'rgba(9,11,26,0.44)',
      tintTopHover: 'rgba(28,33,62,0.62)',
      tintBottomHover: 'rgba(12,14,32,0.46)'
    }, opts || {});

    // Hoja de estilos del componente
    var style = document.createElement('style');
    style.setAttribute('data-liquid-glass', cfg.selector);
    style.textContent = glassCSS(cfg);
    document.head.appendChild(style);
    document.documentElement.style.setProperty('--lg-blur', cfg.blur + 'px');

    // Dos filtros SVG compartidos por todas las cards
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';
    svg.style.pointerEvents = 'none';
    var defs = document.createElementNS(ns, 'defs');
    if (!document.getElementById(FILTER_ID)) {
      defs.appendChild(buildFilters(ns, cfg));
    }
    svg.appendChild(defs);
    document.body.appendChild(svg);

    // Inyecta la capa de anillo refractivo en cada card
    function addEdgeLayers() {
      document.querySelectorAll(cfg.selector).forEach(function (el) {
        if (!el.querySelector(':scope > .lg-edge')) {
          var edge = document.createElement('div');
          edge.className = 'lg-edge';
          edge.setAttribute('aria-hidden', 'true');
          el.appendChild(edge);
        }
      });
    }
    addEdgeLayers();

    // Especular que sigue al puntero — delegado, funciona con DOM dinámico
    var hovered = null;
    function onMove(e) {
      var card = e.target && e.target.closest ? e.target.closest(cfg.selector) : null;
      if (hovered && hovered !== card) hovered.style.setProperty('--spec', '0');
      hovered = card;
      if (card) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--px', ((e.clientX - r.left) / r.width) * 100 + '%');
        card.style.setProperty('--py', ((e.clientY - r.top) / r.height) * 100 + '%');
        card.style.setProperty('--spec', '1');
      }
    }
    document.addEventListener('pointermove', onMove);

    return {
      setBlur: function (px) {
        document.documentElement.style.setProperty('--lg-blur', px + 'px');
      },
      setScale: function (n) {
        cfg.scale = n;
        svg.querySelectorAll('.lg-disp-edge').forEach(function (d) {
          d.setAttribute('scale', String(n));
        });
      },
      /* Regenera capas de anillo (llamar si aparecen cards nuevas) */
      refresh: addEdgeLayers,
      /* Cambia el tinte en vivo. Pasar null para volver al del init. */
      setTint: function (top, bottom, topHover, bottomHover) {
        var r = document.documentElement.style;
        if (top == null) {
          r.removeProperty('--lg-tint-top');
          r.removeProperty('--lg-tint-bottom');
          r.removeProperty('--lg-tint-top-hover');
          r.removeProperty('--lg-tint-bottom-hover');
          return;
        }
        r.setProperty('--lg-tint-top', top);
        r.setProperty('--lg-tint-bottom', bottom || top);
        r.setProperty('--lg-tint-top-hover', topHover || top);
        r.setProperty('--lg-tint-bottom-hover', bottomHover || bottom || top);
      },
      destroy: function () {
        document.removeEventListener('pointermove', onMove);
        style.remove();
        svg.remove();
      }
    };
  }

  global.LiquidGlass = { background: background, glass: glass };
})(typeof window !== 'undefined' ? window : this);
