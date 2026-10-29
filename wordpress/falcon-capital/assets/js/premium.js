/* ==========================================================================
   Falcon Capital · versión premium (v2)
   - Íconos propios de la marca en lugar de los genéricos: línea fina, un solo color.
   - Tarjetas con borde en degradado y una luz suave que sigue al cursor.
   Sirve igual en el prototipo y en WordPress: solo actúa si <html> tiene la clase «v2».
   ========================================================================== */
(function () {
  'use strict';
  var doc = document, html = doc.documentElement;
  if (!html.classList.contains('v2')) return;

  /* íconos propios en línea fina de un solo color, por la firma del trazo del ícono genérico que reemplazan */
  var ICONOS = {
    /* respaldo financiero */
    'M12 3l8 3v6c0 5': '<path d="M12 3 19 5.6v5.9c0 4.5-2.9 7.9-7 9.5-4.1-1.6-7-5-7-9.5V5.6z"/><path d="m8.9 12.1 2.1 2.1 4.1-4.3"/>',
    /* desembolsos rápidos */
    'M13 2 4 14h7l-1 8': '<path d="M13.2 3 6.4 13.3h5l-1 7.7 7.2-10.4h-5.1z"/>',
    /* asesoría personalizada */
    'M4 14v-2a8 8 0 0': '<path d="M4.5 14v-2a7.5 7.5 0 0 1 15 0v2"/><rect x="3.5" y="13.6" width="3.7" height="5.7" rx="1.5"/><rect x="16.8" y="13.6" width="3.7" height="5.7" rx="1.5"/><path d="M18.6 19.3c0 1.3-1.4 2.2-3.2 2.2h-2.1"/>',
    /* experiencia y respaldo legal */
    'M12 3v18M7.5 21h': '<path d="M12 4v16.5M8 20.5h8M4.5 7.5h15"/><path d="M5 7.5 2.5 13a2.5 2.5 0 0 0 5 0zM19 7.5 16.5 13a2.5 2.5 0 0 0 5 0z"/>',
    /* correo */
    'M3 7l9 6 9-6': '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m3.8 7.3 8.2 5.8 8.2-5.8"/>',
    /* horario */
    'M12 6.5V12l3.6 2': '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.6V12l3 2"/>',
    /* factoring: factura que se convierte en liquidez */
    'M14 3H7a2 2 0 0 ': '<path d="M13.4 3H7.5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.8"/><path d="M13.4 3 18.5 8.1v1.6M13.4 3v5.1h5.1M8.6 12h4.4M8.6 15.4h2.6"/><circle cx="17.2" cy="17.2" r="3.8"/><path d="m15.9 18.5 2.6-2.6M16.4 15.9h2.1V18"/>',
    /* confirming: pago a proveedores, de ida y de vuelta */
    'M4 8h14l-3.5-3.': '<path d="M4 8.5h15.5L16 5"/><path d="M20 15.5H4.5L8 19"/>',
    /* capital de trabajo */
    'M4 20h16': '<path d="M3.5 20.5h17"/><rect x="5.4" y="13.6" width="3" height="4.4" rx=".8"/><rect x="10.5" y="10" width="3" height="8" rx=".8"/><rect x="15.6" y="6.4" width="3" height="11.6" rx=".8"/>'
  };
  function firma(svg) {
    var p = svg.querySelector('path');
    return p ? (p.getAttribute('d') || '').replace(/\s+/g, ' ') : '';
  }
  doc.querySelectorAll('svg').forEach(function (svg) {
    if (svg.classList.contains('fci')) return;
    var f = firma(svg);
    for (var k in ICONOS) {
      if (f.indexOf(k) === 0) {
        svg.innerHTML = ICONOS[k];
        svg.classList.add('fci');
        svg.classList.remove('g');
        break;
      }
    }
  });

  /* WhatsApp en la ficha de canales: el logo en línea fina, del mismo peso que los demás */
  doc.querySelectorAll('.b-ch-i svg.g').forEach(function (svg) {
    if (firma(svg).indexOf('M17.47 14.38') !== 0) return;
    svg.innerHTML = '<path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.3-4.2a8.5 8.5 0 1 1 15.7-4.5z"/>'
      + '<path d="M9.3 8.4c.2-.3.5-.4.8-.3l.9.3c.3.1.4.3.5.6l.3 1c.1.3 0 .6-.2.8l-.6.5a6.2 6.2 0 0 0 2.8 2.8l.5-.6c.2-.2.5-.3.8-.2l1 .3c.3.1.5.3.6.5l.3.9c.1.3 0 .6-.3.8-.7.5-1.6.6-2.5.3a8.7 8.7 0 0 1-5-5c-.3-.9-.2-1.8.3-2.5z"/>';
    svg.classList.remove('g');
    svg.classList.add('fci');
  });

  /* tarjetas con borde en degradado y luz */
  var TARJETAS = '.b-sim,.b-ben-in,.b-ben li,.b-stats li,.b-group-i,.b-ch,.b-seals figure>span,.b-norm-seals span,.b-bubble,.b-ft-news,'
    + '.b-contact-card,.b-stack-in,.b-partes li,.b-faq details,.b-toc';
  doc.querySelectorAll(TARJETAS).forEach(function (el) {
    if (el.querySelector(':scope > .fx')) return;
    var i = doc.createElement('i');
    i.className = 'fx';
    i.setAttribute('aria-hidden', 'true');
    el.appendChild(i);
    el.classList.add('fx-on');
  });
  var ultimo = null, cuadro = 0;
  doc.addEventListener('pointermove', function (e) {
    ultimo = e;
    if (cuadro) return;
    cuadro = requestAnimationFrame(function () {
      cuadro = 0;
      var el = ultimo.target && ultimo.target.closest && ultimo.target.closest('.fx-on');
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (ultimo.clientX - r.left) + 'px');
      el.style.setProperty('--my', (ultimo.clientY - r.top) + 'px');
    });
  }, { passive: true });

  /* prototipo: los enlaces que arma el script (aviso de cookies, asistente) también llevan a las páginas -v2 */
  if (/-v2\.html$/.test(location.pathname)) {
    doc.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      var m = (a.getAttribute('href') || '').match(/^([\w-]+)\.html(#.*)?$/);
      if (m && !/-v2$/.test(m[1])) a.setAttribute('href', m[1] + '-v2.html' + (m[2] || ''));
    }, true);
  }
})();
