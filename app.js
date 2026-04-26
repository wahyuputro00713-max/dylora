const products = [
  { id: 1, name: "Piyama Satin Rose", category: "Baju Tidur", price: 179000, rating: 4.8, sold: 240, store: "Luna Sleepwear", emoji: "🩷" },
  { id: 2, name: "Daster Katun Premium", category: "Baju Tidur", price: 129000, rating: 4.6, sold: 512, store: "Nyaman House", emoji: "🌸" },
  { id: 3, name: "Set Kimono Nightwear", category: "Baju Tidur", price: 219000, rating: 4.9, sold: 143, store: "Moonlight Closet", emoji: "🎀" },
  { id: 4, name: "Cardigan Rajut Wanita", category: "Fashion", price: 185000, rating: 4.5, sold: 321, store: "Mila Fashion", emoji: "🧥" },
  { id: 5, name: "Dress Floral Midi", category: "Fashion", price: 249000, rating: 4.7, sold: 219, store: "Femina Shop", emoji: "👗" },
  { id: 6, name: "Blouse Korean Casual", category: "Fashion", price: 155000, rating: 4.4, sold: 187, store: "Seoul Style ID", emoji: "🫶" },
  { id: 7, name: "Piyama Lengan Panjang", category: "Baju Tidur", price: 199000, rating: 4.7, sold: 281, store: "Luna Sleepwear", emoji: "🌙" },
  { id: 8, name: "Tunik Santai Polos", category: "Fashion", price: 139000, rating: 4.2, sold: 98, store: "Nyaman House", emoji: "✨" },
];

const state = {
  query: "",
  sort: "popular",
  categories: new Set(),
  minPrice: 0,
  maxPrice: 1000000,
  rating: 0,
  cart: JSON.parse(localStorage.getItem("cart") ?? "[]"),
  orders: JSON.parse(localStorage.getItem("orders") ?? "[]"),
  adminSession: localStorage.getItem("adminSession") === "active",
};

const adminAccount = {
  email: "admin@dylora.id",
  password: "Admin123!",
  role: "Marketplace Admin",
};

const byId = (id) => document.getElementById(id);
const format = (val) => new Intl.NumberFormat("id-ID").format(val);

function setupFilters() {
  const categories = [...new Set(products.map((p) => p.category))];
  byId("categoryFilters").innerHTML = categories
    .map(
      (cat) => `<label><input type="checkbox" value="${cat}" /> ${cat}</label>`
    )
    .join("");

  byId("categoryFilters").addEventListener("change", (e) => {
    const { value, checked } = e.target;
    if (checked) state.categories.add(value);
    else state.categories.delete(value);
    renderProducts();
  });
}

function getFilteredProducts() {
  return products
    .filter((p) => !state.query || [p.name, p.store, p.category].join(" ").toLowerCase().includes(state.query))
    .filter((p) => state.categories.size === 0 || state.categories.has(p.category))
    .filter((p) => p.price >= state.minPrice && p.price <= state.maxPrice)
    .filter((p) => p.rating >= state.rating)
    .sort((a, b) => {
      if (state.sort === "price-asc") return a.price - b.price;
      if (state.sort === "price-desc") return b.price - a.price;
      if (state.sort === "rating") return b.rating - a.rating;
      return b.sold - a.sold;
    });
}

function renderProducts() {
  const data = getFilteredProducts();
  byId("resultInfo").textContent = `${data.length} produk ditemukan`;
  byId("productGrid").innerHTML = data
    .map(
      (p) => `
      <article class="product-card">
        <div class="thumb">${p.emoji}</div>
        <h4>${p.name}</h4>
        <p class="price">Rp ${format(p.price)}</p>
        <p class="meta">🏬 ${p.store}</p>
        <p class="meta">⭐ ${p.rating} • Terjual ${p.sold}</p>
        <button data-add="${p.id}">+ Tambah ke Keranjang</button>
      </article>
    `
    )
    .join("");

  document.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.add);
      const exists = state.cart.find((item) => item.id === id);
      if (exists) exists.qty += 1;
      else {
        const prod = products.find((p) => p.id === id);
        state.cart.push({ ...prod, qty: 1 });
      }
      syncCart();
    });
  });
}

function renderCart() {
  byId("cartItems").innerHTML = state.cart.length
    ? state.cart
        .map(
          (item) => `
          <div class="cart-item">
            <strong>${item.name}</strong>
            <p>${item.qty} x Rp ${format(item.price)}</p>
            <button data-remove="${item.id}">Hapus</button>
          </div>
        `
        )
        .join("")
    : "<p>Keranjang masih kosong.</p>";

  const totalItems = state.cart.reduce((n, item) => n + item.qty, 0);
  const subtotal = state.cart.reduce((n, item) => n + item.qty * item.price, 0);

  byId("cartCount").textContent = totalItems;
  byId("subtotal").textContent = `Rp ${format(subtotal)}`;

  document.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.cart = state.cart.filter((item) => item.id !== Number(btn.dataset.remove));
      syncCart();
    });
  });
}

function syncCart() {
  localStorage.setItem("cart", JSON.stringify(state.cart));
  renderCart();
}

function syncOrders() {
  localStorage.setItem("orders", JSON.stringify(state.orders));
}

function renderAdminOrders() {
  const adminList = byId("adminOrderList");
  if (!adminList) return;
  if (!state.orders.length) {
    adminList.innerHTML = "<p>Belum ada pembelian masuk.</p>";
    return;
  }

  adminList.innerHTML = state.orders
    .slice()
    .reverse()
    .map(
      (order) => `
        <article class="admin-order-item">
          <div class="admin-order-head">
            <strong>${order.code}</strong>
            <span class="order-status ${order.status}">${order.statusLabel}</span>
          </div>
          <p><strong>Penerima:</strong> ${order.customerName}</p>
          <p><strong>Alamat:</strong> ${order.address}</p>
          <p><strong>Pembayaran:</strong> ${order.payment}</p>
          <p><strong>Total:</strong> Rp ${format(order.total)}</p>
          <p><strong>Item:</strong> ${order.items.map((item) => `${item.name} (${item.qty})`).join(", ")}</p>
          ${
            order.status === "pending"
              ? `<div class="admin-order-actions">
                  <button data-confirm="${order.code}" class="admin-confirm">Konfirmasi</button>
                  <button data-reject="${order.code}" class="admin-reject">Tolak</button>
                </div>`
              : ""
          }
        </article>
      `
    )
    .join("");

  document.querySelectorAll("[data-confirm]").forEach((btn) => {
    btn.addEventListener("click", () => updateOrderStatus(btn.dataset.confirm, "confirmed"));
  });

  document.querySelectorAll("[data-reject]").forEach((btn) => {
    btn.addEventListener("click", () => updateOrderStatus(btn.dataset.reject, "rejected"));
  });
}

function updateOrderStatus(orderCode, status) {
  const order = state.orders.find((item) => item.code === orderCode);
  if (!order) return;
  order.status = status;
  order.statusLabel = status === "confirmed" ? "Terkonfirmasi" : "Ditolak";
  syncOrders();
  renderAdminOrders();
}

function openAdminPanel() {
  if (!state.adminSession) {
    byId("adminLoginDialog").showModal();
    return;
  }
  renderAdminOrders();
  byId("adminPanelDialog").showModal();
}

function initEvents() {
  byId("searchInput").addEventListener("input", (e) => {
    state.query = e.target.value.toLowerCase();
    renderProducts();
  });

  byId("sortSelect").addEventListener("change", (e) => {
    state.sort = e.target.value;
    renderProducts();
  });

  const minPrice = byId("minPrice");
  const maxPrice = byId("maxPrice");

  function syncPrice() {
    if (Number(minPrice.value) > Number(maxPrice.value)) {
      [minPrice.value, maxPrice.value] = [maxPrice.value, minPrice.value];
    }
    state.minPrice = Number(minPrice.value);
    state.maxPrice = Number(maxPrice.value);
    byId("minVal").textContent = format(state.minPrice);
    byId("maxVal").textContent = format(state.maxPrice);
    renderProducts();
  }

  minPrice.addEventListener("input", syncPrice);
  maxPrice.addEventListener("input", syncPrice);

  byId("ratingFilter").addEventListener("input", (e) => {
    state.rating = Number(e.target.value);
    byId("ratingVal").textContent = state.rating;
    renderProducts();
  });

  byId("cartToggle").addEventListener("click", () => byId("cartDrawer").classList.remove("hidden"));
  byId("closeCart").addEventListener("click", () => byId("cartDrawer").classList.add("hidden"));

  const dialog = byId("checkoutDialog");
  byId("checkoutBtn").addEventListener("click", () => {
    if (!state.cart.length) return alert("Keranjang masih kosong.");
    dialog.showModal();
  });

  byId("checkoutForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const order = {
      code: `INV-${Date.now()}`,
      customerName: String(formData.get("name") ?? ""),
      address: String(formData.get("address") ?? ""),
      payment: String(formData.get("payment") ?? ""),
      items: state.cart.map((item) => ({ id: item.id, name: item.name, qty: item.qty, price: item.price })),
      total: state.cart.reduce((n, item) => n + item.qty * item.price, 0),
      status: "pending",
      statusLabel: "Menunggu Konfirmasi Admin",
    };
    state.orders.push(order);
    syncOrders();
    alert("Pesanan berhasil dibuat! Pesanan Anda menunggu konfirmasi admin marketplace.");
    state.cart = [];
    syncCart();
    dialog.close();
    e.target.reset();
  });

  byId("adminToggle").addEventListener("click", openAdminPanel);

  byId("adminLoginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    if (email === adminAccount.email && password === adminAccount.password) {
      state.adminSession = true;
      localStorage.setItem("adminSession", "active");
      byId("adminLoginDialog").close();
      e.target.reset();
      openAdminPanel();
      return;
    }
    alert("Email atau password admin salah.");
  });

  byId("adminLogoutBtn").addEventListener("click", () => {
    state.adminSession = false;
    localStorage.removeItem("adminSession");
    byId("adminPanelDialog").close();
    alert("Admin berhasil logout.");
  });

  byId("closeAdminPanel").addEventListener("click", () => byId("adminPanelDialog").close());
}

setupFilters();
initEvents();
renderProducts();
renderCart();
