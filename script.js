// Data storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let questions = JSON.parse(localStorage.getItem('questions')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let students = JSON.parse(localStorage.getItem('students')) || [];
let classes = JSON.parse(localStorage.getItem('classes')) || [];
let lessons = JSON.parse(localStorage.getItem('lessons')) || [];
let resources = JSON.parse(localStorage.getItem('resources')) || [];

// Initialize default data if empty
function initializeData() {
    // Add default admin if not exists
    if (!users.find(u => u.username === 'admin')) {
        users.push({
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            name: 'Администратор'
        });
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Initialize classes
    if (classes.length === 0) {
        classes = [
            { id: '5A', name: '5А', students: [] },
            { id: '5B', name: '5Б', students: [] },
            { id: '6A', name: '6А', students: [] },
            { id: '6B', name: '6Б', students: [] }
        ];
        localStorage.setItem('classes', JSON.stringify(classes));
    }

    // Initialize lessons
    if (lessons.length === 0) {
        lessons = [
            { id: 1, classId: '5A', day: 'Понедельник', time: '9:00', subject: 'Китайский для начинающих' }
        ];
        localStorage.setItem('lessons', JSON.stringify(lessons));
    }

    // Initialize resources
    if (resources.length === 0) {
        resources = [
            { id: 1, title: 'Основы китайской грамматики', description: 'Учебное пособие для начинающих', link: '#' }
        ];
        localStorage.setItem('resources', JSON.stringify(resources));
    }
}

// China facts
const chinaFacts = [
    "Китай - самая населённая страна в мире с более чем 1.4 миллиарда жителей",
    "Китайский язык является одним из шести официальных языков ООН",
    "В китайском языке более 50,000 иероглифов, но для чтения газет достаточно знать 3,000",
    "Великая Китайская стена - самое длинное сооружение, построенное человеком",
    "Китай является родиной многих изобретений: бумаги, пороха, компаса и книгопечатания"
];

let currentFactIndex = 0;
let selectedClass = null;

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    if (!notification || !notificationText) {
        console.log('Notification not found');
        return;
    }
    
    notificationText.textContent = message;
    
    // Update notification style
    const borderElement = notification.querySelector('.border-l-4');
    const iconElement = notification.querySelector('i');
    
    // Reset classes
    borderElement.className = 'border-l-4';
    iconElement.className = 'w-6 h-6 mr-3';
    
    if (type === 'error') {
        borderElement.classList.add('border-red-500');
        iconElement.setAttribute('data-feather', 'alert-circle');
        iconElement.classList.add('text-red-500');
    } else if (type === 'warning') {
        borderElement.classList.add('border-yellow-500');
        iconElement.setAttribute('data-feather', 'alert-triangle');
        iconElement.classList.add('text-yellow-500');
    } else {
        borderElement.classList.add('border-green-500');
        iconElement.setAttribute('data-feather', 'check-circle');
        iconElement.classList.add('text-green-500');
    }
    
    feather.replace();
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.querySelector('.transform').classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(hideNotification, 5000);
}

function hideNotification() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.querySelector('.transform').classList.add('translate-x-full');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 500);
    }
}

// Check permissions
function hasPermission() {
    return currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin');
}

// Page management
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.classList.add('hidden');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('active');
    }
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelectorAll(`[data-page="${pageId}"]`).forEach(item => {
        item.classList.add('active');
    });
    
    // Load page content
    loadPageContent(pageId);
    
    // Close mobile menu
    document.getElementById('mobile-menu').classList.add('hidden');
    const menuIcon = document.querySelector('#mobile-menu-button i');
    menuIcon.setAttribute('data-feather', 'menu');
    feather.replace();
}

function loadPageContent(pageId) {
    switch(pageId) {
        case 'classes':
            loadClassesPage();
            break;
        case 'lessons':
            loadLessonsPage();
            break;
        case 'resources':
            loadResourcesPage();
            break;
        case 'additional':
            loadAdditionalLessonsPage();
            break;
    }
}

// Load Classes Page
function loadClassesPage() {
    const classesContainer = document.getElementById('classes-container');
    const addStudentSection = document.getElementById('add-student-section');
    const studentClassSelect = document.getElementById('student-class');
    
    // Show/hide add student section
    if (hasPermission()) {
        addStudentSection.classList.remove('hidden');
        
        // Populate class select
        studentClassSelect.innerHTML = '<option value="">Выберите класс</option>';
        classes.forEach(classItem => {
            const option = document.createElement('option');
            option.value = classItem.id;
            option.textContent = classItem.name;
            studentClassSelect.appendChild(option);
        });
    } else {
        addStudentSection.classList.add('hidden');
    }
    
    // Render classes
    classesContainer.innerHTML = '';
    classes.forEach(classItem => {
        const classStudents = students.filter(student => student.class === classItem.id);
        
        const classCard = document.createElement('div');
        classCard.className = 'class-card enhanced-card p-6 text-center';
        classCard.innerHTML = `
            <div class="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <i data-feather="users" class="w-8 h-8 text-blue-600"></i>
            </div>
            <h3 class="text-xl font-bold text-blue-600 mb-2">${classItem.name} класс</h3>
            <p class="text-gray-700 font-medium mb-3">${classStudents.length} учеников</p>
            <div class="max-h-32 overflow-y-auto">
                ${classStudents.map(student => `
                    <div class="text-sm text-gray-600 py-1 border-b border-gray-100">${student.name}</div>
                `).join('')}
                ${classStudents.length === 0 ? '<p class="text-sm text-gray-500 py-2">Нет учеников</p>' : ''}
            </div>
        `;
        classesContainer.appendChild(classCard);
    });
    
    feather.replace();
}

// Load Lessons Page
function loadLessonsPage() {
    const classSelector = document.getElementById('class-selector');
    const classSelectorButtons = document.getElementById('class-selector-buttons');
    const currentClassInfo = document.getElementById('current-class-info');
    const lessonClassSelect = document.getElementById('lesson-class');
    
    // Show/hide class selector
    if (hasPermission()) {
        classSelector.classList.remove('hidden');
        
        // Populate class selector
        classSelectorButtons.innerHTML = '';
        classes.forEach(classItem => {
            const button = document.createElement('button');
            button.className = `class-badge px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                selectedClass === classItem.id ? 'active text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`;
            button.textContent = classItem.name;
            button.onclick = () => selectClass(classItem.id);
            classSelectorButtons.appendChild(button);
        });
        
        // Populate lesson class select
        lessonClassSelect.innerHTML = '<option value="">Выберите класс</option>';
        classes.forEach(classItem => {
            const option = document.createElement('option');
            option.value = classItem.id;
            option.textContent = classItem.name;
            lessonClassSelect.appendChild(option);
        });
    } else {
        classSelector.classList.add('hidden');
    }
    
    loadLessonsForClass();
}

function selectClass(className) {
    selectedClass = className;
    
    const currentClassInfo = document.getElementById('current-class-info');
    currentClassInfo.classList.remove('hidden');
    document.getElementById('selected-class-name').textContent = classes.find(c => c.id === className)?.name || className;
    
    loadLessonsForClass();
}

function loadLessonsForClass() {
    const lessonsContainer = document.getElementById('lessons-container');
    lessonsContainer.innerHTML = '';
    
    let classLessons = [];
    
    if (currentUser && currentUser.role === 'student') {
        const student = students.find(s => s.username === currentUser.username);
        if (student) {
            classLessons = lessons.filter(lesson => lesson.classId === student.class);
        }
    } else if (selectedClass) {
        classLessons = lessons.filter(lesson => lesson.classId === selectedClass);
    } else {
        classLessons = lessons;
    }
    
    if (classLessons.length === 0) {
        lessonsContainer.innerHTML = `
            <div class="col-span-2 text-center py-8">
                <i data-feather="calendar" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                <p class="text-gray-600 font-medium">Расписание занятий пока не добавлено</p>
            </div>
        `;
    } else {
        classLessons.forEach(lesson => {
            const classItem = classes.find(c => c.id === lesson.classId);
            const lessonElement = document.createElement('div');
            lessonElement.className = 'bg-blue-50 p-4 rounded-xl border border-blue-100 transition-all duration-300 hover:scale-105';
            lessonElement.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center">
                        <i data-feather="clock" class="w-4 h-4 text-blue-500 mr-2"></i>
                        <span class="font-medium text-gray-800">${lesson.day}, ${lesson.time}</span>
                    </div>
                    ${hasPermission() ? `
                        <button onclick="deleteLesson(${lesson.id})" class="text-red-500 hover:text-red-700">
                            <i data-feather="trash-2" class="w-4 h-4"></i>
                        </button>
                    ` : ''}
                </div>
                <p class="text-gray-800 font-medium">${lesson.subject}</p>
                ${hasPermission() ? 
                    `<span class="inline-block mt-2 px-2 py-1 bg-blue-200 text-blue-700 text-xs rounded-full">${classItem?.name || lesson.classId}</span>` : ''}
            `;
            lessonsContainer.appendChild(lessonElement);
        });
    }
    
    feather.replace();
}

// Load Resources Page
function loadResourcesPage() {
    const resourcesContainer = document.getElementById('resources-container');
    const addResourceButton = document.getElementById('add-resource-button');
    
    // Show/hide add button
    if (hasPermission()) {
        addResourceButton.classList.remove('hidden');
    } else {
        addResourceButton.classList.add('hidden');
    }
    
    resourcesContainer.innerHTML = '';
    
    if (resources.length === 0) {
        resourcesContainer.innerHTML = `
            <div class="col-span-3 text-center py-8">
                <i data-feather="book" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                <p class="text-gray-600 font-medium">Ресурсы пока не добавлены</p>
            </div>
        `;
    } else {
        resources.forEach(resource => {
            const resourceElement = document.createElement('div');
            resourceElement.className = 'enhanced-card p-6';
            resourceElement.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-xl font-bold text-blue-600">${resource.title}</h3>
                    ${hasPermission() ? `
                        <button onclick="deleteResource(${resource.id})" class="text-red-500 hover:text-red-700">
                            <i data-feather="trash-2" class="w-4 h-4"></i>
                        </button>
                    ` : ''}
                </div>
                <p class="text-gray-700 mb-4">${resource.description}</p>
                <a href="${resource.link}" target="_blank" class="btn-primary inline-flex items-center px-4 py-2 rounded-xl text-sm">
                    <i data-feather="external-link" class="w-4 h-4 mr-2"></i>
                    Открыть ресурс
                </a>
            `;
            resourcesContainer.appendChild(resourceElement);
        });
    }
    
    feather.replace();
}

// Load Additional Lessons Page
function loadAdditionalLessonsPage() {
    const additionalContainer = document.getElementById('additional-lessons-container');
    const addAdditionalButton = document.getElementById('add-additional-button');
    
    // Show/hide add button
    if (hasPermission()) {
        addAdditionalButton.classList.remove('hidden');
    } else {
        addAdditionalButton.classList.add('hidden');
    }
    
    additionalContainer.innerHTML = '';
    
    if (lessons.length === 0) {
        additionalContainer.innerHTML = `
            <div class="col-span-2 text-center py-8">
                <i data-feather="award" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                <p class="text-gray-600 font-medium">Дополнительные занятия пока не добавлены</p>
            </div>
        `;
    } else {
        lessons.forEach(lesson => {
            const classItem = classes.find(c => c.id === lesson.classId);
            const lessonElement = document.createElement('div');
            lessonElement.className = 'enhanced-card p-6';
            lessonElement.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-xl font-bold text-blue-600">${lesson.subject}</h3>
                    ${hasPermission() ? `
                        <button onclick="deleteLesson(${lesson.id})" class="text-red-500 hover:text-red-700">
                            <i data-feather="trash-2" class="w-4 h-4"></i>
                        </button>
                    ` : ''}
                </div>
                <div class="space-y-2">
                    <p class="text-gray-700"><strong>Класс:</strong> ${classItem?.name || lesson.classId}</p>
                    <p class="text-gray-700"><strong>День:</strong> ${lesson.day}</p>
                    <p class="text-gray-700"><strong>Время:</strong> ${lesson.time}</p>
                    <p class="text-gray-700"><strong>Тип:</strong> Дополнительное занятие</p>
                </div>
            `;
            additionalContainer.appendChild(lessonElement);
        });
    }
    
    feather.replace();
}

// Add Student
function addStudent() {
    if (!hasPermission()) {
        showNotification('У вас нет прав для добавления учеников', 'error');
        return;
    }
    
    const name = document.getElementById('student-name').value;
    const studentClass = document.getElementById('student-class').value;
    const login = document.getElementById('student-login').value;
    
    if (!name || !studentClass || !login) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    if (users.find(u => u.username === login)) {
        showNotification('Логин уже занят', 'error');
        return;
    }
    
    // Create user
    users.push({
        username: login,
        password: 'student123',
        role: 'student',
        name: name
    });
    
    // Add to students
    students.push({
        name: name,
        class: studentClass,
        username: login
    });
    
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('students', JSON.stringify(students));
    
    // Clear form
    document.getElementById('student-name').value = '';
    document.getElementById('student-login').value = '';
    
    showNotification('Ученик добавлен');
    loadClassesPage();
}

// Add Lesson
function addLesson() {
    if (!hasPermission()) {
        showNotification('У вас нет прав для добавления занятий', 'error');
        return;
    }
    
    const classId = document.getElementById('lesson-class').value;
    const day = document.getElementById('lesson-day').value;
    const time = document.getElementById('lesson-time').value;
    const subject = document.getElementById('lesson-subject').value;
    
    if (!classId || !day || !time || !subject) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    lessons.push({
        id: Date.now(),
        classId: classId,
        day: day,
        time: time,
        subject: subject
    });
    
    localStorage.setItem('lessons', JSON.stringify(lessons));
    
    // Clear form
    document.getElementById('lesson-time').value = '';
    document.getElementById('lesson-subject').value = '';
    
    showNotification('Занятие добавлено');
    closeModal('add-lesson-modal');
    loadLessonsPage();
}

function deleteLesson(lessonId) {
    if (!hasPermission()) {
        showNotification('У вас нет прав для удаления занятий', 'error');
        return;
    }
    
    if (!confirm('Удалить занятие?')) return;
    
    const index = lessons.findIndex(l => l.id === lessonId);
    if (index !== -1) {
        lessons.splice(index, 1);
        localStorage.setItem('lessons', JSON.stringify(lessons));
        showNotification('Занятие удалено');
        loadLessonsPage();
    }
}

// Add Resource
function addResource() {
    if (!hasPermission()) {
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
    
    resources.push({
        id: Date.now(),
        title: title,
        description: description,
        link: link
    });
    
    localStorage.setItem('resources', JSON.stringify(resources));
    
    // Clear form
    document.getElementById('resource-title').value = '';
    document.getElementById('resource-description').value = '';
    document.getElementById('resource-link').value = '';
    
    showNotification('Ресурс добавлен');
    closeModal('add-resource-modal');
    loadResourcesPage();
}

function deleteResource(resourceId) {
    if (!hasPermission()) {
        showNotification('У вас нет прав для удаления ресурсов', 'error');
        return;
    }
    
    if (!confirm('Удалить ресурс?')) return;
    
    const index = resources.findIndex(r => r.id === resourceId);
    if (index !== -1) {
        resources.splice(index, 1);
        localStorage.setItem('resources', JSON.stringify(resources));
        showNotification('Ресурс удален');
        loadResourcesPage();
    }
}

// Facts rotation
function rotateFacts() {
    currentFactIndex = (currentFactIndex + 1) % chinaFacts.length;
    const factContainer = document.getElementById('fact-container');
    
    factContainer.style.opacity = '0';
    factContainer.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        factContainer.innerHTML = `<p class="text-xl font-medium">${chinaFacts[currentFactIndex]}</p>`;
        factContainer.style.opacity = '1';
        factContainer.style.transform = 'translateY(0)';
    }, 300);
}

// Theme switching
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('#theme-toggle i');
    
    if (body.getAttribute('data-theme') === 'day') {
        body.setAttribute('data-theme', 'night');
        themeIcon.setAttribute('data-feather', 'sun');
        showNotification('Ночная тема включена');
    } else {
        body.setAttribute('data-theme', 'day');
        themeIcon.setAttribute('data-feather', 'moon');
        showNotification('Дневная тема включена');
    }
    feather.replace();
}

// Mobile menu
document.getElementById('mobile-menu-button').addEventListener('click', function() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
    
    const menuIcon = document.querySelector('#mobile-menu-button i');
    if (menu.classList.contains('hidden')) {
        menuIcon.setAttribute('data-feather', 'menu');
    } else {
        menuIcon.setAttribute('data-feather', 'x');
    }
    feather.replace();
});

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const modalContent = modal.querySelector('.modal-content');
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    }, 50);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Auth functions
function openAuthModal(type) {
    openModal('auth-modal');
    if (type === 'register') {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
        document.getElementById('modal-title').textContent = 'Регистрация';
    } else {
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('modal-title').textContent = 'Вход в систему';
    }
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    // Check admin
    if (username === 'admin' && password === 'admin123') {
        currentUser = { username: 'admin', role: 'admin', name: 'Администратор' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showNotification('Добро пожаловать, Администратор!');
        closeModal('auth-modal');
        updateAuthUI();
        return;
    }
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showNotification(`Добро пожаловать, ${user.name || user.username}!`);
        closeModal('auth-modal');
        updateAuthUI();
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
        showNotification('Логин уже занят', 'error');
        return;
    }
    
    const newUser = { 
        username: username, 
        password: password, 
        role: role,
        name: username
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showNotification('Регистрация успешна!');
    closeModal('auth-modal');
}

function forgotPassword() {
    showNotification('Обратитесь к администратору для восстановления пароля', 'info');
}

function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const mobileAuthSection = document.querySelector('#mobile-menu .pt-4');
    const qaButton = document.getElementById('qa-button');
    
    if (currentUser) {
        // User logged in
        authButtons.innerHTML = `
            <div class="flex items-center space-x-3">
                <span class="text-white">${currentUser.name || currentUser.username}</span>
                <button onclick="logout()" class="btn-secondary px-4 py-2 rounded-xl font-medium text-sm">
                    Выйти
                </button>
            </div>
        `;
        
        mobileAuthSection.innerHTML = `
            <div class="pt-4 border-t border-blue-600 space-y-3">
                <div class="text-white text-center py-2">
                    ${currentUser.name || currentUser.username}
                </div>
                <button onclick="logout()" class="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-medium flex items-center justify-center">
                    <i data-feather="log-out" class="w-4 h-4 mr-2"></i>
                    Выйти
                </button>
            </div>
        `;
        
        qaButton.classList.remove('hidden');
        
    } else {
        // User not logged in
        authButtons.innerHTML = `
            <button id="register-btn" class="btn-secondary px-5 py-2.5 rounded-xl font-medium">
                Регистрация
            </button>
            <button id="login-btn" class="btn-primary px-5 py-2.5 rounded-xl font-medium">
                Войти
            </button>
        `;
        
        mobileAuthSection.innerHTML = `
            <div class="pt-4 border-t border-blue-600 space-y-3">
                <button id="mobile-register-btn" class="w-full px-4 py-3 bg-white text-blue-600 rounded-xl font-medium flex items-center justify-center">
                    <i data-feather="user-plus" class="w-4 h-4 mr-2"></i>
                    Регистрация
                </button>
                <button id="mobile-login-btn" class="w-full mt-2 px-4 py-3 bg-blue-800 text-white rounded-xl font-medium flex items-center justify-center">
                    <i data-feather="log-in" class="w-4 h-4 mr-2"></i>
                    Войти
                </button>
            </div>
        `;
        
        qaButton.classList.add('hidden');
    }
    
    feather.replace();
    setupAuthEvents();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showNotification('Вы вышли из системы');
    updateAuthUI();
    showPage('main');
}

// Q&A functions
function openQAModal() {
    if (!currentUser) {
        showNotification('Войдите в систему', 'warning');
        return;
    }
    
    openModal('qa-modal');
    loadQuestions();
}

function submitQuestion() {
    if (!currentUser) {
        showNotification('Войдите в систему', 'warning');
        return;
    }
    
    const questionInput = document.getElementById('question-input');
    const question = questionInput.value.trim();
    
    if (!question) {
        showNotification('Введите вопрос', 'error');
        return;
    }
    
    const newQuestion = {
        id: Date.now(),
        question: question,
        answer: null,
        date: new Date().toLocaleDateString('ru-RU'),
        user: currentUser.username,
        userName: currentUser.name || currentUser.username
    };
    
    questions.push(newQuestion);
    localStorage.setItem('questions', JSON.stringify(questions));
    
    questionInput.value = '';
    showNotification('Вопрос отправлен');
    loadQuestions();
}

function loadQuestions() {
    const qaList = document.getElementById('qa-list');
    qaList.innerHTML = '';
    
    if (questions.length === 0) {
        qaList.innerHTML = `
            <div class="text-center py-8">
                <i data-feather="message-circle" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                <p class="text-gray-600 font-medium">Вопросов пока нет</p>
            </div>
        `;
        feather.replace();
        return;
    }
    
    questions.forEach(q => {
        const questionElement = document.createElement('div');
        questionElement.className = 'qa-item enhanced-card p-5 mb-4';
        questionElement.innerHTML = `
            <div class="qa-question flex items-start mb-3">
                <i data-feather="help-circle" class="w-5 h-5 text-blue-500 mr-3 mt-0.5"></i>
                <div class="flex-1">
                    <span class="font-semibold text-gray-800">${q.question}</span>
                    <p class="text-sm text-gray-600 mt-1">От: ${q.userName} • ${q.date}</p>
                </div>
                ${(currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin' || currentUser.username === q.user)) ? `
                    <button onclick="deleteQuestion(${q.id})" class="text-red-500 hover:text-red-700 ml-2">
                        <i data-feather="trash-2" class="w-4 h-4"></i>
                    </button>
                ` : ''}
            </div>
            ${q.answer ? `
            <div class="qa-answer flex items-start bg-green-50 p-3 rounded-lg">
                <i data-feather="check-circle" class="w-5 h-5 text-green-500 mr-3 mt-0.5"></i>
                <div class="flex-1">
                    <span class="text-gray-800 font-medium">${q.answer}</span>
                    <p class="text-sm text-gray-600 mt-1">Ответ учителя</p>
                </div>
            </div>
            ` : `
            <div class="qa-answer flex items-start bg-yellow-50 p-3 rounded-lg">
                <i data-feather="clock" class="w-5 h-5 text-yellow-500 mr-3 mt-0.5"></i>
                <span class="text-gray-800 font-medium">Вопрос на рассмотрении</span>
                ${currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin') ? `
                    <div class="ml-4 flex-1">
                        <textarea id="answer-${q.id}" placeholder="Введите ответ..." class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-20"></textarea>
                        <button onclick="submitAnswer(${q.id})" class="btn-primary px-3 py-1 rounded-lg text-sm mt-1">
                            Ответить
                        </button>
                    </div>
                ` : ''}
            </div>
            `}
        `;
        qaList.appendChild(questionElement);
    });
    
    feather.replace();
}

function submitAnswer(questionId) {
    const answerText = document.getElementById(`answer-${questionId}`).value.trim();
    
    if (!answerText) {
        showNotification('Введите ответ', 'error');
        return;
    }
    
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.answer = answerText;
        localStorage.setItem('questions', JSON.stringify(questions));
        showNotification('Ответ отправлен');
        loadQuestions();
    }
}

function deleteQuestion(questionId) {
    if (!confirm('Удалить вопрос?')) return;
    
    const index = questions.findIndex(q => q.id === questionId);
    if (index !== -1) {
        questions.splice(index, 1);
        localStorage.setItem('questions', JSON.stringify(questions));
        showNotification('Вопрос удален');
        loadQuestions();
    }
}

function setupAuthEvents() {
    // Desktop
    document.getElementById('register-btn').addEventListener('click', () => openAuthModal('register'));
    document.getElementById('login-btn').addEventListener('click', () => openAuthModal('login'));
    
    // Mobile
    document.getElementById('mobile-register-btn').addEventListener('click', () => openAuthModal('register'));
    document.getElementById('mobile-login-btn').addEventListener('click', () => openAuthModal('login'));
    
    // Modal
    document.getElementById('close-auth-modal').addEventListener('click', () => closeModal('auth-modal'));
    document.getElementById('switch-to-register').addEventListener('click', () => openAuthModal('register'));
    document.getElementById('switch-to-login').addEventListener('click', () => openAuthModal('login'));
    document.getElementById('login-submit').addEventListener('click', login);
    document.getElementById('register-submit').addEventListener('click', register);
    document.getElementById('forgot-password').addEventListener('click', forgotPassword);
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    initializeData();
    
    // Start facts rotation
    setInterval(rotateFacts, 5000);
    
    // Navigation
    document.querySelectorAll('[data-page]').forEach(button => {
        button.addEventListener('click', function() {
            showPage(this.getAttribute('data-page'));
        });
    });
    
    // Auth events
    setupAuthEvents();
    
    // Q&A events
    document.getElementById('qa-button').addEventListener('click', openQAModal);
    document.getElementById('close-qa-modal').addEventListener('click', () => closeModal('qa-modal'));
    document.getElementById('submit-question').addEventListener('click', submitQuestion);
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Add buttons
    document.getElementById('add-student-btn').addEventListener('click', addStudent);
    document.getElementById('add-lesson-btn').addEventListener('click', addLesson);
    document.getElementById('add-resource-btn').addEventListener('click', addResource);
    
    // Close modals on outside click
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('fixed') && event.target.id.includes('modal')) {
            closeModal(event.target.id);
        }
    });
    
    // Update UI
    updateAuthUI();
    
    // Initialize icons
    feather.replace();
    
    console.log('School 105 app initialized');
    console.log('Admin: admin / admin123');
});
