/* ==========================================================================
   Falcon Capital · sitio en WordPress (tema «falcon-capital»)
   Es el script del prototipo (prototipo/assets/falcon.js) con lo propio de WordPress: imágenes del tema, tasa
   desde Ajustes → Falcon Capital, encuadre y simulador según lo que diga cada widget, y envío real de las
   solicitudes a la API del plugin «Falcon Capital – Componentes» (FC_WP.rest).
   --------------------------------------------------------------------------
   - Banner del Inicio: carrusel Factoring · Confirming · Capital de Trabajo; el simulador solo en Factoring.
   - Simulador de Factoring en tres pasos: tus datos → simulación → evaluación.
     Fórmula del instructivo de cálculo de Falcon Capital (factoring y confirming, v1 del 25/09/2026):
       factor   = (1 + TEM)^(días/30) − 1
       interés  = monto × factor          comisión = monto × 1 %
       IGV      = 18 % del interés y de la comisión (antes de redondear)
       neto     = monto − interés − comisión − IGV       (la retención no se usa)
     TARIFA.tramos: TEM por monto y plazo. Falcon debe entregar la tabla final;
     mientras tanto todos los tramos usan la TEM de pizarra acordada (1.80 %, minuta 006).
   ========================================================================== */
(function () {
  'use strict';

  var doc = document, html = doc.documentElement;
  var PAG = html.getAttribute('data-pag');
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var WP = window.FC_WP || {};
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
  function sinFalla(form) { var p = $('.b-form-err', form); if (p) p.hidden = true; }

  var TARIFA = {
    comision: 1.0,          /* % sobre el monto, en soles o dólares */
    igv: 18,
    tramos: [               /* hasta: monto máximo del tramo · tem: TEM % por plazo en días */
      { hasta: Infinity, tem: { 30: TASA, 60: TASA, 90: TASA, 120: TASA } }
    ]
  };
  var MAX = 100000000;

  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || doc).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function r2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function fmt(n) { return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function money(n, cur) { return (cur === 'USD' ? 'US$ ' : 'S/ ') + fmt(n); }
  function miles(n) { return Math.round(n).toLocaleString('en-US'); }
  function digits(v) { return parseInt(String(v).replace(/\D/g, ''), 10) || 0; }
  function guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  function leer(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function primerNombre(n) { n = (n || '').trim().split(/\s+/)[0] || ''; return n.charAt(0).toUpperCase() + n.slice(1); }

  function tem(M, dias) {
    var t = TARIFA.tramos.filter(function (x) { return M <= x.hasta; })[0] || TARIFA.tramos[TARIFA.tramos.length - 1];
    return t.tem[dias] != null ? t.tem[dias] : t.tem[30];
  }
  function cotizar(M, dias) {
    var tm = tem(M, dias);
    var factor = Math.expm1(Math.log1p(tm / 100) * dias / 30);
    var rawI = M * factor, rawC = M * TARIFA.comision / 100;
    var interes = r2(rawI), comision = r2(rawC);
    var igv = r2(r2(rawI * TARIFA.igv / 100) + r2(rawC * TARIFA.igv / 100));
    var costo = r2(interes + comision + igv);
    var neto = r2(M - costo);
    return { monto: M, dias: dias, tem: tm, interes: interes, comision: comision, igv: igv, costo: costo, neto: neto, pct: M > 0 ? neto / M : 0 };
  }

  var root = $('.P.pb');
  if (!root) return;

  /* enlaces a una sección de la misma página: desplazamiento suave */
  root.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a || e.defaultPrevented || e.button !== 0) return;
    var h = a.getAttribute('href'), dest = h.length > 1 ? doc.getElementById(h.slice(1)) : null;
    if (dest) { e.preventDefault(); dest.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  });

  /* ================================================================ aparición al bajar */
  function contar(el, ya) {
    var fin = +el.dataset.count;
    if (ya || reduce) { el.textContent = fin; return; }
    var t0 = null, dur = 1500;
    function paso(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(fin * (1 - Math.pow(1 - p, 4)));
      if (p < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, espera = parseFloat(el.style.transitionDelay) || 0;
      el.classList.add('in');
      io.unobserve(el);
      $$('[data-count]', el).forEach(function (c) { contar(c); });
      setTimeout(function () { el.classList.add('done'); el.style.transitionDelay = ''; }, espera + 1300);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;
  $$('[data-r]', root).forEach(function (el) {
    var hermanos = [].filter.call(el.parentElement.children, function (c) { return c.hasAttribute('data-r'); });
    var k = hermanos.indexOf(el);
    if (k > 0) el.style.transitionDelay = Math.min(k, 6) * 80 + 'ms';
    if (io) { $$('[data-count]', el).forEach(function (c) { c.textContent = '0'; }); io.observe(el); }
    else el.classList.add('in', 'done');
  });
  function revelarHasta(y) {
    /* al llegar a mitad de página, lo que queda arriba aparece ya listo */
    $$('[data-r]:not(.in)', root).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < y) {
        el.classList.add('instant', 'in', 'done');
        el.style.transitionDelay = '';
        if (io) io.unobserve(el);
        $$('[data-count]', el).forEach(function (c) { contar(c, true); });
      }
    });
    requestAnimationFrame(function () { requestAnimationFrame(function () { $$('.instant', root).forEach(function (el) { el.classList.remove('instant'); }); }); });
  }

  /* ================================================================ cabecera, menús */
  var hdr = $('.a-hdr, .b-hdr', root);
  var burger = $('[data-menu]', root), mmenu = $('[data-mmenu]', root);
  if (burger && mmenu) {
    burger.addEventListener('click', function () {
      var abrir = mmenu.hidden;
      mmenu.hidden = !abrir;
      burger.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      html.classList.toggle('lock', abrir);
    });
  }
  $$('.a-dd, .b-dd', root).forEach(function (dd) {
    var b = $('button', dd);
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var abrir = !dd.classList.contains('open');
      dd.classList.toggle('open', abrir);
      b.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    });
    doc.addEventListener('click', function (e) { if (!dd.contains(e.target)) { dd.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); } });
    dd.addEventListener('keydown', function (e) { if (e.key === 'Escape') { dd.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); b.focus(); } });
  });

  /* ================================================================ validación compartida */
  /* adjuntos: PDF, JPG o PNG de hasta 5 MB */
  function archivoOk(i) {
    var f = i.files && i.files[0];
    if (!f) return !i.required;
    return f.size <= 5 * 1024 * 1024 && (/^(application\/pdf|image\/jpeg|image\/png)$/.test(f.type) || /\.(pdf|jpe?g|png)$/i.test(f.name));
  }
  function valido(i) {
    var v = (i.value || '').trim();
    if (i.type === 'checkbox') return i.checked;
    if (i.type === 'radio') return true;   /* los grupos de opciones se revisan aparte */
    if (i.type === 'file') return archivoOk(i);
    if (i.tagName === 'SELECT') return !!v;
    if (i.required && !v) return false;
    if (i.name === 'nombre') return v.length >= 3 && /\s/.test(v);
    if (i.name === 'ruc') return /^(10|15|17|20)\d{9}$/.test(v);
    if (i.name === 'celular') return /^9\d{8}$/.test(v.replace(/\D/g, ''));
    if (i.name === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    if (i.name === 'razon') return v.length >= 3;
    return true;
  }
  var MENSAJES = { nombre: 'Escribe tu nombre y apellido.', ruc: 'El RUC tiene 11 dígitos y empieza con 10 o 20.',
    celular: 'Revisa tu celular: 9 dígitos y empieza con 9.', acepto: 'Acepta la Política de Privacidad para continuar.',
    email: 'Revisa tu correo.' };
  function formatear(i) {
    if (i.hasAttribute('data-digits')) i.addEventListener('input', function () { i.value = i.value.replace(/\D/g, '').slice(0, 11); });
    if (i.hasAttribute('data-phone')) {
      i.addEventListener('input', function () {
        var d = i.value.replace(/\D/g, '').slice(0, 9);
        i.value = d.replace(/^(\d{3})(\d{0,3})(\d{0,3}).*/, function (m, a, b, c) { return [a, b, c].filter(Boolean).join(' '); });
      });
    }
  }
  function contenedor(i) {
    return i.type === 'checkbox' ? i.closest('.lf-ck') : (i.closest('.lf') || i.closest('.a-inp') || i.closest('.b-f'));
  }
  function marcar(i) {
    var c = contenedor(i), bien = valido(i);
    if (c) c.classList.toggle('bad', !bien);
    i.setAttribute('aria-invalid', bien ? 'false' : 'true');
    return bien;
  }
  function vigilar(form) {
    $$('input, select, textarea', form).forEach(function (i) {
      if (i.type === 'radio') return;
      formatear(i);
      i.addEventListener('blur', function () { if (i.value || i.type === 'checkbox') i.dataset.t = '1'; if (i.dataset.t) marcar(i); });
      i.addEventListener('input', function () { if (i.dataset.t) marcar(i); });
      i.addEventListener('change', function () { if (i.type === 'checkbox' || i.type === 'file' || i.tagName === 'SELECT') { i.dataset.t = '1'; marcar(i); } });
    });
  }
  function revisar(form) {
    return $$('input[required], select[required], textarea[required], input[type="file"]', form).filter(function (i) { i.dataset.t = '1'; return !marcar(i); });
  }
  function ocupado(btn, si) {
    var lbl = $('span', btn);
    if (si) { btn.dataset.txt = lbl.textContent; lbl.textContent = 'Enviando…'; btn.classList.add('is-busy'); }
    else { lbl.textContent = btn.dataset.txt || lbl.textContent; btn.classList.remove('is-busy'); }
  }
  var lead = leer('fc-lead') || null;

  /* ================================================================ simulador en tres pasos */
  function Simulador(sim) {
    var gate = $('[data-gate]', sim), calc = $('[data-calc]', sim), evalf = $('[data-eval]', sim);
    var ok = $('.lead-ok', sim);
    var amt = $('[data-amt]', sim), curBtn = $('[data-cur]', sim), range = $('[data-range]', sim);
    var expand = $('[data-expand]', sim), panel = $('[data-panel]', sim);
    var estado = { cur: 'PEN', monto: 100000, dias: 30 }, ultimo = null, raf = 0;
    /* B: el simulador es una tarjeta vertical junto al texto del banner; al abrir la evaluación
       el banner ya no se oculta (antes la barra horizontal necesitaba ese espacio) */
    var heroSim = null;
    /* B (data-v2): las vistas de cada paso se apilan en la misma celda, así la tarjeta no cambia de alto
       al avanzar o volver; [data-en] dice en qué pasos se ve cada vista y [data-lock] en cuáles queda
       bloqueada (inert). El botón principal queda siempre en el mismo lugar. */
    var V2 = sim.hasAttribute('data-v2'), CONV = sim.hasAttribute('data-conv');
    var ORDEN = ['datos', 'simula', 'evalua', 'ok'];
    var conv = null;
    /* banner 2: la misma conversación sirve para las tres soluciones. Solo Factoring simula; Confirming y
       Capital de Trabajo pasan de tus datos al correo (solicitud de evaluación). */
    var PRODS = { factoring: 'Factoring', confirming: 'Confirming', capital: 'Capital de Trabajo' };
    function esFactoring() { return (sim.dataset.prod || 'factoring') === 'factoring'; }

    function anchoAuto(i) {
      if (!i) return;
      var m = sim._espejo;
      if (!m) {
        m = sim._espejo = doc.createElement('span');
        m.setAttribute('aria-hidden', 'true');
        m.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;left:-9999px;top:0;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums';
        sim.appendChild(m);
      }
      var cs = getComputedStyle(i);
      m.style.fontSize = cs.fontSize; m.style.fontFamily = cs.fontFamily;
      m.textContent = i.value || i.placeholder || '0';
      i.style.width = Math.ceil(m.getBoundingClientRect().width + 6) + 'px';
    }
    function anchos() { $$('[data-auto]', sim).forEach(anchoAuto); }

    function paso(n) {
      var antes = sim.dataset.step;
      sim.dataset.step = n;
      var orden = ['datos', 'simula', 'evalua', 'ok'];
      $$('[data-s]', sim).forEach(function (li) {
        li.classList.toggle('is-done', n === 'ok' || orden.indexOf(li.dataset.s) < orden.indexOf(n));
      });
      $$('[data-ir]', sim).forEach(function (b) {
        var actual = b.dataset.ir === n || (n === 'ok' && b.dataset.ir === 'evalua');
        b.disabled = b.dataset.ir !== 'datos' && !lead;
        if (b.closest('.b-steps')) b.setAttribute('aria-current', actual ? 'step' : 'false');
      });
      /* corregir datos: el botón lo dice y aparece una salida sin cambios */
      var editando = n === 'datos' && !!(lead && lead.nombre);
      sim.classList.toggle('editando', editando);
      if (V2) {
        var ni = ORDEN.indexOf(n);
        $$('[data-en]', sim).forEach(function (el) {
          var lst = el.dataset.en.split(' '), on = lst.indexOf(n) > -1, ini = ORDEN.indexOf(lst[0]);
          el.classList.toggle('is-past', !on && ini < ni);
          el.classList.toggle('is-future', !on && ini > ni);
          el.hidden = !on;
        });
        $$('[data-sub]', sim).forEach(function (el) { el.hidden = el.dataset.sub !== (editando ? 'editando' : 'nuevo'); });
        $$('[data-solo]', sim).forEach(function (el) { el.hidden = (el.dataset.solo === 'factoring') !== esFactoring(); });
        $$('[data-prod-nombre]', sim).forEach(function (el) { el.textContent = PRODS[sim.dataset.prod] || 'Factoring'; });
        $$('[data-lock]', sim).forEach(function (el) { el.classList.toggle('is-locked', el.dataset.lock.split(' ').indexOf(n) > -1); });
        $$('[data-en], [data-lock], [data-sub]', sim).forEach(function (el) {
          var fuera = el.hidden || el.classList.contains('is-locked');
          if (fuera) el.setAttribute('inert', ''); else el.removeAttribute('inert');
        });
        verDesglose(false);
        if (!CONV) {
          var gs2 = gate && $('button[type="submit"] span', gate);
          if (gs2) gs2.textContent = editando ? (sim.hasAttribute('data-doc') ? 'Guardar cambios' : 'Guardar y ver mi simulación') : 'Ver mi simulación';
        }
        if (conv) conv.pintar();
        anchos();
        return;
      }
      if (gate) gate.hidden = n !== 'datos';
      if (calc) calc.hidden = n === 'datos' || (!panel && (n === 'evalua' || n === 'ok'));
      if (evalf && !panel) evalf.hidden = n !== 'evalua';
      if (ok && !panel) ok.hidden = n !== 'ok';
      var hw = $('[data-hola-wrap]', sim);
      if (hw) hw.hidden = n === 'datos';
      var gs = gate && $('button[type="submit"] span', gate);
      if (gs) gs.textContent = editando ? 'Guardar y ver mi simulación' : 'Ver mi simulación';
      var visible = n === 'datos' ? gate : n === 'simula' ? calc : panel ? calc : n === 'evalua' ? evalf : ok;
      if (visible && antes && antes !== n && !reduce) {
        visible.classList.remove('is-entering'); void visible.offsetWidth; visible.classList.add('is-entering');
      }
      anchos();
    }
    /* desglose: en B (data-v2) es una hoja que sube sobre la tarjeta, sin cambiar su alto */
    var desgs = $$('[data-desglose]', sim), hojaD = $('.bs-sheet', sim);
    desgs.forEach(function (d) { var s = $('span', d); if (s && !d.dataset.t) d.dataset.t = s.textContent; });
    function verDesglose(on) {
      sim.classList.toggle('ver-desglose', on);
      desgs.forEach(function (d) {
        d.setAttribute('aria-expanded', on ? 'true' : 'false');
        var s = $('span', d);
        /* con hoja (B) la etiqueta no cambia: así no varía el alto de la fila */
        if (s && d.dataset.desglose !== 'x' && !hojaD) s.textContent = on ? 'Ocultar desglose' : d.dataset.t;
      });
      if (hojaD) { if (on) hojaD.removeAttribute('inert'); else hojaD.setAttribute('inert', ''); }
    }
    function saludo() {
      var n = primerNombre(lead && lead.nombre);
      $$('[data-hola]', sim).forEach(function (e) { e.textContent = n ? 'Hola, ' + n : 'Hola'; });
      $$('[data-nombre1]', sim).forEach(function (e) { e.textContent = n || 'listo'; });
      /* fila «Tus datos» (B): nombre, RUC y celular, con botón Editar */
      var w = lead || {}, partes = (w.nombre || '').trim().split(/\s+/).filter(Boolean);
      $$('[data-who-name]', sim).forEach(function (e) { e.textContent = w.nombre || 'Tus datos'; });
      $$('[data-who-meta]', sim).forEach(function (e) {
        e.textContent = [w.ruc ? 'RUC ' + w.ruc : '', w.celular ? '+51 ' + w.celular : ''].filter(Boolean).join(' · ');
      });
      $$('[data-who-ini]', sim).forEach(function (e) {
        e.textContent = ((partes[0] || '?').charAt(0) + (partes.length > 1 ? partes[partes.length - 1].charAt(0) : '')).toUpperCase();
      });
      if (conv) conv.pintar();
    }

    /* --- paso 1: datos */
    var err = gate && $('.a-gate-err, .b-gate-err', gate);
    function avisar(i) {
      if (conv) { conv.error(i); if (i) { conv.irA(i.name); setTimeout(function () { i.focus({ preventScroll: true }); }, 30); } return; }
      if (err) {
        err.hidden = !i;
        if (i) err.textContent = MENSAJES[i.name] || 'Revisa tus datos.';
        var sub = err.closest('.bs-sub');
        if (sub) sub.classList.toggle('con-error', !!i);
      }
      if (i) i.focus({ preventScroll: V2 });
    }
    function enfocar(el, t) {
      setTimeout(function () { var i = el && (el.matches('input') ? el : $('input:not([type="checkbox"])', el)); if (i) i.focus({ preventScroll: true }); }, reduce ? 0 : (t || 380));
    }
    if (gate) {
      vigilar(gate);
      gate.addEventListener('submit', function (e) {
        e.preventDefault();
        if (conv && conv.antes()) return;
        var malos = revisar(gate);
        if (malos.length) { avisar(malos[0]); return; }
        avisar(null);
        lead = { nombre: gate.elements.nombre.value.trim(), ruc: gate.elements.ruc.value.trim(),
          celular: gate.elements.celular.value.trim(), email: (lead && lead.email) || '' };
        guardar('fc-lead', lead);
        saludo();
        if (esFactoring()) {
          paso('simula');
          calcular();
          if (amt) enfocar(amt, 450);
        } else {
          paso('evalua');
          if (evalf) enfocar(evalf, 450);
        }
      });
      $$('input', gate).forEach(function (i) {
        i.addEventListener('input', function () { if (i.hasAttribute('data-auto')) anchoAuto(i); if (err && !err.hidden) avisar(null); });
      });
    }
    $$('[data-cambiar]', sim).forEach(function (b) {
      b.addEventListener('click', function () {
        lead = null;
        try { localStorage.removeItem('fc-lead'); } catch (e) { /* */ }
        if (gate) { gate.reset(); $$('.bad', gate).forEach(function (x) { x.classList.remove('bad'); }); }
        if (panel && !panel.hidden) abrirPanel(false);
        paso('datos');
        setTimeout(function () { var i = gate && $('input', gate); if (i) i.focus({ preventScroll: true }); }, 50);
      });
    });

    /* --- pasos clicables (B): volver a cualquier etapa para editar y recalcular (minuta 006).
       «Tus datos» abre el formulario con lo ya ingresado; al enviarlo se conserva la simulación. */
    function llenarGate() {
      if (!gate || !lead) return;
      ['nombre', 'ruc', 'celular'].forEach(function (k) { if (gate.elements[k]) gate.elements[k].value = lead[k] || ''; });
      if (gate.elements.acepto) gate.elements.acepto.checked = true;
      $$('.bad', gate).forEach(function (x) { x.classList.remove('bad'); });
    }
    function reabrirEnvio() {
      /* si ya se envió y la persona vuelve a editar, el formulario de evaluación queda listo para reenviar */
      if (panel && ok && evalf && !ok.hidden) { ok.hidden = true; evalf.hidden = false; }
    }
    function ir(n) {
      if (n !== 'datos' && !lead) return;
      if (V2) {
        var desde = sim.dataset.step;
        /* sin simulación (Confirming, Capital): «volver» desde el correo va a tus datos y cancelar una
           corrección regresa al correo */
        if (n === 'simula' && !esFactoring()) n = desde === 'datos' ? 'evalua' : 'datos';
        if (n === 'datos') {
          llenarGate();
          avisar(null);
          paso('datos');
          if (conv) conv.ultima(); else enfocar(gate);
        } else if (n === 'simula') {
          /* «Volver sin cambios»: lo escrito y no guardado se descarta */
          if (desde === 'datos') { llenarGate(); avisar(null); }
          paso('simula');
          calcular();
        } else {
          paso(desde === 'ok' ? 'ok' : 'evalua');
          if (evalf && desde !== 'ok') enfocar(evalf);
        }
        return;
      }
      if (n === 'datos') {
        reabrirEnvio();
        if (panel && !panel.hidden) abrirPanel(false);
        llenarGate();
        paso('datos');
        setTimeout(function () { var i = gate && $('input', gate); if (i) i.focus({ preventScroll: true }); }, 50);
      } else if (n === 'simula') {
        reabrirEnvio();
        if (panel && !panel.hidden) abrirPanel(false); else paso('simula');
        calcular();
      } else if (panel) {
        if (panel.hidden) abrirPanel(true);
      } else {
        paso('evalua');
      }
    }
    $$('[data-ir]', sim).forEach(function (b) { b.addEventListener('click', function () { ir(b.dataset.ir); }); });

    /* --- paso 2: simulación */
    function tween(els, desde, hasta, cur) {
      cancelAnimationFrame(raf);
      if (reduce || desde === null || desde === hasta) { els.forEach(function (e) { e.textContent = money(hasta, cur); }); return; }
      var t0 = null;
      function f(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 520, 1), k = 1 - Math.pow(1 - p, 3), v = desde + (hasta - desde) * k;
        els.forEach(function (el) { el.textContent = money(v, cur); });
        if (p < 1) raf = requestAnimationFrame(f);
      }
      raf = requestAnimationFrame(f);
    }
    function poner(k, t) { $$('[data-o="' + k + '"]', sim).forEach(function (e) { e.textContent = t; }); }
    function calcular() {
      var M = estado.monto, cur = estado.cur, netos = $$('[data-o="neto"]', sim);
      if (M < 1) {
        cancelAnimationFrame(raf);
        netos.forEach(function (e) { e.textContent = '—'; });
        ['pct', 'costo', 'monto', 'interes', 'comision', 'igv'].forEach(function (k) { poner(k, '—'); });
        ultimo = null; return;
      }
      var qq = cotizar(M, estado.dias);
      tween(netos, ultimo === null ? null : ultimo.neto, qq.neto, cur);
      poner('pct', (qq.pct * 100).toFixed(1) + ' %');
      poner('costo', money(qq.costo, cur));
      poner('monto', money(M, cur));
      poner('interes', '− ' + money(qq.interes, cur));
      poner('comision', '− ' + money(qq.comision, cur));
      poner('igv', '− ' + money(qq.igv, cur));
      poner('tem-l', 'TEM ' + qq.tem.toFixed(2) + ' %');
      $$('[data-split="neto"]', sim).forEach(function (e) { e.style.width = (qq.pct * 100).toFixed(2) + '%'; });
      $$('[data-split="costo"]', sim).forEach(function (e) { e.style.width = ((1 - qq.pct) * 100).toFixed(2) + '%'; });
      $$('[data-s="monto"]', sim).forEach(function (e) { e.textContent = money(M, cur); });
      $$('[data-s="dias"]', sim).forEach(function (e) { e.textContent = estado.dias + ' días'; });
      $$('[data-s="neto"]', sim).forEach(function (e) { e.textContent = money(qq.neto, cur); });
      ultimo = qq;
      var txt = 'Hola, Falcon Capital. Simulé un factoring por ' + money(M, cur) + ' a ' + estado.dias + ' días y quisiera más información.';
      $$('[data-wa]', root).forEach(function (a) { a.setAttribute('href', WA_URL + '?text=' + encodeURIComponent(txt)); });
    }
    function sincRange() {
      if (!range) return;
      var v = clamp(estado.monto, +range.min, +range.max);
      range.value = v;
      range.style.setProperty('--v', ((v - range.min) / (range.max - range.min) * 100).toFixed(2) + '%');
    }
    if (amt) {
      amt.addEventListener('input', function () {
        var n = Math.min(digits(amt.value), MAX);
        amt.value = n > 0 ? miles(n) : '';
        estado.monto = n;
        if (amt.hasAttribute('data-auto')) anchoAuto(amt);
        sincRange(); calcular();
      });
      amt.addEventListener('blur', function () {
        if (!estado.monto) { estado.monto = 100000; amt.value = miles(100000); anchos(); sincRange(); calcular(); }
      });
      amt.addEventListener('focus', function () { setTimeout(function () { try { amt.select(); } catch (e) { /* */ } }, 0); });
    }
    if (range) range.addEventListener('input', function () { estado.monto = +range.value; amt.value = miles(estado.monto); anchos(); sincRange(); calcular(); });
    if (curBtn) {
      curBtn.addEventListener('click', function () {
        estado.cur = estado.cur === 'PEN' ? 'USD' : 'PEN';
        curBtn.textContent = estado.cur === 'PEN' ? 'S/' : 'US$';
        curBtn.setAttribute('aria-label', 'Cambiar moneda, ahora ' + (estado.cur === 'PEN' ? 'soles' : 'dólares'));
        curBtn.classList.remove('flip'); void curBtn.offsetWidth; curBtn.classList.add('flip');
        ultimo = null; calcular();
      });
    }
    function ponerDias(d) {
      estado.dias = d;
      $$('[data-d]', sim).forEach(function (b) {
        var on = +b.dataset.d === d;
        if (b.getAttribute('role') === 'option') b.setAttribute('aria-selected', on ? 'true' : 'false');
        else b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var v = $('[data-days-val]', sim);
      if (v) v.textContent = d;
      calcular();
    }
    var dias = $('[data-days]', sim);
    if (dias) {
      var dbtn = $('.a-days-btn', dias);
      var abrirDias = function (v) { dias.classList.toggle('open', v); dbtn.setAttribute('aria-expanded', v ? 'true' : 'false'); };
      dbtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var abrir = !dias.classList.contains('open');
        abrirDias(abrir);
        if (abrir) { var s = $('[aria-selected="true"]', dias); if (s) s.focus(); }
      });
      $$('[role="option"]', dias).forEach(function (o) {
        o.addEventListener('click', function (e) { e.stopPropagation(); ponerDias(+o.dataset.d); abrirDias(false); dbtn.focus(); });
      });
      dias.addEventListener('keydown', function (e) {
        var ops = $$('[role="option"]', dias), k = ops.indexOf(doc.activeElement);
        if (e.key === 'Escape') { abrirDias(false); dbtn.focus(); }
        if (/Arrow(Right|Down)/.test(e.key) && k > -1) { e.preventDefault(); ops[Math.min(k + 1, ops.length - 1)].focus(); }
        if (/Arrow(Left|Up)/.test(e.key) && k > -1) { e.preventDefault(); ops[Math.max(k - 1, 0)].focus(); }
      });
      doc.addEventListener('click', function (e) { if (!dias.contains(e.target)) abrirDias(false); });
    } else {
      $$('[data-d]', sim).forEach(function (b) { b.addEventListener('click', function () { ponerDias(+b.dataset.d); }); });
    }
    var dBtn = $('[data-detail-btn]', sim), det = $('[data-detail]', sim);
    if (dBtn && det) {
      dBtn.addEventListener('click', function () {
        var abrir = !det.classList.contains('open');
        det.classList.toggle('open', abrir);
        dBtn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
        dBtn.firstChild.textContent = abrir ? 'Ocultar detalle ' : 'Ver detalle ';
      });
    }

    /* --- paso 3: evaluación (A: en la tarjeta · B: la barra se abre) */
    var pedir = $('[data-pedir]', sim);
    if (pedir) pedir.addEventListener('click', function () {
      paso('evalua');
      setTimeout(function () { var i = $('input', evalf); if (i) i.focus({ preventScroll: true }); }, reduce ? 0 : 350);
    });
    $$('[data-volver]', sim).forEach(function (b) { b.addEventListener('click', function () { paso('simula'); }); });
    function abrirPanel(v) {
      if (!expand) return;
      expand.setAttribute('aria-expanded', v ? 'true' : 'false');
      var copies = heroSim && $('.b-copies', heroSim), dotsRow = heroSim && $('.b-dots-row', heroSim);
      if (v) {
        paso(ok && !ok.hidden ? 'ok' : 'evalua');
        if (heroSim) heroSim.classList.add('is-open');
        setTimeout(function () {
          if (copies) { copies.classList.add('gone'); dotsRow.classList.add('gone'); }
          panel.hidden = false;
          var top = sim.getBoundingClientRect().top, lim = innerWidth > 760 ? 150 : 140;
          if (top < lim || top > innerHeight * 0.5) scrollBy({ top: top - lim, behavior: reduce ? 'auto' : 'smooth' });
          setTimeout(function () { var i = $('input', panel); if (i && !i.closest('[hidden]')) i.focus({ preventScroll: true }); }, 500);
        }, heroSim && !reduce ? 260 : 0);
      } else {
        panel.hidden = true;
        if (copies) { copies.classList.remove('gone'); dotsRow.classList.remove('gone'); }
        requestAnimationFrame(function () { if (heroSim) heroSim.classList.remove('is-open'); });
        if (sim.dataset.step !== 'datos') paso('simula');
      }
    }
    desgs.forEach(function (d) {
      d.addEventListener('click', function () {
        var on = d.dataset.desglose !== 'x' && !sim.classList.contains('ver-desglose');
        verDesglose(on);
        if (on && hojaD) { var x = $('[data-desglose="x"]', hojaD); if (x) setTimeout(function () { x.focus({ preventScroll: true }); }, 60); }
        else if (!on) { var b = desgs.filter(function (q) { return q.dataset.desglose !== 'x' && !q.closest('[inert]'); })[0]; if (b) b.focus({ preventScroll: true }); }
      });
    });
    if (V2) {
      sim.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sim.classList.contains('ver-desglose')) verDesglose(false); });
      if (expand) expand.addEventListener('click', function () { ir('evalua'); });
      /* Enter en el monto: pasa a la evaluación */
      if (amt) amt.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); ir('evalua'); } });
    } else if (expand && panel) {
      expand.addEventListener('click', function () { abrirPanel(panel.hidden); });
      $('[data-collapse]', panel).addEventListener('click', function () { abrirPanel(false); expand.focus(); });
      panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') { abrirPanel(false); expand.focus(); } });
    }
    if (evalf) {
      vigilar(evalf);
      if (lead && lead.email) evalf.elements.email.value = lead.email;
      evalf.addEventListener('submit', function (e) {
        e.preventDefault();
        var malos = revisar(evalf);
        if (malos.length) { malos[0].focus(); return; }
        var btn = $('.lf-send', evalf);
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
          guardar('fc-lead', lead);
          $('[data-ok-name]', ok).textContent = primerNombre(lead.nombre) || 'gracias';
          $('[data-ok-prod]', ok).textContent = esFactoring() ? 'Factoring por ' + money(estado.monto, estado.cur) + ' a ' + estado.dias + ' días'
            : PRODS[sim.dataset.prod];
          if (panel && !V2) { evalf.hidden = true; ok.hidden = false; }
          paso('ok');
          ok.focus({ preventScroll: true });
        }).catch(function (err) {
          ocupado(btn, false);
          falla(evalf, err, 'No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.');
        });
      });
    }

    /* --- estado inicial: si ya dejó sus datos, va directo a simular */
    sincRange();
    calcular();
    /* B: con datos guardados, el formulario ya los muestra (la factura los «imprime», la conversación los
       resume en etiquetas) */
    if (V2 && lead && lead.nombre) llenarGate();
    if (conv) conv.mostrar(0);
    saludo();
    paso(lead && lead.nombre ? 'simula' : 'datos');
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(anchos);
    addEventListener('resize', anchos);
    function producto(k) {
      if (!PRODS[k] || (sim.dataset.prod || 'factoring') === k) return;
      sim.dataset.prod = k;
      var st = sim.dataset.step;
      if (lead && lead.nombre && st !== 'datos') {
        if (k === 'factoring') { paso('simula'); calcular(); } else paso('evalua');
      } else paso(st);
    }
    return { el: sim, anchos: anchos, producto: producto, enfocar: function () {
      sim.classList.remove('is-flash'); void sim.offsetWidth; sim.classList.add('is-flash');
      var i = sim.dataset.step === 'datos' ? $('input', gate) : amt;
      if (i) i.focus({ preventScroll: true });
    } };
  }
  var sims = $$('[data-sim]', root).map(Simulador);

  /* ================================================================ deslizar con el dedo (carruseles) */
  function deslizar(el, fn) {
    if (!el) return;
    var x0 = null, y0 = 0;
    el.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') return; x0 = e.clientX; y0 = e.clientY; });
    el.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0, dy = e.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) fn(dx < 0 ? 1 : -1);
    });
    el.addEventListener('pointercancel', function () { x0 = null; });
  }

  /* ================================================================ fotos del banner
     Dónde está lo importante de cada foto, en fracciones de la imagen: c, las caras [x0, y0, x1, y1, peso]
     (peso menor: secundaria); b, el ancho de las personas; full, la foto no tiene personas y cubre todo el fondo. */
  var FOTOS_B = {
    'factoring-ia': { src: IMG + 'b-factoring.jpg', c: [[0.35, 0.12, 0.46, 0.35, 1], [0.555, 0.06, 0.71, 0.39, 1]], b: [0.21, 0.86] },
    'confirming-ia': { src: IMG + 'b-confirming.jpg', c: [[0.245, 0.14, 0.38, 0.4, 1], [0.5, 0.21, 0.625, 0.47, 1], [0.74, 0.03, 0.9, 0.43, 0.4]], b: [0.13, 0.97] },
    'capital-ia': { src: IMG + 'b-capital.jpg', c: [[0.3, 0.17, 0.42, 0.41, 1], [0.545, 0.09, 0.69, 0.38, 1]], b: [0.23, 0.8] }
  };

  /* dónde están las personas de una foto: lo dice el widget (data-caras: [x0, y0, x1, y1] en fracciones, o
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

  /* ================================================================ encuadre de las fotos de B (escritorio)
     Cada foto con personas se escala y se mueve para que las caras queden a la vista: fuera del texto, de la
     tarjeta y del menú. Se prueban varias escalas y posiciones y se queda la que deja más caras enteras, con
     la foto a todo el alto, cerca del centro del espacio libre y sin ampliarla de más. Donde la foto no llega
     al borde del banner la continúa su reflejo desenfocado (.bh-amb): ningún lado queda vacío. */
  function rectRel(el, box, m) {
    var r = el.getBoundingClientRect();
    return { l: r.left - box.left - m, t: r.top - box.top - m, r: r.right - box.left + m, b: r.bottom - box.top + m };
  }
  function bandaMenu(W) {
    var h = $('.b-hdr');
    return { l: 0, t: 0, r: W, b: (h ? h.offsetHeight : 84) + 24 };
  }
  function encuadreB(o) {
    var W = o.W, H = o.H, w = o.w, h = o.h, C = o.f.c, B = o.f.b || [0, 1], kc = H / h, mejor = null;
    var peso = 0, cx = 0, cy = 0, fx0 = 1, fx1 = 0, top = 1;
    C.forEach(function (c) {
      peso += c[4]; cx += c[4] * (c[0] + c[2]) / 2; cy += c[4] * (c[1] + c[3]) / 2; top = Math.min(top, c[1]);
      if (c[4] >= 0.9) { fx0 = Math.min(fx0, c[0]); fx1 = Math.max(fx1, c[2]); }
    });
    cx /= peso; cy /= peso;
    if (fx1 < fx0) { fx0 = cx - 0.05; fx1 = cx + 0.05; }
    var vis = function (l, t, r, b, tapan) {
      var A = (r - l) * (b - t);
      if (A <= 0) return 0;
      var L = Math.max(l, 0), T = Math.max(t, 0), R = Math.min(r, W), Bo = Math.min(b, H);
      if (R <= L || Bo <= T) return 0;
      var tapado = 0;
      tapan.forEach(function (q) { tapado += Math.max(0, Math.min(R, q.r) - Math.max(L, q.l)) * Math.max(0, Math.min(Bo, q.b) - Math.max(T, q.t)); });
      return Math.max(0, (R - L) * (Bo - T) - tapado) / A;
    };
    [1.2, 1.1, 1, 0.9, 0.8, 0.7, 0.62].forEach(function (m) {
      if (m < (o.kMin || 1)) return;
      var k = kc * m, iw = w * k, ih = h * k, lleno = ih >= H - 1;
      var ya = lleno ? H - ih : 0, yb = lleno ? 0 : H - ih;
      var ys = [Math.min(yb, Math.max(ya, o.idealY * H - cy * ih))];
      for (var i = 0; i <= 6; i++) ys.push(ya + (yb - ya) * i / 6);
      /* las caras, nunca pegadas al borde de la pantalla */
      var mg = Math.max(16, W * 0.03), xa = mg - fx0 * iw, xb = W - mg - fx1 * iw;
      if (xa > xb) xa = xb = (xa + xb) / 2;
      var paso = Math.max(6, (xb - xa) / 90), fade = Math.min(170, iw * 0.12), fadeV = Math.min(56, ih * 0.1);
      for (var x = xa; x <= xb + 0.5; x += paso) {
        ys.forEach(function (y) {
          /* donde la foto se funde con su reflejo (la mitad más transparente del fundido) tampoco debe haber caras */
          var tapan = o.tapan.slice();
          if (x > 0) tapan.push({ l: x, t: -1e4, r: x + fade * 0.6, b: 1e4 });
          if (x + iw < W) tapan.push({ l: x + iw - fade * 0.6, t: -1e4, r: x + iw, b: 1e4 });
          if (!lleno) { if (y > 0) tapan.push({ l: -1e4, t: y, r: 1e4, b: y + fadeV / 2 }); if (y + ih < H) tapan.push({ l: -1e4, t: y + ih - fadeV / 2, r: 1e4, b: y + ih }); }
          var vC = 0, vP = 0, medio = 0, enteras = 0, bajoTexto = 0;
          C.forEach(function (c) {
            var l = x + c[0] * iw, t = y + c[1] * ih, r = x + c[2] * iw, b = y + c[3] * ih;
            var v = vis(l, t, r, b, tapan), pw = (r - l) * 0.2, ph = (b - t) * 0.12;
            vC += c[4] * v * v * v;
            vP += c[4] * vis(l - pw, t - ph, r + pw, b + ph, tapan);
            /* una cara cortada se ve peor que una que no se ve; ante todo, que se vean enteras las principales */
            if (v > 0.02 && v < 0.92) medio += c[4];
            if (c[4] >= 0.9 && v >= 0.92) enteras++;
            /* bajo el texto una cara se sigue viendo (oscurecida) aunque no se lea: nunca ahí; detrás de la
               tarjeta, en cambio, queda oculta */
            o.tapan.forEach(function (q) {
              if (q.texto) bajoTexto += c[4] * Math.max(0, Math.min(r, q.r) - Math.max(l, q.l)) * Math.max(0, Math.min(b, q.b) - Math.max(t, q.t)) / ((r - l) * (b - t));
            });
          });
          var cuerpo = vis(x + B[0] * iw, y + top * ih, x + B[1] * iw, Math.min(H, y + ih), tapan);
          var cubre = (Math.min(W, x + iw) - Math.max(0, x)) / W;
          var s = 1000 * enteras - 1500 * bajoTexto + 70 * vC / peso + 30 * vP / peso - 30 * medio / peso + 10 * cuerpo + 14 * cubre - 70 * (1 - Math.min(1, ih / H)) -
            25 * Math.max(0, m - 1) - 10 * Math.abs(x + cx * iw - o.idealX) / W - 12 * Math.abs(y + cy * ih - o.idealY * H) / H;
          if (!mejor || s > mejor.s) mejor = { s: s, x: x, y: y, iw: iw, ih: ih, k: k, cx: cx, cy: cy, fade: fade, fadeV: fadeV, lleno: lleno };
        });
      }
    });
    return mejor;
  }
  /* aplica el encuadre a la foto y a su reflejo desenfocado */
  function colocarFoto(im, r, W, H) {
    var px = function (v) { return Math.round(v) + 'px'; };
    im.classList.add('enc');
    im.style.objectFit = 'fill';
    im.style.left = px(r.x); im.style.top = px(r.y); im.style.width = px(r.iw); im.style.height = px(r.ih);
    im.style.transformOrigin = (r.cx * 100).toFixed(1) + '% ' + (r.cy * 100).toFixed(1) + '%';
    var dentro = r.x > 0.5 || r.x + r.iw < W - 0.5 || !r.lleno;
    im.style.setProperty('--mL', r.x > 0.5 ? px(r.fade) : '0px');
    im.style.setProperty('--mR', r.x + r.iw < W - 0.5 ? px(r.fade) : '0px');
    im.style.setProperty('--mT', !r.lleno && r.y > 0.5 ? px(r.fadeV) : '0px');
    im.style.setProperty('--mB', !r.lleno && r.y + r.ih < H - 0.5 ? px(r.fadeV) : '0px');
    var a = im.nextElementSibling;
    if (!dentro) { if (a && a.classList.contains('bh-amb')) a.hidden = true; return; }
    if (!a || !a.classList.contains('bh-amb')) {
      a = doc.createElement('span');
      a.className = 'bh-amb';
      a.setAttribute('aria-hidden', 'true');
      a.innerHTML = '<i></i><i></i><i></i>';
      im.parentNode.insertBefore(a, im.nextSibling);
    }
    a.hidden = false;
    var src = im.dataset.blur || im.currentSrc || im.src;
    if (a.dataset.src !== src) {
      a.dataset.src = src;
      $$('i', a).forEach(function (i) { i.style.backgroundImage = 'url("' + src + '")'; });
    }
    a.style.left = px(r.x - r.iw); a.style.top = px(r.y); a.style.width = px(3 * r.iw); a.style.height = px(r.ih);
    a.style.transformOrigin = px(r.iw + r.cx * r.iw) + ' ' + px(r.cy * r.ih);
  }
  /* foto sin personas: cubre todo el banner */
  function cubrirFoto(im, W, H) {
    im.classList.add('enc');
    im.style.objectFit = 'cover';
    im.style.left = '0px'; im.style.top = '0px'; im.style.width = W + 'px'; im.style.height = H + 'px';
    ['--mL', '--mR', '--mT', '--mB'].forEach(function (k) { im.style.setProperty(k, '0px'); });
    var a = im.nextElementSibling;
    if (a && a.classList.contains('bh-amb')) a.hidden = true;
  }
  /* celular: la foto vuelve a su recorte con object-position */
  function soltarFoto(im) {
    im.classList.remove('enc');
    ['left', 'top', 'width', 'height', 'object-fit', 'transform-origin', '--mL', '--mR', '--mT', '--mB'].forEach(function (k) { im.style.removeProperty(k); });
    var a = im.nextElementSibling;
    if (a && a.classList.contains('bh-amb')) a.hidden = true;
  }
  /* encuadra todas las fotos de un banner: o.zonas(box) devuelve lo que tapa y dónde conviene poner las caras */
  function encuadrarFotos(imgs, box, o) {
    var W = box.width, H = box.height, res = {};
    imgs.forEach(function (im) {
      var f = fotoInfo(im);
      if (!f || f.full || !f.c) { cubrirFoto(im, W, H); return; }
      var z = o.zonas(im);
      var r = encuadreB({ W: W, H: H, w: im.naturalWidth || 2000, h: im.naturalHeight || 1125, f: f, tapan: z.tapan,
        idealX: z.idealX, idealY: o.idealY, kMin: o.kMin });
      if (!r) { cubrirFoto(im, W, H); return; }
      colocarFoto(im, r, W, H);
      res[im.dataset.k + '|' + (im.dataset.prod || im.dataset.slide)] = r;
      im._enc = r;
    });
    return res;
  }

  /* ================================================================ banner B: rota, flechas y deslizar */
  var heroB = $('.b-hero[data-hero]', root);
  if (heroB && $('.b-dots', heroB) && $('.b-hero-bg', heroB)) {
    var ordenB = $$('.b-dots [data-prod]', heroB).map(function (b) { return b.dataset.prod; });
    /* la primera diapositiva (Factoring, con el simulador) se queda más tiempo (minuta 007, A02) */
    var actualB = ordenB[0], timer = 0, quieto = false, pausa = false;
    var DUR = (+heroB.dataset.dur || 7) * 1000, DUR1 = (+heroB.dataset.dur1 || 12) * 1000;
    /* en qué diapositivas va el simulador: las marcadas con data-con-sim; si ninguna lo está, Factoring */
    var marcadasB = $$('.b-copy[data-con-sim]', heroB).length > 0;
    var conSimB = function (k) {
      if (!marcadasB) return k === 'factoring';
      var c = $('.b-copy[data-prod="' + k + '"]', heroB);
      return !!(c && c.hasAttribute('data-con-sim'));
    };
    heroB.classList.toggle('sin-sim', !conSimB(actualB));
    var durB = function () { return actualB === ordenB[0] ? DUR1 : DUR; };
    heroB.style.setProperty('--dur', durB() / 1000 + 's');
    var mostrarB = function (k) {
      actualB = k;
      $$('[data-prod]', heroB).forEach(function (el) {
        var on = el.dataset.prod === k;
        el.classList.toggle('is-on', on);
        if (el.matches('.b-dots button')) { if (on) el.setAttribute('aria-current', 'true'); else el.removeAttribute('aria-current'); return; }
        if (el.tagName !== 'IMG') { if (on) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true'); }
      });
      /* el simulador es de Factoring: en las demás diapositivas se oculta para no confundir (minuta 007, A02) */
      heroB.classList.toggle('sin-sim', !conSimB(k));
      if (typeof fondoB === 'function') fondoB();
    };
    /* avance automático: la barra de la diapositiva activa se llena en «dur»; al pausar (leer el texto o cambiar
       de pestaña) la barra y el tiempo se congelan donde iban y siguen desde ahí, sin reiniciarse ni saltar */
    var restante = 0, t0 = 0, enPausa = false;
    var avanzar = function () { var i = ordenB.indexOf(actualB); mostrarB(ordenB[(i + 1) % ordenB.length]); programar(); };
    var programar = function () {
      clearTimeout(timer);
      heroB.classList.remove('is-playing', 'en-pausa');
      enPausa = false;
      /* en celular no rota sola: la tarjeta va debajo y al ocultarse movería la página */
      if (quieto || reduce || innerWidth < 981) return;
      restante = durB();
      heroB.style.setProperty('--dur', restante / 1000 + 's');
      void heroB.offsetWidth;
      heroB.classList.add('is-playing');
      if (pausa || doc.hidden) { enPausa = true; heroB.classList.add('en-pausa'); return; }
      t0 = performance.now();
      timer = setTimeout(avanzar, restante);
    };
    var pausar = function () {
      if (enPausa || quieto || !heroB.classList.contains('is-playing')) return;
      clearTimeout(timer);
      restante = Math.max(0, restante - (performance.now() - t0));
      enPausa = true;
      heroB.classList.add('en-pausa');
    };
    var reanudar = function () {
      if (!enPausa || quieto || pausa || doc.hidden) return;
      enPausa = false;
      heroB.classList.remove('en-pausa');
      t0 = performance.now();
      timer = setTimeout(avanzar, restante);
    };
    var detener = function () { quieto = true; enPausa = false; clearTimeout(timer); heroB.classList.remove('is-playing', 'en-pausa'); };
    var moverB = function (d) { var i = ordenB.indexOf(actualB); mostrarB(ordenB[(i + d + ordenB.length) % ordenB.length]); detener(); };
    $$('.b-dots [data-prod]', heroB).forEach(function (b) { b.addEventListener('click', function () { mostrarB(b.dataset.prod); detener(); }); });
    $('[data-prev]', heroB).addEventListener('click', function () { moverB(-1); });
    $('[data-next]', heroB).addEventListener('click', function () { moverB(1); });
    deslizar($('[data-swipe]', heroB), moverB);
    var simB = $('[data-sim]', heroB);
    if (simB) { simB.addEventListener('focusin', detener); simB.addEventListener('pointerdown', detener); }
    /* se pausa mientras se lee el texto (no al pasar por cualquier parte del banner) */
    var copiasB = $('.b-copies', heroB);
    copiasB.addEventListener('mouseenter', function () { pausa = true; pausar(); });
    copiasB.addEventListener('mouseleave', function () { pausa = false; reanudar(); });
    doc.addEventListener('visibilitychange', function () { if (doc.hidden) pausar(); else reanudar(); });
    $$('[data-focus-sim]', heroB).forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation(); detener();
        var s = sims.filter(function (x) { return heroB.contains(x.el); })[0];
        if (s) s.enfocar();
      });
    });
    programar();

    /* --- encuadre (escritorio): las caras van entre el texto y la tarjeta del simulador (ver encuadreB) */
    var bgB = $('.b-hero-bg', heroB), copiesB = $('.b-copies', heroB), cardB = $('[data-sim]', heroB);
    /* fondo desenfocado con la foto del banner visible */
    var fondoB = function () {
      var im = $('img.is-on', bgB) || $('img', bgB);
      if (im) heroB.style.setProperty('--fondo', 'url("' + new URL(im.dataset.blur || im.currentSrc || im.src, location.href).href + '")');
    };
    /* borde derecho real del texto de cada banner (título, bajada y enlaces) */
    var textoDerecho = function (prod, left) {
      var copy = $('.b-copy[data-prod="' + prod + '"]', heroB), max = 0;
      if (!copy) return 0;
      $$('.b-h1, p, .b-copy-acts', copy).forEach(function (el) {
        var r = doc.createRange();
        r.selectNodeContents(el);
        [].forEach.call(r.getClientRects(), function (q) { if (q.width) max = Math.max(max, q.right); });
      });
      return max - left;
    };
    var encuadrar = function () {
      var imgs = $$('img', bgB);
      if (innerWidth < 981 || !cardB || !copiesB) {
        heroB.classList.remove('encuadre');
        imgs.forEach(soltarFoto);
        return;
      }
      heroB.classList.add('encuadre');
      var box = bgB.getBoundingClientRect(), W = box.width, maxCopy = 0;
      var card = rectRel(cardB, box, 40), menu = bandaMenu(W);
      encuadrarFotos(imgs, box, { idealY: 0.3, kMin: 0.62, zonas: function (im) {
        var copyR = Math.max(textoDerecho(im.dataset.prod, box.left), 200) + 36;
        maxCopy = Math.max(maxCopy, copyR);
        /* sin tarjeta (Confirming, Capital) la foto usa todo el espacio a la derecha del texto */
        if (!conSimB(im.dataset.prod)) return { tapan: [{ l: -1e4, t: -1e4, r: copyR, b: 1e4, texto: 1 }, menu], idealX: (copyR + W) / 2 };
        return { tapan: [{ l: -1e4, t: -1e4, r: copyR, b: 1e4, texto: 1 }, { l: card.l, t: -1e4, r: 1e4, b: 1e4 }, menu], idealX: (copyR + card.l) / 2 };
      } });
      fondoB();
      heroB.style.setProperty('--g1', (maxCopy / W * 100).toFixed(1) + '%');
      heroB.style.setProperty('--g2', ((card.l + 40) / W * 100).toFixed(1) + '%');
    };
    encuadrar();
    addEventListener('resize', encuadrar);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(encuadrar);
    $$('img', bgB).forEach(function (im) { if (!im.complete) im.addEventListener('load', encuadrar); });
    if ('ResizeObserver' in window) new ResizeObserver(encuadrar).observe(heroB);
  }

  /* ================================================================ carrusel de noticias */
  $$('[data-rail]', root).forEach(function (rail) {
    var sec = rail.closest('section');
    var prev = $('[data-rail-prev]', sec), next = $('[data-rail-next]', sec), bar = $('[data-rail-bar]', sec);
    function ancho() { var c = rail.firstElementChild; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 20) : 320; }
    function act() {
      var max = rail.scrollWidth - rail.clientWidth, vis = rail.scrollWidth ? rail.clientWidth / rail.scrollWidth : 1, p = max > 0 ? rail.scrollLeft / max : 0;
      if (bar) { bar.style.width = (vis * 100) + '%'; bar.style.transform = 'translateX(' + (p * (1 / vis - 1) * 100) + '%)'; }
      if (prev) prev.disabled = rail.scrollLeft < 4;
      if (next) next.disabled = rail.scrollLeft > max - 4;
    }
    if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -ancho(), behavior: reduce ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { rail.scrollBy({ left: ancho(), behavior: reduce ? 'auto' : 'smooth' }); });
    rail.addEventListener('scroll', act, { passive: true });
    addEventListener('resize', act);
    act();
    var abajo = false, sx = 0, sl = 0, movio = false;
    rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.button !== 0) return; abajo = true; movio = false; sx = e.clientX; sl = rail.scrollLeft; });
    addEventListener('pointermove', function (e) {
      if (!abajo) return;
      var dx = e.clientX - sx;
      if (!movio && Math.abs(dx) > 5) { movio = true; rail.classList.add('is-drag'); }
      if (movio) rail.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', function () { if (!abajo) return; abajo = false; if (movio) { rail.classList.remove('is-drag'); setTimeout(function () { movio = false; }, 0); } });
    rail.addEventListener('click', function (e) { if (movio) { e.preventDefault(); e.stopPropagation(); } }, true);
    rail.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); rail.scrollBy({ left: ancho(), behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); rail.scrollBy({ left: -ancho(), behavior: 'smooth' }); }
    });
  });

  /* ================================================================ testimonios: uno a la vez
     Los puntos cambian de testimonio; rotan solos cada 8 s, se detienen con el cursor encima o con el foco
     dentro, y en celular se pasan con el dedo. */
  $$('.b-testi', root).forEach(function (t) {
    var figs = $$('.b-testi-track > figure', t), dots = $$('.b-testi-nav button', t);
    if (figs.length < 2) return;
    var i = 0, timer = 0, quieto = false;
    function ir(n) {
      i = (n + figs.length) % figs.length;
      figs.forEach(function (f, k) { f.classList.toggle('is-on', k === i); if (k === i) f.removeAttribute('aria-hidden'); else f.setAttribute('aria-hidden', 'true'); });
      dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); if (k === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    }
    function seguir() { clearInterval(timer); if (!reduce && !quieto) timer = setInterval(function () { ir(i + 1); }, 8000); }
    dots.forEach(function (d, k) { d.addEventListener('click', function () { ir(k); seguir(); }); });
    t.addEventListener('mouseenter', function () { quieto = true; clearInterval(timer); });
    t.addEventListener('mouseleave', function () { quieto = false; seguir(); });
    t.addEventListener('focusin', function () { quieto = true; clearInterval(timer); });
    t.addEventListener('focusout', function (e) { if (!t.contains(e.relatedTarget)) { quieto = false; seguir(); } });
    deslizar($('.b-testi-track', t), function (d) { ir(i + d); seguir(); });
    seguir();
  });

  /* ================================================================ soluciones B: avanzan de lado al bajar
     En escritorio la sección queda fija y el scroll vertical mueve las tarjetas en horizontal.
     En celular (o con movimiento reducido) queda como carrusel que se desliza con el dedo. */
  $$('[data-hscroll]', root).forEach(function (pin) {
    var rail = $('[data-rail]', pin), sticky = pin.firstElementChild, activo = false;
    if (!rail || !sticky) return;
    function dist() { return Math.max(rail.scrollWidth - rail.clientWidth, 0); }
    function tope() { return parseFloat(getComputedStyle(sticky).top) || 0; }
    function recorrido() { return Math.max(pin.offsetHeight - sticky.offsetHeight, 1); }
    function mover() {
      if (!activo) return;
      var p = clamp((tope() - pin.getBoundingClientRect().top) / recorrido(), 0, 1);
      rail.scrollLeft = p * dist();
    }
    function medir() {
      activo = innerWidth > 980 && !reduce;
      pin.classList.toggle('is-h', activo);
      pin.style.height = '';
      if (!activo) return;
      /* si el título y la tarjeta no entran en la pantalla, se queda como carrusel normal (sin cortar nada) */
      if (sticky.scrollHeight > sticky.clientHeight + 2) { activo = false; pin.classList.remove('is-h'); return; }
      pin.style.height = (sticky.offsetHeight + dist()) + 'px';
      mover();
    }
    addEventListener('scroll', mover, { passive: true });
    addEventListener('resize', medir);
    addEventListener('load', medir);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(medir);
    medir();
    /* flechas: en modo lateral llevan la página hasta la tarjeta siguiente o anterior */
    $$('[data-rail-prev],[data-rail-next]', pin).forEach(function (b) {
      b.addEventListener('click', function (e) {
        if (!activo) return;
        e.stopImmediatePropagation();
        var cards = rail.children, d = dist();
        var paso = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : rail.clientWidth;
        var actual = clamp((tope() - pin.getBoundingClientRect().top) / recorrido(), 0, 1) * d;
        /* va a la tarjeta siguiente/anterior completa, alineada a su inicio */
        var idx = Math.round(actual / paso) + (b.hasAttribute('data-rail-next') ? 1 : -1);
        var dest = clamp(idx * paso, 0, d);
        var y = pin.getBoundingClientRect().top + scrollY - tope() + (d ? dest / d : 0) * recorrido();
        scrollTo({ top: Math.round(y) + 1, behavior: 'smooth' });
      }, true);
    });
    /* en modo lateral el arrastre con mouse no aplica: lo mueve el scroll */
    rail.addEventListener('pointerdown', function (e) { if (activo) e.stopImmediatePropagation(); }, true);
  });

  /* ================================================================ formularios de contacto y boletín */
  $$('[data-contacto]', root).forEach(function (form) {
    vigilar(form);
    if (lead) ['nombre', 'ruc', 'celular', 'email'].forEach(function (k) { if (lead[k] && form.elements[k] && !form.elements[k].value) form.elements[k].value = lead[k]; });
    var ok = form.parentElement.querySelector('.lead-ok');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var malos = revisar(form);
      if (malos.length) { malos[0].focus(); return; }
      var btn = $('.lf-send', form);
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
        var sel = form.elements.solucion;
        $('[data-ok-name]', ok).textContent = primerNombre(lead.nombre) || 'gracias';
        $('[data-ok-prod]', ok).textContent = sel.options[sel.selectedIndex].text;
        form.hidden = true; ok.hidden = false; ok.focus({ preventScroll: true });
      }).catch(function (err) {
        ocupado(btn, false);
        falla(form, err, 'No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.');
      });
    });
  });
  $$('[data-nl]', root).forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var i = $('input', f), bien = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value.trim());
      f.classList.toggle('bad', !bien);
      if (!bien) { i.focus(); return; }
      var correo = i.value.trim();
      enviarWP('boletin', { email: correo }).then(function () { $('.nl-ok', f).hidden = false; i.value = ''; })
        .catch(function () { f.classList.add('bad'); });
    });
  });

  $$('[data-demo]', root).forEach(function (form) {
    vigilar(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var malos = revisar(form);
      if (malos.length) { malos[0].focus(); return; }
      var n = $('[data-demo-ok]', form);
      if (n) n.hidden = false;
    });
  });

  $$('[data-reclamo]', root).forEach(function (form) {
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

  /* ================================================================ blog: filtros */
  var filtros = $('[data-filtros]', root);
  if (filtros) {
    var posts = $$('[data-posts] [data-cat]', root), vacio = $('[data-empty]', root);
    $$('button', filtros).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('button', filtros).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        var c = b.dataset.cat, n = 0;
        posts.forEach(function (p) { var on = c === '*' || p.dataset.cat === c; p.classList.toggle('is-off', !on); if (on) { n++; p.classList.add('in', 'done'); } });
        vacio.hidden = n > 0;
      });
    });
  }

  /* ================================================================ video, horario */
  var vm = $('[data-vmodal]'), vFoco = null;
  function cerrarVideo() { vm.hidden = true; html.classList.remove('lock'); if (vFoco) vFoco.focus({ preventScroll: true }); }
  if (vm) {
    $$('[data-video]', root).forEach(function (b) {
      b.addEventListener('click', function () { vFoco = b; vm.hidden = false; html.classList.add('lock'); $('.vmodal-x', vm).focus({ preventScroll: true }); });
    });
    $$('[data-close]', vm).forEach(function (c) { c.addEventListener('click', cerrarVideo); });
    vm.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarVideo(); });
  }
  function horario() {
    var o = {};
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/Lima', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false })
        .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    } catch (e) { return; }
    var lab = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(o.weekday) > -1;
    var min = (+o.hour % 24) * 60 + (+o.minute), abierto = lab && min >= 540 && min < 1080, txt;
    if (abierto) txt = 'Abierto ahora · hasta las 6:00 p. m.';
    else txt = 'Cerrado · abrimos ' + (lab && min < 540 ? 'hoy' : (o.weekday === 'Fri' || o.weekday === 'Sat' || o.weekday === 'Sun') ? 'el lunes' : 'mañana') + ' a las 9:00 a. m.';
    $$('[data-open]', root).forEach(function (el) { el.classList.toggle('is-open', abierto); $('span', el).textContent = txt; });
  }
  horario();
  setInterval(horario, 60000);

  /* palabras de la cita (B) */
  var cita = $('[data-words]', root), palabras = [];
  if (cita) {
    cita.innerHTML = cita.textContent.split(/(\s+)/).map(function (w) { return /^\s+$/.test(w) ? w : '<span class="w">' + w + '</span>'; }).join('');
    palabras = $$('.w', cita);
    if (reduce) palabras.forEach(function (w) { w.classList.add('on'); });
  }

  /* ================================================================ aviso de cookies
     Aparece la primera vez y guarda la elección en este navegador (localStorage «fc-cookies»: «todas» o
     «necesarias»). Avisa con el evento «fc:cookies» en document, para que una herramienta de medición se active
     solo si se aceptan. Los enlaces a «#cookies» (Política de Cookies) lo vuelven a mostrar. */
  /* textos y encendido desde Personalizar → Falcon Capital · aviso de cookies */
  var CK = WP.cookies || null;
  function eleccionCk() { try { return localStorage.getItem('fc-cookies'); } catch (e) { return 'sin-almacenamiento'; } }
  function avisoCookies(forzar) {
    if (!CK) return;
    var box = $('.b-ck', root);
    if (!box) {
      if (!forzar && eleccionCk()) return;
      box = doc.createElement('div');
      box.className = 'b-ck';
      box.setAttribute('role', 'region');
      box.setAttribute('aria-label', 'Aviso de cookies');
      var t = doc.createElement('b'), p = doc.createElement('p'), a = doc.createElement('a'), acts = doc.createElement('div');
      t.textContent = CK.titulo;
      p.textContent = CK.texto + ' ';
      a.href = CK.url;
      a.textContent = 'Política de Cookies';
      p.appendChild(a);
      acts.className = 'b-ck-acts';
      [['todas', 'Aceptar', 'b-btn b-btn-em'], ['necesarias', 'Solo necesarias', 'b-btn b-ck-no']].forEach(function (o) {
        var b = doc.createElement('button');
        b.type = 'button';
        b.className = o[2];
        b.textContent = o[1];
        b.addEventListener('click', function () {
          try { localStorage.setItem('fc-cookies', o[0]); } catch (e) { /* sin almacenamiento */ }
          box.classList.remove('is-on');
          doc.dispatchEvent(new CustomEvent('fc:cookies', { detail: o[0] }));
        });
        acts.appendChild(b);
      });
      box.appendChild(t); box.appendChild(p); box.appendChild(acts);
      root.appendChild(box);
      box.getBoundingClientRect();
    }
    box.classList.add('is-on');
    if (forzar) $('button', box).focus({ preventScroll: true });
  }
  setTimeout(function () { avisoCookies(false); }, reduce ? 0 : 1400);
  root.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href$="#cookies"], [data-cookies-abrir]');
    if (a) { e.preventDefault(); avisoCookies(true); }
  });

  /* ================================================================ asistente virtual
     En WordPress responde con IA desde el plugin (FC_WP.bot: Claude con Gemini de respaldo y solo la base de
     conocimiento de Falcon). En el prototipo responde en modo demostración, sin IA, con la base de conocimiento
     de ejemplo (assets/bot-demo.js). El botón flotante y el de la barra móvil abren el chat; sin asistente, siguen
     abriendo WhatsApp. La conversación se guarda en sessionStorage («fc-bot») mientras dure la visita. */
  /* asistente: lo entrega el plugin (Asistente → Ajustes); si está apagado, no hay chat */
  var BOT = WP.bot || null;
  if (BOT) (function () {
    var ICO_CHAT = '<svg viewBox="0 0 24 24"><path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.4-5.1A8.5 8.5 0 1 1 21 12z"/><path d="M8.5 11h7M8.5 14.5h4.5"/></svg>';
    var ICO_X = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>';
    var ICO_ENV = '<svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
    var waIco = $('.b-fab svg', root) ? $('.b-fab svg', root).outerHTML : '';
    var iso = (typeof IMG !== 'undefined' ? IMG : 'img/') + 'isotipo-falcon.png';
    var waTexto = WA_URL + (WA_URL.indexOf('?') < 0 ? '?' : '&') + 'text=' + encodeURIComponent('Hola, vengo del asistente de la web y quiero hablar con un ejecutivo.');
    var estado = (function () { try { return JSON.parse(sessionStorage.getItem('fc-bot') || 'null'); } catch (e) { return null; } })();
    if (!estado || !estado.clave) estado = { clave: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2), mensajes: [] };
    var panel = null, log, sug, form, campo, btnEnv, ocupadoBot = false, origen = null;

    function guardarBot() { try { sessionStorage.setItem('fc-bot', JSON.stringify(estado)); } catch (e) { /* sin almacenamiento */ } }
    function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function enlaceOk(u) { return /^(\/|#|https:\/\/wa\.me\/|mailto:[^@\s]+@falconcapital\.pe$)/i.test(u) || u.indexOf(location.origin + '/') === 0 || /^[\w-]+\.html(#[\w-]*)?$/.test(u); }
    /* formato mínimo: **negritas**, [enlaces](permitidos), listas y párrafos; todo lo demás va escapado */
    function formato(t) {
      var lineas = esc(t).split('\n'), out = [], lista = '';
      lineas.forEach(function (l) {
        l = l.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, txt, u) {
          u = u.replace(/&amp;/g, '&');
          if (!enlaceOk(u)) return txt;
          return '<a href="' + esc(u) + '"' + (/^https?:/.test(u) && u.indexOf(location.origin) !== 0 ? ' target="_blank" rel="noopener"' : '') + '>' + txt + '</a>';
        });
        var m = l.match(/^\s*(?:([-•*])|(\d+)[.)])\s+(.*)$/), tipo = m ? (m[2] ? 'ol' : 'ul') : '';
        if (lista && tipo !== lista) { out.push('</' + lista + '>'); lista = ''; }
        if (tipo) { if (!lista) { out.push('<' + tipo + '>'); lista = tipo; } out.push('<li>' + m[3] + '</li>'); }
        else if (l.trim()) out.push('<p>' + l + '</p>');
      });
      if (lista) out.push('</' + lista + '>');
      return out.join('');
    }

    /* modo demostración: elige el tema de la base de conocimiento con más coincidencias */
    function sinTildes(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
    var VACIAS = { de: 1, la: 1, el: 1, que: 1, los: 1, las: 1, por: 1, con: 1, para: 1, una: 1, mis: 1, tus: 1 };
    var GENERICAS = { falcon: 1, capital: 1, empresa: 1, empresas: 1 };   /* suman poco: aparecen en casi todo */
    function demoResponder(q) {
      var t = ' ' + sinTildes(q).replace(/[^a-z0-9ñ ]/g, ' ') + ' ';
      if (/ (ejecutivo|asesor|persona|humano|whatsapp|llamen|llamar|contacten) /.test(t)) return { texto: 'Claro. Un ejecutivo de Falcon Capital puede ayudarte: escríbenos por WhatsApp o déjanos tus datos y te contactamos.', derivar: true };
      if (/^ (hola|buenas|buenos dias|buenas tardes|buenas noches|que tal) $/.test(t.replace(/\s+/g, ' '))) return { texto: '¡Hola! ¿En qué te puedo ayudar? Puedes preguntarme por factoring, confirming, capital de trabajo, requisitos o el simulador.' };
      var mejor = null, max = 0;
      window.FC_BOT_DEMO.forEach(function (k) {
        var pts = 0, vistas = {};
        sinTildes(k.claves + ' ' + k.titulo).split(/[^a-z0-9ñ]+/).forEach(function (w) {
          if (w.length < 3 || VACIAS[w] || vistas[w]) return;
          vistas[w] = 1;
          if (t.indexOf(' ' + w) >= 0) pts += GENERICAS[w] || w.length <= 5 ? 1 : 2;
        });
        if (pts > max) { max = pts; mejor = k; }
      });
      if (!mejor || max < 2) return { texto: 'No tengo esa información en esta demostración. Un ejecutivo de Falcon Capital puede ayudarte.', derivar: true };
      return { texto: mejor.contenido.replace(/\{tasa\}/g, (typeof TASA !== 'undefined' ? +TASA : 1.8).toFixed(2)), derivar: /evaluaci|ordenes|deudas/i.test(mejor.titulo) };
    }

    function burbuja(m) {
      var d = doc.createElement('div');
      d.className = 'b-bot-m ' + (m.rol === 'usuario' ? 'b-bot-u' : 'b-bot-a');
      if (m.rol === 'usuario') d.textContent = m.texto; else d.innerHTML = formato(m.texto);
      log.appendChild(d);
      if (m.derivar) {
        var a = doc.createElement('div');
        a.className = 'b-bot-acts';
        a.innerHTML = '<a class="b-btn b-btn-em" href="' + esc(waTexto) + '" target="_blank" rel="noopener">' + waIco + 'Escribir por WhatsApp</a><a class="b-btn b-bot-alt" href="' + esc(BOT.contacto) + '">Dejar mis datos</a>';
        log.appendChild(a);
      }
    }
    function bajar() { log.scrollTop = log.scrollHeight; }
    function pintar() {
      log.innerHTML = '';
      burbuja({ rol: 'asistente', texto: BOT.saludo });
      estado.mensajes.forEach(burbuja);
      sug.hidden = estado.mensajes.length > 0;
      bajar();
    }
    function agregar(m) {
      estado.mensajes.push(m);
      if (estado.mensajes.length > 40) estado.mensajes = estado.mensajes.slice(-40);
      guardarBot();
      burbuja(m);
      sug.hidden = true;
      bajar();
    }
    function alto() { campo.style.height = 'auto'; campo.style.height = Math.min(campo.scrollHeight, 120) + 'px'; btnEnv.disabled = !campo.value.trim() || ocupadoBot; }

    function enviarBot(texto) {
      texto = (texto || '').trim().slice(0, 1000);
      if (!texto || ocupadoBot) return;
      agregar({ rol: 'usuario', texto: texto });
      campo.value = '';
      ocupadoBot = true;
      alto();
      var puntos = doc.createElement('div');
      puntos.className = 'b-bot-m b-bot-a b-bot-escribe';
      puntos.setAttribute('aria-label', 'Escribiendo');
      puntos.innerHTML = '<i></i><i></i><i></i>';
      log.appendChild(puntos);
      bajar();
      var p = BOT.demo ? new Promise(function (r) { setTimeout(function () { r(demoResponder(texto)); }, reduce ? 0 : 750); })
        : fetch(BOT.rest, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clave: estado.clave, mensaje: texto, pagina: location.pathname }) })
          .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.message || r.status); return j; }); });
      p.then(function (j) { puntos.remove(); agregar({ rol: 'asistente', texto: j.texto, derivar: !!j.derivar }); })
        .catch(function () { puntos.remove(); agregar({ rol: 'asistente', texto: 'No pude responder en este momento. Escríbenos por WhatsApp y un ejecutivo te ayudará.', derivar: true }); })
        .then(function () { ocupadoBot = false; alto(); if (panel.classList.contains('is-on')) campo.focus({ preventScroll: true }); });
    }

    function construir() {
      if (panel) return;
      panel = doc.createElement('div');
      panel.className = 'b-bot';
      panel.hidden = true;
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', BOT.nombre);
      panel.innerHTML = '<header class="b-bot-hd"><span class="b-bot-av"><img src="' + esc(iso) + '" alt=""></span>'
        + '<span class="b-bot-ti"><b>' + esc(BOT.nombre) + '</b><small><i></i>' + (BOT.demo ? 'Demostración' : 'Responde al instante') + '</small></span>'
        + '<a class="b-bot-wa" href="' + esc(waTexto) + '" target="_blank" rel="noopener" aria-label="Hablar por WhatsApp con un ejecutivo">' + waIco + '</a>'
        + '<button type="button" class="b-bot-x" aria-label="Cerrar">' + ICO_X + '</button></header>'
        + '<div class="b-bot-log" aria-live="polite"></div><div class="b-bot-sug"></div>'
        + '<form class="b-bot-in"><label class="sr-only" for="b-bot-campo">Escribe tu pregunta</label><textarea id="b-bot-campo" rows="1" maxlength="1000" placeholder="Escribe tu pregunta…"></textarea>'
        + '<button type="submit" aria-label="Enviar" disabled>' + ICO_ENV + '</button></form>'
        + '<p class="b-bot-pie">' + (BOT.demo ? 'Demostración del prototipo: respuestas de ejemplo, sin IA.' : 'Respuestas automáticas con IA. No compartas datos sensibles.') + ' <a href="' + esc(BOT.privacidad) + '">Privacidad</a></p>';
      root.appendChild(panel);
      log = $('.b-bot-log', panel); sug = $('.b-bot-sug', panel); form = $('.b-bot-in', panel); campo = $('textarea', panel); btnEnv = $('button[type=submit]', panel);
      (BOT.sugerencias || []).forEach(function (s) {
        var b = doc.createElement('button');
        b.type = 'button';
        b.textContent = s;
        b.addEventListener('click', function () { enviarBot(s); });
        sug.appendChild(b);
      });
      $('.b-bot-x', panel).addEventListener('click', cerrarBot);
      form.addEventListener('submit', function (e) { e.preventDefault(); enviarBot(campo.value); });
      campo.addEventListener('input', alto);
      campo.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarBot(campo.value); } });
      panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarBot(); });
      pintar();
    }
    function abrirBot(e) {
      if (e) e.preventDefault();
      origen = doc.activeElement;
      construir();
      panel.hidden = false;
      panel.getBoundingClientRect();
      panel.classList.add('is-on');
      html.classList.add('bot-on');
      if (matchMedia('(max-width:760px)').matches) html.classList.add('lock');
      bajar();
      setTimeout(function () { campo.focus({ preventScroll: true }); }, reduce ? 0 : 260);
    }
    function cerrarBot() {
      panel.classList.remove('is-on');
      html.classList.remove('bot-on', 'lock');
      setTimeout(function () { if (!panel.classList.contains('is-on')) panel.hidden = true; }, reduce ? 0 : 320);
      if (origen && origen.focus) origen.focus({ preventScroll: true });
    }

    /* lanzadores: botón flotante (escritorio) y botón de la barra móvil */
    var fab = $('.b-fab', root), mwa = $('.b-mbar-wa', root);
    if (fab) {
      fab.innerHTML = ICO_CHAT + '<span>Pregúntale a Falcon</span>';
      fab.removeAttribute('target');
      fab.setAttribute('aria-haspopup', 'dialog');
      fab.addEventListener('click', abrirBot);
    }
    if (mwa) {
      mwa.innerHTML = ICO_CHAT;
      mwa.classList.add('is-bot');
      mwa.removeAttribute('target');
      mwa.setAttribute('aria-label', 'Abrir el asistente virtual');
      mwa.addEventListener('click', abrirBot);
    }
    root.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('[data-bot-abrir], a[href$="#asistente"]'); if (a) abrirBot(e); });
    html.classList.add('bot-ok');
  })();

  /* botón flotante y barra móvil: aparecen al dejar atrás el primer bloque */
  /* en WordPress las secciones están dentro de los contenedores de Elementor */
  var primero = $('main > section', root) || $('.fc-main section', root);
  if (primero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { root.classList.toggle('is-past', !e.isIntersecting); }); },
      { rootMargin: '-35% 0px 0px 0px' }).observe(primero);
  }

  /* ================================================================ efectos ligados al scroll */
  var flujos = $$('[data-flow]', root), why = $('[data-why]', root);
  /* la línea de la línea de tiempo empieza y termina en el centro del primer y del último paso (minuta 006) */
  function ajustarLineas() {
    $$('.b-tl-line', root).forEach(function (l) {
      var ol = l.parentElement, ref = l.offsetParent || ol, dots = $$('.b-tl-dot', ol);
      if (dots.length < 2) return;
      /* se mide contra el bloque que contiene a la línea (su offsetParent), no contra la lista */
      var ro = ref.getBoundingClientRect(), a = dots[0].getBoundingClientRect(), z = dots[dots.length - 1].getBoundingClientRect();
      l.style.top = Math.round(a.top + a.height / 2 - ro.top - ref.clientTop) + 'px';
      l.style.bottom = Math.round(ro.bottom - ref.clientTop - (z.top + z.height / 2)) + 'px';
    });
  }
  ajustarLineas();
  addEventListener('resize', ajustarLineas);
  addEventListener('load', ajustarLineas);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(ajustarLineas);
  if ('ResizeObserver' in window) {
    var roLineas = new ResizeObserver(ajustarLineas);
    $$('.b-tl ol', root).forEach(function (ol) { roLineas.observe(ol); });
  }
  var lastY = scrollY, pend = false;
  function efectos() {
    pend = false;
    var y = scrollY, vh = innerHeight;
    if (hdr) hdr.classList.toggle('is-scrolled', y > 8);
    if (hdr) {
      var menuAbierto = mmenu && !mmenu.hidden;
      if (!menuAbierto) {
        if (y > 500 && y > lastY + 6) hdr.classList.add('is-hidden');
        else if (y < lastY - 6 || y < 500) hdr.classList.remove('is-hidden');
      }
    }
    if (flujos.length) ajustarLineas();
    flujos.forEach(function (f) {
      var r = f.getBoundingClientRect(), p = clamp((vh * 0.75 - r.top) / Math.max(r.height, 1), 0, 1);
      f.style.setProperty('--p', p.toFixed(3));
      var items = $$('li', f).filter(function (li) { return !li.closest('ul'); });
      items.forEach(function (li, i) { li.classList.toggle('is-lit', p >= (i + 0.2) / items.length); });
    });
    if (why && innerWidth > 980) {
      var cand = $$('.b-why-i', why), mid = vh * 0.5, act = 0;
      cand.forEach(function (li, i) { if (li.getBoundingClientRect().top < mid) act = i; });
      cand.forEach(function (li, i) { li.classList.toggle('is-on', i === act); });
      $$('.b-why-frame > img', why).forEach(function (im) { im.classList.toggle('is-on', +im.dataset.w === act); });
    }
    if (!reduce) {
      var vw = $('[data-scrub="video"]', root);
      if (vw) {
        var rv = vw.getBoundingClientRect(), t = clamp((vh - rv.top) / (vh * 0.8), 0, 1), e = 1 - Math.pow(1 - t, 3);
        vw.style.setProperty('--s', (0.88 + 0.12 * e).toFixed(4));
        vw.style.setProperty('--r', (44 - 16 * e).toFixed(1) + 'px');
      }
      var cb = $('[data-scrub="cta"]', root);
      if (cb) {
        var rc = cb.parentElement.getBoundingClientRect();
        if (rc.bottom > 0 && rc.top < vh) cb.style.setProperty('--y', (((rc.top + rc.height / 2) - vh / 2) / vh * -70).toFixed(1) + 'px');
      }
      if (innerWidth > 980) {
        var cards = $$('[data-stacks] .b-stack', root);   /* solo si las soluciones siguen apiladas; en carrusel horizontal no aplica */
        for (var i = 0; i < cards.length - 1; i++) {
          var sig = cards[i + 1].getBoundingClientRect().top, tope = parseFloat(getComputedStyle(cards[i + 1]).top) || 0;
          var k = clamp((vh - sig) / Math.max(vh - tope, 1), 0, 1), inner = cards[i].firstElementChild;
          inner.style.transform = 'scale(' + (1 - 0.06 * k).toFixed(4) + ')';
          inner.style.setProperty('--dim', (0.5 * k).toFixed(3));
        }
      }
      if (cita && palabras.length) {
        var rq = cita.getBoundingClientRect(), tq = clamp((vh * 0.88 - rq.top) / (rq.height + vh * 0.3), 0, 1), n = Math.round(tq * palabras.length);
        palabras.forEach(function (w, j) { w.classList.toggle('on', j < n); });
      }
    }
    lastY = y;
  }
  addEventListener('scroll', function () { if (!pend) { pend = true; requestAnimationFrame(efectos); } }, { passive: true });
  addEventListener('resize', function () { if (!pend) { pend = true; requestAnimationFrame(efectos); } });

  /* ================================================================ llegada: con ancla, a esa sección */
  function llegar() {
    if (location.hash.length > 1) {
      var d = doc.getElementById(location.hash.slice(1));
      if (d) d.scrollIntoView({ block: 'start' });
    }
    revelarHasta(innerHeight * 0.92);
    efectos();
  }
  var fontsListas = doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve();
  var tope = new Promise(function (r) { setTimeout(r, 900); });
  Promise.race([fontsListas, tope]).then(function () { requestAnimationFrame(llegar); });
})();
