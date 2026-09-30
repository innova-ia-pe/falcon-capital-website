/* Falcon Capital · prototipo — interacciones del mockup */
(function () {
  'use strict';

  /* -------------------------------------- menú, acordeones, bot y cookies */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.burger');
    if (b) { document.querySelector('.hdr nav').classList.toggle('open'); return; }

    var t = e.target.closest('.toc-h');
    if (t) {
      t.classList.toggle('closed');
      t.nextElementSibling.hidden = !t.nextElementSibling.hidden;
      return;
    }

    var q = e.target.closest('.faq-q');
    if (q) {
      var item = q.parentNode;
      var open = item.classList.contains('open');
      [].forEach.call(item.parentNode.children, function (el) {
        el.classList.remove('open');
        el.querySelector('.faq-a').hidden = true;
        el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('open');
        item.querySelector('.faq-a').hidden = false;
        q.setAttribute('aria-expanded', 'true');
      }
      return;
    }

    var th = e.target.closest('.th');
    if (th) {
      var now = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = now;
      try { localStorage.setItem('fc-theme', now); } catch (err) {}
      return;
    }

    var bot = e.target.closest('.bot-btn');
    if (bot) {
      var panel = document.querySelector('.bot-panel');
      if (panel) {
        panel.hidden = !panel.hidden;
        bot.setAttribute('aria-expanded', panel.hidden ? 'false' : 'true');
      }
      return;
    }

    /* clic fuera del dock: se cierra */
    if (!e.target.closest('.dock')) { closeDock(); }

    var ck = e.target.closest('[data-cookies]');
    if (ck) {
      try { localStorage.setItem('fc-cookies', ck.dataset.cookies); } catch (err) {}
      var box = document.querySelector('.cookies');
      if (box) { box.hidden = true; }
      return;
    }

  });

  function closeDock() {
    var panel = document.querySelector('.bot-panel');
    if (panel && !panel.hidden) {
      panel.hidden = true;
      document.querySelector('.bot-btn').setAttribute('aria-expanded', 'false');
    }
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeDock(); }
  });

  /* el aviso de cookies solo aparece si aún no hubo elección */
  var box = document.querySelector('.cookies');
  if (box) {
    var saved = null;
    try { saved = localStorage.getItem('fc-cookies'); } catch (err) {}
    if (!saved) { setTimeout(function () { box.hidden = false; }, 900); }
  }

  /* Los formularios normales de la web son maqueta */
  document.addEventListener('submit', function (e) {
    if (e.target.classList.contains('fsim-form')) return;
    e.preventDefault();
    var msg = e.target.querySelector('.form-msg');
    if (msg) { msg.hidden = false; }
  });

  /* ------------------------------------------- aparición suave al hacer scroll */
  if ('IntersectionObserver' in window) {
    var sel = '.head, .card, .tile, .photo, .kpi, .req, .step, .steps li, .quote-body, .quote-img,' +
              ' .cta-box, .screen, .form-card, .hero-grid > *, .chips, .pending, .faq-i, .sim-out, .state';
    var items = [].slice.call(document.querySelectorAll(sel));
    items.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          setTimeout(function () { el.classList.add('in'); }, (+el.dataset.i || 0) * 70);
          io.unobserve(el);
        }
      });
    }, { rootMargin: '0px 0px 40px 0px', threshold: 0.01 });
    items.forEach(function (el) {
      var prev = el.previousElementSibling;
      el.dataset.i = prev && prev.classList.contains('reveal') ? Math.min(+prev.dataset.i + 1, 3) : 0;
      io.observe(el);
    });
  }

  /* --------------------------------------------------- simulador (maqueta v2.0)
     En tres pasos para que el banner no se sature: 1) producto, monto y plazo,
     2) datos de contacto, 3) resultado. Los campos son los de la maqueta.
     Falcon Capital aún no entrega tasas, comisiones ni fórmula: el resultado se
     queda en cero, como en la maqueta. Cuando lleguen se completa
     PRODUCTOS[x].calcular(monto, dias, moneda) → {neto, tasa, comision}. */
  function initSimulador() {
    var PRODUCTOS = {
      factoring: {
        nombre: 'Factoring',
        subtitulo: 'Porque la rapidez no cuesta más, simula tu anticipo ahora.',
        monto: 'Monto de la factura',
        tasa: 'Tasa Factoring Efectiva Mensual',
        calcular: null
      },
      confirming: {
        nombre: 'Confirming',
        subtitulo: 'Porque la rapidez no cuesta más.',
        monto: 'Monto de las facturas',
        tasa: 'Tasa Confirming Efectiva Mensual',
        calcular: null
      },
      capital: {
        nombre: 'Capital de Trabajo',
        subtitulo: 'Porque la rapidez no cuesta más.',
        monto: 'Monto a solicitar',
        tasa: 'Tasa Efectiva Mensual',
        calcular: null
      }
    };
    function miles(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    function numero(v) { return parseFloat(String(v || '').replace(/[^0-9.]/g, '')) || 0; }

    document.querySelectorAll('.fsim').forEach(function (c) {
      var prod = 'factoring';
      var form = c.querySelector('.fsim-form');
      var pasos = [].slice.call(c.querySelectorAll('.fsim-step'));
      var marcas = [].slice.call(c.querySelectorAll('.fsim-steps li'));
      var monto = form.querySelector('[name=monto]');
      var q = function (s) { return c.querySelector(s); };

      function paso(n) {
        pasos.forEach(function (p) { p.hidden = +p.dataset.step !== n; });
        marcas.forEach(function (m, k) {
          m.classList.toggle('is-on', k + 1 === n);
          m.classList.toggle('is-done', k + 1 < n);
        });
        c.dataset.step = n;
        /* paso 2: al primer campo; paso 3: al título del resultado (para lectores de pantalla) */
        var foco = n === 2 ? pasos[1].querySelector('input') : n === 3 ? pasos[2].querySelector('.fsim-lead') : null;
        if (foco) { foco.focus({ preventScroll: true }); }
      }

      function valido(ambito) {
        var campos = [].slice.call(ambito.querySelectorAll('input[required]'));
        campos.forEach(function (i) { i.classList.add('touched'); });
        var malo = campos.filter(function (i) { return !i.checkValidity(); })[0];
        if (malo) { malo.reportValidity(); return false; }
        return true;
      }

      function pintar() {
        var p = PRODUCTOS[prod];
        var moneda = form.querySelector('[name=moneda]').value;
        var dias = +(form.querySelector('[name=plazo]:checked') || {}).value || 30;
        var sim = moneda === 'USD' ? 'US$' : 'S/';
        var r = p.calcular ? p.calcular(numero(monto.value), dias, moneda) : null;
        q('.r-neto').textContent = sim + ' ' + (r ? miles(r.neto) : '0');
        q('.r-tasa').textContent = r ? r.tasa.toFixed(2) + '%' : '0%';
        q('.r-com').textContent = sim + ' ' + (r ? miles(r.comision) : '0');
        q('.r-resumen').textContent = p.nombre + ' · ' + sim + ' ' + (monto.value || '0') + ' · ' + dias + ' días';
      }

      c.querySelectorAll('.fsim-tabs [data-p]').forEach(function (t) {
        t.addEventListener('click', function () {
          prod = t.dataset.p;
          var p = PRODUCTOS[prod];
          var tabs = [].slice.call(c.querySelectorAll('.fsim-tabs [data-p]'));
          tabs.forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
          c.querySelector('.fsim-tabs').style.setProperty('--i', tabs.indexOf(t));
          q('.fsim-prod').textContent = p.nombre;
          q('.fsim-sub').textContent = p.subtitulo;
          q('.fsim-monto-l').textContent = p.monto;
          q('.r-tasa-l').textContent = p.tasa;
          if (+c.dataset.step === 3) { pintar(); }
        });
      });
      var cur = q('.fsim-cur'), curBtn = q('.fsim-cur-btn');
      function moneda(abrir) {
        cur.classList.toggle('open', abrir);
        curBtn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      }
      function elegir(o) {
        form.querySelector('[name=moneda]').value = o.dataset.v;
        curBtn.querySelector('b').textContent = o.dataset.s;
        c.querySelectorAll('.fsim-cur-menu [role=option]').forEach(function (x) {
          x.setAttribute('aria-selected', x === o ? 'true' : 'false');
        });
        moneda(false);
        curBtn.focus();
      }
      curBtn.addEventListener('click', function (e) { e.stopPropagation(); moneda(!cur.classList.contains('open')); });
      c.querySelectorAll('.fsim-cur-menu [role=option]').forEach(function (o) {
        o.addEventListener('click', function (e) { e.stopPropagation(); elegir(o); });
      });
      cur.addEventListener('keydown', function (e) {
        var ops = [].slice.call(cur.querySelectorAll('[role=option]')), k = ops.indexOf(document.activeElement);
        if (e.key === 'Escape') { moneda(false); curBtn.focus(); }
        if (e.key === 'ArrowDown') { e.preventDefault(); moneda(true); ops[Math.min(k + 1, ops.length - 1)].focus(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); ops[Math.max(k - 1, 0)].focus(); }
      });
      document.addEventListener('click', function (e) { if (!cur.contains(e.target)) moneda(false); });

      monto.addEventListener('input', function () {
        var n = numero(monto.value);
        monto.value = n > 0 ? miles(n) : '';
      });
      q('.fsim-next').addEventListener('click', function () {
        if (valido(pasos[0])) { paso(2); }
      });
      q('.fsim-back').addEventListener('click', function () { paso(1); });
      q('.fsim-reset').addEventListener('click', function () {
        form.reset();
        elegir(c.querySelector('.fsim-cur-menu [data-v=PEN]'));
        form.querySelectorAll('.touched').forEach(function (i) { i.classList.remove('touched'); });
        paso(1);
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (+c.dataset.step === 1) { if (valido(pasos[0])) { paso(2); } return; }
        if (!valido(pasos[1])) { return; }
        pintar();
        paso(3);
      });
      paso(1);
    });
  }

  /* --------------------------------------------- banner principal (4 diapositivas)
     Rota cada 7 s y se detiene en cuanto la persona empieza a usar el simulador. */
  function initHero() {
    var h = document.querySelector('.hero2');
    if (!h) return;
    var slides = [].slice.call(h.querySelectorAll('.hero2-slide'));
    var dots = [].slice.call(h.querySelectorAll('.hero2-dots button'));
    var i = 0, t = null, quieto = false;
    var calma = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function ir(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        var on = k === i;
        s.classList.toggle('is-on', on);
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
        s.inert = !on;
      });
      dots.forEach(function (d, k) {
        d.classList.remove('is-on');
        d.setAttribute('aria-current', k === i ? 'true' : 'false');
      });
      void h.offsetWidth; /* reinicia la animación del progreso */
      dots[i].classList.add('is-on');
    }
    function play() {
      clearInterval(t);
      h.classList.toggle('is-playing', !quieto && !calma);
      if (!quieto && !calma) { t = setInterval(function () { ir(i + 1); }, 7000); }
    }
    function parar() { quieto = true; clearInterval(t); h.classList.remove('is-playing'); }

    dots.forEach(function (d, k) { d.addEventListener('click', function () { ir(k); parar(); }); });
    var prev = h.querySelector('.hero2-prev'), next = h.querySelector('.hero2-next');
    if (prev) prev.addEventListener('click', function () { ir(i - 1); parar(); });
    if (next) next.addEventListener('click', function () { ir(i + 1); parar(); });
    h.addEventListener('mouseenter', function () { clearInterval(t); h.classList.add('is-paused'); });
    h.addEventListener('mouseleave', function () { h.classList.remove('is-paused'); if (!quieto) { ir(i); play(); } });
    h.addEventListener('focusin', function (e) { if (e.target.closest('.fsim')) parar(); });
    ir(0);
    play();
  }

  /* ------------------------------------------ carrusel de noticias (3 por vista) */
  function initRails() {
    document.querySelectorAll('.rail').forEach(function (rail) {
      var nav = document.querySelector('.rail-nav[data-rail="' + rail.id + '"]');
      var prev = nav && nav.querySelector('.rail-prev'), next = nav && nav.querySelector('.rail-next');
      var dots = document.createElement('div');
      dots.className = 'rail-dots';
      rail.parentNode.insertBefore(dots, rail.nextSibling);

      function paso() {
        var c = rail.children[0];
        return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 0) : rail.clientWidth;
      }
      function estado() {
        var max = rail.scrollWidth - rail.clientWidth - 2;
        if (prev) prev.disabled = rail.scrollLeft <= 2;
        if (next) next.disabled = rail.scrollLeft >= max;
        var vistas = Math.max(1, Math.round(rail.clientWidth / paso()));
        var paginas = Math.max(1, Math.ceil(rail.children.length / vistas));
        var actual = Math.min(paginas - 1, Math.round(rail.scrollLeft / (paso() * vistas)));
        if (rail.scrollLeft >= max) actual = paginas - 1;
        if (dots.children.length !== paginas) {
          dots.innerHTML = new Array(paginas + 1).join('<i></i>');
        }
        [].forEach.call(dots.children, function (d, i) { d.classList.toggle('on', i === actual); });
      }
      if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -paso(), behavior: 'smooth' }); });
      if (next) next.addEventListener('click', function () { rail.scrollBy({ left: paso(), behavior: 'smooth' }); });
      rail.addEventListener('scroll', function () { window.requestAnimationFrame(estado); }, { passive: true });
      rail.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { rail.scrollBy({ left: paso() }); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { rail.scrollBy({ left: -paso() }); e.preventDefault(); }
      });
      window.addEventListener('resize', estado);
      estado();
    });
  }

  /* --------------------------------- menú Soluciones, contraseña y adjuntos */
  function initExtras() {
    document.addEventListener('click', function (e) {
      var dd = e.target.closest('.nav-dd-btn');
      document.querySelectorAll('.nav-dd').forEach(function (n) {
        if (!dd || n !== dd.parentNode) { n.classList.remove('open'); n.querySelector('.nav-dd-btn').setAttribute('aria-expanded', 'false'); }
      });
      if (dd) {
        var box = dd.parentNode, abre = !box.classList.contains('open');
        box.classList.toggle('open', abre);
        dd.setAttribute('aria-expanded', abre ? 'true' : 'false');
      }
      var eye = e.target.closest('.pw-eye');
      if (eye) {
        var inp = eye.parentNode.querySelector('input');
        inp.type = inp.type === 'password' ? 'text' : 'password';
        eye.setAttribute('aria-label', inp.type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña');
      }
    });
    document.addEventListener('change', function (e) {
      if (e.target.matches('.file input[type=file]')) {
        var n = e.target.files && e.target.files[0];
        e.target.parentNode.querySelector('.file-name').textContent = n ? n.name : 'Seleccionar archivo';
      }
    });
  }

  // Initialize components
  function initApp() {
    initSimulador();
    initHero();
    initRails();
    initExtras();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();


