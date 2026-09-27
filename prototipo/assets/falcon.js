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

  /* Los formularios son maqueta: no envían datos a ningún servidor */
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = e.target.querySelector('.form-msg');
    if (msg) { msg.hidden = false; }
  });

  /* --------------------------------------------------- carrusel del banner */
  var groups = [].slice.call(document.querySelectorAll('[data-slides]'));
  var nav = document.querySelector('.hero-nav');
  var timer, current = 0;

  function go(i, manual) {
    if (!groups.length) { return; }
    current = i;
    groups.forEach(function (g) {
      [].forEach.call(g.children, function (s, n) { s.classList.toggle('on', n === i); });
    });
    if (nav) {
      [].forEach.call(nav.children, function (b, n) {
        b.classList.remove('on');
        if (n === i) { void b.offsetWidth; b.classList.add('on'); }
      });
    }
    if (manual) { schedule(); }
  }

  function schedule() {
    clearTimeout(timer);
    var total = groups.length ? groups[0].children.length : 0;
    if (total < 2) { return; }
    timer = setTimeout(function () { go((current + 1) % total); schedule(); }, 7000);
  }

  if (groups.length) { go(0); schedule(); }

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
})();
