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

    var d = e.target.closest('.hero-nav button');
    if (d) { go([].indexOf.call(d.parentNode.children, d), true); }
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
    if (e.target.classList.contains('sim-form')) return;
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
     Sin tasas: Falcon Capital aún no entrega tasas, comisiones ni fórmula. El
     resultado se queda en cero como en la maqueta y el envío solo valida los
     datos y confirma el registro. Cuando lleguen las reglas, se completan en
     PRODUCTOS[x].calcular(monto, dias) y nada más cambia. */
  function initBentoSimulator() {
    var cards = document.querySelectorAll('.bento-sim-card');
    if (!cards.length) return;

    var PRODUCTOS = {
      factoring: {
        titulo: 'SIMULADOR DE <span class="em">FACTORING</span>',
        subtitulo: 'Porque la rapidez no cuesta más, simula tu anticipo ahora.',
        etiqueta: 'Factoring',
        monto: 'Monto de la factura',
        tasa: 'Tasa Factoring Efectiva Mensual',
        resultado: 'Conoce cuánto puedes recibir por tu factura.',
        calcular: null
      },
      confirming: {
        titulo: 'SIMULADOR DE <span class="em">CONFIRMING</span>',
        subtitulo: 'Porque la rapidez no cuesta más.',
        etiqueta: 'Confirming',
        monto: 'Monto de las facturas',
        tasa: 'Tasa Confirming Efectiva Mensual',
        resultado: 'Conoce cuánto pueden recibir tus proveedores.',
        calcular: null
      },
      capital: {
        titulo: 'SIMULADOR DE <span class="em">CAPITAL DE TRABAJO</span>',
        subtitulo: 'Porque la rapidez no cuesta más.',
        etiqueta: 'Capital de Trabajo',
        monto: 'Monto a solicitar',
        tasa: 'Tasa Efectiva Mensual',
        resultado: 'Conoce las condiciones de tu financiamiento.',
        calcular: null
      }
    };

    function miles(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    function numero(v) { return parseFloat(String(v || '').replace(/[^0-9.]/g, '')) || 0; }

    cards.forEach(function (card) {
      var prod = 'factoring', dias = 30, moneda = 'PEN';
      var $ = function (s) { return card.querySelector(s); };
      var $$ = function (s) { return card.querySelectorAll(s); };
      var form = $('.sim-form'), monto = $('.sim-amount-input');
      var selBtn = $('.sim-selector-btn'), drop = $('.sim-dropdown');
      var curBtn = $('.sim-curr-btn'), curDrop = $('.sim-curr-dropdown');

      function pintar() {
        var p = PRODUCTOS[prod], sim = moneda === 'USD' ? 'US$' : 'S/';
        var r = p.calcular ? p.calcular(numero(monto.value), dias, moneda) : null;
        $('.res-recibe-hoy').textContent = sim + ' ' + (r ? miles(r.neto) : '0');
        $('.res-tasa').textContent = r ? r.tasa.toFixed(2) + '%' : '0%';
        $('.res-comision').textContent = sim + ' ' + (r ? miles(r.comision) : '0');
      }

      function producto(tipo) {
        var p = PRODUCTOS[tipo];
        if (!p) return;
        prod = tipo;
        $('.sim-title').innerHTML = p.titulo;
        $('.sim-subtitle').textContent = p.subtitulo;
        $('.sim-selected-label').textContent = p.etiqueta;
        $('.sim-monto-label').innerHTML = p.monto + ' <span class="star">*</span>';
        $('.res-tasa-label').textContent = p.tasa;
        $('.sim-res-subtitle').textContent = p.resultado;
        $$('.sim-drop-opt').forEach(function (o) { o.classList.toggle('active', o.dataset.type === tipo); });
        cerrar();
        pintar();
      }

      function cerrar() {
        drop.hidden = true; selBtn.setAttribute('aria-expanded', 'false');
        curDrop.hidden = true; curBtn.setAttribute('aria-expanded', 'false');
      }

      selBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var abrir = drop.hidden; cerrar();
        drop.hidden = !abrir; selBtn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      });
      $$('.sim-drop-opt').forEach(function (o) {
        o.addEventListener('click', function (e) { e.stopPropagation(); producto(o.dataset.type); });
      });
      curBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var abrir = curDrop.hidden; cerrar();
        curDrop.hidden = !abrir; curBtn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      });
      $$('.sim-curr-opt').forEach(function (o) {
        o.addEventListener('click', function (e) {
          e.stopPropagation();
          moneda = o.dataset.currency;
          $('.sim-curr-text').textContent = moneda === 'USD' ? 'US$' : 'S/';
          $$('.sim-curr-opt').forEach(function (x) { x.classList.toggle('active', x === o); });
          cerrar(); pintar();
        });
      });
      $$('.sim-day-btn').forEach(function (b) {
        b.addEventListener('click', function () {
          $$('.sim-day-btn').forEach(function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          dias = parseInt(b.dataset.days, 10) || 30;
          pintar();
        });
      });
      monto.addEventListener('input', function () {
        var n = numero(monto.value);
        monto.value = n > 0 ? miles(n) : '';
        pintar();
      });
      document.addEventListener('click', function (e) { if (!card.contains(e.target)) cerrar(); });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        [].forEach.call(form.querySelectorAll('input[required]'), function (i) { i.classList.add('touched'); });
        if (!form.checkValidity()) { form.reportValidity(); return; }
        pintar();
        $('.sim-pending').hidden = true;
        $('.sim-done').hidden = false;
      });

      pintar();
    });
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

  /* --------------------------------------------------- hero slider interactivo */
  function initHeroSlider() {
    var slider = document.querySelector('.hero-slider');
    if (!slider) return;

    var slides = slider.querySelectorAll('.hero-slide');
    var dots = slider.querySelectorAll('.hero-dot');
    if (!slides.length) return;

    var currentIndex = 0;
    var timer = null;
    var isPaused = false;
    var delay = 7000;

    function goToSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;

      slides.forEach(function (slide, idx) {
        if (idx === currentIndex) {
          slide.classList.add('active');
          slide.setAttribute('aria-hidden', 'false');
        } else {
          slide.classList.remove('active');
          slide.setAttribute('aria-hidden', 'true');
        }
      });

      dots.forEach(function (dot, idx) {
        if (idx === currentIndex) {
          dot.classList.add('active');
          dot.setAttribute('aria-selected', 'true');
        } else {
          dot.classList.remove('active');
          dot.setAttribute('aria-selected', 'false');
        }
      });
    }

    function startTimer() {
      stopTimer();
      timer = setInterval(function () {
        if (!isPaused) {
          goToSlide(currentIndex + 1);
        }
      }, delay);
    }

    function stopTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function (e) {
        e.preventDefault();
        var idx = parseInt(dot.getAttribute('data-index'), 10);
        if (!isNaN(idx)) {
          goToSlide(idx);
          startTimer();
        }
      });
    });

    // Pausar rotación si el usuario pasa el mouse por encima
    slider.addEventListener('mouseenter', function () { isPaused = true; });
    slider.addEventListener('mouseleave', function () { isPaused = false; });

    // Pausar rotación si el usuario está interactuando con formularios o inputs
    slider.addEventListener('focusin', function () { isPaused = true; });
    slider.addEventListener('focusout', function () { isPaused = false; });

    startTimer();
  }

  // Initialize components
  function initApp() {
    initBentoSimulator();
    initHeroSlider();
    initRails();
    initExtras();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();


