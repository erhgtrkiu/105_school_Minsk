document.addEventListener('DOMContentLoaded', function() {
    // Основные переменные
    let currentUser = null;
    let currentWeek = 1;
    let currentGroup = null;
    let unansweredQuestions = 0;
    let currentQuestionId = null;

    // Функция для работы с localStorage с синхронизацией
    const StorageManager = {
        get: function(key) {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        },
        
        set: function(key, data) {
            localStorage.setItem(key, JSON.stringify(data));
            // Симулируем синхронизацию между устройствами
            this.syncWithOtherTabs(key, data);
        },
        
        syncWithOtherTabs: function(key, data) {
            // Это упрощенная имитация синхронизации
            // В реальном приложении здесь был бы сервер
            if (window.updateStorageCallback) {
                window.updateStorageCallback(key, data);
            }
        },
        
        listenForChanges: function(callback) {
            window.updateStorageCallback = callback;
        }
    };

    // База данных пользователей
    let usersDatabase = StorageManager.get('chinese_school_users') || {
        'admin': { 
            password: 'admin123', 
            role: 'admin', 
            name: 'Администратор', 
            approved: true 
        }
    };

    // Запросы на регистрацию учителей
    let teacherRequests = StorageManager.get('chinese_school_requests') || [];

    // Данные приложения
    let appData = StorageManager.get('chinese_school_data') || {
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
        ]
    };

    // Инициализация приложения
    function initApp() {
        console.log('🚀 Инициализация приложения...');
        
        // Загружаем текущего пользователя
        const savedUser = StorageManager.get('chinese_school_current_user');
        if (savedUser) {
            currentUser = savedUser;
            console.log('✅ Пользователь загружен:', currentUser.name);
        }

        // Слушаем изменения в localStorage
        StorageManager.listenForChanges(function(key, data) {
            console.log('🔄 Обновление данных:', key);
            switch(key) {
                case 'chinese_school_data':
                    appData = data;
                    updateAllDisplays();
                    break;
                case 'chinese_school_users':
                    usersDatabase = data;
                    break;
                case 'chinese_school_requests':
                    teacherRequests = data;
                    break;
            }
        });

        initEventListeners();
        updateAllDisplays();
        updateUIForUser();
        
        // Показываем первую страницу
        changePage('teachers');
        
        // Запускаем показ фактов
        showRandomFact();
        
        // Загружаем тему
        loadTheme();
        
        console.log('✅ Приложение инициализировано');
    }

    // Сохранение всех данных
    function saveAllData() {
        StorageManager.set('chinese_school_data', appData);
        StorageManager.set('chinese_school_users', usersDatabase);
        StorageManager.set('chinese_school_requests', teacherRequests);
        if (currentUser) {
            StorageManager.set('chinese_school_current_user', currentUser);
        }
        console.log('💾 Данные сохранены');
    }

    // Обновление всех отображений
    function updateAllDisplays() {
        initTeachers();
        initGroupsPage();
        initSchedule();
        initExtraLessons();
        updateUnansweredCount();
    }

    // Инициализация обработчиков событий
    function initEventListeners() {
        console.log('🔗 Инициализация обработчиков событий...');

        // Навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const targetPage = this.getAttribute('data-page');
                changePage(targetPage);
                
                // Обновляем активный класс
                document.querySelectorAll('.nav-item').forEach(i => {
                    i.classList.remove('active');
                });
                this.classList.add('active');
            });
        });

        // Кнопки входа/регистрации
        document.getElementById('login-btn').addEventListener('click', handleAuthButtonClick);
        document.getElementById('register-btn').addEventListener('click', function() {
            showAuthModal();
            switchAuthTab('register');
        });

        // Формы авторизации
        document.getElementById('login-submit').addEventListener('click', login);
        document.getElementById('register-submit').addEventListener('click', register);

        // Вкладки авторизации
        document.querySelectorAll('.auth-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                switchAuthTab(this.getAttribute('data-tab'));
            });
        });

        // Тема
        document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

        // Вопрос-ответ
        document.getElementById('qa-button').addEventListener('click', handleQAClick);

        // Группы
        document.querySelectorAll('.group').forEach(group => {
            group.addEventListener('click', function() {
                selectGroup(this.getAttribute('data-group'));
            });
        });

        // Кнопки управления
        setupButton('add-teacher', () => {
            if (!checkAdminAccess()) return;
            document.getElementById('teacher-modal').style.display = 'block';
        });
        
        setupButton('save-teacher', addTeacher);
        setupButton('edit-teachers', () => {
            if (!checkAdminAccess()) return;
            showEditTeachersModal();
        });
        
        setupButton('manage-requests-btn', () => {
            if (!checkAdminAccess()) return;
            document.getElementById('requests-modal').style.display = 'block';
            initRequestsList();
        });
        
        setupButton('add-lesson', () => {
            if (!checkTeacherAccess()) return;
            // Реализация добавления занятия
            showNotification('Функция в разработке');
        });
        
        setupButton('add-extra', () => {
            if (!checkTeacherAccess()) return;
            // Реализация добавления доп. занятия
            showNotification('Функция в разработке');
        });

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
        document.getElementById('class-select').addEventListener('change', initSchedule);

        // Вопрос-ответ
        setupButton('submit-question', submitQuestion);
        setupButton('submit-answer', submitAnswer);

        // Закрытие модальных окон
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });

        // Закрытие модальных окон по клику вне области
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        console.log('✅ Все обработчики событий инициализированы');
    }

    function setupButton(id, handler) {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', handler);
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

    function handleAuthButtonClick() {
        if (currentUser) {
            logout();
        } else {
            showAuthModal();
            switchAuthTab('login');
        }
    }

    function showAuthModal() {
        document.getElementById('auth-modal').style.display = 'block';
    }

    function handleQAClick() {
        if (!currentUser) {
            showNotification('Сначала войдите в систему');
            showAuthModal();
            return;
        }
        document.getElementById('qa-modal').style.display = 'block';
        updateQAContent();
    }

    // Основные функции приложения
    function changePage(pageId) {
        console.log('📄 Переключение на страницу:', pageId);
        
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            
            switch(pageId) {
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
            }
        }
    }

    function showNotification(message) {
        console.log('💬 Уведомление:', message);
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--secondary-color);
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Инициализация данных
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

    function showEditTeachersModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Редактирование учителей</h2>
                <div class="edit-teachers-list">
                    ${appData.teachers.map(teacher => `
                        <div class="teacher-edit-item">
                            <input type="text" value="${teacher.name}" data-id="${teacher.id}" class="teacher-name-edit">
                            <input type="text" value="${teacher.subject}" data-id="${teacher.id}" class="teacher-subject-edit">
                            <input type="text" value="${teacher.experience}" data-id="${teacher.id}" class="teacher-exp-edit">
                            <button onclick="deleteTeacher(${teacher.id})">Удалить</button>
                        </div>
                    `).join('')}
                </div>
                <button onclick="saveTeachers()">Сохранить изменения</button>
            </div>
        `;
        
        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });
        
        document.body.appendChild(modal);
    }

    function deleteTeacher(id) {
        appData.teachers = appData.teachers.filter(t => t.id !== id);
        saveAllData();
        initTeachers();
        showNotification('Учитель удален');
    }

    function saveTeachers() {
        document.querySelectorAll('.teacher-name-edit').forEach(input => {
            const id = parseInt(input.getAttribute('data-id'));
            const teacher = appData.teachers.find(t => t.id === id);
            if (teacher) {
                teacher.name = input.value;
            }
        });
        
        document.querySelectorAll('.teacher-subject-edit').forEach(input => {
            const id = parseInt(input.getAttribute('data-id'));
            const teacher = appData.teachers.find(t => t.id === id);
            if (teacher) {
                teacher.subject = input.value;
            }
        });
        
        document.querySelectorAll('.teacher-exp-edit').forEach(input => {
            const id = parseInt(input.getAttribute('data-id'));
            const teacher = appData.teachers.find(t => t.id === id);
            if (teacher) {
                teacher.experience = input.value;
            }
        });
        
        saveAllData();
        initTeachers();
        showNotification('Изменения сохранены');
        document.querySelector('.modal').remove();
    }

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
            name: name,
            subject: subject,
            experience: experience
        };
        
        appData.teachers.push(newTeacher);
        saveAllData();
        initTeachers();
        document.getElementById('teacher-modal').style.display = 'none';
        showNotification('Учитель добавлен');
        
        // Очищаем поля
        document.getElementById('teacher-name').value = '';
        document.getElementById('teacher-subject').value = '';
        document.getElementById('teacher-experience').value = '';
    }

    function initGroupsPage() {
        if (currentGroup) {
            updateGroupDisplay();
        }
    }

    function selectGroup(groupId) {
        currentGroup = groupId;
        document.querySelectorAll('.group').forEach(g => {
            g.classList.remove('active');
        });
        document.querySelector(`.group[data-group="${groupId}"]`).classList.add('active');
        updateGroupDisplay();
    }

    function updateGroupDisplay() {
        const groupStudents = document.querySelector('.students-in-group');
        const availableStudents = document.querySelector('.students-to-add');
        const currentGroupSpan = document.getElementById('current-group');
        
        if (currentGroupSpan) currentGroupSpan.textContent = groupIdToName(currentGroup);
        
        // Ученики в группе
        if (groupStudents) {
            groupStudents.innerHTML = '';
            const students = appData.groups[currentGroup] || [];
            students.forEach(studentName => {
                const studentDiv = document.createElement('div');
                studentDiv.className = 'student-item';
                studentDiv.innerHTML = `
                    <span>${studentName}</span>
                    <button onclick="removeStudentFromGroup('${studentName}', '${currentGroup}')">✕</button>
                `;
                groupStudents.appendChild(studentDiv);
            });
        }
        
        // Доступные ученики
        if (availableStudents) {
            availableStudents.innerHTML = '';
            appData.students.forEach(student => {
                if (!appData.groups[currentGroup] || !appData.groups[currentGroup].includes(student.name)) {
                    const studentDiv = document.createElement('div');
                    studentDiv.className = 'student-item';
                    studentDiv.innerHTML = `
                        <span>${student.name} (${student.class})</span>
                        <button onclick="addStudentToGroup(${student.id}, '${currentGroup}')">+</button>
                    `;
                    availableStudents.appendChild(studentDiv);
                }
            });
        }
    }

    function addStudentToGroup(studentId, groupId) {
        const student = appData.students.find(s => s.id === studentId);
        if (student && appData.groups[groupId]) {
            if (!appData.groups[groupId].includes(student.name)) {
                appData.groups[groupId].push(student.name);
                saveAllData();
                updateGroupDisplay();
                showNotification('Ученик добавлен в группу');
            }
        }
    }

    function removeStudentFromGroup(studentName, groupId) {
        if (appData.groups[groupId]) {
            appData.groups[groupId] = appData.groups[groupId].filter(name => name !== studentName);
            saveAllData();
            updateGroupDisplay();
            showNotification('Ученик удален из группы');
        }
    }

    function groupIdToName(id) {
        const names = { 'A': 'А', 'B': 'Б', 'C': 'В', 'D': 'Г', 'E': 'Д' };
        return names[id] || id;
    }

    function initSchedule() {
        const classSelect = document.getElementById('class-select');
        const selectedClass = classSelect ? classSelect.value : '5A';
        const schedule = appData.schedule[selectedClass] || {};
        
        const table = document.querySelector('.schedule-table');
        if (!table) return;
        
        const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        const times = ['9:00-10:00', '10:15-11:15', '11:30-12:30', '13:30-14:30', '14:45-15:45'];
        
        let html = '<tr><th>Время</th>';
        days.forEach(day => {
            html += `<th>${day}</th>`;
        });
        html += '</tr>';
        
        times.forEach(time => {
            html += `<tr><td>${time}</td>`;
            days.forEach(day => {
                const lesson = schedule[day] ? schedule[day][time] : '';
                html += `<td>${lesson || '-'}</td>`;
            });
            html += '</tr>';
        });
        
        table.innerHTML = html;
    }

    function initExtraLessons() {
        const table = document.querySelector('.extra-table');
        if (!table) return;
        
        let html = `
            <tr>
                <th>День</th>
                <th>Время</th>
                <th>Предмет</th>
                <th>Учитель</th>
                <th>Кабинет</th>
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
                </tr>
            `;
        });
        
        table.innerHTML = html;
    }

    function updateWeekDisplay() {
        const weekDisplay = document.querySelector('.week-display');
        if (weekDisplay) {
            weekDisplay.textContent = `Неделя ${currentWeek}`;
        }
        initSchedule();
    }

    // Авторизация
    function login() {
        const username = document.getElementById('login-name').value;
        const password = document.getElementById('login-password').value;
        
        if (!username || !password) {
            showNotification('Заполните все поля');
            return;
        }
        
        const user = usersDatabase[username];
        if (!user) {
            showNotification('Пользователь не найден');
            return;
        }
        
        if (user.password !== password) {
            showNotification('Неверный пароль');
            return;
        }
        
        if (user.role === 'teacher' && !user.approved) {
            showNotification('Ваш запрос еще не одобрен администратором');
            return;
        }
        
        currentUser = {
            username: username,
            name: user.name,
            role: user.role
        };
        
        StorageManager.set('chinese_school_current_user', currentUser);
        updateUIForUser();
        document.getElementById('auth-modal').style.display = 'none';
        showNotification(`Добро пожаловать, ${user.name}!`);
        
        // Очищаем поля
        document.getElementById('login-name').value = '';
        document.getElementById('login-password').value = '';
    }

    function register() {
        const username = document.getElementById('register-name').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        const fullname = document.getElementById('register-fullname').value;
        const role = document.getElementById('register-role').value;
        
        if (!username || !password || !confirmPassword || !fullname) {
            showNotification('Заполните все поля');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Пароли не совпадают');
            return;
        }
        
        if (usersDatabase[username]) {
            showNotification('Пользователь с таким логином уже существует');
            return;
        }
        
        if (role === 'teacher') {
            // Добавляем запрос на регистрацию учителя
            teacherRequests.push({
                username: username,
                password: password,
                name: fullname,
                timestamp: new Date().toISOString()
            });
            
            StorageManager.set('chinese_school_requests', teacherRequests);
            showNotification('Запрос на регистрацию учителя отправлен администратору');
        } else {
            // Сразу регистрируем ученика
            usersDatabase[username] = {
                password: password,
                role: 'student',
                name: fullname,
                approved: true
            };
            
            StorageManager.set('chinese_school_users', usersDatabase);
            showNotification('Регистрация успешна! Теперь вы можете войти.');
        }
        
        document.getElementById('auth-modal').style.display = 'none';
        
        // Очищаем поля
        document.getElementById('register-name').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-confirm').value = '';
        document.getElementById('register-fullname').value = '';
    }

    function logout() {
        currentUser = null;
        StorageManager.set('chinese_school_current_user', null);
        updateUIForUser();
        showNotification('Вы вышли из системы');
    }

    function switchAuthTab(tabName) {
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        document.querySelectorAll('.auth-tabs .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
    }

    function updateUIForUser() {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const userInfo = document.getElementById('current-user-info');
        const adminPanel = document.getElementById('admin-panel');
        const teacherControls = document.querySelectorAll('.teacher-controls');
        const adminControls = document.querySelectorAll('.admin-controls');
        
        if (currentUser) {
            loginBtn.textContent = 'Выйти';
            registerBtn.style.display = 'none';
            userInfo.textContent = `${currentUser.name} (${currentUser.role})`;
            
            // Показываем/скрываем панели управления
            if (currentUser.role === 'admin') {
                adminPanel.classList.remove('hidden');
                teacherControls.forEach(ctrl => ctrl.classList.remove('hidden'));
                adminControls.forEach(ctrl => ctrl.classList.remove('hidden'));
            } else if (currentUser.role === 'teacher') {
                adminPanel.classList.add('hidden');
                teacherControls.forEach(ctrl => ctrl.classList.remove('hidden'));
                adminControls.forEach(ctrl => ctrl.classList.add('hidden'));
            } else {
                adminPanel.classList.add('hidden');
                teacherControls.forEach(ctrl => ctrl.classList.add('hidden'));
                adminControls.forEach(ctrl => ctrl.classList.add('hidden'));
            }
        } else {
            loginBtn.textContent = 'Войти';
            registerBtn.style.display = 'inline-block';
            userInfo.textContent = 'Гость';
            adminPanel.classList.add('hidden');
            teacherControls.forEach(ctrl => ctrl.classList.add('hidden'));
            adminControls.forEach(ctrl => ctrl.classList.add('hidden'));
        }
    }

    // Управление запросами учителей
    function initRequestsList() {
        const requestsList = document.querySelector('.requests-list');
        if (!requestsList) return;
        
        if (teacherRequests.length === 0) {
            requestsList.innerHTML = '<p>Нет активных запросов</p>';
            return;
        }
        
        requestsList.innerHTML = teacherRequests.map((request, index) => `
            <div class="request-item">
                <p><strong>ФИО:</strong> ${request.name}</p>
                <p><strong>Логин:</strong> ${request.username}</p>
                <p><strong>Пароль:</strong> ${request.password}</p>
                <p><strong>Дата:</strong> ${new Date(request.timestamp).toLocaleString()}</p>
                <div class="request-actions">
                    <button onclick="approveTeacherRequest(${index})">Принять</button>
                    <button onclick="rejectTeacherRequest(${index})" style="background: var(--accent-color)">Отклонить</button>
                </div>
            </div>
        `).join('');
    }

    function approveTeacherRequest(index) {
        const request = teacherRequests[index];
        
        // Регистрируем учителя
        usersDatabase[request.username] = {
            password: request.password,
            role: 'teacher',
            name: request.name,
            approved: true
        };
        
        // Удаляем запрос
        teacherRequests.splice(index, 1);
        
        StorageManager.set('chinese_school_users', usersDatabase);
        StorageManager.set('chinese_school_requests', teacherRequests);
        
        initRequestsList();
        showNotification('Учитель успешно зарегистрирован');
    }

    function rejectTeacherRequest(index) {
        teacherRequests.splice(index, 1);
        StorageManager.set('chinese_school_requests', teacherRequests);
        initRequestsList();
        showNotification('Запрос отклонен');
    }

    // Вопрос-ответ
    function updateQAContent() {
        updateMyQuestions();
        updateAllQuestions();
    }

    function updateMyQuestions() {
        const myQuestionsList = document.querySelector('#my-questions-tab .questions-list');
        if (!myQuestionsList) return;
        
        const myQuestions = appData.questions.filter(q => 
            q.author === currentUser.username
        );
        
        if (myQuestions.length === 0) {
            myQuestionsList.innerHTML = '<p>У вас пока нет вопросов</p>';
            return;
        }
        
        myQuestionsList.innerHTML = myQuestions.map(question => `
            <div class="question-item">
                <p><strong>Вопрос:</strong> ${question.text}</p>
                <p><strong>Дата:</strong> ${new Date(question.timestamp).toLocaleString()}</p>
                ${question.answer ? `
                    <p><strong>Ответ:</strong> ${question.answer}</p>
                    <p><strong>Ответил:</strong> ${question.answeredBy}</p>
                ` : '<p><em>Ожидает ответа</em></p>'}
            </div>
        `).join('');
    }

    function updateAllQuestions() {
        const allQuestionsList = document.querySelector('#all-questions-tab .all-questions-list');
        if (!allQuestionsList) return;
        
        if (appData.questions.length === 0) {
            allQuestionsList.innerHTML = '<p>Пока нет вопросов</p>';
            return;
        }
        
        allQuestionsList.innerHTML = appData.questions.map((question, index) => `
            <div class="question-item">
                <p><strong>Автор:</strong> ${usersDatabase[question.author]?.name || question.author}</p>
                <p><strong>Вопрос:</strong> ${question.text}</p>
                <p><strong>Дата:</strong> ${new Date(question.timestamp).toLocaleString()}</p>
                ${question.answer ? `
                    <p><strong>Ответ:</strong> ${question.answer}</p>
                    <p><strong>Ответил:</strong> ${question.answeredBy}</p>
                ` : (currentUser.role === 'admin' || currentUser.role === 'teacher') ? `
                    <button onclick="showAnswerModal(${index})">Ответить</button>
                ` : '<p><em>Ожидает ответа</em></p>'}
            </div>
        `).join('');
    }

    function submitQuestion() {
        const questionText = document.getElementById('question-text').value;
        if (!questionText) {
            showNotification('Введите вопрос');
            return;
        }
        
        const newQuestion = {
            id: Date.now(),
            text: questionText,
            author: currentUser.username,
            timestamp: new Date().toISOString(),
            answer: null,
            answeredBy: null
        };
        
        appData.questions.push(newQuestion);
        saveAllData();
        updateQAContent();
        document.getElementById('question-text').value = '';
        showNotification('Вопрос отправлен');
    }

    function showAnswerModal(questionIndex) {
        currentQuestionId = questionIndex;
        document.getElementById('answer-modal').style.display = 'block';
    }

    function submitAnswer() {
        const answerText = document.getElementById('answer-text').value;
        if (!answerText) {
            showNotification('Введите ответ');
            return;
        }
        
        if (currentQuestionId === null) return;
        
        appData.questions[currentQuestionId].answer = answerText;
        appData.questions[currentQuestionId].answeredBy = currentUser.name;
        saveAllData();
        
        document.getElementById('answer-modal').style.display = 'none';
        document.getElementById('answer-text').value = '';
        currentQuestionId = null;
        
        updateQAContent();
        showNotification('Ответ отправлен');
    }

    function updateUnansweredCount() {
        const unanswered = appData.questions.filter(q => !q.answer).length;
        unansweredQuestions = unanswered;
        
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = unanswered;
            badge.style.display = unanswered > 0 ? 'flex' : 'none';
        }
    }

    // Тема
    function toggleTheme() {
        document.body.classList.toggle('night-theme');
        const isNight = document.body.classList.contains('night-theme');
        localStorage.setItem('chinese_school_theme', isNight ? 'night' : 'day');
    }

    function loadTheme() {
        const savedTheme = localStorage.getItem('chinese_school_theme');
        if (savedTheme === 'night') {
            document.body.classList.add('night-theme');
        }
    }

    // Факты о Китае
    function showRandomFact() {
        const factElement = document.getElementById('china-fact');
        if (!factElement || appData.chineseFacts.length === 0) return;
        
        let currentIndex = 0;
        
        setInterval(() => {
            factElement.style.opacity = '0';
            
            setTimeout(() => {
                factElement.textContent = appData.chineseFacts[currentIndex];
                factElement.style.opacity = '1';
                currentIndex = (currentIndex + 1) % appData.chineseFacts.length;
            }, 500);
        }, 5000);
    }

    // Делаем функции глобальными для HTML-обработчиков
    window.approveTeacherRequest = approveTeacherRequest;
    window.rejectTeacherRequest = rejectTeacherRequest;
    window.addStudentToGroup = addStudentToGroup;
    window.removeStudentFromGroup = removeStudentFromGroup;
    window.deleteTeacher = deleteTeacher;
    window.saveTeachers = saveTeachers;
    window.showAnswerModal = showAnswerModal;

    // Запуск приложения
    initApp();
});
