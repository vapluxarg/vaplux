# Análisis de APIs: Verificación de Pagos y Movimientos Bancarios

Este documento resume la factibilidad técnica de automatizar la verificación de ingresos de dinero para evitar el fraude con comprobantes de transferencia falsos.

---

## 1. APIs de Banca General (Open Banking)

En Argentina, **no existe una API pública y unificada** que permita consultar movimientos de cualquier entidad bancaria de forma gratuita o simplificada.

### Agregadores de Datos (Soluciones B2B)
Existen plataformas que actúan como intermediarios, orientadas a empresas con volumen:
* **Plataformas:** [Belvo](https://belvo.com/) o [Prometeo](https://prometeoglobal.com/).
* **Funcionamiento:** API única para conectar con múltiples bancos (Galicia, Santander, BBVA, etc.) y billeteras.
* **Limitación:** Requieren contratos comerciales y costos por consulta elevados para pequeños comercios.

---

## 2. El Ecosistema de Mercado Pago

Mercado Pago ofrece herramientas, pero su utilidad depende del **tipo de operación**:

| Tipo de Ingreso | ¿Tiene API de Consulta? | Factibilidad de Automatización |
| :--- | :--- | :--- |
| **Pagos vía Checkout / Link** | **Sí** | **Alta.** Se utiliza el ID de pago para consultar el estado en tiempo real. |
| **Transferencias P2P (Alias/CVU)** | **No** | **Baja.** No existe un endpoint para validar transferencias de terceros. |

---

## 3. Limitaciones Técnicas Críticas

> [!WARNING]
> **El problema del "ID Invisible":** Si un usuario envía un comprobante de transferencia desde su home banking al alias del dueño, ese ID de transacción **no es visible** para la API de Mercado Pago del vendedor. Solo se puede ver manualmente en la app.

### La solución del Reporte de Movimientos
La única alternativa para "detectar" transferencias manuales es la **API de Reportes** (`/v1/account/settlement_report`):
1. Programar un proceso que genere un reporte cada $N$ minutos.
2. Descargar y parsear el archivo buscando ingresos que coincidan con el monto del pedido.
* *Desventaja:* No es tiempo real y es propenso a errores si hay montos duplicados.

---

## 4. Recomendación Final

Para eliminar el riesgo de fraude:
1. **Implementar un Bridge:** Usar Checkout Pro para generar una Preferencia de Pago única por pedido.
2. **Validación Automática:** Configurar un **Webhook**. El sistema solo confirma el pedido cuando Mercado Pago notifica el estado `approved`.