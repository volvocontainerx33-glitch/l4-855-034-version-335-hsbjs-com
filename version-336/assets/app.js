(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');

    if (!panel) {
      return;
    }

    var searchInput = panel.querySelector('[data-search-input]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var categorySelect = panel.querySelector('[data-filter-category]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-empty-state]');

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && searchInput) {
      searchInput.value = query;
    }

    function matches(card) {
      var searchValue = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var typeValue = typeSelect ? typeSelect.value : '';
      var yearValue = yearSelect ? yearSelect.value : '';
      var categoryValue = categorySelect ? categorySelect.value : '';
      var haystack = [
        card.dataset.title,
        card.dataset.tags,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.category
      ].join(' ').toLowerCase();

      if (searchValue && haystack.indexOf(searchValue) === -1) {
        return false;
      }

      if (typeValue && card.dataset.type !== typeValue) {
        return false;
      }

      if (yearValue && card.dataset.year !== yearValue) {
        return false;
      }

      if (categoryValue && card.dataset.category !== categoryValue) {
        return false;
      }

      return true;
    }

    function apply() {
      var visible = 0;

      cards.forEach(function (card) {
        var show = matches(card);
        card.style.display = show ? '' : 'none';

        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('visible', visible === 0);
      }
    }

    [searchInput, typeSelect, yearSelect, categorySelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });

    apply();
  }

  function initMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var started = false;
    var hls = null;

    if (!video || !overlay || !options.source) {
      return;
    }

    function attachSource() {
      if (started) {
        return;
      }

      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = options.source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(options.source);
        hls.attachMedia(video);
        return;
      }

      video.src = options.source;
    }

    function play() {
      attachSource();
      overlay.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');

      var request = video.play();

      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (!started) {
        play();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupFilters();
  });
})();
