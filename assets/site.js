document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-menu]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var heroIndex = 0;
  var heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === heroIndex);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    clearInterval(heroTimer);
    heroTimer = setInterval(function () {
      showHero(heroIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      showHero(i);
      startHero();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showHero(heroIndex - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showHero(heroIndex + 1);
      startHero();
    });
  }

  showHero(0);
  startHero();

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var root = panel.parentElement || document;
    var search = panel.querySelector('[data-filter-search]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var reset = panel.querySelector('[data-filter-reset]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
    var empty = root.querySelector('[data-empty-state]');

    function match(card) {
      var q = search ? search.value.trim().toLowerCase() : '';
      var wantedRegion = region ? region.value : '';
      var wantedType = type ? type.value : '';
      var wantedYear = year ? year.value : '';
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var okSearch = !q || text.indexOf(q) !== -1;
      var okRegion = !wantedRegion || card.getAttribute('data-region') === wantedRegion;
      var okType = !wantedType || card.getAttribute('data-type') === wantedType;
      var okYear = !wantedYear || card.getAttribute('data-year') === wantedYear;
      return okSearch && okRegion && okType && okYear;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = match(card);
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    [search, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (search) {
          search.value = '';
        }
        if (region) {
          region.value = '';
        }
        if (type) {
          type.value = '';
        }
        if (year) {
          year.value = '';
        }
        apply();
      });
    }
  });

  var video = document.querySelector('[data-player]');
  if (video) {
    var cover = document.querySelector('[data-play-cover]');
    var streamUrl = video.getAttribute('data-stream');
    var loaded = false;
    var hls = null;

    function loadStream() {
      if (loaded || !streamUrl) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function startPlayback() {
      loadStream();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && cover) {
        cover.classList.remove('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
});
