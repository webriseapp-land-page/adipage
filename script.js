/* ==========================================================================
   עדי בן מיכאל | Landing Page Script
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. Nav scroll effect (throttled with rAF)
     -------------------------------------------------------------------------- */
  const nav = document.querySelector('.nav');
  let navTicking = false;
  const updateNav = () => {
    if (window.scrollY > 30) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    navTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (!navTicking) {
      window.requestAnimationFrame(updateNav);
      navTicking = true;
    }
  }, { passive: true });
  updateNav();

  /* --------------------------------------------------------------------------
     2. Scroll reveal with IntersectionObserver
     -------------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  // Stagger index for grouped items
  const staggerGroups = [
    '.pain-grid .pain-card',
    '.testimonials .testimonial',
    '.transform-list .t-row',
    '.faq-list .faq-item'
  ];

  staggerGroups.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.style.setProperty('--i', i);
    });
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0,
      rootMargin: '0px 0px -12% 0px'
    });

    revealEls.forEach(el => {
      // Hero reveals are handled by CSS animation, skip observer
      if (!el.closest('.hero')) {
        io.observe(el);
      } else {
        el.classList.add('visible');
      }
    });
  } else {
    // Fallback
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* --------------------------------------------------------------------------
     3. FAQ: allow only one open at a time (smooth accordion)
     -------------------------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach(other => {
          if (other !== item && other.open) other.open = false;
        });
      }
    });
  });

  /* --------------------------------------------------------------------------
     4. Smooth scroll for anchor links (with offset for fixed nav)
     -------------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#' || href.length < 2) return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = nav.offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 10;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* --------------------------------------------------------------------------
     5. Subtle parallax on hero blobs (desktop only - mobile has no blobs)
     -------------------------------------------------------------------------- */
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isMobile && !prefersReducedMotion) {
    const blobs = document.querySelectorAll('.blob');
    let ticking = false;

    const parallax = () => {
      const scrolled = window.scrollY;
      if (scrolled > window.innerHeight) {
        ticking = false;
        return;
      }
      blobs.forEach((blob, i) => {
        const speed = i === 0 ? 0.25 : -0.15;
        blob.style.transform = `translate3d(0, ${scrolled * speed}px, 0)`;
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(parallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     6. Active nav link on scroll
     -------------------------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = [
    { id: 'top', el: document.querySelector('#top') },
    { id: 'story', el: document.querySelector('#story') },
    { id: 'results', el: document.querySelector('#results') },
    { id: 'method', el: document.querySelector('#method') },
    { id: 'contact', el: document.querySelector('#contact') }
  ].filter(s => s.el);

  const setActive = (targetHash) => {
    navLinks.forEach(link => {
      if (link.getAttribute('href') === targetHash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  let navScrollTicking = false;
  const updateActiveNav = () => {
    const scrollPos = window.scrollY + 120;
    let current = '#top';
    sections.forEach(section => {
      if (section.el.offsetTop <= scrollPos) {
        current = '#' + section.id;
      }
    });
    setActive(current);
    navScrollTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (!navScrollTicking) {
      window.requestAnimationFrame(updateActiveNav);
      navScrollTicking = true;
    }
  }, { passive: true });
  updateActiveNav();

  /* --------------------------------------------------------------------------
     7. Hero CTA: gentle scale on press
     -------------------------------------------------------------------------- */
  document.querySelectorAll('.hero-cta').forEach(btn => {
    btn.addEventListener('mousedown', () => btn.style.transform = 'scale(0.97)');
    btn.addEventListener('mouseup', () => btn.style.transform = '');
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });

  /* --------------------------------------------------------------------------
     8. Testimonials — Scattered Cards + Lightbox
     -------------------------------------------------------------------------- */
  (function () {
    var images = [
      { src: 'images/testimonial1.png', alt: 'המלצה 1' },
      { src: 'images/testimonial2.png', alt: 'המלצה 2' },
      { src: 'images/testimonial3.png', alt: 'המלצה 3' },
      { src: 'images/testimonial4.png', alt: 'המלצה 4' },
      { src: 'images/testimonial5.png', alt: 'המלצה 5' },
      { src: 'images/testimonial6.png', alt: 'המלצה 6' }
    ];

    var lb        = document.getElementById('testiLb');
    var lbImg     = document.getElementById('testiLbImg');
    var lbScroll  = document.getElementById('testiLbScroll');
    var lbOverlay = document.getElementById('testiLbOverlay');
    var lbClose   = document.getElementById('testiLbClose');
    var lbPrevBtn = document.getElementById('testiLbPrev');
    var lbNextBtn = document.getElementById('testiLbNext');
    var cards     = document.querySelectorAll('.testi-card');

    if (!lb || !cards.length) return;

    var current = 0;

    function setImage(index) {
      lbImg.src = images[index].src;
      lbImg.alt = images[index].alt;
      if (lbScroll) lbScroll.scrollTop = 0;
    }

    function openLb(index) {
      current = ((index % images.length) + images.length) % images.length;
      setImage(current);
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }

    function closeLb() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
      lbImg.src = '';
    }

    function lbNext() {
      current = (current + 1) % images.length;
      setImage(current);
    }

    function lbPrev() {
      current = (current - 1 + images.length) % images.length;
      setImage(current);
    }

    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        openLb(parseInt(card.getAttribute('data-index'), 10));
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLb(parseInt(card.getAttribute('data-index'), 10));
        }
      });
    });

    lbOverlay.addEventListener('click', closeLb);
    lbClose.addEventListener('click', closeLb);
    lbPrevBtn.addEventListener('click', lbPrev);
    lbNextBtn.addEventListener('click', lbNext);

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape')     closeLb();
      if (e.key === 'ArrowLeft')  lbNext();
      if (e.key === 'ArrowRight') lbPrev();
    });
  })();

  /* --------------------------------------------------------------------------
     9. Lead Form → WhatsApp
     -------------------------------------------------------------------------- */
  var leadForm = document.getElementById('leadForm');
  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name       = document.getElementById('fname').value.trim();
      var age        = document.getElementById('fage').value.trim();
      var source     = document.getElementById('fsource');
      var sourceText = source.options[source.selectedIndex].text;
      var phone      = document.getElementById('fphone').value.trim();
      var msg = encodeURIComponent(
        'היי עדי!\n' +
        'שם: ' + name + '\n' +
        'גיל: ' + age + '\n' +
        'הגעתי אלייך דרך: ' + sourceText + '\n' +
        'מספר טלפון: ' + phone + '\n\n' +
        'אשמח לשמוע פרטים על התהליך 🙏'
      );
      window.open('https://wa.me/972504030560?text=' + msg, '_blank');
    });
  }

})();
