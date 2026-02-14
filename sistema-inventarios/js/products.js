/**
 * PRODUCTS.JS - Gestión de productos
 * Sistema de Gestión de Inventarios
 */

// ========================================
// VALIDACIÓN DE PRODUCTOS
// ========================================

/**
 * Valida los datos de un producto
 * @param {Object} productData - Datos del producto
 * @returns {Object} { valid: boolean, errors: Array }
 */
function validateProductData(productData) {
    const errors = [];
    
    // Validar código
    if (isEmpty(productData.code)) {
        errors.push('El código es requerido');
    }
    
    // Validar nombre
    if (isEmpty(productData.name)) {
        errors.push('El nombre es requerido');
    }
    
    // Validar categoría
    if (isEmpty(productData.category)) {
        errors.push('La categoría es requerida');
    }
    
    // Validar precio
    if (!isPositiveNumber(productData.price)) {
        errors.push('El precio debe ser un número positivo');
    }
    
    // Validar stock
    if (isNaN(productData.stock) || Number(productData.stock) < 0) {
        errors.push('El stock debe ser un número mayor o igual a cero');
    }
    
    // Validar stock mínimo
    if (!isPositiveNumber(productData.minStock)) {
        errors.push('El stock mínimo debe ser un número positivo');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Verifica si el código de producto ya existe
 * @param {string} code - Código a verificar
 * @param {string} excludeId - ID del producto a excluir (para edición)
 * @returns {boolean} true si el código existe
 */
function productCodeExists(code, excludeId = null) {
    const products = getProducts();
    return products.some(p => p.code === code && p.id !== excludeId);
}

// ========================================
// OPERACIONES CRUD
// ========================================

/**
 * Crea un nuevo producto
 * @param {Object} productData - Datos del producto
 * @returns {Object} { success: boolean, product: Object, message: string }
 */
function createProduct(productData) {
    // Validar datos
    const validation = validateProductData(productData);
    if (!validation.valid) {
        return {
            success: false,
            message: validation.errors.join(', ')
        };
    }
    
    // Verificar código único
    if (productCodeExists(productData.code)) {
        return {
            success: false,
            message: 'Ya existe un producto con ese código'
        };
    }
    
    // Crear producto
    const product = addProduct({
        code: productData.code,
        name: productData.name,
        description: productData.description || '',
        category: productData.category,
        price: Number(productData.price),
        stock: Number(productData.stock),
        minStock: Number(productData.minStock)
    });
    
    log('Producto creado:', product);
    
    return {
        success: true,
        product,
        message: 'Producto creado exitosamente'
    };
}

/**
 * Actualiza un producto existente
 * @param {string} id - ID del producto
 * @param {Object} productData - Nuevos datos
 * @returns {Object} { success: boolean, product: Object, message: string }
 */
function editProduct(id, productData) {
    // Verificar que el producto existe
    const existingProduct = getProductById(id);
    if (!existingProduct) {
        return {
            success: false,
            message: 'Producto no encontrado'
        };
    }
    
    // Validar datos
    const validation = validateProductData(productData);
    if (!validation.valid) {
        return {
            success: false,
            message: validation.errors.join(', ')
        };
    }
    
    // Verificar código único (excluyendo el producto actual)
    if (productCodeExists(productData.code, id)) {
        return {
            success: false,
            message: 'Ya existe otro producto con ese código'
        };
    }
    
    // Actualizar producto (mantener stock, ya que se actualiza via movimientos)
    const product = updateProduct(id, {
        code: productData.code,
        name: productData.name,
        description: productData.description || '',
        category: productData.category,
        price: Number(productData.price),
        minStock: Number(productData.minStock)
        // NO actualizamos stock aquí
    });
    
    log('Producto actualizado:', product);
    
    return {
        success: true,
        product,
        message: 'Producto actualizado exitosamente'
    };
}

/**
 * Elimina un producto
 * @param {string} id - ID del producto
 * @returns {Object} { success: boolean, message: string }
 */
function removeProduct(id) {
    // Verificar que el producto existe
    const product = getProductById(id);
    if (!product) {
        return {
            success: false,
            message: 'Producto no encontrado'
        };
    }
    
    // Verificar si tiene movimientos
    const movements = getMovementsByProduct(id);
    if (movements.length > 0) {
        // Por política, no eliminamos productos con historial
        // Podríamos hacerlo de todas formas, o solo permitirlo a admin
        log('Producto tiene movimientos, pero se eliminará de todas formas');
    }
    
    // Eliminar producto
    const deleted = deleteProduct(id);
    
    if (deleted) {
        log('Producto eliminado:', product.name);
        return {
            success: true,
            message: 'Producto eliminado exitosamente'
        };
    } else {
        return {
            success: false,
            message: 'Error al eliminar el producto'
        };
    }
}

// ========================================
// BÚSQUEDA Y FILTRADO
// ========================================

/**
 * Busca productos por texto
 * @param {string} searchText - Texto de búsqueda
 * @returns {Array} Productos encontrados
 */
function searchProducts(searchText) {
    const products = getProducts();
    if (!searchText) return products;
    
    return filterByText(products, searchText, ['code', 'name', 'description', 'category']);
}

/**
 * Filtra productos por categoría
 * @param {string} category - Categoría
 * @returns {Array} Productos filtrados
 */
function filterProductsByCategory(category) {
    const products = getProducts();
    if (!category) return products;
    
    return products.filter(p => p.category === category);
}

/**
 * Filtra productos por nivel de stock
 * @param {string} level - Nivel (bajo, normal, alto)
 * @returns {Array} Productos filtrados
 */
function filterProductsByStockLevel(level) {
    const products = getProducts();
    
    switch (level) {
        case 'bajo':
            return products.filter(p => p.stock <= p.minStock);
        case 'normal':
            return products.filter(p => {
                const percentage = (p.stock / p.minStock) * 100;
                return p.stock > p.minStock && percentage <= 150;
            });
        case 'alto':
            return products.filter(p => {
                const percentage = (p.stock / p.minStock) * 100;
                return percentage > 150;
            });
        default:
            return products;
    }
}

/**
 * Aplica múltiples filtros a los productos
 * @param {Object} filters - Objeto con filtros
 * @returns {Array} Productos filtrados
 */
function applyProductFilters(filters) {
    let products = getProducts();
    
    // Filtrar por búsqueda de texto
    if (filters.search) {
        products = filterByText(products, filters.search, ['code', 'name', 'description', 'category']);
    }
    
    // Filtrar por categoría
    if (filters.category) {
        products = products.filter(p => p.category === filters.category);
    }
    
    // Filtrar por nivel de stock
    if (filters.stockLevel) {
        const level = filters.stockLevel;
        products = products.filter(p => {
            const status = getStockStatus(p.stock, p.minStock);
            
            if (level === 'bajo') return p.stock <= p.minStock;
            if (level === 'normal') return status.badge === 'badge-stock-normal';
            if (level === 'alto') return status.badge === 'badge-stock-alto';
            
            return true;
        });
    }
    
    return products;
}

// ========================================
// ORDENAMIENTO
// ========================================

/**
 * Ordena productos por campo
 * @param {Array} products - Array de productos
 * @param {string} field - Campo por el que ordenar
 * @param {string} direction - Dirección (asc, desc)
 * @returns {Array} Productos ordenados
 */
function sortProducts(products, field, direction = 'asc') {
    const sorted = [...products];
    
    sorted.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        
        // Manejar strings
        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }
        
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
    
    return sorted;
}

// ========================================
// ESTADÍSTICAS DE PRODUCTOS
// ========================================

/**
 * Obtiene estadísticas de un producto
 * @param {string} productId - ID del producto
 * @returns {Object} Estadísticas del producto
 */
function getProductStatistics(productId) {
    const product = getProductById(productId);
    if (!product) return null;
    
    const movements = getMovementsByProduct(productId);
    
    const totalEntradas = movements
        .filter(m => m.type === 'entrada')
        .reduce((sum, m) => sum + m.quantity, 0);
    
    const totalSalidas = movements
        .filter(m => m.type === 'salida')
        .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    
    const stockValue = product.stock * product.price;
    const status = getStockStatus(product.stock, product.minStock);
    
    return {
        product,
        totalEntradas,
        totalSalidas,
        totalMovements: movements.length,
        stockValue,
        status,
        needsRestock: product.stock <= product.minStock
    };
}

/**
 * Obtiene resumen de todos los productos
 * @returns {Object} Resumen general
 */
function getProductsSummary() {
    const products = getProducts();
    
    return {
        total: products.length,
        totalStock: products.reduce((sum, p) => sum + p.stock, 0),
        totalValue: products.reduce((sum, p) => sum + (p.stock * p.price), 0),
        lowStock: products.filter(p => p.stock <= p.minStock).length,
        outOfStock: products.filter(p => p.stock === 0).length,
        categories: [...new Set(products.map(p => p.category))].length
    };
}

// ========================================
// EXPORTACIÓN
// ========================================

/**
 * Prepara datos de productos para exportar
 * @returns {Array} Datos formateados para CSV
 */
function prepareProductsForExport() {
    const products = getProducts();
    
    return products.map(p => {
        const status = getStockStatus(p.stock, p.minStock);
        return {
            'Código': p.code,
            'Nombre': p.name,
            'Categoría': p.category,
            'Precio': formatCurrency(p.price),
            'Stock': p.stock,
            'Stock Mínimo': p.minStock,
            'Estado': status.text,
            'Valor en Stock': formatCurrency(p.stock * p.price),
            'Creado': formatDate(p.createdAt)
        };
    });
}

/**
 * Exporta productos a CSV
 */
function exportProductsToCSV() {
    const data = prepareProductsForExport();
    exportToCSV(data, 'productos');
}
