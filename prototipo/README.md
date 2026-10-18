# Prototipo web · Falcon Capital

Diseño elegido por el cliente: **B «Impulso»**, con el banner **«Vidrio»** en el Inicio. Es HTML + CSS + JS sin
framework ni build. Se publica en GitHub Pages desde la rama `demo`:
https://innova-ia-pe.github.io/falcon-capital-website/

La versión en WordPress + Elementor está en [`../wordpress/`](../wordpress/README.md).

## Páginas

| Página | Archivo |
|---|---|
| Inicio (banner con simulador) | `index.html` |
| Factoring · Confirming · Capital de Trabajo | `factoring.html`, `confirming.html`, `capital-de-trabajo.html` |
| Simulador | `simulador.html` |
| Conócenos | `conocenos.html` |
| Blog y artículos | `blog.html`; un archivo por artículo: `articulo.html` (confirming, destacado), `articulo-liquidez.html`, `articulo-flujo-de-caja.html`, `articulo-factoring-vs-prestamo.html`, `articulo-confirming.html` |
| Contáctanos | `contactanos.html` |
| Iniciar sesión · Crea tu cuenta | `iniciar-sesion.html`, `registro.html` |
| Preguntas frecuentes | `preguntas-frecuentes.html` |
| Libro de Reclamaciones | `reclamaciones.html` |
| Legales | `politica-de-privacidad.html`, `terminos-y-condiciones.html`, `politica-de-cookies.html`, `reglamento-de-factoring.html`, `constancia-de-registro.html` |
| Estados | `gracias.html`, `404.html` |

Las direcciones anteriores (`propuestas/index.html?p=b&h=1`, `propuestas/ver.html?u=…`) redirigen a estas.

## Archivos

| Archivo | Qué tiene |
|---|---|
| `assets/base.css` | Reinicio, tipografía Manrope y formularios compartidos |
| `assets/impulso.css` | Diseño «Impulso»: cabecera, secciones y pie |
| `assets/banner.css` | Banner «Vidrio», tarjeta del simulador y encuadre de fotos |
| `assets/paginas.css` | Páginas secundarias (legales, preguntas, acceso, reclamaciones, estados) |
| `assets/falcon.js` | Carrusel del banner, encuadre por caras, simulador, formularios, testimonios, aviso de cookies, asistente virtual y animaciones |
| `assets/bot-demo.js` | Base de conocimiento de ejemplo del asistente (modo demostración, sin IA). Se genera desde el plugin de WordPress |

El tema de WordPress usa estas mismas hojas y este script: después de un cambio aquí, se pasan al tema con
`python wordpress/herramientas/tema_desde_prototipo.py`.

## Simulador de Factoring

Tres pasos: tus datos → simulación → evaluación. Fórmula del instructivo de cálculo de Falcon Capital (v1 del
25/09/2026) con la TEM de pizarra de 1.80 % (minuta 006) y comisión de 1 % más IGV. Historial de decisiones en
`PROPUESTAS.md`.

## Asistente virtual

El botón flotante («Pregúntale a Falcon») y el de la barra móvil abren el chat. Aquí funciona en **modo
demostración**: responde con la ficha de la base de ejemplo que más coincide, sin IA. En WordPress responde la IA
(Claude con Gemini de respaldo) con lo que Falcon cargue en *Asistente → Conocimiento*.

## Contenido

Los cinco artículos del blog y las páginas de Privacidad, Términos y Cookies son borradores de Innova IA armados con
el brief, la maqueta y lo que el sitio hace de verdad; Falcon debe validarlos (los legales, con su área legal).

## Pendiente de Falcon Capital

Validar los artículos y los textos legales (razón social, RUC e inscripción del banco de datos), el Reglamento de
Factoring y la constancia de la SBS, testimonios reales (los tres actuales son formato de ejemplo), video
institucional, cifras validadas («+150 mypes», «S/ 300 M»; los plazos como «48 horas» se retiraron hasta validarlos, minuta 007), base de
conocimiento y reglas del asistente, destino y plazos del Libro de Reclamaciones y la definición de Mi Portal Falcon
(acceso y registro).
