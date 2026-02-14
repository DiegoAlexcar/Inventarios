/**
 * DASHBOARD.JS - Lógica de la página principal del dashboard
 */

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

function initializeDashboard() {
    loadDashboardStats();
    loadRecentMovements();
    loadLowStockProducts();
    
    log('Dashboard inicializado');
}

// ========================================
// ESTADÍSTICAS
// ========================================

function loadDashboardStats() {
    const stats = getInventoryStats();
    
    // Actualizar tarjetas de estadísticas
    document.getElementById('totalProducts').textContent = stats.totalProducts;
    document.getElementById('totalStock').textContent = stats.totalStock.toLocaleString();
    document.getElementById('lowStock').textContent = stats.lowStockProducts;
    document.getElementById('totalMovements').textContent = stats.movementsToday;
    
    log('Estadísticas del dashboard cargadas:', stats);
}

// ========================================
// MOVIMIENTOS RECIENTES
// ========================================

function loadRecentMovements() {
    const movements = getRecentMovements(5);
    const tbody = document.querySelector('#recentMovementsTable tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (movements.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    No hay movimientos registrados
                </td>
            </tr>
        `;
        return;
    }
    
    movements.forEach(movement => {
        const row = createMovementRow(movement);
        tbody.appendChild(row);
    });
}

function createMovementRow(movement) {
    const row = document.createElement('tr');
    
    const typeClass = movement.type === 'entrada' ? 'success' : 'danger';
    const typeIcon = movement.type === 'entrada' ? 'arrow-down-circle' : 'arrow-up-circle';
    const typeText = movement.type === 'entrada' ? 'Entrada' : 'Salida';
    
    row.innerHTML = `
        <td>${formatDate(movement.createdAt, true)}</td>
        <td>
            <strong>${movement.productName}</strong>
            <br>
            <small class="text-muted text-code">${movement.productCode}</small>
        </td>
        <td>
            <span class="badge badge-${movement.type}">
                <i class="bi bi-${typeIcon} me-1"></i>${typeText}
            </span>
        </td>
        <td><strong>${Math.abs(movement.quantity)}</strong> unidades</td>
        <td>${movement.userName}</td>
    `;
    
    return row;
}

// ========================================
// PRODUCTOS CON STOCK BAJO
// ========================================

function loadLowStockProducts() {
    const products = getLowStockProducts().slice(0, 5);
    const container = document.getElementById('lowStockList');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted py-3">
                <i class="bi bi-check-circle display-4 text-success"></i>
                <p class="mt-2 mb-0">Todos los productos tienen stock adecuado</p>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const item = createLowStockItem(product);
        container.appendChild(item);
    });
}

function createLowStockItem(product) {
    const div = document.createElement('div');
    div.className = 'low-stock-item';
    
    const percentage = (product.stock / product.minStock) * 100;
    const progressClass = product.stock === 0 ? 'bg-danger' : 
                         percentage <= 50 ? 'bg-danger' : 'bg-warning';
    
    div.innerHTML = `
        <h6>${product.name}</h6>
        <p class="mb-1">
            <span class="text-code">${product.code}</span>
            <span class="float-end">
                <strong>${product.stock}</strong> / ${product.minStock}
            </span>
        </p>
        <div class="progress">
            <div class="progress-bar ${progressClass}" 
                 role="progressbar" 
                 style="width: ${Math.min(percentage, 100)}%"
                 aria-valuenow="${percentage}" 
                 aria-valuemin="0" 
                 aria-valuemax="100">
            </div>
        </div>
    `;
    
    return div;
}

// ========================================
// ACTUALIZACIÓN AUTOMÁTICA
// ========================================

// Actualizar estadísticas cada 30 segundos
setInterval(() => {
    loadDashboardStats();
    log('Dashboard actualizado automáticamente');
}, 30000);
