// Initialize data
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
            id: 1,
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            name: 'Администратор',
            status: 'approved'
        });
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Initialize classes if empty
    if (classes.length === 0) {
        classes = [
            { id: '5A', name: '5А', students: [] },
            { id: '5B', name: '5Б', students: [] },
            { id: '6A', name: '6А', students: [] },
            { id: '6B', name: '6Б', students: [] }
        ];
        localStorage.setItem('classes', JSON.stringify(classes));
    }

    // Initialize lessons if empty
    if (lessons.length === 0) {
        lessons = [
            { 
                id: 1, 
                classId: '5A', 
                day: 'Понедельник', 
                time: '9:00', 
                subject: 'Китайский для начинающих',
                type: 'regular'
            }
        ];
        localStorage.setItem('lessons', JSON.stringify(lessons));
    }

    // Initialize resources if empty
    if (resources.length === 0) {
        resources = [
            { 
                id: 1, 
                title: 'Основы китайской грамматики', 
                description: 'Учебное пособие для начинающих', 
                link: '#',
                type: 'material'
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
let selectedClass = null;

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const notificationIcon = notification.querySelector('i');
    
    if (!notification || !notificationText) {
        console.error('Notification elements not found');
        return;
    }
    
    notificationText.textContent = message;
    
    // Remove all color classes
    notification.querySelector('.border-l-4').className = 'border-l-4';
    notificationIcon.className = 'w-6 h-6 mr-3';
    
    // Set icon and color based on type
    if (type === 'error') {
        notificationIcon.setAttribute('data-feather', 'alert-circle');
        notification.querySelector('.border-l-4').classList.add('border-red-500');
        notificationIcon.classList.add('text-red-500');
    } else if (type === 'warning') {
        notificationIcon.setAttribute('data-feather', 'alert-triangle');
        notification.querySelector('.border-l-4').classList.add('border-yellow-500');
        notificationIcon.classList.add('text-yellow-500');
    } else if (type === 'info') {
        notificationIcon.setAttribute('data-feather', 'info');
        notification.querySelector('.border-l-4').classList.add('border-blue-500');
        notificationIcon.classList.add('text-blue-500');
    } else {
        notificationIcon.setAttribute('data-feather', 'check-circle');
        notification.querySelector('.border-l-4').classList.add('border-green-500');
        notificationIcon.classList.add('text-green-500');
    }
    
    feather.replace();
    notification.classList.remove('hidden');
    notification.classList.add('show');
    
    setTimeout(() => {
        const transformElement = notification.querySelector('.transform');
        if (transformElement) {
            transformElement.classList.remove('translate-x-full');
        }
    }, 100);
    
    // Auto hide after 5 seconds
    setTimeout(hideNotification, 5000);
}

function hideNotification() {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    const transformElement = notification.querySelector('.transform');
    if (transformElement) {
        transformElement.classList.add('translate-x-full');
    }
    
    setTimeout(() => {
        notification.classList.add('hidden');
        notification.classList.remove('show');
    }, 500);
}

// Check if user has permission
function hasPermission(requiredRole = 'teacher') {
    if (!currentUser) return false;
    
    if (currentUser.role === 'admin') return true;
    if (requiredRole === 'teacher' && currentUser.role === 'teacher') return true;
    if (requiredRole === 'student' && currentUser.role === 'student') return true;
    
    return false;
}

// Page management
function showPage(pageId) {
    console.log('Showing page:', pageId);
    
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
    
    const navItems = document.querySelectorAll(`[data-page="${pageId}"]`);
    navItems.forEach(item => {
        item.classList.add('active');
    });
    
    // Load page-specific content
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
    
    // Close mobile menu
    document.getElementById('mobile-menu').classList.add('hidden');
    const menuIcon = document.querySelector('#mobile-menu-button i');
    if (menuIcon) {
        menuIcon.setAttribute('data-feather', 'menu');
        feather.replace();
    }
}

// Load Classes Page
function loadClassesPage() {
    const classesContainer = document.getElementById('classes-container');
    const addStudentSection = document.getElementById('add-student-section');
    const studentClassSelect = document.getElementById('student-class');
    
    if (!classesContainer) return;
    
    // Show/hide add student section based on user role
    if (hasPermission('teacher')) {
        addStudentSection.classList.remove('hidden');
        
        // Populate class select
        if (studentClassSelect) {
            studentClassSelect.innerHTML = '<option value="">Выберите класс</option>';
            classes.forEach(classItem => {
                const option = document.createElement('option');
                option.value = classItem.id;
                option.textContent = classItem.name;
                studentClassSelect.appendChild(option);
            });
        }
    } else {
        addStudentSection.classList.add('hidden');
    }
    
    // Clear container
    classesContainer.innerHTML = '';
    
    // Create class cards
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
                    <div class="text-sm text-gray-600 py-1 border-b border-gray-100 flex justify-between items-center">
                        <span>${student.name}</span>
                        ${hasPermission('teacher') ? `
                            <button onclick="removeStudent('${student.username}')" class="text-red-500 hover:text-red-700 text-xs">
                                <i data-feather="trash-2" class="w-3 h-3"></i>
                            </button>
                        ` : ''}
                    </div>
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
    const lessonsContainer = document.getElementById('lessons-container');
    const lessonClassSelect = document.getElementById('lesson-class');
    
    if (!lessonsContainer) return;
    
    // Show/hide class selector based on user role
    if (hasPermission('teacher')) {
        classSelector.classList.remove('hidden');
        
        // Populate class selector
        if (classSelectorButtons) {
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
        }
        
        // Populate lesson class select
        if (lessonClassSelect) {
            lessonClassSelect.innerHTML = '<option value="">Выберите класс</option>';
            classes.forEach(classItem => {
                const option = document.createElement('option');
                option.value = classItem.id;
                option.textContent = classItem.name;
                lessonClassSelect.appendChild(option);
            });
        }
    } else {
        if (classSelector) classSelector.classList.add('hidden');
    }
    
    // Show current class info for students
    if (currentUser && currentUser.role === 'student') {
        const student = students.find(s => s.username === currentUser.username);
        if (student && currentClassInfo) {
            selectedClass = student.class;
            currentClassInfo.classList.remove('hidden');
            document.getElementById('selected-class-name').textContent = 
                classes.find(c => c.id === student.class)?.name || student.class;
        }
    }
    
    loadLessonsForClass();
}

function selectClass(className) {
    selectedClass = className;
    
    const currentClassInfo = document.getElementById('current-class-info');
    if (currentClassInfo) {
        currentClassInfo.classList.remove('hidden');
        document.getElementById('selected-class-name').textContent = 
            classes.find(c => c.id === className)?.name || className;
    }
    
    loadLessonsForClass();
}

function loadLessonsForClass() {
    const lessonsContainer = document.getElementById('lessons-container');
    if (!lessonsContainer) return;
    
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
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center">
                        <i data-feather="clock" class="w-4 h-4 text-blue-500 mr-2"></i>
                        <span class="font-medium text-gray-800">${lesson.day}, ${lesson.time}</span>
                    </div>
                    ${hasPermission('teacher') ? `
                        <button onclick="deleteLesson(${lesson.id})" class="text-red-500 hover:text-red-700">
                            <i data-feather="trash-2" class="w-4 h-4"></i>
                        </button>
                    ` : ''}
                </div>
                <p class="text-gray-800 font-medium">${lesson.subject}</p>
                ${currentUser && hasPermission('teacher') ? 
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
    
    if (!resourcesContainer) return;
    
    // Show/hide add resource button based on user role
    if (addResourceButton) {
        if (hasPermission('teacher')) {
            addResourceButton.classList.remove('hidden');
        } else {
            addResourceButton.classList.add('hidden');
        }
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
                    ${hasPermission('teacher') ? `
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
    
    if (!additionalContainer) return;
    
    // Show/hide add button based on user role
    if (addAdditionalButton) {
        if (hasPermission('teacher')) {
            addAdditionalButton.classList.remove('hidden');
        } else {
            addAdditionalButton.classList.add('hidden');
        }
    }
    
    additionalContainer.innerHTML = '';
    
    const additionalLessons = lessons.filter(lesson => lesson.type === 'additional');
    
    if (additionalLessons.length === 0) {
        additionalContainer.innerHTML = `
            <div class="col-span-2 text-center py-8">
                <i data-feather="award" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                <p class="text-gray-600 font-medium">Дополнительные занятия пока не добавлены</p>
            </div>
        `;
    } else {
        additionalLessons.forEach(lesson => {
            const classItem = classes.find(c => c.id === lesson.classId);
            const lessonElement = document.createElement('div');
            lessonElement.className = 'enhanced-card p-6';
            lessonElement.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-xl font-bold text-blue-600">${lesson.subject}</h3>
                    ${hasPermission('teacher') ? `
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

// Add Student Function
function addStudent() {
    if (!hasPermission('teacher')) {
        showNotification('У вас нет прав для добавления учеников', 'error');
        return;
    }
    
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
        id: Date.now(),
        username: login,
        password: 'student123', // Default password
        role: 'student',
        name: name,
        status: 'approved'
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
    document.getElementById('student-class').value = '';
    
    showNotification(`Ученик ${name} добавлен в класс`);
    loadClassesPage();
}

function removeStudent(username) {
    if (!hasPermission('teacher')) {
        showNotification('У вас нет прав для удаления учеников', 'error');
        return;
    }
    
    if (!confirm('Вы уверены, что хотите удалить этого ученика?')) return;
    
    // Remove from students list
    const studentIndex = students.findIndex(s => s.username === username);
    if (studentIndex !== -1) {
        students.splice(studentIndex, 1);
        localStorage.setItem('students', JSON.stringify(students));
    }
    
    // Remove from users
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    showNotification('Ученик удален');
    loadClassesPage();
}

// Add Lesson Function
function addLesson() {
    if (!hasPermission('teacher')) {
        showNotification('У вас нет прав для добавления занятий', 'error');
        return;
    }
    
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
        subject: subject,
        type: 'regular'
    };
    
    lessons.push(newLesson);
    localStorage.setItem('lessons', JSON.stringify(lessons));
    
    // Clear form
    document.getElementById('lesson-time').value = '';
    document.getElementById('lesson-subject').value = '';
    document.getElementById('lesson-class').value = '';
    
    showNotification('Занятие добавлено');
    closeModal('add-lesson-modal');
    loadLessonsPage();
}

function deleteLesson(lessonId) {
    if (!hasPermission('teacher')) {
        showNotification('У вас нет прав для удаления занятий', 'error');
        return;
    }
    
    if (!confirm('Вы уверены, что хотите удалить это занятие?')) return;
    
    const lessonIndex = lessons.findIndex(l => l.id === lessonId);
    if (lessonIndex !== -1) {
        lessons.splice(lessonIndex, 1);
        localStorage.setItem('lessons', JSON.stringify(lessons));
        showNotification('Занятие удалено');
        loadLessonsPage();
    }
}

// Add Resource Function
function addResource() {
    if (!hasPermission('teacher')) {
        showNotification('У вас нет прав для добавления ресурсов', 'error');
        return;
    }
    
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
        link: link,
        type: 'material'
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

function deleteResource(resourceId) {
    if (!hasPermission('teacher')) {
        showNotification('У вас нет прав для удаления ресурсов', 'error');
        return;
    }
    
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
    
    if (!factContainer) return;
    
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
    
    if (!themeIcon) return;
    
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
function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            const menu = document.getElementById('mobile-menu');
            const menuIcon = document.querySelector('#mobile-menu-button i');
            
            if (menu && menuIcon) {
                menu.classList.toggle('hidden');
                
                if (menu.classList.contains('hidden')) {
                    menuIcon.setAttribute('data-feather', 'menu');
                } else {
                    menuIcon.setAttribute('data-feather', 'x');
                }
                feather.replace();
            }
        });
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const modalContent = modal.querySelector('.modal-content');
    modal.classList.remove('hidden');
    
    setTimeout(() => {
        if (modalContent) {
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }
    }, 50);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
    }
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Auth functions
function openAuthModal(type) {
    openModal('auth-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const modalTitle = document.getElementById('modal-title');
    
    if (!loginForm || !registerForm || !modalTitle) return;
    
    if (type === 'register') {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        modalTitle.textContent = 'Регистрация';
    } else {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        modalTitle.textContent = 'Вход в систему';
    }
}

function login() {
    const username = document.getElementById('login-username');
    const password = document.getElementById('login-password');
    
    if (!username || !password) {
        showNotification('Элементы формы не найдены', 'error');
        return;
    }
    
    const usernameValue = username.value.trim();
    const passwordValue = password.value.trim();
    
    if (!usernameValue || !passwordValue) {
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    console.log('Login attempt:', usernameValue);
    
    // Check for admin
    if (usernameValue === 'admin' && passwordValue === 'admin123') {
        currentUser = { 
            id: 1,
            username: 'admin', 
            role: 'admin', 
            name: 'Администратор',
            status: 'approved'
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showNotification('Добро пожаловать, Администратор!');
        closeModal('auth-modal');
        username.value = '';
        password.value = '';
        updateAuthUI();
        return;
    }
    
    const user = users.find(u => u.username === usernameValue && u.password === passwordValue);
    if (user) {
        if (user.status !== 'approved') {
            showNotification('Ваш аккаунт ожидает подтверждения администратора', 'warning');
            return;
        }
        
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showNotification(`Добро пожаловать, ${user.name || user.username}!`);
        closeModal('auth-modal');
        username.value = '';
        password.value = '';
        updateAuthUI();
    } else {
        showNotification('Неверный логин или пароль', 'error');
    }
}

function register() {
    const username = document.getElementById('reg-username');
    const password = document.getElementById('reg-password');
    const confirmPassword = document.getElementById('reg-confirm-password');
    const role = document.getElementById('reg-role');
    
    if (!username || !password || !confirmPassword || !role) {
        showNotification('Элементы формы не найдены', 'error');
        return;
    }
    
    const usernameValue = username.value.trim();
    const passwordValue = password.value.trim();
    const confirmPasswordValue = confirmPassword.value.trim();
    const roleValue = role.value;
    
    if (!usernameValue || !passwordValue || !confirmPasswordValue) {
        showNotification('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    if (passwordValue !== confirmPasswordValue) {
        showNotification('Пароли не совпадают', 'error');
        return;
    }
    
    if (users.find(u => u.username === usernameValue)) {
        showNotification('Пользователь с таким логином уже существует', 'error');
        return;
    }
    
    const newUser = { 
        id: Date.now(),
        username: usernameValue, 
        password: passwordValue, 
        role: roleValue,
        name: usernameValue,
        status: roleValue === 'teacher' ? 'pending' : 'approved'
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    if (roleValue === 'teacher') {
        showNotification('Заявка на регистрацию учителя отправлена администратору. Ожидайте подтверждения.', 'info');
    } else {
        showNotification('Регистрация выполнена успешно! Теперь вы можете войти.', 'success');
    }
    
    closeModal('auth-modal');
    username.value = '';
    password.value = '';
    confirmPassword.value = '';
    role.value = 'student';
}

function forgotPassword() {
    showNotification('Для восстановления пароля обратитесь к администратору школы.', 'info');
}

function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const mobileAuthSection = document.querySelector('#mobile-menu .pt-4');
    const qaButton = document.getElementById('qa-button');
    
    if (!authButtons) return;
    
    if (currentUser) {
        // User is logged in
        authButtons.innerHTML = `
            <div class="flex items-center space-x-3">
                <span class="text-white text-sm">${currentUser.name || currentUser.username}</span>
                <button onclick="logout()" class="btn-secondary px-4 py-2 rounded-xl font-medium text-sm">
                    Выйти
                </button>
            </div>
        `;
        
        if (mobileAuthSection) {
            mobileAuthSection.innerHTML = `
                <div class="pt-4 border-t border-blue-600 space-y-3">
                    <div class="text-white text-center py-2 text-sm">
                        ${currentUser.name || currentUser.username}
                    </div>
                    <button onclick="logout()" class="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-medium flex items-center justify-center">
                        <i data-feather="log-out" class="w-4 h-4 mr-2"></i>
                        Выйти
                    </button>
                </div>
            `;
        }
        
        // Show Q&A button for all logged in users
        if (qaButton) {
            qaButton.classList.remove('hidden');
        }
        
    } else {
        // User is not logged in
        authButtons.innerHTML = `
            <button id="register-btn" class="btn-secondary px-4 py-2 rounded-xl font-medium text-sm">
                Регистрация
            </button>
            <button id="login-btn" class="btn-primary px-4 py-2 rounded-xl font-medium text-sm">
                Войти
            </button>
        `;
        
        if (mobileAuthSection) {
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
        }
        
        // Hide Q&A button for anonymous users
        if (qaButton) {
            qaButton.classList.add('hidden');
        }
    }
    
    feather.replace();
    setupAuthEvents();
}

function logout() {
    currentUser = null;
    selectedClass = null;
    localStorage.removeItem('currentUser');
    showNotification('Вы успешно вышли из системы');
    updateAuthUI();
    
    // Return to main page
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
    if (!questionInput) return;
    
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
        userName: currentUser.name || currentUser.username,
        timestamp: new Date().toISOString()
    };
    
    questions.push(newQuestion);
    localStorage.setItem('questions', JSON.stringify(questions));
    
    loadQuestions();
    questionInput.value = '';
    showNotification('Ваш вопрос отправлен!');
}

function loadQuestions() {
    const qaList = document.getElementById('qa-list');
    if (!qaList) return;
    
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
    
    // Sort questions by timestamp (newest first)
    const sortedQuestions = questions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    sortedQuestions.forEach(q => {
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
    if (!hasPermission('teacher')) {
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
        question.answeredAt = new Date().toISOString();
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
    // Desktop buttons
    const registerBtn = document.getElementById('register-btn');
    const loginBtn = document.getElementById('login-btn');
    
    if (registerBtn) registerBtn.addEventListener('click', () => openAuthModal('register'));
    if (loginBtn) loginBtn.addEventListener('click', () => openAuthModal('login'));
    
    // Mobile buttons
    const mobileRegisterBtn = document.getElementById('mobile-register-btn');
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    
    if (mobileRegisterBtn) mobileRegisterBtn.addEventListener('click', () => openAuthModal('register'));
    if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', () => openAuthModal('login'));
    
    // Modal buttons
    const closeAuthModal = document.getElementById('close-auth-modal');
    const switchToRegister = document.getElementById('switch-to-register');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginSubmit = document.getElementById('login-submit');
    const registerSubmit = document.getElementById('register-submit');
    const forgotPassword = document.getElementById('forgot-password');
    
    if (closeAuthModal) closeAuthModal.addEventListener('click', () => closeModal('auth-modal'));
    if (switchToRegister) switchToRegister.addEventListener('click', () => openAuthModal('register'));
    if (switchToLogin) switchToLogin.addEventListener('click', () => openAuthModal('login'));
    if (loginSubmit) loginSubmit.addEventListener('click', login);
    if (registerSubmit) registerSubmit.addEventListener('click', register);
    if (forgotPassword) forgotPassword.addEventListener('click', forgotPassword);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing application...');
    
    // Initialize data
    initializeData();
    
    // Start facts rotation
    setInterval(rotateFacts, 5000);
    
    // Navigation
    document.querySelectorAll('[data-page]').forEach(button => {
        button.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });
    
    // Auth events
    setupAuthEvents();
    
    // Mobile menu
    setupMobileMenu();
    
    // Q&A events
    const qaButton = document.getElementById('qa-button');
    if (qaButton) {
        qaButton.addEventListener('click', openQAModal);
    }
    
    const closeQaModal = document.getElementById('close-qa-modal');
    if (closeQaModal) {
        closeQaModal.addEventListener('click', () => closeModal('qa-modal'));
    }
    
    const submitQuestionBtn = document.getElementById('submit-question');
    if (submitQuestionBtn) {
        submitQuestionBtn.addEventListener('click', submitQuestion);
    }
    
    // Close modals on outside click
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('fixed') && event.target.id.includes('modal')) {
            closeModal(event.target.id);
        }
    });
    
    // Load initial UI state
    updateAuthUI();
    
    // Initialize feather icons
    feather.replace();
    
    console.log('School 105 application initialized successfully!');
    console.log('Admin credentials: admin / admin123');
});
