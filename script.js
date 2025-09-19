/* ===========================================================
   ГЛОБАЛЬНЫЕ ДАННЫЕ
   =========================================================== */

// Пользователи
let users = JSON.parse(localStorage.getItem("users")) || [];

// Заявки на регистрацию учителей
let teacherRequests = JSON.parse(localStorage.getItem("teacherRequests")) || [];

// Текущий пользователь
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// Вопросы/ответы
let questions = JSON.parse(localStorage.getItem("questions")) || [];
let answers = JSON.parse(localStorage.getItem("answers")) || {};

// Тема
let theme = localStorage.getItem("theme") || "light";

/* ===========================================================
   СОХРАНЕНИЕ / ЗАГРУЗКА
   =========================================================== */

function saveData() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("teacherRequests", JSON.stringify(teacherRequests));
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    localStorage.setItem("questions", JSON.stringify(questions));
    localStorage.setItem("answers", JSON.stringify(answers));
    localStorage.setItem("theme", theme);
}

/* ===========================================================
   УПРАВЛЕНИЕ СТРАНИЦАМИ
   =========================================================== */

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const target = document.getElementById(pageId);
    if (target) {
        target.classList.add("active");
    }

    // Подсветка меню
    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.remove("active");
        if (item.getAttribute("data-page") === pageId) {
            item.classList.add("active");
        }
    });
}

/* ===========================================================
   УВЕДОМЛЕНИЯ
   =========================================================== */

function showNotification(message, type = "info") {
    const area = document.getElementById("notification-area");
    if (!area) return;

    const note = document.createElement("div");
    note.className = `notification ${type}`;
    note.textContent = message;

    area.appendChild(note);

    setTimeout(() => {
        note.remove();
    }, 4000);
}

/* ===========================================================
   ТЕМА
   =========================================================== */

function applyTheme() {
    if (theme === "dark") {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
}
/* ===========================================================
   РЕГИСТРАЦИЯ
   =========================================================== */

function registerUser(role, fullName, password) {
    if (!fullName || !password) {
        showNotification("Заполните все поля", "error");
        return;
    }

    // Проверяем, есть ли такой пользователь
    if (users.find(u => u.fullName === fullName)) {
        showNotification("Пользователь с таким именем уже существует", "error");
        return;
    }

    if (role === "teacher") {
        // Учителя попадают в заявки
        teacherRequests.push({ fullName, password });
        showNotification("Заявка отправлена администратору", "info");
    } else {
        // Ученик регистрируется сразу
        users.push({ role, fullName, password });
        showNotification("Регистрация успешна! Теперь войдите", "success");
    }

    saveData();
    renderTeacherRequests();
}

/* ===========================================================
   ВХОД
   =========================================================== */

function loginUser(fullName, password) {
    const user = users.find(u => u.fullName === fullName && u.password === password);

    if (user) {
        currentUser = user;
        saveData();
        updateUI();
        showNotification(`Добро пожаловать, ${user.fullName}`, "success");
        showPage("home");
    } else {
        // Проверим, может это заявка, которую ещё не приняли
        const request = teacherRequests.find(r => r.fullName === fullName && r.password === password);
        if (request) {
            showNotification("Ожидайте: ваша заявка ещё не рассмотрена администратором", "warning");
        } else {
            showNotification("Неверные данные для входа", "error");
        }
    }
}

/* ===========================================================
   ОБНОВЛЕНИЕ UI
   =========================================================== */

function updateUI() {
    const userInfo = document.getElementById("user-info");
    const loginBtn = document.getElementById("login-btn");
    const registerBtn = document.getElementById("register-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const requestsTab = document.querySelector('[data-page="teacher-requests"]');

    if (currentUser) {
        userInfo.textContent = currentUser.fullName;
        if (loginBtn) loginBtn.style.display = "none";
        if (registerBtn) registerBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";

        // Админ видит заявки
        if (currentUser.role === "admin" && requestsTab) {
            requestsTab.style.display = "inline-block";
        } else if (requestsTab) {
            requestsTab.style.display = "none";
        }
    } else {
        userInfo.textContent = "";
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (registerBtn) registerBtn.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "none";
        if (requestsTab) requestsTab.style.display = "none";
    }
}

/* ===========================================================
   РАБОТА С ЗАЯВКАМИ (АДМИН)
   =========================================================== */

function renderTeacherRequests() {
    const list = document.getElementById("teacher-requests-list");
    if (!list) return;
    list.innerHTML = "";

    if (teacherRequests.length === 0) {
        list.innerHTML = "<p>Нет заявок</p>";
        return;
    }

    teacherRequests.forEach((req, index) => {
        const item = document.createElement("div");
        item.className = "teacher-request";

        const info = document.createElement("p");
        info.textContent = `${req.fullName} (пароль: ${req.password})`;

        const approveBtn = document.createElement("button");
        approveBtn.textContent = "Принять";
        approveBtn.className = "btn";
        approveBtn.addEventListener("click", () => {
            // Превращаем заявку в учителя
            users.push({ role: "teacher", fullName: req.fullName, password: req.password });
            teacherRequests.splice(index, 1);
            saveData();
            renderTeacherRequests();
            showNotification("Учитель принят!", "success");
        });

        const rejectBtn = document.createElement("button");
        rejectBtn.textContent = "Отклонить";
        rejectBtn.className = "btn secondary";
        rejectBtn.addEventListener("click", () => {
            teacherRequests.splice(index, 1);
            saveData();
            renderTeacherRequests();
            showNotification("Заявка отклонена", "error");
        });

        item.appendChild(info);
        item.appendChild(approveBtn);
        item.appendChild(rejectBtn);
        list.appendChild(item);
    });
}
/* ===========================================================
   ВЫХОД
   =========================================================== */
function logoutUser() {
    currentUser = null;
    saveData();
    updateUI();
    showNotification("Вы вышли из аккаунта", "info");
    showPage("home");
}

/* ===========================================================
   АВТОЛОГИН ПРИ ЗАГРУЗКЕ
   =========================================================== */
function autoLogin() {
    applyTheme();
    updateUI();
    renderTeacherRequests();
}

/* ===========================================================
   ОБРАБОТЧИКИ СОБЫТИЙ
   =========================================================== */
document.addEventListener("DOMContentLoaded", () => {
    autoLogin();

    /* -------------------------------------------------------
       НАВИГАЦИЯ ПО СТРАНИЦАМ
       ------------------------------------------------------- */
    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", () => {
            const pageId = item.getAttribute("data-page");
            if (pageId) {
                showPage(pageId);
            }
        });
    });

    /* -------------------------------------------------------
       ТЕМА
       ------------------------------------------------------- */
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            theme = theme === "light" ? "dark" : "light";
            saveData();
            applyTheme();
        });
    }

    /* -------------------------------------------------------
       ВХОД / РЕГИСТРАЦИЯ
       ------------------------------------------------------- */
    const loginBtn = document.getElementById("login-btn");
    const registerBtn = document.getElementById("register-btn");
    const authModal = document.getElementById("auth-modal");

    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            if (authModal) authModal.style.display = "block";
            document.getElementById("auth-mode").value = "login";
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener("click", () => {
            if (authModal) authModal.style.display = "block";
            document.getElementById("auth-mode").value = "register";
        });
    }

    if (authModal) {
        const closeBtn = authModal.querySelector(".close");
        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                authModal.style.display = "none";
            });
        }

        window.addEventListener("click", e => {
            if (e.target === authModal) {
                authModal.style.display = "none";
            }
        });
    }

    const authForm = document.getElementById("auth-form");
    if (authForm) {
        authForm.addEventListener("submit", e => {
            e.preventDefault();

            const mode = document.getElementById("auth-mode").value;
            const role = document.getElementById("auth-role").value;
            const fullName = document.getElementById("auth-fullname").value.trim();
            const password = document.getElementById("auth-password").value.trim();

            if (mode === "register") {
                registerUser(role, fullName, password);
            } else {
                loginUser(fullName, password);
            }

            authModal.style.display = "none";
        });
    }

    /* -------------------------------------------------------
       ВЫХОД
       ------------------------------------------------------- */
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logoutUser);
    }
});
