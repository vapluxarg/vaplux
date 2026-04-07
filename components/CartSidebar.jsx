import { useEffect } from 'react'
import { Trash } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { openWhatsApp } from '@/utils/whatsapp'
import { computeDiscount } from '@/utils/discount'
import CouponInput from '@/components/CouponInput'

export default function CartSidebar(){
  const { items, setQty, remove, totalItems, sidebarOpen, closeCart, coupon, recordCouponUse } = useCart()
  const { formatPrice, calculateTotal, getProductPrice, currency, dolarBlue } = useCurrency()

  const rawTotal = calculateTotal(items)
  const discount = computeDiscount(coupon, rawTotal, currency, dolarBlue)
  const totalWithDiscount = Math.max(0, rawTotal - discount)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeCart() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeCart])

  const handleCheckout = async () => {
    if (coupon && discount > 0) {
      await recordCouponUse(rawTotal, discount, currency)
    }
    openWhatsApp(items, rawTotal, formatPrice, getProductPrice, coupon, discount, currency)
  }

  return (
    <div className={`fixed inset-0 z-[100] transition-all duration-300 ${sidebarOpen ? 'visible' : 'invisible'}`}>
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm cart-overlay ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={closeCart}
      />

      {/* Sidebar Panel */}
      <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col cart-sidebar ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <header className="p-4 border-b border-[#E3E8EF] flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-[#0f172a]">Tu Carrito</h2>
          <button onClick={closeCart} className="p-2 hover:bg-[#F5FAFF] rounded-full transition-colors text-[#0f172a]">
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!items.length ? (
            <div className="text-center py-20">
              <p className="text-[#64748b]">Tu carrito está vacío.</p>
              <button onClick={closeCart} className="mt-4 text-[#0066ff] font-semibold hover:underline">
                Seguir comprando
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(p => (
                <div key={p._cartKey || p.id} className="flex items-center justify-between border border-[#E3E8EF] rounded-xl p-4 bg-white hover:shadow-sm transition-shadow">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#0f172a] mb-0.5 truncate">{p.title || p.name}</div>
                    {p._variantLabel && (
                      <div className="text-[10px] text-slate-400 font-medium mb-1">{p._variantLabel}</div>
                    )}
                    <div className="text-[#0066ff] font-bold text-sm">{formatPrice(getProductPrice(p))}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-[#E3E8EF] rounded-lg bg-[#F5FAFF] overflow-hidden">
                      <button onClick={() => setQty(p._cartKey || p.id, Math.max(1, p.qty - 1))} className="px-2 py-1 hover:bg-[#E3E8EF] text-[#0f172a] font-bold">−</button>
                      <span className="w-8 text-center text-sm font-medium text-[#0f172a]">{p.qty}</span>
                      <button onClick={() => setQty(p._cartKey || p.id, p.qty + 1)} className="px-2 py-1 hover:bg-[#E3E8EF] text-[#0f172a] font-bold">+</button>
                    </div>
                    <button onClick={() => remove(p._cartKey || p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Coupon Input */}
              <div className="pt-2 border-t border-[#E3E8EF]">
                <CouponInput compact />
              </div>

              {/* Summary */}
              <div className="pt-4 border-t border-[#E3E8EF]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[#64748b] font-medium text-sm">Subtotal ({totalItems} items):</div>
                  <div className="text-[#0f172a] font-bold text-sm">{formatPrice(rawTotal)}</div>
                </div>

                {coupon && discount > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-emerald-600 font-medium text-sm">Descuento ({coupon.code}):</div>
                    <div className="text-emerald-600 font-bold text-sm">-{formatPrice(discount)}</div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#E3E8EF]">
                  <div className="text-[#0f172a] font-bold text-lg">Total:</div>
                  <div className="text-[#0066ff] font-black text-xl">{formatPrice(totalWithDiscount)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <footer className="p-4 border-t border-[#E3E8EF] bg-[#F5FAFF]">
            <button
              className="w-full bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-blue-200 active:scale-95"
              onClick={handleCheckout}
            >
              Finalizar por WhatsApp
            </button>
          </footer>
        )}
      </aside>
    </div>
  )
}
