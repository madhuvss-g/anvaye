/* ============================================
   ANVAYE — BUYER JS
   Buyer specific logic
   ============================================ */

'use strict';

/* ── STATE ── */
const BuyerState = {
  isSubscribed:    false,
  currentSeller:   null,
  currentProduct:  null,
  cart:            [],
  phone:           '',
  otp:             '',
};

/* ── PHONE ENTRY ── */
const phoneForm = document.getElementById('phoneForm');
const phoneInput = document.getElementById('phoneInput');

phoneForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const phone = phoneInput?.value.trim();

  // Basic Indian phone validation
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    showFieldError(phoneInput, 'Enter a valid 10-digit Indian mobile number');
    return;
  }

  BuyerState.phone = phone;

  const btn = phoneForm.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.textContent = 'Sending OTP...';
  btn.disabled    = true;

  // Simulate OTP send
  // Replace with real Firebase / Twilio call
  setTimeout(() => {
    btn.textContent = originalText;
    btn.disabled    = false;
    showToast('OTP sent to +91 ' + phone);

    // Navigate to OTP screen
    window.location.href = '/buyer/otp.html?phone=' + phone;
  }, 1200);

  /*
  ── REAL OTP INTEGRATION ──
  import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';

  const auth = getAuth();
  window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
    size: 'invisible'
  }, auth);

  signInWithPhoneNumber(auth, '+91' + phone, window.recaptchaVerifier)
    .then(confirmationResult => {
      window.confirmationResult = confirmationResult;
      window.location.href = '/buyer/otp.html?phone=' + phone;
    })
    .catch(err => {
      showToast('Failed to send OTP. Try again.', 'error');
      console.error(err);
    });
  */
});

/* ── OTP VERIFICATION ── */
const otpForm    = document.getElementById('otpForm');
const otpInputs  = document.querySelectorAll('.otp-input');

// Auto advance OTP inputs
otpInputs.forEach((input, i) => {
  input.addEventListener('input', () => {
    // Only allow numbers
    input.value = input.value.replace(/[^0-9]/g, '').slice(-1);

    // Advance to next
    if (input.value && i < otpInputs.length - 1) {
      otpInputs[i + 1].focus();
    }

    // Auto submit when all filled
    const allFilled = [...otpInputs].every(inp => inp.value !== '');
    if (allFilled) {
      setTimeout(() => otpForm?.dispatchEvent(new Event('submit')), 300);
    }
  });

  input.addEventListener('keydown', (e) => {
    // Backspace goes to previous
    if (e.key === 'Backspace' && !input.value && i > 0) {
      otpInputs[i - 1].focus();
    }
    // Paste handling
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) return;
  });

  // Handle paste on any OTP input
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    [...pasted].forEach((char, idx) => {
      if (otpInputs[idx]) {
        otpInputs[idx].value = char;
      }
    });
    // Focus last filled or last input
    const lastIdx = Math.min(pasted.length - 1, otpInputs.length - 1);
    otpInputs[lastIdx]?.focus();
  });
});

otpForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const otp = [...otpInputs].map(inp => inp.value).join('');

  if (otp.length < 4) {
    showToast('Please enter the complete OTP', 'error');
    return;
  }

  const btn = otpForm.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.textContent = 'Verifying...';
  btn.disabled    = true;

  // Simulate verification
  // Replace with real Firebase confirmationResult.confirm(otp)
  setTimeout(() => {
    btn.textContent = originalText;
    btn.disabled    = false;

    // Navigate to buyer home
    window.location.href = '/buyer/home.html';
  }, 1200);

  /*
  ── REAL OTP VERIFICATION ──
  window.confirmationResult.confirm(otp)
    .then(result => {
      const user = result.user;
      localStorage.setItem('anvaye_user', JSON.stringify({
        uid:   user.uid,
        phone: user.phoneNumber,
        role:  'buyer'
      }));
      window.location.href = '/buyer/home.html';
    })
    .catch(() => {
      showToast('Invalid OTP. Please try again.', 'error');
      otpInputs.forEach(inp => inp.value = '');
      otpInputs[0].focus();
    });
  */
});

/* ── RESEND OTP TIMER ── */
function startResendTimer(seconds = 30) {
  const resendBtn  = document.getElementById('resendBtn');
  const timerEl    = document.getElementById('resendTimer');
  if (!resendBtn || !timerEl) return;

  resendBtn.disabled = true;
  let remaining      = seconds;

  const interval = setInterval(() => {
    remaining--;
    timerEl.textContent = remaining + 's';

    if (remaining <= 0) {
      clearInterval(interval);
      resendBtn.disabled  = false;
      timerEl.textContent = '';
    }
  }, 1000);
}

// Start timer on OTP page load
if (document.getElementById('resendBtn')) {
  startResendTimer(30);
}

document.getElementById('resendBtn')?.addEventListener('click', () => {
  showToast('OTP resent successfully!');
  startResendTimer(30);

  // Replace with real resend logic
});

/* ── SELLER SEARCH ── */
const searchInput = document.getElementById('sellerSearch');

searchInput?.addEventListener('input', () => {
  const query   = searchInput.value.toLowerCase().trim();
  const sellers = document.querySelectorAll('.seller-card-wrap');

  sellers.forEach(card => {
    const name   = card.querySelector('.seller-card-name')?.textContent.toLowerCase();
    const handle = card.querySelector('.seller-card-handle')?.textContent.toLowerCase();

    if (!query || name?.includes(query) || handle?.includes(query)) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });

  // Show empty state
  const visible = [...sellers].filter(c => c.style.display !== 'none');
  const emptyState = document.getElementById('searchEmpty');
  if (emptyState) {
    emptyState.style.display = visible.length === 0 ? 'block' : 'none';
  }
});

/* ── SUBSCRIPTION CHECK ── */
function checkSubscription() {
  // Replace with real backend check
  const sub = localStorage.getItem('anvaye_subscription');
  if (sub) {
    const parsed = JSON.parse(sub);
    const now    = new Date();
    const expiry = new Date(parsed.expiry);
    return now < expiry;
  }
  return false;
}

function handleLockedSeller(e) {
  e.preventDefault();
  window.location.href = '/buyer/subscription.html';
}

// Attach lock handler to locked sellers
document.querySelectorAll('.lock-overlay').forEach(btn => {
  btn.addEventListener('click', handleLockedSeller);
});

// Unlock sellers if subscribed
if (checkSubscription()) {
  document.querySelectorAll('.seller-card-locked').forEach(wrap => {
    wrap.classList.remove('seller-card-locked');
    const overlay = wrap.querySelector('.lock-overlay');
    overlay?.remove();
  });
  BuyerState.isSubscribed = true;
}

/* ── SUBSCRIPTION PAYMENT ── */
const subPayBtn = document.getElementById('subPayBtn');

subPayBtn?.addEventListener('click', () => {
  subPayBtn.textContent = 'Processing...';
  subPayBtn.disabled    = true;

  // Simulate payment
  // Replace with real Razorpay integration
  setTimeout(() => {
    // Store subscription locally
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 15);

    localStorage.setItem('anvaye_subscription', JSON.stringify({
      active: true,
      expiry: expiry.toISOString(),
      plan:   'anvaye-pass-15'
    }));

    showToast('🎉 Anvaye Pass activated! Enjoy unlimited access.');

    setTimeout(() => {
      window.location.href = '/buyer/home.html';
    }, 1500);
  }, 1800);

  /*
  ── REAL RAZORPAY INTEGRATION ──
  const options = {
    key:         'YOUR_RAZORPAY_KEY',
    amount:      5000, // ₹50 in paise
    currency:    'INR',
    name:        'Anvaye',
    description: 'Anvaye Pass — 15 Days',
    handler: function(response) {
      // Verify payment on backend
      fetch('/api/verify-payment', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ payment_id: response.razorpay_payment_id })
      })
      .then(res => res.json())
      .then(() => {
        showToast('Payment successful! Anvaye Pass activated.');
        window.location.href = '/buyer/home.html';
      });
    },
    prefill: {
      contact: BuyerState.phone
    },
    theme: { color: '#FF5C2B' }
  };
  const rzp = new Razorpay(options);
  rzp.open();
  */
});

/* ── PRODUCT DETAIL ── */
const buyBtn = document.getElementById('buyBtn');

buyBtn?.addEventListener('click', () => {
  buyBtn.textContent = 'Processing payment...';
  buyBtn.disabled    = true;

  // Simulate UPI payment
  // Replace with real Razorpay UPI flow
  setTimeout(() => {
    window.location.href = '/buyer/confirmed.html';
  }, 1800);

  /*
  ── REAL UPI PAYMENT ──
  const options = {
    key:         'YOUR_RAZORPAY_KEY',
    amount:      54900, // product price in paise
    currency:    'INR',
    name:        'Anvaye',
    description: 'Handmade Tote Bag',
    method:      { upi: true },
    handler: function(response) {
      window.location.href = '/buyer/confirmed.html?order=' + response.razorpay_payment_id;
    },
    theme: { color: '#FF5C2B' }
  };
  const rzp = new Razorpay(options);
  rzp.open();
  */
});

/* ── ORDER TRACKING ── */
function initTracking() {
  const steps = document.querySelectorAll('.track-step');
  if (!steps.length) return;

  // Animate steps in sequence
  steps.forEach((step, i) => {
    setTimeout(() => {
      step.style.opacity   = '0';
      step.style.transform = 'translateX(-20px)';
      step.style.transition = 'all 0.4s ease';

      requestAnimationFrame(() => {
        setTimeout(() => {
          step.style.opacity   = '1';
          step.style.transform = 'translateX(0)';
        }, 50);
      });
    }, i * 200);
  });
}

// Init tracking animation on page load
if (document.querySelector('.track-steps')) {
  initTracking();
}

/* ── FIELD ERROR ── */
function showFieldError(input, message) {
  // Remove existing error
  const existing = input?.parentElement?.querySelector('.field-error');
  if (existing) existing.remove();

  if (!input) return;

  const error = document.createElement('div');
  error.className   = 'field-error';
  error.textContent = message;

  Object.assign(error.style, {
    fontSize:   '12px',
    color:      '#D85A30',
    marginTop:  '6px',
    fontWeight: '500'
  });

  input.style.borderColor = '#D85A30';
  input.parentElement.appendChild(error);

  // Clear error on input
  input.addEventListener('input', () => {
    error.remove();
    input.style.borderColor = '';
  }, { once: true });
}

/* ── AUTH GUARD ── */
// Protect buyer pages — redirect to login if not authenticated
function checkAuth() {
  const protectedPaths = [
    '/buyer/home.html',
    '/buyer/store.html',
    '/buyer/product.html',
    '/buyer/confirmed.html',
    '/buyer/tracking.html',
    '/buyer/subscription.html'
  ];

  const currentPath = window.location.pathname;
  const isProtected = protectedPaths.some(p => currentPath.includes(p));

  if (isProtected) {
    const user = localStorage.getItem('anvaye_user');
    if (!user) {
      window.location.href = '/buyer/index.html';
    }
  }
}

checkAuth();
