// Initialize Feather Icons
feather.replace();

// Data storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let questions = JSON.parse(localStorage.getItem('questions')) || [];

// School facts about China
const chinaFacts = [
    "Китай - самая населённая страна в мире с более чем 1.4 миллиарда жителей",
    "Китайский язык является одним из шести официальных языков ООН",
    "В китайском языке более 50,000 иероглифов, но для чтения газет достаточно знать 3,000",
    "Великая Китайская стена - самое длинное сооружение, построенное человеком",
    "Китай является родиной многих изобретений: бумаги, пороха, компаса и книгопечатания"
];

let currentFactIndex = 0;
const factContainer = document.getElementById('fact-container');
const factDots = document.querySelectorAll('.fact-dot');

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
        targetPage.classList.add('active');
        targetPage.classList.remove('hidden');
    }
    
    // Update active nav item
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
}

// Facts rotation
function rotateFacts() {
    currentFactIndex = (currentFactIndex + 1) % chinaFacts.length;
    
    factContainer.classList.add('opacity-0');
    
    setTimeout(() => {
        factContainer.innerHTML = `<p class="text-xl">${chinaFacts[currentFactIndex]}</p>`;
        factContainer.classList.remove('opacity-0');
        
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
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    
    if (body.getAttribute('data-theme') === 'day') {
        body.setAttribute('data-theme', 'night');
        header.classList.remove('header-glow');
        header.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)';
        footer.style.background = 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)';
        
        themeIcon.setAttribute('data-feather', 'sun');
    } else {
        body.setAttribute('data-theme', 'day');
        header.classList.add('header-glow');
        header.style.background = '';
        footer.style.background = '';
        
        themeIcon.setAttribute('data-feather', 'moon');
    }
    feather.replace();
});

// Mobile menu toggle
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

// Modal management
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Auth functions
function openAuthModal(type) {
    openModal('auth-modal');
    if (type === 'register') {
        switchToRegister();
    } else {
        switchToLogin();
    }
}

function switchToRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('modal-title').textContent = 'Регистрация';
}

function switchToLogin() {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('modal-title').textContent = 'Вход в систему';
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        alert(`Добро пожаловать, ${user.username}!`);
        closeModal('auth-modal');
        // Clear form
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
    } else {
        alert('Неверный логин или пароль');
    }
}

function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const role = document.getElementById('reg-role').value;
    
    if (!username || !password || !confirmPassword) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Пароли не совпадают');
        return;
    }
    
    if (users.find(u => u.username === username)) {
        alert('Пользователь с таким логином уже существует');
        return;
    }
    
    const newUser = { username, password, role };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    if (role === 'teacher') {
        alert('Ваша заявка на регистрацию как учитель отправлена администратору на подтверждение.');
    } else {
        alert('Регистрация выполнена успешно!');
    }
    
    closeModal('auth-modal');
    // Clear form
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-password').value = '';
    document.getElementById('reg-confirm-password').value = '';
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
        alert('Пожалуйста, введите вопрос');
        return;
    }
    
    const newQuestion = {
        id: Date.now(),
        question: question,
        answer: null,
        date: new Date().toLocaleDateString()
    };
    
    questions.push(newQuestion);
    localStorage.setItem('questions', JSON.stringify(questions));
    
    loadQuestions();
    questionInput.value = '';
    
    alert('Ваш вопрос отправлен! Ответ появится после проверки учителем.');
}

function loadQuestions() {
    const qaList = document.getElementById('qa-list');
    qaList.innerHTML = '';
    
    // Add existing questions
    questions.forEach(q => {
        const questionElement = document.createElement('div');
        questionElement.className = 'qa-item enhanced-card p-5';
        questionElement.innerHTML = `
            <div class="qa-question flex items-start">
                <i data-feather="help-circle" class="w-5 h-5 text-blue-500 mr-3 mt-0.5"></i>
                <span>${q.question}</span>
            </div>
            ${q.answer ? `
            <div class="qa-answer mt-3 flex items-start">
                <i data-feather="check-circle" class="w-5 h-5 text-green-500 mr-3 mt-0.5"></i>
                <span>${q.answer}</span>
            </div>
            ` : `
            <div class="qa-answer mt-3 flex items-start">
                <i data-feather="clock" class="w-5 h-5 text-yellow-500 mr-3 mt-0.5"></i>
                <span>Вопрос на рассмотрении учителя</span>
            </div>
            `}
        `;
        qaList.appendChild(questionElement);
    });
    
    feather.replace();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Start facts rotation
    setInterval(rotateFacts, 5000);
    
    // Navigation events
    document.querySelectorAll('[data-page]').forEach(button => {
        button.addEventListener('click', function() {
            showPage(this.getAttribute('data-page'));
        });
    });
    
    // Auth modal events
    document.getElementById('register-btn').addEventListener('click', () => openAuthModal('register'));
    document.getElementById('login-btn').addEventListener('click', () => openAuthModal('login'));
    document.getElementById('mobile-register-btn').addEventListener('click', () => openAuthModal('register'));
    document.getElementById('mobile-login-btn').addEventListener('click', () => openAuthModal('login'));
    document.getElementById('close-auth-modal').addEventListener('click', () => closeModal('auth-modal'));
    document.getElementById('switch-to-register').addEventListener('click', switchToRegister);
    document.getElementById('switch-to-login').addEventListener('click', switchToLogin);
    document.getElementById('login-submit').addEventListener('click', login);
    document.getElementById('register-submit').addEventListener('click', register);
    
    // Q&A modal events
    document.getElementById('qa-button').addEventListener('click', openQAModal);
    document.getElementById('close-qa-modal').addEventListener('click', () => closeModal('qa-modal'));
    document.getElementById('submit-question').addEventListener('click', submitQuestion);
    
    // Close modals when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal-overlay')) {
            closeModal('auth-modal');
            closeModal('qa-modal');
        }
    });
    
    // Load initial data
    loadQuestions();
});
