# Propuestas A «Claridad» y B «Impulso»

Abrir **`propuestas/index.html`**. La dirección anterior, `propuestas.html`, redirige ahí.

Cada página del sitio tiene su versión en las dos propuestas y su par en la
versión actual:

| Página | Archivo |
|---|---|
| Inicio | `propuestas/index.html` |
| Conócenos | `propuestas/conocenos.html` |
| Factoring · Confirming · Capital de Trabajo | `propuestas/factoring.html`, `confirming.html`, `capital-de-trabajo.html` |
| Simulador | `propuestas/simulador.html` |
| Blog y artículo | `propuestas/blog.html`, `articulo.html` |
| Contáctanos | `propuestas/contactanos.html` |

**Barra superior**
- **Versión actual / A / B** cambia la versión de la misma página y vuelve a la
  misma sección. La página se recarga limpia, así que no se arrastran estados
  rotos.
- El menú de la izquierda salta a cualquier página manteniendo la versión elegida.
- **¿Qué cambia?** resume cada propuesta.
- Atajos: teclas `1`, `2` y `3`.

**Páginas sin rediseño.** Crea tu cuenta, Iniciar sesión, Libro de
Reclamaciones y las legales se abren dentro de `propuestas/ver.html` con el
diseño actual y un botón «Volver a la propuesta».

Los datos que la persona deja en el simulador se recuerdan al pasar de A a B y
entre páginas; los formularios de contacto llegan precompletados.

## Qué pidió el cliente y cómo se resolvió

| Pedido (Aaron · minutas 004 y 005) | Resultado |
|---|---|
| Pedir los datos **antes** del simulador, de forma amigable | Simulador en tres pasos: **1 Tus datos** (nombre, RUC, celular y consentimiento) → **2 Simulación** al instante → **3 Evaluación** (solo falta el correo). Detalle abajo. |
| Solo Factoring con simulador; Confirming y Capital de Trabajo informativos | En el banner, Factoring muestra el simulador. Confirming y Capital de Trabajo muestran una tarjeta informativa que lleva al formulario de contacto. En sus páginas no hay simulador. |
| Comisión de 1 % en soles o dólares | Aplicada (`TARIFA.comision` en `assets/propuestas.js`). |
| Tasas de interés | **No llegó la tabla:** el mensaje decía «usar esto:» sin adjunto. El simulador ya acepta TEM por monto y plazo (`TARIFA.tramos`); mientras tanto usa la TEM del ejemplo del instructivo (1.75 %). |
| Logos SBS, CAVALI y APEFAC en PNG | `img/logo-sbs.png`, `img/logo-cavali.png` (del SVG oficial que subió Wilmer, renderizado en alta) y `img/logo-apefac.png` (del sitio oficial apefac.com, con fondo transparente). |
| Confirming con más detalle en «¿Qué es?» | Nueva sección: las **tres partes** (tu empresa, Falcon Capital y tus proveedores), **lo que gana cada lado** y las **5 ventajas** del confirming, tomadas del artículo del blog del cliente. |
| Cumplimiento y respaldo: sin las «cardsitas» de arriba y más protagonismo al marco normativo | Se eliminan las cinco etiquetas. A: expediente ordenado por tema, con la Ley N.° 29623 destacada y los sellos de la SBS y CAVALI. B: índice tipográfico grande sobre la foto del mazo. |
| «No innovaste en nada» en las secciones internas | Rediseño de todas las secciones de producto (ver abajo). |
| Se quedaba «bugeando» al pasar de una propuesta a otra | Cada página arranca solo la propuesta visible. El cambio de versión es una recarga limpia con un velo de transición: nada queda a medias. Se probaron 6 cambios seguidos sin fallos. |
| Flujo de cada producto «con logotipos, imágenes en cada paso» (maqueta v2.1) | Cinco pasos por producto, con el logo de Falcon Capital en «Evaluamos» y el de CAVALI en «Registramos y validamos». A: recorrido horizontal que avanza al bajar. B: línea de tiempo que se dibuja al bajar. |
| «¿Por qué elegir Falcon Capital?» con imágenes y el logo de Falcon (v2.1) | A: cuatro tarjetas con foto y el isotipo de Falcon. B: lista grande que cambia la foto mientras bajas. |
| Julio Sebastiani: foto sin fondo, composición alargada y mensaje en globo (minuta 004) | Figura alargada sobre una cápsula y el mensaje dentro de un globo. En B el globo se ilumina palabra por palabra. |
| Slider del Home: deslizar en el celular y flechas más claras (minuta 004, referencia BCP) | Flechas visibles y deslizamiento con el dedo en las dos propuestas. |
| CTA «Simula tu crédito» + «Contáctanos» en todas las páginas | Homologado; Contáctanos lleva al formulario. |
| Formulario «Contacta a un experto» en las tres páginas de producto (minuta 004) | Con los campos de la maqueta y la solución preseleccionada, más «Ten a la mano» (requisitos). |
| Conócenos: foto del equipo al costado del texto (minuta 004) | Hecho en las dos propuestas. |
| Home orientado a conversión (minuta 005) | Simulador y beneficios en el primer pantallazo; franja «Por qué Falcon Capital» bajo el banner; barra fija en celular con «Simula tu crédito» y WhatsApp. |

## Cómo pedir los datos antes del simulador

Las dos propuestas usan la misma lógica, que es la **recomendación**: pedir
**pocos datos, primero, y mostrar lo que se desbloquea**.

1. **Tres datos y nada más.** Nombre, RUC y celular, más el consentimiento. Es
   lo mínimo para que un ejecutivo llame. La razón social se obtiene del RUC
   (consulta SUNAT, ya cotizada en la propuesta de Eduardo).
2. **El resultado se ve, pero borroso** («S/ ••,•••.••»). La persona sabe qué
   gana al completar sus datos.
3. **El correo se pide al final**, solo si quiere la evaluación formal.
4. **No se vuelve a pedir nada.** Si regresa o cambia de página, va directo a
   simular («Hola, Ana · ¿No eres tú?»).
5. **Errores claros y en español** (RUC de 11 dígitos que empieza con 10 o 20,
   celular de 9 dígitos que empieza con 9).

| | **A · Conversacional** | **B · Barra** |
|---|---|---|
| Paso 1 | Se escribe como una frase: «Hola, soy ___, de la empresa con RUC ___. Mi celular es ___.» | Barra tipo buscador con tres campos y el resultado bloqueado al lado. |
| Paso 2 | «Tengo una factura de S/ ___ que vence en ___ días», con barra deslizante y detalle del cálculo. | La misma barra cambia a monto, plazo (30 · 60 · 90 · 120) y «Recibirías hoy». |
| Paso 3 | La tarjeta pide el correo y confirma. | La barra se abre con el desglose y el formulario. |
| Se siente | Cercano, como hablar con un asesor. | Rápido, como cotizar en línea. |

**Recomendación: A.** La frase reduce la sensación de «formulario» y explica por
qué se piden los datos. B conviene si se prefiere que todo quepa en el banner sin
que nada cambie de tamaño.

## Simulador: fórmula

Fórmula del *Instructivo de cálculo — Factoring y Confirming* (Falcon Capital,
v1, 25/09/2026), la misma del simulador interno:

```
factor   = (1 + TEM)^(días / 30) − 1
interés  = monto × factor
comisión = monto × 1 %
IGV      = 18 % del interés y de la comisión (calculado antes de redondear)
neto     = monto − interés − comisión − IGV        (sin retención, minuta 004)
```

Con la comisión del ejemplo (0.50 %) reproduce el caso del instructivo al
céntimo (S/ 106,644.05 a 90 días → S/ 99,291.96).

**Pendiente:** la TEM por monto y plazo. Se carga en `TARIFA.tramos`:

```js
tramos: [ { hasta: 50000,   tem: { 30: 2.1, 60: 2.0, 90: 1.9, 120: 1.9 } },
          { hasta: Infinity, tem: { 30: 1.8, 60: 1.75, 90: 1.7, 120: 1.7 } } ]
```

Los valores de este ejemplo son ilustrativos: hay que reemplazarlos por la tabla
de Falcon.

## Diferencias entre A y B

| | A · Claridad | B · Impulso |
|---|---|---|
| Tono | Claro, editorial, mucho aire | Oscuro, fotográfico, alto contraste |
| Banner del Home | Pestañas Factoring · Confirming · Capital con flechas; la foto se desliza | Foto a la derecha que rota, con indicador de progreso y deslizable |
| Flujo del producto | Recorrido horizontal | Línea de tiempo vertical |
| Marco normativo | Expediente por temas + sellos + foto del mazo | Índice tipográfico sobre el mazo + Ley N.° 29623 destacada |
| Por qué elegirnos | Cuatro tarjetas con foto e isotipo | Lista grande que cambia la foto al bajar |
| Soluciones del Home | Tarjetas a imagen completa | Tarjetas que se apilan al bajar |

## Traslado a Elementor

| Pieza | Cómo se arma |
|---|---|
| Aparecer al bajar | Motion Effects → Entrance «Fade In Up» |
| Cifras que cuentan | Widget Counter |
| Banner con pestañas (A) | Nested Tabs con un widget HTML para el simulador |
| Banner con fotos que rotan (B) | Fondo Slideshow con efecto Ken Burns |
| Simulador en tres pasos | Shortcode `[falcon_simulador]` con el HTML y el JS de esta carpeta; el envío va al CRM por webhook |
| Flujo que avanza al bajar | Icon List + snippet JS pequeño (sin él, se ve estático y completo) |
| Tarjetas apiladas (B) | `position: sticky` en CSS personalizado |
| Por qué elegirnos (B) | Contenedor sticky + snippet JS; en celular, foto bajo cada ítem |
| Formulario de contacto | Elementor Form con la solución preseleccionada por página |
| Razón social desde el RUC | Integración SUNAT de la propuesta de Eduardo |

## Pendientes de Falcon Capital

- **Tabla de TEM por monto y plazo** (el mensaje llegó sin adjunto).
- Testimonios, video institucional y artículos completos del blog.
- Foto real para «Contacta a un experto»: la actual (`comercial.jpg`) trae la
  marca de agua de un generador de imágenes y se usa recortada.
- Logos SBS y CAVALI en versión oficial de alta resolución, si los tienen.
