(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
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
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupCardFilters() {
    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-card-search]");
      var year = scope.querySelector("[data-card-year]");
      var container = scope.parentElement;
      var cards = Array.prototype.slice.call(container.querySelectorAll("[data-card]"));
      var count = scope.querySelector("[data-card-count]");

      function applyFilter() {
        var keyword = normalize(input && input.value);
        var yearValue = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchesYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
          var show = matchesKeyword && matchesYear;
          card.classList.toggle("hidden-by-filter", !show);
          if (show) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible + " 部";
        }
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }
      if (year) {
        year.addEventListener("change", applyFilter);
      }
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "" +
      "<article class=\"movie-card\" data-card data-title=\"" + escapeHtml(movie.title) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-tags=\"" + escapeHtml((movie.tags || []).join(" ") + " " + movie.genre) + "\">" +
        "<a class=\"movie-poster\" href=\"movies/movie-" + movie.id + ".html\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">" +
          "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + " 封面\" loading=\"lazy\" onerror=\"this.classList.add('image-missing')\">" +
          "<span class=\"poster-shade\"></span>" +
          "<span class=\"play-badge\">▶</span>" +
          "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>" +
        "</a>" +
        "<div class=\"movie-info\">" +
          "<div class=\"movie-meta-row\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span><strong>" + escapeHtml(movie.score) + "</strong></div>" +
          "<h3><a href=\"movies/movie-" + movie.id + ".html\">" + escapeHtml(movie.title) + "</a></h3>" +
          "<p>" + escapeHtml(movie.oneLine || movie.summary || "") + "</p>" +
          "<div class=\"tag-list\">" + tags + "</div>" +
        "</div>" +
      "</article>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupGlobalSearch() {
    var root = document.querySelector("[data-global-search]");
    var results = document.querySelector("[data-global-results]");
    var count = document.querySelector("[data-global-count]");
    if (!root || !results || !window.MOVIES) {
      return;
    }

    var query = root.querySelector("[data-global-query]");
    var category = root.querySelector("[data-global-category]");
    var year = root.querySelector("[data-global-year]");

    function render() {
      var keyword = normalize(query && query.value);
      var categoryValue = normalize(category && category.value);
      var yearValue = normalize(year && year.value);
      var filtered = window.MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" "));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesCategory = !categoryValue || normalize(movie.categorySlug) === categoryValue;
        var matchesYear = !yearValue || normalize(movie.year) === yearValue;
        return matchesKeyword && matchesCategory && matchesYear;
      }).slice(0, 120);

      results.innerHTML = filtered.map(cardTemplate).join("");
      if (count) {
        count.textContent = "当前显示 " + filtered.length + " 条结果，点击卡片可进入独立详情页。";
      }
    }

    [query, category, year].forEach(function (node) {
      if (!node) {
        return;
      }
      node.addEventListener(node.tagName === "SELECT" ? "change" : "input", render);
    });
  }

  function setupPlayer() {
    var player = document.querySelector("[data-player]");
    if (!player) {
      return;
    }
    var video = player.querySelector("video");
    var playButton = player.querySelector("[data-play-button]");
    var status = player.querySelector("[data-player-status]");
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function initializeSource() {
      if (!video || initialized) {
        return;
      }
      initialized = true;
      var source = video.getAttribute("data-src");
      if (!source) {
        setStatus("播放源不存在");
        return;
      }
      setStatus("正在加载高清播放源...");

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("播放源已就绪");
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus("视频加载失败，请稍后重试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        setStatus("播放源已就绪");
      } else {
        setStatus("当前浏览器不支持 HLS 播放，请更换现代浏览器");
      }
    }

    function play() {
      initializeSource();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          setStatus("浏览器阻止了自动播放，请再次点击播放");
        });
      }
    }

    if (playButton) {
      playButton.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupCardFilters();
    setupGlobalSearch();
    setupPlayer();
  });
})();
