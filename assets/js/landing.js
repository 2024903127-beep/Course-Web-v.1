// Landing Page JavaScript

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initResponsiveHandling();
  initSmoothScrolling();
  initScrollAnimations();
  initMobileMenu();
  initHeroAnimations();
  initStatsCounter();
  initTypingEffect();
  initButtonInteractions();
  initScrollIndicator();
  initNavbarScroll();
  initActiveNavLinks();
});

// Smooth scrolling for navigation links
function initSmoothScrolling() {
  const navLinks = document.querySelectorAll('a[href^="#"]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar

        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Scroll-based animations
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animateElements = document.querySelectorAll('.feature-card, .course-card, .testimonial-card');
  animateElements.forEach(element => {
    observer.observe(element);
  });
}

// Mobile menu toggle with improved functionality
function initMobileMenu() {
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const body = document.body;

  if (mobileToggle && navMenu) {
    // Toggle menu
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('mobile-active');
      mobileToggle.classList.toggle('active');
      body.classList.toggle('mobile-menu-open');
    });

    // Close mobile menu when clicking on a link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-active');
        mobileToggle.classList.remove('active');
        body.classList.remove('mobile-menu-open');
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('mobile-active');
        mobileToggle.classList.remove('active');
        body.classList.remove('mobile-menu-open');
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('mobile-active')) {
        navMenu.classList.remove('mobile-active');
        mobileToggle.classList.remove('active');
        body.classList.remove('mobile-menu-open');
      }
    });

    // Prevent scroll when menu is open
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isOpen = body.classList.contains('mobile-menu-open');
          body.style.overflow = isOpen ? 'hidden' : '';
        }
      });
    });
    observer.observe(body, { attributes: true, attributeFilter: ['class'] });
  }
}

// Responsive viewport handling
function initResponsiveHandling() {
  // Handle orientation changes
  window.addEventListener('orientationchange', () => {
    // Small delay to ensure viewport has updated
    setTimeout(() => {
      window.location.reload();
    }, 100);
  });

  // Handle window resize for better responsive behavior
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Force reflow for better responsive layout
      document.body.style.display = 'none';
      document.body.offsetHeight; // Trigger reflow
      document.body.style.display = '';
    }, 250);
  });

  // Touch device optimizations
  if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');

    // Improve tap targets on touch devices
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
      btn.style.minHeight = '44px'; // iOS Human Interface Guidelines
      btn.style.minWidth = '44px';
    });
  }

  // Detect and handle different device types
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTablet = /iPad|Android(?=.*\bMobile\b)|Tablet|PlayBook/i.test(navigator.userAgent);

  if (isMobile) {
    document.body.classList.add('mobile-device');
  } else if (isTablet) {
    document.body.classList.add('tablet-device');
  } else {
    document.body.classList.add('desktop-device');
  }
}

// Hero section animations
function initHeroAnimations() {
  // Add entrance animations to hero elements
  const heroElements = [
    '.hero-badge',
    '.hero-title',
    '.hero-subtitle',
    '.hero-stats',
    '.hero-actions',
    '.hero-trust'
  ];

  heroElements.forEach((selector, index) => {
    const element = document.querySelector(selector);
    if (element) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      element.style.transitionDelay = `${index * 0.1}s`;

      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 100);
    }
  });

  // Floating cards animation
  const floatingCards = document.querySelectorAll('.floating-card');
  floatingCards.forEach((card, index) => {
    card.style.animation = `float 6s ease-in-out infinite`;
    card.style.animationDelay = `${index * 2}s`;
  });
}

// Animated statistics counter with data-target support
function initStatsCounter() {
  const stats = document.querySelectorAll('.stat-number[data-target]');

  const animateCounter = (element) => {
    const target = parseInt(element.dataset.target);
    const duration = 2000; // 2 seconds
    const step = target / (duration / 16); // 60fps
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current).toLocaleString();
    }, 16);
  };

  // Intersection Observer for stats
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(stat => {
    statsObserver.observe(stat);
  });
}

// Typing effect for hero title
function initTypingEffect() {
  const typingElement = document.querySelector('.typing-effect');
  const cursorElement = document.querySelector('.cursor');

  if (typingElement && cursorElement) {
    const text = typingElement.textContent;
    typingElement.textContent = '';
    let index = 0;

    const typeWriter = () => {
      if (index < text.length) {
        typingElement.textContent += text.charAt(index);
        index++;
        setTimeout(typeWriter, 100);
      } else {
        // Hide cursor after typing is complete
        setTimeout(() => {
          cursorElement.style.display = 'none';
        }, 500);
      }
    };

    // Start typing after a delay
    setTimeout(typeWriter, 1000);
  }
}

// Enhanced button interactions
function initButtonInteractions() {
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(button => {
    // Add ripple effect on click
    button.addEventListener('click', function(e) {
      const ripple = document.createElement('div');
      ripple.classList.add('btn-ripple');

      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });

    // Add hover sound effect (visual feedback)
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px) scale(1.02)';
    });

    button.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });
}

// Scroll indicator functionality
function initScrollIndicator() {
  const scrollIndicator = document.querySelector('.scroll-indicator');

  if (scrollIndicator) {
    // Hide scroll indicator when user scrolls
    let scrollTimeout;
    const hideScrollIndicator = () => {
      scrollIndicator.style.opacity = '0';
      scrollIndicator.style.pointerEvents = 'none';
    };

    window.addEventListener('scroll', () => {
      scrollIndicator.style.opacity = '1';
      scrollIndicator.style.pointerEvents = 'auto';

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(hideScrollIndicator, 2000);
    });

    // Click to scroll to next section
    scrollIndicator.addEventListener('click', () => {
      const nextSection = document.querySelector('#features');
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

// Navbar background change on scroll
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Add CSS for animations
const animationStyles = `
  .animate-in {
    animation: fadeInUp 0.6s ease forwards;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .nav-menu.mobile-active {
    display: flex;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    padding: 1rem 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border-top: 1px solid #eee;
  }

  .nav-menu.mobile-active .nav-link {
    padding: 0.75rem 1.5rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .nav-menu.mobile-active .btn {
    margin: 0.5rem 1.5rem;
  }

  .mobile-menu-toggle.active span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }

  .mobile-menu-toggle.active span:nth-child(2) {
    opacity: 0;
  }

  .mobile-menu-toggle.active span:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -6px);
  }

  .navbar.scrolled {
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  }

  @media (min-width: 769px) {
    .nav-menu.mobile-active {
      display: flex !important;
      position: static;
      background: transparent;
      box-shadow: none;
      border-top: none;
      padding: 0;
    }

    .nav-menu.mobile-active .nav-link {
      padding: 0;
      border-bottom: none;
    }

    .nav-menu.mobile-active .btn {
      margin: 0;
    }
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);

// Performance optimization: Lazy load images
function initLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

// Navbar scroll effect
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  const navLogo = document.querySelector('.nav-logo');
  let lastScrollY = window.scrollY;

  // Logo click to scroll to top
  navLogo.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScrollY = currentScrollY;
  });
}

// Active navigation links based on scroll position
function initActiveNavLinks() {
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    const scrollY = window.scrollY + 100; // Offset for navbar height

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Update active link on scroll
  window.addEventListener('scroll', updateActiveLink);

  // Update active link on page load
  updateActiveLink();

  // Update active link when clicking nav links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

// Initialize lazy loading if needed
initLazyLoading();