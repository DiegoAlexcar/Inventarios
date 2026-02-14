/**
 * MOVIMIENTOS-PAGE.JS - Lógica de la página de movimientos
 */

// ========================================
// VARIABLES GLOBALES
// ========================================

let currentMovementFilters = {
    search: '',
    type: '',
    dateFrom: '',
    dateTo: '',
    productId: ''
};

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeMovementsPage();
});

function initializeMovementsPage() {
    loadMovements();
    loadProductFilters();
    setupMovementEventListeners();
    
    log('Página de movimientos inicializada');
}

// ========================================
// CARGA DE MOVIMIENTOS
// ========================================

function loadMovements() {
    const movements = getFilteredMovements(currentMovementFilters);
    const tbody = document.getElementById('movementsTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (movements.length === 0) {
        tbody.parentElement.classList.add('d-none');
        emptyState?.classList.remove('d-none');
        return;
    }
    
    tbody.parentElement.classList.remove('d-none');
    emptyState?.classList.add('d-none');
    
    movements.forEach(movement => {
        const row = createMovementTableRow(movement);
        tbody.appendChild(row);
    });
    
    log(`${movements.length} movimientos cargados`);
}

function createMovementTableRow(movement) {
    const row = document.createElement('tr');
    const typeClass = movement.type === 'entrada' ? 'success' : 'danger';
    const typeIcon = movement.type === 'entrada' ? 'arrow-down-circle' : 'arrow-up-circle';
    const typeText = movement.type === 'entrada' ? 'Entrada' : 'Salida';
    
    row.innerHTML = `
        <td>${formatDate(movement.createdAt, true)}</td>
        <td>
            <strong>${movement.productName}</strong><br>
            <small class="text-muted text-code">${movement.productCode}</small>
        </td>
        <td>
            <span class="badge badge-${movement.type}">
                <i class="bi bi-${typeIcon} me-1"></i>${typeText}
            </span>
        </td>
        <td><strong>${Math.abs(movement.quantity)}</strong></td>
        <td>
            ${movement.reason}
            ${movement.notes ? `<br><small class="text-muted">${movement.notes}</small>` : ''}
        </td>
        <td>${movement.userName}</td>
        <td>${movement.previousStock}</td>
        <td><strong>${movement.newStock}</strong></td>
    `;
    
    return row;
}

// ========================================
// MODAL DE MOVIMIENTO
// ========================================

function openMovementModal(type) {
    const modal = document.getElementById('movementModal');
    const form = document.getElementById('movementForm');
    const modalHeader = document.getElementById('modalHeader');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');
    const movementInfo = document.getElementById('movementInfo');
    
    // Limpiar formulario
    form.reset();
    document.getElementById('movementType').value = type;
    
    // Cargar productos
    loadProductsForMovement();
    
    // Configurar modal según tipo
    if (type === 'entrada') {
        modalHeader.className = 'modal-header bg-success text-white';
        modalTitle.innerHTML = '<i class="bi bi-arrow-down-circle me-2"></i>Registrar Entrada';
        submitBtn.className = 'btn btn-success';
        movementInfo.textContent = 'Registre la entrada de productos al inventario';
    } else {
        modalHeader.className = 'modal-header bg-danger text-white';
        modalTitle.innerHTML = '<i class="bi bi-arrow-up-circle me-2"></i>Registrar Salida';
        submitBtn.className = 'btn btn-danger';
        movementInfo.textContent = 'Registre la salida de productos del inventario';
    }
    
    // Cargar razones
    loadReasons(type);
}

function setupMovementEventListeners() {
    const form = document.getElementById('movementForm');
    const productSelect = document.getElementById('movementProduct');
    const quantityInput = document.getElementById('movementQuantity');
    
    if (form) {
        form.addEventListener('submit', handleMovementSubmit);
    }
    
    if (productSelect) {
        productSelect.addEventListener('change', updateCurrentStock);
    }
    
    if (quantityInput) {
        quantityInput.addEventListener('input', validateMovementQuantity);
    }
    
    // Filtros
    const searchInput = document.getElementById('searchMovement');
    const typeFilter = document.getElementById('typeFilter');
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    const productFilter = document.getElementById('productFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            currentMovementFilters.search = searchInput.value;
            loadMovements();
        }, 300));
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', () => {
            currentMovementFilters.type = typeFilter.value;
            loadMovements();
        });
    }
    
    if (dateFrom) {
        dateFrom.addEventListener('change', () => {
            currentMovementFilters.dateFrom = dateFrom.value;
            loadMovements();
        });
    }
    
    if (dateTo) {
        dateTo.addEventListener('change', () => {
            currentMovementFilters.dateTo = dateTo.value;
            loadMovements();
        });
    }
    
    if (productFilter) {
        productFilter.addEventListener('change', () => {
            currentMovementFilters.productId = productFilter.value;
            loadMovements();
        });
    }
}

function loadProductsForMovement() {
    const products = getProducts();
    const select = document.getElementById('movementProduct');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccionar producto</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.code} - ${product.name}`;
        option.dataset.stock = product.stock;
        select.appendChild(option);
    });
}

function loadReasons(type) {
    const reasons = getReasonsByType(type);
    const select = document.getElementById('movementReason');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">Seleccionar razón</option>';
    
    reasons.forEach(reason => {
        const option = document.createElement('option');
        option.value = reason;
        option.textContent = reason;
        select.appendChild(option);
    });
}

function updateCurrentStock() {
    const productSelect = document.getElementById('movementProduct');
    const stockDisplay = document.getElementById('currentStock');
    
    if (!productSelect || !stockDisplay) return;
    
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    
    if (selectedOption.value) {
        const stock = selectedOption.dataset.stock;
        stockDisplay.textContent = stock;
    } else {
        stockDisplay.textContent = '0';
    }
}

function validateMovementQuantity() {
    const typeInput = document.getElementById('movementType');
    const productSelect = document.getElementById('movementProduct');
    const quantityInput = document.getElementById('movementQuantity');
    const movementInfo = document.getElementById('movementInfo');
    
    if (!typeInput || !productSelect || !quantityInput || !movementInfo) return;
    
    const type = typeInput.value;
    const productId = productSelect.value;
    const quantity = Number(quantityInput.value);
    
    if (!productId || !quantity) {
        movementInfo.textContent = type === 'entrada' 
            ? 'Registre la entrada de productos al inventario'
            : 'Registre la salida de productos del inventario';
        movementInfo.className = 'alert alert-info mb-0';
        return;
    }
    
    const result = canPerformMovement(productId, type, quantity);
    
    if (!result.canMove) {
        movementInfo.textContent = result.message;
        movementInfo.className = 'alert alert-danger mb-0';
    } else {
        const product = getProductById(productId);
        const newStock = type === 'entrada' 
            ? product.stock + quantity 
            : product.stock - quantity;
        
        movementInfo.textContent = `Stock actual: ${product.stock} → Nuevo stock: ${newStock}`;
        movementInfo.className = 'alert alert-success mb-0';
    }
}

function handleMovementSubmit(e) {
    e.preventDefault();
    
    const type = document.getElementById('movementType').value;
    const productId = document.getElementById('movementProduct').value;
    const quantity = Number(document.getElementById('movementQuantity').value);
    const reason = document.getElementById('movementReason').value;
    const notes = document.getElementById('movementNotes').value.trim();
    
    const movementData = {
        productId,
        type,
        quantity,
        reason,
        notes
    };
    
    let result;
    if (type === 'entrada') {
        result = registerEntry(movementData);
    } else {
        result = registerExit(movementData);
    }
    
    if (result.success) {
        showToast(result.message, 'success');
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('movementModal'));
        modal.hide();
        
        // Recargar movimientos
        loadMovements();
    } else {
        showToast(result.message, 'error');
    }
}

// ========================================
// FILTROS
// ========================================

function loadProductFilters() {
    const products = getProducts();
    const select = document.getElementById('productFilter');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">Todos los productos</option>';
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.code} - ${product.name}`;
        select.appendChild(option);
    });
}

function clearMovementFilters() {
    currentMovementFilters = {
        search: '',
        type: '',
        dateFrom: '',
        dateTo: '',
        productId: ''
    };
    
    document.getElementById('searchMovement').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('dateFrom').value = '';
    document.getElementById('dateTo').value = '';
    document.getElementById('productFilter').value = '';
    
    loadMovements();
}
