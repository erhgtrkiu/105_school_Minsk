// Data storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let classes = JSON.parse(localStorage.getItem('classes')) || [];
let lessons = JSON.parse(localStorage.getItem('lessons')) || [];
let resources = JSON.parse(localStorage.getItem('resources')) || [];
let questions = JSON.parse(localStorage.getItem('questions')) || [];
let teacherRequests = JSON.parse(localStorage.getItem('teacherRequests')) || [];

// Initialize default admin user
function initializeDefaultAdmin() {
    const adminExists = users.find(user => user.username === 'admin');
    if (!adminExists) {
        users.push({
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            name: 'Администратор'
        });
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Initialize default data
function initializeDefaultData() {
    if (classes.length === 0) {
        classes = [
            { id: 1, name: '5А', students: [] },
            { id: 2, name: '6Б', students: [] },
            { id: 3, name: '7В', students: [] },
            { id: 4, name: '8А', students: [] }
        ];
        localStorage.setItem('classes', JSON.stringify(classes));
    }
    
    if (resources.length === 0) {
        resources = [
            {
                id: 1,
                title: 'Основы китайской грамматики',
                description: 'Учебное пособие для начинающих',
                link: '#',
                addedBy: 'admin'
            },
            {
                id: 2,
                title: 'Китайские иероглифы',
                description: 'Таблица основных иероглифов',
                link: '#',
                addedBy: 'admin'
            }
        ];
        localStorage.setItem('resources', JSON.stringify(resources));
    }
}

// Theme management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'day';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'day' ? 'night' : 'day';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.setAttribute('data-feather', theme === 'day' ? 'moon' : 'sun');
        feather.replace();
    }
}

// Modal management
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.style.opacity = '1';
            const content = modal.querySelector('.modal-content');
            if (content) content.style.transform = 'scale(1)';
        }, 10);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.opacity = '0';
        const content = modal.querySelector('.modal-content');
        if (content) content.style.transform = 'scale(0.95)';
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
}

// Auth modal management
function openAuthModal(type = 'login') {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const modalTitle = document.getElementById('modal-title');
    
    if (type === 'register') {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        modalTitle.textContent = 'Регистрация';
    } else {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        modalTitle.textContent = 'Вход в систему';
    }
    
    openModal('auth-modal');
}

// User authentication
function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        if (user.status === 'pending') {
            showNotification('Ваша заявка на регистрацию учителя ожидает подтверждения администратора', 'warning');
            return;
        }
        
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        closeModal('auth-modal');
        showNotification(`Добро пожаловать, ${user.name || user.username}!`);
        updateUIForUser();
    } else {
        showNotification('Неверный логин или пароль', 'error');
    }
}

function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const role = document.getElementById('reg-role').value;
    
    if (!username || !password || !confirmPassword) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Пароли не совпадают', 'error');
        return;
    }
    
    if (users.find(u => u.username === username)) {
        showNotification('Пользователь с таким логином уже существует', 'error');
        return;
    }
    
    const newUser = {
        username,
        password,
        role,
        name: username,
        status: role === 'teacher' ? 'pending' : 'approved'
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    if (role === 'teacher') {
        teacherRequests.push({
            username,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('teacherRequests', JSON.stringify(teacherRequests));
        showNotification('Заявка на регистрацию учителя отправлена администратору', 'success');
    } else {
        showNotification('Регистрация прошла успешно! Теперь вы можете войти.', 'success');
        openAuthModal('login');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showNotification('Вы вышли из системы');
    updateUIForUser();
}

function forgotPassword() {
    showNotification('Функция восстановления пароля временно недоступна. Обратитесь к администратору.', 'info');
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    if (!notification || !notificationText) return;
    
    // Update notification style based on type
    const borderColor = type === 'error' ? 'red' : type === 'warning' ? 'yellow' : type === 'info' ? 'blue' : 'green';
    notification.querySelector('.border-l-4').classList.remove('border-green-500', 'border-red-500', 'border-yellow-500', 'border-blue-500');
    notification.querySelector('.border-l-4').classList.add(`border-${borderColor}-500`);
    
    // Update icon based on type
    const icon = notification.querySelector('i');
    if (icon) {
        const iconName = type === 'error' ? 'x-circle' : type === 'warning' ? 'alert-triangle' : type === 'info' ? 'info' : 'check-circle';
        icon.setAttribute('data-feather', iconName);
        feather.replace();
    }
    
    notificationText.textContent = message;
    notification.classList.remove('hidden', 'translate-x-full');
    notification.classList.add('show');
    
    setTimeout(hideNotification, 5000);
}

function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.add('hidden');
        }, 500);
    }
}

// Page navigation
function navigateToPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('active');
    }
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelector(`[data-page="${pageId.replace('-page', '')}"]`).classList.add('active');
    
    // Load page-specific content
    loadPageContent(pageId);
}

function loadPageContent(pageId) {
    switch (pageId) {
        case 'classes-page':
            loadClassesPage();
            break;
        case 'lessons-page':
            loadLessonsPage();
            break;
        case 'resources-page':
            loadResourcesPage();
            break;
        case 'additional-page':
            loadAdditionalLessonsPage();
            break;
    }
}

// Classes management
function loadClassesPage() {
    const classesContainer = document.querySelector('#classes-page .grid');
    const addStudentSection = document.getElementById('add-student-section');
    const classSelect = document.getElementById('student-class');
    
    // Show/hide add student section based on user role
    if (currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin')) {
        addStudentSection.classList.remove('hidden');
    } else {
        addStudentSection.classList.add('hidden');
    }
    
    // Populate class select
    classSelect.innerHTML = '<option value="">Выберите класс</option>';
    classes.forEach(classItem => {
        const option = document.createElement('option');
        option.value = classItem.id;
        option.textContent = classItem.name;
        classSelect.appendChild(option);
    });
    
    // Render classes
    classesContainer.innerHTML = '';
    classes.forEach(classItem => {
        const classCard = document.createElement('div');
        classCard.className = 'enhanced-card theme-card p-6 class-card';
        classCard.innerHTML = `
            <div class="flex items-center mb-4">
                <div class="bg-blue-100 p-3 rounded-xl mr-4">
                    <i data-feather="users" class="w-6 h-6 text-blue-600"></i>
                </div>
                <h3 class="text-xl font-bold text-blue-600">${classItem.name}</h3>
            </div>
            <div class="space-y-2">
                <p class="theme-text"><strong>Учеников:</strong> ${classItem.students ? classItem.students.length : 0}</p>
                ${classItem.students && classItem.students.length > 0 ? `
                    <div class="mt-3">
                        <p class="theme-text font-medium mb-2">Ученики:</p>
                        <div class="space-y-1 max-h-32 overflow-y-auto">
                            ${classItem.students.map(student => `
                                <div class="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                    <span class="theme-text text-sm">${student.name}</span>
                                    ${currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin') ? 
                                        `<button onclick="removeStudent(${classItem.id}, '${student.username}')" class="text-red-500 hover:text-red-700">
                                            <i data-feather="trash-2" class="w-4 h-4"></i>
                                        </button>` : ''
                                    }
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        classesContainer.appendChild(classCard);
    });
    
    feather.replace();
}

function addStudent() {
    if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
        showNotification('У вас нет прав для добавления учеников', 'error');
        return;
    }
    
    const name = document.getElementById('student-name').value;
    const classId = parseInt(document.getElementById('student-class').value);
    const username = document.getElementById('student-login').value;
    
    if (!name || !classId || !username) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    // Check if username already exists
    if (users.find(u => u.username === username)) {
        showNotification('Пользователь с таким логином уже существует', 'error');
        return;
    }
    
    const classItem = classes.find(c => c.id === classId);
    if (!classItem) {
        showNotification('Класс не найден', 'error');
        return;
    }
    
    // Add student to class
    if (!classItem.students) classItem.students = [];
    classItem.students.push({ name, username });
    
    // Create user account for student
    users.push({
        username,
        password: 'student123', // Default password
        role: 'student',
        name: name,
        status: 'approved'
    });
    
    localStorage.setItem('classes', JSON.stringify(classes));
    localStorage.setItem('users', JSON.stringify(users));
    
    showNotification(`Ученик ${name} добавлен в класс ${classItem.name}`);
    
    // Clear form
    document.getElementById('student-name').value = '';
    document.getElementById('student-class').value = '';
    document.getElementById('student-login').value = '';
    
    // Reload classes
    loadClassesPage();
}

function removeStudent(classId, studentUsername) {
    if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
        showNotification('У вас нет прав для удаления учеников', 'error');
        return;
    }
    
    const classItem = classes.find(c => c.id === classId);
    if (!classItem || !classItem.students) return;
    
    const studentIndex = classItem.students.findIndex(s => s.username === studentUsername);
    if (studentIndex !== -1) {
        classItem.students.splice(studentIndex, 1);
        localStorage.setItem('classes', JSON.stringify(classes));
        showNotification('Ученик удален из класса');
        loadClassesPage();
    }
}

// Lessons management
function loadLessonsPage() {
    const classSelector = document.getElementById('class-selector');
    const currentClassInfo = document.getElementById('current-class-info');
    const lessonsContainer = document.getElementById('lessons-container');
    
    // Show/hide class selector based on user role
    if (currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin')) {
        classSelector.classList.remove('hidden');
        
        // Populate class selector
        const classButtons = classSelector.querySelector('.flex');
        classButtons.innerHTML = '';
        classes.forEach(classItem => {
            const button = document.createElement('button');
            button.className = 'px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors';
            button.textContent = classItem.name;
            button.onclick = () => selectClassForLessons(classItem.id);
            classButtons.appendChild(button);
        });
    } else {
        classSelector.classList.add('hidden');
        currentClassInfo.classList.add('hidden');
        
        // Show all lessons for students
        renderLessons(lessons);
    }
}

function selectClassForLessons(classId) {
    const classItem = classes.find(c => c.id === classId);
    if (!classItem) return;
    
    document.getElementById('selected-class-name').textContent = classItem.name;
    document.getElementById('current-class-info').classList.remove('hidden');
    
    // Filter lessons for selected class
    const classLessons = lessons.filter(lesson => lesson.classId === classId);
    renderLessons(classLessons);
    
    // Update lesson form
    document.getElementById('lesson-class').value = classId;
}

function renderLessons(lessonsToRender) {
    const lessonsContainer = document.getElementById('lessons-container');
    lessonsContainer.innerHTML = '';
    
    if (lessonsToRender.length === 0) {
        lessonsContainer.innerHTML = '<p class="theme-text text-center col-span-2">Занятий не найдено</p>';
        return;
    }
    
    lessonsToRender.forEach(lesson => {
        const lessonCard = document.createElement('div');
        lessonCard.className = 'enhanced-card theme-card p-6';
        lessonCard.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <h3 class="text-lg font-bold text-blue-600">${lesson.subject}</h3>
                ${currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin') ? `
                    <button onclick="deleteLesson(${lesson.id})" class="text-red-500 hover:text-red-700">
                        <i data-feather="trash-2" class="w-4 h-4"></i>
                    </button>
                ` : ''}
            </div>
            <div class="space-y-2">
                <p class="theme-text"><strong>Класс:</strong> ${classes.find(c => c.id === lesson.classId)?.name || 'Неизвестно'}</p>
                <p class="theme-text"><strong>День:</strong> ${lesson.day}</p>
                <p class="theme-text"><strong>Время:</strong> ${lesson.time}</p>
            </div>
        `;
        lessonsContainer.appendChild(lessonCard);
    });
    
    feather.replace();
}

function addLesson() {
    if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
        showNotification('У вас нет прав для добавления занятий', 'error');
        return;
    }
    
    const classId = parseInt(document.getElementById('lesson-class').value);
    const day = document.getElementById('lesson-day').value;
    const time = document.getElementById('lesson-time').value;
    const subject = document.getElementById('lesson-subject').value;
    
    if (!classId || !day || !time || !subject) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    const newLesson = {
        id: Date.now(),
        classId,
        day,
        time,
        subject,
        addedBy: currentUser.username
    };
    
    lessons.push(newLesson);
    localStorage.setItem('lessons', JSON.stringify(lessons));
    
    showNotification('Занятие добавлено');
    closeModal('add-lesson-modal');
    
    // Clear form
    document.getElementById('lesson-day').value = 'Понедельник';
    document.getElementById('lesson-time').value = '';
    document.getElementById('lesson-subject').value = '';
    
    // Reload lessons
    loadLessonsPage();
}

function deleteLesson(lessonId) {
    if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
        showNotification('У вас нет прав для удаления занятий', 'error');
        return;
    }
    
    const lessonIndex = lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex !== -1) {
        lessons.splice(lessonIndex, 1);
        localStorage.setItem('lessons', JSON.stringify(lessons));
        showNotification('Занятие удалено');
        loadLessonsPage();
    }
}

// Resources management
function loadResourcesPage() {
    const resourcesContainer = document.getElementById('resources-container');
    resourcesContainer.innerHTML = '';
    
    resources.forEach(resource => {
        const resourceCard = document.createElement('div');
        resourceCard.className = 'enhanced-card theme-card p-6';
        resourceCard.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <h3 class="text-lg font-bold text-blue-600">${resource.title}</h3>
                ${currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin') ? `
                    <button onclick="deleteResource(${resource.id})" class="text-red-500 hover:text-red-700">
                        <i data-feather="trash-2" class="w-4 h-4"></i>
                    </button>
                ` : ''}
            </div>
            <p class="theme-text mb-4">${resource.description}</p>
            <a href="${resource.link}" target="_blank" class="btn-primary inline-flex items-center px-4 py-2 rounded-xl text-sm">
                <i data-feather="external-link" class="w-4 h-4 mr-2"></i>
                Открыть ресурс
            </a>
        `;
        resourcesContainer.appendChild(resourceCard);
    });
    
    feather.replace();
}

function addResource() {
    if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
        showNotification('У вас нет прав для добавления ресурсов', 'error');
        return;
    }
    
    const title = document.getElementById('resource-title').value;
    const description = document.getElementById('resource-description').value;
    const link = document.getElementById('resource-link').value;
    
    if (!title || !description || !link) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    const newResource = {
        id: Date.now(),
        title,
        description,
        link,
        addedBy: currentUser.username
    };
    
    resources.push(newResource);
    localStorage.setItem('resources', JSON.stringify(resources));
    
    showNotification('Ресурс добавлен');
    closeModal('add-resource-modal');
    
    // Clear form
    document.getElementById('resource-title').value = '';
    document.getElementById('resource-description').value = '';
    document.getElementById('resource-link').value = '';
    
    // Reload resources
    loadResourcesPage();
}

function deleteResource(resourceId) {
    if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
        showNotification('У вас нет прав для удаления ресурсов', 'error');
        return;
    }
    
    const resourceIndex = resources.findIndex(r => r.id === resourceId);
    if (resourceIndex !== -1) {
        resources.splice(resourceIndex, 1);
        localStorage.setItem('resources', JSON.stringify(resources));
        showNotification('Ресурс удален');
        loadResourcesPage();
    }
}

// Additional lessons management
function loadAdditionalLessonsPage() {
    const additionalContainer = document.getElementById('additional-lessons-container');
    // For now, we'll use the same lessons but could filter by type
    renderAdditionalLessons(lessons);
}

function renderAdditionalLessons(lessonsToRender) {
    const additionalContainer = document.getElementById('additional-lessons-container');
    additionalContainer.innerHTML = '';
    
    if (lessonsToRender.length === 0) {
        additionalContainer.innerHTML = '<p class="theme-text text-center col-span-2">Дополнительных занятий не найдено</p>';
        return;
    }
    
    lessonsToRender.forEach(lesson => {
        const lessonCard = document.createElement('div');
        lessonCard.className = 'enhanced-card theme-card p-6';
        lessonCard.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <h3 class="text-lg font-bold text-blue-600">${lesson.subject}</h3>
                ${currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin') ? `
                    <button onclick="deleteLesson(${lesson.id})" class="text-red-500 hover:text-red-700">
                        <i data-feather="trash-2" class="w-4 h-4"></i>
                    </button>
                ` : ''}
            </div>
            <div class="space-y-2">
                <p class="theme-text"><strong>Класс:</strong> ${classes.find(c => c.id === lesson.classId)?.name || 'Неизвестно'}</p>
                <p class="theme-text"><strong>День:</strong> ${lesson.day}</p>
                <p class="theme-text"><strong>Время:</strong> ${lesson.time}</p>
                <p class="theme-text"><strong>Тип:</strong> Дополнительное занятие</p>
            </div>
        `;
        additionalContainer.appendChild(lessonCard);
    });
    
    feather.replace();
}

// Q&A System
function openQAModal() {
    if (!currentUser) {
        showNotification('Для доступа к вопросам и ответам необходимо войти в систему', 'warning');
        openAuthModal('login');
        return;
    }
    
    loadQuestions();
    openModal('qa-modal');
}

function loadQuestions() {
    const qaList = document.getElementById('qa-list');
    qaList.innerHTML = '';
    
    if (questions.length === 0) {
        qaList.innerHTML = '<p class="theme-text text-center">Вопросов пока нет</p>';
        return;
    }
    
    questions.forEach(question => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item bg-white p-4 rounded-lg border border-gray-200';
        
        let answerSection = '';
        if (question.answer) {
            answerSection = `
                <div class="answer-item bg-green-50 p-3 rounded-lg mt-3">
                    <div class="flex items-center mb-2">
                        <i data-feather="user-check" class="w-4 h-4 text-green-600 mr-2"></i>
                        <span class="font-medium text-green-800">Ответ учителя:</span>
                    </div>
                    <p class="text-green-700">${question.answer}</p>
                    <p class="text-green-600 text-sm mt-2">${new Date(question.answeredAt).toLocaleString()}</p>
                </div>
            `;
        } else if (currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin')) {
            answerSection = `
                <div class="mt-3">
                    <textarea id="answer-${question.id}" placeholder="Введите ответ..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 h-20 resize-none"></textarea>
                    <button onclick="submitAnswer(${question.id})" class="btn-primary px-4 py-2 rounded-lg text-sm mt-2">
                        Ответить
                    </button>
                </div>
            `;
        }
        
        questionItem.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div>
                    <span class="font-medium text-blue-600">${question.authorName}</span>
                    <span class="text-gray-500 text-sm ml-2">${new Date(question.timestamp).toLocaleString()}</span>
                </div>
                ${(currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin') || currentUser.username === question.author) ? `
                    <button onclick="deleteQuestion(${question.id})" class="text-red-500 hover:text-red-700">
                        <i data-feather="trash-2" class="w-4 h-4"></i>
                    </button>
                ` : ''}
            </div>
            <p class="text-gray-700">${question.text}</p>
            ${answerSection}
        `;
        qaList.appendChild(questionItem);
    });
    
    feather.replace();
}

function submitQuestion() {
    if (!currentUser) {
        showNotification('Для отправки вопроса необходимо войти в систему', 'warning');
        return;
    }
    
    const questionText = document.getElementById('question-input').value.trim();
    if (!questionText) {
        showNotification('Введите текст вопроса', 'error');
        return;
    }
    
    const newQuestion = {
        id: Date.now(),
        text: questionText,
        author: currentUser.username,
        authorName: currentUser.name || currentUser.username,
        timestamp: new Date().toISOString(),
        answer: null,
        answeredAt: null
    };
    
    questions.push(newQuestion);
    localStorage.setItem('questions', JSON.stringify(questions));
    
    document.getElementById('question-input').value = '';
    showNotification('Вопрос отправлен');
    loadQuestions();
}

function submitAnswer(questionId) {
    if (!currentUser || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
        showNotification('Только учителя могут отвечать на вопросы', 'error');
        return;
    }
    
    const answerText = document.getElementById(`answer-${questionId}`).value.trim();
    if (!answerText) {
        showNotification('Введите текст ответа', 'error');
        return;
    }
    
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.answer = answerText;
        question.answeredAt = new Date().toISOString();
        localStorage.setItem('questions', JSON.stringify(questions));
        showNotification('Ответ отправлен');
        loadQuestions();
    }
}

function deleteQuestion(questionId) {
    if (!currentUser) return;
    
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    // Check permissions
    if (currentUser.role !== 'teacher' && currentUser.role !== 'admin' && currentUser.username !== question.author) {
        showNotification('У вас нет прав для удаления этого вопроса', 'error');
        return;
    }
    
    const questionIndex = questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
        questions.splice(questionIndex, 1);
        localStorage.setItem('questions', JSON.stringify(questions));
        showNotification('Вопрос удален');
        loadQuestions();
    }
}

// UI updates based on user role
function updateUIForUser() {
    const authButtons = document.getElementById('auth-buttons');
    const mobileAuthButtons = document.querySelector('#mobile-menu .pt-4');
    const qaButton = document.getElementById('qa-button');
    
    if (currentUser) {
        // User is logged in
        authButtons.innerHTML = `
            <div class="flex items-center space-x-3">
                <span class="text-white">${currentUser.name || currentUser.username}</span>
                <button onclick="logout()" class="btn-secondary px-4 py-2 rounded-xl font-medium text-sm">
                    Выйти
                </button>
            </div>
        `;
        
        mobileAuthButtons.innerHTML = `
            <div class="pt-4 border-t border-blue-600 space-y-3">
                <div class="text-white text-center py-2">
                    ${currentUser.name || currentUser.username}
                </div>
                <button onclick="logout()" class="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-medium flex items-center justify-center">
                    <i data-feather="log-out" class="w-4 h-4 mr-2"></i>Выйти
                </button>
            </div>
        `;
        
        // Show Q&A button for all logged in users
        qaButton.classList.remove('hidden');
        
    } else {
        // User is not logged in
        authButtons.innerHTML = `
            <button id="register-btn" class="btn-secondary px-5 py-2.5 rounded-xl font-medium">
                Регистрация
            </button>
            <button id="login-btn" class="btn-primary px-5 py-2.5 rounded-xl font-medium">
                Войти
            </button>
        `;
        
        mobileAuthButtons.innerHTML = `
            <div class="pt-4 border-t border-blue-600 space-y-3">
                <button id="mobile-register-btn" class="w-full px-4 py-3 bg-white text-blue-600 rounded-xl font-medium flex items-center justify-center">
                    <i data-feather="user-plus" class="w-4 h-4 mr-2"></i>Регистрация
                </button>
                <button id="mobile-login-btn" class="w-full mt-2 px-4 py-3 bg-blue-800 text-white rounded-xl font-medium flex items-center justify-center">
                    <i data-feather="log-in" class="w-4 h-4 mr-2"></i>Войти
                </button>
            </div>
        `;
        
        // Hide Q&A button for anonymous users
        qaButton.classList.add('hidden');
        
        // Reattach event listeners
        setTimeout(() => {
            document.getElementById('register-btn').addEventListener('click', () => openAuthModal('register'));
            document.getElementById('login-btn').addEventListener('click', () => openAuthModal('login'));
            document.getElementById('mobile-register-btn').addEventListener('click', () => openAuthModal('register'));
            document.getElementById('mobile-login-btn').addEventListener('click', () => openAuthModal('login'));
        }, 0);
    }
    
    feather.replace();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    initializeDefaultAdmin();
    initializeDefaultData();
    initializeTheme();
    
    // Set up event listeners
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('mobile-menu-button').addEventListener('click', function() {
        document.getElementById('mobile-menu').classList.toggle('hidden');
    });
    
    document.getElementById('qa-button').addEventListener('click', openQAModal);
    
    // Navigation
    document.querySelectorAll('.nav-item, [data-page]').forEach(item => {
        item.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page') + '-page';
            navigateToPage(pageId);
            // Close mobile menu if open
            document.getElementById('mobile-menu').classList.add('hidden');
        });
    });
    
    // Auth buttons
    document.getElementById('register-btn').addEventListener('click', () => openAuthModal('register'));
    document.getElementById('login-btn').addEventListener('click', () => openAuthModal('login'));
    document.getElementById('mobile-register-btn').addEventListener('click', () => openAuthModal('register'));
    document.getElementById('mobile-login-btn').addEventListener('click', () => openAuthModal('login'));
    
    // Switch between login/register forms
    document.getElementById('switch-to-register').addEventListener('click', () => openAuthModal('register'));
    document.getElementById('switch-to-login').addEventListener('click', () => openAuthModal('login'));
    
    // Update UI based on current user
    updateUIForUser();
    
    // Initialize feather icons
    feather.replace();
    
    console.log('School 105 application initialized');
});
