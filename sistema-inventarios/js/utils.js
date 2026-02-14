/**
 * UTILS.JS - Funciones de utilidad generales
 * Sistema de Gestión de Inventarios
 */

// ========================================
// TOAST NOTIFICATIONS
// ========================================

/**
 * Muestra una notificación toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, warning, info)
 */
function showToast(message, type = 'info') {
    const toastElement = document.getElementById('liveToast');
    const toastBody = toastElement.querySelector('.toast-body');
    const toastIcon = toastElement.querySelector('.toast-icon');
    const toastTitle = toastElement.querySelector('.toast-title');
    
    // Configurar contenido
    toastBody.textContent = message;
    
    // Configurar icono y título según tipo
    toastElement.className = 'toast';
    toastElement.classList.add(`toast-${type}`);
    
    const config = {
        success: { icon: 'bi-check-circle-fill', title: 'Éxito' },
        error: { icon: 'bi-x-circle-fill', title: 'Error' },
        warning: { icon: 'bi-exclamation-triangle-fill', title: 'Advertencia' },
        info: { icon: 'bi-info-circle-fill', title: 'Información' }
    };
    
    const { icon, title } = config[type] || config.info;
    toastIcon.className = `bi me-2 toast-icon ${icon}`;
    toastTitle.textContent = title;
    
    // Mostrar toast
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });
    toast.show();
}

// ========================================
// FORMATO Y VALIDACIÓN
// ========================================

/**
 * Formatea un número como moneda
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Cantidad formateada
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Formatea una fecha
 * @param {string|Date} date - Fecha a formatear
 * @param {boolean} includeTime - Incluir hora
 * @returns {string} Fecha formateada
 */
function formatDate(date, includeTime = false) {
    const d = new Date(date);
    
    if (includeTime) {
        return new Intl.DateTimeFormat('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(d);
    }
    
    return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(d);
}

/**
 * Valida si una cadena está vacía
 * @param {string} str - Cadena a validar
 * @returns {boolean} true si está vacía
 */
function isEmpty(str) {
    return !str || str.trim().length === 0;
}

/**
 * Valida si un valor es un número positivo
 * @param {any} value - Valor a validar
 * @returns {boolean} true si es número positivo
 */
function isPositiveNumber(value) {
    return !isNaN(value) && Number(value) > 0;
}

// ========================================
// MODALES DE CONFIRMACIÓN
// ========================================

/**
 * Muestra un modal de confirmación
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje
 * @param {Function} onConfirm - Callback al confirmar
 * @param {string} confirmText - Texto del botón confirmar
 * @param {string} confirmClass - Clase CSS del botón
 */
function showConfirmModal(title, message, onConfirm, confirmText = 'Confirmar', confirmClass = 'btn-primary') {
    // Crear modal dinámicamente si no existe uno genérico
    let modal = document.getElementById('confirmModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'confirmModal';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn" id="confirmBtn">Confirmar</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-body').textContent = message;
    
    const confirmBtn = modal.querySelector('#confirmBtn');
    confirmBtn.textContent = confirmText;
    confirmBtn.className = `btn ${confirmClass}`;
    
    // Limpiar eventos anteriores
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', () => {
        const bsModal = bootstrap.Modal.getInstance(modal);
        bsModal.hide();
        onConfirm();
    });
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

// ========================================
// UTILIDADES DE DOM
// ========================================

/**
 * Limpia el contenido de un elemento
 * @param {string} elementId - ID del elemento
 */
function clearElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '';
    }
}

/**
 * Muestra/oculta un elemento
 * @param {string} elementId - ID del elemento
 * @param {boolean} show - true para mostrar, false para ocultar
 */
function toggleElement(elementId, show) {
    const element = document.getElementById(elementId);
    if (element) {
        if (show) {
            element.classList.remove('d-none');
        } else {
            element.classList.add('d-none');
        }
    }
}

// ========================================
// GENERADORES
// ========================================

/**
 * Genera un ID único
 * @returns {string} ID único
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Genera un código de producto único
 * @param {string} prefix - Prefijo del código
 * @returns {string} Código generado
 */
function generateProductCode(prefix = 'PROD') {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
}

// ========================================
// BÚSQUEDA Y FILTRADO
// ========================================

/**
 * Normaliza texto para búsqueda (quita acentos y convierte a minúsculas)
 * @param {string} text - Texto a normalizar
 * @returns {string} Texto normalizado
 */
function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Filtra un array de objetos por texto
 * @param {Array} items - Array de objetos
 * @param {string} searchText - Texto de búsqueda
 * @param {Array} fields - Campos donde buscar
 * @returns {Array} Items filtrados
 */
function filterByText(items, searchText, fields) {
    if (!searchText) return items;
    
    const normalized = normalizeText(searchText);
    
    return items.filter(item => {
        return fields.some(field => {
            const value = item[field];
            if (!value) return false;
            return normalizeText(value.toString()).includes(normalized);
        });
    });
}

// ========================================
// EXPORTACIÓN
// ========================================

/**
 * Exporta datos a CSV
 * @param {Array} data - Datos a exportar
 * @param {string} filename - Nombre del archivo
 */
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showToast('No hay datos para exportar', 'warning');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                // Escapar comas y comillas
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(',')
        )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${formatDate(new Date(), false).replace(/\//g, '-')}.csv`;
    link.click();
    
    showToast('Archivo exportado exitosamente', 'success');
}

// ========================================
// DEBOUNCE
// ========================================

/**
 * Función debounce para optimizar búsquedas
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función con debounce
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========================================
// ESTADÍSTICAS
// ========================================

/**
 * Calcula el porcentaje de cambio
 * @param {number} current - Valor actual
 * @param {number} previous - Valor anterior
 * @returns {number} Porcentaje de cambio
 */
function calculatePercentageChange(current, previous) {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
}

/**
 * Obtiene el estado del stock
 * @param {number} stock - Stock actual
 * @param {number} minStock - Stock mínimo
 * @returns {Object} Estado con texto y clase CSS
 */
function getStockStatus(stock, minStock) {
    const percentage = (stock / minStock) * 100;
    
    if (stock === 0) {
        return { text: 'Sin Stock', class: 'danger', badge: 'badge-stock-bajo' };
    } else if (stock <= minStock) {
        return { text: 'Stock Bajo', class: 'warning', badge: 'badge-stock-bajo' };
    } else if (percentage <= 150) {
        return { text: 'Stock Normal', class: 'success', badge: 'badge-stock-normal' };
    } else {
        return { text: 'Stock Alto', class: 'info', badge: 'badge-stock-alto' };
    }
}

// ========================================
// LOGS DE CONSOLA (SOLO DESARROLLO)
// ========================================

const DEBUG = true; // Cambiar a false en producción

function log(...args) {
    if (DEBUG) {
        console.log('[SISTEMA]', ...args);
    }
}

function logError(...args) {
    if (DEBUG) {
        console.error('[ERROR]', ...args);
    }
}
