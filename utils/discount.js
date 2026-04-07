/**
 * Calcula el monto de descuento dado un cupón y el total del carrito
 * en la moneda activa.
 *
 * @param {object|null} coupon - El cupón activo del CartContext
 * @param {number} rawTotal   - Total antes de descuento (en la moneda activa)
 * @param {string} currency   - 'ARS' | 'USD'
 * @param {number} dolarBlue  - Tipo de cambio actual
 * @returns {number} Monto a descontar (en la misma moneda que rawTotal)
 */
export function computeDiscount(coupon, rawTotal, currency, dolarBlue) {
  if (!coupon || !rawTotal) return 0

  if (coupon.type === 'percentage') {
    // Calcular descuento bruto
    const pct = Number(coupon.value) / 100
    let amount = rawTotal * pct

    // Aplicar tope según moneda activa
    if (currency === 'ARS' && coupon.cap_ars) {
      amount = Math.min(amount, Number(coupon.cap_ars))
    } else if (currency === 'USD' && coupon.cap_usd) {
      amount = Math.min(amount, Number(coupon.cap_usd))
    } else if (currency === 'ARS' && coupon.cap_usd && dolarBlue) {
      // Tope USD convertido a ARS
      const capInArs = Number(coupon.cap_usd) * dolarBlue
      amount = Math.min(amount, capInArs)
    } else if (currency === 'USD' && coupon.cap_ars && dolarBlue) {
      // Tope ARS convertido a USD
      const capInUsd = Number(coupon.cap_ars) / dolarBlue
      amount = Math.min(amount, capInUsd)
    }

    return amount
  }

  if (coupon.type === 'fixed_ars') {
    const fixedArs = Number(coupon.value)
    return currency === 'ARS' ? fixedArs : (dolarBlue ? fixedArs / dolarBlue : 0)
  }

  if (coupon.type === 'fixed_usd') {
    const fixedUsd = Number(coupon.value)
    return currency === 'USD' ? fixedUsd : (dolarBlue ? fixedUsd * dolarBlue : 0)
  }

  return 0
}
