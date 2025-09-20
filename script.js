document.addEventListener('DOMContentLoaded', function() {
    // Основные переменные
    let currentUser = null;
    let currentWeek = 1;
    let currentGroup = null;
    let unansweredQuestions = 0;
    let currentQuestionId = null;

    // База данных пользователей (админ по умолчанию)
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
            },
            '6A': {},
            '7A': {},
            '8A': {},
            '9A': {},
            '10A': {},
            '11A': {}
        },
        extraLessons: [
            { id: 1, day: "Понедельник", time: "15:30-17:00", subject: "Каллиграфия", teacher: "Иванова М.И.", classroom: "305" }
        ],
        chineseFacts: [
            "Китай - третья по величине страна в мире",
            "Бумага была изобретена в Китае",
            "Великая Китайская стена - самое длинное сооружение"
        ],
        holidays: {
            '01-01': { title: 'Новый год', message: 'С Новым годом!' }
        }
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
        
        changePage('teachers');
        document.querySelector('.menu-item[data-page="teachers"]').classList.add('active');
    }

    // Проверка автоматического входа
    function checkAutoLogin() {
        const savedUser = localStorage.getItem('chinese_school_current_user');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            updateUIForUser();
        }
    }

    // Загрузка всех данных
    function loadAllData() {
        const savedData = localStorage.getItem('chinese_school_data');
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.assign(appData, data.appData);
            Object.assign(usersDatabase, data.usersDatabase);
            teacherRequests.push(...data.teacherRequests || []);
        }

        const savedUser = localStorage.getItem('chinese_school_current_user');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
        }
    }

    // Сохранение всех данных
    function saveAllData() {
        const dataToSave = {
            appData: appData,
            usersDatabase: usersDatabase,
            teacherRequests: teacherRequests
        };
        
        localStorage.setItem('chinese_school_data', JSON.stringify(dataToSave));
        if (currentUser) {
            localStorage.setItem('chinese_school_current_user', JSON.stringify(currentUser));
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

        // Формы авторизации
        document.getElementById('login-submit').addEventListener('click', login);
        document.getElementById('register-submit').addEventListener('click', register);

        // Вкладки авторизации
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                switchAuthTab(this.getAttribute('data-tab'));
            });
        });

        // Остальные обработчики...
        document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
        document.getElementById('qa-button').addEventListener('click', handleQAClick);

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
        document.getElementById('edit-teachers').addEventListener('click', () => {
            if (!checkAdminAccess()) return;
            showModal(document.getElementById('edit-teachers-modal'));
            initTeachersEditList();
        });
        
        document.getElementById('manage-requests').addEventListener('click', () => {
            if (!checkAdminAccess()) return;
            showModal(document.getElementById('requests-modal'));
            initRequestsList();
        });
        
        document.getElementById('add-student').addEventListener('click', () => {
            if (!checkTeacherAccess()) return;
            showModal(document.getElementById('student-modal'));
        });
        
        document.getElementById('save-student').addEventListener('click', addStudent);
        
        document.getElementById('add-lesson').addEventListener('click', () => {
            if (!checkTeacherAccess()) return;
            showModal(document.getElementById('lesson-modal'));
        });
        
        document.getElementById('save-lesson').addEventListener('click', addLesson);
        
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

        // Вопрос-ответ
        document.getElementById('submit-question').addEventListener('click', submitQuestion);
        document.getElementById('submit-answer').addEventListener('click', submitAnswer);

        // Закрытие праздничного окна
        document.getElementById('close-holiday').addEventListener('click', () => {
            hideModal(document.getElementById('holiday-modal'));
        });

        // Вкладки QA
        document.querySelectorAll('.qa-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                switchQATab(this.getAttribute('data-tab'));
            });
        });
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
            page.classList.remove('active');
            page.style.display = 'none';
        });
        
        const activePage = document.getElementById(pageId);
        if (activePage) {
            activePage.style.display = 'block';
            setTimeout(() => activePage.classList.add('active'), 10);
        }
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
            background: #3498db;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1001;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
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
                    const index = parseInt(this.getAttribute('data-index'));
                    approveTeacherRequest(index);
                });
                
                item.querySelector('.reject-request').addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    rejectTeacherRequest(index);
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
        
        // Добавляем обработчики для кнопок
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
            document.getElementById('extra-day').value = lesson.day;
            document.getElementById('extra-time').value = lesson.time;
            document.getElementById('extra-subject').value = lesson.subject;
            document.getElementById('extra-teacher').value = lesson.teacher;
            document.getElementById('extra-classroom').value = lesson.classroom;
            
            document.getElementById('save-extra').setAttribute('data-edit-id', id);
            showModal(document.getElementById('extra-modal'));
        }
    }

    function deleteExtraLesson(id) {
        if (confirm('Удалить это занятие?')) {
            const index = appData.extraLessons.findIndex(l => l.id === id);
            if (index !== -1) {
                appData.extraLessons.splice(index, 1);
                saveAllData();
                initExtraLessons();
                showNotification('Занятие удалено');
            }
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
        
        currentUser = { 
            login: loginName,
            name: user.name, 
            role: user.role 
        };
        
        updateUIForUser();
        hideModal(document.getElementById('auth-modal'));
        showNotification(`Добро пожаловать, ${user.name}!`);
        saveAllData();
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
        
        hideModal(document.getElementById('auth-modal'));
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
        
        document.querySelectorAll('.teacher-controls').forEach(el => {
            el.classList.toggle('hidden', !isTeacher && !isAdmin);
        });
        
        document.querySelectorAll('.admin-controls').forEach(el => {
            el.classList.toggle('hidden', !isAdmin);
        });

        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        
        if (currentUser) {
            loginBtn.textContent = 'Выйти';
            registerBtn.textContent = currentUser.name;
        } else {
            loginBtn.textContent = 'Войти';
            registerBtn.textContent = 'Регистрация';
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
        
        const randomIndex = Math.floor(Math.random() * appData.chineseFacts.length);
        factElement.textContent = appData.chineseFacts[randomIndex];
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
        }
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
        saveAllData();
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
            
            saveAllData();
            hideModal(document.getElementById('answer-modal'));
            showNotification('Ответ отправлен!');
            updateQAContent();
        }
    }

    function updateQAContent() {
        const myQuestions = appData.questions.filter(q => q.student === currentUser?.name);
        const myQuestionsList = document.querySelector('#questions-tab .questions-list');
        if (myQuestionsList) {
            myQuestionsList.innerHTML = myQuestions.length ? '' : '<p>У вас пока нет вопросов</p>';
            myQuestions.forEach(q => myQuestionsList.appendChild(createQuestionItem(q)));
        }

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
                showModal(document.getElementById('answer-modal'));
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
            const div = document.createElement('div');
            div.className = 'student-item';
            div.innerHTML = `
                <span>${studentName}</span>
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
            saveAllData();
        }
    }

    function removeStudentFromGroup(studentName) {
        appData.groups[currentGroup] = appData.groups[currentGroup]?.filter(name => name !== studentName);
        updateGroupStudents();
        updateAvailableStudents();
        saveAllData();
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
        saveAllData();
        initTeachers();
        
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
        
        saveAllData();
        
        if (currentGroup) {
            updateGroupStudents();
            updateAvailableStudents();
        }
        
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
        
        saveAllData();
        initSchedule();
        
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
            const lesson = appData.extraLessons.find(l => l.id === parseInt(editId));
            if (lesson) {
                lesson.day = day;
                lesson.time = time;
                lesson.subject = subject;
                lesson.teacher = teacher;
                lesson.classroom = classroom;
            }
            document.getElementById('save-extra').removeAttribute('data-edit-id');
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
        
        hideModal(document.getElementById('extra-modal'));
        showNotification('Дополнительное занятие добавлено');
    }

    function updateWeekDisplay() {
        const weekDisplay = document.querySelector('.week-display');
        if (weekDisplay) weekDisplay.textContent = `Неделя ${currentWeek}`;
    }

    // Запуск приложения
    initApp();
});
