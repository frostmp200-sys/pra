document.addEventListener('DOMContentLoaded', function() {
    // Проверка прав администратора
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'admin') {
        alert('Доступ запрещен!');
        window.location.href = 'вход.html';
        return;
    }

    // Инициализация вкладок
    initTabs();

    // Отрисовка пользователей и заказов
    renderUsers();
    renderOrders();

    // Кнопка выхода
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'вход.html';
    });

    // Поиск пользователей: клик по кнопке и Enter в поле
    document.getElementById('searchUserBtn').addEventListener('click', searchUsers);
    document.getElementById('userSearch').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') searchUsers();
    });

    // Фильтрация заказов по кнопке
    document.getElementById('applyFiltersBtn').addEventListener('click', renderOrders);
});

function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Снимаем active со всех вкладок и контентов
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Добавляем актив текущей кнопке и нужному контенту
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab') + 'Tab';
            document.getElementById(tabId).classList.add('active');
        });
    });
}

function renderUsers(searchTerm = '') {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const usersList = document.getElementById('usersList');

    const usersArray = Object.values(users);

    const filteredUsers = usersArray.filter(user => {
        if (!user) return false;
        const searchLower = searchTerm.toLowerCase();
        const name = (user.name || '').toLowerCase();
        const phone = (user.phone || '').toLowerCase();
        return name.includes(searchLower) || phone.includes(searchLower);
    });

    if (filteredUsers.length === 0) {
        usersList.innerHTML = '<p>Пользователи не найдены</p>';
        return;
    }

    usersList.innerHTML = filteredUsers.map(user => `
        <div class="user-card">
            <div class="user-info">
                <h3>${user.name}</h3>
                <p><i class="fas fa-phone"></i> ${user.phone}</p>
                <p><i class="fas fa-envelope"></i> ${user.email}</p>
                <p><i class="fas fa-user-tag"></i> ${user.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                <p><i class="fas fa-calendar-alt"></i> ${new Date(user.registrationDate).toLocaleDateString()}</p>
            </div>
            <div class="user-stats">
                <p>Заказов: ${getUserOrderCount(user.phone)}</p>
                <p>Общая сумма: ${getUserTotalSpent(user.phone).toLocaleString()} руб.</p>
            </div>
        </div>
    `).join('');
}


function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value.trim();
    renderUsers(searchTerm);
}

function renderOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const statusFilter = document.getElementById('orderStatusFilter').value;
    const dateFilter = document.getElementById('orderDateFilter').value;
    const ordersList = document.getElementById('ordersList');

    let filteredOrders = orders;

    if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }

    if (dateFilter) {
        const filterDate = new Date(dateFilter).setHours(0, 0, 0, 0);
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.date).setHours(0, 0, 0, 0);
            return orderDate === filterDate;
        });
    }

    if (filteredOrders.length === 0) {
        ordersList.innerHTML = '<p>Заказы не найдены</p>';
        return;
    }

    filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h3>Заказ #${order.orderNumber}</h3>
                <span class="status-badge ${getStatusClass(order.status)}">${order.status}</span>
            </div>
            <div class="order-details">
                <p><strong>Клиент:</strong> ${order.name} (${order.phone})</p>
                <p><strong>Дата:</strong> ${order.date}</p>
                <p><strong>Адрес:</strong> ${order.address || 'Не указан'}</p>
                <p><strong>Способ оплаты:</strong> ${order.payment || 'Не указан'}</p>
                <p><strong>Товары:</strong></p>
                <ul class="order-items">
                    ${order.items.map(item => `
                        <li>${item.name} - ${item.quantity} шт. × ${item.price.toLocaleString()} руб.</li>
                    `).join('')}
                </ul>
                <p class="order-total"><strong>Итого:</strong> ${order.total.toLocaleString()} руб.</p>
            </div>
            <div class="order-actions">
                <select class="status-select" data-order="${order.orderNumber}">
                    <option value="Новый" ${order.status === 'Новый' ? 'selected' : ''}>Новый</option>
                    <option value="В обработке" ${order.status === 'В обработке' ? 'selected' : ''}>В обработке</option>
                    <option value="Отправлен" ${order.status === 'Отправлен' ? 'selected' : ''}>Отправлен</option>
                    <option value="Доставлен" ${order.status === 'Доставлен' ? 'selected' : ''}>Доставлен</option>
                    <option value="Отменен" ${order.status === 'Отменен' ? 'selected' : ''}>Отменен</option>
                </select>
                <button class="update-status-btn" data-order="${order.orderNumber}">Обновить</button>
            </div>
        </div>
    `).join('');

    // Обработчики обновления статуса заказа
    document.querySelectorAll('.update-status-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const orderNumber = this.getAttribute('data-order');
            const select = document.querySelector(`.status-select[data-order="${orderNumber}"]`);
            updateOrderStatus(orderNumber, select.value);
        });
    });
}

function updateOrderStatus(orderNumber, newStatus) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const idx = orders.findIndex(o => o.orderNumber === orderNumber);
    if (idx !== -1) {
        orders[idx].status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));
        renderOrders();
        alert(`Статус заказа №${orderNumber} изменён на "${newStatus}"`);
    }
}

function getUserOrderCount(phone) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders.filter(order => order.phone === phone).length;
}

function getUserTotalSpent(phone) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return orders.filter(order => order.phone === phone).reduce((sum, order) => sum + order.total, 0);
}

function getStatusClass(status) {
    const classes = {
        'Новый': 'status-new',
        'В обработке': 'status-processing',
        'Отправлен': 'status-shipped',
        'Доставлен': 'status-delivered',
        'Отменен': 'status-cancelled'
    };
    return classes[status] || '';
}
