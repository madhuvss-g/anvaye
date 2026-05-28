/* ============================================
   ANVAYE — SELLER JS
   Navigation is handled by seller/index.html
   This file handles shared seller utilities
   ============================================ */

'use strict';

/* ── STATE ── */
const SellerState = {
  phone:       '',
  store:       null,
  products:    [],
  currentTab:  'dashboard',
};

/* ── OTP AUTO ADVANCE ── */
function initSellerOtpInputs(inputClass) {
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

/* Init OTP inputs */
initSellerOtpInputs('seller-otp-input');

/* ── RESEND TIMER ── */
function startSellerResendTimer(
  btnId   = 'sellerResendBtn',
  timerId = 'sellerResendTimer',
  seconds = 30
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

if (document.getElementById('sellerResendBtn')) {
  startSellerResendTimer();
}

document.getElementById('sellerResendBtn')
  ?.addEventListener('click', () => {
    showToast('OTP resent successfully!');
    startSellerResendTimer();
  });

/* ── FIELD ERROR ── */
function showSellerFieldError(input, message) {
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
      </div>`;
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <div class="product-img">${p.emoji || '📦'}</div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">
          ₹${p.price.toLocaleString('en-IN')}
        </div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <button
            class="btn btn-secondary btn-sm"
            style="flex:1"
            onclick="editProduct(${p.id})"
          >Edit</button>
          <button
            class="btn btn-sm"
            style="flex:1;background:var(--red-dim);
                   color:var(--red-av);border:none"
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

  const stored  = JSON.parse(
    localStorage.getItem('anvaye_products') || '[]'
  );
  const updated = stored.filter(p => p.id !== id);
  localStorage.setItem(
    'anvaye_products',
    JSON.stringify(updated)
  );

  showToast('Product deleted');
  renderProducts();
}

/* ── EDIT PRODUCT ── */
function editProduct(id) {
  const stored  = JSON.parse(
    localStorage.getItem('anvaye_products') || '[]'
  );
  const product = stored.find(p => p.id === id);
  if (!product) return;

  const nameEl  = document.getElementById('productName');
  const priceEl = document.getElementById('productPrice');
  const descEl  = document.getElementById('productDesc');
  const emojiEl = document.getElementById('productEmoji');

  if (nameEl)  nameEl.value  = product.name;
  if (priceEl) priceEl.value = product.price;
  if (descEl)  descEl.value  = product.desc;
  if (emojiEl) emojiEl.value = product.emoji;

  const form = document.getElementById('addProductForm');
  form?.scrollIntoView({ behavior: 'smooth' });

  const btn = form?.querySelector('button[type="submit"]');
  if (btn) {
    btn.textContent    = 'Update Product';
    btn.dataset.editId = id;
  }
}

/* ── ADD PRODUCT FORM ── */
document.getElementById('addProductForm')
  ?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name  = document.getElementById('productName')
                    ?.value.trim();
    const price = document.getElementById('productPrice')
                    ?.value.trim();
    const desc  = document.getElementById('productDesc')
                    ?.value.trim();
    const emoji = document.getElementById('productEmoji')
                    ?.value.trim() || '📦';

    if (!name || !price || !desc) {
      showToast('Please fill in all product details', 'error');
      return;
    }

    if (isNaN(price) || parseFloat(price) <= 0) {
      showToast('Enter a valid price', 'error');
      return;
    }

    const btn          = e.target.querySelector(
                           'button[type="submit"]'
                         );
    const originalText = btn.textContent;
    btn.textContent    = 'Adding...';
    btn.disabled       = true;

    setTimeout(() => {
      const product = {
        id:        Date.now(),
        name,
        price:     parseFloat(price),
        desc,
        emoji,
        createdAt: new Date().toISOString()
      };

      const stored = JSON.parse(
        localStorage.getItem('anvaye_products') || '[]'
      );
      stored.push(product);
      localStorage.setItem(
        'anvaye_products',
        JSON.stringify(stored)
      );

      showToast('✅ Product added successfully!');
      e.target.reset();
      btn.textContent = originalText;
      btn.disabled    = false;

      renderProducts();
    }, 800);
  });

/* ── DASHBOARD STATS ANIMATION ── */
if (document.querySelector('.dashboard-stats')) {
  renderProducts();
}

/* ── ORDER STATUS UPDATE ── */
document.querySelectorAll('.update-status-btn')
  .forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId   = btn.getAttribute('data-order-id');
      const newStatus = btn.getAttribute('data-status');
      const pill      = document.querySelector(
                          `[data-order-pill="${orderId}"]`
                        );
      if (!pill) return;

      pill.className = 'order-pill';
      if (newStatus === 'Packing')   pill.classList.add('op-pack');
      if (newStatus === 'Shipped')   pill.classList.add('op-ship');
      if (newStatus === 'Delivered') pill.classList.add('op-done');
      pill.textContent = newStatus;

      showToast(`Order #${orderId} marked as ${newStatus}`);
    });
  });
