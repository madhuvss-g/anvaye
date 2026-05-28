/* ============================================
   ANVAYE — SELLER JS
   Seller specific logic
   ============================================ */

'use strict';

/* ── STATE ── */
const SellerState = {
  phone:        '',
  store:        null,
  products:     [],
  orders:       [],
  currentTab:   'dashboard',
};

/* ── PHONE ENTRY ── */
const sellerPhoneForm  = document.getElementById('sellerPhoneForm');
const sellerPhoneInput = document.getElementById('sellerPhoneInput');

sellerPhoneForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const phone = sellerPhoneInput?.value.trim();

  // Basic Indian phone validation
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    showSellerFieldError(
      sellerPhoneInput,
      'Enter a valid 10-digit Indian mobile number'
    );
    return;
  }

  SellerState.phone = phone;

  const btn          = sellerPhoneForm.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.textContent = 'Sending OTP...';
  btn.disabled    = true;

  // Simulate OTP send
  // Replace with real Firebase / Twilio call
  setTimeout(() => {
    btn.textContent = originalText;
    btn.disabled    = false;
    showToast('OTP sent to +91 ' + phone);
    window.location.href = '/seller/otp.html?phone=' + phone;
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
      window.location.href = '/seller/otp.html?phone=' + phone;
    })
    .catch(err => {
      showToast('Failed to send OTP. Try again.', 'error');
      console.error(err);
    });
  */
});

/* ── OTP VERIFICATION ── */
const sellerOtpForm   = document.getElementById('sellerOtpForm');
const sellerOtpInputs = document.querySelectorAll('.seller-otp-input');

// Auto advance OTP inputs
sellerOtpInputs.forEach((input, i) => {
  input.addEventListener('input', () => {
    // Only allow numbers
    input.value = input.value.replace(/[^0-9]/g, '').slice(-1);

    // Advance to next
    if (input.value && i < sellerOtpInputs.length - 1) {
      sellerOtpInputs[i + 1].focus();
    }

    // Auto submit when all filled
    const allFilled = [...sellerOtpInputs].every(inp => inp.value !== '');
    if (allFilled) {
      setTimeout(() => sellerOtpForm?.dispatchEvent(new Event('submit')), 300);
    }
  });

  input.addEventListener('keydown', (e) => {
    // Backspace goes to previous
    if (e.key === 'Backspace' && !input.value && i > 0) {
      sellerOtpInputs[i - 1].focus();
    }
  });

  // Handle paste
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    [...pasted].forEach((char, idx) => {
      if (sellerOtpInputs[idx]) {
        sellerOtpInputs[idx].value = char;
      }
    });
    const lastIdx = Math.min(pasted.length - 1, sellerOtpInputs.length - 1);
    sellerOtpInputs[lastIdx]?.focus();
  });
});

sellerOtpForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const otp = [...sellerOtpInputs].map(inp => inp.value).join('');

  if (otp.length < 4) {
    showToast('Please enter the complete OTP', 'error');
    return;
  }

  const btn          = sellerOtpForm.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.textContent = 'Verifying...';
  btn.disabled    = true;

  // Simulate verification
  // Replace with real Firebase confirmationResult.confirm(otp)
  setTimeout(() => {
    btn.textContent = originalText;
    btn.disabled    = false;

    // Check if seller already has store
    const store = localStorage.getItem('anvaye_store');
    if (store) {
      window.location.href = '/seller/dashboard.html';
    } else {
      window.location.href = '/seller/onboarding.html';
    }
  }, 1200);

  /*
  ── REAL OTP VERIFICATION ──
  window.confirmationResult.confirm(otp)
    .then(result => {
      const user = result.user;
      localStorage.setItem('anvaye_user', JSON.stringify({
        uid:   user.uid,
        phone: user.phoneNumber,
        role:  'seller'
      }));

      // Check if store exists in backend
      fetch('/api/seller/store?uid=' + user.uid)
        .then(res => res.json())
        .then(data => {
          if (data.store) {
            window.location.href = '/seller/dashboard.html';
          } else {
            window.location.href = '/seller/onboarding.html';
          }
        });
    })
    .catch(() => {
      showToast('Invalid OTP. Please try again.', 'error');
      sellerOtpInputs.forEach(inp => inp.value = '');
      sellerOtpInputs[0].focus();
    });
  */
});

/* ── RESEND OTP TIMER ── */
function startSellerResendTimer(seconds = 30) {
  const resendBtn = document.getElementById('sellerResendBtn');
  const timerEl   = document.getElementById('sellerResendTimer');
  if (!resendBtn || !timerEl) return;

  resendBtn.disabled  = true;
  let remaining       = seconds;

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

if (document.getElementById('sellerResendBtn')) {
  startSellerResendTimer(30);
}

document.getElementById('sellerResendBtn')?.addEventListener('click', () => {
  showToast('OTP resent successfully!');
  startSellerResendTimer(30);
});

/* ── STORE ONBOARDING FORM ── */
const onboardingForm = document.getElementById('onboardingForm');

onboardingForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const handle  = document.getElementById('igHandle')?.value.trim();
  const name    = document.getElementById('storeName')?.value.trim();
  const desc    = document.getElementById('storeDesc')?.value.trim();

  // Validate
  if (!handle || !name || !desc) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  if (!handle.startsWith('@')) {
    showSellerFieldError(
      document.getElementById('igHandle'),
      'Instagram handle must start with @'
    );
    return;
  }

  const btn          = onboardingForm.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.textContent = 'Creating your store...';
  btn.disabled    = true;

  // Simulate store creation
  // Replace with real API call
  setTimeout(() => {
    // Save store locally
    localStorage.setItem('anvaye_store', JSON.stringify({
      handle,
      name,
      desc,
      createdAt: new Date().toISOString()
    }));

    showToast('🎉 Your store is live!');

    setTimeout(() => {
      window.location.href = '/seller/dashboard.html';
    }, 1200);
  }, 1800);

  /*
  ── REAL STORE CREATION ──
  const user = JSON.parse(localStorage.getItem('anvaye_user'));

  fetch('/api/seller/store', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      uid:    user.uid,
      handle,
      name,
      desc
    })
  })
  .then(res => res.json())
  .then(data => {
    localStorage.setItem('anvaye_store', JSON.stringify(data.store));
    showToast('Store created successfully!');
    window.location.href = '/seller/dashboard.html';
  })
  .catch(() => {
    showToast('Failed to create store. Try again.', 'error');
    btn.textContent = originalText;
    btn.disabled    = false;
  });
  */
});

/* ── DASHBOARD TABS ── */
const dashTabs    = document.querySelectorAll('.dash-tab');
const dashPanels  = document.querySelectorAll('.dash-panel');

dashTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.getAttribute('data-tab');

    // Update tabs
    dashTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Update panels
    dashPanels.forEach(panel => {
      if (panel.getAttribute('data-panel') === target) {
        panel.style.display = 'block';
        panel.style.animation = 'fadeUp 0.3s ease';
      } else {
        panel.style.display = 'none';
      }
    });

    SellerState.currentTab = target;
  });
});

/* ── ADD PRODUCT FORM ── */
const addProductForm = document.getElementById('addProductForm');

addProductForm?.addEventListener('submit', (e) => {
  e.preventDefault();

  const name  = document.getElementById('productName')?.value.trim();
  const price = document.getElementById('productPrice')?.value.trim();
  const desc  = document.getElementById('productDesc')?.value.trim();
  const emoji = document.getElementById('productEmoji')?.value.trim() || '📦';

  if (!name || !price || !desc) {
    showToast('Please fill in all product details', 'error');
    return;
  }

  if (isNaN(price) || parseFloat(price) <= 0) {
    showSellerFieldError(
      document.getElementById('productPrice'),
      'Enter a valid price'
    );
    return;
  }

  const btn          = addProductForm.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  btn.textContent = 'Adding product...';
  btn.disabled    = true;

  // Simulate product addition
  // Replace with real API call
  setTimeout(() => {
    const product = {
      id:        Date.now(),
      name,
      price:     parseFloat(price),
      desc,
      emoji,
      createdAt: new Date().toISOString()
    };

    // Save to local state
    SellerState.products.push(product);

    // Save to localStorage
    const stored = JSON.parse(localStorage.getItem('anvaye_products') || '[]');
    stored.push(product);
    localStorage.setItem('anvaye_products', JSON.stringify(stored));

    showToast('✅ Product added successfully!');
    addProductForm.reset();

    btn.textContent = originalText;
    btn.disabled    = false;

    // Re-render products list if on dashboard
    renderProducts();
  }, 1200);

  /*
  ── REAL PRODUCT CREATION ──
  const store = JSON.parse(localStorage.getItem('anvaye_store'));

  fetch('/api/seller/products', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      storeId: store.id,
      name,
      price:   parseFloat(price),
      desc,
      emoji
    })
  })
  .then(res => res.json())
  .then(data => {
    showToast('Product added!');
    renderProducts();
  })
  .catch(() => {
    showToast('Failed to add product. Try again.', 'error');
  });
  */
});

/* ── RENDER PRODUCTS ── */
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const products = JSON.parse(
    localStorage.getItem('anvaye_products') || '[]'
  );

  if (products.length === 0) {
    grid.innerHTML = `
      <div style="
        grid-column: 1/-1;
        text-align:  center;
        padding:     48px;
        color:       var(--text-secondary);
        font-size:   15px;
      ">
        No products yet. Add your first product above!
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <div class="product-img">${p.emoji}</div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">₹${p.price.toLocaleString('en-IN')}</div>
        <div style="
          display:         flex;
          gap:             8px;
          margin-top:      10px;
          justify-content: space-between;
        ">
          <button
            class="btn btn-secondary btn-sm"
            onclick="editProduct(${p.id})"
          >Edit</button>
          <button
            class="btn btn-sm"
            style="background:var(--red-dim);color:var(--red-av);border:none"
            onclick="deleteProduct(${p.id})"
          >Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ── DELETE PRODUCT ── */
function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;

  const stored  = JSON.parse(localStorage.getItem('anvaye_products') || '[]');
  const updated = stored.filter(p => p.id !== id);
  localStorage.setItem('anvaye_products', JSON.stringify(updated));

  showToast('Product deleted');
  renderProducts();

  /*
  ── REAL DELETE ──
  fetch('/api/seller/products/' + id, { method: 'DELETE' })
    .then(() => {
      showToast('Product deleted');
      renderProducts();
    });
  */
}

/* ── EDIT PRODUCT ── */
function editProduct(id) {
  const stored  = JSON.parse(localStorage.getItem('anvaye_products') || '[]');
  const product = stored.find(p => p.id === id);
  if (!product) return;

  // Pre-fill form
  const nameEl  = document.getElementById('productName');
  const priceEl = document.getElementById('productPrice');
  const descEl  = document.getElementById('productDesc');
  const emojiEl = document.getElementById('productEmoji');

  if (nameEl)  nameEl.value  = product.name;
  if (priceEl) priceEl.value = product.price;
  if (descEl)  descEl.value  = product.desc;
  if (emojiEl) emojiEl.value = product.emoji;

  // Scroll to form
  addProductForm?.scrollIntoView({ behavior: 'smooth' });

  // Update submit to edit mode
  const btn = addProductForm?.querySelector('button[type="submit"]');
  if (btn) {
    btn.textContent        = 'Update Product';
    btn.dataset.editId     = id;
  }
}

/* ── ORDER STATUS UPDATE ── */
document.querySelectorAll('.update-status-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const orderId   = btn.getAttribute('data-order-id');
    const newStatus = btn.getAttribute('data-status');
    const pill      = document.querySelector(`[data-order-pill="${orderId}"]`);

    if (!pill) return;

    // Update pill
    pill.className  = 'order-pill';
    if (newStatus === 'Packing')   pill.classList.add('op-pack');
    if (newStatus === 'Shipped')   pill.classList.add('op-ship');
    if (newStatus === 'Delivered') pill.classList.add('op-done');
    pill.textContent = newStatus;

    showToast(`Order #${orderId} marked as ${newStatus}`);

    /*
    ── REAL STATUS UPDATE ──
    fetch('/api/seller/orders/' + orderId + '/status', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status: newStatus })
    })
    .then(() => showToast('Order status updated'))
    .catch(() => showToast('Failed to update status', 'error'));
    */
  });
});

/* ── DASHBOARD STATS ANIMATION ── */
function initDashboardStats() {
  const statValues = document.querySelectorAll('.dash-stat-value[data-target]');
  statValues.forEach(el => {
    // Trigger counter animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateSellerCounter(el);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(el);
  });
}

function animateSellerCounter(el) {
  const target    = parseInt(el.getAttribute('data-target'));
  const prefix    = el.getAttribute('data-prefix') || '';
  const suffix    = el.getAttribute('data-suffix') || '';
  const duration  = 1500;
  const steps     = 50;
  const increment = target / steps;
  let current     = 0;
  let step        = 0;

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

// Init on dashboard page
if (document.querySelector('.dashboard-stats')) {
  initDashboardStats();
  renderProducts();
}

/* ── FIELD ERROR ── */
function showSellerFieldError(input, message) {
  const existing = input?.parentElement?.querySelector('.field-error');
  if (existing) existing.remove();

  if (!input) return;

  const error       = document.createElement('div');
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

  input.addEventListener('input', () => {
    error.remove();
    input.style.borderColor = '';
  }, { once: true });
}

/* ── AUTH GUARD ── */
function checkSellerAuth() {
  const protectedPaths = [
    '/seller/onboarding.html',
    '/seller/dashboard.html',
  ];

  const currentPath = window.location.pathname;
  const isProtected = protectedPaths.some(p => currentPath.includes(p));

  if (isProtected) {
    const user = localStorage.getItem('anvaye_user');
    if (!user) {
      window.location.href = '/seller/index.html';
    }
  }
}

checkSellerAuth();
