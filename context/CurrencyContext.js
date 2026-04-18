import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { getDolarBlue, getUsdtRate } from '@/utils/dolar'
import formatCurrency from '@/utils/formatCurrency'
import formatUSD from '@/utils/formatUSD'

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('ARS')
  const [dolarBlue, setDolarBlue] = useState(1200)
  const [dolarCripto, setDolarCripto] = useState(1250)

  useEffect(() => {
    // Load preference
    const saved = localStorage.getItem('vaplux_currency')
    if (saved) setCurrency(saved)

    // Fetch rates
    async function fetchRates() {
      const rateBlue = await getDolarBlue()
      const rateCripto = await getUsdtRate()
      setDolarBlue(rateBlue)
      setDolarCripto(rateCripto)
    }
    fetchRates()
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

    // Determine the source price based on preferred_currency
    let baseArs = 0
    if (p.preferred_currency === 'usdt' && p.price_usdt) {
      baseArs = Number(p.price_usdt) * dolarCripto
    } else if (p.preferred_currency === 'usd' && p.price_usd) {
      baseArs = Number(p.price_usd) * dolarBlue
    } else if (p.price_ars) {
      baseArs = Number(p.price_ars)
    } else if (p.price_usd) {
      baseArs = Number(p.price_usd) * dolarBlue
    } else if (p.price_usdt) {
      baseArs = Number(p.price_usdt) * dolarCripto
    }

    if (currency === 'USD') {
      return formatUSD(baseArs / dolarBlue)
    } else {
      return formatCurrency(baseArs)
    }
  }

  const formatPromoPrice = (p) => {
    if (!p || !p.promo_price) return ''
    const val = Number(p.promo_price)

    let baseArs = 0
    if (p.preferred_currency === 'usdt') {
      baseArs = val * dolarCripto
    } else if (p.preferred_currency === 'usd') {
      baseArs = val * dolarBlue
    } else {
      baseArs = val
    }

    return currency === 'USD' ? formatUSD(baseArs / dolarBlue) : formatCurrency(baseArs)
  }

  const getProductPrice = (p) => {
    if (!p) return 0

    const isPromo = p.has_promo && p.promo_price
    const priceVal = isPromo ? Number(p.promo_price) : null

    let baseArs = 0
    if (isPromo) {
      if (p.preferred_currency === 'usdt') baseArs = priceVal * dolarCripto
      else if (p.preferred_currency === 'usd') baseArs = priceVal * dolarBlue
      else baseArs = priceVal
    } else {
      // Regular logic
      if (p.preferred_currency === 'usdt' && p.price_usdt) {
        baseArs = Number(p.price_usdt) * dolarCripto
      } else if (p.preferred_currency === 'usd' && p.price_usd) {
        baseArs = Number(p.price_usd) * dolarBlue
      } else if (p.price_ars) {
        baseArs = Number(p.price_ars)
      } else if (p.price_usd) {
        baseArs = Number(p.price_usd) * dolarBlue
      } else if (p.price_usdt) {
        baseArs = Number(p.price_usdt) * dolarCripto
      }
    }

    return currency === 'USD' ? (baseArs / dolarBlue) : baseArs
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
    dolarCripto,
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
