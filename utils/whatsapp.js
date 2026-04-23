const RAW_NUMBERS = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5492216703630'
const WHATSAPP_NUMBERS = RAW_NUMBERS.split(',').map(n => n.trim()).filter(Boolean)

export function getWhatsAppNumber() {
  if (typeof window === 'undefined') return WHATSAPP_NUMBERS[0]

  try {
    const stored = localStorage.getItem('assigned_whatsapp_number')
    if (stored && WHATSAPP_NUMBERS.includes(stored)) {
      return stored
    }

    const randomIndex = Math.floor(Math.random() * WHATSAPP_NUMBERS.length)
    const picked = WHATSAPP_NUMBERS[randomIndex]
    localStorage.setItem('assigned_whatsapp_number', picked)
    return picked
  } catch (e) {
    // Fallback if localStorage is disabled
    return WHATSAPP_NUMBERS[0]
  }
}

export function getWhatsAppUrl(msg = '') {
  const number = getWhatsAppNumber()
  return msg 
    ? `https://wa.me/${number}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/${number}`
}

/**
 * Builds the checkout WhatsApp message.
 * @param {Array}   items          - Cart items
 * @param {number}  rawTotal       - Subtotal before discount
 * @param {Function} formatPrice   - From useCurrency
 * @param {Function} getProductPrice - From useCurrency
 * @param {object|null} coupon     - Active coupon (or null)
 * @param {number}  discount       - Computed discount amount (in active currency)
 * @param {string}  currency       - 'ARS' | 'USD'
 */
export function buildCheckoutText(items, rawTotal, formatPrice, getProductPrice, coupon = null, discount = 0, currency = 'ARS') {
  const lines = items.map(p => {
    const unitPrice = getProductPrice(p)
    const lineTotal = unitPrice * p.qty
    const variantSuffix = p._variantLabel ? ` — ${p._variantLabel}` : ''
    return `▪ ${p.title || p.name}${variantSuffix} (Cant: ${p.qty}) - ${formatPrice(lineTotal)}`
  })

  const hasCoupon = coupon && discount > 0
  const totalWithDiscount = Math.max(0, rawTotal - discount)

  let couponBlock = ''
  if (hasCoupon) {
    let typeLabel = ''
    if (coupon.type === 'percentage') {
      let tope = ''
      if (coupon.cap_ars) tope = ` (tope ${formatPrice(currency === 'ARS' ? coupon.cap_ars : coupon.cap_usd)})`
      typeLabel = `${coupon.value}% off${tope}`
    } else if (coupon.type === 'fixed_ars') {
      typeLabel = `$${Number(coupon.value).toLocaleString('es-AR')} ARS de descuento`
    } else if (coupon.type === 'fixed_usd') {
      typeLabel = `U$D ${Number(coupon.value).toLocaleString('es-AR')} de descuento`
    }

    couponBlock = `\n🎟️ *Cupón aplicado:* ${coupon.code} (${typeLabel})\n💸 *Descuento:* -${formatPrice(discount)}`
  }

  const totalLabel = hasCoupon
    ? `💰 *Subtotal:* ${formatPrice(rawTotal)}\n🏷️ *Total con descuento:* ${formatPrice(totalWithDiscount)}`
    : `💰 *Total estimado:* ${formatPrice(rawTotal)}`

  return `Hola, equipo de Vaplux. 👋\n\nMe gustaría avanzar con la compra de los siguientes productos de mi carrito:\n\n${lines.join('\n')}${couponBlock}\n\n${totalLabel}\n\nQuedo a la espera de los pasos para coordinar el pago y envío. ¡Muchas gracias!`
}

export function openWhatsApp(items, rawTotal, formatPrice, getProductPrice, coupon = null, discount = 0, currency = 'ARS') {
  const text = buildCheckoutText(items, rawTotal, formatPrice, getProductPrice, coupon, discount, currency)
  window.open(getWhatsAppUrl(text), '_blank')
}
