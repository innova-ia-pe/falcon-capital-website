# Propuestas de Home · A «Claridad» y B «Impulso»

Todo está en **`propuestas.html`**: un solo archivo con tres botones arriba.

| Botón | Qué muestra |
|---|---|
| **Versión actual** | El Home de `demo` tal cual (`index.html`), con los cambios de Wilmer del 04/10 (banner compacto, sellos SBS y CAVALI, rediseño de Conócenos). Si Wilmer sube algo nuevo, este botón lo muestra apenas se actualice la rama. |
| **A · Claridad** | Home completo, claro y editorial. |
| **B · Impulso** | Home completo, oscuro y cinematográfico. |

Al cambiar de propuesta, la página salta a **la misma sección** en la otra, para
comparar bloque por bloque. Atajos: teclas `1`, `2` y `3`. También se puede
abrir directo con `propuestas.html?p=a`, `?p=b` o `?p=actual`. El botón
«¿Qué cambia?» resume cada propuesta para la presentación.

## Lo que pidió el cliente y cómo se responde

- **«No copien y peguen el maquetado; la estructura está bien.»** Las dos
  propuestas mantienen el orden de secciones y los textos de la maqueta v2.1. El
  diseño, la forma de mostrar la información y el simulador son nuevos.
- **Más leads.** El simulador muestra cuánto recibe la empresa **antes** de
  pedir datos. Los datos se piden después, en un formulario corto de cuatro
  campos que ya lleva la simulación adjunta.
- **El simulador no gustó.** Antes vivía dentro de un carrusel que rotaba,
  pedía datos personales antes del resultado y el resultado quedaba en cero.
  Ahora está fijo en el primer bloque, calcula al instante con la fórmula real
  de Falcon y los tres banners de producto conviven con él.
- **El fondo que se cortaba.** Ninguna sección termina con un degradado o un
  dibujo cortado: los fondos se funden con la sección siguiente o cambian de
  color de forma deliberada.
- **Mejores transiciones, efectos y UI/UX, sin complicar y sin que parezca
  hecho por IA.** Pocas animaciones y con propósito, fotografía real, tipografía
  con jerarquía y nada de emojis, brillos de neón ni tarjetas genéricas con
  íconos.

## Lo que comparten las dos

**Estructura de la maqueta v2.1.** Banner con simulador y banners de producto,
presentación con video, cifras y afiliaciones, soluciones, mensaje de la
gerencia, actualidad, blog, testimonios, seguridad y respaldo, canales de
atención, cierre y pie.

**Notas de la v2.1 aplicadas**

- Simulador de Factoring, Confirming y Capital de Trabajo en el primer banner,
  con llamada a usarlo.
- Imagen de fondo de los banners más visible: el texto ya no tapa a las personas.
- Cifras con los logos de ON Empresas y APEFAC al tamaño de los datos.
- Julio Sebastiani sin fondo y más grande; «acompañar**los**».
- Soluciones: «Tres soluciones para impulsar la liquidez de tu empresa», fondo
  en verdes de la paleta, imagen a todo el contenedor, tarjetas del mismo tamaño
  y sin «Solución #».
- Actualidad: «Impulsando el futuro del factoring en el Perú», con fondo verde.
- Blog: «Entiende tus finanzas. Impulsa tu negocio».
- Seguridad y respaldo con la forma de la maqueta: título centrado, texto y
  sellos de la SBS y CAVALI.
- «Canales de atención», con Horario de atención en lugar de Canal web.
- Pie: «Simulador» debajo de Capital de Trabajo; Preguntas frecuentes solo en
  el pie; sin «Cómo funciona» ni «Todas las soluciones».

**Simulador con cálculo real.** Usa la fórmula del *Instructivo de cálculo —
Factoring y Confirming* (Falcon Capital, v1, 25/09/2026), la misma del
simulador interno `simulador_factoring.zip`:

```
factor   = (1 + TEM)^(días / 30) − 1
interés  = monto × factor
comisión = monto × comisión %
IGV      = 18 % del interés y de la comisión (calculado antes de redondear)
neto     = monto − interés − comisión − IGV − retención
```

Reproduce el ejemplo del instructivo al céntimo (S/ 106,644.05 a 90 días →
S/ 99,291.96). Los valores son los del ejemplo: **TEM 1.75 %, comisión
0.50 %, retención 0 %**. Están en `assets/propuestas.js`, en la constante
`TARIFA`. La pantalla aclara que el cálculo es referencial.

**Captación de leads**

| Mecanismo | A | B |
|---|---|---|
| Resultado al instante, sin datos | frase editable y barra deslizante | barra tipo buscador |
| Formulario corto con la simulación adjunta (nombre, RUC, celular, correo y consentimiento) | panel lateral | la barra se abre con el detalle y el formulario |
| Confirmación con los siguientes pasos y salida a WhatsApp o Crea tu cuenta | sí | sí |
| WhatsApp con el mensaje ya escrito («Simulé un factoring por S/ 100,000 a 30 días…»), sin datos personales en el enlace | sí | sí |
| «Simulador» se vuelve botón en el menú cuando el banner sale de vista | sí | sí |
| Barra fija en celular: «Simula tu adelanto» y WhatsApp | sí | sí |
| Botón «Simular» en cada solución, que lleva al simulador con el producto ya elegido | sí | sí |
| Estado «Abierto ahora / Cerrado · abrimos el lunes» con la hora de Lima | sí | sí |
| Boletín en el pie («Guías para mejorar el flujo de caja») | sí | sí |

**Accesibilidad y rendimiento.** Sin librerías externas (solo Manrope de Google
Fonts). Imágenes diferidas, navegación con teclado en menús y selectores,
textos alternativos y `prefers-reduced-motion`: si el sistema pide menos
movimiento, se apagan rotaciones y animaciones.

## Propuesta A · Claridad

Fondo claro, tinta verde petróleo, acentos menta y mucho aire. Es la más
cercana a una empresa financiera tradicional, pero con lectura editorial.

- **Banner:** a la izquierda, pestañas 01 Factoring · 02 Confirming · 03 Capital
  de Trabajo; al cambiar, cambian el titular, el texto y la foto de la derecha,
  y el simulador se adapta al producto. Rotan solas cada 7 s, con una barra de
  progreso, hasta que la persona toca el simulador.
- **Simulador como frase:** «Tengo una factura de **S/ 100,000** que vence en
  **30 días**», con monto y plazo editables en la misma frase, barra deslizante
  y resultado grande con «Ver detalle» (interés, comisión e IGV).
- Secciones numeradas (01 Quiénes somos, 02 Soluciones…), cifras separadas por
  líneas finas, tarjetas de solución con la foto completa y el botón Simular,
  cita de la gerencia junto a Julio sobre un disco menta.

**Transiciones y efectos:** las fotos se descubren con una máscara, los
titulares suben suavemente, las palabras clave se subrayan como con
resaltador, las cifras cuentan hasta su valor, el cambio de producto funde
fotos y textos sin saltos y el panel de solicitud entra desde la derecha.

## Propuesta B · Impulso

Oscuro, fotográfico y de alto contraste. Es la más «fintech» y la que más
protagonismo da a las fotos, como pidió la nota de la v2.1.

- **Banner:** la foto de cada producto ocupa el lado derecho a todo lo alto y se
  funde con el fondo; el texto queda sobre el lado oscuro, así nunca tapa a las
  personas. Las fotos rotan con un acercamiento lento.
- **Simulador como buscador:** una barra al pie del banner con Solución, Monto,
  Vence en (30 · 60 · 90 · 120) y «Recibirías hoy». Al pulsar «Quiero mi
  adelanto» la barra se abre con el desglose, la proporción neto/descuento y el
  formulario.
- Soluciones en tarjetas grandes que se apilan al bajar, cada una con sus
  beneficios y su botón de simular. Cita de la gerencia que se ilumina palabra
  por palabra. Blog y testimonios en una sección clara para dar ritmo. Sellos
  SBS, CAVALI y Ley N.° 29623 sobre placas claras.

**Transiciones y efectos:** acercamiento lento de las fotos del banner, video
institucional que crece al entrar, tarjetas apiladas que se oscurecen al quedar
atrás, cita revelada al ritmo del scroll, foto del cierre con paralaje suave,
cabecera que se oculta al bajar y vuelve al subir, y un grano fotográfico muy
leve en el fondo.

## Traslado a Elementor

| Pieza | Cómo se arma |
|---|---|
| Aparición al bajar (subir y aparecer) | Motion Effects → Entrance Animation «Fade In Up», duración lenta |
| Foto que se descubre con máscara (A) | Clase `reveal-mask` y 10 líneas de CSS (`clip-path`) en CSS adicional |
| Cifras que cuentan | Widget Counter |
| Banner con pestañas (A) | Nested Tabs; el simulador va en un widget HTML / shortcode `[falcon_simulador]` |
| Banner con fotos que rotan (B) | Contenedor con fondo Slideshow y efecto Ken Burns (nativo de Elementor) |
| Barra simuladora (B) | Widget HTML / shortcode con el JS de `propuestas.js` |
| Tarjetas apiladas (B) | Cada contenedor con `position: sticky` en CSS personalizado; el oscurecido es opcional (snippet JS) |
| Video que crece al entrar (B) | Motion Effects → Scrolling Effects → Scale |
| Paralaje del cierre (B) | Motion Effects → Scrolling Effects → Vertical Scroll |
| Cita palabra por palabra (B) | Snippet JS pequeño; sin él, aparece entera con Fade In |
| Carrusel de actualidad | Loop Carousel de la CPT «Noticias» |
| Panel de solicitud (A) | Popup de Elementor Pro, entrada lateral, con Formulario |
| Formulario corto | Elementor Form; acción webhook al CRM (Faast) con los campos ocultos producto, moneda, monto, plazo y neto |
| WhatsApp con mensaje | Enlace `https://wa.me/51955447475?text=…` |
| Cabecera que se oculta (B) | Theme Builder → cabecera sticky con efecto al hacer scroll |
| Abierto ahora / Cerrado | Snippet JS de 20 líneas |
| Selector Actual / A / B | Solo para presentar; no se traslada |

## Pendientes de Falcon Capital

- **Tarifario final** (TEM, comisión y retención por producto y plazo) y
  confirmar si Confirming y Capital de Trabajo usan la misma fórmula: hoy los
  tres productos calculan con el ejemplo del instructivo.
- Testimonios reales con autorización, video institucional y fotos originales.
- **Foto del ejecutivo con chaleco Falcon** (`comercial.jpg`): trae la marca de
  agua de un generador de imágenes con IA. Se usa un recorte provisional
  (`comercial-recorte.jpg`); conviene reemplazarla por una foto real.
- Destino del formulario (CRM) y texto legal de consentimiento según la Ley
  N.° 29733.
- Logos oficiales de la SBS y CAVALI en alta resolución (se usan los que subió
  Wilmer).
