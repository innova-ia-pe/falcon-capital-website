# Prototipo web · Falcon Capital (v2.3)

Prototipo HTML + CSS (sin framework, sin build) de la web de Falcon Capital,
más el documento de wireframes de estructura. Se implementará en **WordPress +
Elementor**: ver [`ELEMENTOR.md`](ELEMENTOR.md) para el traslado bloque por bloque.

**Propuestas de Home (maqueta v2.1):** [`propuestas.html`](propuestas.html) reúne en
un solo archivo la versión actual y dos propuestas completas del Home, A «Claridad» y
B «Impulso», con el simulador calculando con la fórmula del instructivo de Falcon.
Detalle y traslado a Elementor en [`PROPUESTAS.md`](PROPUESTAS.md).

## De dónde sale cada cosa

| Fuente | Qué se tomó |
|---|---|
| `Falcon_Capital_Maqueta_Diseño_Web_v2.0.pdf` (95 pp.) | Estructura vigente: menú, simulador, noticias, crea tu cuenta, iniciar sesión, reclamaciones |
| `Feedback (Borrador Web N°1).docx` | Correcciones del cliente sobre el borrador 1 (lista abajo) |
| `Sitemap_Falcon_Capital.pdf` | Árbol de páginas, estados del sistema y elementos transversales |
| `Manual de Identidad` (paleta y logotipo) | Propuesta nueva, paleta y variantes del logo |
| `FALCON CAPITAL BRIEF WEB ACTUALIZADO.docx` | Definiciones y beneficios de cada servicio |
| Carpetas de fotografías del cliente | Fotografías originales, optimizadas para web |

No se agregó contenido inventado. Lo que el cliente aún no entregó aparece
marcado como **pendiente**. La foto de Julio sin fondo, el logo de APEFAC, las
cinco fotos nuevas de actualidad, la imagen de «Cumplimiento y respaldo» y la
ilustración de acceso se extrajeron de la propia maqueta v2.0; conviene pedir
los archivos originales.

## Qué cambió en la v2.2

**Maqueta v2.0**

- Menú: Conócenos · Soluciones (desplegable con los tres productos) · Blog ·
  Simulador, con **Crea tu cuenta** e **Iniciar sesión**.
- Primer banner del Home = **simulador** con selector Factoring / Confirming /
  Capital de Trabajo, en **tres pasos** (tu operación → tus datos → resultado) para
  que el banner no se sature; son los mismos campos de la maqueta. El resultado se queda en **cero**, como en la maqueta, hasta
  que Falcon entregue tasas, comisiones y fórmula (no se muestran cifras supuestas).
- Actualidad: carrusel de 3 por vista con las 10 noticias y **su foto real**
  (se suman Expocobre, Expo Industria, Master Class, Copa APEFAC y Factrack).
- CTA de cierre «Simula tu crédito».
- Pantallas nuevas `registro.html` (crea tu cuenta) e `iniciar-sesion.html`.
- Libro de reclamaciones completo: cuatro bloques (tipo, ocho categorías,
  detalle, adjunto y medio de contacto).
- Se retiran la evaluación y Mi Portal como pantallas propias.

**Documento de feedback**

- Cifras con los logos de **ON Empresas** y **APEFAC** al mismo peso visual.
- Foto de **Julio sin fondo** y más grande; «acompañar**los**».
- Sin «Quiénes somos» en el Home.
- Soluciones, Actualidad y Blog: subtítulos pedidos, **fondos verdes** de la
  paleta, imagen a todo el ancho del contenedor, tarjetas del mismo tamaño y sin
  «Solución #».
- «**Información de contacto**»; «Canal web» pasa a **Horario de atención**;
  iconos más grandes.
- Pie: «Simulador» debajo de Capital de Trabajo.
- Factoring, Confirming y Capital de Trabajo: «Cumplimiento y respaldo» sobre la
  foto de fondo, con el panel **Marco normativo clave** (6 normas).
- Preguntas frecuentes solo en el pie. Contáctanos solo en el pie y en las
  páginas de producto; en el resto de cierres el segundo botón es «Crea tu cuenta».
- Se eliminan **Cómo funciona** y **Todas las soluciones** (la maqueta v2.0 aún trae
  el wireframe 03, pp. 34–38; prevalece el feedback).

Además, Capital de Trabajo gana el formulario «Contacta a un experto» (que las
otras dos soluciones ya tenían) y el botón del formulario pasa a «Solicita
información», como en la maqueta.

## Sistema visual

- Fondo teal profundo con las líneas técnicas de marca; secciones claras
  intercaladas para formularios y requisitos.
- Tarjetas de contenido (soluciones, noticias, blog) sobre **degradado verde**
  `#195b55 → #004b54 → #06343a`, con la foto a sangre y etiqueta de categoría.
- Un solo patrón de encabezado de sección: antetítulo, título y acción a la derecha.
- Sin animaciones decorativas: la mejora es de jerarquía, ritmo y lectura.

Paleta: `#004b54` · `#6fe6ad` · `#195b55` · `#00d4d2` · `#e4e4e4` · `#001125`.

### Modo claro y modo oscuro

Comparten retícula y composición; cambian superficies y acento de texto. El
conmutador está en la cabecera y recuerda la elección. El banner tiene versión
propia en cada tema: en claro la foto se funde con el fondo claro y el simulador
es una tarjeta blanca. Siguen en verde u oscuro en ambos temas: cifras, tarjetas
de contenido, marco normativo, cierre, pie y dock.

## Pantallas

| Archivo | Ruta | Maqueta v2.0 |
|---|---|---|
| `index.html` | `/` | pp. 3–20 |
| `conocenos.html` | `/conocenos/` | pp. 21–33 |
| `factoring.html` | `/soluciones/factoring/` | pp. 39–48 |
| `confirming.html` | `/soluciones/confirming/` | pp. 49–58 |
| `capital-de-trabajo.html` | `/soluciones/capital-de-trabajo/` | pp. 59–68 |
| `simulador.html` | `/simulador/` | pp. 81–84 |
| `blog.html` | `/blog/` | pp. 69–74 |
| `articulo.html` | `/blog/{slug}/` | pp. 75–80 |
| `registro.html` | `/crea-tu-cuenta/` | pp. 85–86 |
| `iniciar-sesion.html` | `/iniciar-sesion/` | pp. 87–88 |
| `reclamaciones.html` | `/libro-de-reclamaciones/` | pp. 89–95 |
| `contactanos.html` | `/contactanos/` (solo desde el pie) | — |
| `gracias.html` | `/contactanos/gracias/` | — |
| `preguntas-frecuentes.html` | `/preguntas-frecuentes/` (solo desde el pie) | — |
| páginas legales (5) | `/reglamento-de-factoring/` … | — |
| `404.html` | Estado del sistema | — |
| `pantallas.html` | Mapa del prototipo y decisiones pendientes | — |
| `wireframes.html` | Documento de estructura (congelado) | — |

## Estructura

```
prototipo/
  *.html               una página por pantalla
  assets/falcon.css    sistema de diseño; la capa «v2.2» al final reúne lo nuevo
  assets/wireframe.css estilos del documento de wireframes
  assets/falcon.js     menú, desplegable, carruseles, simulador, dock y cookies
  img/                 fotografías y logotipos del cliente, optimizados
ELEMENTOR.md           guía de traslado a WordPress + Elementor
```

Se abre con doble clic en `index.html`; las tipografías de Google Fonts
necesitan conexión.

## Notas

- Los formularios son maqueta: no envían datos a ningún servidor.
- El formulario de contacto usa los campos acordados para el CRM Faast (ticket
  D06): razón social, RUC, nombres, apellidos, email, celular, solución y
  consentimiento, más `origen` y `utm_campaign` ocultos.
- El **simulador** valida los datos y confirma el registro. Las reglas de cálculo
  van en `PRODUCTOS[x].calcular` de `falcon.js`; hoy están vacías a propósito.
- El dock inferior derecho es **un solo botón**, «Bot Falcon», que despliega
  WhatsApp y correo. Se cierra con `Esc` o haciendo clic fuera.
- Video institucional y testimonios de clientes siguen **pendientes** de material.
