import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function ProductGallery({ images = [], alt = 'Producto', compact = false, showThumbnails = true }) {
  const safeImages = Array.isArray(images) && images.length > 0 ? images : [images].filter(Boolean)
  const [active, setActive] = useState(0)
  const router = useRouter()

  const resolveSrc = (src) => {
    if (!src) return src
    return src.startsWith('/') ? `${router.basePath || ''}${src}` : src
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') setActive((i) => Math.min(i + 1, safeImages.length - 1))
      if (e.key === 'ArrowLeft') setActive((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [safeImages.length])

  if (safeImages.length === 0) return null

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 items-start">
      {/* Thumbnails - Left on desktop, Bottom on mobile */}
      {showThumbnails && safeImages.length > 1 && (
        <div className="flex flex-row md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 w-full md:w-auto">
          {safeImages.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${i === active ? 'border-blue-600 shadow-lg shadow-blue-500/20 scale-105' : 'border-slate-100 hover:border-blue-300 grayscale-[0.5] hover:grayscale-0'}`}
            >
              <img src={resolveSrc(src)} alt={`${alt} miniatura ${i + 1}`} className="w-full h-full object-cover" />
              {i === active && <div className="absolute inset-0 bg-blue-600/5 text-blue-600 flex items-center justify-center font-black"></div>}
            </button>
          ))}
        </div>
      )}

      {/* Main Image - Right on desktop, top on mobile */}
      <div className={`relative flex-1 group/main rounded-3xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden order-1 md:order-2 w-full ${compact ? 'flex items-center justify-center max-h-[60vh] md:max-h-[70vh] lg:max-h-[75vh] min-h-[24rem]' : 'max-h-[400px] md:max-h-[500px] flex items-center justify-center bg-white'}`}>
        <img
          src={resolveSrc(safeImages[active])}
          alt={alt}
          fetchPriority="high"
          className={`product-image transition-all duration-700 ease-out group-hover/main:scale-[1.03] ${compact ? 'max-h-[60vh] md:max-h-[70vh] lg:max-h-[75vh] w-auto max-w-full object-contain mx-auto' : 'max-h-[400px] md:max-h-[500px] w-auto max-w-full object-contain mx-auto'}`}
        />
        {/* Subtle overlay hint */}
        <div className="absolute inset-0 bg-blue-500/0 group-hover/main:bg-blue-500/[0.02] transition-colors pointer-events-none" />
      </div>
    </div>
  )
}
