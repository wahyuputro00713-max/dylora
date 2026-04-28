const cartCountEl = document.getElementById('cartCount');
const addButtons = document.querySelectorAll('.btn-add');
const filterButtons = document.querySelectorAll('.chip');
const products = document.querySelectorAll('.product-card');
const promoForm = document.querySelector('.promo-form');

let cartCount = 0;

addButtons.forEach((button) => {
  button.addEventListener('click', () => {
    cartCount += 1;
    cartCountEl.textContent = cartCount;

    const productName = button.dataset.product;
    button.textContent = `✔ ${productName} ditambahkan`;

    setTimeout(() => {
      button.textContent = '+ Tambah ke Keranjang';
    }, 1500);
  });
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');

    const target = button.dataset.filter;
    products.forEach((product) => {
      const category = product.dataset.category;
      const shouldShow = target === 'all' || target === category;
      product.style.display = shouldShow ? 'block' : 'none';
    });
  });
});

promoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = promoForm.querySelector('input');
  alert(`Terima kasih! Voucher 15% sudah dikirim ke ${input.value}.`);
  promoForm.reset();
});
