## FASE 1

1. Refactorización estética:
    a. Rediseñar el home y la sección de productos
    b. Generar un componente de promociones
    c. Acomodar la estructura del proyecto en cuanto a sus estilos

2. Migración de productos a Base de datos (Supabase)
    a. Dejar de utilizar un js hardcodeado y generar las tablas correspondientes en supabase con los campos que corresponda
    b. Tambien utilizar Storage para almacenar las imagenes de los productos
    c. Metodos en Server-side para la conexión

3. Creación de un Panel de Administración
    a. Un panel autenticado para gestionar el stock de productos y promociones
    b. El admin debe poder actualizar, agregar y eliminar productos, modificar precio, cantidades y promociones.
    c. Generación de un excel para la importación masiva de productos y exportación de productos a un excel/PDF

4. Página de producto
    a. Crear una página en la que se ven los detalles de un producto (puede ser tipo modal) que permita agregarlo al carrito, continuar la compra por WhatsApp o realizarla desde MercadoLibre (para esto uno de los campos de la base debe ser el link de MeLi)
    b. Los precios se cargarán en dólares o pesos y se debe obtener la cotización del dólar en Argentina para realizar la conversión. También debe mostrarse esa cotización actualizada.

5. FUERA DE LA PÁGINA: Integración de ManyChat en Instagram para respuestas automáticas


## POSIBLE FASE 2

1. Integración de chatbot dentro del sitio (embeddings, vertex AI)
2. Integración de pasarela de pagos (MercadoPago o Mi Tienda Nube)
3. FUERA DE LA PÁGINA: Hacer al chatbot en Instagram más inteligente, para que pueda tener toda una conversación con un cliente, obtener su pedido y derivarlo a WhatsApp para finalizar la compra.