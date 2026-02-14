/**
 * LOGIN.JS - Lógica de la página de inicio de sesión
 */

// ========================================
// VARIABLES
// ========================================

let loginForm;

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeLoginPage();
});

function initializeLoginPage() {
    loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    log('Página de login inicializada');
}

// ========================================
// MANEJO DE LOGIN
// ========================================

/**
 * Maneja el envío del formulario de login
 * @param {Event} e - Evento del formulario
 */
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Validación básica
    if (isEmpty(username)) {
        showToast('Por favor ingrese su usuario', 'error');
        return;
    }
    
    if (isEmpty(password)) {
        showToast('Por favor ingrese su contraseña', 'error');
        return;
    }
    
    // Intentar login
    const success = login(username, password);
    
    if (success) {
        const user = getCurrentUser();
        showToast(`Bienvenido, ${user.fullName || user.username}!`, 'success');
        
        // Redirigir al dashboard después de un breve delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } else {
        showToast('Usuario o contraseña incorrectos', 'error');
        
        // Limpiar contraseña
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
    }
}

// ========================================
// UTILIDADES
// ========================================

/**
 * Rellena el formulario con credenciales de prueba
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 */
function fillLogin(username, password) {
    document.getElementById('username').value = username;
    document.getElementById('password').value = password;
    document.getElementById('username').focus();
}
