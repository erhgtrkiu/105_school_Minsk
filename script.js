// Initialize data
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
    }

    // Initialize classes
    if (classes.length === 0) {
        classes = [
            { id: '5A', name: '5А', students: [] },
            { id: '5B', name: '5Б', students: [] },
            { id: '6A', name: '6А', students: [] },
            { id: '6B', name: '6Б', students: [] },
            { id: '7A', name: '7А', students: [] },
            { id: '7B', name: '7Б', students: [] },
            { id: '8A', name: '8А', students: [] },
            { id: '8B', name: '8Б', students: [] },
            { id: '9A', name: '9А', students: [] },
            { id: '9B', name: '9Б', students: [] },
            { id: '10A', name: '10А', students: [] },
            { id: '10B', name: '10Б', students: [] },
            { id: '11A', name: '11А', students: [] },
            { id: '11B', name: '11Б', students: [] }
        ];
    }

    // Initialize lessons
    if (lessons.length === 0) {
        lessons = [
            { id: 1, classId: '5A', day: 'Понедельник', time: '9:00', subject: 'Китайский для начинающих' },
            { id: 2, classId: '5A', day: 'Среда', time: '10:00', subject: 'Разговорный китайский' },
            { id: 3, classId: '6A', day: 'Вторник', time: '9:00', subject: 'Китайский для начинающих' }
        ];
    }

    // Initialize resources
    if (resources.length === 0) {
        resources = [
            { id: 1, title: 'Основы китайской грамматики', description: 'Учебное пособие для начинающих', link: '#' },
            { id: 2, title: 'Китайские иероглифы', description: 'Таблица основных иероглифов', link: '#' }
        ];
    }

    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('classes', JSON.stringify(classes));
    localStorage.setItem('lessons', JSON.stringify(lessons));
    localStorage.setItem('resources', JSON.stringify(resources));
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
    
    // Set icon and color based on type
    if (type === 'error') {
        notificationIcon.setAttribute('data-feather', 'alert-circle');
        notification.querySelector('.border-l-4').classList.remove('border-green-500', 'border-blue-500', 'border-yellow-500');
        notification.querySelector('.border-l-4').classList.add('border-red-500');
        notificationIcon.classList.remove('text-green-500', 'text-blue-500', 'text-yellow-500');
        notificationIcon.classList.add('text-red-500');
    } else if (type === 'warning') {
        notificationIcon.setAttribute('data-feather', 'alert-triangle');
        notification.querySelector('.border-l-4').classList.remove('border-green-500', 'border-blue-500', 'border-red-500');
        notification.querySelector('.border-l-4').classList.add('border-yellow-500');
        notificationIcon.classList.remove('text-green-500', 'text-blue-500', 'text-red-500');
        notificationIcon.classList.add('text-yellow-500');
    } else if (type === 'info') {
        notificationIcon.setAttribute('data-feather', 'info');
        notification.querySelector('.border-l-4').classList.remove('border-green-500', 'border-red-500', 'border-yellow-500');
        notification.querySelector('.border-l-4').classList.add('border-blue-500');
        notificationIcon.classList.remove('text-green-500', 'text-red-500', 'text-yellow-500');
        notificationIcon.classList.add('text-blue-500');
    } else {
        notificationIcon.setAttribute('data-feather', 'check-circle');
        notification.querySelector('.border-l-4').classList.remove('border-red-500', 'border-blue-500', 'border-yellow-500');
        notification.querySelector('.border-l-4').classList.add('border-green-500');
        notificationIcon.classList.remove('text-red-500', 'text-blue-500', 'text-yellow-500');
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
    
    // Load page-specific content
    if (pageId === 'classes') {
        loadClassesPage();
    } else if (pageId === 'lessons') {
        loadLessonsPage();
    } else if (pageId === 'resources') {
        loadResourcesPage();
    } else if (pageId === 'additional') {
        loadAdditionalLessonsPage();
    }
    
    // Close mobile menu
    document.getElementById('mobile-menu').classList.add('hidden');
    const menuIcon = document.querySelector('#mobile-menu-button i');
    menuIcon.setAttribute('data-feather', 'menu');
    feather.replace();
}

// Load Classes Page
function loadClassesPage() {
    const classesContainer = document.getElementById('classes-container');
    const addStudentSection = document.getElementById('add-student-section');
    const studentClassSelect = document.getElementById('student-class');
    
    // Show/hide add student section based on user role
    if (currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin')) {
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
    
    // Clear container
    classesContainer.innerHTML = '';
    
    // Create class cards
    classes.forEach(classItem => {
        const classStudents = students.filter(student => student.class === classItem.id);
        
        const classCard = document.createElement('div');
        classCard.className = 'class-card enhanced-card p-6 text-center animate-scale-in';
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
                ${classStudents.length === 0 ? '<p class="text-sm text-gray-500">Нет учеников</p>' : ''}
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
    const lessonsContainer = document.getElementById('lessons-container');
    const lessonClassSelect = document.getElementById('lesson-class');
    
    // Show/hide class selector based on user role
    if (currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin')) {
        classSelector.classList.remove('hidden');
        
        // Populate class selector
        classSelectorButtons.innerHTML = '';
        classes.forEach(classItem => {
            const button = document.createElement('button');
            button.className = `class-badge px-4 py-2 rounded-xl font-medium transition-all duration-300 ${selectedClass === classItem.id ? 'active text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`;
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
    
    // Show current class info for students
    if (currentUser && currentUser.role === 'student') {
        const student = students.find(s => s.username === currentUser.username);
        if (student) {
            selectedClass = student.class;
            currentClassInfo.classList.remove('hidden');
            document.getElementById('selected-class-name').textContent = classes.find(c => c.id === student.class)?.name || student.class;
        }
    }
    
    loadLessonsForClass();
}

function selectClass(className) {
    selectedClass = className;
    loadLessonsPage();
    
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
            const classItem = classes.find(c => c.id === lesson.classId);
            const lessonElement = document.createElement('div');
            lessonElement.className = 'bg-blue-50 p-4 rounded-xl border border-blue-100 transition-all duration-300 hover:scale-105';
            lessonElement.innerHTML = `
                <div class="flex items-center mb-2">
                    <i data-feather="clock" class="w-4 h-4 text-blue-500 mr-2"></i>
                    <span class="font-medium text-gray-800">${lesson.day}, ${lesson.time}</span>
                    ${currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin') ? 
                    `<span class="ml-2 px-2 py-1 bg-blue-200 text-blue-700 text-xs rounded-full">${classItem?.name || lesson.classId}</span>` : ''}
                </div>
                <p class="text-gray-800 font-medium">${lesson.subject}</p>
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
    
    // Show/hide add resource button based on user role
    if (currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin')) {
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
                <h3 class="text-xl font-bold text-blue-600 mb-2">${resource.title}</h3>
                <p class="text-gray-700 mb-4">${resource.description}</p>
                <a href="${resource.link}" target="_blank" class="btn-primary inline-flex items-center px-4 py-2 rounded-xl text-sm">
                    <i data-feather="external-link" class="w-4 h-4 mr-2"></i>
                    Открыть ресурс
                </a>
                ${currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin') ? `
                    <button onclick="deleteResource(${resource.id})" class="ml-2 text-red-500 hover:text-red-700">
                        <i data-feather="trash-2" class="w-4 h-4"></i>
                    </button>
                ` : ''}
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
    
    // Show/hide add button based on user role
    if (currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin')) {
        addAdditionalButton.classList.remove('hidden');
    } else {
        addAdditionalButton.classList.add('hidden');
    }
    
    additionalContainer.innerHTML = '';
    
    // For now, show all lessons as additional
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
                <h3 class="text-xl font-bold text-blue-600 mb-2">${lesson.subject}</h3>
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

// Add Student Function
function addStudent() {
    const name = document.getElementById('student-name').value;
    const studentClass = document.getElementById('student-class').value;
    const login = document.getElementById('student-login').value;
    
    if (!name || !studentClass || !login) {
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    if (users.find(u => u.username === login)) {
        showNotification('Пользователь с таким логином уже существует', 'error');
        return;
    }
    
    // Create user account for student
    const studentUser = {
        username: login,
        password: 'student123', // Default password
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
    
    showNotification(`Ученик ${name} добавлен в класс`);
    loadClassesPage();
}

// Add Lesson Function
function addLesson() {
    const classId = document.getElementById('lesson-class').value;
    const day = document.getElementById('lesson-day').value;
    const time = document.getElementById('lesson-time').value;
    const subject = document.getElementById('lesson-subject').value;
    
    if (!classId || !day || !time || !subject) {
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    const newLesson = {
        id: Date.now(),
        classId: classId,
        day: day,
        time: time,
        subject: subject
    };
    
    lessons.push(newLesson);
    localStorage.setItem('lessons', JSON.stringify(lessons));
    
    // Clear form
    document.getElementById('lesson-time').value = '';
    document.getElementById('lesson-subject').value = '';
    
    showNotification('Занятие добавлено');
    closeModal('add-lesson-modal');
    loadLessonsPage();
}

// Add Resource Function
function addResource() {
    const title = document.getElementById('resource-title').value;
    const description = document.getElementById('resource-description').value;
    const link = document.getElementById('resource-link').value;
    
    if (!title || !description || !link) {
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    const newResource = {
        id: Date.now(),
        title: title,
        description: description,
        link: link
    };
    
    resources.push(newResource);
    localStorage.setItem('resources', JSON.stringify(resources));
    
    // Clear form
    document.getElementById('resource-title').value = '';
    document.getElementById('resource-description').value = '';
    document.getElementById('resource-link').value = '';
    
    showNotification('Ресурс добавлен');
    closeModal('add-resource-modal');
    loadResourcesPage();
}

// Delete Resource Function
function deleteResource(resourceId) {
    if (!confirm('Вы уверены, что хотите удалить этот ресурс?')) return;
    
    const resourceIndex = resources.findIndex(r => r.id === resourceId);
    if (resourceIndex !== -1) {
        resources.splice(resourceIndex, 1);
        localStorage.setItem('resources', JSON.stringify(resources));
        showNotification('Ресурс удален');
        loadResourcesPage();
    }
}

// Facts rotation
function rotateFacts() {
    currentFactIndex = (currentFactIndex + 1) % chinaFacts.length;
    const factContainer = document.getElementById('fact-container');
    
    // Fade out
    factContainer.style.opacity = '0';
    factContainer.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        factContainer.innerHTML = `<p class="text-xl font-medium">${chinaFacts[currentFactIndex]}</p>`;
        
        // Fade in
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
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    // Check for admin
    if (username === 'admin' && password === 'admin123') {
        currentUser = { username: 'admin', role: 'admin', name: 'Администратор' };
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
        showNotification(`Добро пожаловать, ${user.name || user.username}!`);
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
    
    const newUser = { 
        username, 
        password, 
        role,
        name: username
    };
    
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
            <div class="flex items-center space-x-3">
                <span class="text-white">${currentUser.name || currentUser.username}</span>
                <button id="logout-btn" class="btn-secondary px-4 py-2 rounded-xl font-medium text-sm">
                    Выйти
                </button>
            </div>
        `;
        
        document.querySelector('#mobile-menu .pt-4').innerHTML = `
            <div class="pt-4 border-t border-blue-600 space-y-3">
                <div class="text-white text-center py-2">
                    ${currentUser.name || currentUser.username}
                </div>
                <button id="mobile-logout-btn" class="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-medium flex items-center justify-center">
                    <i data-feather="log-out" class="w-4 h-4 mr-2"></i>
                    Выйти
                </button>
            </div>
        `;
        
        feather.replace();
        
        document.getElementById('logout-btn').addEventListener('click', logout);
        document.getElementById('mobile-logout-btn').addEventListener('click', logout);
        
        // Show Q&A button
        document.getElementById('qa-button').classList.remove('hidden');
        
    } else {
        document.getElementById('auth-buttons').innerHTML = `
            <button id="register-btn" class="btn-secondary px-5 py-2.5 rounded-xl font-medium">
                Регистрация
            </button>
            <button id="login-btn" class="btn-primary px-5 py-2.5 rounded-xl font-medium">
                Войти
            </button>
        `;
        
        document.querySelector('#mobile-menu .pt-4').innerHTML = `
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
        
        // Hide Q&A button
        document.getElementById('qa-button').classList.add('hidden');
        
        feather.replace();
        setupAuthEvents();
    }
}

function logout() {
    currentUser = null;
    selectedClass = null;
    localStorage.removeItem('currentUser');
    showNotification('Вы успешно вышли из системы');
    updateAuthUI();
    
    // Reload current page
    const currentPage = document.querySelector('.page.active');
    if (currentPage) {
        const pageId = currentPage.id.replace('-page', '');
        showPage(pageId);
    }
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
    
    questions.forEach(q => {
        const questionElement = document.createElement('div');
        questionElement.className = 'qa-item enhanced-card p-5';
        questionElement.innerHTML = `
            <div class="qa-question flex items-start">
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
            <div class="qa-answer mt-3 flex items-start">
                <i data-feather="check-circle" class="w-5 h-5 text-green-500 mr-3 mt-0.5"></i>
                <div class="flex-1">
                    <span class="text-gray-800 font-medium">${q.answer}</span>
                    <p class="text-sm text-gray-600 mt-1">Ответ учителя</p>
                </div>
            </div>
            ` : `
            <div class="qa-answer mt-3 flex items-start">
                <i data-feather="clock" class="w-5 h-5 text-yellow-500 mr-3 mt-0.5"></i>
                <span class="text-gray-800 font-medium">Вопрос на рассмотрении учителя</span>
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

function deleteQuestion(questionId) {
    if (!confirm('Вы уверены, что хотите удалить этот вопрос?')) return;
    
    const questionIndex = questions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
        questions.splice(questionIndex, 1);
        localStorage.setItem('questions', JSON.stringify(questions));
        showNotification('Вопрос удален');
        loadQuestions();
    }
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
    
    // Classes events
    document.getElementById('add-student-btn').addEventListener('click', addStudent);
    
    // Lessons events
    document.getElementById('add-lesson-btn').addEventListener('click', addLesson);
    
    // Resources events
    document.getElementById('add-resource-btn').addEventListener('click', addResource);
    
    // Close modals on outside click
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('fixed') && event.target.id.includes('modal')) {
            closeModal(event.target.id);
        }
    });
    
    // Load initial data
    if (currentUser) {
        updateAuthUI();
    }
    
    // Initialize feather icons
    feather.replace();
    
    console.log('School 105 application initialized successfully!');
});
