/**
 * MOVEMENTS.JS - Gestión de movimientos de inventario
 * Sistema de Gestión de Inventarios
 */

// ========================================
// CONSTANTES
// ========================================

const MOVEMENT_TYPES = {
    ENTRADA: 'entrada',
    SALIDA: 'salida'
};

const ENTRY_REASONS = [
    'Compra',
    'Devolución de cliente',
    'Ajuste de inventario',
    'Donación',
    'Producción interna',
    'Otro'
];

const EXIT_REASONS = [
    'Venta',
    'Devolución a proveedor',
    'Pérdida',
    'Daño',
    'Robo',
    'Uso interno',
    'Donación',
    'Ajuste de inventario',
    'Otro'
];

// ========================================
// VALIDACIÓN DE MOVIMIENTOS
// ========================================

/**
 * Valida los datos de un movimiento
 * @param {Object} movementData - Datos del movimiento
 * @returns {Object} { valid: boolean, errors: Array }
 */
function validateMovementData(movementData) {
    const errors = [];
    
    // Validar producto
    if (!movementData.productId) {
        errors.push('Debe seleccionar un producto');
    } else {
        const product = getProductById(movementData.productId);
        if (!product) {
            errors.push('El producto seleccionado no existe');
        }
    }
    
    // Validar tipo
    if (!movementData.type || !Object.values(MOVEMENT_TYPES).includes(movementData.type)) {
        errors.push('Tipo de movimiento inválido');
    }
    
    // Validar cantidad
    if (!isPositiveNumber(movementData.quantity)) {
        errors.push('La cantidad debe ser un número positivo');
    }
    
    // Validar razón
    if (isEmpty(movementData.reason)) {
        errors.push('Debe especificar una razón');
    }
    
    // Validar stock suficiente para salidas
    if (movementData.type === MOVEMENT_TYPES.SALIDA) {
        const product = getProductById(movementData.productId);
        if (product && Number(movementData.quantity) > product.stock) {
            errors.push(`Stock insuficiente. Disponible: ${product.stock} unidades`);
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

// ========================================
// REGISTRO DE MOVIMIENTOS
// ========================================

/**
 * Registra un movimiento de entrada
 * @param {Object} movementData - Datos del movimiento
 * @returns {Object} { success: boolean, movement: Object, message: string }
 */
function registerEntry(movementData) {
    return registerMovement({
        ...movementData,
        type: MOVEMENT_TYPES.ENTRADA
    });
}

/**
 * Registra un movimiento de salida
 * @param {Object} movementData - Datos del movimiento
 * @returns {Object} { success: boolean, movement: Object, message: string }
 */
function registerExit(movementData) {
    return registerMovement({
        ...movementData,
        type: MOVEMENT_TYPES.SALIDA
    });
}

/**
 * Registra un movimiento genérico
 * @param {Object} movementData - Datos del movimiento
 * @returns {Object} { success: boolean, movement: Object, message: string }
 */
function registerMovement(movementData) {
    // Validar datos
    const validation = validateMovementData(movementData);
    if (!validation.valid) {
        return {
            success: false,
            message: validation.errors.join(', ')
        };
    }
    
    // Obtener producto
    const product = getProductById(movementData.productId);
    if (!product) {
        return {
            success: false,
            message: 'Producto no encontrado'
        };
    }
    
    // Calcular nuevo stock
    const quantity = Number(movementData.quantity);
    const stockChange = movementData.type === MOVEMENT_TYPES.ENTRADA ? quantity : -quantity;
    const previousStock = product.stock;
    const newStock = previousStock + stockChange;
    
    // Validar que no resulte en stock negativo
    if (newStock < 0) {
        return {
            success: false,
            message: 'La operación resultaría en stock negativo'
        };
    }
    
    // Obtener usuario actual
    const currentUser = getCurrentUser();
    
    // Crear movimiento
    const movement = addMovement({
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        type: movementData.type,
        quantity: stockChange,
        reason: movementData.reason,
        notes: movementData.notes || '',
        previousStock,
        newStock,
        userId: currentUser.id,
        userName: currentUser.fullName || currentUser.username
    });
    
    // Actualizar stock del producto
    updateProductStock(product.id, stockChange);
    
    log('Movimiento registrado:', movement);
    
    // Verificar si quedó en stock bajo
    if (newStock <= product.minStock && movementData.type === MOVEMENT_TYPES.SALIDA) {
        showToast(
            `Alerta: ${product.name} ahora tiene stock bajo (${newStock} unidades)`,
            'warning'
        );
    }
    
    return {
        success: true,
        movement,
        message: `${movementData.type === MOVEMENT_TYPES.ENTRADA ? 'Entrada' : 'Salida'} registrada exitosamente`
    };
}

// ========================================
// CONSULTAS DE MOVIMIENTOS
// ========================================

/**
 * Obtiene movimientos con filtros
 * @param {Object} filters - Filtros a aplicar
 * @returns {Array} Movimientos filtrados
 */
function getFilteredMovements(filters = {}) {
    let movements = getMovements();
    
    // Filtrar por tipo
    if (filters.type) {
        movements = movements.filter(m => m.type === filters.type);
    }
    
    // Filtrar por producto
    if (filters.productId) {
        movements = movements.filter(m => m.productId === filters.productId);
    }
    
    // Filtrar por rango de fechas
    if (filters.dateFrom || filters.dateTo) {
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : new Date('1900-01-01');
        const toDate = filters.dateTo ? new Date(filters.dateTo) : new Date('2100-12-31');
        toDate.setHours(23, 59, 59, 999); // Incluir todo el día
        
        movements = movements.filter(m => {
            const movDate = new Date(m.createdAt);
            return movDate >= fromDate && movDate <= toDate;
        });
    }
    
    // Filtrar por búsqueda de texto
    if (filters.search) {
        movements = filterByText(movements, filters.search, 
            ['productCode', 'productName', 'reason', 'notes', 'userName']
        );
    }
    
    // Filtrar por usuario
    if (filters.userId) {
        movements = movements.filter(m => m.userId === filters.userId);
    }
    
    // Ordenar por fecha descendente (más reciente primero)
    movements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return movements;
}

/**
 * Obtiene movimientos recientes
 * @param {number} limit - Cantidad de movimientos
 * @returns {Array} Movimientos recientes
 */
function getRecentMovements(limit = 10) {
    const movements = getMovements();
    return movements
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
}

/**
 * Obtiene movimientos del día actual
 * @returns {Array} Movimientos de hoy
 */
function getTodayMovements() {
    const movements = getMovements();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return movements.filter(m => {
        const movDate = new Date(m.createdAt);
        movDate.setHours(0, 0, 0, 0);
        return movDate.getTime() === today.getTime();
    });
}

/**
 * Obtiene movimientos del mes actual
 * @returns {Array} Movimientos del mes
 */
function getMonthMovements() {
    const movements = getMovements();
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    return movements.filter(m => {
        const movDate = new Date(m.createdAt);
        return movDate >= firstDay && movDate <= lastDay;
    });
}

// ========================================
// ESTADÍSTICAS DE MOVIMIENTOS
// ========================================

/**
 * Obtiene estadísticas de movimientos
 * @param {Object} filters - Filtros opcionales
 * @returns {Object} Estadísticas
 */
function getMovementStatistics(filters = {}) {
    const movements = getFilteredMovements(filters);
    
    const entradas = movements.filter(m => m.type === MOVEMENT_TYPES.ENTRADA);
    const salidas = movements.filter(m => m.type === MOVEMENT_TYPES.SALIDA);
    
    const totalEntradas = entradas.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    const totalSalidas = salidas.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    
    return {
        total: movements.length,
        entradas: entradas.length,
        salidas: salidas.length,
        totalEntradasQuantity: totalEntradas,
        totalSalidasQuantity: totalSalidas,
        balance: totalEntradas - totalSalidas
    };
}

/**
 * Obtiene movimientos agrupados por día
 * @param {number} days - Número de días hacia atrás
 * @returns {Array} Datos agrupados por día
 */
function getMovementsByDay(days = 7) {
    const movements = getMovements();
    const result = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayMovements = movements.filter(m => {
            const movDate = new Date(m.createdAt);
            return movDate >= date && movDate < nextDay;
        });
        
        const entradas = dayMovements.filter(m => m.type === MOVEMENT_TYPES.ENTRADA).length;
        const salidas = dayMovements.filter(m => m.type === MOVEMENT_TYPES.SALIDA).length;
        
        result.push({
            date: formatDate(date, false),
            entradas,
            salidas,
            total: dayMovements.length
        });
    }
    
    return result;
}

/**
 * Obtiene actividad por usuario
 * @returns {Array} Actividad de usuarios
 */
function getUserActivity() {
    const movements = getMovements();
    const users = {};
    
    movements.forEach(m => {
        if (!users[m.userId]) {
            users[m.userId] = {
                userId: m.userId,
                userName: m.userName,
                totalMovements: 0,
                entradas: 0,
                salidas: 0
            };
        }
        
        users[m.userId].totalMovements++;
        if (m.type === MOVEMENT_TYPES.ENTRADA) {
            users[m.userId].entradas++;
        } else {
            users[m.userId].salidas++;
        }
    });
    
    return Object.values(users)
        .sort((a, b) => b.totalMovements - a.totalMovements);
}

// ========================================
// EXPORTACIÓN
// ========================================

/**
 * Prepara movimientos para exportar
 * @param {Array} movements - Movimientos a exportar
 * @returns {Array} Datos formateados
 */
function prepareMovementsForExport(movements = null) {
    const data = movements || getMovements();
    
    return data.map(m => ({
        'Fecha/Hora': formatDate(m.createdAt, true),
        'Producto': m.productName,
        'Código': m.productCode,
        'Tipo': m.type === MOVEMENT_TYPES.ENTRADA ? 'Entrada' : 'Salida',
        'Cantidad': Math.abs(m.quantity),
        'Razón': m.reason,
        'Notas': m.notes,
        'Usuario': m.userName,
        'Stock Anterior': m.previousStock,
        'Stock Nuevo': m.newStock
    }));
}

/**
 * Exporta movimientos a CSV
 * @param {Array} movements - Movimientos a exportar (opcional)
 */
function exportMovementsToCSV(movements = null) {
    const data = prepareMovementsForExport(movements);
    exportToCSV(data, 'movimientos');
}

// ========================================
// UTILIDADES
// ========================================

/**
 * Obtiene las razones según el tipo de movimiento
 * @param {string} type - Tipo de movimiento
 * @returns {Array} Lista de razones
 */
function getReasonsByType(type) {
    return type === MOVEMENT_TYPES.ENTRADA ? ENTRY_REASONS : EXIT_REASONS;
}

/**
 * Valida si se puede realizar un movimiento
 * @param {string} productId - ID del producto
 * @param {string} type - Tipo de movimiento
 * @param {number} quantity - Cantidad
 * @returns {Object} { canMove: boolean, message: string }
 */
function canPerformMovement(productId, type, quantity) {
    const product = getProductById(productId);
    
    if (!product) {
        return { canMove: false, message: 'Producto no encontrado' };
    }
    
    if (type === MOVEMENT_TYPES.SALIDA && quantity > product.stock) {
        return {
            canMove: false,
            message: `Stock insuficiente. Disponible: ${product.stock} unidades`
        };
    }
    
    return { canMove: true, message: 'OK' };
}
