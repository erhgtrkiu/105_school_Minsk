class SchoolSystem {
    constructor() {
        this.currentUser = null;
        this.teachers = [];
        this.students = [];
        this.requests = [];
        this.questions = [];
        this.schedule = {};
        this.extraLessons = {};
        this.currentWeek = 1;
        this.isSyncing = false;
        
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.updateUI();
        this.checkHolidays();
        this.startSyncInterval();
    }

    // ========== СИНХРОНИЗАЦИЯ ==========
    startSyncInterval() {
        setInterval(() => {
            this.syncWithServer();
        }, 30000); // Синхронизация каждые 30 секунд
    }

    async syncWithServer() {
        if (this.isSyncing) return;
        
        this.isSyncing = true;
        this.showSyncIndicator(true);
        
        try {
            // Имитация синхронизации с сервером
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // В реальном приложении здесь был бы fetch к серверу
            const serverData = this.getServerData();
            this.mergeData(serverData);
            
            this.saveToStorage();
            this.updateUI();
            
            this.showToast('Данные синхронизированы', 'success');
        } catch (error) {
            console.error('Ошибка синхронизации:', error);
            this.showToast('Ошибка синхронизации', 'error');
        } finally {
            this.isSyncing = false;
            this.showSyncIndicator(false);
        }
    }

    getServerData() {
        // Имитация данных с сервера
        return {
            teachers: JSON.parse(localStorage.getItem('server_teachers') || '[]'),
            students: JSON.parse(localStorage.getItem('server_students') || '[]'),
            requests: JSON.parse(localStorage.getItem('server_requests') || '[]'),
            questions: JSON.parse(localStorage.getItem('server_questions') || '[]'),
            schedule: JSON.parse(localStorage.getItem('server_schedule') || '{}'),
            extraLessons: JSON.parse(localStorage.getItem('server_extra') || '{}')
        };
    }

    mergeData(serverData) {
        // Простая стратегия слияния: серверные данные имеют приоритет
        this.teachers = [...serverData.teachers];
        this.students = [...serverData.students];
        this.requests = [...serverData.requests];
        this.questions = [...serverData.questions];
        this.schedule = {...serverData.schedule};
        this.extraLessons = {...serverData.extraLessons};
    }

    saveToServer() {
        // Имитация сохранения на сервер
        localStorage.setItem('server_teachers', JSON.stringify(this.teachers));
        localStorage.setItem('server_students', JSON.stringify(this.students));
        localStorage.setItem('server_requests', JSON.stringify(this.requests));
        localStorage.setItem('server_questions', JSON.stringify(this.questions));
        localStorage.setItem('server_schedule', JSON.stringify(this.schedule));
        localStorage.setItem('server_extra', JSON.stringify(this.extraLessons));
    }

    // ========== ЛОКАЛЬНОЕ ХРАНИЛИЩЕ ==========
    saveToStorage() {
        localStorage.setItem('school_teachers', JSON.stringify(this.teachers));
        localStorage.setItem('school_students', JSON.stringify(this.students));
        localStorage.setItem('school_requests', JSON.stringify(this.requests));
        localStorage.setItem('school_questions', JSON.stringify(this.questions));
        localStorage.setItem('school_schedule', JSON.stringify(this.schedule));
        localStorage.setItem('school_extra', JSON.stringify(this.extraLessons));
        localStorage.setItem('school_current_user', JSON.stringify(this.currentUser));
        this.saveToServer();
    }

    loadFromStorage() {
        this.teachers = JSON.parse(localStorage.getItem('school_teachers') || '[]');
        this.students = JSON.parse(localStorage.getItem('school_students') || '[]');
        this.requests = JSON.parse(localStorage.getItem('school_requests') || '[]');
        this.questions = JSON.parse(localStorage.getItem('school_questions') || '[]');
        this.schedule = JSON.parse(localStorage.getItem('school_schedule') || '{}');
        this.extraLessons = JSON.parse(localStorage.getItem('school_extra') || '{}');
        this.currentUser = JSON.parse(localStorage.getItem('school_current_user') || 'null');
    }

    // ========== АВТОРИЗАЦИЯ ==========
    login(username, password) {
        // Проверяем среди учителей
        const teacher = this.teachers.find(t => 
            t.username === username && t.password === password
        );
        
        if (teacher) {
            this.currentUser = {
                username: teacher.username,
                fullName: teacher.fullName,
                role: teacher.role
            };
            this.saveToStorage();
            this.updateUI();
            return true;
        }

        // Проверяем среди учеников
        const student = this.students.find(s => 
            s.username === username && s.password === password
        );
        
        if (student) {
            this.currentUser = {
                username: student.username,
                fullName: student.fullName,
                role: 'student'
            };
            this.saveToStorage();
            this.updateUI();
            return true;
        }

        return false;
    }

    register(role, username, password, fullName) {
        // Проверяем, существует ли пользователь
        if (this.teachers.some(t => t.username === username) || 
            this.students.some(s => s.username === username)) {
            return false;
        }

        if (role === 'teacher') {
            // Добавляем запрос на регистрацию учителя
            this.requests.push({
                username,
                password,
                fullName,
                role: 'teacher',
                status: 'pending',
                timestamp: new Date().toISOString()
            });
        } else {
            // Сразу регистрируем ученика
            this.students.push({
                username,
                password,
                fullName,
                role: 'student',
                class: '',
                group: ''
            });
        }

        this.saveToStorage();
        return true;
    }

    logout() {
        this.currentUser = null;
        this.saveToStorage();
        this.updateUI();
    }

    // ========== УПРАВЛЕНИЕ ЗАПРОСАМИ ==========
    approveRequest(requestIndex) {
        const request = this.requests[requestIndex];
        if (request && request.status === 'pending') {
            request.status = 'approved';
            
            // Добавляем учителя в систему
            this.teachers.push({
                username: request.username,
                password: request.password,
                fullName: request.fullName,
                role: 'teacher'
            });

            this.saveToStorage();
            this.updateUI();
            return true;
        }
        return false;
    }

    rejectRequest(requestIndex) {
        const request = this.requests[requestIndex];
        if (request && request.status === 'pending') {
            request.status = 'rejected';
            this.saveToStorage();
            this.updateUI();
            return true;
        }
        return false;
    }

    // ========== УПРАВЛЕНИЕ УЧИТЕЛЯМИ ==========
    addTeacher(fullName, subject, experience) {
        const username = this.generateUsername(fullName);
        const password = this.generatePassword();
        
        this.teachers.push({
            username,
            password,
            fullName,
            subject,
            experience,
            role: 'teacher'
        });

        this.saveToStorage();
        this.updateUI();
        return { username, password };
    }

    updateTeacher(index, fullName, subject, experience) {
        if (this.teachers[index]) {
            this.teachers[index].fullName = fullName;
            this.teachers[index].subject = subject;
            this.teachers[index].experience = experience;
            this.saveToStorage();
            this.updateUI();
            return true;
        }
        return false;
    }

    deleteTeacher(index) {
        if (this.teachers[index]) {
            this.teachers.splice(index, 1);
            this.saveToStorage();
            this.updateUI();
            return true;
        }
        return false;
    }

    // ========== УПРАВЛЕНИЕ УЧЕНИКАМИ ==========
    addStudent(fullName, studentClass, group) {
        const username = this.generateUsername(fullName);
        const password = this.generatePassword();
        
        this.students.push({
            username,
            password,
            fullName,
            class: studentClass,
            group,
            role: 'student'
        });

        this.saveToStorage();
        this.updateUI();
        return { username, password };
    }

    // ========== ВОПРОСЫ И ОТВЕТЫ ==========
    addQuestion(question) {
        if (!this.currentUser) return false;

        this.questions.push({
            id: Date.now(),
            username: this.currentUser.username,
            fullName: this.currentUser.fullName,
            question,
            answer: '',
            timestamp: new Date().toISOString(),
            answered: false
        });

        this.saveToStorage();
        this.updateUI();
        return true;
    }

    answerQuestion(questionId, answer) {
        const question = this.questions.find(q => q.id === questionId);
        if (question) {
            question.answer = answer;
            question.answered = true;
            question.answeredBy = this.currentUser.fullName;
            question.answerTimestamp = new Date().toISOString();
            this.saveToStorage();
            this.updateUI();
            return true;
        }
        return false;
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========
    generateUsername(fullName) {
        const base = fullName.toLowerCase().replace(/\s+/g, '.');
        let username = base;
        let counter = 1;

        while (this.teachers.some(t => t.username === username) || 
               this.students.some(s => s.username === username)) {
            username = `${base}${counter}`;
            counter++;
        }

        return username;
    }

    generatePassword() {
        return Math.random().toString(36).slice(-8);
    }

    checkHolidays() {
        const today = new Date();
        const holidays = [
            { date: new Date(today.getFullYear(), 0, 1), title: 'Новый год', message: 'С Новым годом!' },
            { date: new Date(today.getFullYear(), 1, 14), title: 'День святого Валентина', message: 'С Днем святого Валентина!' },
            { date: new Date(today.getFullYear(), 1, 23), title: 'День защитника Отечества', message: 'С 23 Февраля!' },
            { date: new Date(today.getFullYear(), 2, 8), title: 'Международный женский день', message: 'С 8 Марта!' },
            { date: new Date(today.getFullYear(), 4, 1), title: 'День труда', message: 'С 1 Мая!' },
            { date: new Date(today.getFullYear(), 4, 9), title: 'День Победы', message: 'С Днем Победы!' },
            { date: new Date(today.getFullYear(), 5, 12), title: 'День России', message: 'С Днем России!' },
            { date: new Date(today.getFullYear(), 10, 4), title: 'День народного единства', message: 'С Днем народного единства!' }
        ];

        const currentHoliday = holidays.find(holiday => 
            holiday.date.getDate() === today.getDate() &&
            holiday.date.getMonth() === today.getMonth()
        );

        if (currentHoliday) {
            this.showHolidayModal(currentHoliday.title, currentHoliday.message);
        }
    }

    // ========== UI МЕТОДЫ ==========
    showSyncIndicator(show) {
        const indicator = document.getElementById('sync-indicator');
        if (!indicator) return;

        if (show) {
            indicator.classList.add('visible', 'syncing');
            indicator.innerHTML = '<span class="sync-icon">🔄</span> Синхронизация...';
        } else {
            indicator.classList.remove('syncing');
            indicator.innerHTML = '<span class="sync-icon">✅</span> Синхронизировано';
            setTimeout(() => {
                indicator.classList.remove('visible');
            }, 2000);
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('visible');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    showHolidayModal(title, message) {
        const modal = document.getElementById('holiday-modal');
        const titleEl = document.getElementById('holiday-title');
        const messageEl = document.getElementById('holiday-message');

        titleEl.textContent = title;
        messageEl.textContent = message;

        modal.style.display = 'flex';

        // Создаем фейерверк
        this.createFireworks();
    }

    createFireworks() {
        const container = document.querySelector('.fireworks');
        if (!container) return;

        for (let i = 0; i < 50; i++) {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.setProperty('--x', `${Math.random() * 200 - 100}px`);
            firework.style.setProperty('--y', `${Math.random() * 200 - 100}px`);
            firework.style.animationDelay = `${Math.random() * 2}s`;
            container.appendChild(firework);

            setTimeout(() => {
                container.removeChild(firework);
            }, 2000);
        }
    }

    updateUI() {
        this.updateUserInfo();
        this.updateTeachersList();
        this.updateRequestsList();
        this.updateQuestionsList();
        this.updateSchedule();
        this.updateExtraLessons();
        this.updateNotificationBadge();
    }

    updateUserInfo() {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const adminControls = document.querySelector('.admin-controls');
        const teacherControls = document.querySelectorAll('.teacher-controls');

        if (this.currentUser) {
            loginBtn.textContent = `Выйти (${this.currentUser.fullName})`;
            registerBtn.style.display = 'none';
            
            // Обновляем класс body для стилей
            document.body.className = '';
            document.body.classList.add(`role-${this.currentUser.role}`);

            // Показываем/скрываем элементы управления
            if (this.currentUser.role === 'admin') {
                adminControls.classList.remove('hidden');
                teacherControls.forEach(ctrl => ctrl.classList.remove('hidden'));
            } else if (this.currentUser.role === 'teacher') {
                adminControls.classList.add('hidden');
                teacherControls.forEach(ctrl => ctrl.classList.remove('hidden'));
            } else {
                adminControls.classList.add('hidden');
                teacherControls.forEach(ctrl => ctrl.classList.add('hidden'));
            }
        } else {
            loginBtn.textContent = 'Войти';
            registerBtn.style.display = 'list-item';
            document.body.className = '';
            adminControls.classList.add('hidden');
            teacherControls.forEach(ctrl => ctrl.classList.add('hidden'));
        }
    }

    updateTeachersList() {
        const container = document.querySelector('.teacher-list');
        if (!container) return;

        container.innerHTML = this.teachers.map(teacher => `
            <div class="teacher-card">
                <h3>${teacher.fullName}</h3>
                <p>${teacher.subject || 'Китайский язык'}</p>
                <p>Стаж: ${teacher.experience || 'Не указан'}</p>
            </div>
        `).join('');
    }

    updateRequestsList() {
        const container = document.querySelector('.requests-list');
        if (!container) return;

        container.innerHTML = this.requests.map((request, index) => `
            <div class="request-item ${request.status}">
                <h4>${request.fullName}</h4>
                <p>Логин: ${request.username}</p>
                <p>Пароль: ${request.password}</p>
                <p>Статус: 
                    <span class="status-indicator status-${request.status}"></span>
                    ${this.getStatusText(request.status)}
                </p>
                ${request.status === 'pending' && this.currentUser?.role === 'admin' ? `
                    <div class="request-buttons">
                        <button onclick="schoolSystem.approveRequest(${index})">Принять</button>
                        <button onclick="schoolSystem.rejectRequest(${index})">Отклонить</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    getStatusText(status) {
        const statuses = {
            'pending': 'Ожидает',
            'approved': 'Принят',
            'rejected': 'Отклонен'
        };
        return statuses[status] || status;
    }

    updateQuestionsList() {
        const userQuestions = document.querySelector('.questions-list');
        const allQuestions = document.querySelector('.all-questions-list');

        if (userQuestions) {
            const userQ = this.questions.filter(q => q.username === this.currentUser?.username);
            userQuestions.innerHTML = userQ.map(question => `
                <div class="question-item ${question.answered ? '' : 'unanswered'}">
                    <div class="question-text">${question.question}</div>
                    <div class="question-date">${new Date(question.timestamp).toLocaleDateString()}</div>
                    ${question.answered ? `
                        <div class="answer-text">
                            <strong>Ответ (${question.answeredBy}):</strong><br>
                            ${question.answer}
                        </div>
                    ` : '<div class="answer-text">Ожидает ответа...</div>'}
                </div>
            `).join('');
        }

        if (allQuestions && (this.currentUser?.role === 'teacher' || this.currentUser?.role === 'admin')) {
            allQuestions.innerHTML = this.questions.map(question => `
                <div class="question-item ${question.answered ? '' : 'unanswered'}">
                    <div class="question-text">${question.question}</div>
                    <div class="question-meta">
                        От: ${question.fullName} • 
                        ${new Date(question.timestamp).toLocaleDateString()}
                    </div>
                    ${question.answered ? `
                        <div class="answer-text">
                            <strong>Ответ (${question.answeredBy}):</strong><br>
                            ${question.answer}
                        </div>
                    ` : `
                        <button class="answer-btn" onclick="schoolSystem.openAnswerModal(${question.id})">
                            Ответить
                        </button>
                    `}
                </div>
            `).join('');
        }
    }

    updateSchedule() {
        // Реализация обновления расписания
    }

    updateExtraLessons() {
        // Реализация обновления дополнительных занятий
    }

    updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        if (!badge) return;

        const unansweredCount = this.questions.filter(q => 
            !q.answered && (this.currentUser?.role === 'teacher' || this.currentUser?.role === 'admin')
        ).length;

        const pendingRequests = this.requests.filter(r => 
            r.status === 'pending' && this.currentUser?.role === 'admin'
        ).length;

        const total = unansweredCount + pendingRequests;
        badge.textContent = total;
        badge.style.display = total > 0 ? 'flex' : 'none';
    }

    openAnswerModal(questionId) {
        const modal = document.getElementById('answer-modal');
        const questionContent = document.querySelector('.question-content');
        const question = this.questions.find(q => q.id === questionId);

        if (question) {
            questionContent.innerHTML = `
                <p><strong>Вопрос от ${question.fullName}:</strong></p>
                <p>${question.question}</p>
            `;
            modal.dataset.questionId = questionId;
            modal.style.display = 'flex';
        }
    }

    // ========== НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ ==========
    setupEventListeners() {
        // Навигация
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.id === 'login-btn') {
                    this.currentUser ? this.logout() : this.openAuthModal('login');
                } else if (e.target.id === 'register-btn') {
                    this.openAuthModal('register');
                } else {
                    const page = e.target.dataset.page;
                    if (page) this.showPage(page);
                }
            });
        });

        // Модальные окна
        document.querySelectorAll('.close').forEach(close => {
            close.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Авторизация
        document.getElementById('login-submit')?.addEventListener('click', () => {
            this.handleLogin();
        });

        document.getElementById('register-submit')?.addEventListener('click', () => {
            this.handleRegister();
        });

        // Вкладки авторизации
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchAuthTab(e.target.dataset.tab);
            });
        });

        // Вопросы и ответы
        document.getElementById('qa-button')?.addEventListener('click', () => {
            this.openQAModal();
        });

        document.getElementById('submit-question')?.addEventListener('click', () => {
            this.submitQuestion();
        });

        document.getElementById('submit-answer')?.addEventListener('click', () => {
            this.submitAnswer();
        });

        // Управление учителями
        document.getElementById('add-teacher')?.addEventListener('click', () => {
            this.openTeacherModal();
        });

        document.getElementById('save-teacher')?.addEventListener('click', () => {
            this.saveTeacher();
        });

        document.getElementById('manage-requests')?.addEventListener('click', () => {
            this.openRequestsModal();
        });

        // Переводчик
        document.getElementById('translate-btn')?.addEventListener('click', () => {
            this.translateText();
        });

        document.getElementById('clear-translator')?.addEventListener('click', () => {
            this.clearTranslator();
        });

        // Тема
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Праздничное окно
        document.getElementById('close-holiday')?.addEventListener('click', () => {
            document.getElementById('holiday-modal').style.display = 'none';
        });

        // Создаем индикатор синхронизации
        this.createSyncIndicator();
    }

    createSyncIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'sync-indicator';
        indicator.className = 'sync-indicator';
        document.body.appendChild(indicator);
    }

    // ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========
    handleLogin() {
        const username = document.getElementById('login-name').value;
        const password = document.getElementById('login-password').value;

        if (this.login(username, password)) {
            this.showToast('Успешный вход!', 'success');
            document.getElementById('auth-modal').style.display = 'none';
        } else {
            this.showToast('Неверные данные!', 'error');
        }
    }

    handleRegister() {
        const role = document.getElementById('register-role').value;
        const username = document.getElementById('register-name').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        const fullName = document.getElementById('register-fullname').value;

        if (password !== confirm) {
            this.showToast('Пароли не совпадают!', 'error');
            return;
        }

        if (this.register(role, username, password, fullName)) {
            if (role === 'teacher') {
                this.showToast('Запрос отправлен администратору!', 'success');
            } else {
                this.showToast('Регистрация успешна!', 'success');
            }
            document.getElementById('auth-modal').style.display = 'none';
        } else {
            this.showToast('Пользователь уже существует!', 'error');
        }
    }

    submitQuestion() {
        const question = document.getElementById('question-text').value;
        if (question && this.addQuestion(question)) {
            this.showToast('Вопрос отправлен!', 'success');
            document.getElementById('question-text').value = '';
        }
    }

    submitAnswer() {
        const modal = document.getElementById('answer-modal');
        const answer = document.getElementById('answer-text').value;
        const questionId = parseInt(modal.dataset.questionId);

        if (answer && this.answerQuestion(questionId, answer)) {
            this.showToast('Ответ отправлен!', 'success');
            modal.style.display = 'none';
            document.getElementById('answer-text').value = '';
        }
    }

    saveTeacher() {
        const fullName = document.getElementById('teacher-name').value;
        const subject = document.getElementById('teacher-subject').value;
        const experience = document.getElementById('teacher-experience').value;

        if (fullName) {
            const credentials = this.addTeacher(fullName, subject, experience);
            this.showToast(`Учитель добавлен! Логин: ${credentials.username}, Пароль: ${credentials.password}`, 'success');
            document.getElementById('teacher-modal').style.display = 'none';
        }
    }

    translateText() {
        const sourceText = document.getElementById('source-text').value;
        const direction = document.getElementById('translation-direction').value;
        
        if (!sourceText) {
            this.showToast('Введите текст для перевода', 'warning');
            return;
        }

        // Имитация перевода
        const translations = {
            'cn-ru': {
                '你好': 'Здравствуйте',
                '谢谢': 'Спасибо',
                '再见': 'До свидания',
                '老师': 'Учитель',
                '学生': 'Ученик',
                '学校': 'Школа',
                '中文': 'Китайский язык',
                '俄罗斯': 'Россия',
                '白俄罗斯': 'Беларусь',
                '中国': 'Китай'
            },
            'ru-cn': {
                'Здравствуйте': '你好',
                'Спасибо': '谢谢',
                'До свидания': '再见',
                'Учитель': '老师',
                'Ученик': '学生',
                'Школа': '学校',
                'Китайский язык': '中文',
                'Россия': '俄罗斯',
                'Беларусь': '白俄罗斯',
                'Китай': '中国'
            }
        };

        let translated = sourceText;
        for (const [key, value] of Object.entries(translations[direction])) {
            translated = translated.replace(new RegExp(key, 'gi'), value);
        }

        document.getElementById('target-text').value = translated;
    }

    clearTranslator() {
        document.getElementById('source-text').value = '';
        document.getElementById('target-text').value = '';
    }

    toggleTheme() {
        document.body.classList.toggle('night-theme');
        const button = document.getElementById('theme-toggle');
        button.textContent = document.body.classList.contains('night-theme') ? '☀️' : '🌙';
        localStorage.setItem('night-theme', document.body.classList.contains('night-theme'));
    }

    // ========== УТИЛИТЫ ДЛЯ UI ==========
    showPage(pageName) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });

        const page = document.getElementById(pageName);
        const menuItem = document.querySelector(`[data-page="${pageName}"]`);
        
        if (page) page.classList.add('active');
        if (menuItem) menuItem.classList.add('active');
    }

    openAuthModal(tab = 'login') {
        const modal = document.getElementById('auth-modal');
        this.switchAuthTab(tab);
        modal.style.display = 'flex';
    }

    switchAuthTab(tab) {
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        document.getElementById(tab).classList.add('active');
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    }

    openQAModal() {
        const modal = document.getElementById('qa-modal');
        modal.style.display = 'flex';
        this.updateQuestionsList();
    }

    openTeacherModal() {
        const modal = document.getElementById('teacher-modal');
        modal.style.display = 'flex';
    }

    openRequestsModal() {
        const modal = document.getElementById('requests-modal');
        modal.style.display = 'flex';
        this.updateRequestsList();
    }
}

// Инициализация системы при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.schoolSystem = new SchoolSystem();
    
    // Восстанавливаем тему
    if (localStorage.getItem('night-theme') === 'true') {
        document.body.classList.add('night-theme');
        document.getElementById('theme-toggle').textContent = '☀️';
    }

    // Загружаем интересные факты о Китае
    const chinaFacts = [
        "Китай - третья по величине страна в мире после России и Канады",
        "В Китае изобрели бумагу, порох, компас и книгопечатание",
        "Китайский язык - самый распространенный язык в мире",
        "Великая Китайская стена - самое длинное сооружение, построенное человеком",
        "Китайская культура насчитывает более 5000 лет",
        "В Китае 56 официально признанных этнических групп",
        "Китайская кухня одна из самых разнообразных в мире",
        "Панды обитают только в некоторых регионах Китая",
        "Китай подарил миру чай, шелк и фарфор",
        "Китайский Новый год - самый важный традиционный праздник"
    ];

    const factElement = document.getElementById('china-fact');
    if (factElement) {
        let currentFact = 0;
        
        setInterval(() => {
            factElement.style.opacity = '0';
            setTimeout(() => {
                factElement.textContent = chinaFacts[currentFact];
                factElement.style.opacity = '1';
                currentFact = (currentFact + 1) % chinaFacts.length;
            }, 500);
        }, 5000);
    }
});
