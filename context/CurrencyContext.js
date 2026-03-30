import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { getDolarBlue } from '@/utils/dolar'
import formatCurrency from '@/utils/formatCurrency'
import formatUSD from '@/utils/formatUSD'

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('ARS')
  const [dolarBlue, setDolarBlue] = useState(1200)

  useEffect(() => {
    // Load preference
    const saved = localStorage.getItem('vaplux_currency')
    if (saved) setCurrency(saved)

    // Fetch rate
    async function fetchRate() {
      const rate = await getDolarBlue()
      setDolarBlue(rate)
    }
    fetchRate()
  }, [])

  const toggleCurrency = () => {
    const next = currency === 'ARS' ? 'USD' : 'ARS'
    setCurrency(next)
    localStorage.setItem('vaplux_currency', next)
  }

  const formatPrice = (p) => {
    if (!p) return ''
    if (typeof p === 'number') {
      return currency === 'USD' ? formatUSD(p) : formatCurrency(p)
    }

    // Regular price
    if (currency === 'USD') {
      const val = (p.price_usd && Number(p.price_usd) > 0) ? p.price_usd : (Number(p.price_ars || 0) / dolarBlue)
      return formatUSD(val)
    } else {
      const val = (p.price_ars && Number(p.price_ars) > 0) ? p.price_ars : (Number(p.price_usd || 0) * dolarBlue)
      return formatCurrency(val)
    }
  }

  const formatPromoPrice = (p) => {
    if (!p || !p.promo_price) return ''
    const val = Number(p.promo_price)
    if (p.preferred_currency === 'usd') {
      return currency === 'USD' ? formatUSD(val) : formatCurrency(val * dolarBlue)
    } else {
      return currency === 'ARS' ? formatCurrency(val) : formatUSD(val / dolarBlue)
    }
  }

  const getProductPrice = (p) => {
    if (!p) return 0
    // Promo
    if (p.has_promo && p.promo_price) {
      const val = Number(p.promo_price)
      if (p.preferred_currency === 'usd') {
        return currency === 'USD' ? val : (val * dolarBlue)
      } else {
        return currency === 'ARS' ? val : (val / dolarBlue)
      }
    }
    // Regular
    if (currency === 'USD') {
      return (p.price_usd && Number(p.price_usd) > 0) ? Number(p.price_usd) : (Number(p.price_ars || 0) / dolarBlue)
    } else {
      return (p.price_ars && Number(p.price_ars) > 0) ? Number(p.price_ars) : (Number(p.price_usd || 0) * dolarBlue)
    }
  }

  const calculateTotal = (items) => {
    if (!items || !items.length) return 0
    return items.reduce((acc, p) => acc + (getProductPrice(p) * (p.qty || 1)), 0)
  }

  const value = useMemo(() => ({
    currency,
    setCurrency: (c) => {
      setCurrency(c)
      localStorage.setItem('vaplux_currency', c)
    },
    toggleCurrency,
    dolarBlue,
    formatPrice,
    formatPromoPrice,
    getProductPrice,
    calculateTotal
  }), [currency, dolarBlue])

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => useContext(CurrencyContext)
