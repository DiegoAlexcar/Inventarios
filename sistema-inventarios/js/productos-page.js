/**
 * PRODUCTOS-PAGE.JS - Lógica de la página de productos
 */

// ========================================
// VARIABLES GLOBALES
// ========================================

let currentFilters = {
    search: '',
    category: '',
    stockLevel: ''
};

let productToDelete = null;

// ========================================
// INICIALIZACIÓN
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeProductsPage();
});

function initializeProductsPage() {
    loadProducts();
    loadCategoryFilters();
    setupEventListeners();
    
    log('Página de productos inicializada');
}

// ========================================
// CARGA DE PRODUCTOS
// ========================================

function loadProducts() {
    const products = applyProductFilters(currentFilters);
    const tbody = document.getElementById('productsTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (products.length === 0) {
        tbody.parentElement.classList.add('d-none');
        emptyState?.classList.remove('d-none');
        return;
    }
    
    tbody.parentElement.classList.remove('d-none');
    emptyState?.classList.add('d-none');
    
    products.forEach(product => {
        const row = createProductRow(product);
        tbody.appendChild(row);
    });
    
    log(`${products.length} productos cargados`);
}

function createProductRow(product) {
    const row = document.createElement('tr');
    const status = getStockStatus(product.stock, product.minStock);
    const isAdmin = hasRole('admin');
    
    row.innerHTML = `
        <td class="text-code">${product.code}</td>
        <td><strong>${product.name}</strong></td>
        <td>${product.category}</td>
        <td>${formatCurrency(product.price)}</td>
        <td><strong>${product.stock}</strong></td>
        <td>${product.minStock}</td>
        <td>
            <span class="badge ${status.badge}">${status.text}</span>
        </td>
        <td class="text-center">
            <div class="btn-group btn-group-sm" role="group">
                <button class="btn btn-outline-info" onclick="viewProductDetails('${product.id}')" title="Ver detalles">
                    <i class="bi bi-eye"></i>
                </button>
                ${isAdmin ? `
                    <button class="btn btn-outline-primary" onclick="editProductById('${product.id}')" title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteProductById('${product.id}')" title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                ` : ''}
            </div>
        </td>
    `;
    
    return row;
}

// ========================================
// FORMULARIO DE PRODUCTO
// ========================================

function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');
    
    // Limpiar formulario
    form.reset();
    document.getElementById('productId').value = '';
    
    // Cargar categorías
    loadCategoryOptions();
    
    if (productId) {
        // Modo edición
        const product = getProductById(productId);
        if (!product) {
            showToast('Producto no encontrado', 'error');
            return;
        }
        
        modalTitle.innerHTML = '<i class="bi bi-pencil me-2"></i>Editar Producto';
        
        // Rellenar formulario
        document.getElementById('productId').value = product.id;
        document.getElementById('productCode').value = product.code;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productStock').disabled = true; // No editar stock directamente
        document.getElementById('productMinStock').value = product.minStock;
        document.getElementById('productDescription').value = product.description || '';
    } else {
        // Modo creación
        modalTitle.innerHTML = '<i class="bi bi-plus-circle me-2"></i>Nuevo Producto';
        document.getElementById('productStock').disabled = false;
    }
}

function setupEventListeners() {
    const form = document.getElementById('productForm');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const stockFilter = document.getElementById('stockFilter');
    
    if (form) {
        form.addEventListener('submit', handleProductSubmit);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            currentFilters.search = searchInput.value;
            loadProducts();
        }, 300));
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            currentFilters.category = categoryFilter.value;
            loadProducts();
        });
    }
    
    if (stockFilter) {
        stockFilter.addEventListener('change', () => {
            currentFilters.stockLevel = stockFilter.value;
            loadProducts();
        });
    }
}

function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const isEdit = !!productId;
    
    const productData = {
        code: document.getElementById('productCode').value.trim(),
        name: document.getElementById('productName').value.trim(),
        category: document.getElementById('productCategory').value,
        price: document.getElementById('productPrice').value,
        stock: document.getElementById('productStock').value,
        minStock: document.getElementById('productMinStock').value,
        description: document.getElementById('productDescription').value.trim()
    };
    
    let result;
    if (isEdit) {
        result = editProduct(productId, productData);
    } else {
        result = createProduct(productData);
    }
    
    if (result.success) {
        showToast(result.message, 'success');
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        modal.hide();
        
        // Recargar productos
        loadProducts();
        
        // Si es creación, agregar movimiento de entrada inicial
        if (!isEdit && Number(productData.stock) > 0) {
            registerEntry({
                productId: result.product.id,
                quantity: Number(productData.stock),
                reason: 'Stock inicial',
                notes: 'Creación de producto'
            });
        }
    } else {
        showToast(result.message, 'error');
    }
}

// ========================================
// ACCIONES DE PRODUCTO
// ========================================

function editProductById(productId) {
    if (!canEditProducts()) {
        showToast('No tienes permisos para editar productos', 'error');
        return;
    }
    
    openProductModal(productId);
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

function deleteProductById(productId) {
    if (!canDeleteProducts()) {
        showToast('No tienes permisos para eliminar productos', 'error');
        return;
    }
    
    const product = getProductById(productId);
    if (!product) {
        showToast('Producto no encontrado', 'error');
        return;
    }
    
    productToDelete = productId;
    
    document.getElementById('deleteProductName').textContent = product.name;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

function confirmDelete() {
    if (!productToDelete) return;
    
    const result = removeProduct(productToDelete);
    
    if (result.success) {
        showToast(result.message, 'success');
        loadProducts();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
    } else {
        showToast(result.message, 'error');
    }
    
    productToDelete = null;
}

function viewProductDetails(productId) {
    const product = getProductById(productId);
    if (!product) {
        showToast('Producto no encontrado', 'error');
        return;
    }
    
    const stats = getProductStatistics(productId);
    const status = getStockStatus(product.stock, product.minStock);
    
    const message = `
        <strong>${product.name}</strong><br>
        Código: ${product.code}<br>
        Categoría: ${product.category}<br>
        Precio: ${formatCurrency(product.price)}<br>
        Stock: ${product.stock} / ${product.minStock}<br>
        Estado: ${status.text}<br>
        Valor en stock: ${formatCurrency(stats.stockValue)}<br>
        Total movimientos: ${stats.totalMovements}
    `;
    
    showConfirmModal('Detalles del Producto', message, () => {}, 'Cerrar', 'btn-secondary');
}

// ========================================
// FILTROS
// ========================================

function loadCategoryFilters() {
    const categories = getCategories();
    const select = document.getElementById('categoryFilter');
    const selectForm = document.getElementById('productCategory');
    
    if (select) {
        select.innerHTML = '<option value="">Todas las categorías</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.name;
            option.textContent = cat.name;
            select.appendChild(option);
        });
    }
}

function loadCategoryOptions() {
    const categories = getCategories();
    const select = document.getElementById('productCategory');
    
    if (select) {
        select.innerHTML = '<option value="">Seleccionar categoría</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.name;
            option.textContent = cat.name;
            select.appendChild(option);
        });
    }
}

function clearFilters() {
    currentFilters = {
        search: '',
        category: '',
        stockLevel: ''
    };
    
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('stockFilter').value = '';
    
    loadProducts();
}
