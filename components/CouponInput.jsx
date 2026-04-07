import { useState, useRef } from 'react'
import { Tag, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'

/**
 * CouponInput — reutilizable en CartSidebar y /carrito
 * Muestra un input para ingresar un código de descuento,
 * llama a applyCoupon / removeCoupon del CartContext,
 * y muestra el resultado (éxito / error).
 */
export default function CouponInput({ compact = false, store = 'vaplux' }) {
  const { coupon, couponLoading, couponError, applyCoupon, removeCoupon, discount } = useCart()
  const { formatPrice } = useCurrency()
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  const handleApply = () => {
    const code = input.trim().toUpperCase()
    if (!code) return
    applyCoupon(code, store)
  }

  const handleRemove = () => {
    removeCoupon()
    setInput('')
    inputRef.current?.focus()
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleApply()
  }

  // ── Applied state ─────────────────────────────────────────────────────────
  if (coupon) {
    return (
      <div className={`flex flex-col gap-1.5 ${compact ? '' : 'mt-1'}`}>
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-black text-emerald-700 font-mono tracking-widest">{coupon.code}</span>
              <span className="text-[10px] text-emerald-600 ml-2">aplicado</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="text-xs font-black text-emerald-700">-{formatPrice(discount)}</span>
            <button
              onClick={handleRemove}
              className="p-1 text-emerald-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Quitar cupón"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Input state ───────────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col gap-1.5 ${compact ? '' : 'mt-1'}`}>
      <label className={`flex items-center gap-1.5 ${compact ? 'text-[10px]' : 'text-xs'} font-bold text-slate-500 uppercase tracking-widest`}>
        <Tag size={11} /> Código de descuento
      </label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={handleKey}
          placeholder="Ej: VERANO10"
          disabled={couponLoading}
          className={`flex-1 border border-slate-200 rounded-xl px-3 font-mono tracking-widest text-slate-800 placeholder:text-slate-300 placeholder:font-sans placeholder:tracking-normal outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50 ${compact ? 'text-xs py-2' : 'text-sm py-2.5'}`}
        />
        <button
          onClick={handleApply}
          disabled={couponLoading || !input.trim()}
          className={`shrink-0 bg-slate-900 hover:bg-slate-700 text-white font-bold rounded-xl transition-all disabled:opacity-40 flex items-center gap-1.5 ${compact ? 'px-3 text-xs py-2' : 'px-4 text-sm py-2.5'}`}
        >
          {couponLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : 'Aplicar'}
        </button>
      </div>

      {couponError && (
        <div className="flex items-center gap-1.5 text-red-500 text-xs font-medium">
          <AlertCircle size={13} className="shrink-0" />
          {couponError}
        </div>
      )}
    </div>
  )
}
