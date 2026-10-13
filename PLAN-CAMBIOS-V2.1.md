# Plan de cambios — Falcon Capital V2.1

Fecha: 29/09/2026. Estado: implementación de maqueta completada; quedan pendientes las integraciones y los recursos originales indicados abajo.

Fuente: `D:\job\innova-ia\falcon-capital\FALCON CAPITAL - V2.1 comprimido.pdf`, 90 páginas. Las referencias siguientes corresponden al número físico de página del PDF.

## Criterio de aplicación

Conservar la propuesta de Innova IA donde el documento lo pide y aplicar sus correcciones de contenido, composición y navegación. Dar prioridad a las indicaciones explícitas, especialmente a los cambios generales de la página 90, sobre las cabeceras y cierres repetidos de maquetas anteriores. Mantener HTML, CSS y JavaScript del prototipo actual.

La revisión incluyó extracción de texto, vista de las 90 páginas y ampliaciones de flujos, simulador, acceso y reclamaciones. El contraste del proyecto se hizo sobre sus fuentes; no incluye aún una comparación del sitio renderizado en navegador.

## Situación actual

- Las páginas están en `prototipo/`; comparten `assets/falcon.css` y `assets/falcon.js`, pero repiten cabecera y pie en cada HTML.
- El menú todavía muestra Cómo funciona, Preguntas frecuentes y Contáctanos. Soluciones enlaza a una página general.
- Home ya contiene los tres productos, cifras, mensaje de Julio, actualidad, blog y respaldo; requiere ajustes concretos y ampliación de noticias.
- El simulador solo presenta Factoring y expresamente no calcula ni envía correos. El manejador global de formularios impide su envío.
- `mi-portal.html` describe un portal externo cuya URL está pendiente; no equivale a las dos pantallas de acceso de la nueva propuesta.
- Reclamaciones contiene únicamente identificación del consumidor y del bien contratado.
- El grafo se indexó para este repositorio (generación 2026-09-29T15:08:31Z). No encontró funciones y excluye assets e imágenes; además reportó metadatos cambiados en HTML. Por ello, las conclusiones relevantes se contrastaron mediante lectura directa. El índice no se considera evidencia de completitud.

## 1. Navegación y elementos compartidos — prioridad alta

**Referencia:** pp. 4–9, 22 y 90.

- Menú principal: Conócenos, Soluciones, Blog y Simulador; accesos Crea tu cuenta e Iniciar sesión.
- Convertir Soluciones en acceso desplegable a Factoring, Confirming y Capital de Trabajo.
- Retirar del recorrido y de los documentos de wireframes las páginas generales Cómo funciona y Todas las soluciones. Resolver todos sus enlaces antes de retirar las pantallas.
- Dejar Preguntas frecuentes accesible únicamente desde el footer.
- Aplicar la regla final de Contáctanos: enlace en footer y presencia en las páginas de producto. Retirar sus accesos del menú y los CTA redundantes fuera de productos. Conservar la página de contacto como destino del footer.
- En el footer, ordenar Factoring, Confirming, Capital de Trabajo y Simulador; sustituir “Simulador de Factoring” por “Simulador”.
- Cambiar los CTA de simulación a “Simula tu crédito” donde corresponda. Revisar también el dock de contacto para no contradecir la regla de la p. 90.

**Archivos:** todos los HTML con cabecera/pie, `assets/falcon.css`, `assets/falcon.js`, `soluciones.html`, `como-funciona.html`.

**Aceptación:** menú consistente en escritorio y móvil; ningún enlace activo a las pantallas retiradas; FAQ solo en footer.

## 2. Home y sistema visual — prioridad alta

**Referencia:** pp. 4–22.

- Integrar en el primer banner el simulador con selector de los tres productos y CTA; mantener los banners comerciales de cada solución.
- Dar mayor presencia a las fotografías de los banners en todas las páginas, controlando encuadre, superposición y contraste del texto.
- Incorporar logos de APEFAC y ON Empresas junto a las cifras, con peso visual equivalente. Reservar CAVALI y SBS para la sección de respaldo.
- Adaptar el orden a las láminas detalladas: banners, cifras/afiliaciones, presentación, mensaje de Julio, soluciones, actualidad, blog y respaldo. Conservar el espacio de video/testimonios indicado en el índice, pendiente del material.
- Quitar el fondo de la fotografía de Julio, ampliar su presencia y corregir “acompañarlas” por “acompañarlos”, incluyendo otras apariciones del mensaje.
- Igualar el tamaño de las tres tarjetas de productos, eliminar “Solución 01/02/03”, utilizar tonos verdes e imágenes que cubran su área sin márgenes internos. Subtítulo: “Tres soluciones para impulsar la liquidez de tu empresa”.
- Actualidad: subtítulo “Impulsando el futuro del factoring en el Perú”; adaptar las tarjetas e incorporar Expocobre, Expo Industria, Master Class, Copa APEFAC y aniversario de Factrack. Completar los textos existentes truncados.
- Blog: subtítulo “Entiende tus finanzas. Impulsa tu negocio”, fondos verdes e imágenes con mayor cobertura.
- Respaldo: composición centrada con texto y logos CAVALI/SBS según p. 19, conservando el lenguaje visual de Innova IA.
- Donde permanezca el bloque de contacto, usar “Canales de contacto” y reemplazar “Canal web” por “Horario de atención”. La ubicación de Home queda subordinada a la interpretación de p. 90 descrita abajo.

**Archivos:** `index.html`, `assets/falcon.css`, `assets/falcon.js`, `img/`.

**Aceptación:** productos con idéntica jerarquía, textos coincidentes con las correcciones y composición legible en ambos temas existentes.

## 3. Conócenos y actualidad — prioridad media

**Referencia:** pp. 24–35.

- Actualizar banner, presentación y bloque “Impulsamos tu crecimiento con liquidez ágil y segura”.
- Incorporar cifras y afiliaciones, respaldo con logos y el conjunto ampliado de noticias.
- Incorporar el resumen de blog mostrado en p. 33 y conservar los espacios de video/testimonios previstos, sin inventar contenido.
- Compartir contenido y criterios visuales con Home para evitar diferencias entre noticias y cifras.

**Archivo:** `conocenos.html`, estilos y recursos comunes.

## 4. Factoring, Confirming y Capital de Trabajo — prioridad alta

**Referencia:** pp. 37–59.

- Ajustar banners y CTA específicos de cada producto.
- Sustituir el proceso genérico por tres flujos visuales de cinco pasos, con iconos, imagen central y marca Falcon:
  - Factoring: envío de facturas → evaluación → registro/validación CAVALI → adelanto → pago del cliente al vencimiento.
  - Confirming: factura del proveedor → evaluación → pago al proveedor → pago de la empresa en la fecha acordada → continuidad de la cadena de suministro.
  - Capital de Trabajo: proyecto/necesidad → evaluación → financiamiento → inversión en el negocio → continuidad y crecimiento.
- Reorganizar “Por qué elegirnos” en cuatro tarjetas: respaldo financiero, desembolsos rápidos, asesoría personalizada y experiencia/respaldo legal, con propuestas de iconos/fotografía y logo.
- Rediseñar “Cumplimiento y respaldo” sobre la imagen de fondo indicada, con panel legible del marco normativo. Transcribir el contenido de referencia sin introducir afirmaciones legales nuevas.
- Mantener Contacta a un experto en las tres páginas; agregarlo en Capital de Trabajo, donde actualmente falta. Aplicar el botón “Solicita información”.
- Alinear los campos visibles con el PDF y documentar cómo “Nombre de contacto” se corresponde con nombres/apellidos actualmente previstos para el CRM.
- Integrar los actuales beneficios/pasos en la nueva composición para evitar duplicación. Revisar los requisitos existentes sin suponer que la eliminación de la página Cómo funciona implica eliminar los flujos de producto.

**Archivos:** `factoring.html`, `confirming.html`, `capital-de-trabajo.html`, estilos, interacciones e imágenes compartidas.

**Aceptación:** cada producto conserva su propio flujo; los tres tienen formulario y sección de respaldo; pasos legibles también como secuencia vertical móvil.

## 5. Simulador — prioridad alta, integración condicionada

**Referencia:** pp. 4–6 y 76.

- Crear una interfaz reutilizable en Home y `simulador.html` con selector Factoring/Confirming/Capital de Trabajo.
- Capturar nombre completo, RUC, razón social, correo, celular, moneda, monto y plazo; usar 30/60/90 días como opciones de la referencia cuando sean aplicables al producto.
- Mostrar resultado estimado, tasa y comisión con etiquetas apropiadas para cada modalidad; incorporar validaciones y estados inicial, error y resultado.
- Evitar que la rotación automática del banner interrumpa la edición del formulario.
- Mantener los resultados pendientes hasta disponer de fórmulas, tasas, comisiones y restricciones de cada producto. No presentar cifras simuladas arbitrarias como cotizaciones reales.

**Dependencias:** reglas de negocio de los tres productos y destino de los datos/cotización. La maqueta es implementable antes de recibirlas.

## 6. Blog y artículo — prioridad media

**Referencia:** pp. 61–71.

- Reorganizar el blog en destacado y agrupaciones por categoría, con selector y “Ver más”.
- Mantener Factoring, Confirming y Capital de Trabajo; esta última sigue requiriendo artículos de fuente.
- Ajustar la cabecera del artículo, autor, fecha, opciones para compartir e índice desplegable a la referencia.
- Resolver los enlaces por artículo; evitar que títulos diferentes aparenten abrir un mismo contenido definitivo. Conservar marcadores claros cuando falte el cuerpo editorial.

**Archivos:** `blog.html`, `articulo.html`, `assets/falcon.js`, estilos comunes.

## 7. Registro e inicio de sesión — prioridad media, integración condicionada

**Referencia:** pp. 80 y 82.

- Añadir las dos pantallas visuales: formulario a la izquierda e ilustración/panel de beneficios a la derecha.
- Registro: correo y opciones Google, Outlook y Microsoft según maqueta. Acceso: correo, contraseña, control de visibilidad y recuperación.
- Relacionar estos destinos con `evaluacion.html` y `mi-portal.html` para eliminar recorridos contradictorios.
- Mantener la autenticación real pendiente de la definición del portal: confirmar si las pantallas pertenecen a la web o al sistema externo, sus URL y proveedores admitidos. No asumir que dibujar los botones implica implementar OAuth o un sistema de usuarios.

**Archivos:** nuevas pantallas de registro/acceso; `evaluacion.html`, `mi-portal.html`, cabeceras y estilos.

## 8. Libro de reclamaciones — prioridad alta

**Referencia:** pp. 84–89.

- Incorporar el banner fotográfico y mantener los dos bloques existentes.
- Añadir detalle: Queja/Reclamo, ocho categorías, descripción y archivo opcional.
- Categorías: productos y servicios; infraestructura/plataforma; información y comunicación; atención del personal; facturación y pagos; seguridad y confidencialidad; procesos administrativos; otro.
- Añadir preferencia de contacto: correo, llamada, SMS o WhatsApp, y actualizar el envío al final del cuarto bloque.
- Retirar la nota que afirma que estos bloques aún no están definidos, porque V2.1 ya los proporciona.
- Incorporar validaciones de interfaz. El registro real, almacenamiento de adjuntos, constancia y notificaciones requieren un servicio receptor definido.

**Archivo:** `reclamaciones.html`, estilos e interacciones.

## Interpretaciones y pendientes que afectan la implementación

1. **Contacto:** p. 90 restringe Contáctanos, aunque páginas anteriores muestran canales y CTA en Home y otros cierres. Base propuesta: acceso en footer, formulario en productos y página de contacto accesible desde footer; retirar otros CTA de contacto. Aplicar el bloque corregido de canales donde se conserve.
2. **Soluciones:** se retira la pantalla general, pero se conservan las tres tarjetas de Home y el menú desplegable de productos, pues tienen correcciones explícitas en el PDF.
3. **Acceso:** la documentación actual define el portal como externo; V2.1 aporta pantallas propias. Se puede completar su diseño antes de resolver quién opera la autenticación.
4. **Recursos:** localizar originales de logos APEFAC/CAVALI/SBS, foto de Julio sin fondo, nuevas noticias e ilustraciones. Evaluar la calidad de extracción del PDF cuando no haya originales. Video, testimonios y artículos completos continúan pendientes.
5. **Datos operativos:** confirmar horario de atención, fórmulas del simulador, URL del portal y servicios receptores de formularios. Estos pendientes no impiden completar la maquetación.

## Orden de entrega y validación

1. Navegación, footer y estilos comunes.
2. Home y simulador visual reutilizable.
3. Tres productos y Conócenos.
4. Blog, registro/acceso y reclamaciones.
5. Actualizar `README.md`, `pantallas.html` y `wireframes.html` a V2.1, incluyendo páginas retiradas y nuevos pendientes.
6. Revisar en navegador escritorio, tableta y móvil; ambos temas; navegación por teclado; menú; carruseles; formularios y errores; enlaces y recursos. Comparar capturas con las páginas citadas del PDF.
7. Conectar y probar cálculos, autenticación y envíos cuando se disponga de sus contratos y datos. Documentar claramente qué queda visual y qué está operativo.

Cada entrega debe permitir comprobar los cambios contra el PDF, sin enlaces rotos, imágenes deformadas, texto cortado ni controles que aparenten operaciones reales inexistentes.
