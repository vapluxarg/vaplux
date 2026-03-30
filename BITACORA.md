# Bitácora de Proyecto: Vaplux E-Commerce (Fase 1)

Este documento centraliza el progreso general del proyecto enfocado estrictamente en la **FASE 1: Estructuración y Panel Administrativo**. 

---

## 🚀 Progreso de la Fase 1

### 1. Refactorización Estética
- [x] Rediseño de la página de inicio (Home) y del listado de productos para mejorar la navegación (`pages/home` y `pages/catalog`).
- [x] Desarrollo de un nuevo componente dinámico dedicado a "Promociones" (vía `Carousel.jsx`, `HighlightsGrid.jsx`).
- [x] Limpieza y reestructuración del código CSS actual (migrado en gran medida a Tailwind CSS, uso de variables nativas).
- [x] Refinar las clases personalizadas remanentes en `globals.css` hacia componentes limpios (Migrado con foco en diseño Stitch Dark Mode).

### 2. Base de Datos Nube (Supabase)
- [x] Creación de tablas relacionales en **Supabase** (PostgreSQL) para Productos, Categorías, Subcategorías, Promociones y Analíticas.
- [x] Configuración de campos clave (precio, stock, link de MercadoLibre, moneda preferida, etc).
- [x] Soporte Multi-tenant (preparación para múltiples tiendas usando el campo `store`).
- [x] Configuración final / UI del Storage de Supabase para subir/alojar las imágenes nativamente.
- [x] Correcciones de modelo DB (Integridad en Promociones, UNIQUE slug en Subcategorías, Índices de BD y Multi-tenant Vaplux/Fantech).
- [x] **Migración final:** Refactorizar el código frontend para dejar de leer definitivamente `data/products.js` (datos duros) y pasar a leer desde Supabase de manera dinámica (Server-Side).

### 3. Panel de Administración (Backoffice)
- [x] Desarrollo de la ruta privada (`/admin`) protegida por autenticación de Supabase Auth (`login.js`).
- [x] Creación de la estructura base del panel para operaciones CRUD (`admin/products`, `admin/categories`).
- [x] Interfaz y lógica base para la actualización masiva de precios/stock (`admin/bulk.js`).
- [x] Lógica de importación/exportación masiva mediante Excel (`BulkPricing.jsx` / `admin/bulk.js`).
- [x] Flujo final UI/UX para subir y adjuntar imágenes de productos directamente a Supabase Storage desde el form de creación.

### 4. Página de Producto y Cotizador Dinámico
- [x] Creación de la vista individual de producto (`pages/product/[slug].js`).
- [x] Inyección de opciones condicionales de compra ("Botón a WhatsApp" o "Botón a MercadoLibre" según disponibilidad) mapeado en los paneles laterales y `StickyBuyBar`.
- [ ] **Cotización API:** Integración de la API externa (ej. DolarApi) para obtener la cotización del dólar blue/oficial en tiempo real y hacer la conversión automática de ARS/USD en la página.

### 5. Configuración Externa e Integración
- [ ] Configuración de respuestas automáticas en ManyChat vinculadas a Instagram.
- [x] Conexión de la página con Vercel Web Analytics o Google Analytics para monitorear el tráfico real.
- [x] Implementación y auditoría de **Event Tracking** para interacción de usuarios con categorías y productos.
- [x] **Email Marketing**: Integración con **Resend** para captura de emails y promociones.

---

*(Este documento reemplaza cualquier planificación anterior y excluye módulos de Fase 2 para focalizar el esfuerzo actual).*
