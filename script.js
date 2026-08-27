/* ==========================================================================
   SKILVO — Interactions
   Loader, scroll progress, reveal-on-scroll, accordion, magnetic buttons,
   custom cursor, dark mode, mobile nav, laptop course slideshow + mouse
   tilt, and learning-journey scroll animation.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Loader ---- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('done'), 500);
  });
  setTimeout(() => loader.classList.add('done'), 2500);

  /* ---- Nav scroll state + progress bar ---- */
  const nav = document.getElementById('nav');
  const progress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');

  const onScroll = () => {
    const scrollTop = window.scrollY;
    nav.classList.toggle('scrolled', scrollTop > 30);
    backToTop.classList.toggle('show', scrollTop > 600);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progress.style.width = pct + '%';
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Reliable in-page smooth scroll for every [data-scroll] button ----
     These are real <button> elements (no href), so hovering them never
     shows a "navigate to another page" preview — clicking just scrolls
     smoothly to the matching section on this same page. */
  const navEl = document.getElementById('nav');
  const scrollToSection = (id) => {
    const target = id === 'top' ? document.body : document.getElementById(id);
    if (!target) return;
    const navHeight = navEl ? navEl.offsetHeight : 0;
    const top = id === 'top' ? 0 : target.getBoundingClientRect().top + window.pageYOffset - (navHeight + 16);
    window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    if (history.pushState) history.pushState(null, '', id === 'top' ? '#top' : '#' + id);
  };
  document.querySelectorAll('[data-scroll]').forEach(btn => {
    btn.addEventListener('click', () => scrollToSection(btn.dataset.scroll));
  });

  /* ---- Highlight active nav link while scrolling ---- */
  const sectionEls = Array.from(document.querySelectorAll('main section[id]'));
  const navLinkEls = Array.from(document.querySelectorAll('.nav-links .nav-link[data-scroll]'));
  if (sectionEls.length && navLinkEls.length && 'IntersectionObserver' in window) {
    const navSpy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinkEls.forEach(l => l.classList.toggle('active-link', l.dataset.scroll === id));
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sectionEls.forEach(s => navSpy.observe(s));
  }

  /* ---- Mobile nav toggle ---- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('button').forEach(a => a.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));

  /* ---- Reveal on scroll (fade-up + blur-to-clear) ---- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-up');
  if ('IntersectionObserver' in window) {
    document.body.classList.add('js-reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ---- Learning journey: animated connecting line fills in on scroll ---- */
  const journeyFill = document.getElementById('journeyFill');
  const journeyEl = document.getElementById('journey');
  if (journeyFill && journeyEl && 'IntersectionObserver' in window) {
    const journeyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          journeyFill.classList.add('in-view');
          journeyObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });
    journeyObserver.observe(journeyEl);
  }

  /* ---- Accordion (FAQ) ---- */
  document.querySelectorAll('.acc-item').forEach(item => {
    const head = item.querySelector('.acc-head');
    const body = item.querySelector('.acc-body');
    head.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.acc-item.open').forEach(other => {
        other.classList.remove('open');
        other.querySelector('.acc-body').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  /* ---- Magnetic buttons ---- */
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    btn.addEventListener('click', () => {
      btn.classList.remove('rippling');
      void btn.offsetWidth;
      btn.classList.add('rippling');
      setTimeout(() => btn.classList.remove('rippling'), 500);
    });
  });

  /* ---- Custom cursor (desktop only) ---- */
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let rx = 0, ry = 0, dx = 0, dy = 0;
    document.addEventListener('mousemove', (e) => {
      dx = e.clientX; dy = e.clientY;
      dot.style.left = dx + 'px'; dot.style.top = dy + 'px';
    });
    const animateRing = () => {
      rx += (dx - rx) * 0.18;
      ry += (dy - ry) * 0.18;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(animateRing);
    };
    animateRing();
    document.querySelectorAll('a, button, .course-card, .compare-card, .contact-card').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('active'));
      el.addEventListener('mouseleave', () => ring.classList.remove('active'));
    });
  }

  /* ---- Theme toggle ---- */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const applyTheme = (mode) => root.setAttribute('data-theme', mode);
  let theme = 'light';
  applyTheme(theme);
  themeToggle.addEventListener('click', () => {
    theme = theme === 'light' ? 'dark' : 'light';
    applyTheme(theme);
  });

  /* ---- Hero laptop: course slideshow ---- */
  const slides = document.querySelectorAll('.slide');
  if (slides.length) {
    let slideIndex = 0;
    setInterval(() => {
      slides[slideIndex].classList.remove('active');
      slideIndex = (slideIndex + 1) % slides.length;
      slides[slideIndex].classList.add('active');
    }, 5000);
  }

  /* ---- Hero laptop: subtle 3D tilt on mouse move ---- */
  const laptop = document.getElementById('laptop');
  const hero = document.getElementById('hero');
  if (laptop && hero && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      laptop.style.transform = `rotateX(${6 - py * 12}deg) rotateY(${-8 + px * 16}deg)`;
    });
    hero.addEventListener('mouseleave', () => {
      laptop.style.transform = 'rotateX(6deg) rotateY(-8deg)';
    });
  }

  /* ---- Certificate: gentle 3D tilt that responds to mouse position ---- */
  const certFrame = document.getElementById('certFrame');
  if (certFrame && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    certFrame.addEventListener('mousemove', (e) => {
      const rect = certFrame.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      certFrame.style.transform = `rotateX(${-py * 14}deg) rotateY(${px * 16}deg) scale(1.02)`;
    });
    certFrame.addEventListener('mouseleave', () => {
      certFrame.style.transform = '';
    });
  }

  /* ---- Generalized 3D tilt for cards ---- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const enableTilt = (selector, max) => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.transformStyle = 'preserve-3d';
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const px = (e.clientX - rect.left) / rect.width - 0.5;
          const py = (e.clientY - rect.top) / rect.height - 0.5;
          el.style.transform = `perspective(700px) rotateX(${-py * max}deg) rotateY(${px * max}deg) translateY(-4px)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
      });
    };
    enableTilt('.course-card', 6);
    enableTilt('.value-card', 5);
    enableTilt('.compare-card', 4);
  }

});
