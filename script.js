// Initialize Feather Icons
feather.replace();

// Data storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let questions = JSON.parse(localStorage.getItem('questions')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let students = JSON.parse(localStorage.getItem('students')) || [];
let classes = JSON.parse(localStorage.getItem('classes')) || [];
let lessons = JSON.parse(localStorage.getItem('lessons')) || [];

// Initialize default data if empty
if (users.length === 0) {
    users = [
        { username: 'admin', password: 'admin123', role: 'admin' }
    ];
    localStorage.setItem('users', JSON.stringify(users));
}

if (classes.length === 0) {
    classes = ['5А', '5Б', '6А', '6Б', '7А', '7Б', '8А', '8Б', '9А', '9Б', '10А', '10Б', '11А', '11Б'];
    localStorage.setItem('classes', JSON.stringify(classes));
}

if (lessons.length === 0) {
    lessons = [
        { class: '5А', day: 'Понедельник', time: '9:00', subject: 'Китайский для начинающих' },
        { class: '5А', day: 'Среда', time: '10:00', subject: 'Разговорный китайский' },
        { class: '5Б', day: 'Вторник', time: '9:00', subject: 'Китайский для начинающих' },
        { class: '5Б', day: 'Четверг', time: '10:00', subject: 'Разговорный китайский' },
        { class: '6А', day: 'Понедельник', time: '11:00', subject: 'Иероглифика' },
        { class: '6А', day: 'Среда', time: '12:00', subject: 'Китайская культура' },
        { class: '6Б', day: 'Вторник', time: '11:00', subject: 'Иероглифика' },
        { class: '6Б', day: 'Четверг', time: '12:00', subject: 'Китайская культура' },
        { class: '7А', day: 'Понедельник', time: '13:00', subject: 'Продвинутый китайский' },
        { class: '7А', day: 'Среда', time: '14:00', subject: 'Китайская литература' },
        { class: '7Б', day: 'Вторник', time: '13:00', subject: 'Продвинутый китайский' },
        { class: '7Б', day: 'Четверг', time: '14:00', subject: 'Китайская литература' },
        { class: '8А', day: 'Понедельник', time: '15:00', subject: 'Деловой китайский' },
        { class: '8А', day: 'Среда', time: '16:00', subject: 'Подготовка к HSK' },
        { class: '8Б', day: 'Вторник', time: '15:00', subject: 'Деловой китайский' },
        { class: '8Б', day: 'Четверг', time: '16:00', subject: 'Подготовка к HSK' },
        { class: '9А', day: 'Понедельник', time: '14:00', subject: 'Китайский для экзаменов' },
        { class: '9А', day: 'Среда', time: '15:00', subject: 'Разговорная практика' },
        { class: '9Б', day: 'Вторник', time: '14:00', subject: 'Китайский для экзаменов' },
        { class: '9Б', day: 'Четверг', time: '15:00', subject: 'Разговорная практика' },
        { class: '10А', day: 'Понедельник', time: '16:00', subject: 'Академический китайский' },
        { class: '10А', day: 'Среда', time: '17:00', subject: 'Китайская история' },
        { class: '10Б', day: 'Вторник', time: '16:00', subject: 'Академический китайский' },
        { class: '10Б', day: 'Четверг', time: '17:00', subject: 'Китайская история' },
        { class: '11А', day: 'Понедельник', time: '17:00', subject: 'Подготовка к поступлению' },
        { class: '11А', day: 'Среда', time: '18:00', subject: 'Профессиональный китайский' },
        { class: '11Б', day: 'Вторник', time: '17:00', subject: 'Подготовка к поступлению' },
        { class: '11Б', day: 'Четверг', time: '18:00', subject: 'Профессиональный китайский' }
    ];
    localStorage.setItem('lessons', JSON.stringify(lessons));
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
    const notificationIcon = notification.querySelector('i');
    
    notificationText.textContent = message;
    
    // Set icon based on type
    if (type === 'error') {
        notificationIcon.setAttribute('data-feather', 'alert-circle');
        notification.querySelector('.border-l-4').classList.remove('border-green-500');
        notification.querySelector('.border-l-4').classList.add('border-red-500');
        notificationIcon.classList.remove('text-green-500');
        notificationIcon.classList.add('text-red-500');
    } else {
        notificationIcon.setAttribute('data-feather', 'check-circle');
        notification.querySelector('.border-l-4').classList.remove('border-red-500');
        notification.querySelector('.border-l-4').classList.add('border-green-500');
        notificationIcon.classList.remove('text-red-500');
        notificationIcon.classList.add('text-green-500');
    }
    
    feather.replace();
    notification.classList.remove('hidden');
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.querySelector('.transform').classList.remove('translate-x-full');
    }, 100);
    
    // Auto hide after 5 seconds
    setTimeout(hideNotification, 5000);
}

function hideNotification() {
    const notification = document.getElementById('notification');
    notification.querySelector('.transform').classList.add('translate-x-full');
    setTimeout(() => {
        notification.classList.add('hidden');
        notification.classList.remove('show');
    }, 500);
}

// Page management with animations
function showPage(pageId) {
    // Hide all pages with animation
    document.querySelectorAll('.page').forEach(page => {
        if (page.classList.contains('active')) {
            page.style.opacity = '0';
            page.style.transform = 'translateY(20px)';
            setTimeout(() => {
                page.classList.remove('active');
                page.classList.add('hidden');
            }, 300);
        }
    });
    
    // Show selected page with animation
    setTimeout(() => {
        const targetPage = document.getElementById(pageId + '-page');
        if (targetPage) {
            targetPage.classList.remove('hidden');
            targetPage.classList.add('active');
            setTimeout(() => {
                targetPage.style.opacity = '1';
                targetPage.style.transform = 'translateY(0)';
            }, 50);
        }
        
        // Update active nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll(`[data-page="${pageId}"]`).forEach(item => {
            item.classList.add('active');
        });
        
        // Load page-specific content
        if (pageId === 'classes') {
            loadClassesPage();
        } else if (pageId === 'lessons') {
            loadLessonsPage();
        }
        
        // Close mobile menu
        document.getElementById('mobile-menu').classList.add('hidden');
        const menuIcon = document.querySelector('#mobile-menu-button i');
        menuIcon.setAttribute('data-feather', 'menu');
        feather.replace();
    }, 300);
}

// Load Classes Page
function loadClassesPage() {
    const classesContainer = document.querySelector('#classes-page .grid');
    const addStudentSection = document.getElementById('add-student-section');
    
    // Show/hide add student section based on user role
    if (currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin')) {
        addStudentSection.classList.remove('hidden');
    } else {
        addStudentSection.classList.add('hidden');
    }
    
    // Clear container
    classesContainer.innerHTML = '';
    
    // Create class cards
    classes.forEach(className => {
        const classStudents = students.filter(student => student.class === className);
        
        const classCard = document.createElement('div');
        classCard.className = 'class-card enhanced-card p-6 text-center animate-scale-in';
        classCard.innerHTML = `
            <div class="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <i data-feather="users" class="w-8 h-8 text-blue-600"></i>
            </div>
            <h3 class="text-xl font-bold text-blue-600 mb-2">${className} класс</h3>
            <p class="text-gray-700 font-medium mb-3">${classStudents.length} учеников</p>
            <div class="max-h-32 overflow-y-auto">
                ${classStudents.map(student => `
                    <div class="text-sm text-gray-600 py-1 border-b border-gray-100">${student.name}</div>
                `).join('')}
            </div>
        `;
        
        classesContainer.appendChild(classCard);
    });
    
    feather.replace();
}

// Load Lessons Page
function loadLessonsPage() {
    const classSelector = document.getElementById('class-selector');
    const currentClassInfo = document.getElementById('current-class-info');
    const lessonsContainer = document.getElementById('lessons-container');
    
    // Show/hide class selector based on user role
    if (currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin')) {
        classSelector.classList.remove('hidden');
        loadClassSelector();
    } else {
        classSelector.classList.add('hidden');
    }
    
    // Show current class info for students
    if (currentUser && currentUser.role === 'student') {
        const student = students.find(s => s.login === currentUser.username);
        if (student) {
            selectedClass = student.class;
            currentClassInfo.classList.remove('hidden');
            document.getElementById('selected-class-name').textContent = student.class;
        }
    }
    
    loadLessonsForClass();
}

function loadClassSelector() {
    const classSelectorContainer = document.querySelector('#class-selector .flex');
    classSelectorContainer.innerHTML = '';
    
    classes.forEach(className => {
        const classButton = document.createElement('button');
        classButton.className = `class-badge px-4 py-2 rounded-xl font-medium transition-all duration-300 ${selectedClass === className ? 'active text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;
        classButton.textContent = className;
        classButton.onclick = () => selectClass(className);
        
        classSelectorContainer.appendChild(classButton);
    });
}

function selectClass(className) {
    selectedClass = className;
    loadClassSelector();
    
    const currentClassInfo = document.getElementById('current-class-info');
    currentClassInfo.classList.remove('hidden');
    document.getElementById('selected-class-name').textContent = className;
    
    loadLessonsForClass();
}

function loadLessonsForClass() {
    const lessonsContainer = document.getElementById('lessons-container');
    lessonsContainer.innerHTML = '';
    
    let classLessons = [];
    
    if (currentUser && currentUser.role === 'student') {
        const student = students.find(s => s.login === currentUser.username);
        if (student) {
            classLessons = lessons.filter(lesson => lesson.class === student.class);
        }
    } else if (selectedClass) {
        classLessons = lessons.filter(lesson => lesson.class === selectedClass);
    } else {
        // Show all lessons for admin/teacher when no class selected
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
            const lessonElement = document.createElement('div');
            lessonElement.className = 'bg-blue-50 p-4 rounded-xl border border-blue-100 transition-all duration-300 hover:scale-105';
            lessonElement.innerHTML = `
                <div class="flex items-center mb-2">
                    <i data-feather="clock" class="w-4 h-4 text-blue-500 mr-2"></i>
                    <span class="font-medium text-gray-800">${lesson.day}, ${lesson.time}</span>
                    ${currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin') ? 
                    `<span class="ml-2 px-2 py-1 bg-blue-200 text-blue-700 text-xs rounded-full">${lesson.class}</span>` : ''}
                </div>
                <p class="text-gray-800 font-medium">${lesson.subject}</p>
            `;
            lessonsContainer.appendChild(lessonElement);
        });
    }
    
    feather.replace();
}

// Add Student Function
function addStudent() {
    const name = document.getElementById('student-name').value;
    const studentClass = document.getElementById('student-class').value;
    const login = document.getElementById('student-login').value;
    
    if (!name || !studentClass || !login) {
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    if (students.find(s => s.login === login)) {
        showNotification('Ученик с таким логином уже существует', 'error');
        return;
    }
    
    // Create user account for student
    const studentUser = {
        username: login,
        password: 'student123', // Default password
        role: 'student'
    };
    
    users.push(studentUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Add student to class
    const newStudent = {
        name: name,
        class: studentClass,
        login: login
    };
    
    students.push(newStudent);
    localStorage.setItem('students', JSON.stringify(students));
    
    // Clear form
    document.getElementById('student-name').value = '';
    document.getElementById('student-login').value = '';
    
    showNotification(`Ученик ${name} добавлен в ${studentClass} класс`);
    loadClassesPage();
}

// Facts rotation
function rotateFacts() {
    currentFactIndex = (currentFactIndex + 1) % chinaFacts.length;
    const factContainer = document.getElementById('fact-container');
    const factDots = document.querySelectorAll('.fact-dot');
    
    // Fade out
    factContainer.style.opacity = '0';
    factContainer.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        factContainer.innerHTML = `<p class="text-xl font-medium">${chinaFacts[currentFactIndex]}</p>`;
        
        // Fade in
        factContainer.style.opacity = '1';
        factContainer.style.transform = 'translateY(0)';
        
        // Update dots
        factDots.forEach((dot, index) => {
            dot.classList.remove('active', 'bg-white');
            dot.classList.add('bg-white/50');
            if (index === currentFactIndex) {
                dot.classList.add('active', 'bg-white');
                dot.classList.remove('bg-white/50');
            }
        });
    }, 300);
}

// Theme switching
document.getElementById('theme-toggle').addEventListener('click', function() {
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
});

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

// Modal functions with animations
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const modalContent = modal.querySelector('.modal-content') || modal.querySelector('.bg-white');
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    }, 50);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const modalContent = modal.querySelector('.modal-content') || modal.querySelector('.bg-white');
    
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
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    // Check for admin
    if (username === 'admin' && password === 'admin123') {
        currentUser = { username: 'admin', role: 'admin' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showNotification('Добро пожаловать, Администратор!');
        closeModal('auth-modal');
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        updateAuthUI();
        return;
    }
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showNotification(`Добро пожаловать, ${user.username}!`);
        closeModal('auth-modal');
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
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
        showNotification('Пожалуйста, заполните все поля', 'error');
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
    
    const newUser = { username, password, role };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showNotification('Регистрация выполнена успешно!');
    
    closeModal('auth-modal');
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-password').value = '';
    document.getElementById('reg-confirm-password').value = '';
}

function forgotPassword() {
    showNotification('Для восстановления пароля обратитесь к администратору школы.', 'error');
}

function updateAuthUI() {
    if (currentUser) {
        document.getElementById('auth-buttons').innerHTML = `
            <button id="logout-btn" class="btn-secondary px-5 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105">
                Выйти (${currentUser.username})
            </button>
        `;
        document.getElementById('mobile-register-btn').parentElement.innerHTML = `
            <button id="mobile-logout-btn" class="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-medium transition-all duration-300 hover:bg-red-700 transform hover:scale-105 flex items-center justify-center">
                <i data-feather="log-out" class="w-4 h-4 mr-2"></i>
                Выйти (${currentUser.username})
            </button>
        `;
        feather.replace();
        
        document.getElementById('logout-btn').addEventListener('click', logout);
        document.getElementById('mobile-logout-btn').addEventListener('click', logout);
        
        // Reload current page to update content based on user role
        const currentPage = document.querySelector('.page.active');
        if (currentPage) {
            const pageId = currentPage.id.replace('-page', '');
            showPage(pageId);
        }
    }
}

function logout() {
    currentUser = null;
    selectedClass = null;
    localStorage.removeItem('currentUser');
    showNotification('Вы успешно вышли из системы');
    
    // Reset auth UI
    document.getElementById('auth-buttons').innerHTML = `
        <button id="register-btn" class="btn-secondary px-5 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105">
            Регистрация
        </button>
        <button id="login-btn" class="btn-primary px-5 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105">
            Войти
        </button>
    `;
    document.getElementById('mobile-register-btn').parentElement.innerHTML = `
        <button id="mobile-register-btn" class="w-full px-4 py-3 bg-white text-blue-600 rounded-xl font-medium transition-all duration-300 hover:bg-blue-50 transform hover:scale-105 flex items-center justify-center">
            <i data-feather="user-plus" class="w-4 h-4 mr-2"></i>
            Регистрация
        </button>
        <button id="mobile-login-btn" class="w-full mt-2 px-4 py-3 bg-blue-800 text-white rounded-xl font-medium transition-all duration-300 hover:bg-blue-700 transform hover:scale-105 flex items-center justify-center">
            <i data-feather="log-in" class="w-4 h-4 mr-2"></i>
            Войти
        </button>
    `;
    feather.replace();
    setupAuthEvents();
    
    // Reload current page
    const currentPage = document.querySelector('.page.active');
    if (currentPage) {
        const pageId = currentPage.id.replace('-page', '');
        showPage(pageId);
    }
}

// Q&A functions
function openQAModal() {
    openModal('qa-modal');
    loadQuestions();
}

function submitQuestion() {
    const questionInput = document.getElementById('question-input');
    const question = questionInput.value.trim();
    
    if (!question) {
        showNotification('Пожалуйста, введите вопрос', 'error');
        return;
    }
    
    const newQuestion = {
        id: Date.now(),
        question: question,
        answer: null,
        date: new Date().toLocaleDateString(),
        user: currentUser ? currentUser.username : 'Аноним'
    };
    
    questions.push(newQuestion);
    localStorage.setItem('questions', JSON.stringify(questions));
    
    loadQuestions();
    questionInput.value = '';
    showNotification('Ваш вопрос отправлен! Ответ появится после проверки учителем.');
}

function loadQuestions() {
    const qaList = document.getElementById('qa-list');
    qaList.innerHTML = '';
    
    questions.forEach(q => {
        const questionElement = document.createElement('div');
        questionElement.className = 'qa-item enhanced-card p-5 transition-all duration-300 hover:scale-105';
        questionElement.innerHTML = `
            <div class="qa-question flex items-start">
                <i data-feather="help-circle" class="w-5 h-5 text-blue-500 mr-3 mt-0.5"></i>
                <div>
                    <span class="font-semibold text-gray-800">${q.question}</span>
                    <p class="text-sm text-gray-600 mt-1">От: ${q.user} • ${q.date}</p>
                </div>
            </div>
            ${q.answer ? `
            <div class="qa-answer mt-3 flex items-start">
                <i data-feather="check-circle" class="w-5 h-5 text-green-500 mr-3 mt-0.5"></i>
                <span class="text-gray-800 font-medium">${q.answer}</span>
            </div>
            ` : `
            <div class="qa-answer mt-3 flex items-start">
                <i data-feather="clock" class="w-5 h-5 text-yellow-500 mr-3 mt-0.5"></i>
                <span class="text-gray-800 font-medium">Вопрос на рассмотрении учителя</span>
            </div>
            `}
        `;
        qaList.appendChild(questionElement);
    });
    
    feather.replace();
}

function setupAuthEvents() {
    document.getElementById('register-btn').addEventListener('click', () => openAuthModal('register'));
    document.getElementById('login-btn').addEventListener('click', () => openAuthModal('login'));
    document.getElementById('mobile-register-btn').addEventListener('click', () => openAuthModal('register'));
    document.getElementById('mobile-login-btn').addEventListener('click', () => openAuthModal('login'));
    document.getElementById('close-auth-modal').addEventListener('click', () => closeModal('auth-modal'));
    document.getElementById('switch-to-register').addEventListener('click', () => openAuthModal('register'));
    document.getElementById('switch-to-login').addEventListener('click', () => openAuthModal('login'));
    document.getElementById('login-submit').addEventListener('click', login);
    document.getElementById('register-submit').addEventListener('click', register);
    document.getElementById('forgot-password').addEventListener('click', forgotPassword);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Classes events
    document.getElementById('add-student-btn').addEventListener('click', addStudent);
    
    // Close modals on outside click
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('fixed') && event.target.id.includes('modal')) {
            closeModal(event.target.id);
        }
    });
    
    // Load initial data
    loadQuestions();
    if (currentUser) {
        updateAuthUI();
    }
    
    // Add animation to elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all enhanced cards for animation
    document.querySelectorAll('.enhanced-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease-out';
        observer.observe(card);
    });
});
