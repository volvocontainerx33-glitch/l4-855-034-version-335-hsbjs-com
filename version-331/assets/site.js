(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
      var prev = carousel.querySelector("[data-carousel-prev]");
      var next = carousel.querySelector("[data-carousel-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });

        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      function move(step) {
        show(index + step);
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          move(1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          show(i);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          move(-1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          move(1);
          start();
        });
      }

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
      var input = form.querySelector("[data-filter-input]");
      var scopeName = form.getAttribute("data-filter-form");
      var scope = scopeName ? document.querySelector('[data-filter-scope="' + scopeName + '"]') : document;
      var empty = scope ? scope.querySelector("[data-empty-state]") : null;

      function applyFilter() {
        if (!scope || !input) {
          return;
        }

        var value = input.value.trim().toLowerCase();
        var items = Array.prototype.slice.call(scope.querySelectorAll(".filter-item"));
        var visible = 0;

        items.forEach(function (item) {
          var text = (item.getAttribute("data-search") || item.textContent || "").toLowerCase();
          var matched = !value || text.indexOf(value) !== -1;
          item.classList.toggle("hidden-by-filter", !matched);

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter();
      });
    });

    document.querySelectorAll("[data-player]").forEach(function (box) {
      var video = box.querySelector("video");
      var cover = box.querySelector(".player-cover");
      var stream = box.getAttribute("data-stream");
      var loaded = false;
      var hls = null;

      function attach() {
        if (!video || !stream || loaded) {
          return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return;
        }

        video.src = stream;
      }

      function play() {
        if (!video) {
          return;
        }

        attach();
        box.classList.add("is-playing");
        video.setAttribute("controls", "controls");
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!loaded || video.paused) {
            play();
          }
        });
      }
    });
  });
})();
