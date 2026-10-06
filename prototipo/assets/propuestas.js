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
     mientras tanto todos los tramos usan la TEM del ejemplo (1.75 %).
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
      { hasta: Infinity, tem: { 30: 1.75, 60: 1.75, 90: 1.75, 120: 1.75 } }
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
  function navegar(url, destino) {
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
    var heroSim = sim.closest('.b-hero');

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
      if (gate) gate.hidden = n !== 'datos';
      if (calc) calc.hidden = n === 'datos' || (!panel && (n === 'evalua' || n === 'ok'));
      if (evalf && !panel) evalf.hidden = n !== 'evalua';
      if (ok && !panel) ok.hidden = n !== 'ok';
      var hw = $('[data-hola-wrap]', sim);
      if (hw) hw.hidden = n === 'datos';
      var visible = n === 'datos' ? gate : n === 'simula' ? calc : panel ? calc : n === 'evalua' ? evalf : ok;
      if (visible && antes && antes !== n && !reduce) {
        visible.classList.remove('is-entering'); void visible.offsetWidth; visible.classList.add('is-entering');
      }
      anchos();
    }
    function saludo() {
      var n = primerNombre(lead && lead.nombre);
      $$('[data-hola]', sim).forEach(function (e) { e.textContent = n ? 'Hola, ' + n : 'Hola'; });
      $$('[data-nombre1]', sim).forEach(function (e) { e.textContent = n || 'listo'; });
    }

    /* --- paso 1: datos */
    if (gate) {
      vigilar(gate);
      var err = $('.a-gate-err, .b-gate-err', gate);
      gate.addEventListener('submit', function (e) {
        e.preventDefault();
        var malos = revisar(gate);
        if (malos.length) {
          if (err) { err.textContent = MENSAJES[malos[0].name] || 'Revisa tus datos.'; err.hidden = false; }
          malos[0].focus();
          return;
        }
        if (err) err.hidden = true;
        lead = { nombre: gate.elements.nombre.value.trim(), ruc: gate.elements.ruc.value.trim(),
          celular: gate.elements.celular.value.trim(), email: (lead && lead.email) || '' };
        guardar('fc-lead', lead);
        saludo();
        paso('simula');
        calcular();
        setTimeout(function () { if (amt) amt.focus({ preventScroll: true }); }, reduce ? 0 : 450);
      });
      $$('input', gate).forEach(function (i) {
        i.addEventListener('input', function () { if (i.hasAttribute('data-auto')) anchoAuto(i); if (err && !err.hidden) err.hidden = true; });
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
    if (expand && panel) {
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
          $('[data-ok-prod]', ok).textContent = 'Factoring por ' + money(estado.monto, estado.cur) + ' a ' + estado.dias + ' días';
          if (panel) { evalf.hidden = true; ok.hidden = false; }
          paso('ok');
          ok.focus({ preventScroll: true });
        }, reduce ? 0 : 900);
      });
    }

    /* --- estado inicial: si ya dejó sus datos, va directo a simular */
    sincRange();
    calcular();
    saludo();
    paso(lead && lead.nombre ? 'simula' : 'datos');
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(anchos);
    addEventListener('resize', anchos);
    return { el: sim, anchos: anchos, enfocar: function () {
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

  /* ================================================================ banner B: rota, flechas y deslizar */
  var heroB = $('.b-hero[data-hero]', root);
  if (heroB) {
    var ordenB = $$('.b-dots [data-prod]', heroB).map(function (b) { return b.dataset.prod; });
    var actualB = ordenB[0], timer = 0, quieto = false, pausa = false, DUR = 7000;
    heroB.style.setProperty('--dur', DUR / 1000 + 's');
    var mostrarB = function (k) {
      actualB = k;
      $$('[data-prod]', heroB).forEach(function (el) {
        var on = el.dataset.prod === k;
        el.classList.toggle('is-on', on);
        if (el.matches('.b-dots button')) { if (on) el.setAttribute('aria-current', 'true'); else el.removeAttribute('aria-current'); return; }
        if (el.tagName !== 'IMG') { if (on) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true'); }
      });
    };
    var programar = function () {
      clearTimeout(timer);
      heroB.classList.remove('is-playing');
      if (quieto || pausa || reduce) return;
      void heroB.offsetWidth;
      heroB.classList.add('is-playing');
      timer = setTimeout(function () { var i = ordenB.indexOf(actualB); mostrarB(ordenB[(i + 1) % ordenB.length]); programar(); }, DUR);
    };
    var detener = function () { quieto = true; clearTimeout(timer); heroB.classList.remove('is-playing'); };
    var moverB = function (d) { var i = ordenB.indexOf(actualB); mostrarB(ordenB[(i + d + ordenB.length) % ordenB.length]); detener(); };
    $$('.b-dots [data-prod]', heroB).forEach(function (b) { b.addEventListener('click', function () { mostrarB(b.dataset.prod); detener(); }); });
    $('[data-prev]', heroB).addEventListener('click', function () { moverB(-1); });
    $('[data-next]', heroB).addEventListener('click', function () { moverB(1); });
    deslizar($('[data-swipe]', heroB), moverB);
    var simB = $('[data-sim]', heroB);
    if (simB) { simB.addEventListener('focusin', detener); simB.addEventListener('pointerdown', detener); }
    heroB.addEventListener('mouseenter', function () { if (!quieto) { pausa = true; programar(); } });
    heroB.addEventListener('mouseleave', function () { if (!quieto) { pausa = false; programar(); } });
    doc.addEventListener('visibilitychange', function () { if (doc.hidden) { clearTimeout(timer); heroB.classList.remove('is-playing'); } else programar(); });
    $$('[data-focus-sim]', heroB).forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation(); detener();
        var s = sims.filter(function (x) { return heroB.contains(x.el); })[0];
        if (s) s.enfocar();
      });
    });
    programar();
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
        var cards = $$('.b-stack', root);
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
    var m = /^#ir=([a-z-]+),([0-9.]+)$/.exec(location.hash);
    if (m) {
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* file:// */ }
      var t = $('[data-sec="' + m[1] + '"]', root);
      if (t) {
        var r = t.getBoundingClientRect();
        scrollTo(0, Math.max(0, scrollY + r.top + r.height * parseFloat(m[2]) - innerHeight * 0.38));
      }
    } else if (location.hash.length > 1) {
      var d = doc.getElementById(location.hash.slice(1));
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
