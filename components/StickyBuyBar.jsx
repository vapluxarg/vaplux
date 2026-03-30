import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'

export default function StickyBuyBar({ product, onAdd }) {
  const { formatPrice, formatPromoPrice } = useCurrency()
  const [added, setAdded] = useState(false)

  if (!product) return null

  return (
    <div className="fixed bottom-0 inset-x-0 lg:hidden bg-white/95 backdrop-blur border-t p-3 flex items-center justify-between z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider line-clamp-1">{product.name}</span>
        <div className="flex items-baseline gap-2">
          {product.has_promo ? (
            <span className="text-sm font-black text-green-600">{formatPromoPrice(product)}</span>
          ) : (
            <span className="text-sm font-black text-slate-900">{formatPrice(product)}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => {
            onAdd(product)
            setAdded(true)
            setTimeout(() => setAdded(false), 1500)
          }}
          className={`flex-1 sm:flex-none h-10 px-5 rounded-xl font-bold text-xs transition-all duration-300 shadow-sm flex items-center justify-center gap-2 ${added ? 'bg-green-600 text-white scale-105 shadow-green-200' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'}`}
        >
          {added ? '✓ Agregado' : <><ShoppingCart size={14} /> Carrito</>}
        </button>
      </div>
    </div>
  )
}
