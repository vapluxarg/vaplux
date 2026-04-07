/**
 * PurchasePanel — individual product purchase section
 * Supports:
 *   - Simple products (stock + price at product level)
 *   - Variant products (selectors per attribute, price from selected variant)
 *   - Imported products (a pedido, no stock display)
 */
import { useState, useMemo } from 'react'
import { MessageCircle, ShoppingCart, ExternalLink, Clock, PackageCheck } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'

export default function PurchasePanel({ product, variants = [], onAdd, onWhatsApp, onMeli }) {
  const { formatPrice, formatPromoPrice, getProductPrice, dolarBlue, currency } = useCurrency()
  const [added, setAdded] = useState(false)
  const [qty, setQty] = useState(1)
  const [selectedAttrs, setSelectedAttrs] = useState({})

  const isImported = !!product?.is_imported
  const hasVariants = !!product?.has_variants && variants.length > 0
  const hasWA = !!onWhatsApp
  const hasMeli = !!onMeli && !!product?.ml_link

  // Build attribute domains from variants
  const attributeKeys = useMemo(() => {
    if (!hasVariants) return []
    const allKeys = variants.flatMap(v => Object.keys(v.attributes || {}))
    return [...new Set(allKeys)]
  }, [variants, hasVariants])

  const getOptionsForDomain = (domain) => {
    return [...new Set(variants.map(v => v.attributes?.[domain]).filter(Boolean))]
  }

  // Find the matched variant given current selection
  const selectedVariant = useMemo(() => {
    if (!hasVariants || attributeKeys.length === 0) return null
    return variants.find(v =>
      attributeKeys.every(key => v.attributes?.[key] === selectedAttrs[key])
    ) || null
  }, [variants, selectedAttrs, attributeKeys, hasVariants])

  const allAttrsSelected = attributeKeys.length > 0 && attributeKeys.every(k => selectedAttrs[k])

  // Price resolution
  const resolvedPrice = useMemo(() => {
    if (hasVariants && selectedVariant) {
      if (currency === 'USD') {
        return selectedVariant.preferred_currency === 'usd'
          ? selectedVariant.price_usd
          : (selectedVariant.price_ars || 0) / dolarBlue
      } else {
        return selectedVariant.preferred_currency === 'ars'
          ? selectedVariant.price_ars
          : (selectedVariant.price_usd || 0) * dolarBlue
      }
    }
    return product ? getProductPrice(product) : 0
  }, [selectedVariant, hasVariants, product, currency, dolarBlue, getProductPrice])

  const formattedPrice = useMemo(() => {
    if (!resolvedPrice) return null
    return currency === 'USD'
      ? `U$D ${Number(resolvedPrice).toLocaleString('es-AR', { minimumFractionDigits: 0 })}`
      : `$ ${Number(resolvedPrice).toLocaleString('es-AR', { minimumFractionDigits: 0 })}`
  }, [resolvedPrice, currency])

  // Stock
  const variantStock = selectedVariant?.stock ?? null
  const baseStock = isImported ? null : (product?.stock ?? 0)
  const effectiveStock = hasVariants ? (allAttrsSelected ? variantStock : null) : baseStock

  const maxStock = isImported ? 99999 : (effectiveStock ?? 0)
  const inc = () => setQty(q => isImported ? q + 1 : Math.min(q + 1, maxStock))
  const dec = () => setQty(q => Math.max(q - 1, 1))

  const canBuy = isImported
    ? (hasVariants ? allAttrsSelected : true)
    : (hasVariants ? (allAttrsSelected && (variantStock === null || variantStock > 0)) : maxStock > 0)

  return (
    <aside className="p-5 rounded-[2rem] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col gap-4 relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

      {/* Imported notice */}
      {isImported && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <Clock size={18} className="text-amber-600 shrink-0" />
          <div>
            <p className="text-xs font-black text-amber-800 uppercase tracking-tight">Producto Importado · A Pedido</p>
            <p className="text-[11px] text-amber-700">Tiempo estimado de entrega: <strong>7 días hábiles</strong> desde la consulta.</p>
          </div>
        </div>
      )}

      {/* Price */}
      <div className="flex flex-col gap-2 relative z-10">
        <div className="flex flex-col">
          {!hasVariants && product?.has_promo && product?.promo_price ? (
            <div className="flex flex-col">
              <span className="text-sm md:text-base text-slate-400 line-through font-medium">
                {formatPrice(product)}
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-black text-green-600 tracking-tighter">
                  {formatPromoPrice(product)}
                </span>
                <span className="bg-green-100 text-green-700 text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-wider">OFERTA</span>
              </div>
            </div>
          ) : hasVariants && !allAttrsSelected ? (
            <div className="flex flex-col gap-1">
              <span className="text-sm text-slate-500 font-medium">Seleccioná una variante para ver el precio</span>
              <span className="text-2xl font-black text-slate-300 tracking-tighter">—</span>
            </div>
          ) : (
            <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
              {formattedPrice || (product ? formatPrice(product) : '—')}
            </span>
          )}
        </div>
      </div>

      {/* Variant selectors */}
      {hasVariants && (
        <div className="flex flex-col gap-3">
          {attributeKeys.map(domain => {
            const options = getOptionsForDomain(domain)
            return (
              <div key={domain}>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{domain}</span>
                <div className="flex flex-wrap gap-2">
                  {options.map(opt => {
                    const isSelected = selectedAttrs[domain] === opt
                    // Check if this option leads to a valid variant
                    const isAvailable = variants.some(v =>
                      v.attributes?.[domain] === opt &&
                      attributeKeys.filter(k => k !== domain).every(k => !selectedAttrs[k] || v.attributes?.[k] === selectedAttrs[k])
                    )
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedAttrs(prev => ({ ...prev, [domain]: opt }))}
                        className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                            : isAvailable
                              ? 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600'
                              : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                        }`}
                        disabled={!isAvailable}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Qty and Stock */}
      <div className="flex items-center justify-between gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cantidad</span>
          <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <button onClick={dec} disabled={qty <= 1} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-all font-black text-lg disabled:opacity-30">−</button>
            <input aria-label="Cantidad" value={qty} readOnly className="w-8 text-center text-sm font-black text-slate-900 bg-transparent border-none outline-none select-none" />
            <button onClick={inc} disabled={!isImported && qty >= maxStock} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-all font-black text-lg disabled:opacity-30">+</button>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Disponibilidad</span>
          <div className="h-10 flex items-center">
            {isImported ? (
              <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 uppercase tracking-tight">A pedido · 7 días</div>
            ) : hasVariants && !allAttrsSelected ? (
              <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 uppercase tracking-tight">Elegí variante</div>
            ) : effectiveStock !== null && effectiveStock > 0 ? (
              effectiveStock < 5 ? (
                <div className="flex items-center gap-1.5 text-[11px] font-black text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 uppercase tracking-tight">Últimas unidades ✓</div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-tight">Stock disponible ✓</div>
              )
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 uppercase tracking-tight">Sin Stock ✕</div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-4 pt-2">
        <div className="flex gap-3 h-14">
          <button
            onClick={() => {
              onAdd?.(product, qty, selectedVariant || null)
              setAdded(true)
              setTimeout(() => setAdded(false), 2000)
            }}
            disabled={!canBuy}
            className={`flex-1 flex items-center justify-center gap-2 font-black rounded-2xl transition-all duration-300 shadow-lg disabled:opacity-50 disabled:grayscale disabled:pointer-events-none ${added ? 'bg-green-600 text-white shadow-green-200' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/10 hover:shadow-blue-600/30'}`}
          >
            {added ? (
              <><span className="text-xl">✓</span></>
            ) : (
              <><ShoppingCart size={18} className="stroke-[2.5]" /> Agregar</>
            )}
          </button>

          {hasWA && (
            <button
              onClick={() => onWhatsApp?.(product, qty, selectedVariant)}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-900/10 hover:shadow-emerald-600/30 group/wa"
            >
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.032c0 2.12.554 4.189 1.605 6.01L0 24l6.104-1.602a11.834 11.834 0 005.681 1.448h.005c6.635 0 12.032-5.397 12.032-12.034a11.783 11.783 0 00-3.414-8.139z"/>
              </svg>
              <span>Consultar</span>
            </button>
          )}
        </div>

        {hasMeli && (
          <a
            href={product.ml_link}
            target="_blank"
            rel="noreferrer"
            onClick={() => onMeli?.(product)}
            className="flex items-center justify-center gap-3 w-full bg-white hover:bg-[#FFE300]/5 text-[#FFD100] font-bold py-2 px-4 rounded-2xl transition-all shadow-sm border-2 border-[#FFE300] group/meli"
          >
            <svg viewBox="0 0 48 48" className="w-6 h-6 fill-none stroke-current stroke-[2] transition-transform group-hover/meli:scale-110" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="24" cy="24" rx="19.5" ry="12.978" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9.7044,15.5305A20.8345,20.8345,0,0,0,16.09,17.3957a22.8207,22.8207,0,0,0,4.546-.7731" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M38.8824,15.6143a8.6157,8.6157,0,0,1-5.1653,1.4849c-3.3351,0-6.2255-2.1987-9.2148-2.1987-2.6681,0-7.189,4.3727-7.189,5.1633s1.3094,1.26,2.3717.7411c.6215-.3036,3.31-2.9151,5.4843-2.9151s9.2186,7.1361,9.8571,7.8066c.9882,1.0376-.9264,3.2733-2.1493,2.05s-3.4092-3.1621-3.4092-3.1621" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M43.4,22.6826a23.9981,23.9981,0,0,0-8.5467,2.6926" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M32.5807,27.4555c.9881,1.0376-.9265,3.2733-2.1493,2.05S27.85,26.9933,27.85,26.9933" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M30.1349,29.2147c.9882,1.0376-.9264,3.2733-2.1493,2.05S25.96,29.3032,25.96,29.3032" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M24.2015,31.3156A2.309,2.309,0,0,0,27.85,31.13" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M24.2015,31.3156c.5306-.6964.49-3.1817-2.2437-2.6876.6423-1.2188.0658-3.1457-2.3881-2.0093A1.69,1.69,0,0,0,16.424,25.96a1.4545,1.4545,0,0,0-2.8-.28c-.5435,1.1035.2964,3.0963,2.0916,1.9763-.1812,1.9435.84,2.5364,2.6845,1.7788.0989,1.91,1.367,1.7457,2.2728,1.3011A1.9376,1.9376,0,0,0,24.2015,31.3156Z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.6706,22.2785a18.3081,18.3081,0,0,1,9.0635,3.2144" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="tracking-tight text-lg">Ver en Mercado Libre</span>
          </a>
        )}
      </div>
    </aside>
  )
}
