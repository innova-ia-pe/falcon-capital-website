/* ==========================================================================
   Falcon Capital · Propuestas de Home
   - Selector «Versión actual / A / B» con transición y misma sección al cambiar.
   - Simulador con la fórmula del instructivo de cálculo de Falcon Capital
     (factoring y confirming, v1 del 25/09/2026):
       factor   = (1 + TEM)^(días/30) − 1
       interés  = M × factor            comisión = M × c
       IGV      = 18 % del interés y de la comisión (antes de redondear)
       neto     = M − interés − comisión − IGV − retención
     Valores del ejemplo del instructivo: TEM 1.75 %, comisión 0.50 %, IGV 18 %,
     retención 0 %. Son referenciales: el tarifario final lo define Falcon.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document, html = doc.documentElement;
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var WA_URL = 'https://wa.me/51955447475';
  var TARIFA = { tem: 1.75, comision: 0.5, igv: 18, retencion: 0 };
  var PROD = {
    factoring: { n: 'Factoring', ml: 'Monto de la factura', rl: 'Recibirías hoy', s1: 'Tengo una factura de',
      s2: 'que vence en', cta: 'Quiero mi adelanto', wa: 'un factoring', rls: 'Recibirías hoy' },
    confirming: { n: 'Confirming', ml: 'Monto de las facturas', rl: 'Tus proveedores recibirían hoy',
      s1: 'Mis pagos a proveedores suman', s2: 'y vencen en', cta: 'Solicita tu evaluación', wa: 'confirming',
      rls: 'Proveedores reciben hoy' },
    capital: { n: 'Capital de Trabajo', ml: 'Monto a solicitar', rl: 'Recibirías hoy', s1: 'Necesito',
      s2: 'por un plazo de', cta: 'Solicita tu evaluación', wa: 'capital de trabajo', rls: 'Recibirías hoy' }
  };
  var ORDEN = ['factoring', 'confirming', 'capital'];
  var MAX = 100000000;

  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || doc).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function r2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function fmt(n) { return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function money(n, cur) { return (cur === 'USD' ? 'US$ ' : 'S/ ') + fmt(n); }
  function miles(n) { return Math.round(n).toLocaleString('en-US'); }
  function digits(v) { return parseInt(String(v).replace(/\D/g, ''), 10) || 0; }

  function cotizar(M, dias) {
    var t = TARIFA;
    var factor = Math.expm1(Math.log1p(t.tem / 100) * dias / 30);
    var rawI = M * factor, rawC = M * t.comision / 100;
    var interes = r2(rawI), comision = r2(rawC);
    var igv = r2(r2(rawI * t.igv / 100) + r2(rawC * t.igv / 100));
    var retencion = r2(M * t.retencion / 100);
    var costo = r2(interes + comision + igv);
    var neto = r2(M - costo - retencion);
    return { monto: M, dias: dias, interes: interes, comision: comision, igv: igv, costo: costo, neto: neto,
      pct: M > 0 ? neto / M : 0 };
  }

  /* ------------------------------------------------------------ selector */
  var pbar = $('[data-pbar]');
  var tabs = $$('[data-go]', pbar);
  var ind = $('.pbar-ind', pbar);
  var frame = $('iframe.actual');
  var notesBtn = $('.pbar-more', pbar), notes = $('#pbar-notes');

  function actual() { return html.getAttribute('data-p'); }
  function rootOf(p) { return $('.P[data-prop="' + p + '"]'); }

  function placeInd() {
    var t = $('[data-go="' + actual() + '"]', pbar);
    if (!t) return;
    ind.style.width = t.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + t.offsetLeft + 'px)';
  }
  function syncTabs() {
    tabs.forEach(function (t) { t.setAttribute('aria-selected', t.dataset.go === actual() ? 'true' : 'false'); });
    placeInd();
    var enActual = actual() === 'actual';
    if (enActual && !frame.getAttribute('src')) frame.setAttribute('src', frame.dataset.src);
    frame.hidden = !enActual;
  }
  function seccionVisible() {
    var root = rootOf(actual());
    if (!root) return null;
    var mid = innerHeight * 0.38, best = null;
    $$('[data-sec]', root).forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.height && r.top <= mid && r.bottom > mid) best = { k: s.dataset.sec, f: (mid - r.top) / r.height };
    });
    return best;
  }
  function ir(p, origen) {
    if (p === actual()) return;
    var sec = actual() !== 'actual' ? seccionVisible() : null;
    function cambiar() {
      html.setAttribute('data-p', p);
      try { localStorage.setItem('fc-prop', p); } catch (e) { /* sin almacenamiento */ }
      try { history.replaceState(null, '', location.pathname + '?p=' + p); } catch (e) { /* file:// */ }
      syncTabs();
      if (p === 'actual') return;
      var root = rootOf(p), y = 0;
      if (sec) {
        var t = $('[data-sec="' + sec.k + '"]', root);
        if (t) { var r = t.getBoundingClientRect(); y = scrollY + r.top + r.height * sec.f - innerHeight * 0.38; }
      }
      scrollTo(0, Math.max(0, y));
      revelarYa(root);
      vista();
    }
    if (doc.startViewTransition && !reduce) {
      var b = origen ? origen.getBoundingClientRect() : null;
      html.style.setProperty('--vx', b ? Math.round(b.left + b.width / 2) + 'px' : '50%');
      html.style.setProperty('--vy', b ? Math.round(b.top + b.height / 2) + 'px' : '0px');
      doc.startViewTransition(cambiar);
    } else { cambiar(); }
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { ir(t.dataset.go, t); }); });
  notesBtn.addEventListener('click', function () {
    var abrir = notes.hidden;
    notes.hidden = !abrir;
    notesBtn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
  });
  doc.addEventListener('click', function (e) {
    if (!notes.hidden && !pbar.contains(e.target)) { notes.hidden = true; notesBtn.setAttribute('aria-expanded', 'false'); }
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !notes.hidden) { notes.hidden = true; notesBtn.setAttribute('aria-expanded', 'false'); }
    var t = e.target;
    if (e.altKey || e.ctrlKey || e.metaKey || /input|textarea|select/i.test(t.tagName) || t.isContentEditable) return;
    var mapa = { '1': 'actual', '2': 'a', '3': 'b' };
    if (mapa[e.key]) ir(mapa[e.key], $('[data-go="' + mapa[e.key] + '"]', pbar));
  });
  addEventListener('resize', placeInd);
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(placeInd);

  /* --------------------------------------------------- aparición al bajar */
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
  function terminar(el, espera) {
    setTimeout(function () { el.classList.add('done'); el.style.transitionDelay = ''; }, espera + 1300);
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add('in');
      io.unobserve(el);
      $$('[data-count]', el).forEach(function (c) { contar(c); });
      terminar(el, parseFloat(el.style.transitionDelay) || 0);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }) : null;

  $$('[data-r]').forEach(function (el) {
    var hermanos = [].filter.call(el.parentElement.children, function (c) { return c.hasAttribute('data-r'); });
    var k = hermanos.indexOf(el);
    if (k > 0) el.style.transitionDelay = Math.min(k, 6) * 80 + 'ms';
    if (io) { $$('[data-count]', el).forEach(function (c) { c.textContent = '0'; }); io.observe(el); }
    else { el.classList.add('in', 'done'); }
  });
  function revelarYa(root) {
    $$('[data-r]:not(.in)', root).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) {
        el.classList.add('instant', 'in', 'done');
        el.style.transitionDelay = '';
        if (io) io.unobserve(el);
        $$('[data-count]', el).forEach(function (c) { contar(c, true); });
      }
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { $$('.instant', root).forEach(function (el) { el.classList.remove('instant'); }); });
    });
  }

  /* ------------------------------------------------------------ propuesta */
  function Propuesta(root) {
    var X = root.dataset.prop;
    var hero = $('[data-hero]', root);
    var sim = $('[data-sim]', root);
    var amt = $('[data-amt]', sim);
    var curBtn = $('[data-cur]', sim);
    var range = $('[data-range]', sim);
    var estado = { prod: 'factoring', cur: 'PEN', monto: 100000, dias: 30 };
    var tocado = false, ultimo = null, raf = 0;

    /* --- producto visible (banner) y textos del simulador */
    function pintarProducto(k) {
      $$('[data-prod]', hero).forEach(function (el) {
        if (el.matches('button')) {
          var sel = el.dataset.prod === k;
          if (el.getAttribute('role') === 'tab') el.setAttribute('aria-selected', sel ? 'true' : 'false');
          else { el.classList.toggle('is-on', sel); if (sel) el.setAttribute('aria-current', 'true'); else el.removeAttribute('aria-current'); }
          return;
        }
        var on = el.dataset.prod === k;
        el.classList.toggle('is-on', on);
        if (el.tagName !== 'IMG') { if (on) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true'); }
      });
      var p = PROD[k];
      var q = $('.a-sim-q', sim);
      function textos() {
        $$('[data-k="ml"]', root).forEach(function (e) { e.textContent = p.ml; });
        $$('[data-k="rl"]', root).forEach(function (e) { e.textContent = p.rl; });
        $$('[data-k="rls"]', root).forEach(function (e) { e.textContent = p.rls; });
        $$('[data-k="cta"]', root).forEach(function (e) { e.textContent = p.cta; });
        $$('[data-k="s1"]', sim).forEach(function (e) { e.textContent = p.s1; });
        $$('[data-k="s2"]', sim).forEach(function (e) { e.textContent = p.s2; });
        $$('[data-s="prod"]', root).forEach(function (e) { e.textContent = p.n; });
      }
      if (q && !reduce) { q.classList.add('is-swap'); setTimeout(function () { textos(); q.classList.remove('is-swap'); }, 220); }
      else { textos(); }
      altoCopy();
      var nombre = $('[data-prod-name]', sim);
      if (nombre) nombre.textContent = p.n;
      $$('.b-prodmenu [data-p]', sim).forEach(function (o) { o.setAttribute('aria-selected', o.dataset.p === k ? 'true' : 'false'); });
    }
    /* el bloque de titulares se ajusta al alto del producto visible (sin saltos ni huecos) */
    var copyBox = $('.a-copy', hero);
    function altoCopy() {
      if (!copyBox) return;
      var act = $('.a-v.is-on', copyBox);
      if (act) copyBox.style.height = act.offsetHeight + 'px';
    }
    addEventListener('resize', altoCopy);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(altoCopy);

    function ponerProducto(k, manual) {
      estado.prod = k;
      pintarProducto(k);
      calcular();
      if (manual) detener();
    }

    /* --- rotación de banners: se detiene en cuanto la persona interactúa */
    var timer = 0, quieto = false, pausa = false;
    var DUR = 7000;
    hero.style.setProperty('--dur', DUR / 1000 + 's');
    function reiniciarBarra() {
      hero.classList.remove('is-playing');
      void hero.offsetWidth;
      if (!quieto && !pausa && !reduce) hero.classList.add('is-playing');
    }
    function programar() {
      clearTimeout(timer);
      if (quieto || pausa || reduce) { hero.classList.remove('is-playing'); return; }
      reiniciarBarra();
      timer = setTimeout(function () {
        if (tocado) { detener(); return; }
        var i = ORDEN.indexOf(estado.prod);
        ponerProducto(ORDEN[(i + 1) % ORDEN.length], false);
        programar();
      }, DUR);
    }
    function detener() { quieto = true; clearTimeout(timer); hero.classList.remove('is-playing'); }
    function pausar(v) { if (quieto) return; pausa = v; if (v) { clearTimeout(timer); hero.classList.add('is-paused'); hero.classList.remove('is-playing'); } else { hero.classList.remove('is-paused'); programar(); } }
    hero.addEventListener('mouseenter', function () { pausar(true); });
    hero.addEventListener('mouseleave', function () { pausar(false); });
    sim.addEventListener('focusin', function () { tocado = true; detener(); });
    sim.addEventListener('pointerdown', function () { tocado = true; detener(); });
    sim.addEventListener('click', function () { tocado = true; detener(); });
    $$('[role="tab"][data-prod], .b-dots [data-prod]', hero).forEach(function (b) {
      b.addEventListener('click', function () { ponerProducto(b.dataset.prod, true); });
    });

    /* --- cálculo y salida */
    function tween(els, desde, hasta, cur) {
      cancelAnimationFrame(raf);
      if (reduce || desde === null || desde === hasta) { els.forEach(function (e) { e.textContent = money(hasta, cur); }); return; }
      var t0 = null;
      function paso(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 520, 1), e = 1 - Math.pow(1 - p, 3);
        var v = desde + (hasta - desde) * e;
        els.forEach(function (el) { el.textContent = money(v, cur); });
        if (p < 1) raf = requestAnimationFrame(paso);
      }
      raf = requestAnimationFrame(paso);
    }
    function poner(sel, txt) { $$('[data-o="' + sel + '"]', root).forEach(function (e) { e.textContent = txt; }); }
    function calcular() {
      var M = estado.monto, cur = estado.cur;
      var netos = $$('[data-o="neto"]', root);
      if (M < 1) {
        cancelAnimationFrame(raf);
        netos.forEach(function (e) { e.textContent = '—'; });
        ['pct', 'costo', 'monto', 'interes', 'comision', 'igv'].forEach(function (k) { poner(k, '—'); });
        ultimo = null;
        actualizarWa(null);
        return;
      }
      var q = cotizar(M, estado.dias);
      tween(netos, ultimo === null ? null : ultimo.neto, q.neto, cur);
      poner('pct', (q.pct * 100).toFixed(1) + ' %');
      poner('costo', money(q.costo, cur));
      poner('monto', money(M, cur));
      poner('interes', '− ' + money(q.interes, cur));
      poner('comision', '− ' + money(q.comision, cur));
      poner('igv', '− ' + money(q.igv, cur));
      $$('[data-split="neto"]', root).forEach(function (e) { e.style.width = (q.pct * 100).toFixed(2) + '%'; });
      $$('[data-split="costo"]', root).forEach(function (e) { e.style.width = ((1 - q.pct) * 100).toFixed(2) + '%'; });
      $$('[data-s="monto"]', root).forEach(function (e) { e.textContent = money(M, cur); });
      $$('[data-s="dias"]', root).forEach(function (e) { e.textContent = estado.dias + ' días'; });
      $$('[data-s="neto"]', root).forEach(function (e) { e.textContent = money(q.neto, cur); });
      ultimo = q;
      actualizarWa(q);
    }
    function actualizarWa(q) {
      var p = PROD[estado.prod];
      var txt = q ? 'Hola, Falcon Capital. Simulé ' + p.wa + ' por ' + money(estado.monto, estado.cur) + ' a ' + estado.dias +
        ' días y quisiera más información.' : 'Hola, Falcon Capital. Quisiera más información.';
      var href = WA_URL + '?text=' + encodeURIComponent(txt);
      $$('[data-wa]', root).forEach(function (a) { a.setAttribute('href', href); });
    }

    /* --- monto */
    var espejo = null;
    if (X === 'a') {
      espejo = doc.createElement('span');
      espejo.setAttribute('aria-hidden', 'true');
      espejo.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-.02em;left:-9999px;top:0';
      amt.parentNode.appendChild(espejo);
    }
    function ancho() {
      if (!espejo) return;
      espejo.style.fontSize = getComputedStyle(amt).fontSize;
      espejo.textContent = amt.value || amt.placeholder || '0';
      amt.style.width = Math.ceil(espejo.getBoundingClientRect().width + 6) + 'px';
    }
    function sincRange() {
      if (!range) return;
      var v = clamp(estado.monto, +range.min, +range.max);
      range.value = v;
      range.style.setProperty('--v', ((v - range.min) / (range.max - range.min) * 100).toFixed(2) + '%');
    }
    amt.addEventListener('input', function () {
      var n = Math.min(digits(amt.value), MAX);
      amt.value = n > 0 ? miles(n) : '';
      estado.monto = n;
      ancho(); sincRange(); calcular();
    });
    amt.addEventListener('blur', function () {
      if (!estado.monto) { estado.monto = 100000; amt.value = miles(100000); ancho(); sincRange(); calcular(); }
    });
    amt.addEventListener('focus', function () { setTimeout(function () { try { amt.select(); } catch (e) { /* */ } }, 0); });
    if (range) {
      range.addEventListener('input', function () {
        estado.monto = +range.value;
        amt.value = miles(estado.monto);
        ancho(); sincRange(); calcular();
      });
    }

    /* --- moneda */
    curBtn.addEventListener('click', function () {
      estado.cur = estado.cur === 'PEN' ? 'USD' : 'PEN';
      curBtn.textContent = estado.cur === 'PEN' ? 'S/' : 'US$';
      curBtn.setAttribute('aria-label', 'Cambiar moneda, ahora ' + (estado.cur === 'PEN' ? 'soles' : 'dólares'));
      curBtn.classList.remove('flip'); void curBtn.offsetWidth; curBtn.classList.add('flip');
      ultimo = null;
      calcular();
    });

    /* --- plazo */
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

    /* --- selector de producto dentro de la barra (B) */
    var psel = $('[data-prodsel]', sim);
    if (psel) {
      var pbtn = $('.b-prodbtn', psel);
      var abrirP = function (v) { psel.classList.toggle('open', v); pbtn.setAttribute('aria-expanded', v ? 'true' : 'false'); };
      pbtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var abrir = !psel.classList.contains('open');
        abrirP(abrir);
        if (abrir) { var s = $('[aria-selected="true"]', psel); if (s) s.focus(); }
      });
      $$('[data-p]', psel).forEach(function (o) {
        o.addEventListener('click', function (e) { e.stopPropagation(); ponerProducto(o.dataset.p, true); abrirP(false); pbtn.focus(); });
      });
      psel.addEventListener('keydown', function (e) {
        var ops = $$('[data-p]', psel), k = ops.indexOf(doc.activeElement);
        if (e.key === 'Escape') { abrirP(false); pbtn.focus(); }
        if (e.key === 'ArrowDown' && k > -1) { e.preventDefault(); ops[Math.min(k + 1, ops.length - 1)].focus(); }
        if (e.key === 'ArrowUp' && k > -1) { e.preventDefault(); ops[Math.max(k - 1, 0)].focus(); }
      });
      doc.addEventListener('click', function (e) { if (!psel.contains(e.target)) abrirP(false); });
    }

    /* --- detalle del cálculo (A) */
    var dBtn = $('[data-detail-btn]', sim), det = $('[data-detail]', sim);
    if (dBtn && det) {
      det.hidden = false;
      dBtn.addEventListener('click', function () {
        var abrir = !det.classList.contains('open');
        det.classList.toggle('open', abrir);
        dBtn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
        dBtn.firstChild.textContent = abrir ? 'Ocultar detalle ' : 'Ver detalle ';
      });
    }

    /* --- solicitud: panel lateral (A) o barra que se abre (B) */
    var drawer = $('[data-drawer]', root);
    var abrirLead = $('[data-open-lead]', sim);
    var ultimoFoco = null;
    function abrirDrawer() {
      tocado = true; detener();
      ultimoFoco = doc.activeElement;
      drawer.hidden = false;
      html.classList.add('lock');
      requestAnimationFrame(function () { requestAnimationFrame(function () { drawer.classList.add('open'); }); });
      setTimeout(function () { var i = $('input', drawer); if (i) i.focus({ preventScroll: true }); }, 420);
    }
    function cerrarDrawer() {
      drawer.classList.remove('open');
      html.classList.remove('lock');
      setTimeout(function () { drawer.hidden = true; }, 600);
      if (ultimoFoco) ultimoFoco.focus({ preventScroll: true });
    }
    if (drawer && abrirLead) {
      abrirLead.addEventListener('click', abrirDrawer);
      $$('[data-close]', drawer).forEach(function (c) { c.addEventListener('click', cerrarDrawer); });
      drawer.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') cerrarDrawer();
        if (e.key === 'Tab') {
          var f = $$('a[href],button:not([disabled]),input:not([type=hidden])', drawer).filter(function (el) { return el.offsetParent !== null; });
          if (!f.length) return;
          if (e.shiftKey && doc.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
          else if (!e.shiftKey && doc.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
        }
      });
    }
    var expand = $('[data-expand]', sim), panel = $('[data-panel]', sim);
    if (expand && panel) {
      var copies = $('.b-copies', hero), dotsBox = $('.b-dots', hero);
      var abrirPanel = function (v) {
        expand.setAttribute('aria-expanded', v ? 'true' : 'false');
        if (v) {
          hero.classList.add('is-open');
          setTimeout(function () {
            if (!hero.classList.contains('is-open')) return;
            copies.classList.add('gone'); dotsBox.classList.add('gone');
            panel.hidden = false;
            var top = panel.getBoundingClientRect().top;
            var hdr = innerWidth > 760 ? 150 : 140;
            if (top < hdr) scrollBy({ top: top - hdr, behavior: reduce ? 'auto' : 'smooth' });
            setTimeout(function () { var i = $('input', panel); if (i) i.focus({ preventScroll: true }); }, 500);
          }, reduce ? 0 : 280);
        } else {
          panel.hidden = true;
          copies.classList.remove('gone'); dotsBox.classList.remove('gone');
          requestAnimationFrame(function () { hero.classList.remove('is-open'); });
          expand.focus({ preventScroll: true });
        }
      };
      expand.addEventListener('click', function () { abrirPanel(panel.hidden); });
      $('[data-collapse]', panel).addEventListener('click', function () { abrirPanel(false); });
      panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') abrirPanel(false); });
    }

    /* --- formulario corto */
    $$('[data-lead-form]', root).forEach(function (form) { formulario(form, function () { return estado; }); });

    /* --- ir al simulador desde cualquier botón */
    function irAlSimulador(k) {
      cerrarMenu();
      if (k) ponerProducto(k, true);
      var y = hero.getBoundingClientRect().top + scrollY - (X === 'b' ? 0 : 70);
      if (X === 'a') y = sim.getBoundingClientRect().top + scrollY - innerHeight * 0.18;
      scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(function () {
        sim.classList.remove('is-flash'); void sim.offsetWidth; sim.classList.add('is-flash');
        amt.focus({ preventScroll: true });
      }, reduce ? 0 : 650);
    }
    $$('[data-go-sim]', root).forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); irAlSimulador(null); });
    });
    $$('[data-simular]', root).forEach(function (b) {
      b.addEventListener('click', function () { irAlSimulador(b.dataset.simular); });
    });

    /* --- menú móvil y desplegables */
    var burger = $('[data-menu]', root), mmenu = $('[data-mmenu]', root);
    function cerrarMenu() {
      if (!mmenu || mmenu.hidden) return;
      mmenu.hidden = true; burger.setAttribute('aria-expanded', 'false'); html.classList.remove('lock');
    }
    if (burger && mmenu) {
      burger.addEventListener('click', function () {
        var abrir = mmenu.hidden;
        mmenu.hidden = !abrir;
        burger.setAttribute('aria-expanded', abrir ? 'true' : 'false');
        html.classList.toggle('lock', abrir);
      });
      $$('a', mmenu).forEach(function (a) { a.addEventListener('click', function () { if (!a.hasAttribute('data-go-sim')) cerrarMenu(); }); });
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

    /* --- carrusel de noticias */
    $$('[data-rail]', root).forEach(function (rail) {
      var sec = rail.closest('section');
      var prev = $('[data-rail-prev]', sec), next = $('[data-rail-next]', sec), bar = $('[data-rail-bar]', sec);
      function paso() {
        var c = rail.firstElementChild;
        return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 20) : 320;
      }
      function act() {
        var max = rail.scrollWidth - rail.clientWidth;
        var vis = rail.scrollWidth ? rail.clientWidth / rail.scrollWidth : 1;
        var p = max > 0 ? rail.scrollLeft / max : 0;
        if (bar) { bar.style.width = (vis * 100) + '%'; bar.style.transform = 'translateX(' + (p * (1 / vis - 1) * 100) + '%)'; }
        if (prev) prev.disabled = rail.scrollLeft < 4;
        if (next) next.disabled = rail.scrollLeft > max - 4;
      }
      if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -paso(), behavior: reduce ? 'auto' : 'smooth' }); });
      if (next) next.addEventListener('click', function () { rail.scrollBy({ left: paso(), behavior: reduce ? 'auto' : 'smooth' }); });
      rail.addEventListener('scroll', act, { passive: true });
      addEventListener('resize', act);
      doc.addEventListener('fc:vista', act);
      act();
      var abajo = false, sx = 0, sl = 0, movio = false;
      rail.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        abajo = true; movio = false; sx = e.clientX; sl = rail.scrollLeft;
      });
      addEventListener('pointermove', function (e) {
        if (!abajo) return;
        var dx = e.clientX - sx;
        if (!movio && Math.abs(dx) > 5) { movio = true; rail.classList.add('is-drag'); }
        if (movio) rail.scrollLeft = sl - dx;
      });
      addEventListener('pointerup', function () {
        if (!abajo) return;
        abajo = false;
        if (movio) { rail.classList.remove('is-drag'); setTimeout(function () { movio = false; }, 0); }
      });
      rail.addEventListener('click', function (e) { if (movio) { e.preventDefault(); e.stopPropagation(); } }, true);
      rail.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); rail.scrollBy({ left: paso(), behavior: 'smooth' }); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); rail.scrollBy({ left: -paso(), behavior: 'smooth' }); }
      });
    });

    /* --- cita que se revela palabra por palabra (B) */
    var cita = $('[data-words]', root), palabras = [];
    if (cita) {
      cita.innerHTML = cita.textContent.split(/(\s+)/).map(function (w) {
        return /^\s+$/.test(w) ? w : '<span class="w">' + w + '</span>';
      }).join('');
      palabras = $$('.w', cita);
      if (reduce) palabras.forEach(function (w) { w.classList.add('on'); });
    }

    /* --- héroe fuera de vista: «Simulador» resaltado y barra móvil */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { root.classList.toggle('is-past', !e.isIntersecting); });
      }, { rootMargin: '-35% 0px 0px 0px' }).observe(sim);
    }

    /* --- estado inicial */
    pintarProducto('factoring');
    ancho(); sincRange(); calcular();
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(ancho);

    return {
      X: X, root: root, hero: hero, palabras: palabras, cita: cita,
      activo: function () { return actual() === X; },
      arrancar: function () { if (!quieto) { pausa = false; programar(); } },
      parar: function () { clearTimeout(timer); hero.classList.remove('is-playing'); },
      ancho: ancho
    };
  }

  /* ------------------------------------------------------------ formulario */
  function formulario(form, estadoFn) {
    var lead = form.parentElement;
    var ok = $('.lead-ok', lead);
    var campos = $$('input', form);
    function valido(i) {
      var v = i.value.trim();
      if (i.type === 'checkbox') return i.checked;
      if (i.name === 'nombre') return v.length >= 3;
      if (i.name === 'ruc') return /^(10|15|17|20)\d{9}$/.test(v);
      if (i.name === 'celular') return /^9\d{8}$/.test(v.replace(/\D/g, ''));
      if (i.name === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      return true;
    }
    function marcar(i) {
      var cont = i.type === 'checkbox' ? i.closest('.lf-ck') : i.closest('.lf');
      var bien = valido(i);
      if (cont) cont.classList.toggle('bad', !bien);
      i.setAttribute('aria-invalid', bien ? 'false' : 'true');
      return bien;
    }
    campos.forEach(function (i) {
      if (i.hasAttribute('data-digits')) i.addEventListener('input', function () { i.value = i.value.replace(/\D/g, '').slice(0, 11); });
      if (i.hasAttribute('data-phone')) {
        i.addEventListener('input', function () {
          var d = i.value.replace(/\D/g, '').slice(0, 9);
          i.value = d.replace(/^(\d{3})(\d{0,3})(\d{0,3}).*/, function (m, a, b, c) { return [a, b, c].filter(Boolean).join(' '); });
        });
      }
      i.addEventListener('blur', function () { if (i.value || i.type === 'checkbox') i.dataset.t = '1'; if (i.dataset.t) marcar(i); });
      i.addEventListener('input', function () { if (i.dataset.t) marcar(i); });
      i.addEventListener('change', function () { if (i.type === 'checkbox') marcar(i); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var malos = campos.filter(function (i) { i.dataset.t = '1'; return !marcar(i); });
      if (malos.length) { malos[0].focus(); return; }
      var btn = $('.lf-send', form), lbl = $('span', btn);
      btn.classList.add('is-busy'); lbl.textContent = 'Enviando…';
      setTimeout(function () {
        var st = estadoFn();
        var nom = (form.elements.nombre.value.trim().split(/\s+/)[0] || '');
        $('[data-ok-name]', ok).textContent = nom.charAt(0).toUpperCase() + nom.slice(1);
        $('[data-ok-prod]', ok).textContent = PROD[st.prod].n + ' por ' + money(st.monto, st.cur) + ' a ' + st.dias + ' días';
        form.hidden = true;
        ok.hidden = false;
        ok.focus({ preventScroll: true });
        btn.classList.remove('is-busy'); lbl.textContent = 'Enviar solicitud';
      }, reduce ? 0 : 950);
    });
  }

  /* ------------------------------------------------- boletín (pie de página) */
  $$('[data-nl]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var i = $('input', f);
      var bien = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value.trim());
      f.classList.toggle('bad', !bien);
      if (!bien) { i.focus(); return; }
      $('.nl-ok', f).hidden = false;
      i.value = '';
    });
  });

  /* ------------------------------------------------------ video institucional */
  var vm = $('[data-vmodal]');
  var vFoco = null;
  function cerrarVideo() { vm.hidden = true; html.classList.remove('lock'); if (vFoco) vFoco.focus({ preventScroll: true }); }
  $$('[data-video]').forEach(function (b) {
    b.addEventListener('click', function () {
      vFoco = b; vm.hidden = false; html.classList.add('lock');
      $('.vmodal-x', vm).focus({ preventScroll: true });
    });
  });
  $$('[data-close]', vm).forEach(function (c) { c.addEventListener('click', cerrarVideo); });
  vm.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarVideo(); });

  /* ------------------------------------------------- horario: abierto ahora */
  function horario() {
    var o = {};
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: 'America/Lima', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false })
        .formatToParts(new Date()).forEach(function (p) { o[p.type] = p.value; });
    } catch (e) { return; }
    var lab = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(o.weekday) > -1;
    var min = (+o.hour % 24) * 60 + (+o.minute);
    var abierto = lab && min >= 540 && min < 1080;
    var txt;
    if (abierto) txt = 'Abierto ahora · hasta las 6:00 p. m.';
    else {
      var cuando = lab && min < 540 ? 'hoy' : (o.weekday === 'Fri' || o.weekday === 'Sat' || o.weekday === 'Sun') ? 'el lunes' : 'mañana';
      txt = 'Cerrado · abrimos ' + cuando + ' a las 9:00 a. m.';
    }
    $$('[data-open]').forEach(function (el) { el.classList.toggle('is-open', abierto); $('span', el).textContent = txt; });
  }
  horario();
  setInterval(horario, 60000);

  /* ------------------------------------------------------------ arranque */
  var props = $$('.P').map(Propuesta);
  function prop() { return props.filter(function (p) { return p.activo(); })[0] || null; }
  function vista() {
    props.forEach(function (p) { if (p.activo()) { p.arrancar(); p.ancho(); } else p.parar(); });
    doc.dispatchEvent(new CustomEvent('fc:vista'));
    efectos();
  }
  doc.addEventListener('visibilitychange', function () {
    var p = prop();
    if (!p) return;
    if (doc.hidden) p.parar(); else p.arrancar();
  });

  /* --------------------------------------------- efectos ligados al scroll */
  var lastY = scrollY, pend = false;
  function efectos() {
    pend = false;
    var p = prop();
    if (!p) return;
    var y = scrollY, vh = innerHeight;
    var hdr = $('.a-hdr, .b-hdr', p.root);
    if (hdr) hdr.classList.toggle('is-scrolled', y > 8);
    p.root.classList.toggle('is-compact', y > 420);
    if (p.X === 'b') {
      var heroH = p.hero.offsetHeight;
      var menuAbierto = $('[data-mmenu]', p.root) && !$('[data-mmenu]', p.root).hidden;
      if (!menuAbierto) {
        if (y > heroH && y > lastY + 6) hdr.classList.add('is-hidden');
        else if (y < lastY - 6 || y < heroH) hdr.classList.remove('is-hidden');
      }
      if (reduce) { lastY = y; return; }
      var vw = $('[data-scrub="video"]', p.root);
      if (vw) {
        var r = vw.getBoundingClientRect();
        var t = clamp((vh - r.top) / (vh * 0.8), 0, 1);
        var e = 1 - Math.pow(1 - t, 3);
        vw.style.setProperty('--s', (0.88 + 0.12 * e).toFixed(4));
        vw.style.setProperty('--r', (44 - 16 * e).toFixed(1) + 'px');
      }
      var cb = $('[data-scrub="cta"]', p.root);
      if (cb) {
        var rc = cb.parentElement.getBoundingClientRect();
        if (rc.bottom > 0 && rc.top < vh) cb.style.setProperty('--y', (((rc.top + rc.height / 2) - vh / 2) / vh * -70).toFixed(1) + 'px');
      }
      if (innerWidth > 980) {
        var cards = $$('.b-stack', p.root);
        for (var i = 0; i < cards.length - 1; i++) {
          var sig = cards[i + 1].getBoundingClientRect().top;
          var tope = parseFloat(getComputedStyle(cards[i + 1]).top) || 0;
          var k = clamp((vh - sig) / Math.max(vh - tope, 1), 0, 1);
          var inner = cards[i].firstElementChild;
          inner.style.transform = 'scale(' + (1 - 0.06 * k).toFixed(4) + ')';
          inner.style.setProperty('--dim', (0.5 * k).toFixed(3));
        }
      }
      if (p.cita && p.palabras.length) {
        var rq = p.cita.getBoundingClientRect();
        var tq = clamp((vh * 0.88 - rq.top) / (rq.height + vh * 0.3), 0, 1);
        var n = Math.round(tq * p.palabras.length);
        p.palabras.forEach(function (w, j) { w.classList.toggle('on', j < n); });
      }
    }
    lastY = y;
  }
  addEventListener('scroll', function () { if (!pend) { pend = true; requestAnimationFrame(efectos); } }, { passive: true });
  addEventListener('resize', function () { if (!pend) { pend = true; requestAnimationFrame(efectos); } });

  syncTabs();
  vista();
})();
