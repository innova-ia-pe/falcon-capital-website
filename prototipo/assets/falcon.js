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
              ' .cta-box, .screen, .form-card, .bento-sim-card, .hero-home-sim-cta, .hero-grid > *, .chips, .pending, .faq-i, .sim-out, .state';
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

  /* --------------------------------------------------- simulador bento interactivo */
  function initBentoSimulator() {

    var simCards = document.querySelectorAll('.bento-sim-card');
    if (!simCards.length) return;

    var products = {
      factoring: {
        title: 'SIMULADOR DE <span class="em">FACTORING</span>',
        subtitle: 'Porque la rapidez no cuesta más, simula tu anticipo ahora.',
        label: 'Simulador de Factoring',
        montoLabel: 'Monto de la factura <span class="star">*</span>',
        resSubtitle: 'Conoce cuánto puedes recibir por tu factura.',
        rate: 0.0120, // 1.20% mensual
        commissionRate: 0.0050 // 0.50%
      },
      confirming: {
        title: 'SIMULADOR DE <span class="em">CONFIRMING</span>',
        subtitle: 'Administra los pagos a proveedores y optimiza tu capital de trabajo.',
        label: 'Simulador de Confirming',
        montoLabel: 'Monto de las facturas <span class="star">*</span>',
        resSubtitle: 'Conoce la liquidez proyectada para tus proveedores.',
        rate: 0.0115, // 1.15% mensual
        commissionRate: 0.0040 // 0.40%
      },
      capital: {
        title: 'SIMULADOR DE <span class="em">CAPITAL DE TRABAJO</span>',
        subtitle: 'Financiamiento estructurado para proyectos y crecimiento empresarial.',
        label: 'Capital de Trabajo',
        montoLabel: 'Monto a solicitar <span class="star">*</span>',
        resSubtitle: 'Conoce las condiciones estimadas de tu línea de financiamiento.',
        rate: 0.0140, // 1.40% mensual
        commissionRate: 0.0075 // 0.75%
      }
    };

    simCards.forEach(function (card) {
      var currentProduct = 'factoring';
      var currentDays = 30;
      var currentCurrency = 'PEN';

      var titleEl = card.querySelector('.sim-title');
      var subtitleEl = card.querySelector('.sim-subtitle');
      var selectedLabelEl = card.querySelector('.sim-selected-label');
      var selectorBtn = card.querySelector('.sim-selector-btn');
      var dropdown = card.querySelector('.sim-dropdown');
      var dropOpts = card.querySelectorAll('.sim-drop-opt');

      var montoLabel = card.querySelector('.sim-monto-label');
      var amountInput = card.querySelector('.sim-amount-input');
      var currBtn = card.querySelector('.sim-curr-btn');
      var currDropdown = card.querySelector('.sim-curr-dropdown');
      var currOpts = card.querySelectorAll('.sim-curr-opt');
      var currText = card.querySelector('.sim-curr-text');
      var dayBtns = card.querySelectorAll('.sim-day-btn');

      var resSubtitle = card.querySelector('.sim-res-subtitle');
      var resRecibeHoy = card.querySelector('.res-recibe-hoy');
      var resTasa = card.querySelector('.res-tasa');
      var resComision = card.querySelector('.res-comision');
      var form = card.querySelector('.sim-form');

      function formatNumber(num) {
        return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }

      function parseNumber(str) {
        if (!str) return 0;
        var clean = str.toString().replace(/[^0-9.]/g, '');
        return parseFloat(clean) || 0;
      }

      function calculate() {
        var pData = products[currentProduct] || products.factoring;
        var rawAmount = parseNumber(amountInput ? amountInput.value : '');
        var currSym = currentCurrency === 'USD' ? 'US$' : 'S/';

        if (rawAmount <= 0) {
          if (resRecibeHoy) resRecibeHoy.textContent = currSym + ' 0';
          if (resTasa) resTasa.textContent = (pData.rate * 100).toFixed(2) + '%';
          if (resComision) resComision.textContent = currSym + ' 0';
          return;
        }

        var interest = rawAmount * (pData.rate * (currentDays / 30));
        var commission = Math.max(rawAmount * pData.commissionRate, currentCurrency === 'USD' ? 150 : 500);
        var neto = Math.max(0, rawAmount - interest - commission);

        if (resRecibeHoy) {
          resRecibeHoy.textContent = currSym + ' ' + formatNumber(neto);
        }
        if (resTasa) {
          resTasa.textContent = (pData.rate * 100).toFixed(2) + '%';
        }
        if (resComision) {
          resComision.textContent = currSym + ' ' + formatNumber(commission);
        }
      }

      function setProduct(type) {
        if (!products[type]) return;
        currentProduct = type;
        var p = products[type];

        if (titleEl) titleEl.innerHTML = p.title;
        if (subtitleEl) subtitleEl.textContent = p.subtitle;
        if (selectedLabelEl) selectedLabelEl.textContent = p.label;
        if (montoLabel) montoLabel.innerHTML = p.montoLabel;
        if (resSubtitle) resSubtitle.textContent = p.resSubtitle;

        dropOpts.forEach(function (opt) {
          opt.classList.toggle('active', opt.dataset.type === type);
        });

        if (dropdown) dropdown.hidden = true;
        if (selectorBtn) selectorBtn.setAttribute('aria-expanded', 'false');

        calculate();
      }

      // Dropdown toggle
      if (selectorBtn && dropdown) {
        selectorBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          var isOpen = !dropdown.hidden;
          dropdown.hidden = isOpen;
          selectorBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        });

        dropOpts.forEach(function (opt) {
          opt.addEventListener('click', function (e) {
            e.stopPropagation();
            setProduct(this.dataset.type);
          });
        });
      }

      // Currency dropdown toggle
      if (currBtn && currDropdown) {
        currBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          var isOpen = !currDropdown.hidden;
          currDropdown.hidden = isOpen;
          currBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        });

        currOpts.forEach(function (opt) {
          opt.addEventListener('click', function (e) {
            e.stopPropagation();
            currentCurrency = this.dataset.currency;
            if (currText) currText.textContent = currentCurrency === 'USD' ? 'US$' : 'S/';
            currOpts.forEach(function (o) {
              o.classList.toggle('active', o.dataset.currency === currentCurrency);
            });
            currDropdown.hidden = true;
            currBtn.setAttribute('aria-expanded', 'false');
            calculate();
          });
        });
      }

      // Days change
      dayBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          dayBtns.forEach(function (b) { b.classList.remove('active'); });
          this.classList.add('active');
          currentDays = parseInt(this.dataset.days, 10) || 30;
          calculate();
        });
      });

      // Amount input formatting & live calculate
      if (amountInput) {
        amountInput.addEventListener('input', function () {
          var raw = parseNumber(this.value);
          if (raw > 0) {
            var formatted = formatNumber(raw);
            this.value = formatted;
          }
          calculate();
        });
      }

      // Form submit
      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          if (amountInput && !amountInput.value) {
            amountInput.value = '100,000';
          }
          calculate();

          var submitBtn = form.querySelector('.btn-sim-submit');
          if (submitBtn) {
            var origText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>¡SIMULACIÓN ACTUALIZADA!</span> <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>';
            submitBtn.style.background = 'linear-gradient(100deg, #3cf0c0, #00e3a5)';
            setTimeout(function () {
              submitBtn.innerHTML = origText;
              submitBtn.style.background = '';
            }, 2400);
          }
        });
      }

      // Initial calculation
      calculate();
    });

    // Close any dropdown when clicking outside
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.sim-selector-wrap')) {
        document.querySelectorAll('.sim-dropdown').forEach(function (dd) {
          dd.hidden = true;
        });
        document.querySelectorAll('.sim-selector-btn').forEach(function (btn) {
          btn.setAttribute('aria-expanded', 'false');
        });
      }
      if (!e.target.closest('.sim-curr-select-wrap')) {
        document.querySelectorAll('.sim-curr-dropdown').forEach(function (dd) {
          dd.hidden = true;
        });
        document.querySelectorAll('.sim-curr-btn').forEach(function (btn) {
          btn.setAttribute('aria-expanded', 'false');
        });
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();


