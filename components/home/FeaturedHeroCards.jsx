import Image from 'next/image'
import { motion } from 'framer-motion'
import { TrendingUp, ShoppingCart, ExternalLink, ChevronRight } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'

import Link from 'next/link'

export default function FeaturedHeroCards({ products = [] }) {
  const { getProductPrice, formatPrice, formatPromoPrice } = useCurrency()
  if (products.length === 0) return null

  // Ensure we only show 3
  const displayProducts = products.slice(0, 3)

  return (
    <div className="relative w-full h-[350px] md:h-[500px] flex items-center justify-center mt-12 md:mt-0">
      {displayProducts.map((product, idx) => {
        // Different rotation and translation for each card to create the "overlapping" look
        const configs = [
          { z: 30, rotate: -4, x: -200, y: 60, scale: 0.85 },   // Left card
          { z: 50, rotate: 0, x: 0, y: -40, scale: 1.05 },    // Center card (top of pyramid)
          { z: 30, rotate: 4, x: 200, y: 80, scale: 0.85 },    // Right card
        ]
        
        const config = configs[idx] || configs[0]

        return (
          <Link
            key={product.id}
            href={`/product/${product.slug || product.id}`}
            className="absolute transition-all duration-700 hover:z-[100] hover:scale-110 group cursor-pointer"
            style={{
              zIndex: config.z,
              transform: `translate(${config.x}px, ${config.y}px) rotate(${config.rotate}deg) scale(${config.scale})`,
            }}
          >
            <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 p-4 md:p-5 w-[180px] md:w-[240px] backdrop-blur-md bg-white/95 transition-transform hover:-translate-y-2">
              {/* Image Container */}
              <div className="relative aspect-square w-full mb-4 overflow-hidden rounded-[1.5rem] bg-gray-50 flex items-center justify-center p-4">
                 <Image
                    src={product.image_urls?.[0] || '/placeholder.png'}
                    alt={product.title}
                    width={180}
                    height={180}
                    className="object-contain hover:scale-105 transition-transform duration-500"
                    priority
                  />
                  {idx === 1 && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-lg">
                        TOP
                    </div>
                  )}
              </div>

              {/* Info */}
              <div className="text-center">
                <h3 className="text-sm md:text-md font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors px-1">
                  {product.title}
                </h3>
                <div className="mt-3">
                  <span className="text-blue-600 font-black text-xl md:text-2xl">
                    {product.has_promo && product.promo_price ? formatPromoPrice(product) : formatPrice(getProductPrice(product))}
                  </span>
                </div>
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-600">
                      Ver producto <ChevronRight size={14} />
                    </span>
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
