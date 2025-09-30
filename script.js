// Initialize Feather Icons
feather.replace();

// Data storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let questions = JSON.parse(localStorage.getItem('questions')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

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
        
        // Close mobile menu
        document.getElementById('mobile-menu').classList.add('hidden');
        const menuIcon = document.querySelector('#mobile-menu-button i');
        menuIcon.setAttribute('data-feather', 'menu');
        feather.replace();
    }, 300);
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
        body.classList.remove('bg-blue-50');
        body.classList.add('bg-black');
        themeIcon.setAttribute('data-feather', 'sun');
        showNotification('Ночная тема включена');
    } else {
        body.setAttribute('data-theme', 'day');
        body.classList.remove('bg-black');
        body.classList.add('bg-blue-50');
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
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showNotification(`Добро пожаловать, ${user.username}!`);
        closeModal('auth-modal');
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        
        // Update UI for logged in user
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
    
    if (role === 'teacher') {
        showNotification('Ваша заявка на регистрацию как учитель отправлена администратору на подтверждение.');
    } else {
        showNotification('Регистрация выполнена успешно!');
    }
    
    closeModal('auth-modal');
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-password').value = '';
    document.getElementById('reg-confirm-password').value = '';
}

function forgotPassword() {
    showNotification('Функция восстановления пароля временно недоступна. Обратитесь к администратору.', 'error');
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
    }
}

function logout() {
    currentUser = null;
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
