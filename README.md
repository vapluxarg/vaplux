# Vaplux E-Commerce Platform

Plataforma de comercio electrónico Full-Stack de alto rendimiento, diseñada para la venta de productos tecnológicos premium (dispositivos Apple, accesorios Fantech, etc.). El proyecto está construido para ser completamente autoadministrable, escalable y con una estética *Dark Mode* de primer nivel (Stitch Design System).

---

## 🌟 1. Funcionalidades Principales de la Solución

El proyecto resuelve la necesidad de tener un e-commerce administrable e inteligente que elimine la dependencia de modificar código fuente para actualizar el catálogo.

### **Experiencia del Cliente (Frontend Tienda)**
- **Catálogo Dinámico e Inteligente:** Navegación ultra rápida con filtros por categorías y subcategorías que leen la información en tiempo real desde la base de datos.
- **Cotizador Multimoneda:** Los productos pueden estar almacenados en USD, pero el sistema consulta la cotización mediante APIs y muestra dinámicamente el precio convertido a la moneda local.
- **Flujos de Compra Flexibles:** Páginas de producto individuales diseñadas para alta conversión con tres opciones de acción: Agregar al carrito, derivar la compra a **WhatsApp** (con mensaje prearmado) o redirigir directamente a la publicación oficial en **MercadoLibre**.
- **Diseño Premium *Dark Mode*:** Interfaz de usuario (UI) responsiva, basada en glassmorphism, gradientes futuristas y animaciones fluidas diseñadas para transmitir confianza y tecnología.
- **Captura de Leads (Email Marketing):** Sistema integrado en el footer y promociones para capturar correos de interesados y sincronizarlos automáticamente.

### **Panel de Administración (Backoffice Multitenant)**
- **Gestión Multi-Tienda:** Arquitectura preparada para manejar inventarios de distintas tiendas o marcas (ej. Vaplux y Fantech) desde el mismo sistema central.
- **CRUD Completo:** Interfaz intuitiva y segura para Crear, Leer, Actualizar y Eliminar productos, categorías y promociones sin tocar una sola línea de código.
- **Subida Nativa de Medios:** Integración de carga de imágenes (Drag & Drop) directamente desde el formulario de producto hacia el almacenamiento en la nube, vinculando la URL generada automáticamente al producto.
- **Listas de Precios y Actualizaciones Masivas:** Herramienta dedicada a la actualización de precios o stock de forma masiva mediante la carga de planillas de cálculo (Excel/CSV), vital para la volatilidad económica.
- **Seguridad Perimetral:** Acceso restringido únicamente a usuarios autorizados mediante un flujo de login real y robusto.

---

## 🏗️ 2. Arquitectura y Stack Tecnológico

La solución abandona el paradigma estático anterior en favor de una arquitectura moderna, "Serveless" y conectada a servicios remotos escalables (BaaS).

### **Frontend & Framework Base**
- **Next.js 14 (Pages Router):** Framework principal de React para renderizado, enrutamiento y funciones serverless.
- **React.js:** Para la construcción de interfaces interactivas y manejo de estado.
- **Tailwind CSS:** Motor de estilos utility-first, extendido con variables nativas para lograr el Premium "Stitch Design".
- **Framer Motion:** (Opcional/Utilizado para micro-interacciones y animaciones de UI fluidas).

### **Backend & Base de Datos**
- **Supabase (BaaS):** Plataforma central que reemplaza un backend tradicional, proporcionando todo el ecosistema de infraestructura:
  - **PostgreSQL Database:** Base de datos relacional robusta que aloja el esquema de Productos, Categorías, y Promociones.
  - **Supabase Auth:** Sistema de autenticación JWT con Row-Level Security (RLS) para proteger los endpoints del admin panel.
  - **Supabase Storage:** Buckets de almacenamiento en la nube CDN-ready para alojar las imágenes de los productos.

### **Marketing, Analíticas e Integraciones**
- **Resend API:** Plataforma utilizada para el envío programático de correos y la gestión de leads (Suscripción).
- **Vercel Web Analytics:** Proporciona métricas de rendimiento y visitantes en tiempo real.
- **Event Tracking Personalizado:** Módulos de analíticas in-app para hacer seguimiento de interacciones específicas (clics en productos, vistas de promociones).

---

## 🛠️ 3. Implementación Técnica y Componentes

### **Estructura del Proyecto**

```text
vaplux/
├── components/          # Componentes modulares de interfaz (UI) de React
│   ├── home/            # Componentes específicos de la Landing Page
│   ├── admin/           # Componentes exclusivos del Backoffice
│   ├── Navbar.jsx       # Navegación global
│   └── Footer.jsx       # Pie de página (con integración Resend)
│
├── pages/               # Enrutador de Next.js (Sistema de Páginas)
│   ├── admin/           # Rutas privadas protegidas por Supabase Auth
│   ├── product/         # Vistas dinámicas [slug].js generadas por producto
│   ├── api/             # Endpoints (Serverless Functions) para lógica de servidor (Resend, etc.)
│   └── index.js         # Página principal generada dinámicamente
│
├── utils/               # Lógica de negocio, helpers y configuraciones globales
│   ├── analytics.js     # Módulo central de Event Tracking
│   └── supabase.js      # Instancia Singleton de conexión con la Base de Datos
│
├── styles/              # Archivos de configuración visual globales
│   └── globals.css      # Reglas puras y directivas Tailwind
│
├── public/              # Archivos estáticos, fuentes e iconos
└── tailwind.config.js   # Tokens de diseño, colores premium (Stitch Design) y plugins
```

### **Módulos Claves a Nivel de Código**

1. **Gestión de Sesión (Supabase Auth):**
   Dentro del directorio `/pages/admin/` e inicializado en los Layouts o contexts, la aplicación verifica el JWT de la sesión actual de Supabase. Si el token es inválido o no existe, el componente redirige mediante `next/router` o middleware hacia `/login`.
   
2. **Obtención de Datos (Data Fetching):**
   Las vistas de la tienda pública aprovechan los métodos de ciclo de vida de Next.js (`getServerSideProps` o `getStaticProps` apoyados en hooks del lado cliente como SWR) para consultar directamente la API de Supabase mediante su cliente JS (`supabase.from('products').select('*')`). Esto garantiza que el usuario siempre vea stock real.

3. **Tracking y Analíticas (`utils/analytics.js`):**
   Abstracción técnica que captura eventos sintéticos (como clicks en "Comprar" o "Ver Detalle") y los emite hacia la capa proveedora de analíticas, permitiendo a Vercel Analytics (u otras herramientas futuras como Google Tag Manager) agrupar los flujos de comportamiento de usuario.

4. **Sistema de Tematización (Stitch Design Flow):**
   Alojado como una mezcla entre `tailwind.config.js` y clases maestras. Utiliza un esquema de diseño ultra-contrastado. Las clases estandarizadas facilitan que nuevos componentes hereden los gradientes y el "glass effect" sin escribir CSS de cero.

---

## 📦 Configuración Local y Despliegue

### Requisitos Previos
- Node.js (v18+)
- Credenciales de Supabase (URL y Anon Key)
- Credenciales de Resend API Key

### Instrucciones

1. Clonar el repositorio y acceder a la carpeta:
   ```bash
   git clone https://github.com/vapluxarg/vaplux.git
   cd vaplux
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Variables de Entorno:
   Crea un archivo `.env.local` en la raíz del proyecto y añade las credenciales necesarias:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   RESEND_API_KEY=tu_resend_api_key
   ```

4. Levantar el entorno de desarrollo:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

### Despliegue en Producción
El proyecto está completamente optimizado para ser desplegado en **Vercel**. Simplemente sincroniza este repositorio con tu cuenta de Vercel y asegúrate de cargar las variables de entorno dentro del panel de configuración del proyecto en Vercel.