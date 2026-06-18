(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var yearTargets = document.querySelectorAll('[data-year]');
  yearTargets.forEach(function (target) {
    target.textContent = String(new Date().getFullYear());
  });

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    show(0);
    play();
  }

  var scopes = document.querySelectorAll('[data-filter-scope]');

  scopes.forEach(function (scope) {
    var root = scope.parentElement || document;
    var search = scope.querySelector('[data-page-search]');
    var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-select-filter]'));
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));

    if (!cards.length) {
      return;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(search ? search.value : '');
      var filters = {};

      selects.forEach(function (select) {
        filters[select.getAttribute('data-select-filter')] = normalize(select.value);
      });

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matched = !keyword || haystack.indexOf(keyword) !== -1;

        Object.keys(filters).forEach(function (key) {
          var value = filters[key];
          if (!value) {
            return;
          }

          if (normalize(card.getAttribute('data-' + key)) !== value) {
            matched = false;
          }
        });

        card.classList.toggle('is-hidden', !matched);
      });
    }

    if (search) {
      search.addEventListener('input', apply);
      var query = new URLSearchParams(window.location.search).get('q');
      if (query) {
        search.value = query;
      }
    }

    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });

    apply();
  });
})();
