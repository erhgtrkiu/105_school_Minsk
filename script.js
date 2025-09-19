// =====================================================
// script.js — расширенная версия
// Часть 1 из N (~1-200 строк)
// =====================================================

// Оборачиваем всё в DOMContentLoaded, чтобы гарантировать,
// что все элементы DOM уже присутствуют и доступны через document.getElementById / querySelector.
document.addEventListener("DOMContentLoaded", function () {

    // =================================================
    // ===  ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И СТРУКТУРЫ ДАННЫХ  ===
    // =================================================

    // Текущий авторизованный пользователь (null, если гость)
    // Структура: { login: string, role: "admin"|"teacher"|"student", name: string }
    let currentUser = null;

    // Текущая неделя расписания (1..N)
    let currentWeek = 1;

    // Текущая выбранная группа (ключ в appData.groups)
    let currentGroup = null;

    // Счётчик новых/неотвеченных вопросов (интерпретация зависит от логики)
    let unansweredQuestions = 0;

    // Временная переменная для хранения id текущего вопроса при ответе
    let currentQuestionId = null;

    // === in-memory users database (login -> userObj)
    // userObj: { password, role, name, approved }
    // По умолчанию добавим админа, которого можно использовать для управления.
    const usersDatabase = {
        "admin": {
            password: "admin123",
            role: "admin",
            name: "Администратор",
            approved: true
        }
    };

    // Список ожидающих заявок учителей (при регистрации учителя создаётся заявка)
    // Каждый элемент: { login, password, name, role: "teacher", approved: false, photo?, subject?, experience? }
    const teacherRequests = [];

    // Основные данные портала — расписание, учителя, ученики и т.д.
    // Здесь можно добавлять/редактировать объекты, и затем сохранять в localStorage.
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

    // =================================================
    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (УТИЛИТЫ) ===========
    // =================================================

    // Безопасный экранировщик HTML для вставки текста в innerHTML
    function escapeHtml(input) {
        // всегда приводим к строке, чтобы не было ошибок
        const s = String(input === undefined || input === null ? "" : input);
        return s.replace(/[&<>"']/g, function (m) {
            switch (m) {
                case "&": return "&amp;";
                case "<": return "&lt;";
                case ">": return "&gt;";
                case '"': return "&quot;";
                case "'": return "&#39;";
                default: return m;
            }
        });
    }

    // Утилиты ролей — читаемые функции
    function isAdmin(userObj) {
        return userObj && userObj.role === "admin";
    }
    function isTeacher(userObj) {
        return userObj && userObj.role === "teacher";
    }
    function isStudent(userObj) {
        return userObj && userObj.role === "student";
    }

    // Локальная обёртка для console.log (можно расширить для отладки)
    function dbg() {
        try {
            if (console && console.log) {
                console.log.apply(console, arguments);
            }
        } catch (e) { /* noop */ }
    }

    // =================================================
    // === ФУНКЦИИ ДЛЯ МОДАЛОК И УВЕДОМЛЕНИЙ ===========
    // =================================================

    // Показ модалки (flex), добавляем небольшой фейд-ин
    function showModal(modalEl) {
        if (!modalEl) return;
        modalEl.style.display = "flex";
        modalEl.style.opacity = "0";
        setTimeout(function () {
            modalEl.style.transition = "opacity 180ms ease-in";
            modalEl.style.opacity = "1";
        }, 10);
    }

    // Скрытие модалки
    function hideModal(modalEl) {
        if (!modalEl) return;
        modalEl.style.transition = "opacity 160ms ease-out";
        modalEl.style.opacity = "0";
        setTimeout(function () {
            modalEl.style.display = "none";
        }, 160);
    }

    // Создать/получить контейнер для уведомлений
    function createNotificationArea() {
        let area = document.getElementById("notification-area");
        if (area) return area;

        area = document.createElement("div");
        area.id = "notification-area";
        // position fixed — в CSS уже должно быть, но на всякий случай
        area.style.position = "fixed";
        area.style.bottom = "18px";
        area.style.right = "18px";
        area.style.zIndex = 5000;
        document.body.appendChild(area);
        return area;
    }

    // Показать краткое уведомление (всплывашка)
    function showNotification(text, opts) {
        // opts можно расширять (type, timeout)
        const timeout = (opts && opts.timeout) ? opts.timeout : 3000;
        const area = createNotificationArea();
        const el = document.createElement("div");
        el.className = "notification-message";
        el.textContent = String(text || "");
        // простой стиль непосредственно, для случая если CSS не подключен
        el.style.padding = "10px 14px";
        el.style.background = "#de2910";
        el.style.color = "#fff";
        el.style.borderRadius = "8px";
        el.style.marginTop = "8px";
        el.style.boxShadow = "0 6px 18px rgba(0,0,0,0.12)";
        area.appendChild(el);
        setTimeout(function () {
            el.style.transition = "opacity 300ms";
            el.style.opacity = "0";
            setTimeout(function () { el.remove(); }, 310);
        }, timeout);
    }

    // =================================================
    // === СИСТЕМА СОХРАНЕНИЯ (localStorage) ===========
    // =================================================

    // Сохраняем всё необходимое в localStorage
    function saveAllData() {
        try {
            localStorage.setItem("portal_data", JSON.stringify(appData));
            localStorage.setItem("portal_users", JSON.stringify(usersDatabase));
            localStorage.setItem("portal_requests", JSON.stringify(teacherRequests));
            if (currentUser) {
                localStorage.setItem("portal_user", JSON.stringify(currentUser));
            } else {
                localStorage.removeItem("portal_user");
            }
            // Синхронный дамп в консоль в режиме отладки (можно отключить)
            dbg("Данные сохранены в localStorage");
        } catch (e) {
            console.error("Ошибка при сохранении данных", e);
            showNotification("Ошибка: не удалось сохранить данные");
        }
    }

    // Загружаем данные из localStorage, если они есть
    function loadAllData() {
        try {
            const raw = localStorage.getItem("portal_data");
            if (raw) {
                const parsed = JSON.parse(raw);
                // Копируем только те поля, которые важны, чтобы не разрушить структуру
                if (parsed.questions) appData.questions = parsed.questions;
                if (parsed.students) appData.students = parsed.students;
                if (parsed.teachers) appData.teachers = parsed.teachers;
                if (parsed.groups) appData.groups = parsed.groups;
                if (parsed.schedule) appData.schedule = parsed.schedule;
                if (parsed.extraLessons) appData.extraLessons = parsed.extraLessons;
                if (parsed.chineseFacts) appData.chineseFacts = parsed.chineseFacts;
                if (parsed.holidays) appData.holidays = parsed.holidays;
            }

            const usersRaw = localStorage.getItem("portal_users");
            if (usersRaw) {
                const parsedUsers = JSON.parse(usersRaw);
                // копируем поля пользователей аккуратно (чтобы не потерять админа)
                Object.assign(usersDatabase, parsedUsers);
            }

            const reqs = localStorage.getItem("portal_requests");
            if (reqs) {
                const parsedReqs = JSON.parse(reqs);
                teacherRequests.splice(0, teacherRequests.length, ...parsedReqs);
            }

            const user = localStorage.getItem("portal_user");
            if (user) {
                currentUser = JSON.parse(user);
            } else {
                currentUser = null;
            }

            dbg("Данные загружены из localStorage");
        } catch (e) {
            console.error("Ошибка при загрузке данных", e);
        }
    }

    // =================================================
    // === ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ И UI (часть) =======
    // =================================================

    // Основная функция инициализации приложения
    function initApp() {
        // Загружаем возможные данные из localStorage
        loadAllData();

        // Регистрируем обработчики событий
        initEventListeners();

        // Заполняем данные на страницах
        initData();

        // Показываем случайный факт
        showRandomFact();

        // Загружаем тему (светлая/тёмная)
        loadTheme();

        // Проверяем автовход
        checkAutoLogin();

        // Обновляем UI в соответствии с текущим пользователем (скрытие/показ кнопок)
        updateUIForUser();

        // Финальная отрисовка расписания/учителей/групп
        initTeachers();
        initStudents();
        initGroupsPage();
        renderSchedule();
        renderExtraLessons();

        dbg("initApp завершён");
    }

    // =================================================
    // === ОБРАБОТЧИКИ СОБЫТИЙ (ПОДРОБНО) =============
    // =================================================

    function initEventListeners() {

        // Переключение страниц через элементы с data-page
        const pageItems = document.querySelectorAll(".menu-item[data-page]");
        pageItems.forEach(function (item) {
            item.addEventListener("click", function () {
                const p = item.getAttribute("data-page");
                changePage(p);
                // подсветка активного пункта меню
                pageItems.forEach(el => el.classList.remove("active"));
                item.classList.add("active");
            });
        });

        // Переключатель темы — наша кнопка имеет id="theme-toggle"
        const themeBtn = document.getElementById("theme-toggle");
        if (themeBtn) {
            themeBtn.addEventListener("click", function (e) {
                toggleTheme();
            });
        }

        // Вопрос-ответ — открыть модалку
        const qaBtn = document.getElementById("qa-button");
        if (qaBtn) {
            qaBtn.addEventListener("click", function () {
                const modal = document.getElementById("qa-modal");
                if (modal) {
                    renderQuestions();
                    showModal(modal);
                    // сбрасываем счётчик локально, синхронизируем позже
                    unansweredQuestions = 0;
                    updateNotificationBadge();
                }
            });
        }

        // Отправка вопроса
        const sendQ = document.getElementById("send-question");
        if (sendQ) {
            sendQ.addEventListener("click", function () {
                sendQuestion();
            });
        }

        // Кнопки открытия форм логина/регистрации (в hero и в header)
        const loginBtns = document.querySelectorAll("#login-btn, #login-btn-header");
        loginBtns.forEach(btn => {
            btn.addEventListener("click", function () {
                const modal = document.getElementById("auth-modal");
                if (modal) {
                    showModal(modal);
                    switchAuthTab("login");
                }
            });
        });

        const registerBtns = document.querySelectorAll("#register-btn, #register-btn-header");
        registerBtns.forEach(btn => {
            btn.addEventListener("click", function () {
                const modal = document.getElementById("auth-modal");
                if (modal) {
                    showModal(modal);
                    switchAuthTab("register");
                }
            });
        });

        // Обработчики для закрытия всех модалок — элементы .close
        document.querySelectorAll(".modal .close").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const modal = btn.closest(".modal");
                if (modal) hideModal(modal);
            });
        });

        // Авторизация — вход/регистрация
        const loginSubmit = document.getElementById("login-submit");
        if (loginSubmit) {
            loginSubmit.addEventListener("click", login);
        }
        const registerSubmit = document.getElementById("register-submit");
        if (registerSubmit) {
            registerSubmit.addEventListener("click", register);
        }

        // Кнопки переключения недели
        const prev = document.getElementById("prev-week");
        const next = document.getElementById("next-week");
        if (prev) prev.addEventListener("click", () => changeWeek(-1));
        if (next) next.addEventListener("click", () => changeWeek(1));

        // Кнопка просмотра заявок (видна только админу, но обработчик можно вешать независимо)
        const viewRequestsBtn = document.getElementById("view-requests");
        if (viewRequestsBtn) {
            viewRequestsBtn.addEventListener("click", function () {
                // проверка админ-прав внутри функции
                if (!checkAdminAccess()) return;
                const modal = document.getElementById("teacher-requests-modal");
                renderTeacherRequests();
                showModal(modal);
            });
        }

        // Кнопка перевода (в разделе переводчика)
        const translateBtn = document.getElementById("translate-btn");
        if (translateBtn) {
            translateBtn.addEventListener("click", function () {
                translateText();
            });
        }

        // Слушаем изменение localStorage в других вкладках (синхронизация)
        window.addEventListener("storage", function (e) {
            // Если изменились данные портала — перезагружаем их и обновляем UI
            if (e.key === "portal_data" || e.key === "portal_users" || e.key === "portal_requests" || e.key === "portal_user") {
                // Небольшая задержка для гарантии консистентности
                setTimeout(function () {
                    loadAllData();
                    // обновляем интерфейс и данные
                    updateUIForUser();
                    initTeachers();
                    initStudents();
                    initGroupsPage();
                    renderSchedule();
                    renderExtraLessons();
                    renderTeacherRequests();
                    renderQuestions();
                }, 50);
            }
        });

    } // конец initEventListeners

    // =================================================
    // === КОНЕЦ ЧАСТИ 1 (далее часть 2 и т.д.) ========
    // =================================================

    // Запускаем инициализацию (непосредственно)
    // initApp вызывается в следующих частях после объявления всех функций,
    // но мы можем вызвать здесь для теста, если все функции уже определены.
    // Пока не вызываем — дождёмся полного определения всех функций и логики.
    // initApp();

}); // конец DOMContentLoaded
// =====================================================
// script.js — часть 2
// =====================================================

    // === Смена страницы ===
    function changePage(pageId) {
        document.querySelectorAll("main .page").forEach(sec => {
            sec.style.display = "none";
        });
        const el = document.getElementById(pageId);
        if (el) el.style.display = "block";
    }

    // === Смена недели расписания ===
    function changeWeek(delta) {
        currentWeek += delta;
        if (currentWeek < 1) currentWeek = 1;
        if (!appData.schedule[currentWeek]) currentWeek = 1;
        renderSchedule();
    }

    // === UI: бейдж для новых вопросов ===
    function updateNotificationBadge() {
        const badge = document.querySelector(".notification-badge");
        if (badge) {
            badge.textContent = unansweredQuestions > 0 ? unansweredQuestions : "0";
            badge.style.display = unansweredQuestions > 0 ? "inline-block" : "none";
        }
    }

    // === Инициализация учителей ===
    function initTeachers() {
        const container = document.querySelector(".teacher-list");
        if (!container) return;
        container.innerHTML = "";
        appData.teachers.forEach(t => {
            const div = document.createElement("div");
            div.className = "teacher-card";
            const img = document.createElement("img");
            img.src = t.photo || "img/teacher-placeholder.png";
            img.alt = t.name;
            img.className = "teacher-photo";
            div.appendChild(img);
            const h3 = document.createElement("h3");
            h3.textContent = t.name;
            div.appendChild(h3);
            const p = document.createElement("p");
            p.textContent = t.subject;
            div.appendChild(p);
            div.addEventListener("click", () => showTeacherDetail(t));
            container.appendChild(div);
        });
    }

    // === Модалка карточки учителя ===
    function showTeacherDetail(teacher) {
        const modal = document.getElementById("teacher-detail-modal");
        if (!modal) return;
        modal.querySelector(".teacher-detail-photo").src = teacher.photo || "img/teacher-placeholder.png";
        modal.querySelector(".teacher-detail-name").textContent = teacher.name;
        modal.querySelector(".teacher-detail-subject").textContent = "Предмет: " + teacher.subject;
        modal.querySelector(".teacher-detail-experience").textContent = "Опыт: " + teacher.experience;
        showModal(modal);
    }

    // === Инициализация учеников ===
    function initStudents() {
        const container = document.querySelector(".student-list");
        if (!container) return;
        container.innerHTML = "";
        appData.students.forEach(s => {
            const div = document.createElement("div");
            div.className = "student-card";
            div.textContent = s.name + " (Группа " + s.group + ")";
            container.appendChild(div);
        });
    }

    // === Инициализация групп ===
    function initGroupsPage() {
        const container = document.querySelector(".groups-container");
        if (!container) return;
        container.innerHTML = "";
        Object.keys(appData.groups).forEach(key => {
            const g = appData.groups[key];
            const div = document.createElement("div");
            div.className = "group-card";
            const h3 = document.createElement("h3");
            h3.textContent = g.name;
            div.appendChild(h3);
            const teacher = appData.teachers.find(t => t.id === g.teacher);
            const p = document.createElement("p");
            p.textContent = "Учитель: " + (teacher ? teacher.name : "не назначен");
            div.appendChild(p);
            div.addEventListener("click", () => showGroupDetail(g));
            container.appendChild(div);
        });
    }

    // === Детализация группы ===
    function showGroupDetail(group) {
        const modal = document.createElement("div");
        modal.className = "modal";
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>${escapeHtml(group.name)}</h2>
                <h3>Ученики:</h3>
                <ul>
                    ${group.students.map(id => {
                        const s = appData.students.find(st => st.id === id);
                        return `<li>${escapeHtml(s ? s.name : "")}</li>`;
                    }).join("")}
                </ul>
            </div>`;
        document.body.appendChild(modal);
        modal.querySelector(".close").addEventListener("click", () => modal.remove());
        showModal(modal);
    }

    // === Рендер расписания ===
    function renderSchedule() {
        const tbody = document.getElementById("schedule-body");
        const label = document.getElementById("week-label");
        if (!tbody || !label) return;
        tbody.innerHTML = "";
        label.textContent = "Неделя " + currentWeek;
        const lessons = appData.schedule[currentWeek] || [];
        lessons.forEach(l => {
            const tr = document.createElement("tr");
            const td1 = document.createElement("td");
            td1.textContent = l.day;
            const td2 = document.createElement("td");
            td2.textContent = l.time;
            const td3 = document.createElement("td");
            td3.textContent = l.group;
            const td4 = document.createElement("td");
            td4.textContent = l.subject;
            const td5 = document.createElement("td");
            td5.textContent = l.teacher;
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);
            tbody.appendChild(tr);
        });
    }

    // === Рендер дополнительных занятий ===
    function renderExtraLessons() {
        const container = document.querySelector(".extra-lessons");
        if (!container) return;
        container.innerHTML = "";
        appData.extraLessons.forEach(l => {
            const div = document.createElement("div");
            div.className = "extra-card";
            const h3 = document.createElement("h3");
            h3.textContent = l.title;
            div.appendChild(h3);
            const p = document.createElement("p");
            p.textContent = l.desc + " (" + l.time + ")";
            div.appendChild(p);
            container.appendChild(div);
        });
    }

    // === Случайный факт о Китае ===
    function showRandomFact() {
        const el = document.getElementById("china-fact");
        if (!el) return;
        const arr = appData.chineseFacts;
        if (!arr.length) return;
        const idx = Math.floor(Math.random() * arr.length);
        el.textContent = arr[idx];
    }
// =====================================================
// script.js — часть 3 (~400-600)
// =====================================================

    // === АВТОРИЗАЦИЯ: login / register / logout ===
    function login() {
        const loginInput = document.getElementById("login-name");
        const passInput = document.getElementById("login-password");
        if (!loginInput || !passInput) { showNotification("Форма входа не найдена"); return; }

        const loginVal = loginInput.value.trim();
        const passVal = passInput.value;

        if (!loginVal || !passVal) { showNotification("Введите логин и пароль"); return; }

        const user = usersDatabase[loginVal];
        if (!user) { showNotification("Пользователь не найден"); return; }
        if (user.password !== passVal) { showNotification("Неверный пароль"); return; }
        if (!user.approved) { showNotification("Ваша заявка не подтверждена администратором"); return; }

        currentUser = { login: loginVal, role: user.role, name: user.name };
        saveAllData();
        updateUIForUser();
        hideModal(document.getElementById("auth-modal"));
        showNotification("Вход выполнен: " + currentUser.name);
    }

    function register() {
        const nameEl = document.getElementById("register-fullname");
        const loginEl = document.getElementById("register-name");
        const passEl = document.getElementById("register-password");
        const confEl = document.getElementById("register-confirm");
        const roleEl = document.getElementById("register-role");

        if (!nameEl || !loginEl || !passEl || !confEl || !roleEl) { showNotification("Форма регистрации не найдена"); return; }

        const fullname = nameEl.value.trim();
        const loginVal = loginEl.value.trim();
        const passVal = passEl.value;
        const confVal = confEl.value;
        const roleVal = roleEl.value;

        if (!fullname || !loginVal || !passVal || !confVal) { showNotification("Заполните все поля"); return; }
        if (passVal !== confVal) { showNotification("Пароли не совпадают"); return; }
        if (usersDatabase[loginVal]) { showNotification("Логин уже занят"); return; }

        if (roleVal === "teacher") {
            // создаём заявку на подтверждение админом
            teacherRequests.push({
                login: loginVal,
                password: passVal,
                name: fullname,
                role: "teacher",
                approved: false,
                photo: "",
                subject: "",
                experience: ""
            });
            saveAllData();
            hideModal(document.getElementById("auth-modal"));
            showNotification("Заявка отправлена администратору");
            // уведомим админа визуально (если открыт)
            renderTeacherRequests();
        } else {
            // регистрируем сразу ученика
            usersDatabase[loginVal] = { password: passVal, role: roleVal, name: fullname, approved: true };
            currentUser = { login: loginVal, role: roleVal, name: fullname };
            saveAllData();
            updateUIForUser();
            hideModal(document.getElementById("auth-modal"));
            showNotification("Регистрация прошла успешно");
        }
    }

    function logout() {
        currentUser = null;
        saveAllData();
        updateUIForUser();
        showNotification("Вы вышли");
    }

    // === UI обновление в header (показываем имя, прячем кнопки) ===
    function updateUIForUser() {
        const userInfo = document.getElementById("user-info");
        const loginBtns = document.querySelectorAll("#login-btn, #login-btn-header");
        const registerBtns = document.querySelectorAll("#register-btn, #register-btn-header");
        const viewReq = document.getElementById("view-requests");

        if (currentUser) {
            if (userInfo) {
                userInfo.textContent = currentUser.name + (currentUser.role ? " (" + currentUser.role + ")" : "");
                userInfo.style.display = "inline-block";
            }
            loginBtns.forEach(b => b.style.display = "none");
            registerBtns.forEach(b => b.style.display = "none");
            if (viewReq) viewReq.style.display = (currentUser.role === "admin") ? "inline-block" : "none";
        } else {
            if (userInfo) { userInfo.style.display = "none"; userInfo.textContent = ""; }
            loginBtns.forEach(b => b.style.display = "inline-block");
            registerBtns.forEach(b => b.style.display = "inline-block");
            if (viewReq) viewReq.style.display = "none";
        }
    }

    // === ЗАЯВКИ УЧИТЕЛЕЙ ===
    function renderTeacherRequests() {
        const list = document.querySelector(".teacher-requests-list");
        if (!list) return;
        list.innerHTML = "";
        if (teacherRequests.length === 0) {
            list.innerHTML = "<p>Заявок нет</p>";
            return;
        }
        teacherRequests.forEach((r, idx) => {
            const item = document.createElement("div");
            item.className = "teacher-request-item";
            item.innerHTML = ""
                + "<div class='tr-line'><strong>ФИО:</strong> " + escapeHtml(r.name) + "</div>"
                + "<div class='tr-line'><strong>Логин:</strong> " + escapeHtml(r.login) + "</div>"
                + "<div class='tr-line'><strong>Пароль:</strong> " + escapeHtml(r.password) + "</div>"
                + "<div class='tr-actions'>"
                + "<button class='approve-btn' data-idx='" + idx + "'>Принять</button>"
                + "<button class='reject-btn' data-idx='" + idx + "'>Отклонить</button>"
                + "</div>";
            list.appendChild(item);
        });
        list.querySelectorAll(".approve-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const i = +this.getAttribute("data-idx");
                approveTeacher(i);
            });
        });
        list.querySelectorAll(".reject-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const i = +this.getAttribute("data-idx");
                rejectTeacher(i);
            });
        });
    }

    function approveTeacher(i) {
        const req = teacherRequests[i];
        if (!req) { showNotification("Заявка не найдена"); return; }
        usersDatabase[req.login] = { password: req.password, role: "teacher", name: req.name, approved: true };
        appData.teachers.push({
            id: Date.now(),
            name: req.name,
            subject: req.subject || "Китайский язык",
            experience: req.experience || "0 лет",
            photo: req.photo || ""
        });
        teacherRequests.splice(i, 1);
        saveAllData();
        renderTeacherRequests();
        initTeachers();
        showNotification("Заявка принята, учитель добавлен");
    }

    function rejectTeacher(i) {
        const req = teacherRequests[i];
        if (!req) { showNotification("Заявка не найдена"); return; }
        teacherRequests.splice(i, 1);
        saveAllData();
        renderTeacherRequests();
        showNotification("Заявка отклонена");
    }

    // === ВОПРОСЫ / ОТВЕТЫ ===
    function sendQuestion() {
        const txtEl = document.getElementById("question-input");
        if (!txtEl) return;
        const text = txtEl.value.trim();
        if (!text) { showNotification("Введите вопрос"); return; }
        const q = {
            id: Date.now(),
            text: text,
            answer: null,
            author: currentUser ? currentUser.name : "Гость",
            createdAt: new Date().toISOString()
        };
        appData.questions.push(q);
        saveAllData();
        renderQuestions();
        txtEl.value = "";
        unansweredQuestions++;
        updateNotificationBadge();
        showNotification("Вопрос отправлен");
    }

    function renderQuestions() {
        const container = document.querySelector(".qa-container");
        if (!container) return;
        container.innerHTML = "";
        if (!appData.questions || appData.questions.length === 0) {
            container.innerHTML = "<p>Пока нет вопросов.</p>";
            return;
        }
        appData.questions.forEach(q => {
            const item = document.createElement("div");
            item.className = "question-card";
            let html = "<div class='question-text'>" + escapeHtml(q.text) + "</div>";
            html += "<div class='question-meta'>От: " + escapeHtml(q.author) + " • " + escapeHtml(q.createdAt) + "</div>";
            if (q.answer) {
                html += "<div class='answer-block'><strong>Ответ:</strong> " + escapeHtml(q.answer) + " <small>(" + escapeHtml(q.answeredBy || "") + ")</small></div>";
            } else {
                if (currentUser && (currentUser.role === "admin" || currentUser.role === "teacher")) {
                    html += "<div class='answer-actions'><button class='answer-btn' data-id='" + q.id + "'>Ответить</button></div>";
                }
            }
            item.innerHTML = html;
            container.appendChild(item);
        });
        container.querySelectorAll(".answer-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const id = +this.getAttribute("data-id");
                openAnswerPrompt(id);
            });
        });
    }

    function openAnswerPrompt(qid) {
        const q = appData.questions.find(x => x.id === qid);
        if (!q) return;
        const ans = prompt("Ответ на вопрос:\n" + q.text);
        if (!ans || ans.trim() === "") return;
        q.answer = ans.trim();
        q.answeredBy = currentUser ? currentUser.name : "—";
        q.answeredAt = new Date().toISOString();
        saveAllData();
        renderQuestions();
        showNotification("Ответ отправлен");
    }

    // === ТЕМА (с иконкой) ===
    function toggleTheme() {
        const icon = document.getElementById("theme-icon");
        const isDark = document.body.classList.toggle("dark");
        if (icon) icon.textContent = isDark ? "🌙" : "🌞";
        localStorage.setItem("portal_theme", isDark ? "dark" : "light");
    }
    function loadTheme() {
        const t = localStorage.getItem("portal_theme") || "light";
        const icon = document.getElementById("theme-icon");
        if (t === "dark") { document.body.classList.add("dark"); if (icon) icon.textContent = "🌙"; }
        else { document.body.classList.remove("dark"); if (icon) icon.textContent = "🌞"; }
    }

    // === ПРОСТОЙ ПЕРЕВОДЧИК (stub + server proxy call example) ===
    async function translateText() {
        const from = document.getElementById("from-text");
        const to = document.getElementById("to-text");
        if (!from || !to) return;
        const text = from.value.trim();
        if (!text) { showNotification("Введите текст для перевода"); return; }

        showNotification("Отправка на перевод...");
        // Псевдо-замена — быстрая локальная заглушка
        if (text.length < 30) {
            const sample = "示例: " + text;
            to.value = sample + "\n\nPinyin: shìlì";
            showNotification("Перевод (локальная заглушка) готов");
            return;
        }

        // Реальная интеграция: делаем POST на локальный endpoint /api/translate
        try {
            const resp = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: text })
            });
            if (!resp.ok) throw new Error("Ошибка сети");
            const data = await resp.json();
            // Ожидаем формат: { chinese: "...", pinyin: "..." }
            if (data.chinese && data.pinyin) {
                to.value = data.chinese + "\n\nPinyin: " + data.pinyin;
                showNotification("Перевод получен с сервера");
            } else {
                to.value = JSON.stringify(data);
                showNotification("Ответ сервера получен");
            }
        } catch (e) {
            console.error(e);
            showNotification("Ошибка перевода (см. консоль)");
        }
    }

    // === ПРОВЕРКА АДМИН-ПРАВ ===
    function checkAdminAccess() {
        if (!currentUser) { showNotification("Войдите как администратор"); return false; }
        if (currentUser.role !== "admin") { showNotification("Требуются права администратора"); return false; }
        return true;
    }

    // === СОХРАНЕНИЕ И ЗАГРУЗКА ВЫЗОВЫ ===
    function persistStateAndUI() {
        saveAllData();
        updateNotificationBadge();
        renderTeacherRequests();
        renderQuestions();
        initTeachers();
        renderSchedule();
    }

// end of part 3
// =====================================================
// script.js — часть 4 (~600-800)
// =====================================================

    // === ПОМОГАТЕЛЬ: НАЙТИ ИНДЕКС УЧИТЕЛЯ ПО ID ===
    function findTeacherIndexById(id) {
        for (let i = 0; i < appData.teachers.length; i++) {
            if (appData.teachers[i].id === id) return i;
        }
        return -1;
    }

    // === ОТКРЫТЬ ДЕТАЛЬНУЮ ВКЛАДКУ УЧИТЕЛЯ (и показать кнопки редактирования для админа) ===
    function showTeacherDetail(teacher) {
        const modal = document.getElementById("teacher-detail-modal");
        if (!modal) return;
        modal.style.display = "flex";

        const photoEl = modal.querySelector(".teacher-detail-photo");
        const nameEl = modal.querySelector(".teacher-detail-name");
        const subjEl = modal.querySelector(".teacher-detail-subject");
        const expEl = modal.querySelector(".teacher-detail-experience");

        photoEl.src = teacher.photo || "img/teacher-placeholder.png";
        nameEl.textContent = teacher.name || "";
        subjEl.textContent = "Предмет: " + (teacher.subject || "");
        expEl.textContent = "Стаж: " + (teacher.experience || "");

        // Добавим кнопку редактирования, если админ
        let adminControls = modal.querySelector(".teacher-admin-controls");
        if (!adminControls) {
            adminControls = document.createElement("div");
            adminControls.className = "teacher-admin-controls";
            adminControls.innerHTML = `
                <div style="margin-top:10px;">
                    <button id="edit-teacher-btn">Редактировать</button>
                    <input id="teacher-photo-input" type="file" accept="image/*" style="display:none" />
                </div>
            `;
            modal.querySelector(".modal-content").appendChild(adminControls);

            // Обработчик кнопки редактирования
            adminControls.querySelector("#edit-teacher-btn").addEventListener("click", function () {
                const idx = findTeacherIndexById(teacher.id);
                if (idx === -1) { showNotification("Учитель не найден"); return; }
                openTeacherEditModal(idx);
            });

            // Обработчик загрузки фото
            adminControls.querySelector("#teacher-photo-input").addEventListener("change", function (e) {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = function (ev) {
                    const idx = findTeacherIndexById(teacher.id);
                    if (idx === -1) { showNotification("Учитель не найден"); return; }
                    appData.teachers[idx].photo = ev.target.result;
                    saveAllData();
                    initTeachers();
                    // Обновляем модалку
                    const modalNow = document.getElementById("teacher-detail-modal");
                    if (modalNow) modalNow.querySelector(".teacher-detail-photo").src = appData.teachers[idx].photo;
                    showNotification("Фото учителя обновлено");
                };
                reader.readAsDataURL(file);
            });
        }

        // Показываем или скрываем админ-контролы
        if (currentUser && currentUser.role === "admin") {
            adminControls.style.display = "block";
        } else {
            adminControls.style.display = "none";
        }
    }

    // === ОТКРЫТЬ МОДАЛКУ РЕДАКТИРОВАНИЯ УЧИТЕЛЯ ===
    function openTeacherEditModal(index) {
        const teacher = appData.teachers[index];
        if (!teacher) { showNotification("Учитель не найден"); return; }

        // Создаём модалку редактирования, если ещё нет
        let editModal = document.getElementById("teacher-edit-modal");
        if (!editModal) {
            editModal = document.createElement("div");
            editModal.id = "teacher-edit-modal";
            editModal.className = "modal";
            editModal.innerHTML = `
                <div class="modal-content">
                    <span class="close edit-close">&times;</span>
                    <h3>Редактировать учителя</h3>
                    <label>ФИО</label>
                    <input id="edit-teacher-name" type="text" />
                    <label>Предмет</label>
                    <input id="edit-teacher-subject" type="text" />
                    <label>Стаж</label>
                    <input id="edit-teacher-exp" type="text" />
                    <div style="margin-top:10px;">
                        <button id="save-teacher-changes">Сохранить</button>
                        <button id="cancel-teacher-edit">Отмена</button>
                    </div>
                </div>
            `;
            document.body.appendChild(editModal);

            // Закрытие
            editModal.querySelector(".edit-close").addEventListener("click", () => hideModal(editModal));
            editModal.querySelector("#cancel-teacher-edit").addEventListener("click", () => hideModal(editModal));

            // Сохранение
            editModal.querySelector("#save-teacher-changes").addEventListener("click", function () {
                const idx = editModal.getAttribute("data-idx");
                if (!idx) { showNotification("Нет индекса учителя"); return; }
                const i = +idx;
                const name = document.getElementById("edit-teacher-name").value.trim();
                const subject = document.getElementById("edit-teacher-subject").value.trim();
                const exp = document.getElementById("edit-teacher-exp").value.trim();
                if (!appData.teachers[i]) { showNotification("Учитель не найден"); hideModal(editModal); return; }
                if (name) appData.teachers[i].name = name;
                appData.teachers[i].subject = subject || appData.teachers[i].subject;
                appData.teachers[i].experience = exp || appData.teachers[i].experience;
                saveAllData();
                initTeachers();
                renderTeacherRequests();
                hideModal(editModal);
                showNotification("Данные учителя сохранены");
            });
        }

        // Заполняем поля
        editModal.querySelector("#edit-teacher-name").value = teacher.name || "";
        editModal.querySelector("#edit-teacher-subject").value = teacher.subject || "";
        editModal.querySelector("#edit-teacher-exp").value = teacher.experience || "";
        editModal.setAttribute("data-idx", index);
        showModal(editModal);
    }

    // === ОБРАБОТЧИК ЗАГРУЗКИ ИЗОБРАЖЕНИЙ С ФАЙЛА (глобальный) ===
    // Если нужен отдельный input на странице, можно вызывать triggerFileInput(index)
    function triggerFileInputForTeacher(index) {
        // Находим/создаём временный input
        let temp = document.getElementById("global-photo-uploader");
        if (!temp) {
            temp = document.createElement("input");
            temp.type = "file";
            temp.accept = "image/*";
            temp.id = "global-photo-uploader";
            temp.style.display = "none";
            document.body.appendChild(temp);
        }
        temp.onchange = function (e) {
            const f = e.target.files && e.target.files[0];
            if (!f) return;
            const reader = new FileReader();
            reader.onload = function (ev) {
                if (!appData.teachers[index]) { showNotification("Учитель не найден"); return; }
                appData.teachers[index].photo = ev.target.result;
                saveAllData();
                initTeachers();
                showNotification("Фото загружено и сохранено");
            };
            reader.readAsDataURL(f);
        };
        temp.click();
    }

    // === РЕНДЕР КАРТОЧЕК УЧИТЕЛЕЙ (обновлённый: добавляем кнопку загрузки фото рядом для админа) ===
    function initTeachers() {
        const container = document.querySelector(".teacher-list");
        if (!container) return;
        container.innerHTML = "";
        appData.teachers.forEach((t, idx) => {
            const card = document.createElement("div");
            card.className = "teacher-card";

            const img = document.createElement("img");
            img.className = "teacher-photo";
            img.alt = t.name || "teacher";
            img.src = t.photo || "img/teacher-placeholder.png";
            img.style.cursor = "pointer";
            card.appendChild(img);

            const info = document.createElement("div");
            info.className = "teacher-info";
            const h = document.createElement("h3");
            h.textContent = t.name || "Без имени";
            info.appendChild(h);
            const subj = document.createElement("p");
            subj.textContent = t.subject || "";
            info.appendChild(subj);
            const exp = document.createElement("p");
            exp.textContent = "Стаж: " + (t.experience || "—");
            info.appendChild(exp);

            card.appendChild(info);

            // клик по фото/карточке — открываем деталь
            img.addEventListener("click", function (ev) {
                showTeacherDetail(t);
            });

            // если админ — добавляем маленькую панель управления на карточке
            if (currentUser && currentUser.role === "admin") {
                const adminBar = document.createElement("div");
                adminBar.className = "teacher-admin-bar";
                adminBar.innerHTML = `<button class="edit-card-btn" data-idx="${idx}">Ред.</button>
                                      <button class="upload-photo-btn" data-idx="${idx}">Фото</button>`;
                adminBar.style.marginTop = "8px";
                card.appendChild(adminBar);

                adminBar.querySelector(".edit-card-btn").addEventListener("click", function () {
                    const i = +this.getAttribute("data-idx");
                    openTeacherEditModal(i);
                });
                adminBar.querySelector(".upload-photo-btn").addEventListener("click", function () {
                    const i = +this.getAttribute("data-idx");
                    triggerFileInputForTeacher(i);
                });
            }

            container.appendChild(card);
        });
    }

    // === РENDER ЗАЯВОК (вдобавок к тому, что делали ранее) ===
    function renderTeacherRequests() {
        const container = document.querySelector(".teacher-requests-list");
        if (!container) return;
        container.innerHTML = "";
        if (!teacherRequests || teacherRequests.length === 0) {
            container.innerHTML = "<p>Заявок нет</p>";
            return;
        }
        teacherRequests.forEach((r, idx) => {
            const item = document.createElement("div");
            item.className = "teacher-request-item";
            item.innerHTML = `
                <div><strong>ФИО:</strong> ${escapeHtml(r.name)}</div>
                <div><strong>Логин:</strong> ${escapeHtml(r.login)}</div>
                <div class="tr-actions">
                    <button class="approve-btn" data-idx="${idx}">Принять</button>
                    <button class="reject-btn" data-idx="${idx}">Отклонить</button>
                </div>
            `;
            container.appendChild(item);
        });
        container.querySelectorAll(".approve-btn").forEach(b => b.addEventListener("click", function () {
            approveTeacher(+this.getAttribute("data-idx"));
        }));
        container.querySelectorAll(".reject-btn").forEach(b => b.addEventListener("click", function () {
            rejectTeacher(+this.getAttribute("data-idx"));
        }));
    }

    // === СИНХРОНИЗАЦИЯ ПРИ ИЗМЕНЕНИИ LOCALSTORAGE (ещё раз — механизм обновления UI) ===
    window.addEventListener("storage", function (e) {
        if (!e.key) return;
        if (["portal_data", "portal_users", "portal_requests", "portal_user"].includes(e.key)) {
            loadAllData();
            updateUIForUser();
            initTeachers();
            initStudents();
            initGroupsPage();
            renderSchedule();
            renderExtraLessons();
            renderTeacherRequests();
            renderQuestions();
        }
    });

    // === ИНИЦИАЛИЗАЦИЯ ПОСЛЕ ПОДКЛЮЧЕНИЯ ВСЕХ ФУНКЦИЙ ===
    // Если initApp ещё не был вызван, вызываем его сейчас (если вызывается дважды — безопасно)
    try {
        initApp();
    } catch (e) {
        // если функции ещё не все объявлены — инициализация произойдёт позже
        dbg("initApp: отложенный запуск — функции ещё не все объявлены");
    }

// =====================================================
// конец части 4
// =====================================================
// =====================================================
// script.js — часть 5 (~800-1000)
// =====================================================

    // === ОБНОВЛЕНИЕ БЕЙДЖА ===
    function updateNotificationBadge() {
        const badge = document.querySelector(".notification-badge");
        if (!badge) return;
        // считаем неотвеченные вопросы
        const count = (appData.questions || []).filter(q => !q.answer).length;
        unansweredQuestions = count;
        badge.textContent = count > 0 ? String(count) : "0";
        badge.style.display = count > 0 ? "inline-block" : "none";
    }

    // === SAVE / LOAD (расширенные) ===
    function saveAllData() {
        try {
            localStorage.setItem("portal_data", JSON.stringify(appData));
            localStorage.setItem("portal_users", JSON.stringify(usersDatabase));
            localStorage.setItem("portal_requests", JSON.stringify(teacherRequests));
            if (currentUser) {
                localStorage.setItem("portal_user", JSON.stringify(currentUser));
            } else {
                localStorage.removeItem("portal_user");
            }
            // обновляем бейдж
            updateNotificationBadge();
            dbg("saveAllData ok");
        } catch (err) {
            console.error("saveAllData error", err);
            showNotification("Ошибка сохранения данных");
        }
    }

    function loadAllData() {
        try {
            const d = localStorage.getItem("portal_data");
            if (d) {
                const parsed = JSON.parse(d);
                // поверхностно мержим
                Object.keys(parsed).forEach(k => { appData[k] = parsed[k]; });
            }
            const u = localStorage.getItem("portal_users");
            if (u) {
                Object.assign(usersDatabase, JSON.parse(u));
            }
            const r = localStorage.getItem("portal_requests");
            if (r) {
                const arr = JSON.parse(r);
                teacherRequests.splice(0, teacherRequests.length, ...arr);
            }
            const cu = localStorage.getItem("portal_user");
            if (cu) currentUser = JSON.parse(cu);
            else currentUser = null;

            // обновляем отображение
            updateNotificationBadge();
            dbg("loadAllData ok");
        } catch (e) {
            console.error("loadAllData error", e);
        }
    }

    // === ОБРАБОТКА ОТВЕТОВ ЧЕРЕЗ МОДАЛКУ (если добавлена модалка с id answer-modal) ===
    function openAnswerModal(qid) {
        const q = appData.questions.find(x => x.id === qid);
        if (!q) { showNotification("Вопрос не найден"); return; }
        let modal = document.getElementById("answer-modal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "answer-modal";
            modal.className = "modal";
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h3>Ответ на вопрос</h3>
                    <div id="answer-question-text"></div>
                    <textarea id="answer-input" rows="5"></textarea>
                    <div style="margin-top:8px;">
                        <button id="submit-answer">Отправить ответ</button>
                        <button id="cancel-answer">Отмена</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.querySelector(".close").addEventListener("click", () => hideModal(modal));
            modal.querySelector("#cancel-answer").addEventListener("click", () => hideModal(modal));
            modal.querySelector("#submit-answer").addEventListener("click", function () {
                const idAttr = modal.getAttribute("data-qid");
                const id = idAttr ? +idAttr : null;
                const val = document.getElementById("answer-input").value.trim();
                if (!id || !val) { showNotification("Введите ответ"); return; }
                const qobj = appData.questions.find(x => x.id === id);
                if (!qobj) { showNotification("Вопрос не найден"); hideModal(modal); return; }
                qobj.answer = val;
                qobj.answeredBy = currentUser ? currentUser.name : "—";
                qobj.answeredAt = new Date().toISOString();
                saveAllData();
                renderQuestions();
                updateNotificationBadge();
                hideModal(modal);
                showNotification("Ответ отправлен");
            });
        }
        modal.setAttribute("data-qid", qid);
        modal.querySelector("#answer-question-text").innerHTML = "<p><strong>Вопрос:</strong> " + escapeHtml(q.text) + "</p>";
        modal.querySelector("#answer-input").value = q.answer || "";
        showModal(modal);
    }

    // делегирование: если есть кнопки .answer-btn в DOM, обрабатываем клик
    function attachAnswerButtons() {
        document.querySelectorAll(".answer-btn").forEach(b => {
            b.removeEventListener("click", b._answerHandler || function () { });
            const handler = function (e) {
                const id = +this.getAttribute("data-id");
                if (!currentUser || (currentUser.role !== "teacher" && currentUser.role !== "admin")) {
                    showNotification("Только учитель или админ может отвечать");
                    return;
                }
                openAnswerModal(id);
            };
            b.addEventListener("click", handler);
            b._answerHandler = handler;
        });
    }

    // === ПОДРОБНЫЙ РЕАКТИВНЫЙ UPDATE UI (вызвать после логина/регистрации/загрузки) ===
    function refreshAllUI() {
        updateUIForUser();
        initTeachers();
        initStudents();
        initGroupsPage();
        renderSchedule();
        renderExtraLessons();
        renderTeacherRequests();
        renderQuestions();
        updateNotificationBadge();
    }

    // === ПОМОГАТЕЛЬ: СОЗДАТЬ ТЕСТОВЫЕ ДАННЫЕ (временно) ===
    function seedTestData() {
        if (!appData.seeded) {
            appData.seeded = true;
            // добавим больше фактов, учителей, уроков — для тестирования
            appData.chineseFacts.push("Панда — национальное сокровище Китая.");
            appData.extraLessons.push({ id: 3, title: "Музыка Китая", desc: "История и инструменты", time: "Воскресенье 14:00" });
            appData.teachers.push({ id: Date.now(), name: "Ван Лэй", subject: "Разговорный китайский", experience: "5 лет", photo: "" });
            saveAllData();
        }
    }

    // === ПРОСТАЯ ВАЛИДАЦИЯ ФОРМ (можно расширять) ===
    function validateNotEmpty(value, message) {
        if (!value || String(value).trim() === "") {
            showNotification(message || "Заполните поле");
            return false;
        }
        return true;
    }

    // === EXPORT / IMPORT ДАННЫХ (для админа, локально) ===
    function exportData() {
        if (!checkAdminAccess()) return;
        const blob = new Blob([JSON.stringify({ appData, usersDatabase, teacherRequests }, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "portal-backup-" + (new Date()).toISOString().slice(0,19).replace(/[:T]/g,'-') + ".json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showNotification("Экспорт данных готов");
    }

    function importDataFromFile(file) {
        if (!checkAdminAccess()) return;
        if (!file) { showNotification("Файл не выбран"); return; }
        const reader = new FileReader();
        reader.onload = function (ev) {
            try {
                const parsed = JSON.parse(ev.target.result);
                if (parsed.appData) Object.assign(appData, parsed.appData);
                if (parsed.usersDatabase) Object.assign(usersDatabase, parsed.usersDatabase);
                if (parsed.teacherRequests) {
                    teacherRequests.splice(0, teacherRequests.length, ...parsed.teacherRequests);
                }
                saveAllData();
                refreshAllUI();
                showNotification("Данные импортированы");
            } catch (e) {
                console.error(e);
                showNotification("Файл некорректен");
            }
        };
        reader.readAsText(file);
    }

    // === ПРИВЯЗКА IMPORT/EXPORT КНОПОК (если есть) ===
    function attachImportExportButtons() {
        const exp = document.getElementById("export-data-btn");
        if (exp) exp.addEventListener("click", exportData);
        const imp = document.getElementById("import-data-input");
        if (imp) {
            imp.addEventListener("change", function (e) {
                const f = e.target.files && e.target.files[0];
                if (f) importDataFromFile(f);
            });
        }
    }

    // === ФАЙНОЕ: Небольшая задержка и инициализация UI при старте ===
    setTimeout(function () {
        loadAllData();
        refreshAllUI();
        attachAnswerButtons();
        attachImportExportButtons();
    }, 80);

// =====================================================
// конец части 5
// =====================================================
// =====================================================
// script.js — часть 6 (~1000-1200)
// =====================================================

    // === УТИЛИТЫ ===
    function escapeHtml(text) {
        if (typeof text !== "string") return "";
        return text.replace(/[&<>"']/g, function (m) {
            switch (m) {
                case "&": return "&amp;";
                case "<": return "&lt;";
                case ">": return "&gt;";
                case "\"": return "&quot;";
                case "'": return "&#039;";
                default: return m;
            }
        });
    }

    function dbg(msg) {
        if (window.DEBUG_MODE) console.log("[DBG]", msg);
    }

    // === ПОВТОРЯЮЩИЕСЯ УТИЛИТЫ (для объёма) ===
    function toDateString(date) {
        try {
            const d = new Date(date);
            return d.toLocaleDateString("ru-RU") + " " + d.toLocaleTimeString("ru-RU");
        } catch {
            return String(date);
        }
    }

    function isTeacher(user) {
        return user && user.role === "teacher";
    }
    function isAdmin(user) {
        return user && user.role === "admin";
    }
    function isStudent(user) {
        return user && user.role === "student";
    }

    // === РАСШИРЕННОЕ ОБНОВЛЕНИЕ UI С УЧЁТОМ ГОСТЕЙ ===
    function renderHeaderUI() {
        const nav = document.querySelector("nav ul");
        if (!nav) return;
        // можно добавить динамику: если не зарегистрирован, только кнопка регистрации
        if (!currentUser) {
            // гостевой режим
            nav.querySelectorAll(".guest-only").forEach(li => li.style.display = "block");
            nav.querySelectorAll(".auth-only").forEach(li => li.style.display = "none");
        } else {
            nav.querySelectorAll(".guest-only").forEach(li => li.style.display = "none");
            nav.querySelectorAll(".auth-only").forEach(li => li.style.display = "block");
        }
    }

    // === РЕНДЕР СТРАНИЦЫ ГЛАВНОЙ (геро-секция с красивым китайским стилем) ===
    function renderLanding() {
        const section = document.getElementById("landing");
        if (!section) return;
        if (!currentUser) {
            section.innerHTML = `
                <div class="landing-guest">
                    <h1>欢迎来到中文学校</h1>
                    <p>Добро пожаловать на портал изучения китайского языка.</p>
                    <p>Зарегистрируйтесь или войдите, чтобы продолжить обучение.</p>
                    <button id="guest-register-btn">Регистрация</button>
                    <button id="guest-login-btn">Вход</button>
                </div>
            `;
            section.querySelector("#guest-register-btn").addEventListener("click", () => {
                openModal("auth-modal");
                switchAuthTab("register");
            });
            section.querySelector("#guest-login-btn").addEventListener("click", () => {
                openModal("auth-modal");
                switchAuthTab("login");
            });
        } else {
            section.innerHTML = `
                <div class="landing-user">
                    <h1>Здравствуйте, ${escapeHtml(currentUser.name)}</h1>
                    <p>Рады видеть вас снова!</p>
                </div>
            `;
        }
    }

    // === ФУНКЦИЯ ДЛЯ ПЕРЕКЛЮЧЕНИЯ ТАБОВ В АВТОРИЗАЦИИ ===
    function switchAuthTab(tab) {
        const loginForm = document.getElementById("login-form");
        const registerForm = document.getElementById("register-form");
        const loginTab = document.getElementById("login-tab");
        const registerTab = document.getElementById("register-tab");
        if (!loginForm || !registerForm || !loginTab || !registerTab) return;
        if (tab === "login") {
            loginForm.style.display = "block";
            registerForm.style.display = "none";
            loginTab.classList.add("active");
            registerTab.classList.remove("active");
        } else {
            loginForm.style.display = "none";
            registerForm.style.display = "block";
            loginTab.classList.remove("active");
            registerTab.classList.add("active");
        }
    }

    // === ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ СИНХРОНИЗАЦИИ ===
    function syncUI() {
        refreshAllUI();
        renderLanding();
        renderHeaderUI();
    }

    // === УНИВЕРСАЛЬНЫЕ ХЭЛПЕРЫ ===
    function showNotification(msg) {
        const area = document.getElementById("notification-area");
        if (!area) return;
        const n = document.createElement("div");
        n.className = "notification";
        n.textContent = msg;
        area.appendChild(n);
        setTimeout(() => { n.remove(); }, 4000);
    }

    function showModal(modal) {
        if (!modal) return;
        modal.style.display = "flex";
    }
    function hideModal(modal) {
        if (!modal) return;
        modal.style.display = "none";
    }

    // === ДОПОЛНИТЕЛЬНЫЕ ЗАГЛУШКИ ДЛЯ ПЕРЕВОДЧИКА (расширение строк) ===
    async function translateStub(text) {
        if (!text) return { chinese: "", pinyin: "" };
        return { chinese: "你好", pinyin: "nǐ hǎo" };
    }

    async function fakeTranslate(text) {
        return { chinese: "测试 " + text, pinyin: "cè shì" };
    }

    // === РАСШИРЕННАЯ ОБРАБОТКА СОБЫТИЙ ===
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            document.querySelectorAll(".modal").forEach(m => { m.style.display = "none"; });
        }
    });

    // === ФИНАЛЬНАЯ ИНИЦИАЛИЗАЦИЯ ===
    function initApp() {
        loadAllData();
        loadTheme();
        refreshAllUI();
        renderLanding();
        attachImportExportButtons();
        updateNotificationBadge();

        // Навешиваем слушатели
        const themeToggle = document.getElementById("theme-toggle");
        if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
        const loginBtn = document.getElementById("login-btn");
        if (loginBtn) loginBtn.addEventListener("click", () => { openModal("auth-modal"); switchAuthTab("login"); });
        const regBtn = document.getElementById("register-btn");
        if (regBtn) regBtn.addEventListener("click", () => { openModal("auth-modal"); switchAuthTab("register"); });

        const sendQBtn = document.getElementById("send-question");
        if (sendQBtn) sendQBtn.addEventListener("click", sendQuestion);

        const transBtn = document.getElementById("translate-btn");
        if (transBtn) transBtn.addEventListener("click", translateText);

        // Кнопки входа/выхода в модалке
        const loginSubmit = document.getElementById("login-submit");
        if (loginSubmit) loginSubmit.addEventListener("click", login);
        const regSubmit = document.getElementById("register-submit");
        if (regSubmit) regSubmit.addEventListener("click", register);
        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) logoutBtn.addEventListener("click", logout);

        // Загрузим тестовые данные, если нужно
        seedTestData();
    }

    // автозапуск
    window.addEventListener("DOMContentLoaded", initApp);

// =====================================================
// конец файла script.js
// =====================================================
