/* ==========================================================================
   Falcon Capital · Propuestas A y B
   - Cada página trae las dos propuestas; solo se inicializa la visible.
   - Cambiar de versión recarga la página limpia (sin estados rotos) y vuelve a la
     misma sección.
   - Simulador de Factoring en tres pasos: tus datos → simulación → evaluación.
     Fórmula del instructivo de cálculo de Falcon Capital (factoring y confirming,
     v1 del 25/09/2026):
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
  var MODO = html.getAttribute('data-p');
  var PAG = html.getAttribute('data-pag');
  var VISOR = html.hasAttribute('data-visor');
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var WA_URL = 'https://wa.me/51955447475';

  var TARIFA = {
    comision: 1.0,          /* % sobre el monto, en soles o dólares */
    igv: 18,
    tramos: [               /* hasta: monto máximo del tramo · tem: TEM % por plazo en días */
      { hasta: Infinity, tem: { 30: 1.80, 60: 1.80, 90: 1.80, 120: 1.80 } }
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

  /* ================================================================ barra */
  var pbar = $('[data-pbar]');
  var tabs = $$('[data-go]', pbar);
  var ind = $('.pbar-ind', pbar);
  var frame = $('iframe.actual');
  var archivo = PAG + '.html';

  function marcarTabs() {
    tabs.forEach(function (t) { t.setAttribute('aria-selected', !VISOR && t.dataset.go === MODO ? 'true' : 'false'); });
    var t = $('[data-go="' + MODO + '"]', pbar);
    if (!t) return;
    ind.style.width = t.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + t.offsetLeft + 'px)';
    ind.classList.toggle('is-dim', VISOR);
  }
  function seccionVisible() {
    var r0 = $('.P[data-prop="' + MODO + '"]');
    if (!r0) return null;
    var mid = innerHeight * 0.38, best = null;
    $$('[data-sec]', r0).forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.height && r.top <= mid && r.bottom > mid) best = { k: s.dataset.sec, f: (mid - r.top) / r.height };
    });
    return best;
  }
  /* En archivos locales (file://) Chrome recuerda el zoom por dirección completa, con «?» y «#» incluidos: cada
     banner o versión quedaba con su propio zoom y el header y el banner cambiaban de tamaño. Ahí se navega a la
     página sin parámetros y la elección viaja por localStorage (versión y banner, que ya lee el <head>) y
     sessionStorage (sección o ancla). En la web (GitHub Pages) el zoom es uno por sitio y se conservan las
     direcciones con parámetros, que sirven para compartir. */
  var LOCAL = location.protocol === 'file:';
  function sinParametros(url) {
    var m = /^([^?#]*)(\?[^#]*)?(#.*)?$/.exec(url);
    if (!m || /(^\?|&)u=/.test(m[2] || '')) return url;
    var q = new URLSearchParams((m[2] || '').slice(1));
    try {
      if (q.get('p')) localStorage.setItem('fc-prop', q.get('p'));
      if (q.get('h')) localStorage.setItem('fc-hb', q.get('h'));
      if (m[3]) sessionStorage.setItem('fc-ir', m[3]); else sessionStorage.removeItem('fc-ir');
    } catch (e) { return url; }
    return m[1];
  }
  function navegar(url, destino) {
    if (LOCAL && /\.html/.test(url)) url = sinParametros(url);
    html.classList.remove('va-a', 'va-b', 'va-actual');
    if (destino) html.classList.add('va-' + destino);
    html.classList.add('saliendo');
    setTimeout(function () { location.href = url; }, reduce ? 0 : 170);
  }
  function irVersion(p) {
    if (VISOR) { navegar('index.html?p=' + p, p); return; }
    if (p === MODO) {
      if (p === 'actual' && frame) frame.setAttribute('src', frame.dataset.src);
      return;
    }
    var sec = (MODO === 'a' || MODO === 'b') ? seccionVisible() : null;
    var hash = sec ? '#ir=' + sec.k + ',' + sec.f.toFixed(3) : '';
    try { localStorage.setItem('fc-prop', p); } catch (e) { /* */ }
    navegar(archivo + '?p=' + p + hash, p);
  }
  tabs.forEach(function (t) {
    t.setAttribute('href', (VISOR ? 'index.html' : archivo) + '?p=' + t.dataset.go);
    t.addEventListener('click', function (e) { e.preventDefault(); irVersion(t.dataset.go); });
  });
  /* menú de páginas: conserva la versión elegida */
  var pages = $('.pbar-pages', pbar);
  if (pages) {
    var pgBtn = $('.pbar-pg-btn', pages);
    $$('.pbar-pg-menu a', pages).forEach(function (a) {
      var dest = MODO === 'actual' ? 'actual' : (MODO || 'a');
      a.setAttribute('href', a.dataset.pg + '.html?p=' + dest);
      a.addEventListener('click', function (e) { e.preventDefault(); navegar(a.getAttribute('href'), dest); });
    });
    pgBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var abrir = !pages.classList.contains('open');
      pages.classList.toggle('open', abrir);
      pgBtn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    });
    doc.addEventListener('click', function (e) {
      if (!pages.contains(e.target)) { pages.classList.remove('open'); pgBtn.setAttribute('aria-expanded', 'false'); }
    });
  }
  var notesBtn = $('.pbar-more', pbar), notes = $('#pbar-notes');
  function cerrarNotas() { notes.hidden = true; notesBtn.setAttribute('aria-expanded', 'false'); }
  notesBtn.addEventListener('click', function () {
    var abrir = notes.hidden;
    notes.hidden = !abrir;
    notesBtn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
  });
  doc.addEventListener('click', function (e) { if (!notes.hidden && !pbar.contains(e.target)) cerrarNotas(); });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !notes.hidden) cerrarNotas();
    var t = e.target;
    if (e.altKey || e.ctrlKey || e.metaKey || /input|textarea|select/i.test(t.tagName) || t.isContentEditable) return;
    var mapa = { '1': 'actual', '2': 'a', '3': 'b' };
    if (mapa[e.key]) irVersion(mapa[e.key]);
  });
  addEventListener('resize', marcarTabs);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(marcarTabs);
  marcarTabs();
  /* el velo se retira al terminar de pintar; también al volver con «atrás» */
  addEventListener('pageshow', function (e) { if (e.persisted) { html.classList.remove('saliendo'); html.classList.add('listo'); } });

  /* ================================================================ versión actual y visor */
  if (VISOR) {
    var q = new URLSearchParams(location.search);
    var u = q.get('u') || '';
    var nombres = window.FC_EXTERNAS || {};
    if (!Object.prototype.hasOwnProperty.call(nombres, u)) u = 'index';
    frame.setAttribute('src', '../' + u + '.html');
    frame.hidden = false;
    var back = $('[data-back]');
    var de = q.get('p') === 'b' ? 'b' : 'a';
    var ref = doc.referrer && /\/propuestas\/[a-z-]+\.html/.test(doc.referrer) ? doc.referrer : 'index.html?p=' + de;
    back.setAttribute('href', ref);
    $('[data-back-to]').textContent = 'Volver a la propuesta ' + de.toUpperCase();
    $('[data-back-page]').textContent = (nombres[u] || 'Página') + ' · diseño actual';
    back.addEventListener('click', function (e) { e.preventDefault(); navegar(ref, de); });
    requestAnimationFrame(function () { html.classList.add('listo'); });
    return;
  }
  if (MODO === 'actual') {
    frame.setAttribute('src', frame.dataset.src);
    frame.hidden = false;
    requestAnimationFrame(function () { html.classList.add('listo'); });
    return;
  }

  var root = $('.P[data-prop="' + MODO + '"]');
  if (!root) { html.classList.add('listo'); return; }
  var X = MODO;

  /* B · tres banners del Home (1 Vidrio, 2 Conversación, 3 Factura): queda solo el elegido.
     Cambiar de banner recarga la página, igual que cambiar de versión. */
  var HB = html.getAttribute('data-hb');
  if (!HB) { try { HB = localStorage.getItem('fc-hb'); } catch (e) { /* */ } }
  if (!/^[123]$/.test(HB || '')) HB = '1';
  $$('[data-hv]', root).forEach(function (s) { if (s.dataset.hv !== HB) s.parentNode.removeChild(s); });
  /* el selector está en todas las páginas de B: fuera del Inicio lleva al Inicio con ese banner */
  $$('[data-hb]', pbar).forEach(function (b) {
    b.setAttribute('aria-pressed', b.dataset.hb === HB ? 'true' : 'false');
    b.addEventListener('click', function () {
      if (PAG === 'index' && b.dataset.hb === HB) return;
      try { localStorage.setItem('fc-hb', b.dataset.hb); } catch (e) { /* */ }
      navegar('index.html?p=b&h=' + b.dataset.hb, 'b');
    });
  });

  /* enlaces a otras páginas: salida con el velo, sin perder la versión */
  root.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
    var h = a.getAttribute('href') || '';
    if (h.charAt(0) === '#') {
      var dest = h.length > 1 ? doc.getElementById(h.slice(1)) : null;
      if (dest) { e.preventDefault(); dest.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
      return;
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(h) || !/\.html/.test(h)) return;
    e.preventDefault();
    navegar(h, X);
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
  function valido(i) {
    var v = (i.value || '').trim();
    if (i.type === 'checkbox') return i.checked;
    if (i.tagName === 'SELECT') return !!v;
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
    $$('input, select', form).forEach(function (i) {
      formatear(i);
      i.addEventListener('blur', function () { if (i.value || i.type === 'checkbox') i.dataset.t = '1'; if (i.dataset.t) marcar(i); });
      i.addEventListener('input', function () { if (i.dataset.t) marcar(i); });
      i.addEventListener('change', function () { if (i.type === 'checkbox' || i.tagName === 'SELECT') marcar(i); });
    });
  }
  function revisar(form) {
    return $$('input[required], select[required]', form).filter(function (i) { i.dataset.t = '1'; return !marcar(i); });
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
    /* --- B2 · conversación: «Tus datos» se pide una pregunta a la vez; cada respuesta queda como una
       etiqueta arriba y basta tocarla para corregirla */
    if (CONV && gate) conv = (function () {
      var qs = $$('[data-q]', gate), i = 0, prev = $('[data-conv-prev]', gate);
      var bar = $('[data-conv-bar]', sim), num = $('[data-conv-n]', sim), lbl = $('button[type="submit"] span', gate), hola = $('[data-hola-q]', gate);
      var claves = qs.map(function (q) { return q.dataset.q; });
      function chips() {
        var st = sim.dataset.step;
        $$('[data-conv-ir]', sim).forEach(function (c) {
          var k = c.dataset.convIr, x = gate.elements[k], v = (x.value || '').trim(), j = claves.indexOf(k);
          c.hidden = !(v && valido(x) && (lead || j < i || st !== 'datos'));
          $('[data-chip]', c).textContent = v;
          c.classList.toggle('is-on', st === 'datos' && j === i);
        });
      }
      function pintar() {
        var st = sim.dataset.step, total = esFactoring() ? 5 : 4, edit = st === 'datos' && !!(lead && lead.nombre);
        var n = st === 'datos' ? i + 1 : st === 'simula' ? 4 : total;
        /* al corregir no se «retrocede»: la barra queda donde iba y el texto lo dice */
        if (num) num.textContent = st === 'ok' ? 'Solicitud enviada' : edit ? 'Corrige tus datos' : 'Paso ' + n + ' de ' + total;
        if (bar) bar.style.transform = 'scaleX(' + (st === 'ok' ? 1 : edit ? (total - 1) / total : n / total) + ')';
        if (lbl) lbl.textContent = edit ? 'Guardar y volver' : i < qs.length - 1 || !esFactoring() ? 'Continuar' : 'Ver mi simulación';
        if (prev) prev.classList.toggle('is-off', i === 0 && !edit);
        if (hola) { var nm = primerNombre(gate.elements.nombre.value); hola.textContent = nm ? 'Gracias, ' + nm + '.' : 'Gracias.'; }
        chips();
      }
      function mostrar(k) {
        i = Math.max(0, Math.min(qs.length - 1, k));
        qs.forEach(function (q, j) {
          q.hidden = j !== i;
          q.classList.toggle('is-past', j < i);
          q.classList.toggle('is-future', j > i);
          if (j === i) q.removeAttribute('inert'); else q.setAttribute('inert', '');
        });
        pintar();
      }
      function error(x) {
        qs.forEach(function (q) {
          var h = $('.bs2-hint', q);
          if (!h) return;
          if (!h.dataset.t) h.dataset.t = h.textContent;
          var mio = !!x && q.contains(x);
          h.textContent = mio ? (MENSAJES[x.name] || 'Revisa este dato.') : h.dataset.t;
          h.classList.toggle('is-err', mio);
        });
      }
      if (prev) prev.addEventListener('click', function () {
        error(null);
        if (i > 0) { mostrar(i - 1); enfocar(qs[i], 200); } else if (lead) ir('simula');
      });
      $$('[data-conv-ir]', sim).forEach(function (c) {
        c.addEventListener('click', function () {
          if (sim.dataset.step !== 'datos') { llenarGate(); paso('datos'); }
          mostrar(claves.indexOf(c.dataset.convIr));
          enfocar(qs[i], 200);
        });
      });
      $$('input', gate).forEach(function (x) { x.addEventListener('input', function () { error(null); if (x.name === 'nombre') pintar(); }); });
      return {
        pintar: pintar, mostrar: mostrar, error: error, ultima: function () { mostrar(qs.length - 1); enfocar(qs[i]); },
        /* Enter o «Continuar»: con la pregunta bien respondida pasa a la siguiente; la última (o al corregir) envía */
        antes: function () {
          if ((lead && lead.nombre) || i === qs.length - 1) return false;
          var m = $$('input[required]', qs[i]).filter(function (x) { x.dataset.t = '1'; return !marcar(x); });
          if (m.length) { avisar(m[0]); return true; }
          mostrar(i + 1);
          enfocar(qs[i], 200);
          return true;
        },
        irA: function (name) { var k = claves.indexOf(name === 'acepto' ? 'celular' : name); if (k > -1) mostrar(k); }
      };
    })();
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
        setTimeout(function () {
          ocupado(btn, false);
          lead = lead || {};
          lead.email = evalf.elements.email.value.trim();
          guardar('fc-lead', lead);
          $('[data-ok-name]', ok).textContent = primerNombre(lead.nombre) || 'gracias';
          $('[data-ok-prod]', ok).textContent = esFactoring() ? 'Factoring por ' + money(estado.monto, estado.cur) + ' a ' + estado.dias + ' días'
            : PRODS[sim.dataset.prod];
          if (panel && !V2) { evalf.hidden = true; ok.hidden = false; }
          paso('ok');
          ok.focus({ preventScroll: true });
        }, reduce ? 0 : 900);
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

  /* ================================================================ banner A: pestañas, flechas y deslizar */
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
  var heroA = $('.a-hero[data-hero]', root);
  if (heroA) {
    var ordenA = $$('.a-tabs [data-prod]', heroA).map(function (b) { return b.dataset.prod; });
    var actualA = ordenA[0];
    var mostrarA = function (k) {
      actualA = k;
      $$('[data-prod]', heroA).forEach(function (el) {
        var on = el.dataset.prod === k;
        if (el.getAttribute('role') === 'tab') { el.setAttribute('aria-selected', on ? 'true' : 'false'); return; }
        el.classList.toggle('is-on', on);
        if (el.tagName !== 'IMG') { if (on) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true'); }
      });
      sims.forEach(function (s) { if (heroA.contains(s.el)) s.anchos(); });
      if (copyBox) altoCopy();
    };
    var copyBox = $('.a-copy', heroA);
    var altoCopy = function () { var act = $('.a-v.is-on', copyBox); if (act) copyBox.style.height = act.offsetHeight + 'px'; };
    addEventListener('resize', altoCopy);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(altoCopy);
    altoCopy();
    var moverA = function (d) { var i = ordenA.indexOf(actualA); mostrarA(ordenA[(i + d + ordenA.length) % ordenA.length]); };
    $$('.a-tabs [data-prod]', heroA).forEach(function (b) { b.addEventListener('click', function () { mostrarA(b.dataset.prod); }); });
    $('[data-prev]', heroA).addEventListener('click', function () { moverA(-1); });
    $('[data-next]', heroA).addEventListener('click', function () { moverA(1); });
    deslizar($('[data-swipe]', heroA), moverA);
  }

  /* ================================================================ fotos de los banners de B
     Registro de todas las fotos candidatas: de dónde salen (Unsplash o el zip del cliente), cómo se llaman en
     el selector «Probar fotos» y dónde está lo importante, en fracciones de la imagen: c, las caras
     [x0, y0, x1, y1, peso] (peso menor: de espaldas o secundaria); b, el ancho de las personas; full, la foto
     no tiene personas y cubre todo el fondo; fondo, sirve de fondo (sin caras) aunque tenga un objeto que se
     encuadra como si fuera una cara. Lo usan el encuadre de los tres banners y el selector. */
  var FOTOS_B = {
    'factoring-ia': { src: '../img/b-factoring.jpg', n: 'Equipo revisando una factura', nueva: true, c: [[0.35, 0.12, 0.46, 0.35, 1], [0.555, 0.06, 0.71, 0.39, 1]], b: [0.21, 0.86], pos: '55% 30%' },
    'confirming-ia': { src: '../img/b-confirming.jpg', n: 'Acuerdo en la oficina', nueva: true, c: [[0.245, 0.14, 0.38, 0.4, 1], [0.5, 0.21, 0.625, 0.47, 1], [0.74, 0.03, 0.9, 0.43, 0.4]], b: [0.13, 0.97], pos: '45% 30%' },
    'capital-ia': { src: '../img/b-capital.jpg', n: 'Equipo en su almacén', nueva: true, c: [[0.3, 0.17, 0.42, 0.41, 1], [0.545, 0.09, 0.69, 0.38, 1]], b: [0.23, 0.8], pos: '70% 30%' },
    mype: { src: '../img/b-mype.jpg', n: 'Emprendedor en su tienda', nueva: true, c: [[0.595, 0.1, 0.72, 0.33, 1]], b: [0.51, 0.85], pos: '68% 30%' },
    cafeteria: { src: '../img/b-cafeteria.jpg', n: 'Dueña de un café', nueva: true, c: [[0.355, 0.25, 0.455, 0.48, 1]], b: [0.28, 0.54], pos: '41% 40%' },
    mesa: { src: '../img/b-reunion.jpg', n: 'Reunión con gráficos', nueva: true, full: true, pos: '60% 50%' },
    escritorio: { src: '../img/b-escritorio.jpg', n: 'Escritorio con café y laptop', nueva: true, fondo: true, c: [[0.28, 0.45, 0.52, 0.85, 1]], b: [0.25, 0.95], pos: '40% 75%' },
    oficina: { u: '1758520144864-fb42371d9e60', n: 'Empresaria al teléfono', c: [[0.32, 0.1, 0.445, 0.4, 1]], b: [0.26, 0.6], pos: '40% 35%' },
    taller: { u: '1753164597612-5e71b83fda91', n: 'Taller de confección', c: [[0.475, 0.17, 0.59, 0.45, 1]], b: [0.45, 0.7], pos: '64% 30%' },
    cafe: { u: '1778790508237-3c6cb00f152a', n: 'Pago en el mostrador', c: [[0.13, 0.15, 0.28, 0.34, 0.5], [0.63, 0.07, 0.73, 0.24, 1]], b: [0.07, 0.84], pos: '72% 30%' },
    celebran: { u: '1758526213729-50208a451702', n: 'Emprendedoras celebran', c: [[0.27, 0.05, 0.42, 0.44, 1], [0.64, 0.12, 0.86, 0.5, 1]], b: [0.2, 0.92], pos: '55% 30%' },
    llamada: { u: '1758876022836-70b89d3e6944', n: 'Llamada en la oficina', c: [[0.555, 0.08, 0.68, 0.36, 1]], b: [0.41, 0.77], pos: '68% 30%' },
    billetes: { u: '1765868017186-18a3fc4c2942', n: 'Billetes y factura', full: true, pos: '50% 50%' },
    manos: { u: '1696861270495-7f35c35c3273', n: 'Apretón de manos', full: true, pos: '50% 50%' },
    trato: { u: '1638262052630-9c3f7dd449c4', n: 'Acuerdo (tono oscuro)', c: [[0.19, 0.1, 0.3, 0.35, 1], [0.575, 0.07, 0.7, 0.32, 1]], b: [0.1, 0.8], pos: '50% 40%' },
    acuerdo: { u: '1758519288905-38b7b00c1023', n: 'Apretón de manos en la oficina', c: [[0.25, 0.09, 0.385, 0.39, 1], [0.68, 0.18, 0.83, 0.48, 1]], b: [0.17, 0.92], pos: '50% 30%' },
    reunion: { u: '1758519288557-9a9dee0a7f58', n: 'Reunión de negocios', c: [[0.24, 0.16, 0.36, 0.47, 1], [0.7, 0.19, 0.8, 0.47, 1]], b: [0.12, 0.95], pos: '60% 40%' },
    planta: { u: '1685475887169-9c9a84bf740f', n: 'Planta textil', c: [[0.42, 0.19, 0.57, 0.49, 1]], b: [0.33, 0.69], pos: '52% 30%' },
    obra: { u: '1716037991590-c975184b37df', n: 'Ingeniera con planos', c: [[0.18, 0.1, 0.48, 0.54, 0.6], [0.59, 0.4, 0.75, 0.8, 0.5]], b: [0.08, 0.76], pos: '30% 30%' },
    equipo: { u: '1753162658547-f017a4d84541', n: 'Equipo de una mype', c: [[0.47, 0.28, 0.64, 0.6, 1], [0.7, 0.02, 0.91, 0.46, 1]], b: [0.4, 0.98], pos: '72% 30%' },
    lima: { u: '1777198498604-a924324d1eb2', n: 'Lima desde el aire', full: true, pos: '50% 0%' }
  };
  /* candidatas por diapositiva o pestaña (la primera de cada lista es la que se recomienda). En el banner 3 solo
     van fotos sin personas: el texto y la factura ocupan todo el ancho y no queda dónde poner una cara */
  var GRUPOS_B = {
    factoring: ['factoring-ia', 'oficina', 'taller', 'cafe', 'cafeteria', 'celebran', 'llamada'],
    confirming: ['confirming-ia', 'acuerdo', 'trato', 'manos', 'mesa', 'reunion'],
    capital: ['capital-ia', 'planta', 'mype', 'obra', 'equipo'],
    fondo: ['lima', 'escritorio', 'billetes', 'mesa'],
    fondo2: ['billetes', 'escritorio', 'mesa', 'lima'],
    fondo3: ['escritorio', 'billetes', 'mesa', 'lima'],
    respaldo: ['mesa', 'escritorio', 'lima', 'billetes']
  };
  function urlU(id, w) { return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + w + '&q=78'; }

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
  /* centro del tramo libre más ancho a la altura y (para decidir hacia dónde van las caras) */
  function centroLibre(W, y, tapan, a, z) {
    var cortes = tapan.filter(function (q) { return q.t <= y && q.b >= y; }).map(function (q) { return [q.l, q.r]; })
      .sort(function (p, q) { return p[0] - q[0]; });
    var x = a, mejor = [a, a];
    cortes.forEach(function (c) {
      if (c[0] - x > mejor[1] - mejor[0]) mejor = [x, c[0]];
      x = Math.max(x, c[1]);
    });
    if (z - x > mejor[1] - mejor[0]) mejor = [x, z];
    return (mejor[0] + mejor[1]) / 2;
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
      var f = FOTOS_B[im.dataset.k];
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
  /* solo el banner 1 (los banners 2 y 3 tienen su propio control más abajo) */
  var heroB = $('.b-hero[data-hero]:not(.bh)', root);
  if (heroB && $('.b-dots', heroB) && $('.b-hero-bg', heroB)) {
    var ordenB = $$('.b-dots [data-prod]', heroB).map(function (b) { return b.dataset.prod; });
    /* la primera diapositiva (Factoring, con el simulador) se queda más tiempo (minuta 007, A02) */
    var actualB = ordenB[0], timer = 0, quieto = false, pausa = false, DUR = 7000, DUR1 = 12000;
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
      heroB.classList.toggle('sin-sim', k !== 'factoring');
      if (typeof fondoB === 'function') fondoB();
    };
    var programar = function () {
      clearTimeout(timer);
      heroB.classList.remove('is-playing');
      /* en celular no rota sola: la tarjeta va debajo y al ocultarse movería la página */
      if (quieto || pausa || probando || reduce || innerWidth < 981) return;
      heroB.style.setProperty('--dur', durB() / 1000 + 's');
      void heroB.offsetWidth;
      heroB.classList.add('is-playing');
      timer = setTimeout(function () { var i = ordenB.indexOf(actualB); mostrarB(ordenB[(i + 1) % ordenB.length]); programar(); }, durB());
    };
    var detener = function () { quieto = true; clearTimeout(timer); heroB.classList.remove('is-playing'); };
    /* «Probar fotos» abierto: el banner no rota */
    var probando = false;
    heroB.addEventListener('fc-pausa', function (e) { probando = !!e.detail; programar(); });
    var moverB = function (d) { var i = ordenB.indexOf(actualB); mostrarB(ordenB[(i + d + ordenB.length) % ordenB.length]); detener(); };
    $$('.b-dots [data-prod]', heroB).forEach(function (b) { b.addEventListener('click', function () { mostrarB(b.dataset.prod); detener(); }); });
    $('[data-prev]', heroB).addEventListener('click', function () { moverB(-1); });
    $('[data-next]', heroB).addEventListener('click', function () { moverB(1); });
    deslizar($('[data-swipe]', heroB), moverB);
    var simB = $('[data-sim]', heroB);
    if (simB) { simB.addEventListener('focusin', detener); simB.addEventListener('pointerdown', detener); }
    /* se pausa mientras se lee el texto (no al pasar por cualquier parte del banner) */
    var copiasB = $('.b-copies', heroB);
    copiasB.addEventListener('mouseenter', function () { if (!quieto) { pausa = true; programar(); } });
    copiasB.addEventListener('mouseleave', function () { if (!quieto) { pausa = false; programar(); } });
    doc.addEventListener('visibilitychange', function () { if (doc.hidden) { clearTimeout(timer); heroB.classList.remove('is-playing'); } else programar(); });
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
      if (im) heroB.style.setProperty('--fondo', 'url("' + (im.dataset.blur || im.currentSrc || im.src) + '")');
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
        if (im.dataset.prod !== 'factoring') return { tapan: [{ l: -1e4, t: -1e4, r: copyR, b: 1e4, texto: 1 }, menu], idealX: (copyR + W) / 2 };
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

  /* ================================================================ rotación de fotos (banners 2 y 3)
     Avanza sola cada «dur» ms; se pausa mientras se escribe en el formulario o se lee el texto y se puede
     elegir a mano con el indicador. Sin movimiento si la persona lo prefiere (prefers-reduced-motion). */
  function Rotador(o) {
    var i = 0, t = 0, pausas = {};
    function marcar() {
      o.barras.forEach(function (b, j) {
        var on = j === i;
        b.classList.toggle('is-on', on);
        if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
        b.hidden = j >= o.n;
      });
    }
    function programar() {
      clearTimeout(t);
      o.hero.classList.remove('rota');
      if (reduce || o.n < 2 || Object.keys(pausas).some(function (k) { return pausas[k]; })) return;
      void o.hero.offsetWidth;
      o.hero.classList.add('rota');
      t = setTimeout(function () { ir(i + 1); }, o.dur);
    }
    function ir(k) { i = (k + o.n) % o.n; o.mostrar(i); marcar(); programar(); }
    function pausa(k, v) { pausas[k] = v; programar(); }
    o.barras.forEach(function (b, j) { b.addEventListener('click', function () { ir(j); }); });
    if (o.form) {
      o.form.addEventListener('focusin', function () { pausa('form', true); });
      o.form.addEventListener('focusout', function () { setTimeout(function () { pausa('form', o.form.contains(doc.activeElement)); }, 0); });
    }
    if (o.texto) {
      o.texto.addEventListener('mouseenter', function () { pausa('texto', true); });
      o.texto.addEventListener('mouseleave', function () { pausa('texto', false); });
    }
    doc.addEventListener('visibilitychange', function () { pausa('oculta', doc.hidden); });
    o.hero.addEventListener('fc-pausa', function (e) { pausa('fotos', !!e.detail); });
    o.hero.style.setProperty('--rot', o.dur / 1000 + 's');
    marcar();
    programar();
    return { ir: ir, actual: function () { return i; }, reiniciar: function (n) { o.n = n; i = 0; o.mostrar(0); marcar(); programar(); } };
  }

  /* ================================================================ banner 2 (Conversación): soluciones en pestañas
     Factoring, Confirming y Capital de Trabajo cambian fotos, texto y conversación sin salir del banner;
     cada solución rota entre tres fotos. En escritorio cada foto se encuadra en el espacio libre a la derecha
     del texto (con la misma foto desenfocada de fondo), así la persona no queda tapada ni recortada en
     pantallas anchas o bajas. */
  var hero2 = $('.bh2[data-hero]', root);
  if (hero2) {
    var tabs2 = $$('.bh2-tabs [role="tab"]', hero2), ind2 = $('.bh2-tabs-ind', hero2);
    var bg2 = $('.bh2-bg', hero2), col2 = $('.bh2-col', hero2), pings2 = $('.bh2-pings', hero2);
    var sim2 = sims.filter(function (x) { return hero2.contains(x.el); })[0];
    var mas2 = $('[data-mas]', hero2);
    var MAS2 = { factoring: ['factoring.html?p=b', 'el Factoring'], confirming: ['confirming.html?p=b', 'el Confirming'],
      capital: ['capital-de-trabajo.html?p=b', 'el Capital de Trabajo'] };
    var actual2 = 'factoring', PW = 250, rot2 = null;
    var fotos2 = function (k) { return $$('img.bh2-photo', bg2).filter(function (im) { return im.dataset.prod === (k || actual2); }); };
    var marcar2 = function () {
      var t = tabs2.filter(function (b) { return b.getAttribute('aria-selected') === 'true'; })[0];
      if (t && ind2) { ind2.style.width = t.offsetWidth + 'px'; ind2.style.transform = 'translateX(' + t.offsetLeft + 'px)'; }
    };
    var encuadre2 = function () {
      var imgs = $$('img.bh2-photo', bg2);
      if (innerWidth < 981) {
        hero2.classList.remove('encuadre');
        imgs.forEach(soltarFoto);
        return;
      }
      hero2.classList.add('encuadre');
      var box = bg2.getBoundingClientRect(), W = box.width, H = box.height;
      var col = rectRel(col2, box, 0), ini = col.r + 56;
      var tapan = [{ l: -1e4, t: -1e4, r: ini, b: 1e4, texto: 1 }, bandaMenu(W)];
      encuadrarFotos(imgs, box, { idealY: 0.34, kMin: 0.8, zonas: function () { return { tapan: tapan, idealX: (ini + W - 32) / 2 }; } });
      hero2.style.setProperty('--c0', (col.l / W * 100).toFixed(1) + '%');
      hero2.style.setProperty('--c1', (col.r / W * 100).toFixed(1) + '%');
      var activo = $('img.bh2-photo.is-on', bg2);
      if (!activo) return;
      hero2.style.setProperty('--fondo', 'url("' + (activo.dataset.blur || activo.currentSrc || activo.src) + '")');
      /* el aviso va junto a las caras, nunca encima: a su derecha si cabe, si no a su izquierda y, si tampoco,
         debajo de ellas (sobre las manos o la mesa) */
      if (pings2) {
        var f = FOTOS_B[activo.dataset.k], r = activo._enc, px = null, py = Math.round(H * 0.58);
        if (f && f.c && r) {
          var fL = 1, fR = 0, fB = 0;
          f.c.forEach(function (c) { if (c[4] < 0.9) return; fL = Math.min(fL, c[0]); fR = Math.max(fR, c[2]); fB = Math.max(fB, c[3]); });
          fL = r.x + fL * r.iw; fR = r.x + fR * r.iw; fB = r.y + fB * r.ih;
          if (W - 24 - PW >= fR + 28) px = Math.min(fR + 40, W - 24 - PW);
          else if (fL - 28 - PW >= ini) px = fL - 40 - PW;
          py = Math.round(Math.min(H - 150, Math.max(150, fB + 36)));
          if (px === null && fB + 36 <= H - 150) px = Math.max(ini, Math.min(W - 24 - PW, fR - PW * 0.7));
        } else if (f && f.full) px = W - PW - Math.max(40, W * 0.05);
        pings2.classList.toggle('is-off', px === null);
        if (px !== null) { pings2.style.left = Math.round(px) + 'px'; pings2.style.top = py + 'px'; }
      }
    };
    var mostrarFoto2 = function (n) {
      var lista = fotos2();
      $$('img.bh2-photo', bg2).forEach(function (im) { im.classList.toggle('is-on', im === lista[n]); });
      encuadre2();
    };
    var producto2 = function (k, foco) {
      if (k === actual2) return;
      actual2 = k;
      $$('[data-prod]', hero2).forEach(function (el) {
        if (el.closest('[data-sim]') || el.tagName === 'IMG') return;
        var on = el.dataset.prod === k;
        if (el.getAttribute('role') === 'tab') {
          el.setAttribute('aria-selected', on ? 'true' : 'false');
          el.tabIndex = on ? 0 : -1;
          if (on && foco) el.focus();
          return;
        }
        el.classList.toggle('is-on', on);
        if (!el.closest('.bh2-bg')) { if (on) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true'); }
      });
      if (mas2) { mas2.setAttribute('href', MAS2[k][0]); $('[data-mas-n]', mas2).textContent = MAS2[k][1]; }
      marcar2();
      if (rot2) rot2.reiniciar(fotos2().length); else mostrarFoto2(0);
      if (sim2) sim2.producto(k);
    };
    tabs2.forEach(function (b, n) {
      b.addEventListener('click', function () { producto2(b.dataset.prod); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        producto2(tabs2[(n + d + tabs2.length) % tabs2.length].dataset.prod, true);
      });
    });
    rot2 = Rotador({ hero: hero2, n: fotos2().length, dur: 6500, barras: $$('[data-rot]', hero2), mostrar: mostrarFoto2,
      form: sim2 && sim2.el });
    marcar2();
    encuadre2();
    addEventListener('resize', function () { marcar2(); encuadre2(); });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { marcar2(); encuadre2(); });
    $$('img', bg2).forEach(function (im) { if (!im.complete) im.addEventListener('load', encuadre2); });
    if ('ResizeObserver' in window) new ResizeObserver(encuadre2).observe(hero2);
  }

  /* ================================================================ banner 3 (Factura): cuatro diapositivas */
  var hero3 = $('.bh3[data-hero]', root);
  if (hero3) {
    var slides3 = $$('.bh3-dots [data-slide]', hero3).map(function (b) { return b.dataset.slide; });
    var sim3 = sims.filter(function (x) { return hero3.contains(x.el); })[0];
    var mostrar3 = function (n) {
      var k = slides3[n];
      $$('[data-slide]', hero3).forEach(function (el) {
        var on = el.dataset.slide === k;
        el.classList.toggle('is-on', on);
        if (el.matches('.b-copy')) { if (on) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true'); }
      });
    };
    var rot3 = Rotador({ hero: hero3, n: slides3.length, dur: 7000, barras: $$('.bh3-dots [data-slide]', hero3), mostrar: mostrar3,
      form: sim3 && sim3.el, texto: $('.bh3-copies', hero3) });
    $('[data-prev]', hero3).addEventListener('click', function () { rot3.ir(rot3.actual() - 1); });
    $('[data-next]', hero3).addEventListener('click', function () { rot3.ir(rot3.actual() + 1); });
    deslizar($('.bh3-copies', hero3), function (d) { rot3.ir(rot3.actual() + d); });
    /* fotos con personas (elegidas en «Probar fotos»): las caras van entre el texto y la factura o a la
       derecha de la factura, nunca bajo el título; las fotos sin personas cubren todo el fondo */
    var bg3 = $('.bh3-bg', hero3), copy3 = $('.bh3-copy', hero3);
    var encuadre3 = function () {
      var imgs = $$('img.bh3-photo', bg3);
      if (innerWidth < 981 || !sim3) {
        hero3.classList.remove('encuadre');
        imgs.forEach(soltarFoto);
        return;
      }
      hero3.classList.add('encuadre');
      var box = bg3.getBoundingClientRect(), W = box.width, H = box.height;
      var tx = rectRel(copy3, box, 28), cd = rectRel(sim3.el, box, 24);
      var tapan = [{ l: -1e4, t: -1e4, r: tx.r, b: 1e4, texto: 1 }, cd, bandaMenu(W)];
      encuadrarFotos(imgs, box, { idealY: 0.3, kMin: 1, zonas: function () { return { tapan: tapan, idealX: centroLibre(W, H * 0.3, tapan, 0, W) }; } });
    };
    encuadre3();
    addEventListener('resize', encuadre3);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(encuadre3);
    $$('img', bg3).forEach(function (im) { if (!im.complete) im.addEventListener('load', encuadre3); });
    if ('ResizeObserver' in window) new ResizeObserver(encuadre3).observe(hero3);
  }

  /* ================================================================ «Probar fotos» (solo en el prototipo)
     Botón abajo a la izquierda mientras se ve el banner: muestra las candidatas de la diapositiva o pestaña
     visible; al elegir una, la foto cambia al instante y la elección se recuerda (localStorage «fc-fotos»).
     Mientras el panel está abierto, el banner no rota. */
  var heroF = $('[data-hero][data-hv]', root);
  if (heroF) (function () {
    var hv = heroF.dataset.hv;
    var ETQ = { factoring: 'Factoring', confirming: 'Confirming', capital: 'Capital de Trabajo',
      lima: 'Factoring', billetes: 'Liquidez en 48 horas', factura: 'Sin préstamos bancarios', trato: 'Respaldo y asesoría' };
    var GRUPO_B3 = { lima: 'fondo', billetes: 'fondo2', factura: 'fondo3', trato: 'respaldo' };
    var NOMBRE_BANNER = { 1: 'Banner 1 · Vidrio', 2: 'Banner 2 · Conversación', 3: 'Banner 3 · Factura' };
    var fotos = function () { return $$('img[data-k]', heroF).filter(function (i) { return i.closest('.b-hero-bg, .bh2-bg, .bh3-bg'); }); };
    var clave = function (im) { return im.dataset.prod || im.dataset.slide; };
    var hermanas = function (im) { return fotos().filter(function (x) { return clave(x) === clave(im); }); };
    var slot = function (im) { return hv + ':' + clave(im) + ':' + hermanas(im).indexOf(im); };
    var grupo = function (im) { return im.dataset.slide ? GRUPO_B3[im.dataset.slide] : im.dataset.prod; };
    var vale = function (k) { return FOTOS_B[k] && (hv !== '3' || FOTOS_B[k].full || FOTOS_B[k].fondo); };
    var candidatas = function (im) { return (GRUPOS_B[grupo(im)] || []).filter(vale); };
    var activa = function () { return fotos().filter(function (i) { return i.classList.contains('is-on'); })[0] || fotos()[0]; };
    var reencuadrar = function () { dispatchEvent(new Event('resize')); };
    var poner = function (im, k) {
      var f = FOTOS_B[k];
      if (!f) return;
      im.dataset.k = k;
      if (f.u) {
        im.setAttribute('srcset', [800, 1400, 2000, 2600].map(function (w) { return urlU(f.u, w) + ' ' + w + 'w'; }).join(', '));
        im.setAttribute('sizes', '100vw');
        im.src = urlU(f.u, 2000);
        im.dataset.blur = urlU(f.u, 480);
      } else {
        im.removeAttribute('srcset');
        im.src = f.src;
        im.dataset.blur = f.src;
      }
      im.removeAttribute('loading');
      im.style.objectPosition = f.pos || '50% 40%';
      im.addEventListener('load', reencuadrar, { once: true });
      reencuadrar();
    };
    var inicial = {};
    fotos().forEach(function (im) { inicial[slot(im)] = im.dataset.k; });
    var elegidas = leer('fc-fotos') || {};
    fotos().forEach(function (im) {
      var s = slot(im), k = elegidas[s];
      /* una elección guardada que ya no es candidata de su diapositiva se descarta */
      if (k && candidatas(im).indexOf(k) < 0 && k !== inicial[s]) { delete elegidas[s]; guardar('fc-fotos', elegidas); return; }
      if (k && k !== im.dataset.k) poner(im, k);
    });

    var IMG = '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m21 16-5.2-5.2L6 19"/></svg>';
    var btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = 'fp-btn pbar-more';
    btn.title = 'Probar fotos del banner';
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = IMG + '<span>Probar fotos</span>';
    var panel = doc.createElement('div');
    panel.className = 'fp-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Probar fotos del banner');
    panel.hidden = true;
    /* el botón va en la barra superior (junto a «¿Qué cambia?»): así no tapa el indicador del banner */
    var mas = $('.pbar-more', pbar);
    if (mas) mas.parentNode.insertBefore(btn, mas); else root.appendChild(btn);
    root.appendChild(panel);
    var ultimo = '';
    var pintar = function () {
      var im = activa();
      if (!im) return;
      var s = slot(im), lista = candidatas(im), h = hermanas(im), pos = h.indexOf(im);
      ultimo = s;
      panel.innerHTML = '<div class="fp-h"><div><b>Fotos para «' + ETQ[clave(im)] + '»</b><small>' + NOMBRE_BANNER[hv] +
        (h.length > 1 ? ' · foto ' + (pos + 1) + ' de ' + h.length : '') + '. Toca una para verla en el banner.</small></div>' +
        '<button type="button" class="fp-x" aria-label="Cerrar"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' +
        '<div class="fp-grid">' + lista.map(function (k) {
          var f = FOTOS_B[k], mini = f.u ? urlU(f.u, 260) : f.src;
          return '<button type="button" class="fp-op' + (k === im.dataset.k ? ' is-sel' : '') + '" data-foto="' + k + '" aria-pressed="' +
            (k === im.dataset.k) + '"><img src="' + mini + '" alt="" loading="lazy" style="object-position:' + (f.pos || '50% 40%') + '">' +
            '<span>' + f.n + '</span>' + (f.nueva ? '<em>Nueva</em>' : '') + (k === inicial[s] ? '<i>Predeterminada</i>' : '') + '</button>';
        }).join('') + '</div>' +
        '<button type="button" class="fp-reset">Volver a las predeterminadas en todo el banner</button>';
    };
    var abrir = function (v) {
      panel.hidden = !v;
      btn.setAttribute('aria-expanded', v ? 'true' : 'false');
      heroF.dispatchEvent(new CustomEvent('fc-pausa', { detail: v }));
      if (v) pintar();
    };
    btn.addEventListener('click', function () {
      if (panel.hidden && heroF.getBoundingClientRect().bottom < 120) scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      abrir(panel.hidden);
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('.fp-x')) { abrir(false); btn.focus(); return; }
      if (e.target.closest('.fp-reset')) {
        fotos().forEach(function (im) { var k = inicial[slot(im)]; if (k && k !== im.dataset.k) poner(im, k); });
        elegidas = {};
        try { localStorage.removeItem('fc-fotos'); } catch (er) { /* */ }
        pintar();
        return;
      }
      var op = e.target.closest('[data-foto]');
      if (!op) return;
      var im = activa();
      poner(im, op.dataset.foto);
      elegidas[slot(im)] = op.dataset.foto;
      guardar('fc-fotos', elegidas);
      pintar();
    });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { abrir(false); btn.focus(); } });
    /* si cambia la diapositiva o la pestaña con el panel abierto, el panel muestra las candidatas de la nueva */
    new MutationObserver(function () { if (!panel.hidden) { var im = activa(); if (im && slot(im) !== ultimo) pintar(); } })
      .observe(heroF, { subtree: true, attributes: true, attributeFilter: ['class'] });
    /* si se baja y el banner deja de verse, el panel se cierra */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { if (!es[0].isIntersecting && !panel.hidden) abrir(false); }, { threshold: 0.2 }).observe(heroF);
    }
  })();

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
      setTimeout(function () {
        ocupado(btn, false);
        lead = { nombre: form.elements.nombre.value.trim(), ruc: form.elements.ruc.value.trim(), celular: form.elements.celular.value.trim(), email: form.elements.email.value.trim() };
        guardar('fc-lead', lead);
        var sel = form.elements.solucion;
        $('[data-ok-name]', ok).textContent = primerNombre(lead.nombre) || 'gracias';
        $('[data-ok-prod]', ok).textContent = sel.options[sel.selectedIndex].text;
        form.hidden = true; ok.hidden = false; ok.focus({ preventScroll: true });
      }, reduce ? 0 : 900);
    });
  });
  $$('[data-nl]', root).forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var i = $('input', f), bien = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value.trim());
      f.classList.toggle('bad', !bien);
      if (!bien) { i.focus(); return; }
      $('.nl-ok', f).hidden = false; i.value = '';
    });
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
  $$('[data-video]', root).forEach(function (b) {
    b.addEventListener('click', function () { vFoco = b; vm.hidden = false; html.classList.add('lock'); $('.vmodal-x', vm).focus({ preventScroll: true }); });
  });
  $$('[data-close]', vm).forEach(function (c) { c.addEventListener('click', cerrarVideo); });
  vm.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarVideo(); });
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

  /* botón flotante y barra móvil: aparecen al dejar atrás el primer bloque */
  var primero = $('main > section', root);
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
    if (X === 'b' && hdr) {
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
    if (X === 'b' && !reduce) {
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

  /* ================================================================ llegada: misma sección que en la otra versión */
  function llegar() {
    var hs = location.hash;
    if (!hs) { try { hs = sessionStorage.getItem('fc-ir') || ''; sessionStorage.removeItem('fc-ir'); } catch (e) { hs = ''; } }
    var m = /^#ir=([a-z-]+),([0-9.]+)$/.exec(hs);
    if (m) {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* file:// */ }
      var t = $('[data-sec="' + m[1] + '"]', root);
      if (t) {
        var r = t.getBoundingClientRect();
        scrollTo(0, Math.max(0, scrollY + r.top + r.height * parseFloat(m[2]) - innerHeight * 0.38));
      }
    } else if (hs.length > 1) {
      var d = doc.getElementById(hs.slice(1));
      if (d) d.scrollIntoView({ block: 'start' });
    }
    revelarHasta(innerHeight * 0.92);
    efectos();
    requestAnimationFrame(function () { html.classList.add('listo'); });
  }
  var fontsListas = doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve();
  var tope = new Promise(function (r) { setTimeout(r, 900); });
  Promise.race([fontsListas, tope]).then(function () { requestAnimationFrame(llegar); });
})();
