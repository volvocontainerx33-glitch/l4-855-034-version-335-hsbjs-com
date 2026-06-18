(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.getElementById("mobileMenu");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupSearchBlocks() {
    var inputs = document.querySelectorAll(".filter-input");
    inputs.forEach(function (input) {
      var targetSelector = input.getAttribute("data-target") || ".searchable-card";
      var rootSelector = input.getAttribute("data-root");
      var root = rootSelector ? document.querySelector(rootSelector) : document;
      var empty = document.querySelector(input.getAttribute("data-empty") || "");
      var cards = Array.prototype.slice.call((root || document).querySelectorAll(targetSelector));
      function apply() {
        var q = normalize(input.value);
        var shown = 0;
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags")
          ].join(" "));
          var hit = !q || text.indexOf(q) !== -1;
          card.style.display = hit ? "" : "none";
          if (hit) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", shown === 0);
        }
      }
      input.addEventListener("input", apply);
      apply();
    });
  }

  function setupQuerySearch() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    var input = document.querySelector(".query-search");
    if (!input) {
      return;
    }
    input.value = q;
    input.dispatchEvent(new Event("input"));
  }

  ready(function () {
    setupMenu();
    setupSearchBlocks();
    setupQuerySearch();
  });

  window.mountPlayer = function (id, source) {
    var box = document.getElementById(id);
    if (!box) {
      return;
    }
    var video = box.querySelector("video");
    var button = box.querySelector(".play-overlay");
    var message = box.querySelector(".player-message");
    var hls = null;
    var attached = false;
    var requested = false;

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add("show");
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (requested) {
            play();
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              showMessage("暂时无法播放，请稍后再试");
              hls.destroy();
            }
          }
        });
        return;
      }
      video.src = source;
    }

    function play() {
      var action = video.play();
      if (action && typeof action.then === "function") {
        action.catch(function () {
          window.setTimeout(function () {
            video.play().catch(function () {
              showMessage("暂时无法播放，请稍后再试");
            });
          }, 260);
        });
      }
    }

    function start() {
      requested = true;
      attach();
      play();
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        start();
      });
    }

    video.addEventListener("play", function () {
      box.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        box.classList.remove("is-playing");
      }
    });

    video.addEventListener("ended", function () {
      box.classList.remove("is-playing");
    });

    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        start();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
