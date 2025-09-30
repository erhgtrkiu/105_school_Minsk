// Initialize Feather Icons
feather.replace();

// School facts rotation
const schoolFacts = [
    "Китай - самая населённая страна в мире с более чем 1.4 миллиарда жителей.",
    "Китайский язык является одним из шести официальных языков ООН.",
    "В китайском языке более 50,000 иероглифов, но для чтения газет достаточно знать 3,000.",
    "Великая Китайская стена - самое длинное сооружение, построенное человеком.",
    "Китай является родиной многих изобретений: бумаги, пороха, компаса и книгопечатания."
];

let currentFactIndex = 0;
const factContainer = document.getElementById('fact-container');
const factDots = document.querySelectorAll('.fact-dot');

function rotateFacts() {
    currentFactIndex = (currentFactIndex + 1) % schoolFacts.length;
    
    // Fade out
    factContainer.classList.add('opacity-0');
    
    setTimeout(() => {
        factContainer.innerHTML = `<p class="text-xl">${schoolFacts[currentFactIndex]}</p>`;
        
        // Fade in
        factContainer.classList.remove('opacity-0');
        factContainer.classList.add('animate-fade');
        
        // Reset animation for next time
        setTimeout(() => {
            factContainer.classList.remove('animate-fade');
        }, 500);
        
        // Update dots
        factDots.forEach((dot, index) => {
            dot.classList.remove('active');
            dot.classList.remove('bg-white');
            dot.classList.add('bg-white/50');
            if (index === currentFactIndex) {
                dot.classList.add('active');
                dot.classList.add('bg-white');
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
        document.getElementById('header').classList.remove('header-glow');
        document.getElementById('header').classList.add('bg-gradient-to-r', 'from-gray-900', 'to-gray-800');
        document.getElementById('footer').classList.remove('bg-gradient-to-br', 'from-blue-800', 'to-blue-900');
        document.getElementById('footer').classList.add('bg-gradient-to-br', 'from-gray-900', 'to-gray-800');
        
        // Change icon to sun
        themeIcon.setAttribute('data-feather', 'sun');
        feather.replace();
        
        // Update facts container for night mode
        document.querySelector('.facts-container').classList.remove('facts-container');
        document.querySelector('.facts-container').style.background = 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)';
    } else {
        body.setAttribute('data-theme', 'day');
        document.getElementById('header').classList.add('header-glow');
        document.getElementById('header').classList.remove('bg-gradient-to-r', 'from-gray-900', 'to-gray-800');
        document.getElementById('footer').classList.add('bg-gradient-to-br', 'from-blue-800', 'to-blue-900');
        document.getElementById('footer').classList.remove('bg-gradient-to-br', 'from-gray-900', 'to-gray-800');
        
        // Change icon to moon
        themeIcon.setAttribute('data-feather', 'moon');
        feather.replace();
        
        // Update facts container for day mode
        document.querySelector('.facts-container').classList.add('facts-container');
        document.querySelector('.facts-container').style.background = '';
    }
});

// Mobile menu toggle
document.getElementById('mobile-menu-button').addEventListener('click', function() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
    
    // Change menu icon
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
    const modal = document.getElementById(modalId);
    const modalContent = modal.querySelector('.modal-content');
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        modalContent.classList.remove('scale-95', 'opacity-0');
        modalContent.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');
    
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// Auth modal functions
function openAuthModal(type) {
    openModal('auth-modal');
    if (type === 'register') {
        switchToRegister();
    } else {
        switchToLogin();
    }
}

function closeAuthModal() {
    closeModal('auth-modal');
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
    
    // Simple validation
    if (!username || !password) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    // Admin check
    if (username === 'admin' && password === 'admin123') {
        alert('Вы вошли как администратор');
        closeAuthModal();
        return;
    }
    
    // In a real app, you would make an API call here
    alert('Вход выполнен успешно!');
    closeAuthModal();
}

function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const role = document.getElementById('reg-role').value;
    
    // Simple validation
    if (!username || !password || !confirmPassword) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Пароли не совпадают');
        return;
    }
    
    if (role === 'teacher') {
        alert('Ваша заявка на регистрацию как учитель отправлена администратору на подтверждение.');
    } else {
        alert('Регистрация выполнена успешно!');
    }
    
    closeAuthModal();
}

// Lessons modal functions
function openLessonsModal() {
    openModal('lessons-modal');
}

function closeLessonsModal() {
    closeModal('lessons-modal');
}

// Resources modal functions
function openResourcesModal() {
    openModal('resources-modal');
}

function closeResourcesModal() {
    closeModal('resources-modal');
}

// Q&A modal functions
function openQAModal() {
    openModal('qa-modal');
}

function closeQAModal() {
    closeModal('qa-modal');
}

function submitQuestion() {
    const questionInput = document.getElementById('question-input');
    const question = questionInput.value.trim();
    
    if (!question) {
        alert('Пожалуйста, введите вопрос');
        return;
    }
    
    const qaList = document.getElementById('qa-list');
    const newQuestion = document.createElement('div');
    newQuestion.className = 'qa-item enhanced-card p-5';
    newQuestion.innerHTML = `
        <div class="qa-question flex items-start">
            <i data-feather="help-circle" class="w-5 h-5 text-blue-500 mr-3 mt-0.5"></i>
            <span>${question}</span>
        </div>
        <div class="qa-answer mt-3 flex items-start">
            <i data-feather="clock" class="w-5 h-5 text-yellow-500 mr-3 mt-0.5"></i>
            <span>Ваш вопрос отправлен учителю. Ответ появится здесь после проверки.</span>
        </div>
    `;
    
    qaList.prepend(newQuestion);
    questionInput.value = '';
    feather.replace();
    
    alert('Ваш вопрос отправлен! Ответ появится после проверки учителем.');
}

// Close modals when clicking outside
document.addEventListener('click', function(event) {
    const modals = ['auth-modal', 'lessons-modal', 'resources-modal', 'qa-modal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            closeModal(modalId);
        }
    });
});

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Start facts rotation
    setInterval(rotateFacts, 5000);
    
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
    
    // Lessons modal events
    document.getElementById('lessons-link').addEventListener('click', openLessonsModal);
    document.getElementById('mobile-lessons-link').addEventListener('click', openLessonsModal);
    document.getElementById('close-lessons-modal').addEventListener('click', () => closeModal('lessons-modal'));
    
    // Resources modal events
    document.getElementById('resources-link').addEventListener('click', openResourcesModal);
    document.getElementById('mobile-resources-link').addEventListener('click', openResourcesModal);
    document.getElementById('close-resources-modal').addEventListener('click', () => closeModal('resources-modal'));
    
    // Q&A modal events
    document.getElementById('qa-button').addEventListener('click', openQAModal);
    document.getElementById('close-qa-modal').addEventListener('click', () => closeModal('qa-modal'));
    document.getElementById('submit-question').addEventListener('click', submitQuestion);
    
    // Add enter key support for question submission
    document.getElementById('question-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            submitQuestion();
        }
    });
    
    // Add loading animation to images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.classList.remove('animate-pulse');
        });
        
        if (!img.complete) {
            img.classList.add('animate-pulse');
        }
    });
});
