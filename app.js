
const API_URL = 'http://localhost:3000';
const TOKEN_KEY = 'digwill_token';
const USER_KEY = 'digwill_user';
function isLoggedIn() {
    return !!localStorage.getItem(TOKEN_KEY);
}
function handleRoute() {
    const path = window.location.pathname;
    const isAuth = isLoggedIn();
    if (isAuth && (path.includes('login.html') || path.includes('registration.html'))) {
        window.location.href = 'lk.html';
        return;
    }
    if (!isAuth && (path.includes('lk.html') || path.includes('capsula.html'))) {
        alert('Пожалуйста, войдите в аккаунт');
        window.location.href = 'login.html';
        return;
    }
}
async function apiRequest(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem(TOKEN_KEY);
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true, message: 'Mock OK' };
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}
function simpleEncrypt(text) {
    return btoa(unescape(encodeURIComponent(text)));
}
async function handleRegistration(email, username, password) {
    const confirmPassword = document.querySelector('[name="confirm-password"]')?.value;
    
    if (confirmPassword && password !== confirmPassword) {
        alert('Пароли не совпадают!');
        return false;
    }
    
    const result = await apiRequest('/register', 'POST', {
        email,
        username,
        password: simpleEncrypt(password)
    });
    
    if (result) {
        localStorage.setItem(TOKEN_KEY, 'token_' + Date.now());
        localStorage.setItem(USER_KEY, JSON.stringify({ email, username }));
        
        alert('Регистрация успешна! Добро пожаловать!');
        window.location.href = 'lk.html'; 
        return true;
    }
    return false;
}
async function handleLogin(email, password) {
    const result = await apiRequest('/login', 'POST', {
        email,
        password: simpleEncrypt(password)
    });
    
    if (result) {
        localStorage.setItem(TOKEN_KEY, 'token_' + Date.now());
        localStorage.setItem(USER_KEY, JSON.stringify({ email }));
        
        alert('Вход выполнен!');
        window.location.href = 'lk.html'; 
        return true;
    } else {
        alert('Неверный email или пароль');
        return false;
    }
}
function handleLogout() {
    if (confirm('Выйти из аккаунта?')) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        alert('Вы вышли');
        window.location.href = 'index.html'; // Возврат на главную
    }
}
async function saveCapsuleEntry(category, data) {
    if (data.password) {
        data.password = simpleEncrypt(data.password);
    }
    
    const result = await apiRequest('/capsule', 'POST', {
        category,
        data,
        timestamp: new Date().toISOString()
    });
    
    if (result) {
        console.log('Saved:', category, data);
        alert('Запись добавлена в капсулу!');
        return true;
    }
    return false;
}
function handleImOkay() {
    localStorage.setItem('lastCheckDate', new Date().getTime());
    
    const daysDisplay = document.querySelector('.num');
    if (daysDisplay) {
        daysDisplay.textContent = '30 дней';
        daysDisplay.style.color = '#7EEB48';
    }
    
    alert('Таймер сброшен! Следующая проверка через 30 дней.');
}
document.addEventListener('DOMContentLoaded', () => {
    console.log('DigWill app.js loaded');
    handleRoute();
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.querySelector('#email')?.value;
            const password = document.querySelector('#password')?.value;
            if (email && password) {
                await handleLogin(email, password);
            }
        });
    }
    const regForm = document.querySelector('.regform');
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.querySelector('#regemail')?.value;
            const username = document.querySelector('#username')?.value;
            const password = document.querySelector('#password')?.value;
            if (email && username && password) {
                await handleRegistration(email, username, password);
            }
        });
    }
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
    const imOkayBtn = document.querySelector('.btnok');
    if (imOkayBtn) {
        imOkayBtn.addEventListener('click', handleImOkay);
    }
    document.querySelectorAll('.add-link, .ava3').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Форма добавления (в разработке)');
        });
    });
    const categorySelect = document.getElementById('catsel');
    if (categorySelect) {
        const allForms = document.querySelectorAll('.catform');
        categorySelect.addEventListener('change', function() {
            allForms.forEach(form => form.style.display = 'none');
            const chosen = this.value;
            if (chosen) {
                const target = document.getElementById('form-' + chosen);
                if (target) target.style.display = 'flex';
            }
        });
    }
    document.querySelectorAll('.btnsave').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const form = btn.closest('.catform');
            if (!form) return;
            
            const category = form.id.replace('form-', '');
            const formData = {};
            form.querySelectorAll('input').forEach(input => {
                formData[input.name] = input.value;
            });
            await saveCapsuleEntry(category, formData);
        });
    });
    console.log('All handlers attached');
});