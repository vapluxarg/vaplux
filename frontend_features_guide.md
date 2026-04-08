# Guía de Implementación Frontend: Monedas, Cupones y Variantes

Esta guía documenta la infraestructura frontend para manejar la doble moneda (ARS/USD), el sistema de cupones de descuento y la selección de variantes de productos.

## 1. Contexto de Moneda (CurrencyContext)

El `CurrencyContext` actúa como el motor centralizador para todo lo relacionado con precios en la aplicación.

### ¿Cómo Funciona?
- **Estados Principales:** Mantiene la moneda activa seleccionada por el usuario (`currency`: `'ARS'` | `'USD'`) y la cotización actual del Dólar Blue (`dolarBlue`), la cual busca al inicializar la app (`getDolarBlue()`).
- **Persistencia:** Guarda la preferencia de moneda en el `localStorage` (`vaplux_currency`).
- **Reglas de Conversión:**
  - Evalúa la propiedad `preferred_currency` de un producto (o la disponibilidad explícita de `price_usd` / `price_ars`).
  - Convierte al vuelo usando `dolarBlue`. Si el usuario mira en `USD` pero el precio base está en pesos, divide por el Blue. Si mira en `ARS` y el precio base era dólares, multiplica por el Blue.

### ¿Cómo Implementarlo / Consumirlo?
Debes usar el hook `useCurrency()` en cualquier componente que renderice precios:

```jsx
import { useCurrency } from '@/context/CurrencyContext'

export default function MiComponente({ product }) {
  const { currency, toggleCurrency, formatPrice, formatPromoPrice } = useCurrency()

  return (
    <div>
      <p>Moneda actual: {currency}</p>
      <button onClick={toggleCurrency}>Cambiar Moneda</button>
      
      {/* formatPrice ya determina si hay que usar USD o ARS y devuelve el string formateado */}
      <p>Precio: {formatPrice(product)}</p> 
    </div>
  )
}
```

---

## 2. Cupones de Descuento

El estado de los cupones vive en el `CartContext`, integrándose estrechamente con el cálculo total del carrito.

### ¿Cómo Funciona?
- **Validación:** Al ingresar un código, `applyCoupon` (en `CartContext`) verifica la validez en la base de datos (fechas, `is_active`, conteo de usos `max_uses`).
- **Estados de Cupón:** Guarda el cupón en estado y `localStorage`. Un carrito puede tener un solo cupón a la vez.
- **Cálculo (Lógica Matemática):**
  - La función `computeDiscount()` (en `utils/discount.js`) hace la matemática pesada.
  - Existen tres tipos de descuentos: `percentage`, `fixed_ars`, y `fixed_usd`.
  - Lo más poderoso es que **reconoce la moneda activa global** y los límites (`cap_ars`, `cap_usd`). Si el cupón es un techo en ARS y el usuario está comprando en USD, convierte dinámicamente el tope mediante el `dolarBlue`.

### ¿Cómo Implementarlo / Consumirlo?
```jsx
// En el componente del carrito o checkout:
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { computeDiscount } from '@/utils/discount'

function CartTotals() {
  const { totals, coupon, applyCoupon, removeCoupon } = useCart()
  const { currency, dolarBlue } = useCurrency()

  // totals.totalPrice nos da el "rawTotal" antes de descuentos (en la moneda activa)
  const discountAmount = computeDiscount(coupon, totals.totalPrice, currency, dolarBlue)
  const finalTotal = totals.totalPrice - discountAmount

  return (
    <div>
      {/* UI para aplicar cupón */}
      <button onClick={() => applyCoupon('MI-CUPON', 'vaplux')}>Aplicar</button>
      
      {coupon && (
        <p>
          Descuento aplicado: -{discountAmount} {currency} 
          <button onClick={removeCoupon}>x</button>
        </p>
      )}
      <p>Total a pagar: {finalTotal} {currency}</p>
    </div>
  )
}
```

---

## 3. Variantes de Productos

Las variantes requieren que los usuarios puedan elegir combinaciones específicas (ej. "Color", "Talle", "Switch") antes de poder comprar.

### ¿Cómo Funciona?
- **Matriz de Atributos:** Se extraen dinámicamente las claves de los atributos (`attributeKeys`) agrupando todos las keys del objeto `attributes` de la lista global de `variants`.
- **Match de Variante Activa:** En `PurchasePanel.jsx`, un diccionario `selectedAttrs` guarda qué seleccionó el usuario. Cuando cada key obligatoria tiene un valor elegido, se busca en el array `variants` a qué ID pertenece.
- **Precio y Stock Sobreescritos:**
    - Si se encontró un *match* válido, el precio derivado a mostrar/formatear **no** es el del producto base, sino el `.price_usd` / `.price_ars` de la *variante* elegida.
    - Lo mismo aplica con el stock, sobreescribiendo la disponibilidad base.
- **En el Carrito (`CartContext`):** Al insertar un ítem con variante vía `add(product, qty, variant)`, se arma un `_cartKey` único combinando el ID base más el ID de la variante (ej. `prodId__varId`). Así, dos colores del mismo artículo ingresan como ítems separados en el carrito en lugar de amontonar sus cantidades.

### ¿Cómo Implementarlo / Consumirlo?

El `PurchasePanel` ya implementa la selección de atributos. Para ver la lógica de subida al carrito:

```jsx
// Al momento de mandar el ítem al carrito desde PurchasePanel.jsx:
import { useCart } from '@/context/CartContext'

export default function MiPantallaDeCompra({ product, variants }) {
  const { add } = useCart()
  // Asumiendo que determinaste cuál es la variante elegida por el usuario:
  const selectedVariant = variants.find(v => v.attributes['Color'] === 'Negro')

  const onAddToCart = () => {
    // Si el producto requiere variantes, bloquéalo si no eligió todo.
    if (variants.length > 0 && !selectedVariant) {
      alert("¡Elegí una variante primero!")
      return
    }
    
    // Al usar 'add', se manda el producto base y la variante opcional
    add(product, 1, selectedVariant) 
  }

  // ... Renderizar botones selectores que actualizan el `selectedVariant` ...
}
```
