/**
 * AUTH.JS - Sistema de autenticación y autorización
 * Sistema de Gestión de Inventarios
 */

// ========================================
// AUTENTICACIÓN
// ========================================

/**
 * Valida credenciales de usuario
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Object|null} Usuario si las credenciales son válidas
 */
function validateCredentials(username, password) {
    const user = getUserByUsername(username);
    
    if (!user) {
        log('Usuario no encontrado:', username);
        return null;
    }
    
    if (user.password !== password) {
        log('Contraseña incorrecta para usuario:', username);
        return null;
    }
    
    if (!user.active) {
        log('Usuario inactivo:', username);
        return null;
    }
    
    log('Usuario autenticado:', username);
    return user;
}

/**
 * Inicia sesión de usuario
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {boolean} true si el login fue exitoso
 */
function login(username, password) {
    const user = validateCredentials(username, password);
    
    if (!user) {
        return false;
    }
    
    // Guardar usuario actual (sin contraseña por seguridad)
    const userSession = {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        loginTime: new Date().toISOString()
    };
    
    saveCurrentUser(userSession);
    log('Sesión iniciada:', userSession);
    
    return true;
}

/**
 * Cierra la sesión actual
 */
function logout() {
    const user = getCurrentUser();
    if (user) {
        log('Cerrando sesión:', user.username);
    }
    
    clearCurrentUser();
    
    // Redirigir al login
    window.location.href = 'index.html';
}

/**
 * Verifica si hay una sesión activa
 * @returns {boolean} true si hay sesión activa
 */
function isAuthenticated() {
    const user = getCurrentUser();
    return user !== null;
}

/**
 * Obtiene el usuario de la sesión actual
 * @returns {Object|null} Usuario actual o null
 */
function getSessionUser() {
    return getCurrentUser();
}

// ========================================
// AUTORIZACIÓN
// ========================================

/**
 * Verifica si el usuario tiene un rol específico
 * @param {string} requiredRole - Rol requerido
 * @returns {boolean} true si tiene el rol
 */
function hasRole(requiredRole) {
    const user = getCurrentUser();
    if (!user) return false;
    
    return user.role === requiredRole;
}

/**
 * Verifica si el usuario es administrador
 * @returns {boolean} true si es admin
 */
function isAdmin() {
    return hasRole('admin');
}

/**
 * Verifica si el usuario es empleado
 * @returns {boolean} true si es empleado
 */
function isEmployee() {
    return hasRole('empleado');
}

/**
 * Protege una página según el rol
 * Redirige al login si no está autenticado
 * Redirige al dashboard si no tiene permisos
 * @param {Array} allowedRoles - Roles permitidos
 */
function protectPage(allowedRoles = []) {
    // Verificar autenticación
    if (!isAuthenticated()) {
        log('Usuario no autenticado, redirigiendo al login');
        window.location.href = 'index.html';
        return;
    }
    
    const user = getCurrentUser();
    
    // Si se especificaron roles, verificar autorización
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        log('Usuario sin permisos para esta página:', user.role);
        showToast('No tienes permisos para acceder a esta página', 'error');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        return;
    }
    
    // Actualizar UI según rol
    updateUIByRole(user.role);
    
    log('Página protegida - Usuario autorizado:', user.username);
}

/**
 * Actualiza la UI según el rol del usuario
 * @param {string} role - Rol del usuario
 */
function updateUIByRole(role) {
    // Agregar clase al body para CSS
    document.body.classList.add(`role-${role}`);
    
    // Mostrar/ocultar elementos según rol
    if (role === 'admin') {
        // Admin puede ver todo
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = '';
        });
    } else {
        // Empleados no pueden ver elementos de admin
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    log('UI actualizada para rol:', role);
}

/**
 * Actualiza la información del usuario en el navbar
 */
function updateNavbarUser() {
    const user = getCurrentUser();
    if (!user) return;
    
    const userNameElement = document.getElementById('currentUser');
    const userRoleElement = document.getElementById('userRole');
    
    if (userNameElement) {
        userNameElement.textContent = user.fullName || user.username;
    }
    
    if (userRoleElement) {
        const roleText = user.role === 'admin' ? 'Administrador' : 'Empleado';
        userRoleElement.textContent = roleText;
    }
}

// ========================================
// VERIFICACIÓN DE PERMISOS PARA ACCIONES
// ========================================

/**
 * Verifica si el usuario puede crear productos
 * @returns {boolean}
 */
function canCreateProducts() {
    return isAdmin();
}

/**
 * Verifica si el usuario puede editar productos
 * @returns {boolean}
 */
function canEditProducts() {
    return isAdmin();
}

/**
 * Verifica si el usuario puede eliminar productos
 * @returns {boolean}
 */
function canDeleteProducts() {
    return isAdmin();
}

/**
 * Verifica si el usuario puede registrar entradas
 * @returns {boolean}
 */
function canRegisterEntries() {
    return isAuthenticated(); // Todos los usuarios autenticados
}

/**
 * Verifica si el usuario puede registrar salidas
 * @returns {boolean}
 */
function canRegisterExits() {
    return isAuthenticated(); // Todos los usuarios autenticados
}

/**
 * Verifica si el usuario puede ver estadísticas
 * @returns {boolean}
 */
function canViewStatistics() {
    return isAdmin();
}

/**
 * Verifica si el usuario puede gestionar categorías
 * @returns {boolean}
 */
function canManageCategories() {
    return isAdmin();
}

// ========================================
// INICIALIZACIÓN
// ========================================

/**
 * Inicializa el sistema de autenticación en cada página
 */
function initAuth() {
    // Si estamos en la página de login, no hacer nada
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        // Si ya está autenticado, redirigir al dashboard
        if (isAuthenticated()) {
            window.location.href = 'dashboard.html';
        }
        return;
    }
    
    // Proteger todas las demás páginas
    protectPage();
    
    // Actualizar información del usuario en navbar
    updateNavbarUser();
}

// Auto-inicializar cuando el DOM está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
