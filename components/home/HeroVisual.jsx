import Image from 'next/image'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import FeaturedHeroCards from './FeaturedHeroCards'
import { ChevronRight } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'

export default function HeroVisual({ topProducts = [] }){
  const { getProductPrice, formatPrice, formatPromoPrice } = useCurrency()
  return (
    <section className="relative w-full min-h-[85vh] md:min-h-[90vh] flex items-start overflow-hidden">
      {/* Sony Xperia Style Aurora Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-white">
        <div className="aurora-bg-v2" />
      </div>

      <div className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-start pt-12 md:pt-16 lg:pt-20 pb-0">
        
        {/* Left Content: Slogan & CTAs */}
        <div className="flex flex-col items-start text-left mt-8 md:mt-0">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-[#0f172a] leading-[0.85]">
            <motion.span 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
              className="block"
            >
              Elegí mejor.
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
              className="block"
            >
              Elegí <span className="text-vaplux-glow">Vaplux.</span>
            </motion.span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 md:mt-8 text-lg md:text-xl text-gray-400 font-medium max-w-lg leading-snug md:leading-relaxed"
          >
            Encontrá los productos que necesitás, al mejor precio y con el respaldo de un servicio diseñado para vos.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex items-center gap-4"
          >
            <a href="/catalog" className="group px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
              Ver catálogo
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="/contacto" className="px-8 py-4 bg-white text-gray-900 border border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm">
              Contacto
            </a>
          </motion.div>
        </div>

        {/* Right Content: Overlapping Cards */}
        <div className="relative hidden lg:block animate-reveal" style={{ animationDelay: '0.4s' }}>
          <FeaturedHeroCards products={topProducts} />
        </div>

        {/* Mobile Featured View (Simpler version for mobile) */}
        <div className="lg:hidden w-full overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory">
           <div className="flex gap-4 px-4 w-max">
              {topProducts.slice(0, 3).map((p, i) => (
                <div key={p.id} className="w-[280px] snap-center">
                   <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xl shadow-blue-50/50">
                      <div className="relative aspect-square rounded-2xl bg-gray-50 flex items-center justify-center mb-4 p-4">
                        <Image 
                          src={p.image_urls?.[0] || '/placeholder.png'} 
                          alt={p.title} 
                          width={180} 
                          height={180} 
                          className="object-contain" 
                          priority
                        />
                      </div>

                      <h3 className="font-bold text-gray-900 truncate">{p.title}</h3>
                      <div className="mt-2 flex items-center justify-between">
                         <span className="text-blue-600 font-bold whitespace-nowrap">
                           {p.has_variants && p.product_variants?.length > 0 ? (
                             <>
                               <span className="text-[0.6em] font-semibold text-gray-500 mr-1">Desde</span>
                               {formatPrice(Math.min(...p.product_variants.map(v => getProductPrice(v)).filter(price => price > 0)) || getProductPrice(p))}
                             </>
                           ) : (
                             p.has_promo && p.promo_price ? formatPromoPrice(p) : formatPrice(getProductPrice(p))
                           )}
                         </span>
                         <a href={`/product/${p.slug || p.id}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ChevronRight size={16} /></a>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </section>
  )
}
