/* ============================================
   ANVAYE — MAIN JS
   Shared logic across all pages
   ============================================ */

'use strict';

/* ── NAVBAR ── */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
const navMobileClose = document.getElementById('navMobileClose');

// Scroll effect
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar?.classList.add('scrolled');
  } else {
    navbar?.classList.remove('scrolled');
  }
});

// Mobile menu open
navToggle?.addEventListener('click', () => {
  navMobile?.classList.add('open');
  document.body.style.overflow = 'hidden';
});

// Mobile menu close
navMobileClose?.addEventListener('click', () => {
  navMobile?.classList.remove('open');
  document.body.style.overflow = '';
});

// Close mobile menu on link click
document.querySelectorAll('.nav-mobile a').forEach(link => {
  link.addEventListener('click', () => {
    navMobile?.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Close mobile menu on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    navMobile?.classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Unobserve after reveal for performance
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold:  0.12,
  rootMargin: '0px 0px -60px 0px'
});

// Observe all reveal elements
document.querySelectorAll(
  '.reveal, .reveal-left, .reveal-right'
).forEach(el => revealObserver.observe(el));

/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;

    e.preventDefault();

    const target = document.querySelector(href);
    if (target) {
      const offset = target.offsetTop - 80;
      window.scrollTo({
        top:      offset,
        behavior: 'smooth'
      });
    }
  });
});

/* ── ACTIVE NAV LINK ── */
// Highlights nav link based on current page
const currentPage = window.location.pathname;

document.querySelectorAll('.nav-links a').forEach(link => {
  if (link.getAttribute('href') === currentPage ||
      currentPage.includes(link.getAttribute('href'))) {
    link.style.color = '#FF5C2B';
  }
});

/* ── COUNTER ANIMATION ── */
// Animates numbers counting up when visible
function animateCounter(el) {
  const target   = parseInt(el.getAttribute('data-target'));
  const prefix   = el.getAttribute('data-prefix') || '';
  const suffix   = el.getAttribute('data-suffix') || '';
  const duration = 1800;
  const steps    = 60;
  const increment = target / steps;
  let current    = 0;
  let step       = 0;

  const timer = setInterval(() => {
    step++;
    current = Math.min(Math.round(increment * step), target);
    el.textContent = prefix + current.toLocaleString('en-IN') + suffix;

    if (step >= steps) {
      clearInterval(timer);
      el.textContent = prefix + target.toLocaleString('en-IN') + suffix;
    }
  }, duration / steps);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => {
  counterObserver.observe(el);
});

/* ── TOAST NOTIFICATION ── */
function showToast(message, type = 'success') {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">
      ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
    </span>
    <span class="toast-msg">${message}</span>
  `;

  // Toast styles injected dynamically
  Object.assign(toast.style, {
    position:     'fixed',
    bottom:       '24px',
    right:        '24px',
    background:   type === 'success'
                    ? '#1D9E75'
                    : type === 'error'
                    ? '#D85A30'
                    : '#185FA5',
    color:        '#fff',
    padding:      '14px 20px',
    borderRadius: '12px',
    fontSize:     '14px',
    fontWeight:   '500',
    display:      'flex',
    alignItems:   'center',
    gap:          '10px',
    zIndex:       '9999',
    boxShadow:    '0 8px 32px rgba(0,0,0,0.2)',
    animation:    'fadeUp 0.3s ease',
    maxWidth:     '320px',
    fontFamily:   'Inter, sans-serif'
  });

  document.body.appendChild(toast);

  // Auto remove after 3.5s
  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ── CONTACT FORM ── */
const contactForm = document.getElementById('contactForm');

contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const btn = contactForm.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  // Loading state
  btn.textContent = 'Sending...';
  btn.disabled    = true;

  // Simulate API call
  // Replace with actual fetch() call to your backend
  setTimeout(() => {
    showToast('Message sent! We\'ll get back to you soon.');
    contactForm.reset();
    btn.textContent = originalText;
    btn.disabled    = false;
  }, 1500);

  /*
  ── REAL BACKEND INTEGRATION ──
  fetch('/api/contact', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      name:    contactForm.name.value,
      email:   contactForm.email.value,
      message: contactForm.message.value
    })
  })
  .then(res => res.json())
  .then(() => {
    showToast('Message sent successfully!');
    contactForm.reset();
  })
  .catch(() => {
    showToast('Something went wrong. Try again.', 'error');
  })
  .finally(() => {
    btn.textContent = originalText;
    btn.disabled    = false;
  });
  */
});

/* ── LAZY LOAD IMAGES ── */
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

/* ── CURSOR GLOW EFFECT ── */
// Futuristic cursor glow that follows mouse
const cursorGlow = document.createElement('div');
Object.assign(cursorGlow.style, {
  position:     'fixed',
  width:        '300px',
  height:       '300px',
  borderRadius: '50%',
  background:   'radial-gradient(circle, rgba(255,92,43,0.06) 0%, transparent 70%)',
  pointerEvents: 'none',
  zIndex:       '0',
  transform:    'translate(-50%, -50%)',
  transition:   'left 0.1s ease, top 0.1s ease',
  top:          '-300px',
  left:         '-300px'
});

document.body.appendChild(cursorGlow);

document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top  = e.clientY + 'px';
});

/* ── FOOTER YEAR ── */
document.querySelectorAll('.current-year').forEach(el => {
  el.textContent = new Date().getFullYear();
});

/* ── PAGE LOAD ANIMATION ── */
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity   = '0';
  document.body.style.transform = 'translateY(8px)';
  document.body.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

  requestAnimationFrame(() => {
    document.body.style.opacity   = '1';
    document.body.style.transform = 'translateY(0)';
  });
});

/* ── CONSOLE BRANDING ── */
console.log(
  '%c⚡ Anvaye',
  'color: #FF5C2B; font-size: 24px; font-weight: 800;'
);
console.log(
  '%cOne stop shop for your wish-list',
  'color: #EF9F27; font-size: 13px;'
);
