import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Carousel({ slides = [] }){
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (paused || slides.length <= 1) return
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(intervalRef.current)
  }, [paused, slides.length])

  const goTo = (i) => setIndex(i % slides.length)
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length)
  const next = () => setIndex((i) => (i + 1) % slides.length)

  return (
    <section
      className="relative max-w-5xl mx-auto px-4 py-8"
      role="region"
      aria-roledescription="carousel"
      aria-label="Oferta Exclusiva"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-xl card-structure">
        <div
          className="flex transition-transform duration-700"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((s, i) => (
            <div key={i} className="min-w-full p-6 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900">{s.title}</h2>
                  <p className="mt-1 text-slate-600">{s.subtitle}</p>
                  <div className="mt-4 flex gap-2">
                    {s.cta?.map((c, ci) => (
                      <Link key={ci} href={c.href} className={`btn-cta ${c.variant === 'secondary' ? 'btn-cta-secondary' : 'btn-cta-primary'}`}>{c.label}</Link>
                    ))}
                  </div>
                </div>
                {s.image && (
                  <div className="image-safe-zone w-64">
                    <img src={`${router.basePath || ''}${s.image}`} alt={s.imageAlt || s.title} className="product-image" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-2" aria-label="Indicadores">
          {slides.map((_, i) => (
            <button
               key={i}
               aria-label={`Ir al slide ${i + 1}`}
               className={`h-2.5 w-2.5 rounded-full transition-colors ${i === index ? 'bg-brand shadow-glow' : 'bg-slate-300 hover:bg-slate-400'}`}
               onClick={() => goTo(i)}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button className="btn-cta btn-cta-secondary" onClick={prev} aria-label="Anterior">Anterior</button>
          <button className="btn-cta btn-cta-primary" onClick={next} aria-label="Siguiente">Siguiente</button>
        </div>
      </div>
    </section>
  )
}
