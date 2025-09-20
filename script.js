document.addEventListener('DOMContentLoaded', function() {
    // ---------- Основные переменные ----------
    let currentUser = null;
    let currentWeek = 1;
    let currentGroup = null;
    let unansweredQuestions = 0;
    let currentQuestionId = null;
    let factIntervalId = null;

    // ---------- База данных пользователей (админ по умолчанию) ----------
    const usersDatabase = {
        'admin': { 
            password: 'admin123', 
            role: 'admin', 
            name: 'Администратор', 
            approved: true 
        }
    };

    // Запросы на регистрацию учителей
    const teacherRequests = [];

    // Данные приложения
    const appData = {
        questions: [],
        students: [
            { id: 1, name: "Рудый Михаил Игоревич", group: "A", class: "10A" },
            { id: 2, name: "Иванов Иван Иванович", group: "B", class: "10A" },
            { id: 3, name: "Петрова Анна Сергеевна", group: "C", class: "9A" }
        ],
        teachers: [
            { id: 1, name: 'Иванова Мария', subject: 'Китайский язык', experience: '10 лет' },
            { id: 2, name: 'Петрова Анна', subject: 'Китайская литература', experience: '8 лет' }
        ],
        groups: {
            'A': ["Рудый Михаил Игоревич"],
            'B': ["Иванов Иван Иванович"],
            'C': ["Петрова Анна Сергеевна"],
            'D': [],
            'E': []
        },
        schedule: {
            '5A': {
                'Понедельник': { '9:00-10:00': 'Китайский язык (101)' },
                'Вторник': { '9:00-10:00': 'История Китая (301)' }
            }
        },
        extraLessons: [
            { id: 1, day: "Понедельник", time: "15:30-17:00", subject: "Каллиграфия", teacher: "Иванова М.И.", classroom: "305" }
        ],
        chineseFacts: [
            "Китай - третья по величине страна в мире",
            "Бумага была изобретена в Китае",
            "Великая Китайская стена - самое длинное сооружение",
            "Чай был открыт в Китае более 4700 лет назад",
            "Китайская цивилизация - одна из древнейших в мире"
        ],
        holidays: {
            '01-01': { title: 'Новый год', message: 'С Новым годом!' }
        }
    };

    // ---------- Инициализация приложения ----------
    function initApp() {
        console.log('Инициализация приложения...');

        // Загружаем данные из localStorage
        const savedData = localStorage.getItem('chinese_school_data');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                if (data.appData) {
                    // merge but keep current appData as base
                    Object.assign(appData, data.appData);
                }
                if (data.usersDatabase) {
                    Object.assign(usersDatabase, data.usersDatabase);
                }
                if (data.teacherRequests) {
                    teacherRequests.length = 0;
                    teacherRequests.push(...data.teacherRequests);
                }
                console.log('Данные загружены из localStorage');
            } catch (e) {
                console.error('Ошибка загрузки данных:', e);
            }
        }

        // Загружаем текущего пользователя
        const savedUser = localStorage.getItem('chinese_school_current_user');
        if (savedUser) {
            try {
                currentUser = JSON.parse(savedUser);
                console.log('Пользователь загружен:', currentUser.name);
            } catch (e) {
                console.error('Ошибка загрузки пользователя:', e);
            }
        }

        initEventListeners();
        initData();
        updateUIForUser();

        // Показываем первую страницу, если элемент существует
        if (document.getElementById('teachers')) {
            changePage('teachers');
        } else {
            // если нет teachers - откроем любую существующую страницу
            const page = document.querySelector('.page');
            if (page && page.id) changePage(page.id);
        }

        // Запускаем показ фактов
        showRandomFact();

        // Загружаем тему
        loadTheme();

        console.log('Приложение инициализировано');
    }

    // ---------- Сохранение всех данных ----------
    function saveAllData() {
        try {
            const dataToSave = {
                appData: appData,
                usersDatabase: usersDatabase,
                teacherRequests: teacherRequests
            };

            localStorage.setItem('chinese_school_data', JSON.stringify(dataToSave));
            if (currentUser) {
                localStorage.setItem('chinese_school_current_user', JSON.stringify(currentUser));
            } else {
                localStorage.removeItem('chinese_school_current_user');
            }
            console.log('Данные сохранены');
        } catch (e) {
            console.error('Ошибка сохранения данных:', e);
        }
    }

    // ---------- Инициализация обработчиков ----------
    function initEventListeners() {
        console.log('Инициализация обработчиков событий...');

        // Горизонтальное меню - плашки под иероглифами
        const topMenuItems = document.querySelectorAll('.top-menu-item');
        console.log('Найдено элементов верхнего меню:', topMenuItems.length);

        topMenuItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const targetPage = this.getAttribute('data-page');
                console.log('Клик по меню:', targetPage);

                // Если страница не существует — показываем предупреждение и выходим
                if (!document.getElementById(targetPage)) {
                    console.warn('Целевая страница не найдена в DOM:', targetPage);
                    // всё равно обновим active класс, чтобы пользователь видел ответ
                    document.querySelectorAll('.top-menu-item').forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                    return;
                }

                // Если требуется авторизация и есть модалка авторизации — показываем ее.
                const authModalExists = !!document.getElementById('auth-modal');
                if (!currentUser && targetPage !== 'resources') {
                    showNotification('Сначала войдите в систему');
                    if (authModalExists) {
                        showModal('auth-modal');
                        return;
                    } else {
                        // Если модалки нет, позволим перейти (чтобы интерфейс не "завис")
                        console.warn('auth-modal не найден, переходим на страницу без модалки');
                    }
                }

                changePage(targetPage);

                // Обновляем active класс
                document.querySelectorAll('.top-menu-item').forEach(i => {
                    i.classList.remove('active');
                });
                this.classList.add('active');
            });
        });

        // Кнопки входа/регистрации в шапке
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');

        if (loginBtn) {
            loginBtn.addEventListener('click', handleAuthButtonClick);
        }
        if (registerBtn) {
            registerBtn.addEventListener('click', function() {
                showModal('auth-modal');
                switchAuthTab('register');
            });
        }

        // Закрытие модальных окон (по крестикам)
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal');
                if (modal) {
                    hideModal(modal.id);
                }
            });
        });

        // Формы авторизации
        const loginSubmit = document.getElementById('login-submit');
        const registerSubmit = document.getElementById('register-submit');

        if (loginSubmit) loginSubmit.addEventListener('click', login);
        if (registerSubmit) registerSubmit.addEventListener('click', register);

        // Вкладки авторизации
        document.querySelectorAll('.auth-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                switchAuthTab(this.getAttribute('data-tab'));
            });
        });

        // Тема
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }

        // Кнопка вопрос-ответ
        const qaButton = document.getElementById('qa-button');
        if (qaButton) {
            qaButton.addEventListener('click', handleQAClick);
        }

        // Группы — делегирование: если у вас статические элементы .group
        document.querySelectorAll('.group').forEach(group => {
            group.addEventListener('click', function() {
                selectGroup(this.getAttribute('data-group'));
            });
        });

        // Кнопки управления: используем setupButton для предохранения от отсутствия кнопок
        setupButton('add-teacher', () => {
            if (!checkAdminAccess()) return;
            showModal('teacher-modal');
        });

        setupButton('save-teacher', addTeacher);
        setupButton('edit-teachers', () => {
            if (!checkAdminAccess()) return;
            showModal('edit-teachers-modal');
            initTeachersEditList();
        });

        setupButton('manage-requests', () => {
            if (!checkAdminAccess()) return;
            showModal('requests-modal');
            initRequestsList();
        });

        setupButton('add-student', () => {
            if (!checkTeacherAccess()) return;
            showModal('student-modal');
        });

        setupButton('save-student', addStudent);
        setupButton('add-lesson', () => {
            if (!checkTeacherAccess()) return;
            showModal('lesson-modal');
        });

        setupButton('save-lesson', addLesson);
        setupButton('add-extra', () => {
            if (!checkTeacherAccess()) return;
            showModal('extra-modal');
        });

        setupButton('save-extra', addExtraLesson);

        // Навигация по неделям
        setupButton('prev-week', () => {
            if (currentWeek > 1) currentWeek--;
            updateWeekDisplay();
        });

        setupButton('next-week', () => {
            currentWeek++;
            updateWeekDisplay();
        });

        // Выбор класса
        const classSelect = document.getElementById('class-select');
        if (classSelect) {
            classSelect.addEventListener('change', initSchedule);
        }

        // Вопрос-ответ: отправка
        setupButton('submit-question', submitQuestion);
        setupButton('submit-answer', submitAnswer);

        // Закрытие праздничного окна
        setupButton('close-holiday', () => {
            hideModal('holiday-modal');
        });

        // Вкладки QA
        document.querySelectorAll('.qa-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                switchQATab(this.getAttribute('data-tab'));
            });
        });

        console.log('Все обработчики событий инициализированы');
    }

    function setupButton(id, handler) {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', handler);
        } else {
            // Часто на страницах эти кнопки могут отсутствовать — это нормально
            // Используем предупреждение для отладки
            console.warn('Кнопка не найдена:', id);
        }
    }

    function checkAdminAccess() {
        if (!currentUser || currentUser.role !== 'admin') {
            showNotification('Только администратор имеет доступ');
            return false;
        }
        return true;
    }

    function checkTeacherAccess() {
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'teacher')) {
            showNotification('Только учителя и администраторы имеют доступ');
            return false;
        }
        return true;
    }

    function handleAuthButtonClick(e) {
        // если кликнули по кнопке входа и уже залогинен — выйдем
        const el = e.currentTarget;
        if (el && el.id === 'login-btn' && currentUser) {
            logout();
        } else {
            showModal('auth-modal');
            if (el && el.id === 'register-btn') {
                switchAuthTab('register');
            }
        }
    }

    function handleQAClick() {
        if (!currentUser) {
            showNotification('Сначала войдите в систему');
            const authModalExists = !!document.getElementById('auth-modal');
            if (authModalExists) showModal('auth-modal');
            return;
        }
        showModal('qa-modal');
        updateQAContent();
    }

    // ---------- Основные функции приложения ----------
    function changePage(pageId) {
        console.log('Переключение на страницу:', pageId);

        // Скрываем все страницы
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active');
        });

        // Показываем выбранную страницу
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.style.display = 'block';
            setTimeout(() => targetPage.classList.add('active'), 10);

            // Инициализация при открытии страницы
            switch (pageId) {
                case 'groups':
                    initGroupsPage();
                    break;
                case 'lessons':
                    initSchedule();
                    break;
                case 'extra':
                    initExtraLessons();
                    break;
                case 'teachers':
                    initTeachers();
                    break;
                case 'resources':
                    // ничего не требуется
                    break;
                default:
                    // безопасный вариант: если нужно, можно вызвать initData
                    break;
            }
        } else {
            console.warn('targetPage не найден для changePage:', pageId);
        }
    }

    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            // небольшая задержка для плавного появления
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 10);
        } else {
            console.warn('showModal: модалка не найдена:', modalId);
        }
    }

    function hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => modal.style.display = 'none', 300);
        } else {
            console.warn('hideModal: модалка не найдена:', modalId);
        }
    }

    function showNotification(message, timeout = 3000) {
        console.log('Уведомление:', message);
        // Если есть элемент-уведомление на странице, используем его
        const existing = document.querySelector('.custom-notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'custom-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3498db;
            color: white;
            padding: 12px 18px;
            border-radius: 6px;
            z-index: 2000;
            font-weight: 600;
            box-shadow: 0 6px 18px rgba(0,0,0,0.12);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 400);
        }, timeout);
    }

    // ---------- Инициализация данных ----------
    function initData() {
        initTeachers();
        initGroupsPage();
        initSchedule();
        initExtraLessons();
        updateUnansweredCount();
    }

    function initTeachers() {
        const teacherList = document.querySelector('.teacher-list');
        if (!teacherList) return;

        teacherList.innerHTML = '';
        appData.teachers.forEach(teacher => {
            const card = document.createElement('div');
            card.className = 'teacher-card';
            card.innerHTML = `
                <h3>${teacher.name}</h3>
                <p>${teacher.subject}</p>
                <p>Стаж: ${teacher.experience}</p>
            `;
            teacherList.appendChild(card);
        });
    }

    function initTeachersEditList() {
        const editList = document.querySelector('.teachers-edit-list');
        if (!editList) return;

        editList.innerHTML = '';
        appData.teachers.forEach(teacher => {
            const item = document.createElement('div');
            item.className = 'teacher-edit-item';
            item.innerHTML = `
                <input type="text" value="${teacher.name}" data-field="name">
                <input type="text" value="${teacher.subject}" data-field="subject">
                <input type="text" value="${teacher.experience}" data-field="experience">
                <button class="delete-teacher" data-id="${teacher.id}">Удалить</button>
            `;

            item.querySelector('.delete-teacher').addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                appData.teachers = appData.teachers.filter(t => t.id !== id);
                saveAllData();
                initTeachers();
                initTeachersEditList();
            });

            editList.appendChild(item);
        });
    }

    function initRequestsList() {
        const requestsList = document.querySelector('.requests-list');
        if (!requestsList) return;

        requestsList.innerHTML = '';
        teacherRequests.forEach((request, index) => {
            if (request.status === 'pending') {
                const item = document.createElement('div');
                item.className = 'request-item';
                item.innerHTML = `
                    <h4>${request.name}</h4>
                    <p>Логин: ${request.login}</p>
                    <p>Пароль: ${request.password}</p>
                    <div class="request-buttons">
                        <button class="approve-request" data-index="${index}">Принять</button>
                        <button class="reject-request" data-index="${index}">Отклонить</button>
                    </div>
                `;

                item.querySelector('.approve-request').addEventListener('click', function() {
                    const idx = parseInt(this.getAttribute('data-index'));
                    approveTeacherRequest(idx);
                });

                item.querySelector('.reject-request').addEventListener('click', function() {
                    const idx = parseInt(this.getAttribute('data-index'));
                    rejectTeacherRequest(idx);
                });

                requestsList.appendChild(item);
            }
        });
    }

    function approveTeacherRequest(index) {
        const request = teacherRequests[index];
        if (request) {
            usersDatabase[request.login] = {
                password: request.password,
                role: 'teacher',
                name: request.name,
                approved: true
            };

            appData.teachers.push({
                id: Date.now(),
                name: request.name,
                subject: 'Китайский язык',
                experience: 'Новый учитель'
            });

            teacherRequests.splice(index, 1);

            saveAllData();
            initRequestsList();
            initTeachers();
            showNotification('Учитель принят в систему');
        }
    }

    function rejectTeacherRequest(index) {
        teacherRequests.splice(index, 1);
        saveAllData();
        initRequestsList();
        showNotification('Запрос отклонен');
    }

    function initSchedule() {
        const table = document.querySelector('.schedule-table');
        if (!table) return;

        const classSelect = document.getElementById('class-select');
        const selectedClass = classSelect ? classSelect.value : Object.keys(appData.schedule)[0] || '5A';

        const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
        const times = ['9:00-10:00', '10:15-11:15', '11:30-12:30', '13:00-14:00', '14:15-15:15'];

        let html = '<tr><th>Время</th>';
        days.forEach(day => html += `<th>${day}</th>`);
        html += '</tr>';

        times.forEach(time => {
            html += `<tr><td>${time}</td>`;
            days.forEach(day => {
                const lesson = appData.schedule[selectedClass]?.[day]?.[time] || '';
                html += `<td>${lesson}</td>`;
            });
            html += '</tr>';
        });

        table.innerHTML = html;
        updateWeekDisplay();
    }

    function initExtraLessons() {
        const table = document.querySelector('.extra-table');
        if (!table) return;

        let html = `
            <tr>
                <th>День</th>
                <th>Время</th>
                <th>Занятие</th>
                <th>Преподаватель</th>
                <th>Кабинет</th>
                ${currentUser?.role === 'admin' || currentUser?.role === 'teacher' ? '<th>Действия</th>' : ''}
            </tr>
        `;

        appData.extraLessons.forEach(lesson => {
            html += `
                <tr>
                    <td>${lesson.day}</td>
                    <td>${lesson.time}</td>
                    <td>${lesson.subject}</td>
                    <td>${lesson.teacher}</td>
                    <td>${lesson.classroom}</td>
                    ${currentUser?.role === 'admin' || currentUser?.role === 'teacher' ? 
                        `<td>
                            <button class="edit-extra" data-id="${lesson.id}">✏️</button>
                            <button class="delete-extra" data-id="${lesson.id}">🗑️</button>
                        </td>` : ''}
                </tr>
            `;
        });

        table.innerHTML = html;

        // Обработчики для кнопок (если они есть)
        document.querySelectorAll('.edit-extra').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                editExtraLesson(id);
            });
        });

        document.querySelectorAll('.delete-extra').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteExtraLesson(id);
            });
        });
    }

    function editExtraLesson(id) {
        const lesson = appData.extraLessons.find(l => l.id === id);
        if (lesson) {
            const dayEl = document.getElementById('extra-day');
            const timeEl = document.getElementById('extra-time');
            const subjectEl = document.getElementById('extra-subject');
            const teacherEl = document.getElementById('extra-teacher');
            const classroomEl = document.getElementById('extra-classroom');
            const saveBtn = document.getElementById('save-extra');

            if (dayEl) dayEl.value = lesson.day;
            if (timeEl) timeEl.value = lesson.time;
            if (subjectEl) subjectEl.value = lesson.subject;
            if (teacherEl) teacherEl.value = lesson.teacher;
            if (classroomEl) classroomEl.value = lesson.classroom;

            if (saveBtn) saveBtn.setAttribute('data-edit-id', id);
            showModal('extra-modal');
        }
    }

    function deleteExtraLesson(id) {
        if (!confirm('Удалить это занятие?')) return;
        const index = appData.extraLessons.findIndex(l => l.id === id);
        if (index !== -1) {
            appData.extraLessons.splice(index, 1);
            saveAllData();
            initExtraLessons();
            showNotification('Занятие удалено');
        }
    }

    // ---------- Авторизация ----------
    function switchAuthTab(tabName) {
        document.querySelectorAll('.auth-tabs .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
        });

        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === tabName);
        });
    }

    function login() {
        const loginNameEl = document.getElementById('login-name');
        const passwordEl = document.getElementById('login-password');

        const loginName = loginNameEl ? loginNameEl.value.trim() : '';
        const password = passwordEl ? passwordEl.value : '';

        if (!loginName || !password) {
            showNotification('Заполните все поля');
            return;
        }

        const user = usersDatabase[loginName];

        if (!user || user.password !== password) {
            showNotification('Неверный логин или пароль');
            return;
        }

        if (!user.approved) {
            showNotification('Ваш аккаунт ожидает подтверждения администратора');
            return;
        }

        currentUser = { 
            login: loginName,
            name: user.name, 
            role: user.role 
        };

        updateUIForUser();
        hideModal('auth-modal');
        showNotification(`Добро пожаловать, ${user.name}!`);
        saveAllData();
    }

    function register() {
        const loginNameEl = document.getElementById('register-name');
        const passwordEl = document.getElementById('register-password');
        const confirmEl = document.getElementById('register-confirm');
        const roleEl = document.getElementById('register-role');
        const fullNameEl = document.getElementById('register-fullname');

        const loginName = loginNameEl ? loginNameEl.value.trim() : '';
        const password = passwordEl ? passwordEl.value : '';
        const confirm = confirmEl ? confirmEl.value : '';
        const role = roleEl ? roleEl.value : 'student';
        const fullName = fullNameEl ? fullNameEl.value.trim() : '';

        if (!loginName || !password || !confirm || !fullName) {
            showNotification('Заполните все поля');
            return;
        }

        if (password !== confirm) {
            showNotification('Пароли не совпадают');
            return;
        }

        if (usersDatabase[loginName]) {
            showNotification('Пользователь с таким логином уже существует');
            return;
        }

        if (role === 'teacher') {
            teacherRequests.push({
                login: loginName,
                password: password,
                name: fullName,
                role: role,
                timestamp: new Date().toISOString(),
                status: 'pending'
            });

            showNotification('Запрос на регистрацию учителя отправлен администратору');
        } else {
            usersDatabase[loginName] = {
                password: password,
                role: role,
                name: fullName,
                approved: true
            };

            currentUser = { 
                login: loginName,
                name: fullName, 
                role: role 
            };

            showNotification(`Регистрация успешна! Добро пожаловать, ${fullName}!`);
        }

        hideModal('auth-modal');
        saveAllData();
        updateUIForUser();
    }

    function logout() {
        currentUser = null;
        updateUIForUser();
        showNotification('До свидания!');
        saveAllData();
    }

    function updateUIForUser() {
        const isTeacher = currentUser?.role === 'teacher';
        const isAdmin = currentUser?.role === 'admin';

        // Показываем/скрываем элементы управления
        document.querySelectorAll('.teacher-controls').forEach(el => {
            el.style.display = (isTeacher || isAdmin) ? 'block' : 'none';
        });

        document.querySelectorAll('.admin-controls').forEach(el => {
            el.style.display = isAdmin ? 'block' : 'none';
        });

        // Обновляем кнопки входа/выхода
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');

        if (currentUser) {
            if (loginBtn) loginBtn.textContent = 'Выйти';
            if (registerBtn) registerBtn.textContent = currentUser.name;
        } else {
            if (loginBtn) loginBtn.textContent = 'Войти';
            if (registerBtn) registerBtn.textContent = 'Регистрация';
        }
    }

    // ---------- Тема ----------
    function toggleTheme() {
        document.body.classList.toggle('night-theme');
        const isNight = document.body.classList.contains('night-theme');
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = isNight ? '☀️' : '🌙';
        }
        localStorage.setItem('theme', isNight ? 'night' : 'day');
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'night') {
            document.body.classList.add('night-theme');
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
                themeToggle.textContent = '☀️';
            }
        }
    }

    // ---------- Факты о Китае ----------
    function showRandomFact() {
        const factElement = document.getElementById('china-fact');
        if (!factElement) {
            console.warn('Элемент для фактов не найден');
            return;
        }

        // Показываем первый факт сразу
        const randomIndex = Math.floor(Math.random() * appData.chineseFacts.length);
        factElement.textContent = appData.chineseFacts[randomIndex];

        // Меняем факты каждые 10 секунд (если еще не запущено)
        if (factIntervalId) clearInterval(factIntervalId);
        factIntervalId = setInterval(() => {
            const newIndex = Math.floor(Math.random() * appData.chineseFacts.length);
            factElement.style.opacity = '0';
            setTimeout(() => {
                factElement.textContent = appData.chineseFacts[newIndex];
                factElement.style.opacity = '1';
            }, 500);
        }, 10000);
    }

    // ---------- Вопрос-ответ ----------
    function switchQATab(tabName) {
        document.querySelectorAll('.qa-tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
        });

        document.querySelectorAll('.qa-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }

    function submitQuestion() {
        const questionTextEl = document.getElementById('question-text');
        const questionText = questionTextEl ? questionTextEl.value.trim() : '';

        if (!questionText) {
            showNotification('Введите вопрос');
            return;
        }

        const newQuestion = {
            id: Date.now(),
            student: currentUser ? currentUser.name : 'Гость',
            question: questionText,
            answered: false,
            answer: '',
            date: new Date().toLocaleDateString()
        };

        appData.questions.push(newQuestion);
        saveAllData();
        if (questionTextEl) questionTextEl.value = '';
        showNotification('Вопрос отправлен!');
        updateQAContent();
    }

    function submitAnswer() {
        const answerTextEl = document.getElementById('answer-text');
        const answerText = answerTextEl ? answerTextEl.value.trim() : '';

        if (!answerText) {
            showNotification('Введите ответ');
            return;
        }

        const question = appData.questions.find(q => q.id === currentQuestionId);
        if (question) {
            question.answered = true;
            question.answer = answerText;
            question.answeredBy = currentUser ? currentUser.name : 'Преподаватель';
            question.answerDate = new Date().toLocaleDateString();

            saveAllData();
            hideModal('answer-modal');
            showNotification('Ответ отправлен!');
            updateQAContent();
        } else {
            showNotification('Вопрос не найден');
        }
    }

    function updateQAContent() {
        const myQuestions = appData.questions.filter(q => q.student === currentUser?.name);
        const myQuestionsList = document.querySelector('#questions-tab .questions-list');
        if (myQuestionsList) {
            myQuestionsList.innerHTML = myQuestions.length ? '' : '<p>У вас пока нет вопросов</p>';
            myQuestions.forEach(q => {
                const questionItem = createQuestionItem(q);
                myQuestionsList.appendChild(questionItem);
            });
        }

        if (currentUser?.role === 'teacher' || currentUser?.role === 'admin') {
            const allQuestionsList = document.querySelector('#all-questions-tab .all-questions-list');
            if (allQuestionsList) {
                allQuestionsList.innerHTML = appData.questions.length ? '' : '<p>Вопросов пока нет</p>';
                appData.questions.forEach(q => {
                    const questionItem = createQuestionItem(q, true);
                    allQuestionsList.appendChild(questionItem);
                });
            }
        }
    }

    function createQuestionItem(question, showAnswerButton = false) {
        const div = document.createElement('div');
        div.className = `question-item ${question.answered ? '' : 'unanswered'}`;

        div.innerHTML = `
            <div class="question-text">${escapeHtml(question.question)}</div>
            <div class="question-meta"><small>${escapeHtml(question.student)}, ${escapeHtml(question.date)}</small></div>
            ${question.answered ? `
                <div class="answer-text">
                    <strong>Ответ:</strong> ${escapeHtml(question.answer)}
                    <br><small>${escapeHtml(question.answeredBy)}, ${escapeHtml(question.answerDate)}</small>
                </div>
            ` : ''}
            ${showAnswerButton && !question.answered ? `
                <button class="answer-btn" data-id="${question.id}">Ответить</button>
            ` : ''}
        `;

        if (showAnswerButton && !question.answered) {
            const answerBtn = div.querySelector('.answer-btn');
            if (answerBtn) {
                answerBtn.addEventListener('click', function() {
                    currentQuestionId = parseInt(this.getAttribute('data-id'));
                    showModal('answer-modal');
                });
            }
        }

        return div;
    }

    function updateUnansweredCount() {
        unansweredQuestions = appData.questions.filter(q => !q.answered).length;
        const badge = document.querySelector('.notification-badge');
        if (badge) badge.textContent = unansweredQuestions;
    }

    // ---------- Группы ----------
    function initGroupsPage() {
        // устанавливаем дефолтную группу, если не установлена
        if (!currentGroup) currentGroup = Object.keys(appData.groups)[0] || 'A';
        selectGroup(currentGroup);
    }

    function selectGroup(groupName) {
        currentGroup = groupName;
        document.querySelectorAll('.group').forEach(g => {
            g.classList.toggle('active', g.getAttribute('data-group') === groupName);
        });

        const currentGroupElement = document.getElementById('current-group');
        if (currentGroupElement) currentGroupElement.textContent = groupName;

        updateGroupStudents();
        updateAvailableStudents();
    }

    function updateGroupStudents() {
        const container = document.querySelector('.students-in-group');
        if (!container) return;

        container.innerHTML = '';
        const list = appData.groups[currentGroup] || [];
        list.forEach(studentName => {
            const div = document.createElement('div');
            div.className = 'student-item';
            div.innerHTML = `
                <span>${escapeHtml(studentName)}</span>
                <button class="remove-from-group">Удалить</button>
            `;

            div.querySelector('.remove-from-group').addEventListener('click', () => {
                removeStudentFromGroup(studentName);
            });

            container.appendChild(div);
        });
    }

    function updateAvailableStudents() {
        const container = document.querySelector('.students-to-add');
        if (!container) return;

        container.innerHTML = '';
        appData.students.forEach(student => {
            if (!appData.groups[currentGroup]?.includes(student.name)) {
                const div = document.createElement('div');
                div.className = 'student-item';
                div.innerHTML = `
                    <span>${escapeHtml(student.name)} (${escapeHtml(student.class || '')})</span>
                    <button class="add-to-group">Добавить</button>
                `;

                div.querySelector('.add-to-group').addEventListener('click', () => {
                    addStudentToGroup(student.name);
                });

                container.appendChild(div);
            }
        });
    }

    function addStudentToGroup(studentName) {
        if (!appData.groups[currentGroup]) appData.groups[currentGroup] = [];
        if (!appData.groups[currentGroup].includes(studentName)) {
            appData.groups[currentGroup].push(studentName);
            updateGroupStudents();
            updateAvailableStudents();
            saveAllData();
        }
    }

    function removeStudentFromGroup(studentName) {
        if (!appData.groups[currentGroup]) return;
        appData.groups[currentGroup] = appData.groups[currentGroup].filter(name => name !== studentName);
        updateGroupStudents();
        updateAvailableStudents();
        saveAllData();
    }

    // ---------- Управление данными ----------
    function addTeacher() {
        const nameEl = document.getElementById('teacher-name');
        const subjectEl = document.getElementById('teacher-subject');
        const experienceEl = document.getElementById('teacher-experience');

        const name = nameEl ? nameEl.value.trim() : '';
        const subject = subjectEl ? subjectEl.value.trim() : '';
        const experience = experienceEl ? experienceEl.value.trim() : '';

        if (!name || !subject || !experience) {
            showNotification('Заполните все поля');
            return;
        }

        const newTeacher = { 
            id: Date.now(), 
            name, 
            subject, 
            experience 
        };

        appData.teachers.push(newTeacher);
        saveAllData();
        initTeachers();

        hideModal('teacher-modal');
        showNotification('Учитель добавлен');
    }

    function addStudent() {
        const nameEl = document.getElementById('student-name');
        const studentClassEl = document.getElementById('student-class');
        const groupEl = document.getElementById('student-group');

        const name = nameEl ? nameEl.value.trim() : '';
        const studentClass = studentClassEl ? studentClassEl.value.trim() : '';
        const group = groupEl ? groupEl.value.trim() : null;

        if (!name) {
            showNotification('Введите ФИО ученика');
            return;
        }

        const newStudent = { 
            id: Date.now(), 
            name, 
            class: studentClass, 
            group 
        };

        appData.students.push(newStudent);

        if (group) {
            if (!appData.groups[group]) appData.groups[group] = [];
            if (!appData.groups[group].includes(name)) {
                appData.groups[group].push(name);
            }
        }

        saveAllData();

        if (currentGroup) {
            updateGroupStudents();
            updateAvailableStudents();
        }

        hideModal('student-modal');
        showNotification('Ученик добавлен');
    }

    function addLesson() {
        const dayEl = document.getElementById('lesson-day');
        const timeEl = document.getElementById('lesson-time');
        const subjectEl = document.getElementById('lesson-subject');
        const classroomEl = document.getElementById('lesson-classroom');
        const classSelectEl = document.getElementById('class-select');

        const day = dayEl ? dayEl.value.trim() : '';
        const time = timeEl ? timeEl.value.trim() : '';
        const subject = subjectEl ? subjectEl.value.trim() : '';
        const classroom = classroomEl ? classroomEl.value.trim() : '';
        const selectedClass = classSelectEl ? classSelectEl.value : '5A';

        if (!day || !time || !subject || !classroom) {
            showNotification('Заполните все поля');
            return;
        }

        if (!appData.schedule[selectedClass]) {
            appData.schedule[selectedClass] = {};
        }
        if (!appData.schedule[selectedClass][day]) {
            appData.schedule[selectedClass][day] = {};
        }

        appData.schedule[selectedClass][day][time] = `${subject} (${classroom})`;

        saveAllData();
        initSchedule();

        hideModal('lesson-modal');
        showNotification('Занятие добавлено в расписание');
    }

    function addExtraLesson() {
        const dayEl = document.getElementById('extra-day');
        const timeEl = document.getElementById('extra-time');
        const subjectEl = document.getElementById('extra-subject');
        const teacherEl = document.getElementById('extra-teacher');
        const classroomEl = document.getElementById('extra-classroom');
        const saveBtn = document.getElementById('save-extra');

        const day = dayEl ? dayEl.value.trim() : '';
        const time = timeEl ? timeEl.value.trim() : '';
        const subject = subjectEl ? subjectEl.value.trim() : '';
        const teacher = teacherEl ? teacherEl.value.trim() : '';
        const classroom = classroomEl ? classroomEl.value.trim() : '';
        const editId = saveBtn ? saveBtn.getAttribute('data-edit-id') : null;

        if (!day || !time || !subject || !teacher || !classroom) {
            showNotification('Заполните все поля');
            return;
        }

        if (editId) {
            const lesson = appData.extraLessons.find(l => l.id === parseInt(editId));
            if (lesson) {
                lesson.day = day;
                lesson.time = time;
                lesson.subject = subject;
                lesson.teacher = teacher;
                lesson.classroom = classroom;
            }
            if (saveBtn) saveBtn.removeAttribute('data-edit-id');
        } else {
            const newLesson = {
                id: Date.now(),
                day,
                time,
                subject,
                teacher,
                classroom
            };
            appData.extraLessons.push(newLesson);
        }

        saveAllData();
        initExtraLessons();

        hideModal('extra-modal');
        showNotification('Дополнительное занятие добавлено');
    }

    function updateWeekDisplay() {
        const weekDisplay = document.querySelector('.week-display');
        if (weekDisplay) weekDisplay.textContent = `Неделя ${currentWeek}`;
    }

    // ---------- Запуск приложения ----------
    console.log('Запуск приложения...');
    initApp();

    // ---------- Вспомогательные функции ----------

    // Экранируем текст для безопасности вставки в innerHTML
    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // Если не удалось найти элемент (для отладки) - печатаем рекомендацию
    // (в production можно убрать)
    window.debugDumpMissingElements = function() {
        const required = [
            '.top-menu-item', '.page', '.teacher-list', '.students-in-group', '.students-to-add',
            '.schedule-table', '.extra-table', '#class-select'
        ];
        required.forEach(sel => {
            if (!document.querySelector(sel)) console.warn('Элемент отсутствует в DOM:', sel);
        });
    };

    // Достаточно часто помогает вызвать debugDumpMissingElements() из консоли
    // когда что-то не отображается.

});
