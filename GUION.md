# Guion — Presentación NodoSur Cloud (15 min · 2 personas)

**Reparto:** Persona **A** abre y cierra; Persona **B** lleva la parte de decisiones técnicas y gestión.
**Tiempos:** A ≈ 8 min · B ≈ 7 min. Cada slide tiene su texto; `→` marca el pase de slide.
**Regla de oro:** el slide muestra el dato, vos decís el *porqué*. Nunca leer la pantalla.

---

## PERSONA A — Apertura y marco conceptual (min 0 a 4)

### Slide 1 · Portada (30 s)
> Buenas. Somos NodoSur Cloud, una empresa que está construyendo su primer datacenter en el Parque Industrial Pilar. Hoy les vamos a presentar el Sistema de Gestión Integrado del proyecto: ambiental bajo ISO 14001, seguridad e higiene bajo Ley 19.587 e ISO 45001, y ergonomía con método REBA. Pero antes de hablar de gestión, necesitamos que quede claro qué es exactamente lo que vamos a operar.

→

### Slide 2 · ¿Qué es un datacenter? (45 s)
> Un datacenter es una instalación física dedicada a alojar y proteger equipos de cómputo, almacenamiento y red, garantizando disponibilidad continua. La diferencia con una oficina que tiene servidores es de diseño: acá el edificio entero se concibe para sostener cargas eléctricas y térmicas intensivas, con redundancia ante fallas y control estricto de acceso.
>
> Comercialmente operamos tres modelos: housing, donde el cliente trae su hardware y nosotros ponemos el espacio; colocation, donde compartimos infraestructura eléctrica y de conectividad; y cloud privado, donde el cliente consume cómputo como servicio. NodoSur combina los tres.

→

### Slide 3 · Características distintivas (45 s)
> ¿Por qué un datacenter no se gestiona como cualquier planta industrial? Cinco propiedades lo hacen único. Consume electricidad de forma ininterrumpida, 24 por 365 — no hay ciclos de producción ni paradas de planta. Tiene tolerancia cero a interrupciones: un corte de segundos implica pérdida de datos e incumplimiento de contratos SLA. Necesita dos infraestructuras críticas a la vez — energía y refrigeración — y la falla de cualquiera compromete todo. Escala por módulos, así que hay que dimensionar por adelantado. Y tiene vida útil dual: el edificio dura 20 a 30 años, pero el hardware se renueva cada 3 a 7 — eso, como van a ver, define nuestro problema de residuos electrónicos.

→

### Slide 4 · Requerimientos técnicos (45 s)
> Todo datacenter, sin importar su tamaño, debe cumplir cinco requerimientos no negociables. Suministro eléctrico redundante: red, más UPS que cubren el hueco hasta que arrancan los generadores — el nivel de redundancia se expresa como N, N+1 o 2N. Refrigeración de precisión entre 18 y 27 grados según ASHRAE. Conectividad por múltiples proveedores y rutas físicas distintas. Seguridad física por capas. Y detección y supresión de incendios que no destruya los equipos ni ponga en riesgo a las personas — un sprinkler común acá sería tan destructivo como el incendio.

→

### Slide 5 · Infraestructura (45 s)
> Esta lámina es el mapa de todo lo que sigue en la presentación, porque cada sistema de soporte es el origen de un aspecto ambiental o de un riesgo laboral. La sala de servidores es el mayor consumidor de energía. El sistema eléctrico es el origen del riesgo de arco. Las baterías del UPS son residuo peligroso al final de su vida. Los generadores emiten combustión y almacenan gasoil. La refrigeración consume agua y usa refrigerantes de alto potencial de calentamiento. Y el BMS con DCIM es lo que nos permite medir PUE y WUE — sin medición no hay sistema de gestión posible.
>
> **[Pase]** Ahora [B] les cuenta la decisión de diseño más importante del proyecto: el nivel de confiabilidad.

→

---

## PERSONA B — Confiabilidad, costos y empresa (min 4 a 7)

### Slide 6 · Tiers: disponibilidad vs. costo (75 s)
> La confiabilidad se clasifica con el sistema de Tiers del Uptime Institute. En el gráfico de la izquierda — ojo que la escala arranca en 99.60, no en cero — se ve el salto real: Tier I, sin redundancia, permite hasta 28.8 horas de corte al año. Tier II mejora poco. El salto grande es Tier III: mantenimiento concurrente con redundancia N+1 — se interviene cualquier equipo sin apagar el servicio — y el corte máximo baja a 1.6 horas anuales. Tier IV duplica absolutamente todo para llegar a 26 minutos.
>
> ¿Y por qué elegimos Tier III y no IV? Por el gráfico de la derecha. Tomando Tier I como índice 1, construir Tier III cuesta alrededor de 1.5 veces; Tier IV se va a 2.2. Es decir: pasar de III a IV significa un 50% más de CAPEX — duplicar toda la infraestructura — para ganar un centésimo de punto de disponibilidad. Tier III ya captura el 99.7% de la reducción de downtime de Tier IV, a dos tercios de su costo. Para los SLA de banca regional y Estado provincial, 99.98% es más que suficiente. Es el óptimo técnico-económico para una PYME.

→

### Slide 7 · La empresa (40 s)
> ¿Quiénes somos? NodoSur Cloud, una PYME de 18 personas: operaciones, mantenimiento y seguridad física en turnos rotativos. Estamos en etapa de diseño ejecutivo, con obra civil arrancando en 2027 en el Parque Industrial Pilar — lo que nos pone bajo tres jurisdicciones: Nación, Provincia y Municipio. Y acá hay una ventaja estratégica que quiero subrayar: el sistema de gestión se implementa desde la construcción. No adaptamos un edificio viejo a la norma — nacemos con el sistema puesto.

→

### Slide 8 · Proceso productivo (40 s)
> El proceso define los residuos. Entra energía de red, gasoil de respaldo, agua con biocidas para las torres de enfriamiento, refrigerantes, equipamiento y baterías. La operación es 24/7: infraestructura eléctrica y térmica, mantenimiento preventivo, pruebas mensuales de generadores. Y a la salida, además de los tres servicios, generamos residuos peligrosos — baterías, refrigerantes recuperados, aceites — residuos electrónicos, y efluentes de purga. Cada uno de estos flujos tiene su normativa y su control, como vamos a ver.
>
> **[Pase]** [A] sigue con lo que le pasa a las personas que trabajan adentro.

→

---

## PERSONA A — Riesgos laborales y ergonomía (min 7 a 9.5)

### Slide 9 · Matriz de riesgos (50 s)
> Identificamos doce peligros y los evaluamos con una matriz de probabilidad por severidad, escala 1 a 3 en cada eje: el nivel de riesgo es el producto, de 1 a 9. En la matriz, cada peligro está ubicado en su celda. Abajo a la izquierda, lo leve e improbable — un tropiezo con cables. La celda 9 — muy probable y fatal — está vacía, y el objetivo del sistema es que siga así.
>
> Lo que nos importa son las dos celdas de nivel 6: arriba, lo probable y muy grave — arco eléctrico, energización accidental durante mantenimiento, y vuelco de rack, que cargado pesa entre 500 y 1.500 kilos. Y a la derecha, lo muy frecuente y grave — lesión lumbar por carga manual y daño auditivo, porque la sala supera los 85 decibeles de forma permanente. Esos cinco, listados acá, exigen control inmediato — y son los que atacan los controles que siguen.

→

### Slide 10 · REBA Tarea 1 (40 s)
> Para ergonomía no nos quedamos en la enumeración: aplicamos REBA, Rapid Entire Body Assessment, a las tres tareas críticas. La primera: instalar un servidor de 22 kilos en el rack, sin ayuda mecánica. El desglose por segmento corporal da tronco 3 por flexión mayor a 60 grados con torsión, hombros 3 por elevación sobre 90 grados, y la carga suma 3 puntos más. Conclusión del método: riesgo muy alto, acción inmediata. No es una opinión — es el puntaje del método.

→

### Slide 11 · REBA Tareas 2 y 3 (35 s)
> Las otras dos tareas evaluadas: el cableado bajo piso técnico, un espacio de 40 a 60 centímetros donde el técnico trabaja en cuclillas hasta 40 minutos — rodillas y tronco puntúan 3, muy alto. Y la guardia nocturna, que parece inofensiva pero acumula más de 6 horas sedentes, carga mental por vigilancia sostenida y alteración del ciclo circadiano por la rotación de turnos.

→

### Slide 12 · Controles ergonómicos (40 s)
> Los controles siguen la jerarquía: primero ingeniería, después administración. De ingeniería: elevador de rack obligatorio para todo equipo de más de 15 kilos, rodilleras y carro porta-herramientas para el bajo piso, consola regulable de triple pantalla, protección auditiva. De administración: máximo 15 minutos bajo piso con rotación, pausas activas cada 2 horas en guardia, y mínimo 7 días en el mismo horario antes de rotar turno. La meta es medible: REBA post-medida menor o igual a 4, con una inversión de 3.500 dólares.
>
> **[Pase]** [B] sigue con el riesgo más severo del edificio: el fuego.

→

---

## PERSONA B — Incendios y emergencia (min 9.5 a 11)

### Slide 13 · Clases de fuego (40 s)
> El datacenter concentra una carga de fuego heterogénea, y eso obliga a protección diferenciada por zona. Clase A — sólidos — en plásticos y cableado. Clase B — líquidos — el gasoil del generador. Clase C — eléctrico energizado — toda la sala de servidores, donde usamos Novec 1230, un gas limpio que no conduce ni deja residuo. Y clase D — metales — el litio de las baterías, que si entra en fuga térmica no se apaga con gas: necesita arena seca o agente específico. Usar el agente equivocado en la zona equivocada agrava el incendio.

→

### Slide 14 · Plan de emergencia y croquis (50 s)
> Este es el croquis de evacuación de la planta. Dos salidas — acá y acá **[señalar]** — rutas señalizadas con fotoluminiscencia, extintores de CO₂ y ABC distribuidos por zona, el corte de emergencia EPO accesible desde el pasillo, desfibrilador, y el punto de encuentro exterior. El procedimiento ante alarma es secuencial: pre-alarma, se detiene toda tarea; el jefe de turno confirma la zona en el panel; si hay personal en la zona de descarga gaseosa, evacuación inmediata sin excepción — la descarga supera los 130 decibeles; nadie reingresa hasta que la ventilación confirme condiciones. Brigada de dos personas por turno, al menos una con RCP y DEA, y dos simulacros por año.
>
> **[Pase]** [A] retoma con el marco legal y el sistema ambiental.

→

---

## PERSONA A — Marco legal y aspectos ambientales (min 11 a 12.5)

### Slide 15 · Marco legal (45 s)
> Operar en Pilar nos pone bajo tres jurisdicciones simultáneas. A nivel nacional: la Ley General del Ambiente nos exige evaluación de impacto ambiental previa a la obra; la 24.051 de residuos peligrosos nos hace responsables como generadores incluso después de entregar el residuo — responsabilidad extendida, con manifiesto por cada transporte; y la 19.587 rige toda la seguridad laboral. A nivel provincial: inscripción ante OPDS como generador de residuos especiales, y médico del trabajo más especialista en higiene y seguridad matriculados. Y a nivel municipal, un detalle que no es menor: el reglamento del parque limita el ruido exterior a 55 decibeles diurnos — nuestras torres de enfriamiento tienen que verificarlo con medición acústica.

→

### Slide 16 · Aspectos e impactos (40 s)
> El corazón de ISO 14001 es el registro de aspectos e impactos, cláusula 6.1.2. Valoramos cada aspecto sumando probabilidad, severidad y alcance regulatorio, 1 a 3 cada uno. Todo lo que da 7 o más es significativo y exige objetivo y control operacional formal. El ranking: residuos electrónicos con 9 — el máximo del registro —, energía eléctrica, fugas de refrigerantes y baterías con 8, y agua, efluentes y derrame de combustible con 7. Estos siete definen dónde va el presupuesto del sistema.
>
> **[Pase]** ¿Y cómo gestionamos el que dio 9? [B] lo cuenta.

→

---

## PERSONA B — Residuos, circular y sistema integrado (min 12.5 a 14.5)

### Slide 17 · Gestión de residuos (40 s)
> Segregación en origen en cinco corrientes con código de color. La crítica es la roja: baterías — que en cada reemplazo son 500 a 800 kilos —, aceites, filtros y refrigerantes van a un depósito exclusivo con contención secundaria del 110%, sensor de hidrógeno y ventilación forzada, con máximo 90 días de almacenamiento según el decreto 831. Cada retiro sale con manifiesto de transporte, el certificado de disposición final se archiva cinco años, y el gestor externo se audita anualmente. Si el registro existe, el control existe.

→

### Slide 18 · Economía circular (35 s)
> Para el e-waste aplicamos jerarquía de gestión: reciclar es la última opción. Primero reducir — no sobredimensionar, y cazar servidores zombies cada trimestre. Después reutilizar: un servidor que sale de producción pasa a desarrollo y gana dos años de vida. Reparar componentes antes que reemplazar equipos. Un banco interno de componentes que recupera entre 200 y 500 dólares por equipo dado de baja. Y recién al final, reciclaje certificado. Metas: 50% de desvío de relleno el primer año y 100% de trazabilidad.

→

### Slide 19 · Objetivos SMART (40 s)
> Todo el sistema aterriza en cuatro objetivos SMART. Energía: bajar el PUE de 1.80 de diseño a 1.53 en 36 meses — la energía es el 70% de nuestro costo operativo, así que ese 15% son unos 140 mil dólares al año. Residuos: 100% de trazabilidad desde el primer mes. Seguridad: índice de frecuencia cero el primer año. Y certificar ISO 14001 antes de fin de 2028. Cada objetivo tiene programa, responsable y presupuesto — los ven abajo: desde 1.500 dólares los kits LOTO hasta 25 mil la certificación.

→

### Slide 20 · PHVA (40 s)
> El motor de mejora continua es el ciclo PHVA con frecuencias y responsables definidos: planificación anual en enero con la Dirección; ejecución continua de controles y capacitaciones; verificación con KPIs mensuales y auditoría interna semestral; y acción correctiva ante cada desvío, con revisión anual documentada en diciembre. Y proponemos una mejora concreta para el próximo ciclo: free-cooling con pre-enfriamiento adiabático, más un scheduler con inteligencia artificial que module la refrigeración según carga térmica y tarifa eléctrica horaria.

→

### Slide 21 · SGI (35 s)
> Y acá se une todo: no implementamos tres sistemas, implementamos uno con tres lentes. Una sola política firmada por la Dirección, un solo ciclo PHVA, registros unificados, una revisión anual de 360 grados y un único responsable. El mejor ejemplo es una tarea que hacemos cada 4 a 6 años: el recambio de baterías del UPS. Seguridad la gobierna con LOTO y verificación de tensión — porque un UPS sigue energizado aunque cortes la entrada. Ergonomía la gobierna con el elevador de rack — cada batería supera los 15 kilos. Y Ambiental la cierra con el manifiesto de transporte — son 500 a 800 kilos de residuo peligroso por reemplazo. Una sola tarea, un solo procedimiento, tres normas cumplidas a la vez.

→

---

## CIERRE — A y B (min 14.5 a 15)

### Slide 22 · Cierre
> **A:** No son tres sistemas: es uno solo. Menos carga administrativa, cero duplicaciones y visión completa — del arco eléctrico al e-waste, del REBA al PUE.
>
> **B:** Y con una ventaja que pocas empresas tienen: lo implementamos desde los cimientos. Cuando el datacenter encienda su primer servidor en 2027, el sistema ya va a estar funcionando. Gracias — quedamos abiertos a preguntas.

---

## Notas de ejecución

- **Ensayo:** el guion completo son ~1.950 palabras ≈ 14 min a ritmo normal. Si van pasados de tiempo, los slides 3, 8 y 11 se pueden resumir a una sola frase cada uno sin perder el hilo.
- **Pases:** el que NO habla maneja las flechas. Los pases de orador están marcados con **[Pase]** — siempre con nombre, nunca "bueno, ahora sigue él".
- **Preguntas probables:** fuente del gráfico de costos (benchmarks típicos de industria / Uptime Institute — decirlo sin que pregunten suma), por qué REBA y no RULA (REBA evalúa cuerpo entero con cargas; RULA es miembro superior en tareas sedentes), y qué pasa si no se llega al PUE 1.53 (acción correctiva del PHVA: se analiza el desvío y se reasignan recursos — esa es justamente la gracia del ciclo).
- **Teclas demo:** C (cristal/tinte), M (mono/color), B (blur), G (distorsión) — **no tocarlas durante la presentación** salvo que quieran mostrar la página en sí.
