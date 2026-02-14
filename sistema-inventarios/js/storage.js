/**
 * STORAGE.JS - Gestión de localStorage
 * Sistema de Gestión de Inventarios
 */

// ========================================
// CONSTANTES
// ========================================

const STORAGE_KEYS = {
    PRODUCTS: 'inventory_products',
    MOVEMENTS: 'inventory_movements',
    CATEGORIES: 'inventory_categories',
    USERS: 'inventory_users',
    CURRENT_USER: 'inventory_current_user',
    SETTINGS: 'inventory_settings'
};

// ========================================
// INICIALIZACIÓN
// ========================================

/**
 * Inicializa el sistema de almacenamiento con datos por defecto
 */
function initializeStorage() {
    log('Inicializando almacenamiento...');
    
    // Inicializar usuarios si no existen
    if (!getUsers()) {
        const defaultUsers = [
            {
                id: '1',
                username: 'admin',
                password: 'admin123',
                role: 'admin',
                fullName: 'Administrador del Sistema',
                email: 'admin@inventario.com',
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                username: 'empleado',
                password: 'emp123',
                role: 'empleado',
                fullName: 'Usuario Empleado',
                email: 'empleado@inventario.com',
                active: true,
                createdAt: new Date().toISOString()
            }
        ];
        saveUsers(defaultUsers);
        log('Usuarios por defecto creados');
    }
    
    // Inicializar categorías si no existen
    if (!getCategories() || getCategories().length === 0) {
        const defaultCategories = [
            { id: '1', name: 'Electrónicos', description: 'Productos electrónicos y tecnología' },
            { id: '2', name: 'Alimentos', description: 'Productos alimenticios' },
            { id: '3', name: 'Bebidas', description: 'Bebidas y líquidos' },
            { id: '4', name: 'Oficina', description: 'Material de oficina' },
            { id: '5', name: 'Limpieza', description: 'Productos de limpieza' },
            { id: '6', name: 'Ferretería', description: 'Herramientas y materiales' },
            { id: '7', name: 'Textil', description: 'Ropa y telas' },
            { id: '8', name: 'Otros', description: 'Productos varios' }
        ];
        saveCategories(defaultCategories);
        log('Categorías por defecto creadas');
    }
    
    // Inicializar productos de ejemplo si no existen
    if (!getProducts() || getProducts().length === 0) {
        const exampleProducts = [
            {
                id: generateId(),
                code: 'PROD-001',
                name: 'Laptop HP 15"',
                description: 'Laptop HP con procesador Intel Core i5, 8GB RAM, 256GB SSD',
                category: 'Electrónicos',
                price: 2500000,
                stock: 15,
                minStock: 5,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: generateId(),
                code: 'PROD-002',
                name: 'Mouse Inalámbrico',
                description: 'Mouse inalámbrico ergonómico',
                category: 'Electrónicos',
                price: 45000,
                stock: 50,
                minStock: 10,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: generateId(),
                code: 'PROD-003',
                name: 'Teclado Mecánico',
                description: 'Teclado mecánico RGB para gaming',
                category: 'Electrónicos',
                price: 180000,
                stock: 8,
                minStock: 5,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: generateId(),
                code: 'PROD-004',
                name: 'Resma Papel A4',
                description: 'Resma de 500 hojas papel bond A4',
                category: 'Oficina',
                price: 12000,
                stock: 100,
                minStock: 20,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: generateId(),
                code: 'PROD-005',
                name: 'Café Colombiano 500g',
                description: 'Café colombiano premium en grano',
                category: 'Alimentos',
                price: 25000,
                stock: 3,
                minStock: 10,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        saveProducts(exampleProducts);
        log('Productos de ejemplo creados');
    }
    
    // Inicializar movimientos si no existen
    if (!getMovements()) {
        saveMovements([]);
        log('Sistema de movimientos inicializado');
    }
    
    log('Almacenamiento inicializado correctamente');
}

// ========================================
// FUNCIONES GENÉRICAS DE STORAGE
// ========================================

/**
 * Guarda datos en localStorage
 * @param {string} key - Clave de almacenamiento
 * @param {any} data - Datos a guardar
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        logError('Error al guardar en localStorage:', error);
        return false;
    }
}

/**
 * Obtiene datos de localStorage
 * @param {string} key - Clave de almacenamiento
 * @returns {any} Datos almacenados o null
 */
function getFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        logError('Error al leer de localStorage:', error);
        return null;
    }
}

/**
 * Elimina datos de localStorage
 * @param {string} key - Clave de almacenamiento
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        logError('Error al eliminar de localStorage:', error);
        return false;
    }
}

/**
 * Limpia todo el localStorage del sistema
 */
function clearAllStorage() {
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        log('Almacenamiento limpiado completamente');
        return true;
    } catch (error) {
        logError('Error al limpiar localStorage:', error);
        return false;
    }
}

// ========================================
// PRODUCTOS
// ========================================

function getProducts() {
    return getFromStorage(STORAGE_KEYS.PRODUCTS) || [];
}

function saveProducts(products) {
    return saveToStorage(STORAGE_KEYS.PRODUCTS, products);
}

function getProductById(id) {
    const products = getProducts();
    return products.find(p => p.id === id);
}

function getProductByCode(code) {
    const products = getProducts();
    return products.find(p => p.code === code);
}

function addProduct(product) {
    const products = getProducts();
    const newProduct = {
        ...product,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    products.push(newProduct);
    saveProducts(products);
    return newProduct;
}

function updateProduct(id, updatedData) {
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    products[index] = {
        ...products[index],
        ...updatedData,
        updatedAt: new Date().toISOString()
    };
    
    saveProducts(products);
    return products[index];
}

function deleteProduct(id) {
    const products = getProducts();
    const filtered = products.filter(p => p.id !== id);
    
    if (filtered.length === products.length) return false;
    
    saveProducts(filtered);
    return true;
}

function updateProductStock(productId, quantity) {
    const product = getProductById(productId);
    if (!product) return null;
    
    return updateProduct(productId, {
        stock: product.stock + quantity
    });
}

// ========================================
// MOVIMIENTOS
// ========================================

function getMovements() {
    return getFromStorage(STORAGE_KEYS.MOVEMENTS) || [];
}

function saveMovements(movements) {
    return saveToStorage(STORAGE_KEYS.MOVEMENTS, movements);
}

function addMovement(movement) {
    const movements = getMovements();
    const newMovement = {
        ...movement,
        id: generateId(),
        createdAt: new Date().toISOString()
    };
    movements.push(newMovement);
    saveMovements(movements);
    return newMovement;
}

function getMovementsByProduct(productId) {
    const movements = getMovements();
    return movements.filter(m => m.productId === productId);
}

function getMovementsByDateRange(startDate, endDate) {
    const movements = getMovements();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return movements.filter(m => {
        const movDate = new Date(m.createdAt);
        return movDate >= start && movDate <= end;
    });
}

function getMovementsByType(type) {
    const movements = getMovements();
    return movements.filter(m => m.type === type);
}

// ========================================
// CATEGORÍAS
// ========================================

function getCategories() {
    return getFromStorage(STORAGE_KEYS.CATEGORIES) || [];
}

function saveCategories(categories) {
    return saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
}

function addCategory(category) {
    const categories = getCategories();
    const newCategory = {
        ...category,
        id: generateId()
    };
    categories.push(newCategory);
    saveCategories(categories);
    return newCategory;
}

// ========================================
// USUARIOS
// ========================================

function getUsers() {
    return getFromStorage(STORAGE_KEYS.USERS);
}

function saveUsers(users) {
    return saveToStorage(STORAGE_KEYS.USERS, users);
}

function getUserByUsername(username) {
    const users = getUsers();
    return users ? users.find(u => u.username === username) : null;
}

// ========================================
// USUARIO ACTUAL
// ========================================

function getCurrentUser() {
    return getFromStorage(STORAGE_KEYS.CURRENT_USER);
}

function saveCurrentUser(user) {
    return saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
}

function clearCurrentUser() {
    return removeFromStorage(STORAGE_KEYS.CURRENT_USER);
}

// ========================================
// CONFIGURACIÓN
// ========================================

function getSettings() {
    return getFromStorage(STORAGE_KEYS.SETTINGS) || {
        companyName: 'Mi Empresa',
        lowStockThreshold: 10,
        currency: 'COP',
        dateFormat: 'DD/MM/YYYY'
    };
}

function saveSettings(settings) {
    return saveToStorage(STORAGE_KEYS.SETTINGS, settings);
}

// ========================================
// ESTADÍSTICAS Y REPORTES
// ========================================

/**
 * Obtiene estadísticas generales del inventario
 */
function getInventoryStats() {
    const products = getProducts();
    const movements = getMovements();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
        totalProducts: products.length,
        totalStock: products.reduce((sum, p) => sum + p.stock, 0),
        totalValue: products.reduce((sum, p) => sum + (p.stock * p.price), 0),
        lowStockProducts: products.filter(p => p.stock <= p.minStock).length,
        outOfStockProducts: products.filter(p => p.stock === 0).length,
        movementsToday: movements.filter(m => {
            const movDate = new Date(m.createdAt);
            movDate.setHours(0, 0, 0, 0);
            return movDate.getTime() === today.getTime();
        }).length,
        totalMovements: movements.length
    };
}

/**
 * Obtiene los productos con stock bajo
 */
function getLowStockProducts() {
    const products = getProducts();
    return products.filter(p => p.stock <= p.minStock)
        .sort((a, b) => a.stock - b.stock);
}

/**
 * Obtiene los productos más movidos
 */
function getTopMovedProducts(limit = 10) {
    const movements = getMovements();
    const products = getProducts();
    
    const productMovements = {};
    
    movements.forEach(m => {
        if (!productMovements[m.productId]) {
            productMovements[m.productId] = 0;
        }
        productMovements[m.productId] += Math.abs(m.quantity);
    });
    
    return Object.entries(productMovements)
        .map(([productId, totalMovements]) => {
            const product = products.find(p => p.id === productId);
            return product ? { ...product, totalMovements } : null;
        })
        .filter(p => p !== null)
        .sort((a, b) => b.totalMovements - a.totalMovements)
        .slice(0, limit);
}

// Inicializar al cargar el script
initializeStorage();
