# Prototipo web · Falcon Capital (v4)

Prototipo HTML + CSS (sin framework, sin build) de la web de Falcon Capital,
más el documento de wireframes de estructura.

## De dónde sale cada cosa

| Fuente | Qué se tomó |
|---|---|
| `Sitemap_Falcon_Capital.pdf` | Árbol de páginas, estados del sistema y elementos transversales |
| `Falcon_Capital_Maqueta_Diseño_Web.pdf` (92 pp.) | Estructura de cada pantalla, textos y llamadas a la acción |
| `Manual de Identidad - Paleta de Colores & Redes Sociales.pdf` | **Propuesta nueva** (pp. 2–3, 25–27) y los wireframes web del cliente (pp. 28–30) |
| `Manual de Identidad - Logotipo.pdf` | Logotipo y variantes clara / oscura |
| `FALCON CAPITAL BRIEF WEB ACTUALIZADO.docx` | Definiciones y beneficios de cada servicio |
| `Redes Sociales / Correo / Teléfono.docx` | info@falconcapital.pe · 955 447 475 · redes sociales |
| Carpetas de fotografías del cliente | 30 imágenes originales, optimizadas para web |

No se agregó contenido inventado. Lo que el cliente aún no entregó aparece
marcado como **pendiente de contenido**.

## Sistema visual (v2)

La versión anterior replicaba la web actual. Esta parte de la **propuesta nueva**
del manual de identidad:

- **Fondo teal profundo** (`#004b54` → `#001125`) con degradado esmeralda y las
  líneas técnicas de las piezas de marca.
- **Bento de 12 columnas**: tarjetas blancas de distinto peso, una destacada en
  esmeralda, igual que el wireframe de servicios del cliente (p. 28).
- **Capitalización normal** en lugar de mayúsculas: es el cambio que más separa
  la web nueva de la actual.
- **Un solo acento por sección**: el esmeralda marca una pieza, no toda la página.
- Iconos de línea a 1.5 px, fotografía en 16:10 dentro de las tarjetas y a sangre
  solo en el hero.
- Secciones claras intercaladas (requisitos, formularios, artículo) para que el
  recorrido respire.

Paleta: `#004b54` · `#6fe6ad` · `#195b55` · `#00d4d2` · `#e4e4e4` · `#001125`.

### Modo claro y modo oscuro

Las dos versiones comparten retícula, tipografía y composición; cambian las
superficies y el acento de texto, que en modo claro pasa al teal de marca para
mantener el contraste sobre blanco. El conmutador está en la cabecera y recuerda
la elección en el navegador. La barra de prototipo, el pie, el panel de cierre,
el dock y el aviso de cookies siguen en oscuro en ambos temas, como islas.

## Pantallas

El prototipo cubre el sitemap completo. Las pantallas que el sitemap pide y la
maqueta de 92 páginas todavía no cubría se construyeron con contenido ya
aprobado por el cliente; lo que no existe está marcado como pendiente.

| Archivo | Ruta del sitemap | Maqueta |
|---|---|---|
| `index.html` | `/` | pp. 4–18 |
| `conocenos.html` | `/conocenos/` | pp. 20–29 |
| `soluciones.html` | `/soluciones/` | pp. 31–34 |
| `factoring.html` | `/soluciones/factoring/` | pp. 36–44 |
| `simulador.html` | `/soluciones/factoring/simulador/` | — |
| `confirming.html` | `/soluciones/confirming/` | pp. 46–54 |
| `capital-de-trabajo.html` | `/soluciones/capital-de-trabajo/` | pp. 56–64 |
| `como-funciona.html` | `/como-funciona/` | — |
| `preguntas-frecuentes.html` | `/preguntas-frecuentes/` | — |
| `blog.html` | `/blog/` | pp. 66–71 |
| `articulo.html` | `/blog/{slug}/` | pp. 72–76 |
| `contactanos.html` | `/contactanos/` | pp. 78–81 |
| `gracias.html` | `/contactanos/gracias/` | — |
| `evaluacion.html` | `/solicita-tu-evaluacion/` | pp. 79 y 83 |
| `mi-portal.html` | Enlace externo | pp. 85–86 |
| `reglamento-de-factoring.html` | `/reglamento-de-factoring/` | — |
| `politica-de-privacidad.html` | `/politica-de-privacidad/` | — |
| `terminos-y-condiciones.html` | `/terminos-y-condiciones/` | — |
| `politica-de-cookies.html` | `/politica-de-cookies/` | — |
| `constancia-de-registro.html` | `/constancia-de-registro/` | — |
| `reclamaciones.html` | `/libro-de-reclamaciones/` | pp. 87–89 |
| `404.html` | Estado del sistema | — |
| `wireframes.html` | Documento de estructura | — |
| `pantallas.html` | Mapa del prototipo y decisiones pendientes | — |

### Elementos transversales

Header y navegación, footer, botón de WhatsApp, bot conversacional, aviso y
preferencias de cookies, CTA «Solicita tu evaluación» y acceso a Mi Portal Falcon
están en todas las pantallas.

## Estructura

```
prototipo/
  *.html               una página por pantalla, sin dependencias entre sí
  assets/falcon.css    sistema de diseño del sitio
  assets/wireframe.css estilos del documento de wireframes
  assets/falcon.js     menú móvil, carrusel del banner, acordeón y aparición al hacer scroll
  img/                 fotografías y logotipos del cliente, optimizados
```

Se abre con doble clic en `index.html`; las tipografías de Google Fonts
necesitan conexión.

## Notas

- El banner de la home rota entre los cuatro mensajes de la maqueta (general,
  Factoring, Confirming y Capital de Trabajo) cada 7 segundos, con barra de progreso.
- Los bloques aparecen con una transición suave al entrar en pantalla; se desactiva
  sola si el sistema pide menos movimiento (`prefers-reduced-motion`).
- Los formularios son maqueta: no envían datos a ningún servidor.
- El formulario de contacto usa los campos acordados para el CRM Faast
  (ticket D06): razón social, RUC, nombres, apellidos, email, celular, solución y
  consentimiento, más `origen` y `utm_campaign` ocultos.
- **Mi Portal Falcon** es una plataforma externa ya operativa. Todos los enlaces
  (cabecera, pie y `mi-portal.html`) salen de una sola constante del generador:
  cuando TI Falcon entregue la URL definitiva basta con cambiarla una vez y la
  redirección queda activa en todo el sitio, abriéndose en una pestaña nueva.
- El **bot conversacional** y el **aviso de cookies** son los elementos transversales
  que pide el sitemap. El aviso guarda la elección en el navegador y se puede
  cambiar desde la Política de Cookies.
- El dock inferior derecho es **un solo botón**: «Bot Falcon». Al pulsarlo se
  despliegan los canales (WhatsApp y formulario) y la nota del bot. Se cierra con
  `Esc` o haciendo clic fuera.
- **Presentación / Video institucional** figura en los wireframes 01 (Home) y 02
  (Conócenos) de la maqueta: el bloque está maquetado y espera el archivo o el
  enlace del video. El bloque de **testimonios de clientes** también está previsto
  en ambos wireframes y aparece marcado como pendiente.
- Cada sección equivale a un bloque reutilizable al llevarlo a WordPress +
  Elementor (header, hero, bento de tarjetas, proceso, cumplimiento, CTA, footer).
