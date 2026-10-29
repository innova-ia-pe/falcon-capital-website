# -*- coding: utf-8 -*-
"""Copia los estilos del prototipo al tema y genera el script del tema (prototipo + lo propio de WordPress).

uso: python wordpress/herramientas/tema_desde_prototipo.py
"""
import io
import re
import os
import shutil

R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))

P = os.path.join(R, 'prototipo', 'assets')
T = os.path.join(R, 'wordpress', 'falcon-capital', 'assets')

for a, b in (('base.css', 'css/base.css'), ('impulso.css', 'css/impulso.css'), ('banner.css', 'css/banner.css'), ('paginas.css', 'css/paginas.css'),
             ('premium.css', 'css/premium.css'), ('premium.js', 'js/premium.js')):
    shutil.copyfile(os.path.join(P, a), os.path.join(T, b))

s = io.open(os.path.join(P, 'falcon.js'), encoding='utf-8').read()
reps = [
("""/* ==========================================================================
   Falcon Capital · sitio (diseño «Impulso», banner «Vidrio»)""",
 """/* ==========================================================================
   Falcon Capital · sitio en WordPress (tema «falcon-capital»)
   Es el script del prototipo (prototipo/assets/falcon.js) con lo propio de WordPress: imágenes del tema, tasa
   desde Ajustes → Falcon Capital, encuadre y simulador según lo que diga cada widget, y envío real de las
   solicitudes a la API del plugin «Falcon Capital – Componentes» (FC_WP.rest).
   --------------------------------------------------------------------------"""),
("""  var WA_URL = 'https://wa.me/51955447475';""",
 """  var WP = window.FC_WP || {};
  var WA_URL = WP.wa || 'https://wa.me/51955447475';
  var IMG = WP.img || 'img/';
  /* wp_localize_script entrega los números como texto */
  var TASA = +WP.tasa || 1.80;
  /* envía una solicitud a WordPress; sin API (prototipo) simula la espera. Con archivo adjunto va como formulario
     (multipart). La ruta es pública: no lleva nonce, así una página guardada en caché no deja de enviar. */
  function enviarWP(tipo, datos, archivo) {
    if (!WP.rest) return new Promise(function (r) { setTimeout(r, reduce ? 0 : 900); });
    datos = datos || {};
    datos.tipo = tipo;
    datos.pagina = location.pathname;
    var cuerpo, cab = {};
    if (archivo) {
      cuerpo = new FormData();
      Object.keys(datos).forEach(function (k) { if (datos[k] !== null && datos[k] !== undefined) cuerpo.append(k, datos[k]); });
      cuerpo.append('adjunto', archivo);
    } else {
      cab['Content-Type'] = 'application/json';
      cuerpo = JSON.stringify(datos);
    }
    return fetch(WP.rest + 'solicitudes', { method: 'POST', credentials: 'same-origin', headers: cab, body: cuerpo })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok) { var e = new Error(j.message || 'HTTP ' + r.status); e.status = r.status; throw e; }
          return j;
        });
      });
  }
  /* aviso de error junto al botón de envío (en vez de una ventana del navegador) */
  function falla(form, err, porDefecto) {
    var btn = $('.lf-send', form), p = $('.b-form-err', form);
    if (!p) { p = doc.createElement('p'); p.className = 'b-form-err'; p.setAttribute('role', 'alert'); btn.insertAdjacentElement('afterend', p); }
    p.textContent = err && err.status && err.status < 500 && err.message && err.message.indexOf('HTTP') !== 0 ? err.message : porDefecto;
    p.hidden = false;
  }
  function sinFalla(form) { var p = $('.b-form-err', form); if (p) p.hidden = true; }"""),
("""      { hasta: Infinity, tem: { 30: 1.80, 60: 1.80, 90: 1.80, 120: 1.80 } }""",
 """      { hasta: Infinity, tem: { 30: TASA, 60: TASA, 90: TASA, 120: TASA } }"""),
# simulador: evaluación
("""        var btn = $('.lf-send', evalf);
        ocupado(btn, true);
        setTimeout(function () {
          ocupado(btn, false);
          lead = lead || {};
          lead.email = evalf.elements.email.value.trim();
          guardar('fc-lead', lead);""",
 """        var btn = $('.lf-send', evalf);
        ocupado(btn, true);
        var correo = evalf.elements.email.value.trim();
        sinFalla(evalf);
        enviarWP('simulador', {
          producto: sim.dataset.prod || 'factoring', nombre: lead && lead.nombre, ruc: lead && lead.ruc, celular: lead && lead.celular,
          email: correo, monto: esFactoring() ? estado.monto : null, moneda: estado.cur, dias: esFactoring() ? estado.dias : null,
          neto: esFactoring() ? cotizar(estado.monto, estado.dias).neto : null
        }).then(function () {
          ocupado(btn, false);
          lead = lead || {};
          lead.email = correo;
          guardar('fc-lead', lead);"""),
("""          paso('ok');
          ok.focus({ preventScroll: true });
        }, reduce ? 0 : 900);
      });
    }""",
 """          paso('ok');
          ok.focus({ preventScroll: true });
        }).catch(function (err) {
          ocupado(btn, false);
          falla(evalf, err, 'No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.');
        });
      });
    }"""),
# formularios de contacto
("""      var btn = $('.lf-send', form);
      ocupado(btn, true);
      setTimeout(function () {
        ocupado(btn, false);
        lead = { nombre: form.elements.nombre.value.trim(), ruc: form.elements.ruc.value.trim(), celular: form.elements.celular.value.trim(), email: form.elements.email.value.trim() };
        guardar('fc-lead', lead);
        var sel = form.elements.solucion;""",
 """      var btn = $('.lf-send', form);
      ocupado(btn, true);
      var datos = { nombre: form.elements.nombre.value.trim(), ruc: form.elements.ruc.value.trim(), celular: form.elements.celular.value.trim(), email: form.elements.email.value.trim() };
      var selc = form.elements.solucion;
      sinFalla(form);
      enviarWP('contacto', { nombre: datos.nombre, ruc: datos.ruc, celular: datos.celular, email: datos.email,
        razon: form.elements.razon ? form.elements.razon.value.trim() : '', web: form.elements.web ? form.elements.web.value : '',
        producto: selc ? selc.value : '', mensaje: form.elements.mensaje ? form.elements.mensaje.value.trim() : '' }).then(function () {
        ocupado(btn, false);
        lead = datos;
        guardar('fc-lead', lead);
        var sel = form.elements.solucion;"""),
("""        form.hidden = true; ok.hidden = false; ok.focus({ preventScroll: true });
      }, reduce ? 0 : 900);
    });""",
 """        form.hidden = true; ok.hidden = false; ok.focus({ preventScroll: true });
      }).catch(function (err) {
        ocupado(btn, false);
        falla(form, err, 'No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.');
      });
    });"""),
# Libro de Reclamaciones: se registra en WordPress (Solicitudes), con el adjunto si lo hay
("""  /* ================================================================ blog: filtros */""",
 """  $$('[data-reclamo]', root).forEach(function (form) {
    vigilar(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var malos = revisar(form);
      if (malos.length) { malos[0].focus(); return; }
      var faltan = ['tipo_solicitud', 'categoria', 'medio'].filter(function (n) { return form.querySelector('input[name="' + n + '"]') && !form.querySelector('input[name="' + n + '"]:checked'); });
      if (faltan.length) {
        var g = form.querySelector('input[name="' + faltan[0] + '"]').closest('.b-opts');
        g.classList.add('bad');
        g.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        return;
      }
      var btn = $('.lf-send', form), datos = {}, adj = form.elements.adjunto;
      [].forEach.call(form.elements, function (el) {
        if (!el.name || el.type === 'file' || el.type === 'submit') return;
        if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) return;
        datos[el.name] = el.value.trim();
      });
      ocupado(btn, true);
      sinFalla(form);
      enviarWP('reclamo', datos, adj && adj.files && adj.files[0]).then(function () {
        ocupado(btn, false);
        btn.hidden = true;
        var ok = $('[data-reclamo-ok]', form);
        if (ok) { ok.hidden = false; ok.focus({ preventScroll: true }); }
      }).catch(function (err) {
        ocupado(btn, false);
        falla(form, err, 'No pudimos registrar tu reclamo. Inténtalo de nuevo o escríbenos a nuestro correo.');
      });
    });
    form.addEventListener('change', function (e) { var g = e.target.closest && e.target.closest('.b-opts'); if (g) g.classList.remove('bad'); });
  });

  /* ================================================================ blog: filtros */"""),
("""      $('.nl-ok', f).hidden = false; i.value = '';""",
 """      var correo = i.value.trim();
      enviarWP('boletin', { email: correo }).then(function () { $('.nl-ok', f).hidden = false; i.value = ''; })
        .catch(function () { f.classList.add('bad'); });"""),
# encuadre y simulador según el widget
("""      var f = FOTOS_B[im.dataset.k];""", """      var f = fotoInfo(im);"""),
("""  /* ================================================================ encuadre de las fotos de B (escritorio)""",
 """  /* dónde están las personas de una foto: lo dice el widget (data-caras: [x0, y0, x1, y1] en fracciones, o
     data-full si no hay personas); si no, el registro de fotos */
  function fotoInfo(im) {
    if (im.hasAttribute('data-full')) return { full: true };
    if (im.dataset.caras) {
      try {
        var c = JSON.parse(im.dataset.caras);
        if (c && c.length === 4) return { c: [[c[0], c[1], c[2], c[3], 1]], b: [Math.max(0, c[0] - 0.06), Math.min(1, c[2] + 0.06)] };
      } catch (e) { /* datos inválidos: se usa el registro */ }
    }
    return FOTOS_B[im.dataset.k];
  }

  /* ================================================================ encuadre de las fotos de B (escritorio)"""),
("""      heroB.classList.toggle('sin-sim', k !== 'factoring');""", """      heroB.classList.toggle('sin-sim', !conSimB(k));"""),
("""        if (im.dataset.prod !== 'factoring') return {""", """        if (!conSimB(im.dataset.prod)) return {"""),
("""    var actualB = ordenB[0], timer = 0, quieto = false, pausa = false, DUR = 7000, DUR1 = 12000;""",
 """    var actualB = ordenB[0], timer = 0, quieto = false, pausa = false;
    var DUR = (+heroB.dataset.dur || 7) * 1000, DUR1 = (+heroB.dataset.dur1 || 12) * 1000;
    /* en qué diapositivas va el simulador: las marcadas con data-con-sim; si ninguna lo está, Factoring */
    var marcadasB = $$('.b-copy[data-con-sim]', heroB).length > 0;
    var conSimB = function (k) {
      if (!marcadasB) return k === 'factoring';
      var c = $('.b-copy[data-prod="' + k + '"]', heroB);
      return !!(c && c.hasAttribute('data-con-sim'));
    };
    heroB.classList.toggle('sin-sim', !conSimB(actualB));"""),
("""  var primero = $('main > section', root);""",
 """  /* en WordPress las secciones están dentro de los contenedores de Elementor */
  var primero = $('main > section', root) || $('.fc-main section', root);"""),
("""  var CK = { titulo: 'Usamos cookies', texto: 'Usamos cookies propias y de terceros para que la web funcione y, si lo aceptas, para medir cómo se usa y mejorarla.', url: 'politica-de-cookies.html' };""",
 """  /* textos y encendido desde Personalizar → Falcon Capital · aviso de cookies */
  var CK = WP.cookies || null;"""),
]
for a, b in reps:
    assert s.count(a) == 1, a[:80]
    s = s.replace(a, b)
# asistente virtual: en WordPress responde la IA del plugin (FC_WP.bot); sin él, el botón sigue abriendo WhatsApp
s, nbot = re.subn(r"  var BOT = window\.FC_BOT_DEMO \? \{.*?\} : null;",
                  lambda m: "  /* asistente: lo entrega el plugin (Asistente → Ajustes); si está apagado, no hay chat */\n  var BOT = WP.bot || null;",
                  s, count=1, flags=re.S)
assert nbot == 1, 'asistente'
n = s.count("src: 'img/")
s = s.replace("src: 'img/", "src: IMG + '")
io.open(os.path.join(T, 'js', 'falcon.js'), 'w', encoding='utf-8', newline='\n').write(s)
print('ok, fotos', n)
