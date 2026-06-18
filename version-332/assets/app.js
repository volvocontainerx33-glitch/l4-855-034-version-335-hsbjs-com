(function () {
  var hlsPromise = null;

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function openMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        show(position);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function initSearch() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-search-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-search-box]');
      var targetSelector = input ? input.getAttribute('data-search-box') : '';
      var target = targetSelector ? document.querySelector(targetSelector) : scope;
      var container = target ? target.parentElement : scope.parentElement;
      var area = container ? container.querySelector('[data-card-area]') : null;
      var cards = area ? Array.prototype.slice.call(area.querySelectorAll('.movie-card')) : [];
      var regionFilter = scope.querySelector('[data-filter="region"]');
      var yearFilter = scope.querySelector('[data-filter="year"]');
      if (!input || !cards.length) {
        return;
      }
      function yearMatches(cardYear, selected) {
        if (!selected || selected === 'all') {
          return true;
        }
        if (selected === 'older') {
          var value = parseInt(cardYear, 10);
          return !Number.isNaN(value) && value < 2020;
        }
        return cardYear === selected;
      }
      function apply() {
        var query = normalize(input.value);
        var selectedRegion = regionFilter ? regionFilter.value : 'all';
        var selectedYear = yearFilter ? yearFilter.value : 'all';
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
          ].join(' '));
          var cardRegion = card.getAttribute('data-region') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var ok = (!query || haystack.indexOf(query) !== -1) &&
            (selectedRegion === 'all' || cardRegion === selectedRegion) &&
            yearMatches(cardYear, selectedYear);
          card.classList.toggle('is-hidden', !ok);
        });
      }
      input.addEventListener('input', apply);
      if (regionFilter) {
        regionFilter.addEventListener('change', apply);
      }
      if (yearFilter) {
        yearFilter.addEventListener('change', apply);
      }
    });
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error('HLS unavailable'));
        }
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  function initPlayer() {
    var video = document.querySelector('[data-video-player]');
    if (!video) {
      return;
    }
    var sourceUrl = video.getAttribute('data-hls');
    var overlay = document.querySelector('[data-player-overlay]');
    var playButton = document.querySelector('[data-play-button]');
    var status = document.querySelector('[data-player-status]');
    var ready = false;
    var instance = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }

    function prepare() {
      if (ready) {
        return Promise.resolve();
      }
      if (!sourceUrl) {
        setStatus('视频暂时无法播放');
        return Promise.reject(new Error('empty url'));
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        ready = true;
        return Promise.resolve();
      }
      return loadHls().then(function (Hls) {
        if (Hls.isSupported()) {
          instance = new Hls({ enableWorker: true, lowLatencyMode: true });
          instance.loadSource(sourceUrl);
          instance.attachMedia(video);
          instance.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('视频加载失败，请稍后再试');
            }
          });
          ready = true;
          return;
        }
        video.src = sourceUrl;
        ready = true;
      });
    }

    function play() {
      setStatus('正在加载影片');
      prepare().then(function () {
        var request = video.play();
        if (request && typeof request.then === 'function') {
          request.then(function () {
            setStatus('');
            if (overlay) {
              overlay.classList.add('is-hidden');
            }
          }).catch(function () {
            setStatus('点击播放按钮开始观看');
          });
        }
      }).catch(function () {
        setStatus('视频加载失败，请稍后再试');
      });
    }

    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      setStatus('');
    });
    video.addEventListener('pause', function () {
      if (overlay && !video.ended) {
        overlay.classList.remove('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (instance) {
        instance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    openMobileMenu();
    initHero();
    initSearch();
    initPlayer();
  });
})();
