const cart = {
  items: JSON.parse(localStorage.getItem('cart')) || [],

  save() {
    localStorage.setItem('cart', JSON.stringify(this.items));
    this.renderCart();
    this.updateCounter();
  },

  add(product) {
    const existing = this.items.find(item => item.id == product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.items.push({ ...product, quantity: 1 });
    }
    this.save();
  },

  remove(id) {
    this.items = this.items.filter(item => item.id != id);
    this.save();
  },

  updateQuantity(id, quantity) {
    const item = this.items.find(item => item.id == id);
    if (item) {
      item.quantity = quantity;
      this.save();
    }
  },

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  updateCounter() {
    const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
  },

  renderCart() {
    const container = document.querySelector('.cart-container');
    const emptyCart = document.querySelector('.empty-cart');
    const cartBody = document.querySelector('.cart-items');
    const totalPriceEl = document.querySelector('.total-price');

    if (this.items.length === 0) {
      if (container) container.style.display = 'none';
      if (emptyCart) emptyCart.style.display = 'block';
      return;
    }

    if (container) container.style.display = 'block';
    if (emptyCart) emptyCart.style.display = 'none';

    if (cartBody) {
      cartBody.innerHTML = this.items.map(item => `
        <div class="cart-item">
          <img src="${item.image || 'images/placeholder.png'}" alt="${item.name}" style="width: 100px; height: auto;">
          <div class="item-info">
            <h3>${item.name}</h3>
            <p>${item.price.toLocaleString('ru-RU')} ₽ × ${item.quantity}</p>
          </div>
          <div class="item-actions">
            <button class="quantity-btn minus" data-id="${item.id}">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn plus" data-id="${item.id}">+</button>
            <button class="remove-btn" data-id="${item.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <div class="item-total">
            ${(item.price * item.quantity).toLocaleString('ru-RU')} ₽
          </div>
        </div>
      `).join('');
    }

    if (totalPriceEl) {
      totalPriceEl.textContent = `${this.getTotal().toLocaleString('ru-RU')} ₽`;
    }
  }
};

// Инициализация корзины
document.addEventListener('DOMContentLoaded', () => {
  cart.renderCart();
  cart.updateCounter();

  // Проверка авторизации при оформлении заказа
  document.querySelector('.checkout-btn')?.addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
      alert('Для оформления заказа войдите в систему');
      window.location.href = 'вход.html';
      return;
    }
    if (cart.items.length === 0) {
      alert('Корзина пуста');
      return;
    }
    window.location.href = 'форма.html';
  });
});

// Обработчики событий
document.addEventListener('click', (e) => {
  if (e.target.closest('.remove-btn')) {
    const id = e.target.closest('.remove-btn').dataset.id;
    cart.remove(id);
  }
  
  if (e.target.closest('.quantity-btn')) {
    const btn = e.target.closest('.quantity-btn');
    const id = btn.dataset.id;
    const item = cart.items.find(item => item.id == id);
    
    if (btn.classList.contains('plus')) {
      cart.updateQuantity(id, item.quantity + 1);
    } else if (btn.classList.contains('minus') && item.quantity > 1) {
      cart.updateQuantity(id, item.quantity - 1);
    }
  }
});