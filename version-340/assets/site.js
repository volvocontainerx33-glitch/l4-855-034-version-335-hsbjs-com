(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      const isOpen = mobileNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.textContent = isOpen ? "×" : "☰";
    });
  }

  const carousel = document.querySelector("[data-carousel]");

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const prev = carousel.querySelector("[data-hero-prev]");
    const next = carousel.querySelector("[data-hero-next]");
    const dots = carousel.querySelector("[data-hero-dots]");
    let activeIndex = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains("active");
    }));
    let timer = null;

    function setActive(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === activeIndex);
      });
      if (dots) {
        Array.from(dots.children).forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === activeIndex);
        });
      }
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        setActive(activeIndex + 1);
      }, 5600);
    }

    if (dots) {
      slides.forEach(function (_, index) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", "切换推荐 " + (index + 1));
        dot.addEventListener("click", function () {
          setActive(index);
          restart();
        });
        dots.appendChild(dot);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        setActive(activeIndex - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        setActive(activeIndex + 1);
        restart();
      });
    }

    setActive(activeIndex);
    restart();
  }

  const searchInput = document.getElementById("movie-search");
  const typeFilter = document.getElementById("type-filter");
  const genreFilter = document.getElementById("genre-filter");
  const yearFilter = document.getElementById("year-filter");
  const movieList = document.querySelector("[data-movie-list]");
  const emptyState = document.querySelector("[data-empty-state]");

  if (movieList && (searchInput || typeFilter || genreFilter || yearFilter)) {
    const cards = Array.from(movieList.querySelectorAll(".movie-card"));

    function includesText(value, query) {
      return String(value || "").toLowerCase().includes(query);
    }

    function applyFilters() {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      const typeValue = typeFilter ? typeFilter.value : "";
      const genreValue = genreFilter ? genreFilter.value : "";
      const yearValue = yearFilter ? yearFilter.value : "";
      let visible = 0;

      cards.forEach(function (card) {
        const searchText = [
          card.dataset.title,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.type,
          card.dataset.category,
        ].join(" ").toLowerCase();
        const passQuery = !query || searchText.includes(query);
        const passType = !typeValue || includesText(card.dataset.type, typeValue);
        const passGenre = !genreValue || includesText(card.dataset.genre + " " + card.dataset.tags, genreValue);
        const passYear = !yearValue || includesText(card.dataset.year, yearValue);
        const show = passQuery && passType && passGenre && passYear;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("show", visible === 0);
      }
    }

    [searchInput, typeFilter, genreFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    applyFilters();
  }
})();
