# Sistema de Gestión de Inventarios Empresarial 📦

Sistema web completo de gestión de inventarios con control de stock automático, roles de usuario y reportes estadísticos. Desarrollado con tecnologías frontend puras sin requerir backend.

## 🚀 Características Principales

### Sistema de Roles
- **Administrador:** Control total del sistema
  - Crear, editar y eliminar productos
  - Definir y gestionar categorías
  - Visualizar estadísticas avanzadas
  - Acceso completo al historial

- **Empleado:** Operaciones diarias
  - Registrar entradas de productos
  - Registrar salidas de productos
  - Consultar inventario disponible
  - Ver historial de movimientos

### Gestión de Productos
- ✅ CRUD completo (Create, Read, Update, Delete)
- ✅ Validación de código único
- ✅ Control de stock mínimo
- ✅ Categorización flexible
- ✅ Búsqueda y filtrado en tiempo real
- ✅ Exportación a CSV

### Control de Inventario
- ✅ Registro de entradas (compras, devoluciones, etc.)
- ✅ Registro de salidas (ventas, pérdidas, etc.)
- ✅ Actualización automática de stock
- ✅ Validación de stock disponible
- ✅ Alertas de stock bajo
- ✅ Historial completo con auditoría

### Reportes y Estadísticas
- ✅ Dashboard con métricas en tiempo real
- ✅ Productos más movidos
- ✅ Distribución por categorías
- ✅ Gráficas de movimientos
- ✅ Alertas de productos críticos
- ✅ Actividad por usuario

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Estilos personalizados
- **Bootstrap 5** - Framework CSS responsive
- **JavaScript Vanilla** - Lógica de aplicación (ES6+)
- **localStorage** - Persistencia de datos
- **Chart.js** - Gráficas estadísticas
- **Bootstrap Icons** - Iconografía

## 📁 Estructura del Proyecto

```
sistema-inventarios/
│
├── index.html              # Página de login
├── dashboard.html          # Dashboard principal
├── productos.html          # Gestión de productos
├── movimientos.html        # Historial de movimientos
├── estadisticas.html       # Reportes y estadísticas
├── styles.css              # Estilos principales
│
├── js/
│   ├── utils.js           # Utilidades generales
│   ├── storage.js         # Gestión de localStorage
│   ├── auth.js            # Autenticación y autorización
│   ├── products.js        # Lógica de productos
│   ├── movements.js       # Lógica de movimientos
│   ├── login.js           # Página de login
│   ├── dashboard.js       # Dashboard principal
│   ├── productos-page.js  # Página de productos
│   ├── movimientos-page.js # Página de movimientos
│   └── estadisticas.js    # Página de estadísticas
│
├── README.md              # Este archivo
└── PROMPTS_IA_DOCUMENTACION.md  # Documentación de prompts IA
```

## 🚦 Inicio Rápido

### Instalación

1. **Clonar o descargar** el proyecto:
```bash
git clone [url-del-repositorio]
cd sistema-inventarios
```

2. **Abrir en un servidor local:**

Opción A - Usando Python:
```bash
python -m http.server 8000
```

Opción B - Usando Node.js (live-server):
```bash
npx live-server
```

Opción C - Abrir directamente:
- Simplemente abre `index.html` en tu navegador

3. **Acceder al sistema:**
```
http://localhost:8000
```

### Credenciales de Prueba

**Administrador:**
- Usuario: `admin`
- Contraseña: `admin123`

**Empleado:**
- Usuario: `empleado`
- Contraseña: `emp123`

## 📖 Guía de Uso

### 1. Inicio de Sesión
- Ingresa con una de las credenciales de prueba
- El sistema redirige automáticamente al dashboard

### 2. Dashboard
- Visualiza métricas generales del inventario
- Revisa movimientos recientes
- Identifica productos con stock bajo
- Accede a acciones rápidas

### 3. Gestión de Productos (Admin)
- **Crear:** Click en "Nuevo Producto"
  - Completa todos los campos requeridos
  - El sistema valida código único
- **Editar:** Click en icono de lápiz
  - Modifica la información (excepto stock)
- **Eliminar:** Click en icono de papelera
  - Confirma la eliminación

### 4. Registro de Movimientos
- **Entrada:** Click en "Registrar Entrada"
  - Selecciona producto y cantidad
  - Especifica motivo (compra, devolución, etc.)
- **Salida:** Click en "Registrar Salida"
  - Selecciona producto y cantidad
  - El sistema valida stock disponible

### 5. Consulta de Historial
- Filtra por tipo, fecha, producto
- Busca en tiempo real
- Exporta a CSV para análisis

### 6. Estadísticas (Admin)
- Visualiza gráficas de movimientos
- Identifica productos críticos
- Analiza distribución por categoría
- Revisa actividad por usuario

## 🔒 Seguridad

- Protección de rutas según rol de usuario
- Validación de permisos en cada acción
- Sesión persistente con localStorage
- No se exponen contraseñas en la sesión

## 💾 Almacenamiento

El sistema utiliza localStorage del navegador para persistir:
- Usuarios y sesiones
- Productos y categorías
- Movimientos e historial
- Configuraciones

**Nota:** Los datos se almacenan localmente en el navegador. Para producción, se recomienda implementar un backend real.

## 📊 Funcionalidades Destacadas

### Control Automático de Stock
```javascript
// Al registrar una entrada
Stock Actual: 10 → Nuevo Stock: 25 (+15)

// Al registrar una salida
Stock Actual: 25 → Nuevo Stock: 20 (-5)
```

### Alertas Inteligentes
- 🔴 Stock Bajo: Cuando stock ≤ stock mínimo
- ⚠️ Stock Crítico: Cuando stock = 0
- ✅ Stock Normal: Stock adecuado

### Auditoría Completa
Cada movimiento registra:
- Fecha y hora exacta
- Usuario que realizó la operación
- Producto afectado
- Stock anterior y nuevo
- Motivo y notas adicionales

## 🎨 Diseño y UX

- **Responsive:** Funciona en desktop, tablet y móvil
- **Intuitivo:** Interfaz clara y fácil de usar
- **Moderno:** Diseño limpio con Bootstrap 5
- **Notificaciones:** Toast notifications para feedback inmediato
- **Iconografía:** Bootstrap Icons para mejor comprensión

## 📈 Métricas del Sistema

- ~3,500 líneas de código
- 15 archivos totales
- 9 módulos JavaScript
- 5 páginas HTML
- 100% funcionalidad completada
- 0 dependencias externas (excepto Bootstrap y Chart.js)

## 🧪 Datos de Prueba

El sistema incluye datos de ejemplo:
- 2 usuarios (admin y empleado)
- 8 categorías predefinidas
- 5 productos de ejemplo
- Varios movimientos de muestra

Estos datos se pueden eliminar o modificar según necesidad.

## 🔧 Personalización

### Cambiar Colores
Edita las variables CSS en `styles.css`:
```css
:root {
    --primary: #2563eb;
    --success: #10b981;
    --danger: #ef4444;
    /* ... */
}
```

### Agregar Categorías
Edita el array en `storage.js`:
```javascript
const defaultCategories = [
    { id: '1', name: 'NuevaCategoria', description: 'Descripción' },
    // ...
];
```

### Personalizar Razones de Movimiento
Edita los arrays en `movements.js`:
```javascript
const ENTRY_REASONS = ['Compra', 'Devolución', ...];
const EXIT_REASONS = ['Venta', 'Pérdida', ...];
```

## 🐛 Solución de Problemas

### Los datos no persisten
- Verifica que localStorage esté habilitado
- Revisa la consola por errores
- Intenta en modo incógnito

### No puedo iniciar sesión
- Usa credenciales exactas (case-sensitive)
- Limpia localStorage: `localStorage.clear()`
- Recarga la página

### Las gráficas no aparecen
- Verifica que Chart.js esté cargando
- Revisa conexión a internet (CDN)
- Abre consola del navegador para ver errores

## 📝 Próximas Mejoras

- [ ] Backend real con API REST
- [ ] Base de datos SQL/NoSQL
- [ ] Autenticación con JWT
- [ ] Reportes en PDF
- [ ] Sistema de notificaciones por email
- [ ] Multi-empresa/multi-almacén
- [ ] Código de barras/QR
- [ ] Integración con sistemas de pago

## 👨‍💻 Desarrollo

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Editor de código (VS Code recomendado)
- Conocimientos de HTML, CSS, JavaScript

### Scripts de Desarrollo
```bash
# Iniciar servidor local
npm run serve

# Limpiar localStorage (en consola del navegador)
localStorage.clear()

# Ver todos los datos (en consola del navegador)
console.log(localStorage)
```

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📧 Contacto

Para preguntas, sugerencias o reportar bugs, por favor abre un issue en el repositorio.

---

**Desarrollado con ❤️ usando tecnologías web modernas**

*Sistema de Inventarios v1.0 - 2026*
