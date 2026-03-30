# Proyecto de Refactorización y Escalabilidad - Vaplux

## Contexto y Estado Actual del Proyecto

Actualmente, Vaplux cuenta con una base de código funcional pero con limitaciones arquitectónicas que dificultan su crecimiento y administración diaria:
- **Catálogo Rígido (Hardcodeado):** Los productos, imágenes y precios están escritos directamente en el código fuente de la página. Esto significa que para alterar un precio, pausar el stock de un iPhone o agregar un modelo nuevo, es necesario modificar el código y volver a subir la web a internet manualemente.
- **Precios en $0:** Gran parte del catálogo actual no tiene precios asignados o carece de cotización en tiempo real.
- **Falta de Gestión Autónoma:** No existe un panel de control donde un administrador pueda gestionar el inventario sin conocimientos de programación.
- **Arquitectura de Estilos:** La estructura visual actual mezcla código moderno (Tailwind CSS) con prácticas antiguas (archivos CSS masivos globales), lo que hace que modificar el diseño o agregar secciones (ej. promociones) sea más lento de programar y propenso a romper otras partes de la web.

Esta propuesta busca transformar esta "vidriera rígida" en un sistema E-commerce dinámico, autoadministrable e inteligente, preparado a nivel base de datos para futuras expansiones (IA, pasarelas automáticas).

---

A continuación se detalla el plan de trabajo para la refactorización técnica de la plataforma Vaplux, dividiendo el proyecto en dos fases. Se incluye el detalle de implementación de cada punto, junto con su estimación en horas y costo (basado en una tarifa de $13 USD/hora), para que puedas priorizar qué elementos desarrollar.

---

## FASE 1: Estructuración y Panel Administrativo

### 1. Refactorización Estética
*   **Detalle de Implementación:** 
    *   Rediseño de la página de inicio (Home) y del listado de productos para mejorar la navegación.
    *   Desarrollo de un nuevo componente dinámico dedicado exclusivamente a "Promociones".
    *   Limpieza y reestructuración del código CSS actual (migrando estilos globales directamente a Tailwind CSS para mejorar la mantenibilidad del código fuente).
*   **Estimación:** 10 - 14 horas
*   **Costo:** $130 - $182 USD

### 2. Base de Datos Nube (Supabase)
*   **Detalle de Implementación:** 
    *   Eliminación del archivo actual donde los productos están "quemados" (hardcodeados) en el código.
    *   Creación de tablas relacionales en **Supabase** (PostgreSQL) para Productos, Categorías y Promociones, con campos estructurados (precio, stock, link_meli, etc.).
    *   Configuración de Supabase Storage para alojar las imágenes de los productos.
    *   Desarrollo de las conexiones Server-Side (desde el servidor) para que la página web lea estos datos de forma segura al cargar.
*   **Estimación:** 8 - 12 horas
*   **Costo:** $104 - $156 USD

### 3. Panel de Administración (Backoffice)
*   **Detalle de Implementación:** 
    *   Desarrollo de una ruta privada (`/admin`) protegida por autenticación mediante usuario y contraseña.
    *   Creación de una interfaz o "Dashboard" (CRUD) para listar, agregar, editar y eliminar productos (modificando precios, cantidades y promociones en tiempo real).
    *   Programación de un script conversor para permitir la **importación masiva mediante Excel** (para crear docenas de productos de un solo golpe) y la **exportación del inventario** a formatos Excel o PDF para control externo.
*   **Estimación:** 15 - 20 horas
*   **Costo:** $195 - $260 USD

### 4. Página de Producto y Cotizador Dinámico
*   **Detalle de Implementación:** 
    *   Creación de la vista individual de producto (ya sea una nueva página `/product/[slug]` o un Modal emergente estructurado).
    *   Inyección de opciones condicionales de compra: "Agregar al carrito", "Botón a WhatsApp" (que arma un mensaje automático) o "Botón a MercadoLibre" (que te redirige al link guardado en la base de datos).
    *   **Cotización API:** Integración de una API externa gratuita (ej. DolarApi) que obtenga la cotización actual en Argentina. El sistema leerá el precio en la base (pesos o dólares) y hará la conversión matemática en tiempo real para mostrar el precio actualizado al usuario.
*   **Estimación:** 6 - 9 horas
*   **Costo:** $78 - $117 USD

### 5. Configuración ManyChat (Instagram)
*   **Detalle de Implementación:** 
    *   Trabajo fuera del código fuente de la página. Consiste en mapear y configurar árboles de respuesta automática en la plataforma ManyChat, vinculada a tu cuenta de Instagram.
    *   El objetivo es que palabras clave accionen mensajes automáticos que deriven el tráfico hacia el sitio web o a un cierre manual.
*   **Estimación:** 3 - 5 horas
*   **Costo:** $39 - $65 USD

### 6. Integración de Analíticas (Web Analytics)
*   **Detalle de Implementación:** 
    *   Conexión de la página con Vercel Web Analytics o Google Analytics para monitorear el tráfico, visitantes únicos y determinar qué productos reciben más clics.
*   **Estimación:** 2 - 3 horas
*   **Costo:** $26 - $39 USD

---

## Resumen Presupuestario (Fase 1)

*   **Horas totales estimadas:** 44 a 63 horas.
*   **Valor Mínimo Estimado:** $572 USD
*   **Valor Máximo Estimado:** $819 USD
*   *(Nota: Puedes elegir qué módulos desarrollar primero para ajustar el presupuesto según las prioridades actuales de tu negocio).*

---

## POSIBLE FASE 2: Inteligencia Artificial y Pasarelas

Los siguientes desarrollos se proponen para una segunda fase, una vez que la base de datos (Supabase) esté consolidada con producto y stock reales.

### 1. Chatbot Integrado en la Web (Vertex AI / Embeddings)
*   **Detalle:** Utilizar el soporte nativo de Supabase (`pgvector`) para guardar versiones vectoriales ("Embeddings") de tu catálogo. Luego, conectar un bot en la página web con IA que pueda responder dudas técnicas sobre un celular específico basándose **únicamente** en tu stock y descripciones cargadas.

### 2. Pasarela de Pagos (MercadoPago / Tienda Nube)
*   **Detalle:** Reemplazar (o complementar) la compra delegada a WhatsApp con un *Checkout* real dentro de la web. Implica manejar carritos guardados en base de datos, integrarse con la API de Preferencias de MercadoPago para procesar tarjetas, y gestionar el webhook para confirmar que el dinero ingresó antes de restar stock.

### 3. Chatbot Avanzado en Instagram
*   **Detalle:** Intervenir el flujo básico de ManyChat con herramientas de IA externas. El bot de Instagram podrá conversar fluidamente, recomendar celulares según el presupuesto que el cliente le escriba y finalmente armar el pedido para enviarlo al equipo de WhatsApp para el cobro final.
