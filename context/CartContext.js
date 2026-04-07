import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { trackProductEvent } from '@/utils/analytics'
import { supabase } from '@/utils/supabase'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isBouncing, setIsBouncing] = useState(false)

  // ── Coupon state ────────────────────────────────────────────────────────────
  const [coupon, setCoupon] = useState(null)       // { id, code, type, value, cap_ars, cap_usd }
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState(null)

  // ── Persist cart ────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vaplux_cart')
      if (saved) setItems(JSON.parse(saved))
      const savedCoupon = localStorage.getItem('vaplux_coupon')
      if (savedCoupon) setCoupon(JSON.parse(savedCoupon))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('vaplux_cart', JSON.stringify(items))
    } catch {}
  }, [items])

  useEffect(() => {
    try {
      if (coupon) {
        localStorage.setItem('vaplux_coupon', JSON.stringify(coupon))
      } else {
        localStorage.removeItem('vaplux_coupon')
      }
    } catch {}
  }, [coupon])

  // ── Cart actions ─────────────────────────────────────────────────────────────
  /**
   * Add a product (or a specific variant) to the cart.
   * @param {object} product - The full product object.
   * @param {number} qty - Quantity to add.
   * @param {object|null} variant - Optional variant object.
   */
  const add = (product, qty = 1, variant = null) => {
    setItems(prev => {
      const cartKey = variant ? `${product.id}__${variant.id}` : `${product.id}__base`
      const idx = prev.findIndex(p => p._cartKey === cartKey)

      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + qty }
        return next
      }

      trackProductEvent('cart_add', product.id)

      setIsBouncing(true)
      setTimeout(() => setIsBouncing(false), 600)

      const item = {
        ...product,
        _cartKey: cartKey,
        qty,
        _variantId: variant?.id || null,
        _variantLabel: variant?.label || null,
        _variantAttributes: variant?.attributes || null,
        price_usd: variant ? variant.price_usd : product.price_usd,
        price_ars: variant ? variant.price_ars : product.price_ars,
        preferred_currency: variant ? variant.preferred_currency : product.preferred_currency,
      }

      return [...prev, item]
    })
  }

  const remove = (cartKey) => setItems(prev => prev.filter(p => p._cartKey !== cartKey))
  const setQty = (cartKey, qty) => setItems(prev => prev.map(p => p._cartKey === cartKey ? { ...p, qty } : p))

  const totals = useMemo(() => {
    const totalItems = items.reduce((a, p) => a + p.qty, 0)
    const totalPrice = items.reduce((a, p) => a + p.qty * (p.price || 0), 0)
    return { totalItems, totalPrice }
  }, [items])

  // ── Coupon actions ────────────────────────────────────────────────────────────

  /**
   * Validates and applies a discount code.
   * @param {string} code - The code entered by the user (already uppercased).
   * @param {string} store - 'vaplux' | 'fantech'
   */
  const applyCoupon = useCallback(async (code, store = 'vaplux') => {
    setCouponError(null)
    setCouponLoading(true)

    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code)
      .eq('store', store)
      .eq('is_active', true)
      .maybeSingle()

    setCouponLoading(false)

    if (error || !data) {
      setCouponError('Código inválido o no disponible.')
      return
    }

    // Validate expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setCouponError('Este código ya venció.')
      return
    }

    // Validate max uses
    if (data.max_uses !== null && data.uses_count >= data.max_uses) {
      setCouponError('Este código alcanzó el límite de usos.')
      return
    }

    setCoupon(data)
  }, [])

  const removeCoupon = useCallback(() => {
    setCoupon(null)
    setCouponError(null)
  }, [])

  /**
   * Records a coupon use in discount_code_uses and increments uses_count.
   * Called when the user clicks "Finalizar Pedido".
   * @param {number} rawTotal - Total before discount (in current currency units)
   * @param {number} discountAmount - Amount discounted (in current currency units)
   * @param {string} currency - 'ARS' | 'USD'
   */
  const recordCouponUse = useCallback(async (rawTotal, discountAmount, currency) => {
    if (!coupon) return

    const cartTotalAfter = Math.max(0, rawTotal - discountAmount)

    // Insert use record
    await supabase.from('discount_code_uses').insert([{
      discount_code_id: coupon.id,
      code: coupon.code,
      store: coupon.store,
      discount_type: coupon.type,
      discount_value: coupon.value,
      discount_amount: discountAmount,
      currency,
      cart_total_before: rawTotal,
      cart_total_after: cartTotalAfter,
    }])

    // Increment uses_count
    await supabase
      .from('discount_codes')
      .update({ uses_count: (coupon.uses_count || 0) + 1 })
      .eq('id', coupon.id)

    // Optimistically update local coupon state
    setCoupon(prev => prev ? { ...prev, uses_count: (prev.uses_count || 0) + 1 } : null)
  }, [coupon])

  const openCart = () => setSidebarOpen(true)
  const closeCart = () => setSidebarOpen(false)
  const toggleCart = () => setSidebarOpen(v => !v)

  const value = useMemo(() => ({ items, add, remove, setQty, ...totals }), [items, totals])

  const ctx = useMemo(() => ({
    ...value,
    sidebarOpen,
    isBouncing,
    openCart,
    closeCart,
    toggleCart,
    // Coupon
    coupon,
    couponLoading,
    couponError,
    applyCoupon,
    removeCoupon,
    recordCouponUse,
  }), [value, sidebarOpen, isBouncing, coupon, couponLoading, couponError, applyCoupon, removeCoupon, recordCouponUse])

  return <CartContext.Provider value={ctx}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
