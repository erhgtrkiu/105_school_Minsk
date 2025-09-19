/* ===========================================================
   script.js
   Главный файл логики сайта
   =========================================================== */

/* -----------------------------------------------------------
   ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
   ----------------------------------------------------------- */

let currentUser = null; // Текущий пользователь (объект или null)
let users = [];         // Список всех пользователей
let teacherRequests = []; // Заявки от учителей
let questions = [];     // Список вопросов
let answers = {};       // Ответы по вопросам
let theme = "light";    // Тема (light / dark)

/* -----------------------------------------------------------
   ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ DOM
   ----------------------------------------------------------- */

// Страницы
const pages = document.querySelectorAll(".page");

// Меню
const menuItems = document.querySelectorAll(".menu-item");

// Контейнер для отображения информации о пользователе
const userInfoEl = document.getElementById("user-info");

// Кнопки авторизации
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");

// Модалки
const authModal = document.getElementById("auth-modal");
const qaModal = document.getElementById("qa-modal");
const answerModal = document.getElementById("answer-modal");
const teacherRequestsModal = document.getElementById("teacher-requests-modal");
const teacherDetailModal = document.getElementById("teacher-detail-modal");

// Переводчик
const translatorInput = document.getElementById("translator-input");
const translateBtn = document.getElementById("translate-btn");
const translationResult = document.getElementById("translation-result");

// Тема
const themeToggle = document.getElementById("theme-toggle");

// Уведомления
const notificationArea = document.getElementById("notification-area");

// Бейдж уведомлений (QA)
const qaBadge = document.getElementById("qa-badge");

/* -----------------------------------------------------------
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
   ----------------------------------------------------------- */

// Показать уведомление (toast)
function showNotification(message, type = "info") {
    const note = document.createElement("div");
    note.classList.add("notification");
    note.textContent = message;

    if (type === "success") {
        note.style.background = "#1a7f37";
    }
    if (type === "error") {
        note.style.background = "#d33";
    }

    notificationArea.appendChild(note);

    setTimeout(() => {
        note.remove();
    }, 4000);
}

// Переключение страницы
function showPage(pageId) {
    pages.forEach(p => p.classList.remove("active"));
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add("active");
    }

    menuItems.forEach(item => item.classList.remove("active"));
    const activeItem = document.querySelector(`.menu-item[data-page="${pageId}"]`);
    if (activeItem) {
        activeItem.classList.add("active");
    }
}

// Сохранение данных в localStorage
function saveData() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("teacherRequests", JSON.stringify(teacherRequests));
    localStorage.setItem("questions", JSON.stringify(questions));
    localStorage.setItem("answers", JSON.stringify(answers));
    localStorage.setItem("theme", theme);
    if (currentUser) {
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
        localStorage.removeItem("currentUser");
    }
}

// Загрузка данных из localStorage
function loadData() {
    const u = localStorage.getItem("users");
    const r = localStorage.getItem("teacherRequests");
    const q = localStorage.getItem("questions");
    const a = localStorage.getItem("answers");
    const t = localStorage.getItem("theme");
    const cu = localStorage.getItem("currentUser");

    if (u) users = JSON.parse(u);
    if (r) teacherRequests = JSON.parse(r);
    if (q) questions = JSON.parse(q);
    if (a) answers = JSON.parse(a);
    if (t) theme = t;
    if (cu) currentUser = JSON.parse(cu);
}

// Применить тему
function applyTheme() {
    if (theme === "dark") {
        document.body.classList.add("dark");
        themeToggle.textContent = "☀️";
    } else {
        document.body.classList.remove("dark");
        themeToggle.textContent = "🌙";
    }
}

/* -----------------------------------------------------------
   АВТОРИЗАЦИЯ / РЕГИСТРАЦИЯ
   ----------------------------------------------------------- */

// Открыть модалку авторизации
function openAuthModal(mode = "login") {
    authModal.style.display = "flex";
    document.getElementById("auth-mode").value = mode;
}

// Закрыть модалку
function closeModal(modal) {
    modal.style.display = "none";
}

// Зарегистрировать пользователя
function registerUser(role, fullName, password) {
    if (role === "teacher") {
        // Заявка для учителя
        teacherRequests.push({ fullName, password });
        showNotification("Заявка отправлена администратору", "info");
    } else {
        // Ученик сразу регистрируется
        const newUser = { role, fullName, password };
        users.push(newUser);
        showNotification("Регистрация успешна", "success");
    }
    saveData();
}

// Войти
function loginUser(fullName, password) {
    if (fullName === "admin" && password === "admin") {
        currentUser = { role: "admin", fullName: "Администратор" };
        showNotification("Вы вошли как администратор", "success");
    } else {
        const user = users.find(u => u.fullName === fullName && u.password === password);
        if (user) {
            currentUser = user;
            showNotification(`Добро пожаловать, ${user.fullName}`, "success");
        } else {
            showNotification("Неверные данные", "error");
            return;
        }
    }
    saveData();
    updateUI();
}
/* ===========================================================
   ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
   =========================================================== */

// Обновить отображение интерфейса после входа / выхода
function updateUI() {
    if (currentUser) {
        // Скрыть кнопки входа и регистрации
        if (loginBtn) loginBtn.style.display = "none";
        if (registerBtn) registerBtn.style.display = "none";

        // Показать имя пользователя
        if (userInfoEl) userInfoEl.textContent = currentUser.fullName;

        // Админ видит вкладку заявок
        const teacherRequestsMenu = document.querySelector('[data-page="teacher-requests"]');
        if (teacherRequestsMenu) {
            teacherRequestsMenu.style.display = currentUser.role === "admin" ? "block" : "none";
        }
    } else {
        // Если нет пользователя — показать кнопки входа и регистрации
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (registerBtn) registerBtn.style.display = "inline-block";

        // Скрыть имя пользователя
        if (userInfoEl) userInfoEl.textContent = "";

        // Скрыть вкладку заявок
        const teacherRequestsMenu = document.querySelector('[data-page="teacher-requests"]');
        if (teacherRequestsMenu) {
            teacherRequestsMenu.style.display = "none";
        }
    }
}

/* ===========================================================
   ЗАЯВКИ УЧИТЕЛЕЙ (ДЛЯ АДМИНА)
   =========================================================== */

// Показать заявки
function renderTeacherRequests() {
    const container = document.getElementById("teacher-requests-list");
    if (!container) return;

    container.innerHTML = "";

    if (teacherRequests.length === 0) {
        container.innerHTML = "<p>Нет заявок</p>";
        return;
    }

    teacherRequests.forEach((req, index) => {
        const item = document.createElement("div");
        item.classList.add("request-item");

        const info = document.createElement("div");
        info.classList.add("request-info");
        info.textContent = `${req.fullName} (${req.password})`;

        const actions = document.createElement("div");
        actions.classList.add("request-actions");

        const approveBtn = document.createElement("button");
        approveBtn.classList.add("request-approve");
        approveBtn.textContent = "Принять";
        approveBtn.addEventListener("click", () => approveTeacher(index));

        const denyBtn = document.createElement("button");
        denyBtn.classList.add("request-deny");
        denyBtn.textContent = "Отклонить";
        denyBtn.addEventListener("click", () => denyTeacher(index));

        actions.appendChild(approveBtn);
        actions.appendChild(denyBtn);

        item.appendChild(info);
        item.appendChild(actions);

        container.appendChild(item);
    });
}

// Принять учителя
function approveTeacher(index) {
    const req = teacherRequests[index];
    const newTeacher = {
        role: "teacher",
        fullName: req.fullName,
        password: req.password
    };
    users.push(newTeacher);
    teacherRequests.splice(index, 1);

    saveData();
    renderTeacherRequests();
    showNotification(`Учитель ${req.fullName} принят`, "success");
}

// Отклонить учителя
function denyTeacher(index) {
    const req = teacherRequests[index];
    teacherRequests.splice(index, 1);

    saveData();
    renderTeacherRequests();
    showNotification(`Заявка от ${req.fullName} отклонена`, "error");
}

/* ===========================================================
   КАРТОЧКИ УЧИТЕЛЕЙ
   =========================================================== */

function renderTeachers() {
    const container = document.getElementById("teacher-list");
    if (!container) return;

    container.innerHTML = "";

    const teachers = users.filter(u => u.role === "teacher");

    if (teachers.length === 0) {
        container.innerHTML = "<p>Учителей пока нет</p>";
        return;
    }

    teachers.forEach((teacher, index) => {
        const card = document.createElement("div");
        card.classList.add("teacher-card");

        const photo = document.createElement("img");
        photo.classList.add("teacher-photo");
        photo.src = teacher.photo || "https://via.placeholder.com/200x180";
        photo.alt = teacher.fullName;

        const name = document.createElement("h3");
        name.textContent = teacher.fullName;

        const subject = document.createElement("p");
        subject.textContent = teacher.subject || "Предмет не указан";

        card.appendChild(photo);
        card.appendChild(name);
        card.appendChild(subject);

        card.addEventListener("click", () => openTeacherDetail(teacher));

        container.appendChild(card);
    });
}

/* ===========================================================
   ДЕТАЛИ УЧИТЕЛЯ
   =========================================================== */

function openTeacherDetail(teacher) {
    if (!teacherDetailModal) return;

    teacherDetailModal.style.display = "flex";

    const photo = teacherDetailModal.querySelector(".teacher-detail-photo");
    const name = teacherDetailModal.querySelector(".teacher-detail-name");
    const subject = teacherDetailModal.querySelector(".teacher-detail-subject");
    const experience = teacherDetailModal.querySelector(".teacher-detail-experience");

    if (photo) photo.src = teacher.photo || "https://via.placeholder.com/100";
    if (name) name.textContent = teacher.fullName;
    if (subject) subject.textContent = teacher.subject || "Предмет не указан";
    if (experience) experience.textContent = teacher.experience || "Опыт не указан";
}
/* ===========================================================
   ВОПРОСЫ-ОТВЕТЫ
   =========================================================== */

// Добавить новый вопрос
function addQuestion(text) {
    if (!currentUser) {
        showNotification("Войдите, чтобы задать вопрос", "error");
        return;
    }

    const question = {
        id: Date.now(),
        text,
        author: currentUser.fullName,
        role: currentUser.role,
        createdAt: new Date().toLocaleString()
    };

    questions.push(question);
    saveData();
    renderQuestions();
    updateQABadge();
    showNotification("Вопрос добавлен", "success");
}

// Показать список вопросов
function renderQuestions() {
    const container = document.getElementById("qa-list");
    if (!container) return;

    container.innerHTML = "";

    if (questions.length === 0) {
        container.innerHTML = "<p>Пока нет вопросов</p>";
        return;
    }

    questions.forEach(q => {
        const card = document.createElement("div");
        card.classList.add("question-card");

        const text = document.createElement("div");
        text.classList.add("question-text");
        text.textContent = q.text;

        const meta = document.createElement("div");
        meta.classList.add("question-meta");
        meta.textContent = `${q.author} (${q.role}), ${q.createdAt}`;

        card.appendChild(text);
        card.appendChild(meta);

        // Ответы
        if (answers[q.id]) {
            const answerBlock = document.createElement("div");
            answerBlock.classList.add("answer-block");
            answerBlock.textContent = answers[q.id].text;
            card.appendChild(answerBlock);
        } else {
            // Кнопки для учителей и админа
            if (currentUser && (currentUser.role === "teacher" || currentUser.role === "admin")) {
                const actions = document.createElement("div");
                actions.classList.add("answer-actions");

                const btn = document.createElement("button");
                btn.textContent = "Ответить";
                btn.addEventListener("click", () => openAnswerModal(q.id));

                actions.appendChild(btn);
                card.appendChild(actions);
            }
        }

        container.appendChild(card);
    });
}

// Открыть модалку ответа
let currentAnswerQuestionId = null;
function openAnswerModal(questionId) {
    if (!currentUser) {
        showNotification("Нет доступа", "error");
        return;
    }
    currentAnswerQuestionId = questionId;
    answerModal.style.display = "flex";
}

// Сохранить ответ
function saveAnswer(text) {
    if (!currentUser || (currentUser.role !== "teacher" && currentUser.role !== "admin")) {
        showNotification("Только учителя и администратор могут отвечать", "error");
        return;
    }
    if (!currentAnswerQuestionId) return;

    answers[currentAnswerQuestionId] = {
        text,
        author: currentUser.fullName,
        createdAt: new Date().toLocaleString()
    };

    currentAnswerQuestionId = null;
    saveData();
    renderQuestions();
    updateQABadge();
    showNotification("Ответ сохранён", "success");
    closeModal(answerModal);
}

/* ===========================================================
   БЕЙДЖ УВЕДОМЛЕНИЙ (ВОПРОСЫ)
   =========================================================== */

function updateQABadge() {
    if (!qaBadge) return;

    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
        qaBadge.style.display = "inline-flex";
        qaBadge.textContent = unanswered.length;
    } else {
        qaBadge.style.display = "none";
    }
}
/* ===========================================================
   ПЕРЕВОДЧИК (РУССКИЙ → КИТАЙСКИЙ)
   -----------------------------------------------------------
   Использует Google Translate API для перевода текста
   + библиотеку pinyin-pro для отображения пиньиня.
   =========================================================== */

// Ключ для Google Translate API (замени на свой!)
const GOOGLE_API_KEY = "YOUR_API_KEY_HERE";

// Функция перевода текста
async function translateText(text) {
    const resultContainer = document.getElementById("translation-result");
    if (!resultContainer) return;

    resultContainer.innerHTML = "";

    if (!text.trim()) {
        resultContainer.innerHTML = "<p>Введите текст для перевода</p>";
        return;
    }

    try {
        // Запрос к Google Translate API
        const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                q: text,
                source: "ru",
                target: "zh-CN",
                format: "text"
            })
        });

        const data = await response.json();

        if (!data.data || !data.data.translations) {
            throw new Error("Ошибка перевода");
        }

        // Получаем перевод (китайские иероглифы)
        const hanzi = data.data.translations[0].translatedText;

        // Конвертируем в пиньинь через библиотеку pinyin-pro
        // Для этого подключи <script src="https://unpkg.com/pinyin-pro"></script> в index.html
        const pinyin = window.pinyinPro ? window.pinyinPro.pinyin(hanzi, { toneType: "marks" }) : "需要库 pinyin-pro";

        // Формируем вывод
        const hanziEl = document.createElement("p");
        hanziEl.textContent = `Иероглифы: ${hanzi}`;

        const pinyinEl = document.createElement("p");
        pinyinEl.textContent = `Пиньинь: ${pinyin}`;

        resultContainer.appendChild(hanziEl);
        resultContainer.appendChild(pinyinEl);

    } catch (err) {
        console.error(err);
        resultContainer.innerHTML = "<p style='color:red;'>Ошибка перевода</p>";
    }
}

/* ===========================================================
   ПЕРЕКЛЮЧЕНИЕ ТЕМЫ
   =========================================================== */

function toggleTheme() {
    if (theme === "light") {
        theme = "dark";
    } else {
        theme = "light";
    }
    saveData();
    applyTheme();
}
/* ===========================================================
   ОБРАБОТКА СОБЫТИЙ
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Загрузка данных
    loadData();
    applyTheme();
    updateUI();
    renderTeacherRequests();
    renderTeachers();
    renderQuestions();
    updateQABadge();

    /* -------------------------------------------------------
       НАВИГАЦИЯ ПО СТРАНИЦАМ
       ------------------------------------------------------- */
    menuItems.forEach(item => {
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
    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    }

    /* -------------------------------------------------------
       КНОПКИ ВХОДА / РЕГИСТРАЦИИ
       ------------------------------------------------------- */
    if (loginBtn) {
        loginBtn.addEventListener("click", () => openAuthModal("login"));
    }

    if (registerBtn) {
        registerBtn.addEventListener("click", () => openAuthModal("register"));
    }

    /* -------------------------------------------------------
       МОДАЛКИ (ЗАКРЫТИЕ)
       ------------------------------------------------------- */
    document.querySelectorAll(".modal .close").forEach(btn => {
        btn.addEventListener("click", e => {
            const modal = e.target.closest(".modal");
            if (modal) closeModal(modal);
        });
    });

    window.addEventListener("click", e => {
        document.querySelectorAll(".modal").forEach(modal => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    /* -------------------------------------------------------
       ФОРМА АВТОРИЗАЦИИ
       ------------------------------------------------------- */
    const authForm = document.getElementById("auth-form");
    if (authForm) {
        authForm.addEventListener("submit", e => {
            e.preventDefault();

            const mode = document.getElementById("auth-mode").value;
            const role = document.getElementById("auth-role").value;
            const fullName = document.getElementById("auth-fullname").value.trim();
            const password = document.getElementById("auth-password").value.trim();

            if (!fullName || !password) {
                showNotification("Заполните все поля", "error");
                return;
            }

            if (mode === "register") {
                registerUser(role, fullName, password);
            } else {
                loginUser(fullName, password);
            }

            closeModal(authModal);
        });
    }

    /* -------------------------------------------------------
       ФОРМА ДОБАВЛЕНИЯ ВОПРОСА
       ------------------------------------------------------- */
    const questionForm = document.getElementById("question-form");
    if (questionForm) {
        questionForm.addEventListener("submit", e => {
            e.preventDefault();

            const input = document.getElementById("question-input");
            if (!input || !input.value.trim()) {
                showNotification("Введите вопрос", "error");
                return;
            }

            addQuestion(input.value.trim());
            input.value = "";
        });
    }

    /* -------------------------------------------------------
       ФОРМА ОТВЕТА
       ------------------------------------------------------- */
    const answerForm = document.getElementById("answer-form");
    if (answerForm) {
        answerForm.addEventListener("submit", e => {
            e.preventDefault();

            const input = document.getElementById("answer-input");
            if (!input || !input.value.trim()) {
                showNotification("Введите ответ", "error");
                return;
            }

            saveAnswer(input.value.trim());
            input.value = "";
        });
    }

    /* -------------------------------------------------------
       КНОПКА ПЕРЕВОДЧИКА
       ------------------------------------------------------- */
    if (translateBtn) {
        translateBtn.addEventListener("click", () => {
            const text = translatorInput.value;
            translateText(text);
        });
    }
});
/* ===========================================================
   ВЫХОД ИЗ АККАУНТА
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
    loadData();
    applyTheme();
    updateUI();
    renderTeacherRequests();
    renderTeachers();
    renderQuestions();
    updateQABadge();

    if (currentUser) {
        showNotification(`С возвращением, ${currentUser.fullName}`, "success");
    } else {
        showNotification("Добро пожаловать! Пожалуйста, войдите или зарегистрируйтесь", "info");
    }
}

/* ===========================================================
   ДОПОЛНИТЕЛЬНЫЕ УТИЛИТЫ
   =========================================================== */

// Генерация случайного ID (для групп, занятий и т. д.)
function generateId(prefix = "id") {
    return prefix + "_" + Math.random().toString(36).substr(2, 9);
}

// Добавить фейковые данные (для теста)
function seedData() {
    if (users.length === 0) {
        users.push({ role: "student", fullName: "Иван Петров", password: "1234" });
        users.push({ role: "teacher", fullName: "Ли Вэй", password: "1234", subject: "Китайский язык", experience: "5 лет" });
    }

    if (questions.length === 0) {
        questions.push({
            id: generateId("q"),
            text: "Что такое пиньинь?",
            author: "Иван Петров",
            role: "student",
            createdAt: new Date().toLocaleString()
        });
    }

    saveData();
}

// Очистить все данные (для отладки)
function clearAllData() {
    localStorage.clear();
    users = [];
    teacherRequests = [];
    questions = [];
    answers = {};
    currentUser = null;
    theme = "light";
    updateUI();
    renderTeachers();
    renderTeacherRequests();
    renderQuestions();
    updateQABadge();
    applyTheme();
    showNotification("Все данные очищены", "warning");
}

/* ===========================================================
   ЗАПУСК ПРИ ЗАГРУЗКЕ
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Загружаем данные и применяем интерфейс
    autoLogin();

    // Для теста можно добавить данные
    // seedData();

    // Кнопка выхода
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logoutUser);
    }
});
