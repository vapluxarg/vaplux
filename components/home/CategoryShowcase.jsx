import ProductCard from '@/components/ProductCard'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function CategoryShowcase({ categoryProducts = [] }) {
  if (!categoryProducts || categoryProducts.length === 0) return null

  return (
    <section className="py-8 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="mb-8 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4">
            Explorá por <span className="text-blue-600 italic">Categoría.</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium max-w-xl">
            Sumergite en nuestra selección premium. Calidad y rendimiento en cada equipo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16">
          {categoryProducts.filter(cat => cat.products.length > 0).map((cat) => (
            <div key={cat.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Anchor Card - Half height */}
              <Link
                href={`/catalog?category=${cat.slug}`}
                className="group/card relative overflow-hidden rounded-3xl bg-blue-700 p-6 flex flex-col justify-end shadow-xl hover:bg-blue-600 transition-all duration-300 h-[220px]"
              >
                {/* Visual accents to ensure it feels "Electric" */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 opacity-100" />
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12" />

                <div className="relative z-10">
                  <span className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Explorá</span>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none mb-4 group-hover/card:translate-x-1 transition-transform">
                    {cat.name}
                  </h3>
                  <div className="inline-flex items-center gap-2 text-white text-sm font-bold bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 group-hover/card:bg-white group-hover/card:text-blue-700 transition-all">
                    Ver todo <ArrowRight size={16} />
                  </div>
                </div>
              </Link>

              {/* Vertical Product Stack */}
              <div className="flex flex-col gap-3 justify-between">
                {cat.products.slice(0, 2).map(product => (
                  <ProductCard key={product.id} product={product} isCompact />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
