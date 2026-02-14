/**
 * ESTADISTICAS.JS - Lógica de la página de estadísticas
 */

// ========================================
// VARIABLES GLOBALES
// ========================================

let movementChart = null;

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Verificar permisos
    if (!canViewStatistics()) {
        showToast('No tienes permisos para ver esta página', 'error');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        return;
    }
    
    initializeStatisticsPage();
});

function initializeStatisticsPage() {
    loadGeneralStats();
    loadTopProducts();
    loadCategoryDistribution();
    loadMovementChart();
    loadLowStockTable();
    loadUserActivity();
    
    log('Página de estadísticas inicializada');
}

// ========================================
// ESTADÍSTICAS GENERALES
// ========================================

function loadGeneralStats() {
    const stats = getInventoryStats();
    const monthMovements = getMonthMovements();
    
    const entradas = monthMovements.filter(m => m.type === 'entrada').length;
    const salidas = monthMovements.filter(m => m.type === 'salida').length;
    
    document.getElementById('totalValue').textContent = formatCurrency(stats.totalValue);
    document.getElementById('totalEntradas').textContent = entradas;
    document.getElementById('totalSalidas').textContent = salidas;
    document.getElementById('criticalProducts').textContent = stats.lowStockProducts;
    
    log('Estadísticas generales cargadas');
}

// ========================================
// PRODUCTOS MÁS MOVIDOS
// ========================================

function loadTopProducts() {
    const topProducts = getTopMovedProducts(5);
    const container = document.getElementById('topProductsChart');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (topProducts.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">No hay datos disponibles</p>';
        return;
    }
    
    topProducts.forEach((product, index) => {
        const item = document.createElement('div');
        item.className = 'mb-3';
        
        const maxMovements = topProducts[0].totalMovements;
        const percentage = (product.totalMovements / maxMovements) * 100;
        
        item.innerHTML = `
            <div class="d-flex justify-content-between mb-1">
                <div>
                    <strong>${index + 1}. ${product.name}</strong>
                    <span class="text-muted text-code ms-2">${product.code}</span>
                </div>
                <strong>${product.totalMovements} movimientos</strong>
            </div>
            <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-primary" 
                     style="width: ${percentage}%"
                     role="progressbar">
                </div>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// ========================================
// DISTRIBUCIÓN POR CATEGORÍA
// ========================================

function loadCategoryDistribution() {
    const products = getProducts();
    const container = document.getElementById('categoryChart');
    
    if (!container) return;
    
    const categoryData = {};
    
    products.forEach(p => {
        if (!categoryData[p.category]) {
            categoryData[p.category] = 0;
        }
        categoryData[p.category]++;
    });
    
    container.innerHTML = '';
    
    if (Object.keys(categoryData).length === 0) {
        container.innerHTML = '<p class="text-center text-muted">No hay datos disponibles</p>';
        return;
    }
    
    const sortedCategories = Object.entries(categoryData)
        .sort((a, b) => b[1] - a[1]);
    
    const total = products.length;
    
    sortedCategories.forEach(([category, count]) => {
        const percentage = (count / total * 100).toFixed(1);
        
        const item = document.createElement('div');
        item.className = 'mb-3';
        item.innerHTML = `
            <div class="d-flex justify-content-between mb-1">
                <strong>${category}</strong>
                <span>${count} productos (${percentage}%)</span>
            </div>
            <div class="progress" style="height: 10px;">
                <div class="progress-bar bg-info" 
                     style="width: ${percentage}%"
                     role="progressbar">
                </div>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// ========================================
// GRÁFICA DE MOVIMIENTOS
// ========================================

function loadMovementChart() {
    const canvas = document.getElementById('movementChart');
    if (!canvas) return;
    
    const data = getMovementsByDay(7);
    
    // Destruir gráfica anterior si existe
    if (movementChart) {
        movementChart.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    movementChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [
                {
                    label: 'Entradas',
                    data: data.map(d => d.entradas),
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Salidas',
                    data: data.map(d => d.salidas),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// ========================================
// TABLA DE STOCK BAJO
// ========================================

function loadLowStockTable() {
    const products = getLowStockProducts().slice(0, 10);
    const tbody = document.getElementById('lowStockTable');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    <i class="bi bi-check-circle text-success me-2"></i>
                    Todos los productos tienen stock adecuado
                </td>
            </tr>
        `;
        return;
    }
    
    products.forEach(product => {
        const status = getStockStatus(product.stock, product.minStock);
        const percentage = (product.stock / product.minStock * 100).toFixed(0);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${product.name}</strong><br>
                <small class="text-muted text-code">${product.code}</small>
            </td>
            <td><strong>${product.stock}</strong></td>
            <td>${product.minStock}</td>
            <td>
                <span class="badge ${status.badge}">${percentage}%</span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ========================================
// ACTIVIDAD POR USUARIO
// ========================================

function loadUserActivity() {
    const activity = getUserActivity();
    const container = document.getElementById('userActivityList');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (activity.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">No hay actividad registrada</p>';
        return;
    }
    
    activity.forEach(user => {
        const item = document.createElement('div');
        item.className = 'border-bottom pb-3 mb-3';
        item.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <i class="bi bi-person-circle me-2 text-primary"></i>
                    <strong>${user.userName}</strong>
                </div>
                <span class="badge bg-secondary">${user.totalMovements} movimientos</span>
            </div>
            <div class="row g-2">
                <div class="col-6">
                    <small class="text-muted">Entradas:</small>
                    <strong class="text-success ms-1">${user.entradas}</strong>
                </div>
                <div class="col-6">
                    <small class="text-muted">Salidas:</small>
                    <strong class="text-danger ms-1">${user.salidas}</strong>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

// ========================================
// EXPORTAR ESTADÍSTICAS
// ========================================

function exportStats() {
    const stats = getInventoryStats();
    const products = getProducts();
    const movements = getMovements();
    
    const reportData = {
        'Fecha del Reporte': formatDate(new Date(), true),
        'Total de Productos': stats.totalProducts,
        'Stock Total': stats.totalStock,
        'Valor Total del Inventario': formatCurrency(stats.totalValue),
        'Productos con Stock Bajo': stats.lowStockProducts,
        'Productos sin Stock': stats.outOfStockProducts,
        'Total de Movimientos': stats.totalMovements,
        'Movimientos Hoy': stats.movementsToday
    };
    
    // Crear CSV con datos generales
    const csvData = Object.entries(reportData).map(([key, value]) => ({
        'Indicador': key,
        'Valor': value
    }));
    
    exportToCSV(csvData, 'reporte_estadisticas');
    
    showToast('Reporte exportado exitosamente', 'success');
}
