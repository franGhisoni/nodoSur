/*
 * Fondo animado con WebGL — simulación de película de aceite / burbuja de jabón.
 * Domain-warped FBM con paleta iridiscente, respondiendo suavemente al mouse.
 */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });

  if (!gl) {
    // Fallback: gradiente CSS si no hay WebGL
    canvas.style.display = 'none';
    document.body.classList.add('no-webgl');
    return;
  }

  const VERT = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const FRAG = `
    precision highp float;
    uniform vec2 u_res;
    uniform float u_time;
    uniform vec2 u_mouse;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      mat2 rot = mat2(0.87, -0.48, 0.48, 0.87);
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p = rot * p * 2.0 + vec2(1.7, 4.1);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);
      uv += (u_mouse - 0.5) * 0.25;

      float t = u_time * 0.045;

      // Domain warping en dos niveles — el flujo "aceitoso"
      vec2 q = vec2(
        fbm(uv * 1.1 + vec2(t, -t * 0.7)),
        fbm(uv * 1.1 + vec2(5.2, 1.3) - t)
      );
      vec2 r = vec2(
        fbm(uv + 3.2 * q + vec2(1.7, 9.2) + 0.20 * t),
        fbm(uv + 3.2 * q + vec2(8.3, 2.8) - 0.15 * t)
      );
      float f = fbm(uv * 1.3 + 3.0 * r);

      // Paleta controlada: cian → azul → violeta → magenta (nada de verde/rojo puro)
      float phase = fract(f * 1.15 + r.x * 0.55 + q.y * 0.3 + t * 0.12);
      vec3 cCyan    = vec3(0.00, 0.90, 0.80);
      vec3 cBlue    = vec3(0.05, 0.55, 0.98);
      vec3 cViolet  = vec3(0.55, 0.30, 0.95);
      vec3 cMagenta = vec3(0.95, 0.30, 0.72);
      vec3 irid = mix(cCyan, cBlue, smoothstep(0.00, 0.33, phase));
      irid = mix(irid, cViolet,  smoothstep(0.33, 0.66, phase));
      irid = mix(irid, cMagenta, smoothstep(0.66, 0.92, phase));
      irid = mix(irid, cCyan,    smoothstep(0.92, 1.00, phase));

      // Brillo nacarado tipo pompa de jabón en las crestas
      irid += vec3(0.85, 0.90, 1.0) * smoothstep(0.72, 0.98, f) * 0.30;

      float intensity = smoothstep(0.18, 0.92, f);
      vec3 base = vec3(0.012, 0.014, 0.035);
      vec3 col = base + irid * intensity * 0.55;

      // Viñeta para legibilidad del contenido
      float vig = 1.0 - 0.55 * dot(uv * 0.62, uv * 0.62);
      col *= clamp(vig, 0.25, 1.0);

      // Dithering leve contra banding
      col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  // Render a media resolución: el blur natural del ruido lo disimula y ahorra GPU
  const SCALE = 0.6;
  function resize() {
    canvas.width = Math.floor(innerWidth * devicePixelRatio * SCALE);
    canvas.height = Math.floor(innerHeight * devicePixelRatio * SCALE);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  addEventListener('resize', resize);

  // Mouse con inercia
  let mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5;
  addEventListener('pointermove', (e) => {
    tx = e.clientX / innerWidth;
    ty = 1.0 - e.clientY / innerHeight;
  });

  const start = performance.now();
  function frame(now) {
    mx += (tx - mx) * 0.03;
    my += (ty - my) * 0.03;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (now - start) / 1000);
    gl.uniform2f(uMouse, mx, my);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
