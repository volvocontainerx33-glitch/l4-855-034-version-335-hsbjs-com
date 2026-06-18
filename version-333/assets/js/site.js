(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10));
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function initFilters() {
    var scope = document.querySelector('[data-filter-scope]');
    var list = document.querySelector('[data-card-list]');
    if (!scope || !list) {
      return;
    }
    var input = scope.querySelector('[data-search-input]');
    var year = scope.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function matchYear(card, value) {
      if (value === 'all') {
        return true;
      }
      var raw = card.getAttribute('data-year') || '';
      var num = parseInt((raw.match(/\d{4}/) || ['0'])[0], 10);
      if (value === 'older') {
        return num > 0 && num <= 2020;
      }
      return raw.indexOf(value) !== -1;
    }

    function update() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : 'all';
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var visible = haystack.indexOf(query) !== -1 && matchYear(card, yearValue);
        card.classList.toggle('is-hidden', !visible);
      });
    }

    if (input) {
      input.addEventListener('input', update);
    }
    if (year) {
      year.addEventListener('change', update);
    }
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    script.onload = callback;
    document.head.appendChild(script);
  }

  window.setupMoviePlayer = function (streamUrl, posterUrl) {
    var video = document.getElementById('movie-player');
    var overlay = document.querySelector('[data-player-overlay]');
    if (!video) {
      return;
    }
    if (posterUrl) {
      video.setAttribute('poster', posterUrl);
    }

    function attachAndPlay() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = streamUrl;
        }
        video.play().catch(function () {});
        return;
      }
      loadHls(function () {
        if (window.Hls && window.Hls.isSupported()) {
          if (!video.__hlsInstance) {
            var hls = new window.Hls({
              maxBufferLength: 30,
              enableWorker: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video.__hlsInstance = hls;
          }
          video.play().catch(function () {});
        } else {
          if (!video.src) {
            video.src = streamUrl;
          }
          video.play().catch(function () {});
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', attachAndPlay);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        attachAndPlay();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
