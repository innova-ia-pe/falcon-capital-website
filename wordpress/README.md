# Falcon Capital en WordPress + Elementor

El sitio se arma con el diseño aprobado del prototipo (propuesta B «Impulso», banner 1 «Vidrio») sobre WordPress,
Elementor y Elementor Pro. Todo el contenido se edita desde WordPress: las páginas con Elementor, el blog y las
páginas legales con el editor de WordPress, y los datos generales en *Personalizar* y *Ajustes*.

| Carpeta | Qué es |
|---|---|
| `falcon-capital/` | Tema hijo de **Hello Elementor**: cabecera, pie, plantillas del blog, de las páginas de texto y del 404, estilos y script |
| `falcon-capital-componentes/` | Plugin con las secciones del sitio como **widgets de Elementor** (categoría «Falcon Capital»), el registro de **Solicitudes** y el instalador de las páginas |

## Qué se edita y dónde

| Contenido | Dónde |
|---|---|
| Inicio, Factoring, Confirming, Capital de Trabajo, Simulador, Conócenos, Blog, Contáctanos, Preguntas frecuentes, Iniciar sesión, Crea tu cuenta, Libro de Reclamaciones, Gracias | Elementor. Cada sección es un widget de la categoría «Falcon Capital»: textos, fotos, íconos, listas, botones y enlaces |
| Artículos del blog | *Entradas*: título, extracto (bajada), imagen destacada, categoría (filtros del blog) y contenido. Los títulos `h2` forman el índice del artículo y los `h3` van debajo. La entrada fijada es la destacada del blog |
| Páginas legales (Privacidad, Términos, Cookies, Reglamento, Constancia) | *Páginas*, con el editor de WordPress. El extracto es la bajada de la cabecera y el campo `fc_rotulo` el rótulo (p. ej. «Legal») |
| WhatsApp, teléfono, correo, dirección, redes, enlaces de «Iniciar sesión» y «Crea tu cuenta» | *Apariencia → Personalizar → Falcon Capital · datos de contacto* |
| Acabado del sitio: «Actual» (diseño aprobado) o «Premium» | *Apariencia → Personalizar → Falcon Capital · acabado* |
| Aviso de cookies (encendido, título y texto) | *Apariencia → Personalizar → Falcon Capital · aviso de cookies* |
| Tasa del simulador y correo que recibe las solicitudes | *Ajustes → Falcon Capital* |
| Asistente virtual: lo que sabe, lo que puede y no puede responder, modelos y claves | *Asistente → Conocimiento* y *Asistente → Ajustes* |

### Cómo se edita una página en Elementor

1. En la página, *Editar con Elementor*. El panel *Estructura* muestra cada sección con su nombre (Banner con
   simulador, Noticias, Testimonios…).
2. Clic en la sección: a la izquierda aparecen sus campos. Los cambios se ven al instante en la vista previa.
3. Las listas (noticias, cifras, beneficios, pasos, testimonios, logos, preguntas…) permiten agregar, duplicar,
   borrar y arrastrar para cambiar el orden. Una tarjeta nueva llega con texto e imagen de ejemplo para reemplazar.
4. Las fotos se eligen o se suben en la biblioteca de medios, que ya trae las fotos y logos del diseño.
5. *Publicar*.

En los títulos de los widgets, `*texto*` se resalta en verde. Los enlaces aceptan una URL, una ruta del sitio
(`/simulador/`, `#b-contacto`) o `whatsapp:` (abre el WhatsApp de Personalizar).

### Widgets

- **Inicio:** Banner con simulador · Por qué Falcon Capital · Presentación con video · Soluciones · Mensaje de la
  gerencia · Noticias (actualidad) · Blog (entradas destacadas: elegidas o las últimas) · Testimonios · Seguridad y respaldo · Canales de
  atención · Llamada a la acción.
- **Páginas internas:** Cabecera de página · Cabecera corta · ¿Qué es? y cómo funciona · Simulador de factoring ·
  Cumplimiento y marco legal · Por qué elegirnos · Partes y ventajas (confirming) · Formulario de contacto · Quiénes
  somos · Oficina · Blog (todas las entradas) · Preguntas frecuentes · Acceso (iniciar sesión o registro) · Libro de
  Reclamaciones.

En el banner, cada diapositiva indica dónde están las personas de su foto (para encuadrarla sin taparlas) y si
muestra el simulador. Los testimonios rotan solos cuando hay dos o más.

## Solicitudes

El simulador, los formularios de contacto, el boletín y el Libro de Reclamaciones guardan cada envío en
*Solicitudes* (entradas privadas), avisan al correo de *Ajustes → Falcon Capital* y disparan la acción
`fcc_solicitud_creada` para conectar el CRM (Faast).

- API: `POST /wp-json/falcon/v1/solicitudes` (JSON, o multipart si el reclamo trae adjunto). Es pública y no usa
  nonce, así una página guardada en caché sigue enviando.
- Protección: campo trampa para robots y límite de 12 envíos por hora por IP.
- Adjuntos del Libro de Reclamaciones: solo PDF, JPG o PNG de hasta 5 MB, revisados por contenido. Se guardan con
  nombre aleatorio en `wp-content/uploads/falcon-privado/` (con `.htaccess` que niega el acceso directo; en nginx
  hay que negarlo en la configuración del servidor), van adjuntos en el correo de aviso y se descargan desde la
  solicitud solo con permiso para editarla. Al borrar la solicitud para siempre, se borra el archivo.

## Asistente virtual

Chat del sitio que responde con IA usando **solo** lo que Falcon carga en WordPress. El botón flotante («Pregúntale
a Falcon») y el de la barra móvil lo abren; apagado o sin clave, siguen abriendo WhatsApp.

- **Asistente → Conocimiento:** una ficha por tema (título + texto). Cada ficha tiene el interruptor «El asistente
  puede usar este tema». `{tasa}` se reemplaza por la tasa de *Ajustes → Falcon Capital*. El instalador carga 28
  temas iniciales (`plantillas/kba.json`, armados con el brief y el prototipo) que Falcon debe revisar y completar.
  Opcional: usar también los artículos publicados del blog.
- **Asistente → Ajustes:** encendido, nombre, saludo, preguntas sugeridas, tono, temas permitidos, reglas («lo que
  nunca debe hacer»), modelo principal y respaldo, claves, límites por visitante y por día, e historial. Botón
  «Probar la conexión con los dos modelos».
- **Modelos:** Claude (`claude-haiku-5-5`) como principal y Gemini (`gemini-3.5-flash-lite`) de respaldo: si uno
  falla, responde el otro. Las claves pueden ir en `wp-config.php` (`FCC_ANTHROPIC_KEY`, `FCC_GOOGLE_KEY`) en vez
  de guardarse en la base de datos.
- **Reglas firmes en código**, además de las instrucciones: ninguna tasa distinta de la referencial (ni otro
  porcentaje que la comisión de 1 % y el IGV), nada de aprobaciones garantizadas y solo enlaces del propio sitio,
  WhatsApp o el correo de Falcon. Si el visitante quiere un ejecutivo o el asistente no sabe, ofrece WhatsApp y el
  formulario de contacto.
- **Asistente → Conversaciones:** lo que preguntan los visitantes y lo que se respondió (con el modelo que lo hizo).
- API: `POST /wp-json/falcon/v1/bot` con `{ clave, mensaje, pagina }`. El historial de cada conversación se guarda en
  el servidor (no se confía en el que mande el navegador).
- En el prototipo (GitHub Pages) el asistente funciona en **modo demostración**, sin IA: elige la ficha con más
  coincidencias en `prototipo/assets/bot-demo.js`, que se genera desde `kba.json`.

## Aviso de cookies

Aparece la primera vez y guarda la elección en el navegador (`localStorage` «fc-cookies»: `todas` o `necesarias`).
Al elegir se dispara el evento `fc:cookies` en `document`; una herramienta de medición (Analytics, píxel) debe
activarse solo si la elección es `todas`. En la Política de Cookies, un enlace a `#cookies` vuelve a mostrarlo.

## Instalar en un WordPress

1. Subir en este orden: tema **Hello Elementor**, plugins **Elementor** y **Elementor Pro**, tema **Falcon Capital**
   y plugin **Falcon Capital – Componentes** (zips de `falcon-capital` y `falcon-capital-componentes`).
2. Activar Elementor, Elementor Pro, el plugin y el tema Falcon Capital.
3. *Ajustes → Falcon Capital → Crear lo que falta*: crea las páginas con el diseño aprobado, las páginas legales
   (borradores sujetos a revisión legal), los cinco artículos del blog y los temas iniciales del asistente, y deja
   Inicio como portada. No toca lo que ya existe.
   «Restablecer las páginas al diseño original» vuelve las páginas de Elementor a la versión del diseño (se
   pierden los cambios hechos en ellas); los textos legales ya cargados no se pisan.
4. *Ajustes → Enlaces permanentes*: «Nombre de la entrada».
5. *Asistente → Ajustes*: pegar las claves de Anthropic y Google, encender el asistente y probar la conexión.

## Cómo se arma el tema

`assets/css/base.css`, `impulso.css`, `banner.css` y `paginas.css` son las hojas del prototipo
(`prototipo/assets/`) sin cambios; `wp.css` solo tiene lo propio de WordPress (barra de administración,
contenedores de Elementor y los reinicios de Elementor que pisan al diseño). `assets/js/falcon.js` es el script del
prototipo con lo propio de WordPress: imágenes del tema, tasa de *Ajustes*, envío real de las solicitudes y textos
del aviso de cookies. Un cambio de diseño se hace en el prototipo y se pasa al tema con las herramientas:

```bash
python wordpress/herramientas/tema_desde_prototipo.py        # estilos y script del tema
python wordpress/herramientas/plantillas_desde_prototipo.py  # plantillas, artículos y legales (beautifulsoup4)
python wordpress/herramientas/bot_demo_desde_kba.py          # base de ejemplo del asistente para el prototipo
python wordpress/herramientas/prototipo_v2.py                # páginas -v2 del prototipo (versión premium)
```

Las plantillas (`falcon-capital-componentes/plantillas/`) son las que usa el instalador; la del Inicio
(`inicio.json`) y la base del asistente (`kba.json`) se mantienen aparte. Los artículos y los textos legales salen de
sus páginas del prototipo (`articulo*.html`, `politica-*.html`, `terminos-y-condiciones.html`).

## WordPress local (Docker)

```bash
docker compose up -d                      # http://localhost:8088  (admin / admin-local-123, solo local)
./sincronizar.sh                          # copia el tema y el plugin al contenedor (y sube el límite de fotos a 64 MB)
./wp.sh plugin list                       # WP-CLI
```

El contenedor no comparte carpetas con Windows: `sincronizar.sh` copia los archivos con `docker cp`.

### El mismo sitio para todo el equipo

`instantanea/` guarda el WordPress local completo: la base de datos (páginas de Elementor, entradas, medios,
solicitudes, asistente y ajustes) y `wp-content` (fotos, Elementor, Elementor Pro y Hello Elementor). Con Docker
corriendo, desde esta carpeta:

```bash
bash instantanea.sh restaurar                      # deja http://localhost:8088 igual que la instantánea (reemplaza tu base local)
bash instantanea.sh guardar                        # actualiza la instantánea desde tu WordPress (luego commit y push)
FALCON_PUERTO=8090 bash instantanea.sh restaurar   # si el 8088 está ocupado
```

Lo único que no viaja es la licencia de Elementor Pro (el repositorio es público): para recibir actualizaciones de
Elementor Pro, actívala en *Elementor → Licencia*.
