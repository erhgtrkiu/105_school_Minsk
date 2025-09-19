document.addEventListener('DOMContentLoaded', function() {
    // Основные переменные
    let currentUser = null;
    let currentWeek = 1;
    let currentGroup = null;
    let unansweredQuestions = 0;
    let currentQuestionId = null;

    // База данных пользователей (только админ по умолчанию)
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
    let appData = {
        questions: [],
        students: [
            { id: 1, name: "Рудый Михаил Игоревич", group: "A", class: "10A" },
            { id: 2, name: "Иванов Иван Иванович", group: "B", class: "10A" },
            { id: 3, name: "Петрова Анна Сергеевна", group: "C", class: "9A" },
            { id: 4, name: "Сидоров Петр", group: "A", class: "5A" },
            { id: 5, name: "Козлова Ольга", group: "B", class: "6A" },
            { id: 6, name: "Николаев Дмитрий", group: "C", class: "7A" },
            { id: 7, name: "Федорова Елена", group: "A", class: "8A" },
            { id: 8, name: "Васильев Алексей", group: "B", class: "9A" },
            { id: 9, name: "Павлова Мария", group: "C", class: "11A" }
        ],
        teachers: [
            { id: 1, name: 'Иванова Мария', subject: 'Китайский язык', experience: '10 лет' },
            { id: 2, name: 'Петрова Анна', subject: 'Китайская литература', experience: '8 лет' },
            { id: 3, name: 'Сидоров Иван', subject: 'История Китая', experience: '12 лет' }
        ],
        groups: {
            'A': ["Рудый Михаил Игоревич", "Сидоров Петр", "Федорова Елена"],
            'B': ["Иванов Иван Иванович", "Козлова Ольga", "Васильев Алексей"],
            'C': ["Петрова Анна Сергеевна", "Николаев Дмитрий", "Павлова Мария"],
            'D': [],
            'E': []
        },
        schedule: {
            '5A': {
                'Понедельник': {
                    '9:00-10:00': 'Китайский язык (101)',
                    '10:15-11:15': 'Математика (205)'
                }
            },
            '6A': {},
            '7A': {},
            '8A': {},
            '9A': {},
            '10A': {},
            '11A': {}
        },
        extraLessons: [
            { id: 1, day: "Понедельник", time: "15:30-17:00", subject: "Каллиграфия", teacher: "Иванова М.И.", classroom: "305" },
            { id: 2, day: "Среда", time: "15:30-17:00", subject: "Китайская живопись", teacher: "Петрова А.С.", classroom: "214" },
            { id: 3, day: "Пятница", time: "15:30-17:00", subject: "Чайная церемония", teacher: "Сидоров И.П.", classroom: "123" }
        ],
        chineseFacts: [
            "Китай - третья по величине страна в мире после России и Канады.",
            "Бумага, порох, компас и книгопечатание были изобретены в Китае.",
            "В Китае более 2000 диалектов, но официальным является мандаринский.",
            "Великая Китайская стена - самое длинное сооружение, построенное человеком.",
            "Чай был открыт в Китае более 4700 лет назад."
        ],
        holidays: {
            '01-01': { title: 'Новый год', message: 'С Новым годом! 新年快乐!' },
            '01-22': { title: 'Китайский Новый год', message: 'Поздравляем с Китайским Новым годом! 春节快乐!' },
            '03-08': { title: 'Международный женский день', message: 'С 8 Марта! 三八妇女节快乐!' },
            '05-01': { title: 'День труда', message: 'С Днем труда! 劳动节快乐!' },
            '10-01': { title: 'День образования КНР', message: 'С Днем образования КНР! 国庆节快乐!' }
        },
        lastModified: Date.now()
    };

    // Инициализация приложения
    function initApp() {
        loadAllData();
        initEventListeners();
        initData();
        checkHolidays();
        showRandomFact();
        loadTheme();
        checkAutoLogin();
        
        // Запускаем синхронизацию каждые 3 секунды
        setInterval(syncData, 3000);
        
        changePage('teachers');
        document.querySelector('.menu-item[data-page="teachers"]').classList.add('active');
        
        document.body.style.opacity = 0;
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease-in';
            document.body.style.opacity = 1;
        }, 100);
    }

    // Синхронизация данных между устройствами
    function syncData() {
        try {
            const serverData = localStorage.getItem('chinese_school_server_data');
            
            if (serverData) {
                const server = JSON.parse(serverData);
                
                // Если данные на сервере новее, загружаем их
                if (server.lastModified > appData.lastModified) {
                    appData = { ...server };
                    saveAllData();
                    initData();
                    if (currentUser) {
                        showNotification('Данные обновлены');
                    }
                }
                // Если наши данные новее, сохраняем на сервер
                else if (appData.lastModified > server.lastModified) {
                    localStorage.setItem('chinese_school_server_data', JSON.stringify({
                        ...appData,
                        lastModified: appData.lastModified
                    }));
                }
            } else {
                // Первая инициализация сервера
                localStorage.setItem('chinese_school_server_data', JSON.stringify({
                    ...appData,
                    lastModified: appData.lastModified
                }));
            }
        } catch (error) {
            console.error('Ошибка синхронизации:', error);
        }
    }

    // Загрузка всех данных
    function loadAllData() {
        try {
            // Загружаем данные сервера
            const serverData = localStorage.getItem('chinese_school_server_data');
            if (serverData) {
                const server = JSON.parse(serverData);
                appData = { ...server };
            }

            // Загружаем локальные данные пользователей
            const savedUsers = localStorage.getItem('chinese_school_users');
            if (savedUsers) {
                const users = JSON.parse(savedUsers);
                Object.keys(users).forEach(key => {
                    usersDatabase[key] = users[key];
                });
            }

            const savedRequests = localStorage.getItem('chinese_school_requests');
            if (savedRequests) {
                const requests = JSON.parse(savedRequests);
                teacherRequests.length = 0;
                teacherRequests.push(...requests);
            }

            const savedUser = localStorage.getItem('chinese_school_current_user');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
            }
        } catch (error) {
            console.error('Ошибка загрузка данных:', error);
        }
    }

    // Сохранение всех данных
    function saveAllData() {
        try {
            // Обновляем время изменения
            appData.lastModified = Date.now();
            
            // Сохраняем на сервер
            localStorage.setItem('chinese_school_server_data', JSON.stringify(appData));
            
            // Сохраняем локальные данные
            localStorage.setItem('chinese_school_users', JSON.stringify(usersDatabase));
            localStorage.setItem('chinese_school_requests', JSON.stringify(teacherRequests));
            
            if (currentUser) {
                localStorage.setItem('chinese_school_current_user', JSON.stringify(currentUser));
            }
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
        }
    }

    // Инициализация всех обработчиков событий
    function initEventListeners() {
        // Меню
        document.querySelectorAll('.menu-item').forEach(item => {
            if (item.id !== 'login-btn' && item.id !== 'register-btn') {
                item.addEventListener('click', function() {
                    if (!currentUser) {
                        showNotification('Сначала войдите в систему');
                        showModal(document.getElementById('auth-modal'));
                        return;
                    }
                    
                    const targetPage = this.getAttribute('data-page');
                    changePage(targetPage);
                    
                    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                    
                    if (targetPage === 'groups') {
                        initGroupsPage();
                    } else if (targetPage === 'lessons') {
                        initSchedule();
                    } else if (targetPage === 'extra') {
                        initExtraLessons();
                    }
                });
            }
        });

        // Кнопки входа/регистрации
        document.getElementById('login-btn').addEventListener('click', handleAuthButtonClick);
        document.getElementById('register-btn').addEventListener('click', handleAuthButtonClick);

        // Закрытие модальных окон
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', function() {
                hideModal(this.closest('.modal'));
            });
        });

        // Клик вне модального окна
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(event) {
                if (event.target === this) {
                    hideModal(this);
                }
            });
        });

        // Формы авторизации
        document.getElementById('login-submit').addEventListener('click', login);
        document.getElementById('register-submit').addEventListener('click', register);

        // Вкладки авторизации
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                switchAuthTab(this.getAttribute('data-tab'));
            });
        });

        // Кнопка темы
        document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

        // Кнопка вопрос-ответ
        document.getElementById('qa-button').addEventListener('click', handleQAClick);

        // Вкладки QA
        document.querySelectorAll('.qa-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                switchQATab(this.getAttribute('data-tab'));
            });
        });

        // QA действия
        document.getElementById('submit-question').addEventListener('click', submitQuestion);
        document.getElementById('submit-answer').addEventListener('click', submitAnswer);
        document.getElementById('close-holiday').addEventListener('click', () => hideModal(document.getElementById('holiday-modal')));

        // Переводчик
        document.getElementById('translation-direction').addEventListener('change', updateTranslatorDirection);
        document.getElementById('translate-btn').addEventListener('click', translateTextWithAPI);
        document.getElementById('clear-translator').addEventListener('click', clearTranslator);

        // Группы
        document.querySelectorAll('.group').forEach(group => {
            group.addEventListener('click', function() {
                selectGroup(this.getAttribute('data-group'));
            });
        });

        // Кнопки управления
        document.getElementById('add-teacher').addEventListener('click', () => {
            if (!checkAdminAccess()) return;
            showModal(document.getElementById('teacher-modal'));
        });
        
        document.getElementById('save-teacher').addEventListener('click', addTeacher);
        
        document.getElementById('edit-teachers').addEventListener('click', () {
            if (!checkAdminAccess()) return;
            showModal(document.getElementById('edit-teachers-modal'));
            initTeachersEditList();
        });
        
        document.getElementById('view-requests').addEventListener('click', () => {
            if (!checkAdminAccess()) return;
            showModal(document.getElementById('requests-modal'));
            initRequestsList();
        });
        
        document.getElementById('add-student').addEventListener('click', () => {
            if (!checkTeacherAccess()) return;
            showModal(document.getElementById('student-modal'));
        });
        
        document.getElementById('save-student').addEventListener('click', addStudent);
        
        document.getElementById('manage-groups').addEventListener('click', () => {
            if (!checkTeacherAccess()) return;
            changePage('groups');
        });
        
        document.getElementById('add-lesson').addEventListener('click', () => {
            if (!checkTeacherAccess()) return;
            showModal(document.getElementById('lesson-modal'));
        });
        
        document.getElementById('save-lesson').addEventListener('click', addLesson);
        
        document.getElementById('edit-lesson').addEventListener('click', () => {
            if (!checkTeacherAccess()) return;
            showNotification('Редактирование расписания в разработке');
        });
        
        document.getElementById('add-extra').addEventListener('click', () => {
            if (!checkTeacherAccess()) return;
            showModal(document.getElementById('extra-modal'));
        });
        
        document.getElementById('save-extra').addEventListener('click', addExtraLesson);

        // Навигация по неделям
        document.getElementById('prev-week').addEventListener('click', () => {
            if (currentWeek > 1) currentWeek--;
            updateWeekDisplay();
        });

        document.getElementById('next-week').addEventListener('click', () => {
            currentWeek++;
            updateWeekDisplay();
        });

        document.getElementById('class-select').addEventListener('change', initSchedule);
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

    function handleAuthButtonClick() {
        if (this.id === 'login-btn' && currentUser) {
            logout();
        } else {
            showModal(document.getElementById('auth-modal'));
            if (this.id === 'register-btn') {
                switchAuthTab('register');
            }
        }
    }

    function handleQAClick() {
        if (!currentUser) {
            showNotification('Сначала войдите в систему');
            showModal(document.getElementById('auth-modal'));
            return;
        }
        showModal(document.getElementById('qa-modal'));
        updateQAContent();
    }

    // Основные функции приложения
    function changePage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            if (page.id === pageId) {
                page.style.display = 'block';
                setTimeout(() => page.classList.add('active'), 10);
            } else {
                page.classList.remove('active');
                setTimeout(() => {
                    if (!page.classList.contains('active')) {
                        page.style.display = 'none';
                    }
                }, 300);
            }
        });
    }

    function showModal(modal) {
        if (!modal) return;
        modal.style.display = 'flex';
        setTimeout(() => modal.style.opacity = 1, 10);
    }

    function hideModal(modal) {
        if (!modal) return;
        modal.style.opacity = 0;
        setTimeout(() => modal.style.display = 'none', 300);
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ffde00;
            color: #de2910;
            padding: 15px 25px;
            border-radius: 5px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            opacity: 0;
            transform: translateX(100px);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = 1;
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        setTimeout(() => {
            notification.style.opacity = 0;
            notification.style.transform = 'translateX(100px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Инициализация данных
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
            
            item.querySelectorAll('input').forEach(input => {
                input.addEventListener('change', function() {
                    const field = this.getAttribute('data-field');
                    teacher[field] = this.value;
                    updateData();
                });
            });
            
            item.querySelector('.delete-teacher').addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                appData.teachers = appData.teachers.filter(t => t.id !== id);
                updateData();
            });
            
            editList.appendChild(item);
        });
    }

    function initRequestsList() {
        const requestsList = document.querySelector('.requests-list');
        if (!requestsList) return;
        
        requestsList.innerHTML = '';
        
        if (teacherRequests.length === 0) {
            requestsList.innerHTML = '<p>Нет активных запросов</p>';
            return;
        }
        
        teacherRequests.forEach((request, index) => {
            const requestItem = document.createElement('div');
            requestItem.className = 'request-item';
            requestItem.innerHTML = `
                <div class="request-info">
                    <h4>${request.name}</h4>
                    <p><strong>Логин:</strong> ${request.login}</p>
                    <p><strong>Пароль:</strong> ${request.password}</p>
                    <p><strong>Дата:</strong> ${new Date(request.timestamp).toLocaleString()}</p>
                </div>
                <div class="request-actions">
                    <button class="btn-accept" data-index="${index}">Принять</button>
                    <button class="btn-reject" data-index="${index}">Отклонить</button>
                </div>
            `;
            
            requestsList.appendChild(requestItem);
        });
        
        // Обработчики для кнопок
        document.querySelectorAll('.btn-accept').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                acceptTeacherRequest(index);
            });
        });
        
        document.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                rejectTeacherRequest(index);
            });
        });
    }

    // Принятие запроса учителя
    function acceptTeacherRequest(index) {
        const request = teacherRequests[index];
        
        // Создаем учетную запись учителя
        usersDatabase[request.login] = {
            password: request.password,
            role: 'teacher',
            name: request.name,
            approved: true
        };
        
        // Добавляем учителя в список
        appData.teachers.push({
            id: Date.now(),
            name: request.name,
            subject: 'Новый преподаватель',
            experience: '0 лет'
        });
        
        // Удаляем запрос
        teacherRequests.splice(index, 1);
        
        updateData();
        showNotification('Учитель успешно добавлен');
    }

    // Отклонение запроса учителя
    function rejectTeacherRequest(index) {
        const request = teacherRequests[index];
        request.status = 'rejected';
        teacherRequests.splice(index, 1);
        updateData();
        showNotification('Запрос отклонен');
    }

    function initSchedule() {
        const table = document.querySelector('.schedule-table');
        if (!table) return;
        
        const selectedClass = document.getElementById('class-select').value;
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
        
        // Добавляем обработчики для кнопок редактирования и удаления
        if (currentUser?.role === 'admin' || currentUser?.role === 'teacher') {
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
    }

    function editExtraLesson(id) {
        const lesson = appData.extraLessons.find(l => l.id === id);
        if (lesson) {
            document.getElementById('extra-day').value = lesson.day;
            document.getElementById('extra-time').value = lesson.time;
            document.getElementById('extra-subject').value = lesson.subject;
            document.getElementById('extra-teacher').value = lesson.teacher;
            document.getElementById('extra-classroom').value = lesson.classroom;
            
            const saveButton = document.getElementById('save-extra');
            saveButton.setAttribute('data-edit-id', id);
            saveButton.textContent = 'Обновить';
            
            showModal(document.getElementById('extra-modal'));
        }
    }

    function deleteExtraLesson(id) {
        if (confirm('Удалить это занятие?')) {
            appData.extraLessons = appData.extraLessons.filter(l => l.id !== id);
            updateData();
            showNotification('Занятие удалено');
        }
    }

    // Авторизация
    function switchAuthTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
        });
        
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === tabName);
        });
    }

    function login() {
        const loginName = document.getElementById('login-name').value;
        const password = document.getElementById('login-password').value;
        
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
            // Проверяем, не был ли запрос отклонен
            const rejectedRequest = teacherRequests.find(req => 
                req.login === loginName && req.status === 'rejected'
            );
            
            if (rejectedRequest) {
                showNotification('Администратор отклонил ваш запрос на регистрацию');
            } else {
                showNotification('Ваш аккаунт ожидает подтверждения администратора');
            }
            return;
        }
        
        currentUser = { 
            login: loginName,
            name: user.name, 
            role: user.role 
        };
        
        updateUIForUser();
        hideModal(document.getElementById('auth-modal'));
        showNotification(`Добро пожаловать, ${user.name}!`);
        saveAllData();
        
        // Очищаем форму
        document.getElementById('login-name').value = '';
        document.getElementById('login-password').value = '';
    }

    function register() {
        const loginName = document.getElementById('register-name').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        const role = document.getElementById('register-role').value;
        const fullName = document.getElementById('register-fullname').value;
        
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
            // Для учителей отправляем запрос администратору
            teacherRequests.push({
                login: loginName,
                password: password,
                name: fullName,
                role: role,
                timestamp: new Date().toISOString()
            });
            
            showNotification('Запрос на регистрацию учителя отправлен администратору. Ожидайте подтверждения.');
        } else {
            // Для учеников сразу создаем аккаунт
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
        
        hideModal(document.getElementById('auth-modal'));
        updateData();
        updateUIForUser();
        
        // Очищаем форму
        document.getElementById('register-name').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-confirm').value = '';
        document.getElementById('register-fullname').value = '';
    }

    function logout() {
        currentUser = null;
        updateUIForUser();
        showNotification('До свидания!');
        saveAllData();
        
        changePage('teachers');
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
        document.querySelector('.menu-item[data-page="teachers"]').classList.add('active');
    }

    function updateUIForUser() {
        const isTeacher = currentUser?.role === 'teacher';
        const isAdmin = currentUser?.role === 'admin';
        
        document.querySelectorAll('.teacher-controls').forEach(el => {
            el.classList.toggle('hidden', !isTeacher && !isAdmin);
        });
        
        document.querySelectorAll('.admin-controls').forEach(el => {
            el.classList.toggle('hidden', !isAdmin);
        });

        if (currentUser) {
            document.getElementById('login-btn').textContent = 'Выйти';
            document.getElementById('register-btn').textContent = currentUser.name;
        } else {
            document.getElementById('login-btn').textContent = 'Войти';
            document.getElementById('register-btn').textContent = 'Регистрация';
        }
    }

    // Тема
    function toggleTheme() {
        document.body.classList.toggle('night-theme');
        const isNight = document.body.classList.contains('night-theme');
        document.getElementById('theme-toggle').textContent = isNight ? '☀️' : '🌙';
        localStorage.setItem('theme', isNight ? 'night' : 'day');
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'night') {
            document.body.classList.add('night-theme');
            document.getElementById('theme-toggle').textContent = '☀️';
        }
    }

    // Факты о Китае
    function showRandomFact() {
        const factElement = document.getElementById('china-fact');
        if (!factElement) return;
        
        const randomFact = appData.chineseFacts[Math.floor(Math.random() * appData.chineseFacts.length)];
        factElement.textContent = randomFact;
        
        setInterval(() => {
            const newFact = appData.chineseFacts[Math.floor(Math.random() * appData.chineseFacts.length)];
            factElement.style.opacity = 0;
            setTimeout(() => {
                factElement.textContent = newFact;
                factElement.style.opacity = 1;
            }, 500);
        }, 30000);
    }

    // Праздники
    function checkHolidays() {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const dateStr = `${month}-${day}`;
        
        if (appData.holidays[dateStr]) {
            const holiday = appData.holidays[dateStr];
            document.getElementById('holiday-title').textContent = holiday.title;
            document.getElementById('holiday-message').textContent = holiday.message;
            showModal(document.getElementById('holiday-modal'));
            createFireworks();
        }
    }

    function createFireworks() {
        const container = document.querySelector('.fireworks');
        if (!container) return;
        
        container.innerHTML = '';
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = 'firework';
                firework.style.setProperty('--x', `${Math.random() * 200 - 100}px`);
                firework.style.setProperty('--y', `${Math.random() * 200 - 100}px`);
                container.appendChild(firework);
                
                setTimeout(() => firework.remove(), 1000);
            }, i * 200);
        }
    }

    // Переводчик
    function updateTranslatorDirection() {
        const direction = document.getElementById('translation-direction').value;
        const sourceLang = document.getElementById('source-language');
        const targetLang = document.getElementById('target-language');
        const sourceText = document.getElementById('source-text');
        
        if (direction === 'cn-ru') {
            sourceLang.textContent = 'Китайский';
            targetLang.textContent = 'Русский';
            sourceText.placeholder = 'Введите текст на китайском...';
        } else {
            sourceLang.textContent = 'Русский';
            targetLang.textContent = 'Китайский';
            sourceText.placeholder = 'Введите текст на русском...';
        }
        
        clearTranslator();
    }

    async function translateTextWithAPI() {
        const direction = document.getElementById('translation-direction').value;
        const sourceText = document.getElementById('source-text').value;
        const targetText = document.getElementById('target-text');
        
        if (!sourceText.trim()) {
            showNotification('Введите текст для перевода');
            return;
        }
        
        try {
            const sourceLang = direction === 'cn-ru' ? 'zh' : 'ru';
            const targetLang = direction === 'cn-ru' ? 'ru' : 'zh';
            
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${sourceLang}|${targetLang}`);
            const data = await response.json();
            
            if (data.responseStatus === 200) {
                targetText.value = data.responseData.translatedText;
            } else {
                throw new Error('Ошибка перевода');
            }
        } catch (error) {
            showNotification('Ошибка перевода. Попробуйте снова.');
            
            // Fallback словарь
            const simpleDict = {
                'cn-ru': {
                    '你好': 'Привет',
                    '谢谢': 'Спасибо',
                    '再见': 'До свидания',
                    '学校': 'Школа',
                    '老师': 'Учитель'
                },
                'ru-cn': {
                    'Привет': '你好',
                    'Спасибо': '谢谢',
                    'До свидания': '再见',
                    'Школа': '学校',
                    'Учитель': '老师'
                }
            };
            
            const translation = simpleDict[direction][sourceText] || 'Перевод не найден';
            targetText.value = translation;
        }
    }

    function clearTranslator() {
        document.getElementById('source-text').value = '';
        document.getElementById('target-text').value = '';
    }

    // Вопрос-ответ
    function switchQATab(tabName) {
        document.querySelectorAll('.qa-tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
        });
        
        document.querySelectorAll('.qa-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });
    }

    function submitQuestion() {
        const questionText = document.getElementById('question-text').value.trim();
        
        if (!questionText) {
            showNotification('Введите вопрос');
            return;
        }
        
        const newQuestion = {
            id: Date.now(),
            student: currentUser.name,
            question: questionText,
            answered: false,
            answer: '',
            date: new Date().toLocaleDateString()
        };
        
        appData.questions.push(newQuestion);
        updateData();
        document.getElementById('question-text').value = '';
        showNotification('Вопрос отправлен!');
        updateQAContent();
    }

    function submitAnswer() {
        const answerText = document.getElementById('answer-text').value.trim();
        
        if (!answerText) {
            showNotification('Введите ответ');
            return;
        }
        
        const question = appData.questions.find(q => q.id === currentQuestionId);
        if (question) {
            question.answered = true;
            question.answer = answerText;
            question.answeredBy = currentUser.name;
            question.answerDate = new Date().toLocaleDateString();
            
            updateData();
            hideModal(document.getElementById('answer-modal'));
            showNotification('Ответ отправлен!');
            updateQAContent();
        }
    }

    function updateQAContent() {
        // Мои вопросы
        const myQuestions = appData.questions.filter(q => q.student === currentUser?.name);
        const myQuestionsList = document.querySelector('#questions-tab .questions-list');
        if (myQuestionsList) {
            myQuestionsList.innerHTML = myQuestions.length ? '' : '<p>У вас пока нет вопросов</p>';
            myQuestions.forEach(q => myQuestionsList.appendChild(createQuestionItem(q)));
        }

        // Все вопросы
        if (currentUser?.role === 'teacher' || currentUser?.role === 'admin') {
            const allQuestionsList = document.querySelector('#all-questions-tab .all-questions-list');
            if (allQuestionsList) {
                allQuestionsList.innerHTML = appData.questions.length ? '' : '<p>Вопросов пока нет</p>';
                appData.questions.forEach(q => allQuestionsList.appendChild(createQuestionItem(q, true)));
            }
        }
    }

    function createQuestionItem(question, showAnswerButton = false) {
        const div = document.createElement('div');
        div.className = `question-item ${question.answered ? '' : 'unanswered'}`;
        
        div.innerHTML = `
            <div class="question-text">${question.question}</div>
            <div class="question-meta"><small>${question.student}, ${question.date}</small></div>
            ${question.answered ? `
                <div class="answer-text">
                    <strong>Ответ:</strong> ${question.answer}
                    <br><small>${question.answeredBy}, ${question.answerDate}</small>
                </div>
            ` : ''}
            ${showAnswerButton && !question.answered ? `
                <button class="answer-btn" data-id="${question.id}">Ответить</button>
            ` : ''}
        `;
        
        if (showAnswerButton && !question.answered) {
            div.querySelector('.answer-btn').addEventListener('click', function() {
                currentQuestionId = parseInt(this.getAttribute('data-id'));
                const question = appData.questions.find(q => q.id === currentQuestionId);
                
                if (question) {
                    document.querySelector('.question-content').innerHTML = `
                        <p><strong>Вопрос от ${question.student}:</strong></p>
                        <p>${question.question}</p>
                    `;
                    document.getElementById('answer-text').value = '';
                    showModal(document.getElementById('answer-modal'));
                }
            });
        }
        
        return div;
    }

    function updateUnansweredCount() {
        unansweredQuestions = appData.questions.filter(q => !q.answered).length;
        const badge = document.querySelector('.notification-badge');
        if (badge) badge.textContent = unansweredQuestions;
    }

    // Группы
    function initGroupsPage() {
        document.querySelectorAll('.group').forEach(group => group.style.display = 'block');
        selectGroup('A');
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
        appData.groups[currentGroup]?.forEach(studentName => {
            const student = appData.students.find(s => s.name === studentName);
            const div = document.createElement('div');
            div.className = 'student-item';
            div.innerHTML = `
                <span>${studentName} (${student?.class || 'Не указан'})</span>
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
                    <span>${student.name} (${student.class})</span>
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
        if (!appData.groups[currentGroup]?.includes(studentName)) {
            appData.groups[currentGroup].push(studentName);
            updateGroupStudents();
            updateAvailableStudents();
            updateData();
        }
    }

    function removeStudentFromGroup(studentName) {
        appData.groups[currentGroup] = appData.groups[currentGroup]?.filter(name => name !== studentName);
        updateGroupStudents();
        updateAvailableStudents();
        updateData();
    }

    // Управление данными
    function addTeacher() {
        const name = document.getElementById('teacher-name').value;
        const subject = document.getElementById('teacher-subject').value;
        const experience = document.getElementById('teacher-experience').value;

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
        updateData();
        
        document.getElementById('teacher-name').value = '';
        document.getElementById('teacher-subject').value = '';
        document.getElementById('teacher-experience').value = '';
        hideModal(document.getElementById('teacher-modal'));
        
        showNotification('Учитель добавлен');
    }

    function addStudent() {
        const name = document.getElementById('student-name').value;
        const studentClass = document.getElementById('student-class').value;
        const group = document.getElementById('student-group').value;

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
        
        if (!appData.groups[group]?.includes(name)) {
            appData.groups[group].push(name);
        }
        
        updateData();
        
        if (currentGroup) {
            updateGroupStudents();
            updateAvailableStudents();
        }
        
        document.getElementById('student-name').value = '';
        hideModal(document.getElementById('student-modal'));
        
        showNotification('Ученик добавлен');
    }

    function addLesson() {
        const day = document.getElementById('lesson-day').value;
        const time = document.getElementById('lesson-time').value;
        const subject = document.getElementById('lesson-subject').value;
        const classroom = document.getElementById('lesson-classroom').value;
        const selectedClass = document.getElementById('class-select').value;

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
        
        updateData();
        
        document.getElementById('lesson-time').value = '';
        document.getElementById('lesson-subject').value = '';
        document.getElementById('lesson-classroom').value = '';
        hideModal(document.getElementById('lesson-modal'));
        
        showNotification('Занятие добавлено в расписание');
    }

    function addExtraLesson() {
        const day = document.getElementById('extra-day').value;
        const time = document.getElementById('extra-time').value;
        const subject = document.getElementById('extra-subject').value;
        const teacher = document.getElementById('extra-teacher').value;
        const classroom = document.getElementById('extra-classroom').value;
        const editId = document.getElementById('save-extra').getAttribute('data-edit-id');

        if (!day || !time || !subject || !teacher || !classroom) {
            showNotification('Заполните все поля');
            return;
        }

        if (editId) {
            // Редактирование существующего занятия
            const lesson = appData.extraLessons.find(l => l.id === parseInt(editId));
            if (lesson) {
                lesson.day = day;
                lesson.time = time;
                lesson.subject = subject;
                lesson.teacher = teacher;
                lesson.classroom = classroom;
            }
            document.getElementById('save-extra').removeAttribute('data-edit-id');
            document.getElementById('save-extra').textContent = 'Сохранить';
        } else {
            // Добавление нового занятия
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
        
        updateData();
        
        document.getElementById('extra-day').value = '';
        document.getElementById('extra-time').value = '';
        document.getElementById('extra-subject').value = '';
        document.getElementById('extra-teacher').value = '';
        document.getElementById('extra-classroom').value = '';
        hideModal(document.getElementById('extra-modal'));
        
        showNotification(editId ? 'Занятие обновлено' : 'Дополнительное занятие добавлено');
    }

    function updateWeekDisplay() {
        const weekDisplay = document.querySelector('.week-display');
        if (weekDisplay) weekDisplay.textContent = `Неделя ${currentWeek}`;
    }

    function updateData() {
        appData.lastModified = Date.now();
        saveAllData();
        initData();
    }

    function checkAutoLogin() {
        const savedUser = localStorage.getItem('chinese_school_current_user');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            updateUIForUser();
        }
    }

    // Запуск приложения
    initApp();
});
