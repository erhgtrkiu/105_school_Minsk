document.addEventListener('DOMContentLoaded', function() {
    let currentUser = null;
    let currentWeek = 1;
    let currentGroup = null;
    let unansweredQuestions = 0;
    let currentQuestionId = null;

    const usersDatabase = {
        'admin': { password: 'admin123', role: 'admin', name: 'Администратор', approved: true }
    };

    const teacherRequests = [];

    const appData = {
        questions: [],
        students: [
            { id: 1, name: "Иван Иванов", group: "A" },
            { id: 2, name: "Мария Петрова", group: "A" },
            { id: 3, name: "Алексей Смирнов", group: "B" },
            { id: 4, name: "Анна Сидорова", group: "B" }
        ],
        teachers: [
            { id: 1, name: "Ли Хуа", subject: "Китайский язык", experience: "10 лет" },
            { id: 2, name: "Чжан Вэй", subject: "Китайская культура", experience: "7 лет" }
        ],
        groups: {
            A: { name: "Группа А", students: [1,2], teacher: 1 },
            B: { name: "Группа B", students: [3,4], teacher: 2 }
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

    function initApp() {
        loadAllData();
        initEventListeners();
        initData();
        checkHolidays();
        showRandomFact();
        loadTheme();
        checkAutoLogin();
        
        changePage('teachers');
        document.querySelector('.menu-item[data-page="teachers"]').classList.add('active');
        
        document.body.style.opacity = 0;
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease-in';
            document.body.style.opacity = 1;
        }, 100);
    }

    function initEventListeners() {
        document.querySelectorAll('.menu-item[data-page]').forEach(item => {
            item.addEventListener('click', () => {
                changePage(item.dataset.page);
                document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
            });
        });

        document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

        document.getElementById('qa-button').addEventListener('click', () => {
            showModal(document.getElementById('qa-modal'));
            renderQuestions();
            unansweredQuestions = 0;
            updateNotificationBadge();
        });

        document.getElementById('send-question').addEventListener('click', sendQuestion);

        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').style.display = 'none';
            });
        });

        document.getElementById('login-btn').addEventListener('click', () => {
            if (currentUser) {
                logout();
            } else {
                showModal(document.getElementById('auth-modal'));
                switchAuthTab('login');
            }
        });

        document.getElementById('register-btn').addEventListener('click', () => {
            showModal(document.getElementById('auth-modal'));
            switchAuthTab('register');
        });

        document.getElementById('login-submit').addEventListener('click', login);
        document.getElementById('register-submit').addEventListener('click', register);

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                switchAuthTab(btn.dataset.tab);
            });
        });

        document.getElementById('prev-week').addEventListener('click', () => changeWeek(-1));
        document.getElementById('next-week').addEventListener('click', () => changeWeek(1));

        document.getElementById('translate-btn').addEventListener('click', translateText);

        // 🔹 обработчик кнопки заявок учителей
        document.getElementById('view-requests').addEventListener('click', () => {
            if (!checkAdminAccess()) return;
            showModal(document.getElementById('teacher-requests-modal'));
            renderTeacherRequests();
        });
    }
    function initData() {
        initTeachers();
        initStudents();
        initGroupsPage();
        renderSchedule();
        renderExtraLessons();
    }

    function initTeachers() {
        const list = document.querySelector('.teacher-list');
        list.innerHTML = '';
        appData.teachers.forEach(t => {
            const div = document.createElement('div');
            div.className = 'teacher-card';
            div.innerHTML = `<h3>${t.name}</h3><p>${t.subject}</p><p>Стаж: ${t.experience}</p>`;
            list.appendChild(div);
        });
    }

    function initStudents() {
        const list = document.querySelector('.student-list');
        list.innerHTML = '';
        appData.students.forEach(s => {
            const div = document.createElement('div');
            div.className = 'student-card';
            div.innerHTML = `<h3>${s.name}</h3><p>Группа: ${s.group}</p>`;
            list.appendChild(div);
        });
    }

    function initGroupsPage() {
        const container = document.querySelector('.groups-container');
        container.innerHTML = '';
        Object.entries(appData.groups).forEach(([key, group]) => {
            const teacher = appData.teachers.find(t => t.id === group.teacher);
            const div = document.createElement('div');
            div.className = 'group-card';
            div.innerHTML = `
                <h3>${group.name}</h3>
                <p>Учитель: ${teacher ? teacher.name : '—'}</p>
                <p>Ученики: ${group.students.map(id => appData.students.find(s => s.id === id)?.name).join(', ')}</p>
            `;
            div.addEventListener('click', () => {
                currentGroup = key;
                changePage('students');
                document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
            });
            container.appendChild(div);
        });
    }

    function renderSchedule() {
        const body = document.getElementById('schedule-body');
        body.innerHTML = '';
        const lessons = appData.schedule[currentWeek] || [];
        lessons.forEach(l => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${l.day}</td><td>${l.time}</td><td>${l.group}</td><td>${l.subject}</td><td>${l.teacher}</td>`;
            body.appendChild(tr);
        });
        document.getElementById('week-label').textContent = `Неделя ${currentWeek}`;
    }

    function renderExtraLessons() {
        const container = document.querySelector('.extra-lessons');
        container.innerHTML = '';
        appData.extraLessons.forEach(lesson => {
            const div = document.createElement('div');
            div.className = 'lesson-card';
            div.innerHTML = `<h4>${lesson.title}</h4><p>${lesson.desc}</p><p>${lesson.time}</p>`;
            container.appendChild(div);
        });
    }

    function changePage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
    }

    function changeWeek(delta) {
        currentWeek += delta;
        if (currentWeek < 1) currentWeek = 1;
        if (currentWeek > Object.keys(appData.schedule).length) currentWeek = Object.keys(appData.schedule).length;
        renderSchedule();
    }

    function login() {
        const login = document.getElementById('login-name').value;
        const pass = document.getElementById('login-password').value;
        const user = usersDatabase[login];
        if (!user || user.password !== pass) {
            showNotification("Неверный логин или пароль");
            return;
        }
        if (!user.approved) {
            showNotification("Администратор отклонил ваш запрос или он ещё не подтверждён");
            return;
        }
        currentUser = { login, role: user.role, name: user.name };
        saveAllData();
        document.getElementById('auth-modal').style.display = 'none';
        showNotification(`Добро пожаловать, ${user.name}`);
    }

    function register() {
        const login = document.getElementById('register-name').value;
        const pass = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        const role = document.getElementById('register-role').value;
        const fullName = document.getElementById('register-fullname').value;

        if (!login || !pass || !confirm || !fullName) {
            showNotification("Заполните все поля");
            return;
        }
        if (pass !== confirm) {
            showNotification("Пароли не совпадают");
            return;
        }
        if (usersDatabase[login]) {
            showNotification("Такой пользователь уже есть");
            return;
        }

        if (role === 'teacher') {
            teacherRequests.push({ login, password: pass, name: fullName, role, approved: false });
            showNotification("Заявка учителя отправлена администратору");
        } else {
            usersDatabase[login] = { password: pass, role, name: fullName, approved: true };
            currentUser = { login, role, name: fullName };
            showNotification("Регистрация успешна!");
        }
        saveAllData();
        document.getElementById('auth-modal').style.display = 'none';
    }

    function logout() {
        currentUser = null;
        localStorage.removeItem('portal_user');
        showNotification("Вы вышли");
    }
    // 🔹 Рендер заявок учителей
    function renderTeacherRequests() {
        const list = document.querySelector('.teacher-requests-list');
        list.innerHTML = teacherRequests.length ? '' : '<p>Нет заявок</p>';
        teacherRequests.forEach((req, i) => {
            const div = document.createElement('div');
            div.className = 'teacher-request-item';
            div.innerHTML = `
                <p><strong>ФИО:</strong> ${req.name}</p>
                <p><strong>Логин:</strong> ${req.login}</p>
                <p><strong>Пароль:</strong> ${req.password}</p>
                <button class="approve-btn">Принять</button>
                <button class="reject-btn">Отклонить</button>
            `;
            div.querySelector('.approve-btn').addEventListener('click', () => approveTeacher(i));
            div.querySelector('.reject-btn').addEventListener('click', () => rejectTeacher(i));
            list.appendChild(div);
        });
    }

    // 🔹 Подтверждение заявки
    function approveTeacher(i) {
        const req = teacherRequests[i];
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
            experience: "0 лет"
        });
        teacherRequests.splice(i, 1);
        saveAllData();
        renderTeacherRequests();
        initTeachers();
        showNotification(`Учитель ${req.name} принят!`);
    }

    // 🔹 Отклонение заявки
    function rejectTeacher(i) {
        const req = teacherRequests[i];
        teacherRequests.splice(i, 1);
        saveAllData();
        renderTeacherRequests();
        showNotification(`Администратор отклонил заявку ${req.name}`);
    }

    function sendQuestion() {
        const text = document.getElementById('question-input').value.trim();
        if (!text) return;
        const question = {
            id: Date.now(),
            text,
            answer: null,
            author: currentUser?.name || "Аноним"
        };
        appData.questions.push(question);
        saveAllData();
        renderQuestions();
        document.getElementById('question-input').value = '';
        showNotification("Вопрос отправлен");
    }

    function renderQuestions() {
        const container = document.querySelector('.qa-container');
        container.innerHTML = '';
        appData.questions.forEach(q => {
            const div = document.createElement('div');
            div.className = 'question-card';
            div.innerHTML = `
                <div class="question">${q.text} <small>— ${q.author}</small></div>
                ${q.answer ? `<div class="answer teacher">${q.answer}</div>` : ''}
            `;
            container.appendChild(div);
        });
    }

    function updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        badge.textContent = unansweredQuestions;
        badge.style.display = unansweredQuestions > 0 ? 'inline-block' : 'none';
    }

    function checkHolidays() {
        const today = new Date().toISOString().split('T')[0];
        if (appData.holidays[today]) {
            const notif = document.createElement('div');
            notif.className = 'holiday-notification';
            notif.textContent = `Сегодня праздник: ${appData.holidays[today]}`;
            document.body.appendChild(notif);
            setTimeout(() => notif.remove(), 5000);
        }
    }

    function showRandomFact() {
        const fact = appData.chineseFacts[Math.floor(Math.random() * appData.chineseFacts.length)];
        document.getElementById('china-fact').textContent = fact;
    }

    function toggleTheme() {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    }

    function loadTheme() {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.body.classList.add('dark');
        }
    }
    function showModal(modal) {
        modal.style.display = 'flex';
    }

    function switchAuthTab(tab) {
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById(tab).classList.add('active');
    }

    function showNotification(msg) {
        const area = document.getElementById('notification-area') || createNotificationArea();
        const div = document.createElement('div');
        div.className = 'notification-message';
        div.textContent = msg;
        area.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    function createNotificationArea() {
        const area = document.createElement('div');
        area.id = 'notification-area';
        document.body.appendChild(area);
        return area;
    }

    // === ХРАНИЛИЩЕ ДАННЫХ ===
    function saveAllData() {
        localStorage.setItem('portal_data', JSON.stringify(appData));
        localStorage.setItem('portal_users', JSON.stringify(usersDatabase));
        localStorage.setItem('portal_requests', JSON.stringify(teacherRequests));
        if (currentUser) {
            localStorage.setItem('portal_user', JSON.stringify(currentUser));
        }
    }

    function loadAllData() {
        const data = localStorage.getItem('portal_data');
        if (data) Object.assign(appData, JSON.parse(data));

        const users = localStorage.getItem('portal_users');
        if (users) Object.assign(usersDatabase, JSON.parse(users));

        const reqs = localStorage.getItem('portal_requests');
        if (reqs) {
            teacherRequests.splice(0, teacherRequests.length, ...JSON.parse(reqs));
        }

        const user = localStorage.getItem('portal_user');
        if (user) currentUser = JSON.parse(user);
    }

    function checkAutoLogin() {
        if (currentUser) {
            showNotification(`Добро пожаловать обратно, ${currentUser.name}`);
        }
    }

    // === СИНХРОНИЗАЦИЯ между вкладками ===
    window.addEventListener('storage', e => {
        if (e.key === 'portal_data' || e.key === 'portal_users' || e.key === 'portal_requests') {
            loadAllData();
            initTeachers();
            renderTeacherRequests();
            renderQuestions();
        }
    });

    // Проверка прав администратора
    function checkAdminAccess() {
        if (!currentUser || currentUser.role !== 'admin') {
            showNotification("Только администратор может выполнять это действие");
            return false;
        }
        return true;
    }

    // === Переводчик (фиктивный) ===
    function translateText() {
        const from = document.getElementById('from-text').value;
        const fromLang = document.getElementById('from-lang').value;
        const toLang = document.getElementById('to-lang').value;
        if (!from) {
            showNotification("Введите текст для перевода");
            return;
        }
        document.getElementById('to-text').value = `[${fromLang}→${toLang}] ${from}`;
    }

    // Запуск приложения
    initApp();
});
