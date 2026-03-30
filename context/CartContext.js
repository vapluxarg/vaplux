import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { trackProductEvent } from '@/utils/analytics'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isBouncing, setIsBouncing] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vaplux_cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('vaplux_cart', JSON.stringify(items))
    } catch {}
  }, [items])

  const add = (product, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(p => p.id === product.id)
      if (idx >= 0) {
        // Already in cart — just bump qty, don't re-fire analytics
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + qty }
        return next
      }
      // New item → fire analytics event
      trackProductEvent('cart_add', product.id)
      
      // Trigger animation
      setIsBouncing(true)
      setTimeout(() => setIsBouncing(false), 600)

      return [...prev, { ...product, qty }]
    })
  }

  const remove = (id) => setItems(prev => prev.filter(p => p.id !== id))
  const setQty = (id, qty) => setItems(prev => prev.map(p => p.id === id ? { ...p, qty } : p))

  const totals = useMemo(() => {
    const totalItems = items.reduce((a, p) => a + p.qty, 0)
    const totalPrice = items.reduce((a, p) => a + p.qty * (p.price || 0), 0)
    return { totalItems, totalPrice }
  }, [items])

  const value = useMemo(() => ({ items, add, remove, setQty, ...totals }), [items, totals])

  const openCart = () => setSidebarOpen(true)
  const closeCart = () => setSidebarOpen(false)
  const toggleCart = () => setSidebarOpen(v => !v)

  const ctx = useMemo(() => ({
    ...value,
    sidebarOpen,
    isBouncing,
    openCart,
    closeCart,
    toggleCart,
  }), [value, sidebarOpen, isBouncing])

  return <CartContext.Provider value={ctx}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
