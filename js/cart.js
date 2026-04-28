const cartListEl = document.getElementById('cartList');
const emptyStateEl = document.getElementById('emptyState');
const summaryItemsEl = document.getElementById('summaryItems');
const summarySubtotalEl = document.getElementById('summarySubtotal');
const summarySavingsEl = document.getElementById('summarySavings');
const summaryTotalEl = document.getElementById('summaryTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const voucherForm = document.getElementById('voucherForm');

const cartStorageKey = 'dyloraCart';
let discount = 0;

const formatToRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);

const getCart = () => {
  const stored = localStorage.getItem(cartStorageKey);
  return stored ? JSON.parse(stored) : [];
};

const setCart = (items) => {
  localStorage.setItem(cartStorageKey, JSON.stringify(items));
};

const updateSummary = (cart) => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const normalPrice = cart.reduce((sum, item) => sum + item.oldPrice * item.quantity, 0);
  const savings = Math.max(0, normalPrice - subtotal) + discount;
  const total = Math.max(0, subtotal - discount);

  summaryItemsEl.textContent = totalItems;
  summarySubtotalEl.textContent = formatToRupiah(subtotal);
  summarySavingsEl.textContent = formatToRupiah(savings);
  summaryTotalEl.textContent = formatToRupiah(total);
};

const renderCart = () => {
  const cart = getCart();
  cartListEl.innerHTML = '';

  if (!cart.length) {
    emptyStateEl.classList.remove('hidden');
    checkoutBtn.disabled = true;
    updateSummary([]);
    return;
  }

  emptyStateEl.classList.add('hidden');
  checkoutBtn.disabled = false;

  cart.forEach((item) => {
    const itemEl = document.createElement('article');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <div>
        <h3>${item.name}</h3>
        <p class="muted">Harga sekarang ${formatToRupiah(item.price)}</p>
        <p class="price-note">Harga normal ${formatToRupiah(item.oldPrice)}</p>
        <div class="item-actions">
          <button class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
          <strong>${item.quantity}</strong>
          <button class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
          <button class="remove-btn" data-action="remove" data-id="${item.id}">Hapus</button>
        </div>
      </div>
      <strong>${formatToRupiah(item.price * item.quantity)}</strong>
    `;

    cartListEl.appendChild(itemEl);
  });

  updateSummary(cart);
};

cartListEl.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const action = target.dataset.action;
  const itemId = target.dataset.id;

  if (!action || !itemId) {
    return;
  }

  let cart = getCart();
  const item = cart.find((product) => product.id === itemId);

  if (!item) {
    return;
  }

  if (action === 'increase') {
    item.quantity += 1;
  }

  if (action === 'decrease') {
    item.quantity -= 1;
  }

  if (action === 'remove' || item.quantity <= 0) {
    cart = cart.filter((product) => product.id !== itemId);
  }

  setCart(cart);
  renderCart();
});

voucherForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const voucherInput = document.getElementById('voucherInput');
  const voucherCode = voucherInput.value.trim().toUpperCase();

  if (voucherCode === 'DYLORA15') {
    discount = 15000;
    alert('Voucher DYLORA15 berhasil dipakai. Potongan Rp15.000 aktif.');
  } else if (voucherCode) {
    discount = 0;
    alert('Kode voucher belum valid. Coba DYLORA15 ya ✨');
  }

  renderCart();
});

checkoutBtn.addEventListener('click', () => {
  const cart = getCart();

  if (!cart.length) {
    return;
  }

  alert('Checkout berhasil diproses. Terima kasih sudah belanja di DYLORA 💜');
  setCart([]);
  discount = 0;
  renderCart();
});

renderCart();
