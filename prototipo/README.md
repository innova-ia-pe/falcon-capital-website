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
| Blog y artículo | `blog.html`, `articulo.html` |
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
| `assets/falcon.js` | Carrusel del banner, encuadre por caras, simulador, formularios, testimonios, aviso de cookies y animaciones |

El tema de WordPress usa estas mismas hojas y este script: después de un cambio aquí, se pasan al tema con
`python wordpress/herramientas/tema_desde_prototipo.py`.

## Simulador de Factoring

Tres pasos: tus datos → simulación → evaluación. Fórmula del instructivo de cálculo de Falcon Capital (v1 del
25/09/2026) con la TEM de pizarra de 1.80 % (minuta 006) y comisión de 1 % más IGV. Historial de decisiones en
`PROPUESTAS.md`.

## Pendiente de Falcon Capital

Textos legales, testimonios (los tres actuales son formato de ejemplo), detalle de las cookies que use la web,
video institucional, artículos del blog, cifras validadas («+150 mypes», «S/ 300 M», «48 horas» en Factoring y
Conócenos), destino y plazos del Libro de Reclamaciones y la definición de Mi Portal Falcon (acceso y registro).
