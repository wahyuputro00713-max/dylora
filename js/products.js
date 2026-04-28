const cartCountEl = document.getElementById('cartCount');
const addButtons = document.querySelectorAll('.btn-add');
const filterButtons = document.querySelectorAll('.chip');
const products = document.querySelectorAll('.product-card');

const cartStorageKey = 'dyloraCart';

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

const updateCartCount = () => {
  const totalQty = getCart().reduce((sum, item) => sum + item.quantity, 0);
  cartCountEl.textContent = totalQty;
};

updateCartCount();

addButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const product = {
      id: button.dataset.product,
      name: button.dataset.product,
      price: Number(button.dataset.price),
      oldPrice: Number(button.dataset.oldPrice),
    };

    const cart = getCart();
    const foundItem = cart.find((item) => item.id === product.id);

    if (foundItem) {
      foundItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    setCart(cart);
    updateCartCount();

    button.textContent = `✔ ${product.name} (${formatToRupiah(product.price)})`;
    setTimeout(() => {
      window.location.href = 'cart.html';
    }, 450);
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
