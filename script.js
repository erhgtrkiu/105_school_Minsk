// ===============================
// script.js (полная версия с исправленными ссылками)
// ===============================

// Data management with proper synchronization
function getUsers() {
    return JSON.parse(localStorage.getItem('school-users')) || [];
}

function getQuestions() {
    return JSON.parse(localStorage.getItem('school-questions')) || [];
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('school-currentUser')) || null;
}

function getStudents() {
    return JSON.parse(localStorage.getItem('school-students')) || [];
}

function getClasses() {
    return JSON.parse(localStorage.getItem('school-classes')) || [];
}

function getLessons() {
    return JSON.parse(localStorage.getItem('school-lessons')) || [];
}

function getResources() {
    return JSON.parse(localStorage.getItem('school-resources')) || [];
}

function setUsers(users) {
    localStorage.setItem('school-users', JSON.stringify(users));
}

function setQuestions(questions) {
    localStorage.setItem('school-questions', JSON.stringify(questions));
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('school-currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('school-currentUser');
    }
}

function setStudents(students) {
    localStorage.setItem('school-students', JSON.stringify(students));
}

function setClasses(classes) {
    localStorage.setItem('school-classes', JSON.stringify(classes));
}

function setLessons(lessons) {
    localStorage.setItem('school-lessons', JSON.stringify(lessons));
}

function setResources(resources) {
    localStorage.setItem('school-resources', JSON.stringify(resources));
}

// Real-time synchronization system
function initializeSync() {
    // Listen for storage changes (other tabs)
    window.addEventListener('storage', function(e) {
        if (e.key && e.key.startsWith('school-')) {
            console.log('🔄 Data changed in another tab:', e.key);
            updateAuthUI();
            updateCurrentPage();
        }
    });
}

// Initialize default data
function initializeData() {
    try {
        let users = getUsers();
        let classes = getClasses();
        let lessons = getLessons();
        let resources = getResources();

        // Add default admin if not exists
        if (!users.find(u => u.username === 'admin')) {
            users.push({
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                name: 'Администратор'
            });
            setUsers(users);
        }

        // Initialize classes with proper structure
        if (classes.length === 0) {
            classes = [
                { id: '5A', name: '5А', grade: '5', letter: 'А', students: [] },
                { id: '5B', name: '5Б', grade: '5', letter: 'Б', students: [] },
                { id: '6A', name: '6А', grade: '6', letter: 'А', students: [] },
                { id: '6B', name: '6Б', grade: '6', letter: 'Б', students: [] }
            ];
            setClasses(classes);
        }

        // Initialize lessons
        if (lessons.length === 0) {
            lessons = [
                { id: 1, classId: '5A', day: 'Понедельник', time: '9:00', subject: 'Китайский для начинающих' },
                { id: 2, classId: '6A', day: 'Вторник', time: '10:00', subject: 'Разговорный китайский' }
            ];
            setLessons(lessons);
        }

        // Initialize resources with REAL Chinese learning links - ИСПРАВЛЕННЫЕ ССЫЛКИ
        if (resources.length === 0) {
            resources = [
                { 
                    id: 1, 
                    title: 'HelloChinese', 
                    description: 'Лучшее приложение для изучения китайского с нуля', 
                    link: 'https://www.hellochinese.cc/',
                    type: 'app'
                },
                { 
                    id: 2, 
                    title: 'Pleco', 
                    description: 'Словарь китайского языка с распознаванием иероглифов', 
                    link: 'https://www.pleco.com/',
                    type: 'app'
                },
                { 
                    id: 3, 
                    title: 'Chinese Grammar Wiki', 
                    description: 'Подробная грамматика китайского языка', 
                    link: 'https://resources.allsetlearning.com/chinese/grammar/',
                    type: 'website'
                },
                { 
                    id: 4, 
                    title: 'YouTube: Mandarin Corner', 
                    description: 'Бесплатные уроки китайского на YouTube', 
                    link: 'https://www.youtube.com/c/MandarinCorner',
                    type: 'video'
                },
                { 
                    id: 5, 
                    title: 'HSK Online', 
                    description: 'Подготовка к экзамену HSK', 
                    link: 'https://www.hskonline.com/',
                    type: 'website'
                },
                { 
                    id: 6, 
                    title: 'Arch Chinese', 
                    description: 'Интерактивное изучение иероглифов', 
                    link: 'https://www.archchinese.com/',
                    type: 'website'
                },
                { 
                    id: 7, 
                    title: 'Duolingo Китайский', 
                    description: 'Бесплатное приложение для изучения основ', 
                    link: 'https://www.duolingo.com/course/zh/en/learn-chinese',
                    type: 'app'
                },
                { 
                    id: 8, 
                    title: 'ChineseForums', 
                    description: 'Форум для изучающих китайский язык', 
                    link: 'https://www.chinese-forums.com/',
                    type: 'website'
                },
                { 
                    id: 9, 
                    title: 'Skritter', 
                    description: 'Приложение для изучения написания иероглифов', 
                    link: 'https://skritter.com/',
                    type: 'app'
                },
                { 
                    id: 10, 
                    title: 'YouTube: Yoyo Chinese', 
                    description: 'Канал с уроками китайского для всех уровней', 
                    link: 'https://www.youtube.com/c/YoyoChinese',
                    type: 'video'
                },
                { 
                    id: 11, 
                    title: 'TutorMandarin', 
                    description: 'Платформа для занятий с репетиторами', 
                    link: 'https://www.tutormandarin.net/',
                    type: 'website'
                },
                { 
                    id: 12, 
                    title: 'Memrise Китайский', 
                    description: 'Приложение для запоминания слов и фраз', 
                    link: 'https://www.memrise.com/courses/english/chinese/',
                    type: 'app'
                }
            ];
            setResources(resources);
        }
        
    } catch (error) {
        console.error('Error initializing data:', error);
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

// Notification system - ИСПРАВЛЕННАЯ ВЕРСИЯ
function showNotification(message, type = 'success') {
    try {
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notification-text');
        
        if (!notification || !notificationText) {
            console.warn('Notification elements not found, using fallback');
            // Fallback для критически важных уведомлений
            if (type === 'error') {
                alert(`Ошибка: ${message}`);
            }
            return;
        }
        
        notificationText.textContent = message;
        
        // Обновляем стили в зависимости от типа
        const border = notification.querySelector('.border-l-4');
        const icon = notification.querySelector('i');
        
        // Сбрасываем стили
        if (border) {
            border.className = 'border-l-4';
            
            switch(type) {
                case 'error':
                    border.classList.add('border-red-500');
                    if (icon) {
                        icon.setAttribute('data-feather', 'alert-circle');
                        icon.className = 'w-6 h-6 text-red-500 mr-3';
                    }
                    break;
                case 'warning':
                    border.classList.add('border-yellow-500');
                    if (icon) {
                        icon.setAttribute('data-feather', 'alert-triangle');
                        icon.className = 'w-6 h-6 text-yellow-500 mr-3';
                    }
                    break;
                case 'info':
                    border.classList.add('border-blue-500');
                    if (icon) {
                        icon.setAttribute('data-feather', 'info');
                        icon.className = 'w-6 h-6 text-blue-500 mr-3';
                    }
                    break;
                default: // success
                    border.classList.add('border-green-500');
                    if (icon) {
                        icon.setAttribute('data-feather', 'check-circle');
                        icon.className = 'w-6 h-6 text-green-500 mr-3';
                    }
            }
        }
        
        // Обновляем иконки feather
        feather.replace();
        
        // Показываем уведомление
        notification.classList.remove('hidden');
        
        // Анимация появления
        setTimeout(() => {
            const transformElement = notification.querySelector('.transform');
            if (transformElement) {
                transformElement.classList.remove('translate-x-full');
            }
        }, 100);
        
        // Автоматическое скрытие через 5 секунд
        setTimeout(hideNotification, 5000);
        
    } catch (error) {
        console.error('Error in showNotification:', error);
        // Fallback для самых критичных случаев
        if (type === 'error') {
            alert(message);
        }
    }
}

function hideNotification() {
    try {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
        const transformElement = notification.querySelector('.transform');
        if (transformElement) {
            transformElement.classList.add('translate-x-full');
        }
        
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 500);
    } catch (error) {
        console.error('Error in hideNotification:', error);
    }
}

// Check if user has permission to edit
function hasPermission() {
    const currentUser = getCurrentUser();
    return currentUser !== null && (currentUser.role === 'teacher' || currentUser.role === 'admin');
}

// Check if user is admin
function isAdmin() {
    const currentUser = getCurrentUser();
    return currentUser !== null && currentUser.role === 'admin';
}

// Update current page content
function updateCurrentPage() {
    const activePage = document.querySelector('.page.active');
    if (activePage) {
        const pageId = activePage.id.replace('-page', '');
        loadPageContent(pageId);
    }
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
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) mobileMenu.classList.add('hidden');
        const menuIcon = document.querySelector('#mobile-menu-button i');
        if (menuIcon) {
            menuIcon.setAttribute('data-feather', 'menu');
            feather.replace();
        }
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
        default:
            break;
    }
}

// Load Teachers Page
function loadTeachersPage() {
    const teachersContainer = document.getElementById('teachers-container');
    const addTeacherBtn = document.getElementById('add-teacher-btn');
    
    if (!teachersContainer) return;
    
    const users = getUsers();
    
    // Show/hide add teacher button for admin
    if (addTeacherBtn) {
        if (isAdmin()) {
            addTeacherBtn.classList.remove('hidden');
        } else {
            addTeacherBtn.classList.add('hidden');
        }
    }
    
    // Get all teachers
    const teachers = users.filter(user => user.role === 'teacher');
    
    teachersContainer.innerHTML = '';
    
    if (teachers.length === 0) {
        teachersContainer.innerHTML = `
            <div class="col-span-3 text-center py-12">
                <i data-feather="users" class="w-16 h-16 text-gray-400 mx-auto mb-4"></i>
                <p class="text-gray-600 font-medium text-lg mb-2">Учителя пока не добавлены</p>
                ${isAdmin() ? `
                    <p class="text-gray-500 text-sm">Нажмите кнопку "Добавить учителя" выше</p>
                ` : `
                    <p class="text-gray-500 text-sm">Обратитесь к администратору для добавления учителей</p>
                `}
            </div>
        `;
    } else {
        teachers.forEach(teacher => {
            const teacherElement = document.createElement('div');
            teacherElement.className = 'bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 text-center transform hover:scale-105 transition-all duration-300';
            teacherElement.style.animation = 'fadeIn 0.6s ease-out';
            teacherElement.innerHTML = `
                <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-inner">
                    <i data-feather="user" class="w-10 h-10 sm:w-12 sm:h-12 text-blue-600"></i>
                </div>
                <h3 class="text-lg sm:text-xl font-bold text-blue-600 mb-2">${teacher.name}</h3>
                <div class="flex items-center justify-center mb-3">
                    <i data-feather="award" class="w-4 h-4 text-yellow-500 mr-2"></i>
                    <p class="text-gray-700 font-medium text-sm sm:text-base">Учитель китайского языка</p>
                </div>
                <div class="bg-gray-50 p-2 sm:p-3 rounded-lg mb-3">
                    <p class="text-gray-600 text-xs sm:text-sm font-mono">Логин: ${teacher.username}</p>
                </div>
                ${isAdmin() ? `
                    <button onclick="deleteTeacher('${teacher.username}')" class="bg-red-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-red-700 transition-all duration-300 flex items-center justify-center mx-auto text-sm">
                        <i data-feather="trash-2" class="w-3 h-3 sm:w-4 sm:h-4 mr-2"></i>
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
        showNotification('❌ Только администратор может добавлять учителей', 'error');
        return;
    }
    
    const name = document.getElementById('teacher-name').value;
    const login = document.getElementById('teacher-login').value;
    const password = document.getElementById('teacher-password').value;
    
    if (!name || !login || !password) {
        showNotification('❌ Заполните все поля', 'error');
        return;
    }
    
    const users = getUsers();
    
    if (users.find(u => u.username === login)) {
        showNotification('❌ Пользователь с таким логином уже существует', 'error');
        return;
    }
    
    const newTeacher = {
        username: login,
        password: password,
        role: 'teacher',
        name: name
    };
    
    users.push(newTeacher);
    setUsers(users);
    
    // Clear form
    document.getElementById('teacher-name').value = '';
    document.getElementById('teacher-login').value = '';
    document.getElementById('teacher-password').value = '';
    
    showNotification(`🎉 Учитель ${name} добавлен!`, 'success');
    closeModal('add-teacher-modal');
    
    // Update UI
    loadTeachersPage();
}

// Delete Teacher Function
function deleteTeacher(username) {
    if (!isAdmin()) {
        showNotification('❌ Только администратор может удалять учителей', 'error');
        return;
    }
    
    if (!confirm('Вы уверены, что хотите удалить этого учителя?')) return;
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
        setUsers(users);
        showNotification('🗑️ Учитель удален', 'success');
        loadTeachersPage();
    }
}

// Load Classes Page
function loadClassesPage() {
    const classesContainer = document.getElementById('classes-container');
    const addStudentSection = document.getElementById('add-student-section');
    const studentClassSelect = document.getElementById('student-class');
    const addClassBtn = document.getElementById('add-class-btn');
    
    if (!classesContainer) return;
    
    const classes = getClasses();
    const students = getStudents();
    
    // Show/hide add class button for admin
    if (addClassBtn) {
        if (isAdmin()) {
            addClassBtn.classList.remove('hidden');
        } else {
            addClassBtn.classList.add('hidden');
        }
    }
    
    // Show/hide add student section based on permissions
    if (addStudentSection) {
        if (hasPermission()) {
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
    }
    
    // Render classes
    classesContainer.innerHTML = '';
    
    if (classes.length === 0) {
        classesContainer.innerHTML = `
            <div class="col-span-4 text-center py-12">
                <i data-feather="layers" class="w-16 h-16 text-gray-400 mx-auto mb-4"></i>
                <p class="text-gray-600 font-medium text-lg mb-2">Классы пока не добавлены</p>
                ${isAdmin() ? `
                    <p class="text-gray-500 text-sm">Нажмите кнопку "Добавить класс" выше</p>
                ` : `
                    <p class="text-gray-500 text-sm">Обратитесь к администратору для добавления классов</p>
                `}
            </div>
        `;
    } else {
        // Sort classes by grade and letter (convert grade to number if needed)
        const sortedClasses = [...classes].sort((a, b) => {
            const ag = parseInt(a.grade, 10);
            const bg = parseInt(b.grade, 10);
            if (ag !== bg) return ag - bg;
            return a.letter.localeCompare(b.letter, 'ru');
        });
        
        sortedClasses.forEach(classItem => {
            const classStudents = students.filter(student => student.class === classItem.id);
            
            const classCard = document.createElement('div');
            classCard.className = 'bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 text-center class-card';
            classCard.style.animation = 'fadeIn 0.6s ease-out';
            classCard.innerHTML = `
                <div class="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                    <i data-feather="users" class="w-6 h-6 sm:w-8 sm:h-8 text-blue-600"></i>
                </div>
                <h3 class="text-lg sm:text-xl font-bold text-blue-600 mb-2">${classItem.name} класс</h3>
                <p class="text-gray-700 font-medium mb-3 text-sm sm:text-base">${classStudents.length} учеников</p>
                <div class="max-h-24 sm:max-h-32 overflow-y-auto text-xs sm:text-sm">
                    ${classStudents.map(student => `
                        <div class="text-gray-600 py-1 border-b border-gray-100">${student.name}</div>
                    `).join('')}
                    ${classStudents.length === 0 ? '<p class="text-gray-500 py-2">Нет учеников</p>' : ''}
                </div>
                ${isAdmin() ? `
                    <button onclick="deleteClass('${classItem.id}')" class="mt-3 bg-red-600 text-white px-3 py-1 rounded-lg text-xs sm:text-sm hover:bg-red-700 transition-all duration-300">
                        Удалить класс
                    </button>
                ` : ''}
            `;
            classesContainer.appendChild(classCard);
        });
    }
    
    feather.replace();
}

// Add Class Function (fixed to update UI immediately)
function addClass() {
    if (!isAdmin()) {
        showNotification('❌ Только администратор может добавлять классы', 'error');
        return;
    }
    
    const grade = document.getElementById('class-grade').value;
    const letter = document.getElementById('class-letter').value;
    
    if (!grade || !letter) {
        showNotification('❌ Выберите класс и букву', 'error');
        return;
    }
    
    const classId = grade + letter;
    const className = grade + ' ' + letter;
    
    const classes = getClasses();
    
    // Check if class already exists
    if (classes.find(c => c.id === classId)) {
        showNotification('❌ Такой класс уже существует', 'error');
        return;
    }
    
    const newClass = {
        id: classId,
        name: className,
        grade: grade,
        letter: letter,
        students: []
    };
    
    classes.push(newClass);
    setClasses(classes);
    
    showNotification(`🎉 Класс ${className} добавлен!`, 'success');
    closeModal('add-class-modal');
    
    // Update UI immediately
    updateAuthUI();
    updateCurrentPage();
}

// Delete Class Function
function deleteClass(classId) {
    if (!isAdmin()) {
        showNotification('❌ Только администратор может удалять классы', 'error');
        return;
    }
    
    let classes = getClasses();
    let students = getStudents();
    
    const classItem = classes.find(c => c.id === classId);
    if (!classItem) return;
    
    if (!confirm(`Вы уверены, что хотите удалить класс ${classItem.name}? Все ученики этого класса также будут удалены.`)) return;
    
    // Remove class
    const classIndex = classes.findIndex(c => c.id === classId);
    if (classIndex !== -1) {
        classes.splice(classIndex, 1);
        setClasses(classes);
    }
    
    // Remove students from this class
    students = students.filter(student => student.class !== classId);
    setStudents(students);
    
    showNotification(`🗑️ Класс ${classItem.name} удален`, 'success');
    
    // Update UI
    loadClassesPage();
}

// Load Lessons Page
function loadLessonsPage() {
    const lessonsContainer = document.getElementById('lessons-container');
    if (!lessonsContainer) return;
    
    const lessons = getLessons();
    const classes = getClasses();
    
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
            lessonElement.className = 'bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-100 lesson-card';
            lessonElement.style.animation = `fadeIn 0.6s ease-out ${index * 0.1}s both`;
            lessonElement.innerHTML = `
                <div class="flex items-center mb-2">
                    <i data-feather="clock" class="w-4 h-4 text-blue-500 mr-2"></i>
                    <span class="font-medium text-gray-800 text-sm sm:text-base">${lesson.day}, ${lesson.time}</span>
                </div>
                <p class="text-gray-800 font-medium text-sm sm:text-base">${lesson.subject}</p>
                <p class="text-xs sm:text-sm text-gray-600 mt-1">${classItem?.name || lesson.classId} класс</p>
            `;
            lessonsContainer.appendChild(lessonElement);
        });
    }
    
    feather.replace();
}

// Load Resources Page
function loadResourcesPage() {
    const resourcesContainer = document.getElementById('resources-container');
    if (!resourcesContainer) return;
    
    const resources = getResources();
    
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
            resourceElement.className = 'bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 resource-card';
            resourceElement.style.animation = `slideUp 0.6s ease-out ${index * 0.1}s both`;
            
            let typeIcon = 'external-link';
            let typeColor = 'blue';
            if (resource.type === 'app') {
                typeIcon = 'smartphone';
                typeColor = 'green';
            } else if (resource.type === 'video') {
                typeIcon = 'video';
                typeColor = 'red';
            } else if (resource.type === 'website') {
                typeIcon = 'globe';
                typeColor = 'blue';
            }
            
            resourceElement.innerHTML = `
                <div class="flex items-start mb-3">
                    <div class="bg-${typeColor}-100 p-2 rounded-lg mr-3">
                        <i data-feather="${typeIcon}" class="w-5 h-5 text-${typeColor}-600"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg sm:text-xl font-bold text-blue-600 mb-1">${resource.title}</h3>
                        <p class="text-gray-700 text-sm sm:text-base mb-3">${resource.description}</p>
                    </div>
                </div>
                <a href="${resource.link}" target="_blank" rel="noopener noreferrer" class="bg-blue-600 text-white inline-flex items-center px-4 py-2 rounded-xl text-sm hover:bg-blue-700 transition-all duration-300 w-full justify-center">
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
        showNotification('❌ У вас нет прав для добавления учеников. Только учителя и администраторы могут добавлять учеников.', 'error');
        return;
    }
    
    const name = document.getElementById('student-name').value;
    const studentClass = document.getElementById('student-class').value;
    const login = document.getElementById('student-login').value;
    
    if (!name || !studentClass || !login) {
        showNotification('❌ Заполните все поля', 'error');
        return;
    }
    
    const users = getUsers();
    
    if (users.find(u => u.username === login)) {
        showNotification('❌ Пользователь с таким логином уже существует', 'error');
        return;
    }
    
    // Create user account for student
    const studentUser = {
        username: login,
        password: 'student123', // простой пароль по умолчанию
        role: 'student',
        name: name
    };
    
    users.push(studentUser);
    setUsers(users);
    
    // Add student to students list
    const students = getStudents();
    const newStudent = {
        name: name,
        class: studentClass,
        username: login
    };
    
    students.push(newStudent);
    setStudents(students);
    
    // Clear form
    document.getElementById('student-name').value = '';
    document.getElementById('student-login').value = '';
    
    showNotification(`🎉 Ученик ${name} успешно добавлен в класс! Пароль: student123`, 'success');
    
    // Update UI
    loadClassesPage();
}

// Facts rotation
function rotateFacts() {
    currentFactIndex = (currentFactIndex + 1) % chinaFacts.length;
    const factContainer = document.getElementById('fact-container');
    
    factContainer.style.opacity = '0';
    factContainer.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        factContainer.innerHTML = `<p class="text-lg sm:text-xl font-medium">${chinaFacts[currentFactIndex]}</p>`;
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
        showNotification('🌙 Ночная тема включена', 'success');
    } else {
        body.setAttribute('data-theme', 'day');
        body.className = 'bg-white text-gray-900 transition-all duration-500';
        themeIcon.setAttribute('data-feather', 'moon');
        showNotification('☀️ Дневная тема включена', 'success');
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
    if (!modal) return;
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Clear auth forms
function clearAuthForms() {
    const e = (id) => { const el = document.getElementById(id); if (el) el.value = ''; };
    e('login-username'); e('login-password'); e('reg-username'); e('reg-password'); e('reg-confirm-password');
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
    
    // Очищаем поля при открытии модального окна
    clearAuthForms();
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showNotification('❌ Заполните все поля', 'error');
        return;
    }
    
    // Check for admin
    if (username === 'admin' && password === 'admin123') {
        setCurrentUser({ username: 'admin', role: 'admin', name: 'Администратор' });
        showNotification('🎉 Добро пожаловать, Администратор! Теперь у вас есть полный доступ к системе', 'success');
        closeModal('auth-modal');
        
        // Update UI immediately
        updateAuthUI();
        showPage('teachers');
        return;
    }
    
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        setCurrentUser(user);
        
        let welcomeMessage = `🎉 Добро пожаловать, ${user.name || user.username}!`;
        if (user.role === 'teacher') {
            welcomeMessage += ' Теперь вы можете отвечать на вопросы учеников';
        } else if (user.role === 'student') {
            welcomeMessage += ' Теперь вы можете задавать вопросы учителям';
        }
        
        showNotification(welcomeMessage, 'success');
        closeModal('auth-modal');
        
        // Update UI immediately
        updateAuthUI();
        if (user.role === 'teacher' || user.role === 'admin') {
            showPage('teachers');
        } else {
            showPage('main');
        }
    } else {
        showNotification('❌ Неверный логин или пароль', 'error');
    }
}

// 🔥 Исправленный register() — теперь логинит автоматически и обновляет страницы
function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const role = document.getElementById('reg-role').value;
    
    if (!username || !password || !confirmPassword) {
        showNotification('❌ Заполните все поля', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('❌ Пароли не совпадают', 'error');
        return;
    }
    
    const users = getUsers();
    
    if (users.find(u => u.username === username)) {
        showNotification('❌ Пользователь с таким логином уже существует', 'error');
        return;
    }
    
    const newUser = { 
        username: username, 
        password: password, 
        role: role,
        name: username
    };
    
    users.push(newUser);
    setUsers(users);
    
    // Auto login after registration
    setCurrentUser(newUser);
    
    let successMessage = '🎉 Регистрация выполнена успешно! ';
    if (role === 'teacher') {
        successMessage += 'Теперь вы можете отвечать на вопросы учеников';
    } else {
        successMessage += 'Теперь вы можете задавать вопросы учителям';
    }
    
    showNotification(successMessage, 'success');
    
    closeModal('auth-modal');
    
    // Очищаем поля формы
    const regFields = ['reg-username','reg-password','reg-confirm-password'];
    regFields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    
    // Update UI immediately
    updateAuthUI();
    updateCurrentPage(); // <-- ВАЖНО: обновляем текущую страницу, чтобы новые элементы появились без перезагрузки
    if (role === 'teacher' || role === 'admin') {
        showPage('teachers');
    } else {
        showPage('main');
    }
}

function forgotPassword() {
    showNotification('🔐 Для восстановления пароля обратитесь к администратору школы.', 'info');
}

function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const mobileAuthSection = document.getElementById('mobile-auth-section');
    const qaButton = document.getElementById('qa-button');
    const addTeacherBtn = document.getElementById('add-teacher-btn');
    const addStudentSection = document.getElementById('add-student-section');
    const addClassBtn = document.getElementById('add-class-btn');
    
    if (!authButtons) return;
    
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        // User is logged in
        authButtons.innerHTML = `
            <div class="flex items-center space-x-2 sm:space-x-3 bg-green-500/20 p-2 rounded-xl border border-green-500/30">
                <i data-feather="user-check" class="w-4 h-4 sm:w-5 sm:h-5 text-green-400"></i>
                <span class="text-white font-semibold text-sm sm:text-base">${currentUser.name || currentUser.username}</span>
                <div class="h-4 sm:h-6 w-px bg-white/30"></div>
                <span class="text-green-300 text-xs sm:text-sm px-2 py-1 bg-green-500/20 rounded-lg">
                    ${currentUser.role === 'admin' ? '👑 Админ' : 
                      currentUser.role === 'teacher' ? '👨‍🏫 Учитель' : '🎒 Ученик'}
                </span>
                <button onclick="logout()" class="bg-red-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-lg text-xs sm:text-sm hover:bg-red-700 transition-all duration-300 flex items-center">
                    <i data-feather="log-out" class="w-3 h-3 sm:w-4 sm:h-4 mr-1"></i>
                    Выйти
                </button>
            </div>
        `;
        
        if (mobileAuthSection) {
            mobileAuthSection.innerHTML = `
                <div class="pt-4 border-t border-blue-600 space-y-3">
                    <div class="text-center p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                        <div class="text-green-300 font-semibold">${currentUser.name || currentUser.username}</div>
                        <div class="text-green-400 text-sm mt-1">
                            ${currentUser.role === 'admin' ? '👑 Администратор' : 
                              currentUser.role === 'teacher' ? '👨‍🏫 Учитель' : '🎒 Ученик'}
                        </div>
                    </div>
                    <button onclick="logout()" class="w-full px-4 py-3 bg-red-600 text-white rounded-xl font-medium flex items-center justify-center transition-all duration-300 hover:bg-red-700">
                        <i data-feather="log-out" class="w-4 h-4 mr-2"></i>
                        Выйти из системы
                    </button>
                </div>
            `;
        }
        
        // Show Q&A button for all logged in users
        if (qaButton) {
            qaButton.classList.remove('hidden');
            qaButton.innerHTML = `<i data-feather="message-circle" class="w-4 h-4 sm:w-5 sm:h-5"></i>`;
            qaButton.title = "Задать вопрос учителю";
        }
        
        // Update permissions for admin/teacher features
        if (addTeacherBtn) {
            if (isAdmin()) {
                addTeacherBtn.classList.remove('hidden');
            } else {
                addTeacherBtn.classList.add('hidden');
            }
        }
        
        if (addClassBtn) {
            if (isAdmin()) {
                addClassBtn.classList.remove('hidden');
            } else {
                addClassBtn.classList.add('hidden');
            }
        }
        
        if (addStudentSection) {
            if (hasPermission()) {
                addStudentSection.classList.remove('hidden');
            } else {
                addStudentSection.classList.add('hidden');
            }
        }
        
    } else {
        // User is not logged in
        authButtons.innerHTML = `
            <div class="flex items-center space-x-2 sm:space-x-3">
                <button onclick="openAuthModal('register')" class="bg-red-600 text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl font-medium hover:bg-red-700 transition-all duration-300 flex items-center text-xs sm:text-base">
                    <i data-feather="user-plus" class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"></i>
                    Регистрация
                </button>
                <button onclick="openAuthModal('login')" class="bg-blue-700 text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl font-medium hover:bg-blue-800 transition-all duration-300 flex items-center text-xs sm:text-base">
                    <i data-feather="log-in" class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"></i>
                    Войти
                </button>
            </div>
        `;
        
        if (mobileAuthSection) {
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
        }
        
        // Hide Q&A button for anonymous users
        if (qaButton) qaButton.classList.add('hidden');
        if (addTeacherBtn) addTeacherBtn.classList.add('hidden');
        if (addClassBtn) addClassBtn.classList.add('hidden');
        if (addStudentSection) addStudentSection.classList.add('hidden');
    }
    
    feather.replace();
    // Важно: после обновления auth UI — обновим содержимое текущей страницы (например, если появился add-button)
    updateCurrentPage();
}

function logout() {
    setCurrentUser(null);
    showNotification('🔒 Вы успешно вышли из системы. Чтобы снова войти, нажмите кнопку "Войти"', 'info');
    
    // Update UI immediately
    updateAuthUI();
    showPage('main');
}

// Q&A functions
function openQAModal() {
    if (!getCurrentUser()) {
        showNotification('🔒 Для доступа к вопросам и ответам необходимо войти в систему', 'warning');
        openAuthModal('login');
        return;
    }
    
    openModal('qa-modal');
    loadQuestions();
}

function submitQuestion() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showNotification('🔒 Для отправки вопроса необходимо войти в систему', 'warning');
        return;
    }
    
    const questionInput = document.getElementById('question-input');
    const question = questionInput.value.trim();
    
    if (!question) {
        showNotification('❌ Пожалуйста, введите вопрос', 'error');
        return;
    }
    
    const questions = getQuestions();
    const newQuestion = {
        id: Date.now(),
        question: question,
        answer: null,
        date: new Date().toLocaleDateString('ru-RU'),
        user: currentUser.username,
        userName: currentUser.name || currentUser.username
    };
    
    questions.push(newQuestion);
    setQuestions(questions);
    
    questionInput.value = '';
    showNotification('✅ Ваш вопрос отправлен учителям!', 'success');
    loadQuestions();
}

function loadQuestions() {
    const qaList = document.getElementById('qa-list');
    if (!qaList) return;
    
    const questions = getQuestions();
    const currentUser = getCurrentUser();
    
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
    
    let questionsToShow;
    if (hasPermission()) {
        questionsToShow = questions.slice().reverse();
    } else {
        questionsToShow = questions
            .filter(q => q.user === currentUser.username)
            .reverse();
    }
    
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
        questionElement.className = 'bg-white p-4 sm:p-5 rounded-2xl shadow-lg border border-gray-200 mb-4';
        questionElement.style.animation = `fadeIn 0.6s ease-out ${index * 0.1}s both`;
        
        let answerSection = '';
        if (q.answer) {
            answerSection = `
                <div class="flex items-start bg-green-50 p-3 rounded-lg mt-3">
                    <i data-feather="check-circle" class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-3 mt-0.5"></i>
                    <div class="flex-1">
                        <span class="text-gray-800 font-medium text-sm sm:text-base">${q.answer}</span>
                        <p class="text-xs sm:text-sm text-gray-600 mt-1">Ответ учителя</p>
                    </div>
                </div>
            `;
        } else if (hasPermission()) {
            answerSection = `
                <div class="mt-3">
                    <textarea id="answer-${q.id}" placeholder="Введите ответ." class="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm resize-none h-16 sm:h-20"></textarea>
                    <button onclick="submitAnswer(${q.id})" class="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs sm:text-sm mt-1 hover:bg-blue-700 transition-all duration-300">
                        Ответить
                    </button>
                </div>
            `;
        } else {
            answerSection = `
                <div class="flex items-start bg-yellow-50 p-3 rounded-lg mt-3">
                    <i data-feather="clock" class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 mr-3 mt-0.5"></i>
                    <span class="text-gray-800 font-medium text-sm sm:text-base">Вопрос на рассмотрении учителя</span>
                </div>
            `;
        }
        
        questionElement.innerHTML = `
            <div class="flex items-start">
                <div class="mr-3">
                    <i data-feather="user" class="w-6 h-6 text-gray-500"></i>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="text-gray-800 font-semibold">${q.userName}</div>
                            <div class="text-xs text-gray-500">${q.date}</div>
                        </div>
                    </div>
                    <div class="mt-3">
                        <p class="text-gray-700">${q.question}</p>
                        ${answerSection}
                    </div>
                </div>
            </div>
        `;
        
        qaList.appendChild(questionElement);
    });
    
    feather.replace();
}

function submitAnswer(id) {
    if (!hasPermission()) return;
    const el = document.getElementById(`answer-${id}`);
    if (!el) return;
    const answer = el.value.trim();
    if (!answer) {
        showNotification('❌ Введите ответ', 'error');
        return;
    }
    const questions = getQuestions();
    const qIndex = questions.findIndex(q => q.id === id);
    if (qIndex !== -1) {
        questions[qIndex].answer = answer;
        setQuestions(questions);
        showNotification('✅ Ответ отправлен', 'success');
        loadQuestions();
    }
}

// Initialize rotate facts loop & other setup
function startUI() {
    initializeData();
    initializeSync();
    rotateFacts();
    setInterval(rotateFacts, 8000);
    setupMobileMenu();
    feather.replace();
    updateAuthUI();
    updateCurrentPage();
}

// On DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    // Attach handlers where needed
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    // Nav items
    document.querySelectorAll('[data-page]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = btn.getAttribute('data-page');
            if (!page) return;
            showPage(page);
        });
    });

    // QA button
    const qaBtn = document.getElementById('qa-button');
    if (qaBtn) qaBtn.addEventListener('click', openQAModal);

    // initial start
    startUI();
});
