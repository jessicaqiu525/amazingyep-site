// Amazing Yep - Global Scripts

document.addEventListener('DOMContentLoaded', function() {
  // Mobile navigation toggle
  const mobileToggle = document.querySelector('.nav-mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
      this.classList.toggle('active');
    });
  }

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Navbar background on scroll
  const nav = document.querySelector('.nav');
  let lastScroll = 0;

  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 100) {
      nav.style.boxShadow = '0 2px 20px rgba(0,0,0,0.08)';
    } else {
      nav.style.boxShadow = 'none';
    }
    lastScroll = currentScroll;
  });

  // Animate elements on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.why-card, .product-card, .industry-card, .case-card, .card-item, .process-step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

  // Add visible class styles dynamically
  const style = document.createElement('style');
  style.textContent = `
    .why-card.visible,
    .product-card.visible,
    .industry-card.visible,
    .case-card.visible,
    .card-item.visible,
    .process-step.visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);

  // Form submission handler (for forms without action)
  document.querySelectorAll('form').forEach(form => {
    if (!form.getAttribute('action') || form.getAttribute('action') === '#') {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn ? btn.textContent : '';
        if (btn) {
          btn.textContent = 'Sending...';
          btn.disabled = true;
        }
        setTimeout(() => {
          alert('Thank you! We will get back to you within 24 hours.');
          form.reset();
          if (btn) {
            btn.textContent = originalText;
            btn.disabled = false;
          }
        }, 1500);
      });
    }
  });

  // Collections dropdown — mobile tap toggle
  var dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  dropdownToggles.forEach(function(toggle) {
    toggle.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        this.parentElement.classList.toggle('dropdown-open');
      }
    });
  });

  // Close dropdown when clicking outside (mobile)
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) {
      var dropdowns = document.querySelectorAll('.has-dropdown.dropdown-open');
      dropdowns.forEach(function(dd) {
        if (!dd.contains(e.target)) {
          dd.classList.remove('dropdown-open');
        }
      });
    }
  });
});
