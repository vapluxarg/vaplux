export function buildCheckoutText(items, total, formatPrice, getProductPrice) {
  const lines = items.map(p => {
    const unitPrice = getProductPrice(p)
    const lineTotal = unitPrice * p.qty
    return `- ${p.name} x${p.qty} = ${formatPrice(lineTotal)}`
  })
  lines.push(`\nTotal: ${formatPrice(total)}`)
  return `Hola! Quiero confirmar esta compra:\n${lines.join('\n')}`
}

export function openWhatsApp(items, total, formatPrice, getProductPrice) {
  const text = encodeURIComponent(buildCheckoutText(items, total, formatPrice, getProductPrice))
  const url = `https://wa.me/5491112345678?text=${text}`
  window.open(url, '_blank')
}
