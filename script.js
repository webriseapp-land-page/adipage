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
     8. Carousel + Lightbox
     -------------------------------------------------------------------------- */
  const track = document.getElementById('carouselTrack');
  if (track) {
    const slides = track.querySelectorAll('.carousel-slide');
    const dotsContainer = document.getElementById('carouselDots');
    let current = 0;
    let visibleCount = window.innerWidth <= 700 ? 1 : 3;
    let maxIndex = Math.max(0, slides.length - visibleCount);

    // build dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i <= maxIndex ? i : maxIndex));
      dotsContainer.appendChild(dot);
    });

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, maxIndex));
      const slideWidth = slides[0].offsetWidth + 20;
      track.style.transform = `translateX(${current * slideWidth}px)`;
      dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    document.querySelector('.carousel-prev')?.addEventListener('click', () => goTo(current - 1));
    document.querySelector('.carousel-next')?.addEventListener('click', () => goTo(current + 1));

    // Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    slides.forEach(slide => {
      slide.addEventListener('click', () => {
        const img = slide.querySelector('img');
        if (img) {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt;
          lightbox.classList.add('open');
          document.body.style.overflow = 'hidden';
        }
      });
    });
    document.getElementById('lightboxOverlay')?.addEventListener('click', closeLightbox);
    document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    window.addEventListener('resize', () => {
      visibleCount = window.innerWidth <= 700 ? 1 : 3;
      maxIndex = Math.max(0, slides.length - visibleCount);
      goTo(current);
    });
  }

})();

  /* --------------------------------------------------------------------------
     Lead Form → WhatsApp
     -------------------------------------------------------------------------- */
  const leadForm = document.getElementById('leadForm');
  if (leadForm) {
    leadForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name   = document.getElementById('fname').value.trim();
      const age    = document.getElementById('fage').value.trim();
      const source = document.getElementById('fsource');
      const sourceText = source.options[source.selectedIndex].text;
      const phone  = document.getElementById('fphone').value.trim();

      const msg = encodeURIComponent(
        `היי עדי!\n` +
        `שם: ${name}\n` +
        `גיל: ${age}\n` +
        `הגעתי אלייך דרך: ${sourceText}\n` +
        `מספר טלפון: ${phone}\n\n` +
        `אשמח לשמוע פרטים על התהליך 🙏`
      );
      window.open(`https://wa.me/972504030560?text=${msg}`, '_blank');
    });
  }

