import Head from 'next/head'
import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import { SlidersHorizontal, X, Clock, MessageCircle } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { useCurrency } from '@/context/CurrencyContext'

export async function getStaticProps() {
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .eq('store', 'vaplux')
    .order('name')

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name, id), product_variants(price_usd, price_ars, preferred_currency, stock)')
    .eq('is_active', true)
    .eq('store', 'vaplux')
    .eq('is_imported', true)

  const mapped = (products || []).map(p => ({
    ...p,
    name: p.title,
    category: p.categories?.name || 'Importado',
    specs: p.description ? p.description.split('\n') : [],
    image: p.image_urls?.[0] || null,
    secondaryImage: p.image_urls?.[1] || null,
    slug: p.slug || p.id,
  }))

  return {
    props: { dbProducts: mapped, dbCategories: categories || [] },
    revalidate: 60,
  }
}

const getBrand = (name) => {
  const n = name.toLowerCase()
  if (n.includes('iphone') || n.includes('apple') || n.includes('ipad') || n.includes('macbook') || n.includes('watch') || n.includes('airpods')) return 'Apple'
  if (n.includes('samsung') || n.includes('galaxy')) return 'Samsung'
  if (n.includes('xiaomi') || n.includes('redmi') || n.includes('poco')) return 'Xiaomi'
  if (n.includes('motorola') || n.includes('moto')) return 'Motorola'
  const first = n.split(' ')[0]
  if (first.length > 2) return first.charAt(0).toUpperCase() + first.slice(1)
  return 'Otra'
}

export default function Importados({ dbProducts = [], dbCategories = [] }) {
  const [filters, setFilters] = useState({ query: '', priceMin: '', priceMax: '', sort: 'relevance', category: '', brand: '' })
  const [showFilters, setShowFilters] = useState(false)
  const { getProductPrice, currency, dolarBlue } = useCurrency()

  useEffect(() => {
    if (showFilters) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
  }, [showFilters])

  const groups = dbCategories.map(c => c.name)
  const titles = {}
  dbCategories.forEach(c => { titles[c.name] = c.name })

  const availableBrands = useMemo(() => {
    const b = new Set()
    dbProducts.forEach(p => b.add(getBrand(p.name)))
    return Array.from(b).sort()
  }, [dbProducts])

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase()
    let list = dbProducts.filter(p => {
      const matchQuery = q === '' || p.name.toLowerCase().includes(q) || (p.specs || []).join(' ').toLowerCase().includes(q)
      const matchCat = filters.category === '' || p.category === filters.category
      const matchBrand = filters.brand === '' || getBrand(p.name) === filters.brand
      const minP = filters.priceMin === '' ? 0 : Number(filters.priceMin)
      const maxP = filters.priceMax === '' ? 9999999 : Number(filters.priceMax)
      const currentPrice = getProductPrice(p) || 0
      const matchPrice = currentPrice >= minP && currentPrice <= maxP
      return matchQuery && matchCat && matchBrand && matchPrice
    })

    switch (filters.sort) {
      case 'price-asc': list = [...list].sort((a, b) => getProductPrice(a) - getProductPrice(b)); break
      case 'price-desc': list = [...list].sort((a, b) => getProductPrice(b) - getProductPrice(a)); break
      case 'name-asc': list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break
      default: break
    }
    return list
  }, [filters, dbProducts, getProductPrice])

  return (
    <>
      <Head>
        <title>Importados · A Pedido · Vaplux</title>
        <meta name="description" content="Productos importados a pedido en Vaplux. Demora estimada 7 días. Consultá por cualquier producto a traer." />
        <meta property="og:title" content="Importados · Vaplux" />
      </Head>
      <div className="home-celeste min-h-screen font-sans text-gray-900 selection:bg-amber-200">
        <a id="top" />
        <Navbar />

        <main className="max-w-[1400px] mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 lg:gap-8 relative items-start">

          {/* Toggle Mobile Filters */}
          <div className="md:hidden sticky top-[72px] z-[50] w-full mb-4 px-2">
            <button
              onClick={() => setShowFilters(true)}
              className="w-full bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-lg text-sm font-bold text-gray-800 flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all"
            >
              <SlidersHorizontal size={16} className="text-amber-600" />
              <span>Filtros y categorías</span>
              {(filters.category || filters.brand || filters.priceMin || filters.priceMax) && (
                <span className="ml-1 w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
              )}
            </button>
          </div>

          {/* Sidebar */}
          <aside className={`
            ${showFilters
              ? 'fixed inset-0 z-[5000] bg-white flex flex-col animate-slide-up h-screen w-full'
              : 'hidden md:block w-64 lg:w-72 flex-shrink-0 sticky top-24 h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar'
            }
          `}>
            <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className={`p-6 md:p-0 md:pr-4 flex-1 overflow-y-auto ${showFilters ? 'bg-white' : ''}`}>
              <h1 className="text-2xl font-semibold mb-1 text-gray-900 hidden md:block">Importados</h1>
              <p className="text-xs text-amber-600 font-semibold mb-5 hidden md:block">Productos a pedido · Demora 7 días</p>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-full px-4 py-3 md:py-2 bg-gray-50 md:bg-white border border-gray-200 rounded-xl md:rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 text-sm transition-all"
                  value={filters.query}
                  onChange={e => setFilters({ ...filters, query: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-[11px] uppercase tracking-widest mb-3 text-gray-400">Categorías</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>
                    <button onClick={() => setFilters({ ...filters, category: '' })} className={`hover:text-amber-600 transition-colors block w-full text-left py-1 ${filters.category === '' ? 'font-bold text-amber-600' : ''}`}>
                      Todas
                    </button>
                  </li>
                  {groups.map(cat => (
                    <li key={cat}>
                      <button onClick={() => setFilters({ ...filters, category: cat })} className={`hover:text-amber-600 transition-colors block w-full text-left py-1 ${filters.category === cat ? 'font-bold text-amber-600' : ''}`}>
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {availableBrands.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-bold text-[11px] uppercase tracking-widest mb-3 text-gray-400">Marcas</h3>
                  <ul className="space-y-1 text-sm text-gray-600 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    <li>
                      <button onClick={() => setFilters({ ...filters, brand: '' })} className={`hover:text-amber-600 transition-colors block w-full text-left py-1 ${filters.brand === '' ? 'font-bold text-amber-600' : ''}`}>Todas las marcas</button>
                    </li>
                    {availableBrands.map(b => (
                      <li key={b}>
                        <button onClick={() => setFilters({ ...filters, brand: b })} className={`hover:text-amber-600 transition-colors block w-full text-left py-1 ${filters.brand === b ? 'font-bold text-amber-600' : ''}`}>{b}</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-bold text-[11px] uppercase tracking-widest mb-3 text-gray-400">Rango de Precio</h3>
                <div className="flex items-center gap-3">
                  <input type="number" placeholder="Mín" value={filters.priceMin} onChange={e => setFilters({ ...filters, priceMin: e.target.value })} className="w-full px-3 py-2 bg-gray-50 md:bg-white border border-gray-200 rounded-xl md:rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400" />
                  <span className="text-gray-400">—</span>
                  <input type="number" placeholder="Máx" value={filters.priceMax} onChange={e => setFilters({ ...filters, priceMax: e.target.value })} className="w-full px-3 py-2 bg-gray-50 md:bg-white border border-gray-200 rounded-xl md:rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400" />
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/5491160994925?text=%C2%A1Hola!%20Quisiera%20consultar%20por%20un%20producto%20importado."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 hover:bg-green-100 transition-colors group"
              >
                <MessageCircle size={16} className="text-green-600 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-xs font-bold text-green-800">¿No encontrás lo que buscás?</p>
                  <p className="text-[10px] text-green-600">Consultanos, podemos traerlo</p>
                </div>
              </a>
            </div>

            {/* Mobile footer */}
            <div className="md:hidden p-4 border-t border-gray-100 bg-gray-50 sticky bottom-0">
              <button onClick={() => setShowFilters(false)} className="w-full bg-amber-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all">
                Ver {filtered.length} resultados
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
              <span className="text-sm text-gray-600 font-medium">
                {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm tracking-wide text-gray-500">Ordenar por</span>
                <select
                  value={filters.sort}
                  onChange={e => setFilters({ ...filters, sort: e.target.value })}
                  className="bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer hover:text-amber-600 transition-colors"
                >
                  <option value="relevance">Relevancia</option>
                  <option value="price-asc">Menor precio</option>
                  <option value="price-desc">Mayor precio</option>
                  <option value="name-asc">A → Z</option>
                </select>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                <Clock size={40} className="text-amber-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">No encontramos productos que coincidan.</p>
                <p className="text-sm text-gray-400 mt-1">Recordá que podés consultarnos por cualquier producto a traer.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} showCategory={!filters.category} isPriority={i < 4} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
