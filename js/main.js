/* ============================================================
   MAIN JAVASCRIPT
   Abu Bakar Portfolio
============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     DOM READY
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initHamburger();
    initScrollAnimations();
    initCounters();
    initTestimonialsCarousel();
    initContactForm();
    initBackToTop();
    initFooterYear();
    initActiveNavLinks();
  });

  /* ----------------------------------------------------------
     NAVBAR – scroll behaviour
  ---------------------------------------------------------- */
  function initNavbar() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     HAMBURGER MENU
  ---------------------------------------------------------- */
  function initHamburger() {
    var hamburger = document.getElementById('hamburger');
    var navLinks  = document.getElementById('navLinks');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ----------------------------------------------------------
     SCROLL ANIMATIONS (lightweight AOS-like)
  ---------------------------------------------------------- */
  function initScrollAnimations() {
    var elements = document.querySelectorAll('[data-aos]');
    if (!elements.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.getAttribute('data-aos-delay') || 0;
          setTimeout(function () {
            entry.target.classList.add('aos-animate');
          }, parseInt(delay, 10));
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ----------------------------------------------------------
     COUNTER ANIMATIONS
  ---------------------------------------------------------- */
  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  function animateCounter(el) {
    var target   = parseInt(el.getAttribute('data-count'), 10);
    var duration = 1800;
    var start    = performance.now();

    function step(now) {
      var elapsed  = now - start;
      var progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      var eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + '+';
      }
    }

    requestAnimationFrame(step);
  }

  /* ----------------------------------------------------------
     TESTIMONIALS CAROUSEL
  ---------------------------------------------------------- */
  function initTestimonialsCarousel() {
    var track    = document.getElementById('testimonialsTrack');
    var prevBtn  = document.getElementById('prevBtn');
    var nextBtn  = document.getElementById('nextBtn');
    var dotsWrap = document.getElementById('carouselDots');
    if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

    var cards        = Array.from(track.children);
    var currentIndex = 0;
    var autoTimer    = null;
    var cardsVisible = getCardsVisible();

    // Build dots
    var dots = [];
    var totalSlides = Math.ceil(cards.length / cardsVisible);
    for (var i = 0; i < totalSlides; i++) {
      var dot = document.createElement('span');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('data-index', i);
      dot.addEventListener('click', function () {
        goToSlide(parseInt(this.getAttribute('data-index'), 10));
      });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    }

    function getCardsVisible() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function getCardWidth() {
      if (!cards.length) return 0;
      var card = cards[0];
      return card.offsetWidth + 24; // 24 = gap
    }

    function goToSlide(index) {
      currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
      var offset = currentIndex * getCardWidth() * cardsVisible;
      track.style.transform = 'translateX(-' + offset + 'px)';
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === currentIndex);
      });
    }

    function nextSlide() {
      var next = (currentIndex + 1) % totalSlides;
      goToSlide(next);
    }

    function prevSlide() {
      var prev = (currentIndex - 1 + totalSlides) % totalSlides;
      goToSlide(prev);
    }

    nextBtn.addEventListener('click', function () {
      nextSlide();
      resetAutoPlay();
    });

    prevBtn.addEventListener('click', function () {
      prevSlide();
      resetAutoPlay();
    });

    // Touch / swipe support
    var touchStartX = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide(); else prevSlide();
        resetAutoPlay();
      }
    }, { passive: true });

    // Auto-play
    function startAutoPlay() {
      autoTimer = setInterval(nextSlide, 5000);
    }

    function resetAutoPlay() {
      clearInterval(autoTimer);
      startAutoPlay();
    }

    // Recalculate on resize – rebuild dots and totalSlides when cardsVisible changes
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var newVisible = getCardsVisible();
        if (newVisible !== cardsVisible) {
          cardsVisible = newVisible;
          totalSlides = Math.ceil(cards.length / cardsVisible);

          // Rebuild dots
          dotsWrap.innerHTML = '';
          dots = [];
          for (var j = 0; j < totalSlides; j++) {
            var d = document.createElement('span');
            d.className = 'carousel-dot' + (j === 0 ? ' active' : '');
            d.setAttribute('data-index', j);
            d.addEventListener('click', function () {
              goToSlide(parseInt(this.getAttribute('data-index'), 10));
            });
            dotsWrap.appendChild(d);
            dots.push(d);
          }
        }
        goToSlide(0);
      }, 200);
    }, { passive: true });

    startAutoPlay();
  }

  /* ----------------------------------------------------------
     CONTACT FORM
  ---------------------------------------------------------- */
  function initContactForm() {
    var form    = document.getElementById('contactForm');
    var success = document.getElementById('formSuccess');
    if (!form || !success) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var submitBtn = form.querySelector('[type="submit"]');
      var originalHTML = submitBtn.innerHTML;

      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      // Simulate async submission
      setTimeout(function () {
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled  = false;
        form.reset();
        success.classList.add('show');

        setTimeout(function () {
          success.classList.remove('show');
        }, 5000);
      }, 1500);
    });
  }

  /* ----------------------------------------------------------
     BACK TO TOP
  ---------------------------------------------------------- */
  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     FOOTER – CURRENT YEAR
  ---------------------------------------------------------- */
  function initFooterYear() {
    var el = document.getElementById('currentYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ----------------------------------------------------------
     ACTIVE NAV LINKS (Intersection Observer)
  ---------------------------------------------------------- */
  function initActiveNavLinks() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + entry.target.id) {
              link.classList.add('active');
            }
          });
        }
      });
    }, {
      threshold: 0.35
    });

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

})();
