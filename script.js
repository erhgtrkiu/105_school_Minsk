// Initialize Feather Icons
feather.replace();

// School facts rotation
const schoolFacts = [
    "Наша школа основана в 1975 году",
    "У нас обучается более 800 учеников",
    "В школе работает 50 преподавателей",
    "Мы сотрудничаем с 3 китайскими школами-партнерами",
    "Ежегодно наши ученики побеждают в олимпиадах"
];

let currentFactIndex = 0;
const factContainer = document.getElementById('fact-container');

function rotateFacts() {
    currentFactIndex = (currentFactIndex + 1) % schoolFacts.length;
    
    // Fade out
    factContainer.classList.add('opacity-0');
    
    setTimeout(() => {
        factContainer.innerHTML = `<p class="text-gray-700">${schoolFacts[currentFactIndex]}</p>`;
        
        // Fade in
        factContainer.classList.remove('opacity-0');
        factContainer.classList.add('animate-fade');
        
        // Reset animation for next time
        setTimeout(() => {
            factContainer.classList.remove('animate-fade');
        }, 500);
        
        // Update dots
        const dots = document.querySelectorAll('.w-2.h-2');
        dots.forEach((dot, index) => {
            dot.classList.remove('bg-blue-400');
            dot.classList.add('bg-blue-200');
            if (index === currentFactIndex) {
                dot.classList.remove('bg-blue-200');
                dot.classList.add('bg-blue-400');
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
        document.getElementById('header').classList.remove('bg-blue-600');
        document.getElementById('header').classList.add('bg-gray-900');
        document.getElementById('footer').classList.remove('bg-blue-800');
        document.getElementById('footer').classList.add('bg-gray-900');
        
        // Change icon to sun
        themeIcon.setAttribute('data-feather', 'sun');
        feather.replace();
    } else {
        body.setAttribute('data-theme', 'day');
        document.getElementById('header').classList.remove('bg-gray-900');
        document.getElementById('header').classList.add('bg-blue-600');
        document.getElementById('footer').classList.remove('bg-gray-900');
        document.getElementById('footer').classList.add('bg-blue-800');
        
        // Change icon to moon
        themeIcon.setAttribute('data-feather', 'moon');
        feather.replace();
    }
});

// Mobile menu toggle
document.getElementById('mobile-menu-button').addEventListener('click', function() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
});

// Auth modal functions
function openAuthModal(type) {
    document.getElementById('auth-modal').classList.remove('hidden');
    if (type === 'register') {
        switchToRegister();
    } else {
        switchToLogin();
    }
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
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
        alert('Регистрация ученика выполнена успешно!');
    }
    
    closeAuthModal();
}

// Lessons modal functions
function openLessonsModal() {
    document.getElementById('lessons-modal').classList.remove('hidden');
}

function closeLessonsModal() {
    document.getElementById('lessons-modal').classList.add('hidden');
}

// Resources modal functions
function openResourcesModal() {
    document.getElementById('resources-modal').classList.remove('hidden');
}

function closeResourcesModal() {
    document.getElementById('resources-modal').classList.add('hidden');
}

// Q&A modal functions
function openQAModal() {
    document.getElementById('qa-modal').classList.remove('hidden');
}

function closeQAModal() {
    document.getElementById('qa-modal').classList.add('hidden');
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
    newQuestion.className = 'qa-item';
    newQuestion.innerHTML = `
        <div class="qa-question">${question}</div>
        <div class="qa-answer">Ваш вопрос отправлен учителю. Ответ появится здесь после проверки.</div>
    `;
    
    qaList.prepend(newQuestion);
    questionInput.value = '';
    
    alert('Ваш вопрос отправлен! Ответ появится после проверки учителем.');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Start facts rotation
    setInterval(rotateFacts, 7000);
    
    // Auth modal events
    document.getElementById('register-btn').addEventListener('click', () => openAuthModal('register'));
    document.getElementById('login-btn').addEventListener('click', () => openAuthModal('login'));
    document.getElementById('mobile-register-btn').addEventListener('click', () => openAuthModal('register'));
    document.getElementById('mobile-login-btn').addEventListener('click', () => openAuthModal('login'));
    document.getElementById('close-auth-modal').addEventListener('click', closeAuthModal);
    document.getElementById('switch-to-register').addEventListener('click', switchToRegister);
    document.getElementById('switch-to-login').addEventListener('click', switchToLogin);
    document.getElementById('login-submit').addEventListener('click', login);
    document.getElementById('register-submit').addEventListener('click', register);
    
    // Lessons modal events
    document.getElementById('lessons-link').addEventListener('click', openLessonsModal);
    document.getElementById('mobile-lessons-link').addEventListener('click', openLessonsModal);
    document.getElementById('close-lessons-modal').addEventListener('click', closeLessonsModal);
    
    // Resources modal events
    document.getElementById('resources-link').addEventListener('click', openResourcesModal);
    document.getElementById('mobile-resources-link').addEventListener('click', openResourcesModal);
    document.getElementById('close-resources-modal').addEventListener('click', closeResourcesModal);
    
    // Q&A modal events
    document.getElementById('qa-button').addEventListener('click', openQAModal);
    document.getElementById('close-qa-modal').addEventListener('click', closeQAModal);
    document.getElementById('submit-question').addEventListener('click', submitQuestion);
});
