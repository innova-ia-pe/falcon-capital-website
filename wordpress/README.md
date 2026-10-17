# Falcon Capital en WordPress + Elementor

El sitio se arma con el diseño aprobado del prototipo (propuesta B «Impulso», banner 1 «Vidrio») sobre WordPress,
Elementor y Elementor Pro.

| Carpeta | Qué es |
|---|---|
| `falcon-capital/` | Tema hijo de **Hello Elementor**. Cabecera, pie, estilos y script del prototipo (`assets/css/base.css`, `impulso.css` y `banner.css` sin cambios; `wp.css` con los ajustes para WordPress; `assets/js/falcon.js`, adaptado del prototipo). Los datos de contacto se editan en *Apariencia → Personalizar → Falcon Capital · datos de contacto* |
| `falcon-capital-componentes/` | Plugin con las secciones como **widgets de Elementor** (categoría «Falcon Capital») y el registro de **Solicitudes** del simulador y los formularios (`POST /wp-json/falcon/v1/solicitudes`, aviso por correo y acción `fcc_solicitud_creada` para conectar Faast). *Ajustes → Falcon Capital*: tasa del simulador, correo de avisos y botón «Crear la página Inicio» |

## Widgets del Inicio

Banner con simulador · Por qué Falcon Capital · Quiénes somos y cifras · Soluciones · Mensaje de la gerencia ·
Noticias (actualidad) · Blog (últimas entradas) · Testimonios · Seguridad y respaldo · Canales de atención ·
Llamada a la acción.

Todos los textos, fotos y enlaces se editan en Elementor. En los títulos, `*texto*` se resalta en verde. En el
banner, cada diapositiva indica dónde están las personas de su foto (para encuadrarla sin taparlas) y si muestra
el simulador.

## Instalar en un WordPress

1. Subir en este orden: tema **Hello Elementor**, plugins **Elementor** y **Elementor Pro**, tema **Falcon Capital**
   y plugin **Falcon Capital – Componentes** (zips de `falcon-capital` y `falcon-capital-componentes`).
2. Activar Elementor, Elementor Pro, el plugin y el tema Falcon Capital.
3. *Ajustes → Falcon Capital → Crear la página Inicio*.
4. *Ajustes → Enlaces permanentes*: «Nombre de la entrada».

## WordPress local (Docker)

```bash
docker compose up -d                      # http://localhost:8088  (admin / admin-local-123, solo local)
./sincronizar.sh                          # copia el tema y el plugin al contenedor después de cada cambio
./wp.sh plugin list                       # WP-CLI
```

El contenedor no comparte carpetas con Windows: `sincronizar.sh` copia los archivos con `docker cp`.
