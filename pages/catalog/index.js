import Navbar from '@/components/Navbar'
import ProductCard from '@/components/ProductCard'
import { SlidersHorizontal, X } from 'lucide-react'

import { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { getDolarBlue } from '@/utils/dolar'
import { useCurrency } from '@/context/CurrencyContext'

export async function getStaticProps() {
  // Fetch active categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .eq('store', 'vaplux')
    .order('name');

  // Fetch active products (exclude imported — they go to /importados)
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('*, categories(name, id), product_variants(price_usd, price_ars, preferred_currency, stock)')
    .eq('is_active', true)
    .eq('store', 'vaplux')
    .eq('is_imported', false);

  if (catError || prodError) {
    console.error('Supabase error:', catError, prodError);
    return { props: { dbProducts: [], dbCategories: [] }, revalidate: 60 };
  }

  const mappedProducts = products.map(p => ({
    ...p,
    name: p.title,
    category: p.categories?.name || 'Uncategorized',
    specs: p.description ? p.description.split('\n') : [],
    image: (p.image_urls && p.image_urls.length > 0) ? p.image_urls[0] : null,
    secondaryImage: (p.image_urls && p.image_urls.length > 1) ? p.image_urls[1] : null,
    slug: p.slug || p.id,
  }));

  return {
    props: {
      dbProducts: mappedProducts,
      dbCategories: categories || []
    },
    revalidate: 60
  }
}

const getBrand = (name) => {
  const n = name.toLowerCase();
  if (n.includes('iphone') || n.includes('apple') || n.includes('ipad') || n.includes('macbook') || n.includes('watch') || n.includes('airpods')) return 'Apple';
  if (n.includes('samsung') || n.includes('galaxy')) return 'Samsung';
  if (n.includes('xiaomi') || n.includes('redmi') || n.includes('poco')) return 'Xiaomi';
  if (n.includes('motorola') || n.includes('moto')) return 'Motorola';
  if (n.includes('vaporesso')) return 'Vaporesso';
  if (n.includes('uwell') || n.includes('caliburn')) return 'Uwell';
  if (n.includes('voopoo')) return 'Voopoo';
  if (n.includes('smok')) return 'Smok';
  if (n.includes('elfbar') || n.includes('elf bar')) return 'Elfbar';
  if (n.includes('geekvape') || n.includes('geek vape')) return 'Geekvape';
  if (n.includes('ignite')) return 'Ignite';
  if (n.includes('lost mary')) return 'Lost Mary';
  
  const first = n.split(' ')[0];
  if (first.length > 2) return first.charAt(0).toUpperCase() + first.slice(1);
  return 'Otra';
}

import Head from 'next/head'

export default function Catalog({ dbProducts = [], dbCategories = [] }){
  const [filters, setFilters] = useState({ query: '', priceMin: '', priceMax: '', sort: 'relevance', category: '', brand: '', promoOnly: false })
  const [showFilters, setShowFilters] = useState(false)
  const { getProductPrice, currency, dolarBlue } = useCurrency()

  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [showFilters])
  
  // Extract groups and ids dynamically from the DB
  const groups = dbCategories.map(c => c.name);
  const titles = {};
  const ids = {};
  dbCategories.forEach(c => {
    titles[c.name] = c.name;
    ids[c.name] = c.slug;
  });

  const availableBrands = useMemo(() => {
    const b = new Set()
    dbProducts.forEach(p => b.add(getBrand(p.name)))
    return Array.from(b).sort()
  }, [dbProducts])

  const filtered = useMemo(() => {
    const q = filters.query.trim().toLowerCase()
    let list = dbProducts.filter(p => {
      const matchQuery = q === '' || p.name.toLowerCase().includes(q) || (p.specs||[]).join(' ').toLowerCase().includes(q)
      const matchCat = filters.category === '' || p.category === filters.category
      const matchBrand = filters.brand === '' || getBrand(p.name) === filters.brand
      const minP = filters.priceMin === '' ? 0 : Number(filters.priceMin)
      const maxP = filters.priceMax === '' ? 9999999 : Number(filters.priceMax)
      
      const currentPrice = getProductPrice(p) || 0;
      const matchPrice = currentPrice >= minP && currentPrice <= maxP
      const matchPromo = filters.promoOnly ? p.has_promo : true

      return matchQuery && matchCat && matchBrand && matchPrice && matchPromo
    })

    switch (filters.sort) {
      case 'promo-desc':
        list = [...list].sort((a,b) => {
          const origA = currency === 'USD' ? (a.price_usd || a.price_ars/dolarBlue) : (a.price_ars || a.price_usd*dolarBlue);
          const origB = currency === 'USD' ? (b.price_usd || b.price_ars/dolarBlue) : (b.price_ars || b.price_usd*dolarBlue);
          
          const discA = a.has_promo && origA ? (1 - getProductPrice(a) / origA) : 0
          const discB = b.has_promo && origB ? (1 - getProductPrice(b) / origB) : 0
          return discB - discA
        })
        break
      case 'price-asc':
        list = [...list].sort((a,b) => getProductPrice(a) - getProductPrice(b))
        break
      case 'price-desc':
        list = [...list].sort((a,b) => getProductPrice(b) - getProductPrice(a))
        break
      case 'name-asc':
        list = [...list].sort((a,b) => a.name.localeCompare(b.name))
        break
      default:
        break
    }
    return list
  }, [filters, dbProducts, getProductPrice, currency, dolarBlue])

  return (
    <>
      <Head>
        <title>Catálogo Completo · Vaplux</title>
        <meta name="description" content="Explorá todo nuestro catálogo de productos en Vaplux. La mejor tecnología, Apple, accesorios y vapeo." />
        <meta property="og:title" content="Catálogo Completo · Vaplux" />
      </Head>
      <div className="home-celeste min-h-screen font-sans text-gray-900 selection:bg-blue-200">
        <a id="top" />
        <Navbar />
      <main className="max-w-[1400px] mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 lg:gap-8 relative items-start">
        
        {/* Toggle Mobile Filters */}
        <div className="md:hidden sticky top-[72px] z-[50] w-full mb-4 px-2">
          <button 
            onClick={() => setShowFilters(true)} 
            className="w-full bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-lg text-sm font-bold text-gray-800 flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all"
          >
            <SlidersHorizontal size={16} className="text-blue-600" />
            <span>Filtros y categorías</span>
            { (filters.category || filters.brand || filters.promoOnly || filters.priceMin || filters.priceMax) && (
              <span className="ml-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Sidebar Filters / Mobile Drawer */}
        <aside className={`
          ${showFilters 
            ? 'fixed inset-0 z-[5000] bg-white flex flex-col animate-slide-up h-screen w-full' 
            : 'hidden md:block w-64 lg:w-72 flex-shrink-0 sticky top-24 h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar'
          }
        `}>
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
            <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
            <button 
              onClick={() => setShowFilters(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          <div className={`p-6 md:p-0 md:pr-4 flex-1 overflow-y-auto ${showFilters ? 'bg-white' : ''}`}>
            <h1 className="text-2xl font-semibold mb-1 text-gray-900 hidden md:block">Catálogo</h1>
            <p className="text-xs text-green-600 font-semibold mb-5 hidden md:block">Con stock para entrega inmediata</p>
            
            <div className="mb-4">
               <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-full px-4 py-3 md:py-2 bg-gray-50 md:bg-white border border-gray-200 rounded-xl md:rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm transition-all"
                  value={filters.query}
                  onChange={e => setFilters({...filters, query: e.target.value})}
                />
            </div>

            <div className="mb-4">
              <h3 className="font-bold text-[11px] uppercase tracking-widest mb-3 text-gray-400">Categorías</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>
                  <button 
                    onClick={() => setFilters({...filters, category: ''})}
                    className={`hover:text-blue-600 transition-colors block w-full text-left py-1 ${filters.category === '' ? 'font-bold text-blue-600' : ''}`}
                  >
                    Todas las categorías
                  </button>
                </li>
                {groups.map(cat => (
                  <li key={cat}>
                    <button 
                      onClick={() => setFilters({...filters, category: cat})}
                      className={`hover:text-blue-600 transition-colors block w-full text-left py-1 ${filters.category === cat ? 'font-bold text-blue-600' : ''}`}
                    >
                      {titles[cat]}
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
                    <button 
                      onClick={() => setFilters({...filters, brand: ''})}
                      className={`hover:text-blue-600 transition-colors block w-full text-left py-1 ${filters.brand === '' ? 'font-bold text-blue-600' : ''}`}
                    >
                      Todas las marcas
                    </button>
                  </li>
                  {availableBrands.map(b => (
                    <li key={b}>
                      <button 
                        onClick={() => setFilters({...filters, brand: b})}
                        className={`hover:text-blue-600 transition-colors block w-full text-left py-1 ${filters.brand === b ? 'font-bold text-blue-600' : ''}`}
                      >
                        {b}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-bold text-[11px] uppercase tracking-widest mb-3 text-gray-400">Rango de Precio</h3>
              <div className="flex items-center gap-3">
                <input 
                  type="number" 
                  placeholder="Mín" 
                  value={filters.priceMin}
                  onChange={e => setFilters({...filters, priceMin: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 md:bg-white border border-gray-200 rounded-xl md:rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
                <span className="text-gray-400">—</span>
                <input 
                  type="number" 
                  placeholder="Máx"
                  value={filters.priceMax}
                  onChange={e => setFilters({...filters, priceMax: e.target.value})} 
                  className="w-full px-3 py-2 bg-gray-50 md:bg-white border border-gray-200 rounded-xl md:rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
            </div>

            <div className="mb-6 pt-4 border-t border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={filters.promoOnly}
                    onChange={e => setFilters({...filters, promoOnly: e.target.checked})}
                    className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded-lg focus:ring-blue-500 transition-all cursor-pointer"
                  />
                </div>
                <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Solo Promociones</span>
              </label>
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="md:hidden p-4 border-t border-gray-100 bg-gray-50 sticky bottom-0">
             <button 
                onClick={() => setShowFilters(false)}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-all"
             >
                Ver {filtered.length} resultados
             </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
            <span className="text-sm text-gray-600 font-medium">
              {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm tracking-wide text-gray-500">Ordenar por</span>
              <select 
                value={filters.sort}
                onChange={e => setFilters({...filters, sort: e.target.value})}
                className="bg-transparent text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer hover:text-blue-600 transition-colors"
              >
                <option value="relevance">Relevancia</option>
                <option value="promo-desc">Mayor descuento</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
             <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                <p className="text-gray-500 text-lg">No encontramos productos que coincidan con tu búsqueda.</p>
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
