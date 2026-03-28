/* ============================================================
   MAIN JAVASCRIPT — Abu Bakar 3D Portfolio
   Features:
     • Three.js 3D particle network hero background
     • 3D card tilt effect (vanilla JS)
     • Typing animation for hero title
     • Scroll-driven animations (custom AOS)
     • Skill level bar animations
     • Counter animations
     • Testimonials carousel
     • Contact form
     • Back to top
     • Active nav link tracking
============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initThreeHero();
    initNavbar();
    initHamburger();
    initTypingAnimation();
    initScrollAnimations();
    initSkillBars();
    initCounters();
    initTiltCards();
    initTestimonialsCarousel();
    initContactForm();
    initBackToTop();
    initFooterYear();
    initActiveNavLinks();
  });

  /* ----------------------------------------------------------
     THREE.JS HERO BACKGROUND
  ---------------------------------------------------------- */
  function initThreeHero() {
    var canvas = document.getElementById('heroCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    var scene    = new THREE.Scene();
    var W        = window.innerWidth;
    var H        = window.innerHeight;
    var camera   = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.z = 55;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    /* ── Particle System ── */
    var PARTICLE_COUNT = 220;
    var positions = new Float32Array(PARTICLE_COUNT * 3);
    var velocities = [];
    var particleData = [];

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      velocities.push({
        x: (Math.random() - 0.5) * 0.04,
        y: (Math.random() - 0.5) * 0.04,
        z: (Math.random() - 0.5) * 0.02
      });
      particleData.push({ x: positions[i*3], y: positions[i*3+1], z: positions[i*3+2] });
    }

    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    var pMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.7,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    var particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    /* ── Connection Lines ── */
    var lineMat = new THREE.LineBasicMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    var linesGroup = new THREE.Group();
    scene.add(linesGroup);

    /* ── Floating Wireframe Shapes ── */
    var shapeMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.15
    });

    // Icosahedron
    var icoGeo  = new THREE.IcosahedronGeometry(8, 0);
    var icoMesh = new THREE.Mesh(icoGeo, shapeMat);
    icoMesh.position.set(25, 10, -20);
    scene.add(icoMesh);

    // Torus
    var torusGeo  = new THREE.TorusGeometry(5, 1.5, 8, 20);
    var torusMat  = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    var torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.position.set(-30, -10, -15);
    scene.add(torusMesh);

    // Octahedron
    var octaGeo  = new THREE.OctahedronGeometry(5, 0);
    var octaMat  = new THREE.MeshBasicMaterial({
      color: 0x10fda1,
      wireframe: true,
      transparent: true,
      opacity: 0.13
    });
    var octaMesh = new THREE.Mesh(octaGeo, octaMat);
    octaMesh.position.set(-20, 20, -10);
    scene.add(octaMesh);

    /* ── Mouse parallax ── */
    var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener('mousemove', function (e) {
      mouse.tx = (e.clientX / window.innerWidth  - 0.5) * 0.4;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 0.3;
    }, { passive: true });

    /* ── Resize ── */
    window.addEventListener('resize', function () {
      W = window.innerWidth;
      H = window.innerHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    }, { passive: true });

    /* ── Animation Loop ── */
    var clock    = new THREE.Clock();
    var frameId  = null;
    var maxDist  = 25;

    function buildLines() {
      while (linesGroup.children.length) {
        linesGroup.remove(linesGroup.children[0]);
      }
      var pos = pGeo.attributes.position.array;
      for (var a = 0; a < PARTICLE_COUNT; a++) {
        for (var b = a + 1; b < PARTICLE_COUNT; b++) {
          var dx = pos[a*3]   - pos[b*3];
          var dy = pos[a*3+1] - pos[b*3+1];
          var dz = pos[a*3+2] - pos[b*3+2];
          var dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
          if (dist < maxDist) {
            var lGeo = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(pos[a*3], pos[a*3+1], pos[a*3+2]),
              new THREE.Vector3(pos[b*3], pos[b*3+1], pos[b*3+2])
            ]);
            var opacity = (1 - dist / maxDist) * 0.3;
            var m = new THREE.LineBasicMaterial({
              color: 0x7c3aed,
              transparent: true,
              opacity: opacity,
              blending: THREE.AdditiveBlending,
              depthWrite: false
            });
            linesGroup.add(new THREE.Line(lGeo, m));
          }
        }
      }
    }

    var lineUpdateCounter = 0;

    function animate() {
      frameId = requestAnimationFrame(animate);
      var elapsed = clock.getElapsedTime();
      var pos = pGeo.attributes.position.array;

      // Update particle positions
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        pos[i*3]     += velocities[i].x;
        pos[i*3 + 1] += velocities[i].y;
        pos[i*3 + 2] += velocities[i].z;

        // Bounce off bounding box
        if (Math.abs(pos[i*3])     > 60) velocities[i].x *= -1;
        if (Math.abs(pos[i*3 + 1]) > 40) velocities[i].y *= -1;
        if (Math.abs(pos[i*3 + 2]) > 30) velocities[i].z *= -1;
      }
      pGeo.attributes.position.needsUpdate = true;

      // Rebuild lines every 3 frames for performance
      lineUpdateCounter++;
      if (lineUpdateCounter % 3 === 0) {
        buildLines();
      }

      // Rotate geometric shapes
      icoMesh.rotation.x = elapsed * 0.25;
      icoMesh.rotation.y = elapsed * 0.3;
      torusMesh.rotation.x = elapsed * 0.3;
      torusMesh.rotation.z = elapsed * 0.2;
      octaMesh.rotation.x = elapsed * 0.2;
      octaMesh.rotation.y = elapsed * 0.35;

      // Mouse parallax — smooth lerp
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      camera.position.x = mouse.x * 8;
      camera.position.y = -mouse.y * 5;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }

    animate();

    // Pause / resume animation when hero scrolls out of / back into view
    var heroEl = document.getElementById('hero');
    var isAnimating = true;
    if (heroEl && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) {
          if (isAnimating) {
            cancelAnimationFrame(frameId);
            isAnimating = false;
          }
        } else {
          if (!isAnimating) {
            isAnimating = true;
            animate();
          }
        }
      }, { threshold: 0 }).observe(heroEl);
    }
  }

  /* ----------------------------------------------------------
     NAVBAR – scroll behaviour
  ---------------------------------------------------------- */
  function initNavbar() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', function () {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
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
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

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
     TYPING ANIMATION
  ---------------------------------------------------------- */
  function initTypingAnimation() {
    var el = document.getElementById('typingTarget');
    if (!el) return;

    var words = ['Products.', 'Apps.', 'Experiences.', 'Solutions.'];
    var wordIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var typingSpeed = 120;

    function type() {
      var currentWord = words[wordIndex];

      if (isDeleting) {
        charIndex--;
        el.textContent = currentWord.substring(0, charIndex);
        typingSpeed = 70;
      } else {
        el.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 120;
      }

      if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        typingSpeed = 1800; // pause before deleting
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typingSpeed = 400;
      }

      setTimeout(type, typingSpeed);
    }

    // Delay start so hero is visible
    setTimeout(type, 1200);
  }

  /* ----------------------------------------------------------
     SCROLL ANIMATIONS
  ---------------------------------------------------------- */
  function initScrollAnimations() {
    var elements = document.querySelectorAll('[data-aos]');
    if (!elements.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = parseInt(entry.target.getAttribute('data-aos-delay') || '0', 10);
          setTimeout(function () {
            entry.target.classList.add('aos-animate');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(function (el) { observer.observe(el); });
  }

  /* ----------------------------------------------------------
     SKILL LEVEL BARS
  ---------------------------------------------------------- */
  function initSkillBars() {
    var bars = document.querySelectorAll('.level-bar[data-level]');
    if (!bars.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var level = entry.target.getAttribute('data-level') || '0';
          entry.target.style.width = level + '%';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    bars.forEach(function (bar) { observer.observe(bar); });
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

    counters.forEach(function (c) { observer.observe(c); });
  }

  function animateCounter(el) {
    var target   = parseInt(el.getAttribute('data-count'), 10);
    var duration = 1800;
    var start    = performance.now();

    function step(now) {
      var elapsed  = now - start;
      var progress = Math.min(elapsed / duration, 1);
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
     3D TILT EFFECT
  ---------------------------------------------------------- */
  function initTiltCards() {
    var cards = document.querySelectorAll('.tilt-card[data-tilt]');
    if (!cards.length) return;

    var isTouch = ('ontouchstart' in window);
    if (isTouch) return; // skip on touch devices

    cards.forEach(function (card) {
      var rect, cx, cy;
      var STRENGTH = 12; // degrees

      card.addEventListener('mousemove', function (e) {
        rect = card.getBoundingClientRect();
        cx = rect.left + rect.width  / 2;
        cy = rect.top  + rect.height / 2;

        var dx = e.clientX - cx;
        var dy = e.clientY - cy;
        var rx = (dy / (rect.height / 2)) * STRENGTH;
        var ry = -(dx / (rect.width  / 2)) * STRENGTH;

        card.style.transform =
          'perspective(1000px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(4px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        card.style.transition = 'transform 0.4s ease';
        setTimeout(function () { card.style.transition = ''; }, 400);
      });
    });
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
    var totalSlides  = Math.ceil(cards.length / cardsVisible);
    var dots         = [];

    buildDots();

    function getCardsVisible() {
      if (window.innerWidth <= 768)  return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function getCardWidth() {
      if (!cards.length) return 0;
      return cards[0].offsetWidth + 24;
    }

    function buildDots() {
      dotsWrap.innerHTML = '';
      dots = [];
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
    }

    function goToSlide(index) {
      currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
      var offset = currentIndex * getCardWidth() * cardsVisible;
      track.style.transform = 'translateX(-' + offset + 'px)';
      dots.forEach(function (d, i) { d.classList.toggle('active', i === currentIndex); });
    }

    function nextSlide() { goToSlide((currentIndex + 1) % totalSlides); }
    function prevSlide() { goToSlide((currentIndex - 1 + totalSlides) % totalSlides); }

    nextBtn.addEventListener('click', function () { nextSlide(); resetAuto(); });
    prevBtn.addEventListener('click', function () { prevSlide(); resetAuto(); });

    // Touch / swipe
    var startX = 0;
    track.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide(); else prevSlide();
        resetAuto();
      }
    }, { passive: true });

    function startAuto() { autoTimer = setInterval(nextSlide, 5000); }
    function resetAuto()  { clearInterval(autoTimer); startAuto(); }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var nv = getCardsVisible();
        if (nv !== cardsVisible) {
          cardsVisible = nv;
          totalSlides  = Math.ceil(cards.length / cardsVisible);
          buildDots();
        }
        goToSlide(0);
      }, 200);
    }, { passive: true });

    startAuto();
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
      var btn = form.querySelector('[type="submit"]');
      var original = btn.innerHTML;

      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

      setTimeout(function () {
        btn.innerHTML  = original;
        btn.disabled   = false;
        form.reset();
        success.classList.add('show');
        setTimeout(function () { success.classList.remove('show'); }, 5000);
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
     FOOTER YEAR
  ---------------------------------------------------------- */
  function initFooterYear() {
    var el = document.getElementById('currentYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ----------------------------------------------------------
     ACTIVE NAV LINKS
  ---------------------------------------------------------- */
  function initActiveNavLinks() {
    var sections = document.querySelectorAll('section[id]');
    var links    = document.querySelectorAll('.nav-link');
    if (!sections.length || !links.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + entry.target.id) {
              link.classList.add('active');
            }
          });
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(function (s) { observer.observe(s); });
  }

})();
