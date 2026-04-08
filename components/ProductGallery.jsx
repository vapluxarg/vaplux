import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductGallery({ images = [], alt = 'Producto', compact = false, showThumbnails = true }) {
  const safeImages = Array.isArray(images) && images.length > 0 ? images : [images].filter(Boolean)
  const [active, setActive] = useState(0)
  const router = useRouter()
  const scrollRef = useRef(null)

  const resolveSrc = (src) => {
    if (!src) return src
    return src.startsWith('/') ? `${router.basePath || ''}${src}` : src
  }

  const scrollToImage = (index) => {
    setActive(index)
    if (scrollRef.current) {
      const container = scrollRef.current
      const el = container.children[index]
      if (el) {
        container.scrollTo({ left: el.offsetLeft, behavior: 'smooth' })
      }
    }
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') scrollToImage(Math.min(active + 1, safeImages.length - 1))
      if (e.key === 'ArrowLeft') scrollToImage(Math.max(active - 1, 0))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [active, safeImages.length])

  if (safeImages.length === 0) return null

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 items-start">
      {/* Desktop Thumbnails */}
      {showThumbnails && safeImages.length > 1 && (
        <div className="hidden md:flex flex-col gap-3 order-1 pb-0 w-auto">
          {safeImages.map((src, i) => (
            <button
              key={i}
              onClick={() => scrollToImage(i)}
              className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${i === active ? 'border-blue-600 shadow-lg shadow-blue-500/20 scale-105' : 'border-slate-100 hover:border-blue-300 grayscale-[0.5] hover:grayscale-0'}`}
            >
              <img src={resolveSrc(src)} alt={`${alt} miniatura ${i + 1}`} className="w-full h-full object-cover" />
              {i === active && <div className="absolute inset-0 bg-blue-600/5 text-blue-600 flex items-center justify-center font-black"></div>}
            </button>
          ))}
        </div>
      )}

      {/* Main Image Slider */}
      <div className={`relative flex-1 group/main rounded-3xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden order-1 md:order-2 w-full ${compact ? 'max-h-[60vh] md:max-h-[70vh] lg:max-h-[75vh] min-h-[24rem]' : 'max-h-[400px] md:max-h-[500px]'}`}>
        
        <div 
           ref={scrollRef}
           className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full h-full"
           onScroll={(e) => {
             const width = e.target.clientWidth
             const idx = Math.round(e.target.scrollLeft / width)
             if (idx !== active) setActive(idx)
           }}
        >
          {safeImages.map((src, i) => (
            <div key={i} className="flex-shrink-0 w-full h-full snap-center flex items-center justify-center relative bg-white">
              <img
                src={resolveSrc(src)}
                alt={`${alt} - ${i + 1}`}
                fetchPriority={i === 0 ? "high" : "auto"}
                className={`product-image transition-all duration-700 ease-out group-hover/main:scale-[1.03] ${compact ? 'max-h-[60vh] md:max-h-[70vh] lg:max-h-[75vh] w-auto max-w-full object-contain mx-auto' : 'max-h-[400px] md:max-h-[500px] w-auto max-w-full object-contain mx-auto'}`}
              />
            </div>
          ))}
        </div>

        {/* Subtle overlay hint */}
        <div className="absolute inset-0 bg-blue-500/0 group-hover/main:bg-blue-500/[0.02] transition-colors pointer-events-none" />

        {/* Mobile Navigation Arrows */}
        {safeImages.length > 1 && (
           <div className="md:hidden absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 pointer-events-none">
              <button 
                onClick={() => scrollToImage(Math.max(active - 1, 0))}
                className={`pointer-events-auto outline-none focus:outline-none bg-white/80 backdrop-blur-md p-2 rounded-full shadow border border-slate-200 text-slate-700 transition hover:bg-white active:scale-95 ${active === 0 ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => scrollToImage(Math.min(active + 1, safeImages.length - 1))}
                className={`pointer-events-auto outline-none focus:outline-none bg-white/80 backdrop-blur-md p-2 rounded-full shadow border border-slate-200 text-slate-700 transition hover:bg-white active:scale-95 ${active === safeImages.length - 1 ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
              >
                <ChevronRight size={20} />
              </button>
           </div>
        )}

        {/* Mobile Navigation Dots */}
        {safeImages.length > 1 && (
          <div className="md:hidden absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 pointer-events-none">
            {safeImages.map((_, i) => (
               <button 
                 key={i} 
                 onClick={() => scrollToImage(i)}
                 className={`h-2 rounded-full pointer-events-auto transition-all duration-300 outline-none focus:outline-none ${active === i ? 'bg-blue-600 w-5 shadow-sm' : 'bg-slate-300 w-2 hover:bg-slate-400'}`} 
                 aria-label={`Ir a foto ${i+1}`}
               />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
