# Traslado a WordPress + Elementor

El prototipo está armado para que cada sección sea **un contenedor de Elementor**
con widgets estándar. Esta guía dice qué widget usar en cada bloque, qué va a
configuración global y qué necesita código propio.

Supuesto: Elementor **Pro** (formularios, Loop Grid / Loop Carousel, Theme Builder).
Si se usa la versión gratuita, lo marcado con ★ necesita un plugin o un shortcode.

## 1. Configuración global (Site Settings)

**Colores globales**

| Nombre | Valor | Uso |
|---|---|---|
| Teal de marca | `#004B54` | fondos de tarjeta, botones oscuros |
| Verde secundario | `#195B55` | degradado de tarjetas |
| Fondo profundo | `#00141A` | fondo del sitio (modo oscuro) |
| Esmeralda | `#00E3A5` | botón principal y acentos |
| Menta | `#6FE6AD` | títulos sobre tarjeta verde, etiquetas |
| Cian | `#00D4D2` | degradado de títulos |
| Texto claro | `#EEF7F5` | texto sobre fondos oscuros |
| Texto oscuro | `#052026` | texto sobre fondos claros |

**Tipografía global:** Poppins 300/400/500/600. H1 52–64 px, H2 36–48 px, H3 22–24 px,
texto 16 px, antetítulo 11.5 px en mayúsculas con 0.18 em de espaciado.

**Contenedores:** ancho 1280 px, relleno lateral 36 px (22 px en móvil),
separación entre columnas 20 px. Radio de tarjeta 24 px y de panel 32 px.

**CSS adicional:** el contenido de `assets/falcon.css` va en *Apariencia →
Personalizar → CSS adicional* (o en un tema hijo). Las clases del prototipo
(`sol`, `post`, `stat`, `info`, `why-i`, `legal`, `norms`, `pill`…) se asignan a
cada contenedor o widget en **Avanzado → Clases CSS**.

## 2. Plantillas del Theme Builder

| Plantilla | Contenido | Widgets |
|---|---|---|
| Cabecera | logo, menú, Crea tu cuenta, Iniciar sesión, modo claro/oscuro | Logo del sitio · Nav Menu (Soluciones como submenú) · 2 Botones · HTML (conmutador de tema) |
| Pie | logo, dirección, contacto, redes, 3 columnas de enlaces | Imagen · Editor de texto · Iconos sociales · 3 × Lista de iconos |
| Entrada del blog | cabecera del artículo, índice, cuerpo, compartir, relacionados | Título · Info de la entrada · Tabla de contenidos · Contenido · Botones para compartir · Loop Grid |
| Archivo del blog | pestañas por categoría y grilla | Loop Grid con filtro por taxonomía |

El **dock «Bot Falcon»** y el **aviso de cookies** van como plantillas emergentes
(Popup) o con un plugin de consentimiento (Complianz, CookieYes) ★.

## 3. Bloques del Home y su widget

| Bloque del prototipo | Contenedor | Widgets |
|---|---|---|
| Banner con simulador + 3 banners de producto (`hero2`) | Nested Carousel | 1ª diapositiva: widget HTML con el **shortcode del simulador** ★; las otras tres: Encabezado + Texto + Botón sobre imagen de fondo |
| Presentación / video | 2 columnas | Encabezado · Texto · Video (cuando llegue el archivo) |
| Cifras y afiliaciones (`stats`) | 5 columnas, fondo degradado verde | 3 × Icon Box (número en el título) · 2 × Image Box (logo ON / APEFAC) |
| Soluciones (`sol`) | 3 columnas iguales | 3 × Image Box con enlace, o Loop Grid de una CPT «Soluciones» |
| Mensaje de la gerencia (`quote2`) | 2 columnas | Imagen (PNG sin fondo) sobre forma verde · Testimonio o Encabezado + Texto |
| Actualidad (`rail`) | ancho completo | **Loop Carousel** de una CPT «Noticias» (3 por vista, flechas y puntos) |
| Blog (`post`) | 3 columnas | **Loop Grid** de las 3 últimas entradas |
| Testimonios | — | Testimonial Carousel (pendiente de contenido) |
| Seguridad y respaldo (`trust2`) | 2 columnas | Encabezado · Texto · 3 × Icon Box horizontales |
| Información de contacto (`info`) | 3 columnas iguales | 3 × Icon Box + Botón con icono (la cápsula) |
| Cierre (`cta-box`) | caja centrada | Encabezado · Texto · 2 Botones |

## 4. Páginas de producto (Factoring, Confirming, Capital de Trabajo)

Se arma **una plantilla** y se duplica: cambian textos, imágenes y la opción
preseleccionada del formulario.

| Bloque | Widgets |
|---|---|
| Banner | Encabezado · Texto · Botón · Imagen |
| ¿Qué es? | Encabezado · Texto |
| Beneficios | 3 × Icon Box |
| Pasos | Lista de iconos numerada o 4 × Icon Box |
| Requisitos | 4 × Icon Box sobre fondo claro |
| Cumplimiento y respaldo (`legal`) | contenedor con **imagen de fondo** + superposición; Encabezado · 5 etiquetas (botones sin enlace) · panel «Marco normativo clave» con 6 × Icon Box |
| ¿Por qué elegir? (`why`) | 4–5 × Icon Box centrados |
| Contacta a un experto | **Formulario de Elementor** con los campos del CRM (acción: webhook a Faast) ★ |
| Cierre | Encabezado · Texto · 2 Botones |

## 5. Lo que necesita código propio

| Pieza | Propuesta |
|---|---|
| **Simulador** | Plugin pequeño o snippet que registre el shortcode `[falcon_simulador]` con el HTML y el JS del prototipo (`initSimulador`, tres pasos). Las fórmulas van en `PRODUCTOS[x].calcular`. Mientras Falcon no entregue tasas, el resultado queda en cero. |
| **Conmutador claro/oscuro** | Widget HTML con el botón y el script de `falcon.js`; el tema se guarda en `localStorage`. Si no se quiere mantener, se publica solo el modo oscuro. |
| **Libro de reclamaciones** | Formulario de Elementor de varios pasos o Gravity Forms / WPForms ★ (adjuntos, correo de constancia y registro obligatorio). |
| **Crea tu cuenta / Iniciar sesión** | Dependen de dónde viva Mi Portal Falcon. Si es externo, estos botones son enlaces; si es interno, plugin de acceso social (Nextend Social Login) ★. |
| **Bot conversacional** | Integración por script del proveedor elegido, en la plantilla emergente del dock. |

## 6. Imágenes

Todo `img/` está optimizado para web. Al subir a la biblioteca de medios:
ancho máximo 1920 px para banners y 1200 px para tarjetas, formato WebP y texto
alternativo. Los archivos extraídos de la maqueta (`julio-sin-fondo.png`,
`apefac*.png`, `act-*.jpg` nuevas, `marco-legal.jpg`, `acceso-ilustracion.jpg`)
deben reemplazarse por los originales cuando Falcon los entregue.
