export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5492216703630'

export function getWhatsAppUrl(msg = '') {
  return msg 
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/${WHATSAPP_NUMBER}`
}

export function buildCheckoutText(items, total, formatPrice, getProductPrice) {
  const lines = items.map(p => {
    const unitPrice = getProductPrice(p)
    const lineTotal = unitPrice * p.qty
    return `▪ ${p.name} (Cant: ${p.qty}) - ${formatPrice(lineTotal)}`
  })
  
  return `Hola, equipo de Vaplux. 👋\n\nMe gustaría avanzar con la compra de los siguientes productos de mi carrito:\n\n${lines.join('\n')}\n\n💰 *Total estimado:* ${formatPrice(total)}\n\nQuedo a la espera de los pasos para coordinar el pago y envío. ¡Muchas gracias!`
}

export function openWhatsApp(items, total, formatPrice, getProductPrice) {
  const text = buildCheckoutText(items, total, formatPrice, getProductPrice)
  window.open(getWhatsAppUrl(text), '_blank')
}
