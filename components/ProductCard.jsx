import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useState, useMemo } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Flame, Tag, ShoppingCart, PackageX, Clock } from 'lucide-react'

export default function ProductCard({ product, showSpecs = false, showCategory = false, isCompact = false, isPriority = false }){
  const { add } = useCart()
  const { currency, dolarBlue, formatPrice, formatPromoPrice, getProductPrice } = useCurrency()
  const [added, setAdded] = useState(false)
  const router = useRouter()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Check local computed flags
    const hasVariants = !!product.has_variants
    const isImported = !!product.is_imported
    const isOutOfStockLocal = !isImported && !hasVariants && (product.stock === 0 || product.stock === null || product.stock === undefined)

    if (isOutOfStockLocal) return

    if (hasVariants) {
      router.push(`/product/${product.slug}`)
      return
    }

    add(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1000)
  }

  // Resolve promo pricing
  const hasPromo = product.has_promo && product.promo_price
  const isImported = !!product.is_imported
  const hasVariants = !!product.has_variants

  // For out-of-stock detection (only for non-imported, non-variant products)
  const isOutOfStock = !isImported && !hasVariants && (product.stock === 0 || product.stock === null || product.stock === undefined)

  // Compute variant min price dynamically — reacts to currency and dolarBlue changes
  const variantMinPrice = useMemo(() => {
    if (!hasVariants) return null
    const variants = product.product_variants || []
    if (variants.length === 0) return null
    const prices = variants
      .map(v => getProductPrice({ price_usd: v.price_usd, price_ars: v.price_ars, preferred_currency: v.preferred_currency }))
      .filter(x => x > 0)
    return prices.length > 0 ? Math.min(...prices) : null
  }, [hasVariants, product.product_variants, currency, dolarBlue, getProductPrice])
  
  // Compute discount %
  const basePrice = (product.price_usd && Number(product.price_usd) > 0) ? Number(product.price_usd) : Number(product.price_ars)
  const discountPct = hasPromo && basePrice
    ? Math.round(100 - (Number(product.promo_price) / Number(basePrice)) * 100)
    : 0

  const PLACEHOLDER_IMAGE = 'https://placehold.co/600x600/1e293b/cbd5e1?text=Sin+Imagen'

  const resolveSrc = (src) => {
    if (!src || typeof src !== 'string') return PLACEHOLDER_IMAGE
    if (src.startsWith('/')) return `${router.basePath || ''}${src}`
    return src
  }

  const onMove = (e) => {
    const card = e.currentTarget
    const img = card.querySelector('.product-image')
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const px = (x / rect.width) - 0.5
    const py = (y / rect.height) - 0.5
    // No mover márgenes/borde del card; sólo parallax sutil de la imagen
    if (img && !isCompact) img.style.transform = `translate(${px * 10}px, ${py * 10}px) scale(1.02)`
  }

  const onLeave = (e) => {
    const card = e.currentTarget
    const img = card.querySelector('.product-image')
    if (img) img.style.transform = ''
  }

  const handleCardClick = () => {
    router.push(`/product/${product.slug}`)
  }

  return (
    <motion.div
      className={`product-card bg-white rounded-lg transition-all group border border-gray-100 flex relative cursor-pointer ${isCompact ? 'flex-row items-center p-2 gap-3 h-[100px] shadow-none hover:bg-slate-50' : 'flex-col p-3 shadow-sm hover:shadow-md'}`}
      onClick={handleCardClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="relative image-safe-zone !bg-white !border-gray-50 rounded-md overflow-hidden mix-blend-multiply">
        {/* Out of stock overlay */}
      {isOutOfStock && (
        <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-[1px] rounded-lg flex flex-col items-center justify-center gap-1 pointer-events-none">
          <PackageX size={22} className="text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sin Stock</span>
        </div>
      )}
      {/* Imported / A pedido overlay */}
      {isImported && (
        <div className="absolute inset-0 z-20 bg-amber-900/10 backdrop-blur-[0.5px] rounded-lg flex flex-col items-center justify-center gap-1 pointer-events-none">
          <Clock size={20} className="text-amber-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">A pedido</span>
        </div>
      )}
        {/* Promo badge */}
        {hasPromo && (
          <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded shadow-sm">
            <span className="hidden sm:inline">OFERTA</span> -{discountPct}%
          </span>
        )}
        {/* Legacy badge */}
        {!hasPromo && product.badge && (
          <span className="absolute left-3 top-3 z-10 bg-gray-900/80 text-white text-xs px-2 py-1 rounded">{product.badge}</span>
        )}
        {showCategory && product.category && (
          <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-gray-200">
            {product.category}
          </span>
        )}
        {/* Imagen primaria */}
        <div className={`relative ${isCompact ? 'w-20 h-20 flex-shrink-0' : 'w-full h-[180px] md:h-[200px]'}`}>
          <Image
            src={resolveSrc(product.image || product.image_urls?.[0])}
            alt={product.name || product.title}
            fill
            priority={isPriority}
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
            className="product-image object-contain transition-opacity duration-300 ease-out group-hover:opacity-0"
            unoptimized
          />
          {/* Segunda imagen para hover */}
          <Image
            src={resolveSrc(product.secondaryImage || product.image_urls?.[1] || product.image || product.image_urls?.[0])}
            alt={`${product.name || product.title} detalle`}
            fill
            priority={isPriority}
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
            className="object-contain opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-hover:scale-[1.03]"
            unoptimized
          />
        </div>
      </div>
      <div className={`${isCompact ? 'flex-1 min-w-0 pr-2' : 'mt-3 flex flex-col flex-1'}`}>
        <h3 className={`${isCompact ? 'text-[11px] font-bold truncate' : 'text-sm font-normal'} text-gray-700 leading-tight mb-0.5 uppercase tracking-tight`}>{product.name || product.title}</h3>
        {hasVariants && variantMinPrice ? (
          <p className={`${isCompact ? 'text-sm' : 'text-xl'} font-black text-gray-900 tracking-tighter`}>
            <span className="text-xs font-semibold text-gray-500 mr-0.5">Desde</span>
            {formatPrice(variantMinPrice)}
          </p>
        ) : hasPromo ? (
          <div className="flex items-center gap-2">
            <span className={`${isCompact ? 'text-sm' : 'text-xl'} font-black text-green-600 tracking-tighter`}>
              {formatPromoPrice(product)}
            </span>
            <span className={`${isCompact ? 'text-[9px]' : 'text-xs'} text-gray-400 line-through font-medium`}>
              {formatPrice(product)}
            </span>
          </div>
        ) : (
          <p className={`${isCompact ? 'text-sm' : 'text-xl'} font-black text-gray-900 tracking-tighter`}>
            {formatPrice(product)}
          </p>
        )}
        {showSpecs && Array.isArray(product.specs) && product.specs.length > 0 && (
          <ul className="mt-auto mb-3 text-[12px] text-gray-500 space-y-0.5">
            {product.specs.slice(0, 2).map((s, i) => (
              <li key={i} className="truncate">• {s}</li>
            ))}
          </ul>
        )}
        <div className={`flex items-center gap-2 ${isCompact ? 'mt-1' : 'mt-auto pt-3'}`}>
          {!isCompact && (
            <div 
              className="flex-1 h-10 flex items-center justify-center text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200" 
            >
              Ver detalles
            </div>
          )}
          <button 
            onClick={handleAddToCart}
            className={`${isCompact ? 'px-3 h-6 bg-blue-600 text-white hover:bg-blue-700 active:scale-95' : 'w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700'} flex-shrink-0 flex items-center justify-center rounded-md transition-all duration-300 group/cart ${added ? '!bg-green-100 !text-green-600' : ''}`}
            title="Agregar al carrito"
          >
            {added ? (
              <span className={`${isCompact ? 'text-[10px]' : 'text-xs'} font-black`}>✓</span>
            ) : isCompact ? (
               <span className="text-[9px] font-black tracking-tighter uppercase">Comprar</span>
            ) : (
              <ShoppingCart size={18} className="group-hover/cart:scale-110 transition-transform" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
