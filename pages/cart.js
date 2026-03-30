import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { openWhatsApp } from '@/utils/whatsapp'

export default function Cart(){
  const { items, setQty, remove, totalItems } = useCart()
  const { formatPrice, calculateTotal, getProductPrice } = useCurrency()
  const totalPrice = calculateTotal(items)
  return (
    <div className="home-celeste min-h-screen selection:bg-blue-100 pb-20">
      <Navbar />
      
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
        {/* Header & Breadcrumb */}
        <nav className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Tu Carrito</span>
        </nav>

        <div className="flex items-end justify-between mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Mi Carrito</h1>
          {items.length > 0 && (
            <span className="text-blue-600 font-black text-sm uppercase tracking-widest hidden sm:block">
              {totalItems} {totalItems === 1 ? 'Producto' : 'Productos'}
            </span>
          )}
        </div>

        {!items.length ? (
          <div className="bg-white rounded-[3rem] p-16 md:p-24 border border-slate-100 shadow-[0_20px_80px_rgba(0,0,0,0.04)] text-center max-w-4xl mx-auto overflow-hidden relative">
            <div className="aurora-layer opacity-10" />
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
              <ShoppingBag size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Tu carrito está vacío</h2>
            <p className="text-slate-500 font-medium text-lg mb-10 max-w-sm mx-auto">Parece que aún no has agregado nada. ¡Explorá nuestro catálogo y encontrá lo último en tecnología!</p>
            <Link href="/catalog" className="inline-flex items-center gap-3 bg-blue-600 text-white font-black px-10 py-5 rounded-[1.5rem] shadow-xl shadow-blue-900/10 hover:bg-blue-700 transition-all active:scale-95">
              Ir al Catálogo
              <ArrowRight size={20} />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Products List */}
            <div className="lg:col-span-8 space-y-4">
              {items.map(p => (
                <div key={p.id} className="group bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex items-center gap-6 transition-all hover:shadow-xl">
                  {/* Image Placeholder / Image if available */}
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-[1.5rem] flex-shrink-0 relative overflow-hidden">
                     {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200"><ShoppingBag size={32} /></div>
                     )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                      <div>
                        <h3 className="font-black text-slate-900 text-lg md:text-xl tracking-tight line-clamp-1">{p.name}</h3>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{p.category}</p>
                      </div>
                      <div className="text-blue-600 font-black text-xl tracking-tighter">
                        {formatPrice(getProductPrice(p))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-1 px-2 border border-slate-100">
                        <button 
                          onClick={() => setQty(p.id, Math.max(1, p.qty - 1))}
                          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="font-black text-slate-900 min-w-[20px] text-center">{p.qty}</span>
                        <button 
                          onClick={() => setQty(p.id, p.qty + 1)}
                          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                      <button 
                        onClick={() => remove(p.id)}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                        title="Eliminar"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Panel */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
                <div className="aurora-layer opacity-20" />
                <h2 className="text-2xl font-black mb-8 relative z-10 tracking-tight">Resumen</h2>
                
                <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex justify-between text-white/50 font-medium">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <span className="font-black text-lg">Total</span>
                    <div className="text-right">
                       <span className="block text-3xl font-black tracking-tighter text-blue-400">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 relative z-10 mb-8">
                   <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                      <Truck size={20} className="text-blue-400 shrink-0" />
                      <p className="text-xs text-white/60 font-medium">Envíos express a todo el país. Coordinamos la entrega por WhatsApp.</p>
                   </div>
                   <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                      <ShieldCheck size={20} className="text-blue-400 shrink-0" />
                      <p className="text-xs text-white/60 font-medium">Garantía oficial y soporte técnico certificado en cada compra.</p>
                   </div>
                </div>

                <button 
                  onClick={() => openWhatsApp(items, totalPrice, formatPrice, getProductPrice)}
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-900/20 relative z-10"
                >
                  <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.032c0 2.12.554 4.189 1.605 6.01L0 24l6.104-1.602a11.834 11.834 0 005.681 1.448h.005c6.635 0 12.032-5.397 12.032-12.034a11.783 11.783 0 00-3.414-8.139z"/></svg>
                  Finalizar Pedido
                </button>
              </div>
              
              <Link href="/catalog" className="text-center block mt-8 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-blue-600 transition-colors">
                 Seguir Comprando
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
