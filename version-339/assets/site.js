(function () {
    var mobileButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('open');
            mobileButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var currentSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    function startHeroTimer() {
        if (heroTimer || slides.length < 2) {
            return;
        }
        heroTimer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    function resetHeroTimer() {
        if (heroTimer) {
            window.clearInterval(heroTimer);
            heroTimer = null;
        }
        startHeroTimer();
    }

    document.querySelectorAll('[data-hero-next]').forEach(function (button) {
        button.addEventListener('click', function () {
            showSlide(currentSlide + 1);
            resetHeroTimer();
        });
    });

    document.querySelectorAll('[data-hero-prev]').forEach(function (button) {
        button.addEventListener('click', function () {
            showSlide(currentSlide - 1);
            resetHeroTimer();
        });
    });

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            resetHeroTimer();
        });
    });

    showSlide(0);
    startHeroTimer();

    function applyFilters(scope) {
        var queryInput = scope.querySelector('.movie-search-input');
        var typeFilter = scope.querySelector('.type-filter');
        var yearFilter = scope.querySelector('.year-filter');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var emptyHint = scope.querySelector('.empty-hint');

        if (!cards.length) {
            return;
        }

        function run() {
            var query = queryInput ? queryInput.value.trim().toLowerCase() : '';
            var type = typeFilter ? typeFilter.value : '';
            var year = yearFilter ? yearFilter.value : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-title') || '').toLowerCase();
                var cardType = card.getAttribute('data-type') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }
                if (type && cardType !== type) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (emptyHint) {
                emptyHint.style.display = visibleCount ? 'none' : 'block';
            }
        }

        [queryInput, typeFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', run);
                control.addEventListener('change', run);
            }
        });

        run();
    }

    document.querySelectorAll('.filter-scope').forEach(applyFilters);

    var player = document.querySelector('#movie-player');
    var playButton = document.querySelector('.player-start');
    var playerCover = document.querySelector('.player-cover');
    var playerStatus = document.querySelector('.player-status');
    var hlsInstance = null;

    function setPlayerStatus(text) {
        if (playerStatus) {
            playerStatus.textContent = text || '';
        }
    }

    function beginPlayback() {
        if (!player || !playButton) {
            return;
        }

        var stream = playButton.getAttribute('data-stream') || '';
        if (!stream) {
            setPlayerStatus('播放失败，请刷新重试');
            return;
        }

        setPlayerStatus('正在加载');
        if (playerCover) {
            playerCover.classList.add('is-playing');
        }

        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(player);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                player.play().catch(function () {
                    setPlayerStatus('点击视频继续播放');
                });
            });
            hlsInstance.on(window.Hls.Events.ERROR, function () {
                setPlayerStatus('播放失败，请刷新重试');
            });
        } else {
            player.src = stream;
            player.play().catch(function () {
                setPlayerStatus('点击视频继续播放');
            });
        }
    }

    if (playButton) {
        playButton.addEventListener('click', beginPlayback);
    }

    if (player) {
        player.addEventListener('click', function () {
            if (!player.getAttribute('src') && (!hlsInstance || !hlsInstance.url)) {
                beginPlayback();
            }
        });
        player.addEventListener('playing', function () {
            setPlayerStatus('');
            if (playerCover) {
                playerCover.classList.add('is-playing');
            }
        });
    }
}());
