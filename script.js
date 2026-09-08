// Amazing Yep - Global Scripts

document.addEventListener('DOMContentLoaded', function() {
  // One global product-search behavior for every navigation bar on the site.
  // Search results always live on the Collections page, regardless of which
  // page the visitor starts from.
  document.querySelectorAll('form.nav-search').forEach(function(form) {
    const input = form.querySelector('input[type="search"]');
    if (!input) return;
    const icon = form.querySelector('.nav-search-icon');

    form.setAttribute('action', '/collections/index.html');
    form.setAttribute('method', 'get');
    input.setAttribute('name', 'search');
    input.setAttribute('placeholder', 'Products, Item No., or Keywords');

    // Turn the trailing magnifier into an explicit, accessible search button.
    if (icon && !form.querySelector('.nav-search-submit')) {
      const submitButton = document.createElement('button');
      submitButton.type = 'submit';
      submitButton.className = 'nav-search-submit';
      submitButton.setAttribute('aria-label', 'Search products');
      submitButton.appendChild(icon);
      form.appendChild(submitButton);
    }

    // At tablet and mobile widths the field collapses to a search icon. A
    // click anywhere on the control focuses the input and expands it via CSS.
    form.addEventListener('click', function() {
      if (document.activeElement !== input) input.focus();
    });

    function runProductSearch() {
      const query = (input.value || '').trim();
      if (!query) {
        input.focus();
        return;
      }
      window.location.assign('/collections/index.html?search=' + encodeURIComponent(query));
    }

    form.addEventListener('submit', function(event) {
      event.preventDefault();
      runProductSearch();
    });

    input.addEventListener('keydown', function(event) {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      runProductSearch();
    });
  });

  // Carry the visitor's email from the footer CTA into the project form.
  document.querySelectorAll('form.footer-email-form').forEach(function(form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email || !emailInput.checkValidity()) {
        if (emailInput) emailInput.reportValidity();
        return;
      }
      window.location.assign('/contact/index.html?email=' + encodeURIComponent(email));
    });
  });

  // Prefill the contact form when the visitor arrives from the footer CTA.
  const contactEmail = document.querySelector('#email');
  const requestedEmail = new URLSearchParams(window.location.search).get('email');
  if (contactEmail && requestedEmail) contactEmail.value = requestedEmail;

  const inquiryForm = document.querySelector('#projectInquiryForm');
  if (inquiryForm) {
    const inquiryStatus = document.querySelector('#inquiryStatus');
    const inquiryButton = inquiryForm.querySelector('button[type="submit"]');
    const attachmentInput = inquiryForm.querySelector('#attachment');
    const attachmentName = inquiryForm.querySelector('#attachmentName');

    if (attachmentInput && attachmentName) {
      attachmentInput.addEventListener('change', function() {
        attachmentName.textContent = attachmentInput.files[0] ? attachmentInput.files[0].name : 'No file selected';
      });
    }

    inquiryForm.addEventListener('submit', async function(event) {
      event.preventDefault();
      if (!inquiryForm.reportValidity()) return;
      const attachment = attachmentInput && attachmentInput.files[0];
      if (attachment && attachment.size > 10 * 1024 * 1024) {
        inquiryStatus.textContent = 'The attachment must be 10 MB or smaller.';
        inquiryStatus.className = 'form-submit-status error';
        return;
      }

      inquiryButton.disabled = true;
      inquiryButton.textContent = 'Sending...';
      inquiryStatus.textContent = '';
      inquiryStatus.className = 'form-submit-status';
      try {
        const response = await fetch('/api/inquiries', {
          method: 'POST',
          body: new FormData(inquiryForm)
        });
        const result = await response.json().catch(function() { return {}; });
        if (!response.ok) throw new Error(result.error || 'Unable to send your quote request.');
        inquiryStatus.textContent = result.message || 'Thank you! Your quote request has been sent.';
        inquiryStatus.className = 'form-submit-status success';
        inquiryForm.reset();
        if (attachmentName) attachmentName.textContent = 'No file selected';
      } catch (error) {
        inquiryStatus.textContent = error.message || 'Unable to send your quote request. Please try again.';
        inquiryStatus.className = 'form-submit-status error';
      } finally {
        inquiryButton.disabled = false;
        inquiryButton.textContent = 'Start a Project';
      }
    });
  }

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
    if (!form.classList.contains('nav-search') && (!form.getAttribute('action') || form.getAttribute('action') === '#')) {
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
