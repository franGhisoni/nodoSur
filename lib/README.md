# LiquidGlass

Fondo de aceite iridiscente (WebGL) + tarjetas liquid glass estilo Apple, en un solo archivo sin dependencias: [`liquid-glass.js`](liquid-glass.js).

## Uso mínimo

```html
<canvas id="bg" style="position:fixed;inset:0;width:100%;height:100%;z-index:0;"></canvas>
<div class="glass" style="position:relative;z-index:1;padding:32px;">Hola</div>

<script src="liquid-glass.js"></script>
<script>
  const bg = LiquidGlass.background(document.getElementById('bg'));
  const glass = LiquidGlass.glass({ selector: '.glass' });
</script>
```

No hace falta CSS propio: `LiquidGlass.glass()` inyecta los estilos del vidrio
(tinte, refracción, canto iluminado, brillo especular que sigue al mouse) para
el selector que le pases. Solo definí vos el layout (padding, tamaño, grid).

## Opciones

### `LiquidGlass.background(canvas, opts)`

| Opción | Default | Qué hace |
|---|---|---|
| `mono` | `false` | `true` = plata/humo monocromo |
| `speed` | `0.045` | Velocidad del flujo |
| `renderScale` | `0.6` | Resolución interna (1 = nativa; 0.5 = más liviano) |

Devuelve `{ setMono(bool), isMono(), destroy() }`. `setMono` transiciona suave.

### `LiquidGlass.glass(opts)`

| Opción | Default | Qué hace |
|---|---|---|
| `selector` | `'.glass'` | A qué elementos aplicar el vidrio |
| `blur` | `6` | Blur del backdrop en px — menos blur = refracción más nítida |
| `scale` | `170` | Fuerza del displacement del canto (px de doblado) |
| `edgeWidth` | `26` | Ancho de la banda refractiva del borde (px) |
| `edgeFrequency` | `'0.006 0.009'` | Frecuencia del canto — más baja = curvas más amplias |
| `turbulence` | `20` | Ondulación suave del interior (0 = interior quieto) |
| `radius` | `24` | Border-radius de las cards |
| `tintTop` / `tintBottom` | azul oscuro | Tinte del vidrio (cualquier color CSS, o blancos suaves para cristal) |

Devuelve `{ setBlur(px), setScale(n), setTint(...), refresh(), destroy() }` —
todo ajustable en vivo. `refresh()` inyecta la capa de canto en cards nuevas.

## Cómo funciona la refracción

Chromium **ignora** filtros SVG dentro de `backdrop-filter`, y en la vía
combinada `backdrop-filter` + `filter` solo tolera la cadena
`feTurbulence → feGaussianBlur → feDisplacementMap` (cualquier
`feColorMatrix` / `feOffset` / `feComposite` / `feImage` que lea
`SourceGraphic` descarta el efecto en silencio). Por eso el vidrio se arma
en **tres capas**:

```text
.card::before   vidrio base: backdrop blur + ondulación suave (turbulencia)
.card > .lg-edge anillo del canto: mask ring de `edgeWidth` px con displacement
                de baja frecuencia y escala alta → la refracción agresiva del
                borde que da el efecto tridimensional (la inyecta la lib)
.card::after    canto de vidrio iluminado (borde de gradiente con mask)
```

El contenido real de la card vive por encima (`z-index: 2`), así que nunca
se deforma; solo el fondo se dobla.

## Limitaciones

- Refracción solo en Chromium (Chrome, Edge, Brave…). Safari/Firefox degradan a blur común.
- No animar el `scale` de los filtros por frame: invalida el backdrop de todas las cards y ahoga el compositor.
- El canvas debe estar detrás del contenido y el contenido de las cards como hijos directos (la lib les da `z-index: 2`).
- Si agregás cards al DOM después del init, llamá `glass.refresh()`.
