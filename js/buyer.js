/* ============================================
   ANVAYE — BUYER JS
   Navigation is handled by buyer/index.html
   This file handles shared buyer utilities
   ============================================ */

'use strict';

/* ── STATE ── */
const BuyerState = {
  isSubscribed:   false,
  currentSeller:  null,
  currentProduct: null,
  phone:          '',
};

/* ── OTP AUTO ADVANCE ── */
function initOtpInputs(inputClass) {
  const inputs = document.querySelectorAll('.' + inputClass);

  inputs.forEach((input, i) => {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^0-9]/g, '').slice(-1);
      if (input.value && i < inputs.length - 1) {
        inputs[i + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && i > 0) {
        inputs[i - 1].focus();
      }
    });

    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData('text')
        .replace(/[^0-9]/g, '');
      [...pasted].forEach((char, idx) => {
        if (inputs[idx]) inputs[idx].value = char;
      });
      const lastIdx = Math.min(
        pasted.length - 1,
        inputs.length - 1
      );
      inputs[lastIdx]?.focus();
    });
  });
}

/* Init OTP inputs on page load */
initOtpInputs('otp-input');

/* ── RESEND TIMER ── */
function startResendTimer(
  btnId    = 'resendBtn',
  timerId  = 'resendTimer',
  seconds  = 30
) {
  const btn     = document.getElementById(btnId);
  const timerEl = document.getElementById(timerId);
  if (!btn || !timerEl) return;

  btn.disabled        = true;
  let remaining       = seconds;
  timerEl.textContent = ' in ' + remaining + 's';

  const interval = setInterval(() => {
    remaining--;
    timerEl.textContent = ' in ' + remaining + 's';

    if (remaining <= 0) {
      clearInterval(interval);
      btn.disabled        = false;
      timerEl.textContent = '';
    }
  }, 1000);
}

/* Start timer if resend button exists */
if (document.getElementById('resendBtn')) {
  startResendTimer('resendBtn', 'resendTimer', 30);
}

document.getElementById('resendBtn')
  ?.addEventListener('click', () => {
    showToast('OTP resent successfully!');
    startResendTimer('resendBtn', 'resendTimer', 30);
  });

/* ── PHONE VALIDATION ── */
function validateIndianPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone);
}

/* ── FIELD ERROR ── */
function showFieldError(input, message) {
  const existing = input?.parentElement
    ?.querySelector('.field-error');
  if (existing) existing.remove();
  if (!input) return;

  const error         = document.createElement('div');
  error.className     = 'field-error';
  error.textContent   = message;

  Object.assign(error.style, {
    fontSize:   '12px',
    color:      '#D85A30',
    marginTop:  '6px',
    fontWeight: '500'
  });

  input.style.borderColor = '#D85A30';
  input.parentElement.appendChild(error);

  input.addEventListener('input', () => {
    error.remove();
    input.style.borderColor = '';
  }, { once: true });
}

/* ── SUBSCRIPTION CHECK ── */
function checkSubscription() {
  const sub = localStorage.getItem('anvaye_subscription');
  if (!sub) return false;
  const parsed = JSON.parse(sub);
  return new Date() < new Date(parsed.expiry);
}

/* Unlock sellers if subscribed */
if (checkSubscription()) {
  document.querySelectorAll('.seller-card-locked')
    .forEach(wrap => {
      wrap.classList.remove('seller-card-locked');
      wrap.querySelector('.lock-overlay')?.remove();
    });
  BuyerState.isSubscribed = true;
}
