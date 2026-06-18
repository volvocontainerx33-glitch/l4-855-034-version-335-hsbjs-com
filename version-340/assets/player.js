(function () {
  const data = document.getElementById("player-json");
  const video = document.getElementById("movie-player");
  const overlay = document.getElementById("play-overlay");

  if (!data || !video || !overlay) {
    return;
  }

  let source = "";
  let ready = false;
  let requested = false;
  let hls = null;

  try {
    source = JSON.parse(data.textContent || "{}").source || "";
  } catch (error) {
    source = "";
  }

  function playVideo() {
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function prepare() {
    if (ready || !source) {
      return;
    }

    ready = true;
    video.setAttribute("controls", "controls");

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      if (requested) {
        playVideo();
      }
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (requested) {
          playVideo();
        }
      });
      return;
    }

    video.src = source;
  }

  function start() {
    requested = true;
    overlay.classList.add("is-hidden");
    prepare();
    if (video.readyState > 0 || video.src) {
      playVideo();
    }
  }

  overlay.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (!ready) {
      start();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
