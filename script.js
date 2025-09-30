// Data storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let questions = JSON.parse(localStorage.getItem('questions')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let students = JSON.parse(localStorage.getItem('students')) || [];
let classes = JSON.parse(localStorage.getItem('classes')) || [];
let lessons = JSON.parse(localStorage.getItem('lessons')) || [];
let resources = JSON.parse(localStorage.getItem('resources')) || [];

// Initialize default data
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

    // Initialize resources with real links
    if (resources.length === 0) {
        resources = [
            { 
                id: 1, 
                title: 'Основы китайской грамматики', 
                description: 'Учебное пособие для начинающих', 
                link: 'https://www.chinese-tools.com/learn/chinese/grammar' 
            },
            { 
                id: 2, 
                title: 'Китайские иероглифы', 
                description: 'Изучение основных иероглифов', 
                link: 'https://www.hanzi5.com/' 
            },
            { 
                id: 3, 
                title: 'Разговорный китайский', 
                description: 'Практика разговорной речи', 
                link: 'https://www.chineseclass101.com/' 
            }
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

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const icon = notification.querySelector('i');
    
    notificationText.textContent = message;
    
    // Update styles based on type
    const border = notification.querySelector('.border-l-4');
    border.className = 'border-l-4';
    
    if (type === 'error') {
        border.classList.add('border-red-500');
        icon.setAttribute('data-feather', 'alert-circle');
        icon.className = 'w-6 h-6 text-red-500 mr-3';
    } else if (type === 'warning') {
        border.classList.add('border-yellow-500');
        icon.setAttribute('data-feather', 'alert-triangle');
        icon.className = 'w-6 h-6 text-yellow-500 mr-3';
    } else {
        border.classList.add('border-green-500');
        icon.setAttribute('data-feather', 'check-circle');
        icon.className = 'w-6 h-6 text-green-500 mr-3';
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
    notification.querySelector('.transform').classList.add('translate-x-full');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 500);
}

// Check if user has permission to edit
function hasPermission() {
    return currentUser !== null && (currentUser.role === 'teacher' || currentUser.role === 'admin');
}

// Check if user is admin
function isAdmin() {
    return currentUser !== null && currentUser.role === 'admin';
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
        loadPageContent(pageId);
        
        // Close mobile menu
        document.getElementById('mobile-menu').classList.add('hidden');
        const menuIcon = document.querySelector('#mobile-menu-button i');
        menuIcon.setAttribute('data-feather', 'menu');
        feather.replace();
    }, 300);
}

function loadPageContent(pageId) {
    switch(pageId) {
        case 'teachers':
            loadTeachersPage();
            break;
        case 'classes':
            loadClassesPage();
            break;
        case 'lessons':
            loadLessonsPage();
            break;
        case 'resources':
            loadResourcesPage();
            break;
    }
}

// Load Teachers Page
function loadTeachersPage() {
    const teachersContainer = document.getElementById('teachers-container');
    const addTeacherBtn = document.getElementById('add-teacher-btn');
    
    // Show/hide add teacher button for admin
    if (isAdmin()) {
        addTeacherBtn.classList.remove('hidden');
    } else {
        addTeacherBtn.classList.add('hidden');
    }
    
    // Get all teachers
    const teachers = users.filter(user => user.role === 'teacher');
    
    teachersContainer.innerHTML = '';
    
    if (teachers.length === 0) {
        teachersContainer.innerHTML = `
            <div class="col-span-3 text-center py-8">
                <i data-feather="users" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                <p class="text-gray-600 font-medium">Учителя пока не добавлены</p>
            </div>
        `;
    } else {
        teachers.forEach(teacher => {
            const teacherElement = document.createElement('div');
            teacherElement.className = 'bg-white p-6 rounded-2xl shadow-lg border border-gray-200 text-center';
            teacherElement.style.animation = 'fadeIn 0.6s ease-out';
            teacherElement.innerHTML = `
                <div class="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <i data-feather="user" class="w-12 h-12 text-blue-600"></i>
                </div>
                <h3 class="text-xl font-bold text-blue-600 mb-2">${teacher.name}</h3>
                <p class="text-gray-700 mb-3 font-medium">Учитель китайского языка</p>
                <p class="text-gray-600 text-sm">Логин: ${teacher.username}</p>
                ${isAdmin() ? `
                    <button onclick="deleteTeacher('${teacher.username}')" class="mt-3 bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-all duration-300">
                        Удалить
                    </button>
                ` : ''}
            `;
            teachersContainer.appendChild(teacherElement);
        });
    }
    
    feather.replace();
}

// Add Teacher Function
function addTeacher() {
    if (!isAdmin()) {
        showNotification('Только администратор может добавлять учителей', 'error');
        return;
    }
    
    const name = document.getElementById('teacher-name').value;
    const login = document.getElementById('teacher-login').value;
    const password = document.getElementById('teacher-password').value;
    
    if (!name || !login || !password) {
        showNotification('Заполните все поля', 'error');
        return;
    }
    
    if (users.find(u => u.username === login)) {
        showNotification('Пользователь с таким логином уже существует', 'error');
        return;
    }
    
    const newTeacher = {
        username: login,
        password: password,
        role: 'teacher',
        name: name
    };
    
    users.push(newTeacher);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Clear form
    document.getElementById('teacher-name').value = '';
    document.getElementById('teacher-login').value = '';
    document.getElementById('teacher-password').value = '';
    
    showNotification(`Учитель ${name} добавлен`);
    closeModal('add-teacher-modal');
    loadTeachersPage();
}

// Delete Teacher Function
function deleteTeacher(username) {
    if (!isAdmin()) {
        showNotification('Только администратор может удалять учителей', 'error');
        return;
    }
    
    if (!confirm('Вы уверены, что хотите удалить этого учителя?')) return;
    
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
        localStorage.setItem('users', JSON.stringify(users));
        showNotification('Учитель удален');
        loadTeachersPage();
    }
}

// Load Classes Page
function loadClassesPage() {
    const classesContainer = document.getElementById('classes-container');
    const addStudentSection = document.getElementById('add-student-section');
    const studentClassSelect = document.getElementById('student-class');
    
    // Show/hide add student section based on permissions
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
        classCard.className = 'bg-white p-6 rounded-2xl shadow-lg border border-gray-200 text-center class-card';
        classCard.style.animation = 'fadeIn 0.6s ease-out';
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
    const lessonsContainer = document.getElementById('lessons-container');
    lessonsContainer.innerHTML = '';
    
    if (lessons.length === 0) {
        lessonsContainer.innerHTML = `
            <div class="col-span-2 text-center py-8">
                <i data-feather="calendar" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                <p class="text-gray-600 font-medium">Расписание занятий пока не добавлено</p>
            </div>
        `;
    } else {
        lessons.forEach((lesson, index) => {
            const classItem = classes.find(c => c.id === lesson.classId);
            const lessonElement = document.createElement('div');
            lessonElement.className = 'bg-blue-50 p-4 rounded-xl border border-blue-100 lesson-card';
            lessonElement.style.animation = `fadeIn 0.6s ease-out ${index * 0.1}s both`;
            lessonElement.innerHTML = `
                <div class="flex items-center mb-2">
                    <i data-feather="clock" class="w-4 h-4 text-blue-500 mr-2"></i>
                    <span class="font-medium text-gray-800">${lesson.day}, ${lesson.time}</span>
                </div>
                <p class="text-gray-800 font-medium">${lesson.subject}</p>
                <p class="text-sm text-gray-600 mt-1">${classItem?.name || lesson.classId} класс</p>
            `;
            lessonsContainer.appendChild(lessonElement);
        });
    }
    
    feather.replace();
}

// Load Resources Page
function loadResourcesPage() {
    const resourcesContainer = document.getElementById('resources-container');
    resourcesContainer.innerHTML = '';
    
    if (resources.length === 0) {
        resourcesContainer.innerHTML = `
            <div class="col-span-3 text-center py-8">
                <i data-feather="book" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                <p class="text-gray-600 font-medium">Ресурсы пока не добавлены</p>
            </div>
        `;
    } else {
        resources.forEach((resource, index) => {
            const resourceElement = document.createElement('div');
            resourceElement.className = 'bg-white p-6 rounded-2xl shadow-lg border border-gray-200 resource-card';
            resourceElement.style.animation = `slideUp 0.6s ease-out ${index * 0.1}s both`;
            resourceElement.innerHTML = `
                <h3 class="text-xl font-bold text-blue-600 mb-2">${resource.title}</h3>
                <p class="text-gray-700 mb-4">${resource.description}</p>
                <a href="${resource.link}" target="_blank" class="bg-blue-600 text-white inline-flex items-center px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition-all duration-300">
                    <i data-feather="external-link" class="w-4 h-4 mr-2"></i>
                    Открыть ресурс
                </a>
            `;
            resourcesContainer.appendChild(resourceElement);
        });
    }
    
    feather.replace();
}

// Add Student Function
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
        showNotification('Пользователь с таким логином уже существует', 'error');
        return;
    }
    
    // Create user account for student
    const studentUser = {
        username: login,
        password: 'student123',
        role: 'student',
        name: name
    };
    
    users.push(studentUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Add student to students list
    const newStudent = {
        name: name,
        class: studentClass,
        username: login
    };
    
    students.push(newStudent);
    localStorage.setItem('students', JSON.stringify(students));
    
    // Clear form
    document.getElementById('student-name').value = '';
    document.getElementById('student-login').value = '';
    
    showNotification(`Ученик ${name} добавлен`);
    loadClassesPage();
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
    const currentTheme = body.getAttribute('data-theme');
    
    if (currentTheme === 'day') {
        body.setAttribute('data-theme', 'night');
        body.className = 'bg-gray-900 text-white transition-all duration-500';
        themeIcon.setAttribute('data-feather', 'sun');
        showNotification('Ночная тема включена');
    } else {
        body.setAttribute('data-theme', 'day');
        body.className = 'bg-white text-gray-900 transition-all duration-500';
        themeIcon.setAttribute('data-feather', 'moon');
        showNotification('Дневная тема включена');
    }
    feather.replace();
}

// Mobile menu
function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            const menu = document.getElementById('mobile-menu');
            const menuIcon = document.querySelector('#mobile-menu-button i');
            
            menu.classList.toggle('hidden');
            
            if (menu.classList.contains('hidden')) {
                menuIcon.setAttribute('data-feather', 'menu');
            } else {
                menuIcon.setAttribute('data-feather', 'x');
            }
            feather.replace();
        });
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.opacity = '0';
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
    
    // Check for admin
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
        showNotification('Пользователь с таким логином уже существует', 'error');
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
    
    // Auto login after registration
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    showNotification('Регистрация выполнена успешно!');
    
    closeModal('auth-modal');
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-password').value = '';
    document.getElementById('reg-confirm-password').value = '';
    
    updateAuthUI();
}

function forgotPassword() {
    showNotification('Для восстановления пароля обратитесь к администратору школы.', 'info');
}

function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const mobileAuthSection = document.querySelector('#mobile-menu .pt-4');
    const qaButton = document.getElementById('qa-button');
    const addTeacherBtn = document.getElementById('add-teacher-btn');
    const addStudentSection = document.getElementById('add-student-section');
    
    if (currentUser) {
        // User is logged in
        authButtons.innerHTML = `
            <div class="flex items-center space-x-3">
                <span class="text-white">${currentUser.name || currentUser.username}</span>
                <button onclick="logout()" class="bg-red-600 text-white px-4 py-2 rounded-xl font-medium text-sm hover:bg-red-700 transition-all duration-300">
                    Выйти
                </button>
            </div>
        `;
        
        mobileAuthSection.innerHTML = `
            <div class="pt-4 border-t border-blue-600 space-y-3">
                <div class="text-white text-center py-2">
                    ${currentUser.name || currentUser.username}
                </div>
                <button onclick="logout()" class="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-medium flex items-center justify-center transition-all duration-300">
                    <i data-feather="log-out" class="w-4 h-4 mr-2"></i>
                    Выйти
                </button>
            </div>
        `;
        
        // Show Q&A button for all logged in users
        qaButton.classList.remove('hidden');
        
        // Update permissions for admin/teacher features
        if (isAdmin()) {
            addTeacherBtn.classList.remove('hidden');
        }
        if (hasPermission()) {
            addStudentSection.classList.remove('hidden');
        }
        
    } else {
        // User is not logged in
        authButtons.innerHTML = `
            <button onclick="openAuthModal('register')" class="bg-red-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-all duration-300">
                Регистрация
            </button>
            <button onclick="openAuthModal('login')" class="bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-800 transition-all duration-300">
                Войти
            </button>
        `;
        
        mobileAuthSection.innerHTML = `
            <div class="pt-4 border-t border-blue-600 space-y-3">
                <button onclick="openAuthModal('register')" class="w-full px-4 py-3 bg-white text-blue-600 rounded-xl font-medium flex items-center justify-center transition-all duration-300">
                    <i data-feather="user-plus" class="w-4 h-4 mr-2"></i>
                    Регистрация
                </button>
                <button onclick="openAuthModal('login')" class="w-full mt-2 px-4 py-3 bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center transition-all duration-300">
                    <i data-feather="log-in" class="w-4 h-4 mr-2"></i>
                    Войти
                </button>
            </div>
        `;
        
        // Hide Q&A button for anonymous users
        qaButton.classList.add('hidden');
        addTeacherBtn.classList.add('hidden');
        addStudentSection.classList.add('hidden');
    }
    
    feather.replace();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showNotification('Вы успешно вышли из системы');
    updateAuthUI();
    showPage('main');
}

// Q&A functions
function openQAModal() {
    if (!currentUser) {
        showNotification('Для доступа к вопросам и ответам необходимо войти в систему', 'warning');
        openAuthModal('login');
        return;
    }
    
    openModal('qa-modal');
    loadQuestions();
}

function submitQuestion() {
    if (!currentUser) {
        showNotification('Для отправки вопроса необходимо войти в систему', 'warning');
        return;
    }
    
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
        date: new Date().toLocaleDateString('ru-RU'),
        user: currentUser.username,
        userName: currentUser.name || currentUser.username
    };
    
    questions.push(newQuestion);
    localStorage.setItem('questions', JSON.stringify(questions));
    
    loadQuestions();
    questionInput.value = '';
    showNotification('Ваш вопрос отправлен!');
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
    
    // Show only current user's questions or all questions for teachers/admins
    const questionsToShow = hasPermission() 
        ? questions 
        : questions.filter(q => q.user === currentUser.username);
    
    if (questionsToShow.length === 0) {
        qaList.innerHTML = `
            <div class="text-center py-8">
                <i data-feather="message-circle" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                <p class="text-gray-600 font-medium">У вас пока нет вопросов</p>
            </div>
        `;
        feather.replace();
        return;
    }
    
    questionsToShow.forEach((q, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'bg-white p-5 rounded-2xl shadow-lg border border-gray-200 mb-4';
        questionElement.style.animation = `fadeIn 0.6s ease-out ${index * 0.1}s both`;
        
        let answerSection = '';
        if (q.answer) {
            answerSection = `
                <div class="flex items-start bg-green-50 p-3 rounded-lg mt-3">
                    <i data-feather="check-circle" class="w-5 h-5 text-green-500 mr-3 mt-0.5"></i>
                    <div class="flex-1">
                        <span class="text-gray-800 font-medium">${q.answer}</span>
                        <p class="text-sm text-gray-600 mt-1">Ответ учителя</p>
                    </div>
                </div>
            `;
        } else if (hasPermission()) {
            answerSection = `
                <div class="mt-3">
                    <textarea id="answer-${q.id}" placeholder="Введите ответ..." class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none h-20"></textarea>
                    <button onclick="submitAnswer(${q.id})" class="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm mt-1 hover:bg-blue-700 transition-all duration-300">
                        Ответить
                    </button>
                </div>
            `;
        } else {
            answerSection = `
                <div class="flex items-start bg-yellow-50 p-3 rounded-lg mt-3">
                    <i data-feather="clock" class="w-5 h-5 text-yellow-500 mr-3 mt-0.5"></i>
                    <span class="text-gray-800 font-medium">Вопрос на рассмотрении учителя</span>
                </div>
            `;
        }
        
        questionElement.innerHTML = `
            <div class="flex items-start mb-3">
                <i data-feather="help-circle" class="w-5 h-5 text-blue-500 mr-3 mt-0.5"></i>
                <div class="flex-1">
                    <span class="font-semibold text-gray-800">${q.question}</span>
                    <p class="text-sm text-gray-600 mt-1">От: ${q.userName} • ${q.date}</p>
                </div>
            </div>
            ${answerSection}
        `;
        qaList.appendChild(questionElement);
    });
    
    feather.replace();
}

function submitAnswer(questionId) {
    if (!hasPermission()) {
        showNotification('Только учителя могут отвечать на вопросы', 'error');
        return;
    }
    
    const answerTextarea = document.getElementById(`answer-${questionId}`);
    if (!answerTextarea) return;
    
    const answerText = answerTextarea.value.trim();
    
    if (!answerText) {
        showNotification('Пожалуйста, введите ответ', 'error');
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

// Initialize application
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
    
    // Theme toggle
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Mobile menu
    setupMobileMenu();
    
    // Q&A button
    document.getElementById('qa-button').addEventListener('click', openQAModal);
    
    // Close modals on outside click
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('fixed') && event.target.id.includes('modal')) {
            closeModal(event.target.id);
        }
    });
    
    // Update UI based on current user
    updateAuthUI();
    
    // Initialize feather icons
    feather.replace();
    
    console.log('School 105 application initialized');
    console.log('Admin: admin / admin123');
});
