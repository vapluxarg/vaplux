import { useEffect, useState } from 'react'
import { X, Zap, ExternalLink } from 'lucide-react'

export default function PromotionPopup({ promotion }) {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (!promotion) return

    // Don't show if already dismissed this session
    const dismissedKey = `promo_dismissed_${promotion.id}`
    if (sessionStorage.getItem(dismissedKey)) return

    // Don't show if expired
    if (promotion.expires_at && new Date(promotion.expires_at) < new Date()) return

    // Small delay so the page loads first
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [promotion])

  const dismiss = () => {
    setClosing(true)
    sessionStorage.setItem(`promo_dismissed_${promotion.id}`, '1')
    setTimeout(() => setVisible(false), 400)
  }

  if (!visible || !promotion) return null

  return (
    <>
      <style>{`
        @keyframes popup-in {
          0% { opacity: 0; transform: scale(0.85) translateY(40px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes popup-out {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.9) translateY(20px); }
        }
        @keyframes border-spin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(59,130,246,0.15), 0 0 60px rgba(37,99,235,0.05); }
          50% { box-shadow: 0 0 50px rgba(59,130,246,0.3), 0 0 100px rgba(37,99,235,0.15); }
        }
        .promo-card {
          animation: popup-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .promo-card.closing {
          animation: popup-out 0.35s ease-in forwards;
        }
        .promo-border-spin {
          background: linear-gradient(270deg, #60a5fa, #3b82f6, #2563eb, #1d4ed8, #3b82f6, #60a5fa);
          background-size: 400% 400%;
          animation: border-spin 4s ease infinite;
        }
        .promo-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={dismiss}
        className="fixed inset-0 z-[9000] bg-slate-900/60 backdrop-blur-sm"
        style={{ animation: closing ? 'none' : undefined }}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-[9001] flex items-center justify-center p-4 xl:p-0 pointer-events-none">
        <div className={`promo-card ${closing ? 'closing' : ''} pointer-events-auto promo-glow relative w-full max-w-md`}>

          {/* Animated gradient border */}
          <div className="promo-border-spin p-[3px] rounded-[2.5rem]">
            <div className="bg-white rounded-[2.4rem] overflow-hidden relative shadow-2xl">

              {/* Close */}
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/50 backdrop-blur-md border border-slate-200/50 hover:bg-white text-slate-500 hover:text-slate-900 transition-colors shadow-sm"
              >
                <X size={16} />
              </button>

              {/* Banner image */}
              {promotion.banner_image_url && (
                <div className="relative h-48 w-full overflow-hidden bg-slate-50">
                  <img
                    src={promotion.banner_image_url}
                    alt={promotion.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className="px-8 pb-8 pt-4">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 shadow-sm">
                  <Zap size={10} className="fill-blue-600" />
                  Promoción Exclusiva
                </div>

                {/* Title */}
                <h2 className="text-3xl font-black text-slate-900 leading-tight mb-3 tracking-tighter">
                  {promotion.title}
                </h2>

                {/* Description */}
                {promotion.short_description && (
                  <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6">
                    {promotion.short_description}
                  </p>
                )}

                {/* Expiry */}
                {promotion.expires_at && (
                  <p className="text-[11px] font-bold text-slate-400 mb-6 flex items-center gap-1.5">
                     <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Válida hasta el {new Date(promotion.expires_at).toLocaleDateString('es-AR', {
                      day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                )}

                {/* CTA buttons */}
                <div className="flex gap-3">
                  <a
                    href="/catalog"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black py-4 px-4 rounded-2xl text-center transition-all shadow-lg shadow-blue-900/10 active:scale-95 flex items-center justify-center gap-2"
                  >
                    Ver Ofertas <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={dismiss}
                    className="flex-shrink-0 border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-bold py-4 px-6 rounded-2xl transition-all active:scale-95"
                  >
                    Cerrar
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
