document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'вход.html';
        return;
    }

    // Заполнение данных пользователя
    document.getElementById('userName').value = user.name || '';
    document.getElementById('userEmail').value = user.email || '';
    document.getElementById('userPhone').value = user.phone || '';
    document.getElementById('userRole').value = user.role === 'admin' ? 'Администратор' : 'Пользователь';

    // Кнопки управления
    document.getElementById('saveChangesBtn')?.addEventListener('click', saveUserData);
    document.getElementById('logoutBtn')?.addEventListener('click', logout);

    // Загрузка истории заказов
    loadOrderHistory();
});

function saveUserData() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const updatedUser = {
        ...user,
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        phone: document.getElementById('userPhone').value
    };

    // Обновление данных
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Обновление в списке пользователей
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const index = users.findIndex(u => u.phone === user.phone);
    if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
    }

    alert('Данные сохранены!');
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'вход.html';
}

function loadOrderHistory() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const container = document.getElementById('orderHistoryContainer');

    if (!container) return;

    const userOrders = orders.filter(order => 
        order.email === user.email || order.phone === user.phone
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    if (userOrders.length === 0) {
        container.innerHTML = `
            <div class="no-orders">
                <i class="fas fa-box-open"></i>
                <h3>У вас пока нет заказов</h3>
                <p>После оформления заказа вы сможете отслеживать его здесь</p>
                <a href="каталог.html" class="btn">Перейти в каталог</a>
            </div>
        `;
        return;
    }

    container.innerHTML = userOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h4>Заказ №${order.orderNumber}</h4>
                <span class="status ${getStatusClass(order.status)}">${order.status}</span>
            </div>
            <div class="order-details">
                <p><strong>Дата:</strong> ${formatDate(order.date)}</p>
                <p><strong>Сумма:</strong> ${order.total.toLocaleString('ru-RU')} ₽</p>
                <p><strong>Адрес:</strong> ${order.address || 'Не указан'}</p>
            </div>
            <div class="order-products">
                ${order.items.map(item => `
                    <div class="product">
                        <img src="${item.image || 'images/placeholder.png'}" alt="${item.name}" style="width: 100px; height: auto;">
                        <div>
                            <h5>${item.name}</h5>
                            <p>${item.quantity} × ${item.price.toLocaleString('ru-RU')} ₽</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-actions">
                <button onclick="repeatOrder('${order.orderNumber}')" class="btn">
                    <i class="fas fa-redo"></i> Повторить
                </button>
                ${order.status === 'Обрабатывается' ? `
                <button onclick="cancelOrder('${order.orderNumber}')" class="btn cancel">
                    <i class="fas fa-times"></i> Отменить
                </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Вспомогательные функции
function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

function getStatusClass(status) {
    const statusMap = {
        'Новый': 'new',
        'Обрабатывается': 'processing',
        'Доставлен': 'delivered',
        'Отменен': 'cancelled'
    };
    return statusMap[status] || '';
}

function repeatOrder(orderNumber) {
    const orders = JSON.parse(localStorage.getItem('orders'));
    const order = orders.find(o => o.orderNumber === orderNumber);
    if (order) {
        localStorage.setItem('cart', JSON.stringify(order.items));
        window.location.href = 'корзина.html';
    }
}

function cancelOrder(orderNumber) {
    if (!confirm('Вы уверены, что хотите отменить заказ?')) return;
    
    const orders = JSON.parse(localStorage.getItem('orders'));
    const order = orders.find(o => o.orderNumber === orderNumber);
    if (order) {
        order.status = 'Отменен';
        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrderHistory();
        alert('Заказ отменен');
    }
}