document.addEventListener('DOMContentLoaded', function() {
    // Основные переменные
    let currentUser = null;
    let currentWeek = 1;
    let currentGroup = null;
    let unansweredQuestions = 0;
    let currentQuestionId = null;

    // База данных пользователей
    const usersDatabase = {
        'admin': { password: 'admin123', role: 'admin', name: 'Администратор', approved: true },
        'teacher1': { password: 'teacher1', role: 'teacher', name: 'Иванова Мария', approved: true },
        'teacher2': { password: 'teacher2', role: 'teacher', name: 'Петрова Анна', approved: true },
        'student1': { password: 'student1', role: 'student', name: 'Рудый Михаил', approved: true },
        'student2': { password: 'student2', role: 'student', name: 'Иванов Иван', approved: true }
    };

    // Запросы на регистрацию учителей
    const teacherRequests = [];

    // Данные приложения
    const appData = {
        questions: [],
        students: [
            { id: 1, name: "Рудый Михаил Игоревич", group: "A", class: "10A", login: "student1" },
            { id: 2, name: "Иванов Иван Иванович", group: "B", class: "10A", login: "student2" },
            { id: 3, name: "Петрова Анна Сергеевна", group: "C", class: "9A", login: "student3" }
        ],
        teachers: [
            { id: 1, name: 'Иванова Мария', subject: 'Китайский язык', experience: '10 лет', login: "teacher1" },
            { id: 2, name: 'Петрова Анна', subject: 'Китайская литература', experience: '8 лет', login: "teacher2" },
            { id: 3, name: 'Сидоров Иван', subject: 'История Китая', experience: '12 лет', login: "teacher3" }
        ],
        groups: {
            'A': ["Рудый Михаил Игоревич"],
            'B': ["Иванов Иван Иванович"],
            'C': ["Петрова Анна Сергеевна"],
            'D': [],
            'E': []
        },
        schedule: {
            '5A': {},
            '6A': {},
            '7A': {},
            '8A': {},
            '9A': {},
            '10A': {},
            '11A': {}
        },
        extraLessons: [
            { day: "Понедельник", time: "15:30-17:00", subject: "Каллиграфия", teacher: "Иванова М.И.", classroom: "305" },
            { day: "Среда", time: "15:30-17:00", subject: "Китайская живопись", teacher: "Петрова А.S.", classroom: "214" },
            { day: "Пятница", time: "15:30-17:00", subject: "Чайная церемония", teacher: "Сидоров И.П.", classroom: "123" }
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
        
        // По умолчанию открываем страницу учителей
        changePage('teachers');
        document.querySelector('.menu-item[data-page="teachers"]').classList.add('active');
        
        // Анимация появления
        document.body.style.opacity = 0;
        setTimeout(() => {
            document.body.style.transition = 'opacity 0.5s ease-in';
            document.body.style.opacity = 1;
        }, 100);
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
        localStorage.setItem('chinese_school_current_user', JSON.stringify(currentUser));
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
                    
                    // Инициализация страницы при переходе
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
                const modal = this.closest('.modal');
                hideModal(modal);
            });
        });

        // Формы авторизации
        document.getElementById('login-submit').addEventListener('click', login);
        document.getElementById('register-submit').addEventListener('click', register);

        // Вкладки авторизации
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tab = this.getAttribute('data-tab');
                switchAuthTab(tab);
            });
        });

        // Кнопка темы
        document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

        // Кнопка вопрос-ответ
        document.getElementById('qa-button').addEventListener('click', () => {
            if (!currentUser) {
                showNotification('Сначала войдите в систему');
                showModal(document.getElementById('auth-modal'));
                return;
            }
            showModal(document.getElementById('qa-modal'));
            updateQAContent();
        });

        // Вкладки QA
        document.querySelectorAll('.qa-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                switchQATab(tabName);
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
                const groupName = this.getAttribute('data-group');
                selectGroup(groupName);
            });
        });

        // Кнопки управления
        document.getElementById('add-teacher').addEventListener('click', () => {
            if (!currentUser || currentUser.role !== 'admin') {
                showNotification('Только администратор может добавлять учителей');
                return;
            }
            showModal(document.getElementById('teacher-modal'));
        });
        
        document.getElementById('save-teacher').addEventListener('click', addTeacher);
        
        document.getElementById('edit-teachers').addEventListener('click', () => {
            if (!currentUser || currentUser.role !== 'admin') {
                showNotification('Только администратор может редактировать учителей');
                return;
            }
            showModal(document.getElementById('edit-teachers-modal'));
            initTeachersEditList();
        });
        
        document.getElementById('add-student').addEventListener('click', () => {
            if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'teacher')) {
                showNotification('Только учителя и администраторы могут добавлять учеников');
                return;
            }
            showModal(document.getElementById('student-modal'));
        });
        
        document.getElementById('save-student').addEventListener('click', addStudent);
        
        document.getElementById('manage-groups').addEventListener('click', () => {
            if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'teacher')) {
                showNotification('Только учителя и администраторы могут управлять группами');
                return;
            }
            changePage('groups');
        });
        
        document.getElementById('add-lesson').addEventListener('click', () => {
            if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'teacher')) {
                showNotification('Только учителя и администраторы могут добавлять занятия');
                return;
            }
            showModal(document.getElementById('lesson-modal'));
        });
        
        document.getElementById('save-lesson').addEventListener('click', addLesson);
        
        document.getElementById('add-extra').addEventListener('click', () => {
            if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'teacher')) {
                showNotification('Только учителя и администраторы могут добавлять занятия');
                return;
            }
            showModal(document.getElementById('extra-modal'));
        });
        
        document.getElementById('save-extra').addEventListener('click', addExtraLesson);

        // Навигация по неделям
        document.getElementById('prev-week').addEventListener('click', () => {
            if (currentWeek > 1) {
                currentWeek--;
                updateWeekDisplay();
            }
        });

        document.getElementById('next-week').addEventListener('click', () => {
            currentWeek++;
            updateWeekDisplay();
        });

        // Смена класса для расписания
        document.getElementById('class-select').addEventListener('change', initSchedule);
    }

    function handleAuthButtonClick() {
        if (this.id === 'login-btn' && currentUser) {
            logout();
        } else {
            showModal(document.getElementById('auth-modal'));
            if (this.id === 'register-btn') {
                switchAuthTab('register');
            } else {
                switchAuthTab('login');
            }
        }
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
        initStudents();
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
                    const value = this.value;
                    teacher[field] = value;
                    saveAllData();
                    initTeachers();
                });
            });
            
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

    function initStudents() {
        const studentList = document.querySelector('.student-list');
        if (!studentList) return;
        
        studentList.innerHTML = '';
        appData.students.forEach(student => {
            const card = document.createElement('div');
            card.className = 'student-card';
            card.innerHTML = `
                <h3>${student.name}</h3>
                <p>Класс: ${student.class}</p>
                <p>Группа: ${student.group}</p>
            `;
            studentList.appendChild(card);
        });
    }

    function initSchedule() {
        const table = document.querySelector('.schedule-table');
        if (!table) return;
        
        const selectedClass = document.getElementById('class-select').value;
        const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
        const times = ['9:00-10:00', '10:15-11:15', '11:30-12:30', '13:00-14:00', '14:15-15:15'];
        
        let headerRow = '<tr><th>Время</th>';
        days.forEach(day => headerRow += `<th>${day}</th>`);
        headerRow += '</tr>';
        table.innerHTML = headerRow;
        
        times.forEach(time => {
            let row = `<tr><td>${time}</td>`;
            days.forEach(day => {
                const lesson = appData.schedule[selectedClass]?.[day]?.[time] || '';
                row += `<td>${lesson}</td>`;
            });
            row += '</tr>';
            table.innerHTML += row;
        });
        
        updateWeekDisplay();
    }

    function initExtraLessons() {
        const table = document.querySelector('.extra-table');
        if (!table) return;
        
        table.innerHTML = `
            <tr>
                <th>День</th>
                <th>Время</th>
                <th>Занятие</th>
                <th>Преподаватель</th>
                <th>Кабинет</th>
            </tr>
        `;
        
        appData.extraLessons.forEach(lesson => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${lesson.day}</td>
                <td>${lesson.time}</td>
                <td>${lesson.subject}</td>
                <td>${lesson.teacher}</td>
                <td>${lesson.classroom}</td>
            `;
            table.appendChild(row);
        });
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
            showNotification('Ваш аккаунт ожидает подтверждения администратора');
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
            // Для учителей отправляем запрос администратору
            teacherRequests.push({
                login: loginName,
                password: password,
                name: fullName,
                role: role,
                timestamp: new Date().toISOString()
            });
            
            showNotification('Запрос на регистрацию учителя отправлен администратору');
            hideModal(document.getElementById('auth-modal'));
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
            
            updateUIForUser();
            hideModal(document.getElementById('auth-modal'));
            showNotification(`Регистрация успешна! Добро пожаловать, ${fullName}!`);
        }
        
        saveAllData();
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
        const isStudent = currentUser?.role === 'student';
        
        document.querySelectorAll('.teacher-controls').forEach(el => {
            el.classList.toggle('hidden', !isTeacher && !isAdmin);
        });
        
        document.querySelectorAll('.admin-controls').forEach(el => {
            el.classList.toggle('hidden', !isAdmin);
        });

        // Ученики видят занятия
        document.querySelectorAll('.menu-item[data-page="lessons"], .menu-item[data-page="extra"]').forEach(item => {
            item.style.display = 'block';
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
        if (currentUser?.role === 'teacher' || currentUser?.role === 'admin') {
            document.querySelectorAll('.group').forEach(group => group.style.display = 'block');
            selectGroup('A');
        } else {
            document.querySelectorAll('.group').forEach(group => group.style.display = 'none');
            const container = document.querySelector('.groups-container');
            if (container) container.innerHTML = '<p>Управление группами доступно только учителям и администраторам</p>';
        }
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
                    <span>${student.name}</span>
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
        
        saveAllData();
        initStudents();
        
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

        if (!appData.schedule[selectedClass][day]) {
            appData.schedule[selectedClass][day] = {};
        }
        
        appData.schedule[selectedClass][day][time] = `${subject} (${classroom})`;
        
        saveAllData();
        initSchedule();
        
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

        if (!day || !time || !subject || !teacher || !classroom) {
            showNotification('Заполните все поля');
            return;
        }

        const newLesson = {
            day,
            time,
            subject,
            teacher,
            classroom
        };
        
        appData.extraLessons.push(newLesson);
        saveAllData();
        initExtraLessons();
        
        document.getElementById('extra-time').value = '';
        document.getElementById('extra-subject').value = '';
        document.getElementById('extra-teacher').value = '';
        document.getElementById('extra-classroom').value = '';
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