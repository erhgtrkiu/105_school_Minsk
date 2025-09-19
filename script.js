// === SCHOOL PORTAL SCRIPT ===
// Версия расширенная (>1100 строк), с исправлениями по запросу:
// 1. Админ может управлять
// 2. Есть окно заявок учителей
// 3. Значок при смене темы меняется
// 4. Учителя и админ могут отвечать на вопросы
// 5. После входа видно ФИО, а не "Войти/Регистрация"
// 6. Переводчик через нейросеть (псевдо-заглушка + серверный вызов)
// 7. Ночная тема фиксирует видимость занятий
// 8. Бейдж вопросов не ломает верстку
// 9. Hero для гостей (с кнопками входа/регистрации)
// 10. Фото учителей + модалки и редактирование админом

document.addEventListener("DOMContentLoaded", () => {
    // ============================
    // === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
    // ============================

    let currentUser = null;             // текущий пользователь
    let currentWeek = 1;                // неделя расписания
    let currentGroup = null;            // активная группа
    let unansweredQuestions = 0;        // счетчик вопросов без ответа
    let currentQuestionId = null;       // id вопроса для ответа

    // База пользователей (login: {password, role, name, approved})
    const usersDatabase = {
        "admin": {
            password: "admin123",
            role: "admin",
            name: "Администратор",
            approved: true
        }
    };

    // Заявки учителей (ожидают решения администратора)
    const teacherRequests = [];

    // Основные данные приложения
    const appData = {
        questions: [],
        students: [
            { id: 1, name: "Иван Иванов", group: "A" },
            { id: 2, name: "Мария Петрова", group: "A" },
            { id: 3, name: "Алексей Смирнов", group: "B" },
            { id: 4, name: "Анна Сидорова", group: "B" }
        ],
        teachers: [
            { id: 1, name: "Ли Хуа", subject: "Китайский язык", experience: "10 лет", photo: "" },
            { id: 2, name: "Чжан Вэй", subject: "Китайская культура", experience: "7 лет", photo: "" }
        ],
        groups: {
            A: { name: "Группа А", students: [1, 2], teacher: 1 },
            B: { name: "Группа B", students: [3, 4], teacher: 2 }
        },
        schedule: {
            1: [
                { day: "Понедельник", time: "10:00", group: "A", subject: "Китайский язык", teacher: "Ли Хуа" },
                { day: "Среда", time: "12:00", group: "B", subject: "Культура Китая", teacher: "Чжан Вэй" }
            ],
            2: [
                { day: "Понедельник", time: "12:00", group: "A", subject: "Иероглифика", teacher: "Ли Хуа" },
                { day: "Четверг", time: "14:00", group: "B", subject: "Разговорный китайский", teacher: "Чжан Вэй" }
            ]
        },
        extraLessons: [
            { id: 1, title: "Каллиграфия", desc: "Изучение китайской каллиграфии", time: "Пятница 16:00" },
            { id: 2, title: "Китайская кухня", desc: "Приготовление традиционных блюд", time: "Суббота 12:00" }
        ],
        chineseFacts: [
            "Великая китайская стена видна из космоса",
            "Китай — родина бумаги и пороха",
            "Китайский язык — один из самых сложных в мире",
            "В Китае более 1,4 миллиарда жителей",
            "Праздник Весны — главный праздник Китая"
        ],
        holidays: {
            "2025-01-28": "Китайский Новый год",
            "2025-02-15": "Праздник фонарей",
            "2025-04-05": "Цинмин",
            "2025-06-10": "Праздник драконьих лодок",
            "2025-09-15": "Праздник середины осени",
            "2025-10-01": "День образования КНР"
        }
    };

    // ============================
    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
    // ============================

    // Escaping HTML для безопасности
    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, s =>
            ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s])
        );
    }

    // ============================
    // === ИНИЦИАЛИЗАЦИЯ APP ===
    // ============================

    function initApp() {
        // Загружаем данные
        loadAllData();

        // Навешиваем обработчики событий
        initEventListeners();

        // Отрисовываем страницы
        initData();

        // Проверяем праздники
        checkHolidays();

        // Показываем факт
        showRandomFact();

        // Загружаем тему
        loadTheme();

        // Автоматический вход
        checkAutoLogin();

        // Первая страница — Учителя
        changePage("teachers");
        document.querySelector('.menu-item[data-page="teachers"]').classList.add("active");

        // Анимация появления
        document.body.style.opacity = 0;
        setTimeout(() => {
            document.body.style.transition = "opacity 0.5s ease-in";
            document.body.style.opacity = 1;
        }, 100);

        // Обновляем UI пользователя
        updateUIForUser();
    }

    // ================================
    // === НАВЕШИВАНИЕ ОБРАБОТЧИКОВ ===
    // ================================

    function initEventListeners() {
        // Переключение страниц
        document.querySelectorAll(".menu-item[data-page]").forEach(item => {
            item.addEventListener("click", () => {
                changePage(item.dataset.page);
                document.querySelectorAll(".menu-item").forEach(el => el.classList.remove("active"));
                item.classList.add("active");
            });
        });

        // Переключение темы
        document.getElementById("theme-toggle").addEventListener("click", toggleTheme);

        // Вопрос-ответ
        document.getElementById("qa-button").addEventListener("click", () => {
            showModal(document.getElementById("qa-modal"));
            renderQuestions();
            unansweredQuestions = 0;
            updateNotificationBadge();
        });

        document.getElementById("send-question").addEventListener("click", sendQuestion);

        // Закрытие модалок
        document.querySelectorAll(".close").forEach(btn => {
            btn.addEventListener("click", () => {
                btn.closest(".modal").style.display = "none";
            });
        });

        // Авторизация
        document.getElementById("login-btn")?.addEventListener("click", () => {
            if (currentUser) {
                logout();
            } else {
                showModal(document.getElementById("auth-modal"));
                switchAuthTab("login");
            }
        });

        document.getElementById("register-btn")?.addEventListener("click", () => {
            showModal(document.getElementById("auth-modal"));
            switchAuthTab("register");
        });

        document.getElementById("login-submit").addEventListener("click", login);
        document.getElementById("register-submit").addEventListener("click", register);

        document.querySelectorAll(".tab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
                btn.classList.add("active");
                switchAuthTab(btn.dataset.tab);
            });
        });

        // Недели расписания
        document.getElementById("prev-week").addEventListener("click", () => changeWeek(-1));
        document.getElementById("next-week").addEventListener("click", () => changeWeek(1));

        // Переводчик
        document.getElementById("translate-btn").addEventListener("click", () => {
            translateText();
        });

        // Заявки учителей — кнопка в меню админа
        document.getElementById("view-requests")?.addEventListener("click", () => {
            if (!checkAdminAccess()) return;
            showModal(document.getElementById("teacher-requests-modal"));
            renderTeacherRequests();
        });
    }
    // ===============================
    // === ИНИЦИАЛИЗАЦИЯ СТРАНИЦ ===
    // ===============================

    function initData() {
        initTeachers();
        initStudents();
        initGroupsPage();
        renderSchedule();
        renderExtraLessons();
    }

    // === Учителя ===
    function initTeachers() {
        const list = document.querySelector(".teacher-list");
        list.innerHTML = "";

        appData.teachers.forEach((t, idx) => {
            const card = document.createElement("div");
            card.className = "teacher-card";

            const photoUrl = t.photo && t.photo.length > 0 ? t.photo : "placeholder-teacher.png";

            card.innerHTML = `
                <img src="${escapeHtml(photoUrl)}" class="teacher-photo" data-idx="${idx}" alt="Фото ${escapeHtml(t.name)}">
                <div class="teacher-info">
                    <h3>${escapeHtml(t.name)}</h3>
                    <p>${escapeHtml(t.subject)}</p>
                    <p>Стаж: ${escapeHtml(t.experience)}</p>
                </div>
            `;

            // обработчик клика на фото
            card.querySelector(".teacher-photo").addEventListener("click", (e) => {
                const i = +e.currentTarget.getAttribute("data-idx");
                openTeacherDetail(i);
            });

            list.appendChild(card);
        });
    }

    // === Ученики ===
    function initStudents() {
        const list = document.querySelector(".student-list");
        list.innerHTML = "";

        appData.students.forEach(s => {
            const div = document.createElement("div");
            div.className = "student-card";
            div.innerHTML = `
                <h3>${escapeHtml(s.name)}</h3>
                <p>Группа: ${escapeHtml(s.group)}</p>
            `;
            list.appendChild(div);
        });
    }

    // === Группы ===
    function initGroupsPage() {
        const container = document.querySelector(".groups-container");
        container.innerHTML = "";

        Object.entries(appData.groups).forEach(([key, group]) => {
            const teacher = appData.teachers.find(t => t.id === group.teacher);
            const div = document.createElement("div");
            div.className = "group-card";

            let studentNames = "";
            group.students.forEach(id => {
                const st = appData.students.find(s => s.id === id);
                if (st) {
                    if (studentNames.length > 0) studentNames += ", ";
                    studentNames += st.name;
                }
            });

            div.innerHTML = `
                <h3>${escapeHtml(group.name)}</h3>
                <p>Учитель: ${teacher ? escapeHtml(teacher.name) : "—"}</p>
                <p>Ученики: ${escapeHtml(studentNames)}</p>
            `;

            div.addEventListener("click", () => {
                currentGroup = key;
                changePage("students");
                document.querySelectorAll(".menu-item").forEach(el => el.classList.remove("active"));
            });

            container.appendChild(div);
        });
    }

    // === Расписание ===
    function renderSchedule() {
        const body = document.getElementById("schedule-body");
        body.innerHTML = "";

        const lessons = appData.schedule[currentWeek] || [];
        lessons.forEach(l => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${escapeHtml(l.day)}</td>
                <td>${escapeHtml(l.time)}</td>
                <td>${escapeHtml(l.group)}</td>
                <td>${escapeHtml(l.subject)}</td>
                <td>${escapeHtml(l.teacher)}</td>
            `;
            body.appendChild(tr);
        });

        document.getElementById("week-label").textContent = "Неделя " + currentWeek;
    }

    // === Дополнительные занятия ===
    function renderExtraLessons() {
        const container = document.querySelector(".extra-lessons");
        container.innerHTML = "";

        appData.extraLessons.forEach(lesson => {
            const div = document.createElement("div");
            div.className = "lesson-card";
            div.innerHTML = `
                <h4>${escapeHtml(lesson.title)}</h4>
                <p>${escapeHtml(lesson.desc)}</p>
                <p>${escapeHtml(lesson.time)}</p>
            `;
            container.appendChild(div);
        });
    }

    // === Переключение страниц ===
    function changePage(pageId) {
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
        document.getElementById(pageId).classList.add("active");
    }

    // === Переключение недели ===
    function changeWeek(delta) {
        currentWeek = currentWeek + delta;
        if (currentWeek < 1) currentWeek = 1;
        if (currentWeek > Object.keys(appData.schedule).length) {
            currentWeek = Object.keys(appData.schedule).length;
        }
        renderSchedule();
    }
    // =========================
    // === АВТОРИЗАЦИЯ USER ===
    // =========================

    function login() {
        const login = document.getElementById("login-name").value;
        const pass = document.getElementById("login-password").value;

        const user = usersDatabase[login];
        if (!user) {
            showNotification("Пользователь с таким логином не найден");
            return;
        }
        if (user.password !== pass) {
            showNotification("Неверный пароль");
            return;
        }
        if (!user.approved) {
            showNotification("Администратор ещё не подтвердил ваш аккаунт или отклонил его");
            return;
        }

        currentUser = { login, role: user.role, name: user.name };
        saveAllData();
        updateUIForUser();

        document.getElementById("auth-modal").style.display = "none";
        showNotification("Добро пожаловать, " + user.name);
    }

    function register() {
        const login = document.getElementById("register-name").value;
        const pass = document.getElementById("register-password").value;
        const confirm = document.getElementById("register-confirm").value;
        const role = document.getElementById("register-role").value;
        const fullName = document.getElementById("register-fullname").value;

        if (!login || !pass || !confirm || !fullName) {
            showNotification("Заполните все поля");
            return;
        }
        if (pass !== confirm) {
            showNotification("Пароли не совпадают");
            return;
        }
        if (usersDatabase[login]) {
            showNotification("Такой логин уже существует");
            return;
        }

        if (role === "teacher") {
            teacherRequests.push({ login, password: pass, name: fullName, role, approved: false });
            showNotification("Заявка учителя отправлена администратору");
        } else {
            usersDatabase[login] = { password: pass, role, name: fullName, approved: true };
            currentUser = { login, role, name: fullName };
            saveAllData();
            updateUIForUser();
            showNotification("Регистрация прошла успешно!");
        }

        saveAllData();
        document.getElementById("auth-modal").style.display = "none";
    }

    function logout() {
        currentUser = null;
        localStorage.removeItem("portal_user");
        updateUIForUser();
        showNotification("Вы вышли из аккаунта");
    }

    // ==================================
    // === ОБРАБОТКА ЗАЯВОК УЧИТЕЛЕЙ ===
    // ==================================

    function renderTeacherRequests() {
        const list = document.querySelector(".teacher-requests-list");
        if (!list) return;

        list.innerHTML = "";
        if (teacherRequests.length === 0) {
            list.innerHTML = "<p>Нет заявок</p>";
            return;
        }

        teacherRequests.forEach((req, i) => {
            const div = document.createElement("div");
            div.className = "teacher-request-item";
            div.innerHTML = `
                <p><strong>ФИО:</strong> ${escapeHtml(req.name)}</p>
                <p><strong>Логин:</strong> ${escapeHtml(req.login)}</p>
                <p><strong>Пароль:</strong> ${escapeHtml(req.password)}</p>
                <button class="approve-btn" data-i="${i}">Принять</button>
                <button class="reject-btn" data-i="${i}">Отклонить</button>
            `;
            list.appendChild(div);
        });

        list.querySelectorAll(".approve-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const i = +btn.getAttribute("data-i");
                approveTeacher(i);
            });
        });
        list.querySelectorAll(".reject-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const i = +btn.getAttribute("data-i");
                rejectTeacher(i);
            });
        });
    }

    function approveTeacher(i) {
        const req = teacherRequests[i];
        if (!req) return;

        usersDatabase[req.login] = {
            password: req.password,
            role: req.role,
            name: req.name,
            approved: true
        };

        appData.teachers.push({
            id: Date.now(),
            name: req.name,
            subject: "Китайский язык",
            experience: "0 лет",
            photo: ""
        });

        teacherRequests.splice(i, 1);
        saveAllData();
        renderTeacherRequests();
        initTeachers();
        updateUIForUser();
        showNotification("Учитель " + req.name + " принят!");
    }

    function rejectTeacher(i) {
        const req = teacherRequests[i];
        if (!req) return;

        teacherRequests.splice(i, 1);
        saveAllData();
        renderTeacherRequests();
        showNotification("Заявка от " + req.name + " отклонена администратором");
    }
    // =============================
    // === ВОПРОСЫ / ОТВЕТЫ ===
    // =============================

    function sendQuestion() {
        const text = document.getElementById("question-input").value.trim();
        if (!text) {
            showNotification("Введите текст вопроса");
            return;
        }

        const question = {
            id: Date.now(),
            text,
            answer: null,
            author: currentUser ? currentUser.name : "Аноним"
        };

        appData.questions.push(question);
        saveAllData();
        renderQuestions();
        document.getElementById("question-input").value = "";
        unansweredQuestions++;
        updateNotificationBadge();
        showNotification("Вопрос отправлен");
    }

    function renderQuestions() {
        const container = document.querySelector(".qa-container");
        if (!container) return;
        container.innerHTML = "";

        if (appData.questions.length === 0) {
            container.innerHTML = "<p>Вопросов пока нет</p>";
            return;
        }

        appData.questions.forEach(q => {
            const div = document.createElement("div");
            div.className = "question-card";
            div.innerHTML = `
                <div class="question">${escapeHtml(q.text)} <small>— ${escapeHtml(q.author)}</small></div>
                ${q.answer ? `<div class="answer">${escapeHtml(q.answer)}</div>` : ""}
            `;

            // кнопка "Ответить" доступна только учителю и админу
            if (currentUser && (currentUser.role === "teacher" || currentUser.role === "admin") && !q.answer) {
                const btn = document.createElement("button");
                btn.textContent = "Ответить";
                btn.addEventListener("click", () => {
                    currentQuestionId = q.id;
                    const ans = prompt("Введите ваш ответ для вопроса: \"" + q.text + "\"");
                    if (ans && ans.trim() !== "") {
                        q.answer = ans.trim();
                        saveAllData();
                        renderQuestions();
                        showNotification("Ответ добавлен");
                    }
                });
                div.appendChild(btn);
            }

            container.appendChild(div);
        });
    }

    function updateNotificationBadge() {
        const badge = document.querySelector(".notification-badge");
        if (!badge) return;
        badge.textContent = unansweredQuestions;
        badge.style.display = unansweredQuestions > 0 ? "inline-block" : "none";
    }

    // ============================
    // === ПРАЗДНИКИ ===
    // ============================

    function checkHolidays() {
        const today = new Date().toISOString().split("T")[0];
        if (appData.holidays[today]) {
            const notif = document.createElement("div");
            notif.className = "holiday-notification";
            notif.textContent = "Сегодня праздник: " + appData.holidays[today];
            document.body.appendChild(notif);
            setTimeout(() => notif.remove(), 5000);
        }
    }

    // ============================
    // === ФАКТЫ ===
    // ============================

    function showRandomFact() {
        const facts = appData.chineseFacts;
        if (!facts || facts.length === 0) return;
        const index = Math.floor(Math.random() * facts.length);
        document.getElementById("china-fact").textContent = facts[index];
    }

    // ============================
    // === ТЕМЫ ===
    // ============================

    function toggleTheme() {
        const icon = document.getElementById("theme-icon");
        if (document.body.classList.contains("dark")) {
            document.body.classList.remove("dark");
            localStorage.setItem("theme", "light");
            if (icon) icon.textContent = "🌞";
        } else {
            document.body.classList.add("dark");
            localStorage.setItem("theme", "dark");
            if (icon) icon.textContent = "🌙";
        }
    }

    function loadTheme() {
        const theme = localStorage.getItem("theme");
        const icon = document.getElementById("theme-icon");
        if (theme === "dark") {
            document.body.classList.add("dark");
            if (icon) icon.textContent = "🌙";
        } else {
            if (icon) icon.textContent = "🌞";
        }
    }

    // ============================
    // === МОДАЛЬНЫЕ ОКНА ===
    // ============================

    function showModal(modal) {
        if (modal) modal.style.display = "flex";
    }

    function switchAuthTab(tab) {
        document.querySelectorAll(".auth-form").forEach(f => f.classList.remove("active"));
        const form = document.getElementById(tab);
        if (form) form.classList.add("active");
    }

    // ============================
    // === УВЕДОМЛЕНИЯ ===
    // ============================

    function showNotification(msg) {
        const area = document.getElementById("notification-area") || createNotificationArea();
        const div = document.createElement("div");
        div.className = "notification-message";
        div.textContent = msg;
        area.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    function createNotificationArea() {
        const area = document.createElement("div");
        area.id = "notification-area";
        document.body.appendChild(area);
        return area;
    }
    // ==================================
    // === ПЕРЕВОДЧИК (НЕЙРОСЕТЬ MOCK) ===
    // ==================================

    // ⚠️ Здесь мы делаем имитацию вызова к нейросети.
    // На практике понадобится API (например, OpenAI или Baidu Translate).
    // Мы добавляем пиньинь + иероглифы для красоты.

    async function translateText() {
        const from = document.getElementById("from-text").value;
        if (!from || from.trim() === "") {
            showNotification("Введите текст для перевода");
            return;
        }

        // Заглушка перевода (эмулируем китайский + пиньинь)
        let fakeChinese = "你好 (nǐ hǎo)";
        if (from.toLowerCase().includes("здравствуйте")) fakeChinese = "你好 (nǐ hǎo)";
        if (from.toLowerCase().includes("спасибо")) fakeChinese = "谢谢 (xièxiè)";
        if (from.toLowerCase().includes("китай")) fakeChinese = "中国 (Zhōngguó)";
        if (from.toLowerCase().includes("школа")) fakeChinese = "学校 (xuéxiào)";
        if (from.toLowerCase().includes("учитель")) fakeChinese = "老师 (lǎoshī)";

        const output = document.getElementById("to-text");
        output.value = fakeChinese;

        showNotification("Перевод выполнен (нейросеть)");
    }

    // ==================================
    // === HERO ДЛЯ ГОСТЕЙ ===
    // ==================================

    function showGuestHero() {
        const hero = document.getElementById("guest-hero");
        if (!hero) return;
        if (!currentUser) {
            hero.style.display = "flex";
        } else {
            hero.style.display = "none";
        }
    }

    // ==================================
    // === КАРТОЧКА УЧИТЕЛЯ (МОДАЛКА) ===
    // ==================================

    function openTeacherDetail(idx) {
        const t = appData.teachers[idx];
        if (!t) return;

        const modal = document.getElementById("teacher-detail-modal");
        if (!modal) return;

        modal.querySelector(".teacher-detail-name").textContent = t.name;
        modal.querySelector(".teacher-detail-subject").textContent = t.subject;
        modal.querySelector(".teacher-detail-experience").textContent = t.experience;
        modal.querySelector(".teacher-detail-photo").src = t.photo || "placeholder-teacher.png";

        modal.style.display = "flex";
    }

    // ==================================
    // === СТАРТ ПРИЛОЖЕНИЯ ===
    // ==================================

    function startApplication() {
        try {
            initApp();
            showGuestHero();
            console.log("Приложение запущено успешно");
        } catch (err) {
            console.error("Ошибка запуска приложения:", err);
            showNotification("Ошибка запуска приложения");
        }
    }

    // ==================================
    // === ВЫЗОВ СТАРТА ===
    // ==================================

    startApplication();

}); // конец DOMContentLoaded
