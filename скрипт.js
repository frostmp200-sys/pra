let isLogin = false;

function toggleForm() {
  isLogin = !isLogin;
  document.getElementById("formTitle").innerText = isLogin ? "Вход" : "Регистрация";
  document.querySelector("button").innerText = isLogin ? "Войти" : "Зарегистрироваться";
  document.querySelector(".switch").innerText = isLogin
    ? "Нет аккаунта? Зарегистрироваться"
    : "Уже есть аккаунт? Войти";

  // Показать/скрыть поля регистрации
  document.getElementById("name").style.display = isLogin ? "none" : "block";
  document.getElementById("email").style.display = isLogin ? "none" : "block";
  document.getElementById("confirmPassword").style.display = isLogin ? "none" : "block";
  document.getElementById("role").style.display = isLogin ? "none" : "block";
  clearError();
}

function showError(message) {
  document.getElementById("errorMessage").innerText = message;
}

function clearError() {
  document.getElementById("errorMessage").innerText = "";
}

function submitForm() {
  clearError();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const role = document.getElementById("role").value;

  const users = JSON.parse(localStorage.getItem("users") || "{}");

  if (isLogin) {
    if (!phone || !password) return showError("Введите номер телефона и пароль");

    if (!users[phone] || users[phone].password !== password)
      return showError("Неверные данные");

    localStorage.setItem("currentUser", JSON.stringify(users[phone]));
    window.location.href = "главная.html";
  } else {
    if (!name || !email || !phone || !password || !confirmPassword || !role)
      return showError("Пожалуйста, заполните все поля");

    if (!/^\+?[0-9\s\-]{7,15}$/.test(phone))
      return showError("Некорректный номер телефона");

    if (password.length < 6)
      return showError("Пароль должен быть не менее 6 символов");

    if (password !== confirmPassword)
      return showError("Пароли не совпадают");

    if (users[phone]) return showError("Пользователь с таким телефоном уже существует");

    users[phone] = { name, email, phone, password, role };
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(users[phone]));
    window.location.href = "главная.html";
  }
}



