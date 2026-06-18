(function () {
  var players = document.querySelectorAll('[data-player]');

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var start = box.querySelector('.player-start');
    var source = video ? video.getAttribute('data-src') : '';
    var hls = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      video.setAttribute('data-ready', '1');
    }

    function begin() {
      attachSource();
      box.classList.add('is-playing');
      var request = video.play();

      if (request && typeof request.catch === 'function') {
        request.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    }

    if (start) {
      start.addEventListener('click', begin);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });

    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        box.classList.remove('is-playing');
      }
    });

    video.addEventListener('ended', function () {
      box.classList.remove('is-playing');
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
