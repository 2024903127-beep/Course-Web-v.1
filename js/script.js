/* ============================================================
   ArogyaX — Vanilla JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll effect ── */
  const navbar = document.querySelector('.navbar');
  const handleScroll = () => {
    if (window.scrollY > 20) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  /* ── Mobile menu ── */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');

  hamburger?.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu?.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (hamburger && mobileMenu && !navbar.contains(e.target)) {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  /* ── Active nav link ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a, .nav-mobile a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── Scroll-triggered fade animations ── */
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger sibling items
        const siblings = entry.target.parentElement?.querySelectorAll('.fade-up');
        let delay = 0;
        if (siblings) {
          siblings.forEach((el, idx) => {
            if (el === entry.target) delay = idx * 80;
          });
        }
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  /* ── Contact Form ── */
  const form = document.getElementById('contact-form');
  const formWrap = document.getElementById('form-wrap');
  const successMsg = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      // Clear previous errors
      form.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));

      const fields = [
        { id: 'name',     msg: 'Please enter your full name.' },
        { id: 'org',      msg: 'Please enter your organization name.' },
        { id: 'email',    msg: 'Please enter a valid email address.', validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
        { id: 'phone',    msg: 'Please enter a valid phone number.', validate: v => /^\+?[\d\s\-]{7,15}$/.test(v) },
        { id: 'org-type', msg: 'Please select your organization type.' },
        { id: 'message',  msg: 'Please write a brief message.' }
      ];

      fields.forEach(f => {
        const el = document.getElementById(f.id);
        if (!el) return;
        const group = el.closest('.form-group');
        const msgEl = group?.querySelector('.error-msg');
        const val = el.value.trim();

        let fieldValid = val.length > 0;
        if (fieldValid && f.validate) fieldValid = f.validate(val);

        if (!fieldValid) {
          valid = false;
          group?.classList.add('has-error');
          if (msgEl) msgEl.textContent = f.msg;
        }
      });

      if (!valid) return;

      // Simulate submission
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        if (formWrap) formWrap.style.display = 'none';
        if (successMsg) successMsg.classList.add('visible');
      }, 1200);
    });
  }

  /* ── Smooth anchor scrolling ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu if open
        hamburger?.classList.remove('open');
        mobileMenu?.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  /* ── Number counter animation ── */
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute('data-count'));
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 1800;
      const start = performance.now();

      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));

});
