import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState, useRef } from 'react'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { supabase } from '@/utils/supabase'
import { Search, ShoppingCart, X, Menu, Mail } from 'lucide-react'

import Image from 'next/image'

export default function Navbar() {
  const { totalItems, toggleCart, isBouncing } = useCart()
  const { currency, toggleCurrency, dolarBlue } = useCurrency()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const mobilePanelRef = useRef(null)

  const [exploreOpen, setExploreOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const exploreCloseTimer = useRef(null)
  const servicesCloseTimer = useRef(null)
  const CLOSE_DELAY = 1000

  const [categories, setCategories] = useState([])

  useEffect(() => {
    async function fetchCategories() {
      const { data: cats } = await supabase.from('categories').select('*').eq('is_active', true).order('name')
      if (cats) {
        setCategories(cats)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    return () => {
      if (exploreCloseTimer.current) clearTimeout(exploreCloseTimer.current)
      if (servicesCloseTimer.current) clearTimeout(servicesCloseTimer.current)
    }
  }, [])

  return (
    <nav role="navigation" aria-label="Navegación principal" className="sticky top-0 w-full z-[2000] border-b border-slate-200/50 backdrop-blur-md bg-white/80">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-3 grid grid-cols-2 md:grid-cols-3 items-center">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="h-8 md:h-10 w-auto flex items-center justify-center">
              <Image
                src="/assets/logo.PNG"
                alt="Vaplux Logo"
                width={40}
                height={40}
                className="h-full w-auto object-contain"
                priority
              />
            </div>
            <span className="font-bold text-slate-800 text-xl tracking-tight">Vaplux</span>
          </Link>
        </div>
        <ul className="hidden md:flex items-center justify-center gap-8" role="menubar">
          {/* Dropdown Catálogo */}
          <div
            className="relative"
            onMouseEnter={() => {
              if (exploreCloseTimer.current) clearTimeout(exploreCloseTimer.current)
              setExploreOpen(true)
              if (servicesCloseTimer.current) clearTimeout(servicesCloseTimer.current)
              if (servicesOpen) setServicesOpen(false)
            }}
            onMouseLeave={() => {
              if (exploreCloseTimer.current) clearTimeout(exploreCloseTimer.current)
              exploreCloseTimer.current = setTimeout(() => setExploreOpen(false), CLOSE_DELAY)
            }}
          >
            <Link
              className={`text-slate-700 text-sm font-medium inline-flex items-center gap-1 hover:text-brand transition-colors py-2`}
              href="/catalog"
              onClick={(e) => { e.preventDefault(); setExploreOpen(true); }}
            >
              Catálogo <span className="text-brand/70 text-xs">▾</span>
            </Link>
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 min-w-[240px] rounded-2xl border border-slate-200/60 bg-white/95 backdrop-blur-xl p-3 shadow-2xl z-[3000] transition-all duration-300 ${exploreOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'}`}
              onMouseEnter={() => {
                if (exploreCloseTimer.current) clearTimeout(exploreCloseTimer.current)
              }}
              onMouseLeave={() => {
                exploreCloseTimer.current = setTimeout(() => setExploreOpen(false), CLOSE_DELAY)
              }}
            >
              <Link className="block px-4 py-2.5 rounded-xl hover:bg-slate-50 text-slate-800 font-medium transition-colors mb-1" href="/catalog">Ver todo el catálogo</Link>
              {categories.map(c => (
                <Link key={c.id} className="block px-4 py-2 rounded-xl text-sm hover:bg-brand/10 hover:text-brand text-slate-600 transition-colors" href={`/catalog/${c.slug}`}>{c.name}</Link>
              ))}
            </div>
          </div>

          {/* Dropdown Servicio Técnico */}
          <div
            className="relative"
            onMouseEnter={() => {
              if (servicesCloseTimer.current) clearTimeout(servicesCloseTimer.current)
              setServicesOpen(true)
              if (exploreCloseTimer.current) clearTimeout(exploreCloseTimer.current)
              if (exploreOpen) setExploreOpen(false)
            }}
            onMouseLeave={() => {
              if (servicesCloseTimer.current) clearTimeout(servicesCloseTimer.current)
              servicesCloseTimer.current = setTimeout(() => setServicesOpen(false), CLOSE_DELAY)
            }}
          >
            <Link
              className={`text-slate-700 text-sm font-medium inline-flex items-center gap-1 hover:text-brand transition-colors py-2`}
              href="/services"
              onClick={(e) => { e.preventDefault(); setServicesOpen(true); }}
            >
              Servicios <span className="text-brand/70 text-xs">▾</span>
            </Link>
            <div
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 min-w-[260px] rounded-2xl border border-slate-200/60 bg-white/95 backdrop-blur-xl p-3 shadow-2xl z-[3000] transition-all duration-300 ${servicesOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'}`}
              onMouseEnter={() => {
                if (servicesCloseTimer.current) clearTimeout(servicesCloseTimer.current)
              }}
              onMouseLeave={() => {
                servicesCloseTimer.current = setTimeout(() => setServicesOpen(false), CLOSE_DELAY)
              }}
            >
              <Link className="block px-4 py-2.5 rounded-xl hover:bg-slate-50 text-slate-800 transition-colors text-sm" href="/services/reparacion-iphones">Reparación de iPhones</Link>
              <Link className="block px-4 py-2.5 rounded-xl hover:bg-slate-50 text-slate-800 transition-colors text-sm" href="/services/trabaja-con-nosotros">Trabajá con Nosotros</Link>
              <div className="h-px w-full bg-slate-100 my-2"></div>
              <Link className="block px-4 py-2.5 rounded-xl hover:bg-brand/10 text-brand transition-colors text-sm font-medium" href="/services">Ver todos los servicios</Link>
            </div>
          </div>

          <li>
            <Link className={`text-slate-700 text-sm font-medium inline-flex items-center gap-1 hover:text-brand transition-colors py-2`} href="/contacto">
              Contacto
            </Link>
          </li>
        </ul>
        <div className="flex items-center justify-end gap-3 md:gap-4">
          {router.pathname !== '/' && dolarBlue && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full animate-reveal">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Dólar</span>
              <span className="text-[11px] font-extrabold text-blue-600">1 USD = ${dolarBlue?.toLocaleString('es-AR')}</span>
            </div>
          )}

          <button
            onClick={toggleCurrency}
            className="flex items-center bg-slate-100 rounded-full p-1 transition-all shadow-inner border border-slate-200"
            title="Cambiar moneda"
          >
            <div className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${currency === 'ARS' ? 'bg-[#71C5EE] text-white shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
              ARS
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${currency === 'USD' ? 'bg-[#16A34A] text-white shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}>
              USD
            </div>
          </button>

          <button className={`inline-flex items-center hover:bg-slate-100 p-2 rounded-full transition-all relative ${isBouncing ? 'animate-bounce-subtle bg-blue-50' : ''}`} onClick={toggleCart} aria-label="Abrir carrito">
            <ShoppingCart size={22} className="text-slate-700" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white shadow-sm shadow-brand/40 ring-2 ring-white">
                {totalItems}
              </span>
            )}
          </button>
          <button className="md:hidden p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-700" onClick={() => setOpen(v => !v)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white opacity-100 shadow-2xl absolute w-full left-0 z-[2000] animate-slide-down" aria-modal="true" role="dialog">
          <div ref={mobilePanelRef} className="max-w-screen-xl mx-auto px-6 py-6 flex flex-col gap-4">
            <div className="relative mb-2">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input aria-label="Buscar productos" placeholder="Buscar en Vaplux..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>

            {router.pathname !== '/' && dolarBlue && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm animate-reveal">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Dólar</span>
                  <span className="text-xs font-bold text-blue-600">1 USD = ${dolarBlue?.toLocaleString('es-AR')}</span>
                </div>
                <button
                  onClick={toggleCurrency}
                  className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200"
                >
                  <div className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${currency === 'ARS' ? 'bg-[#71C5EE] text-white shadow-md' : 'text-slate-400'}`}>
                    ARS
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-black transition-all ${currency === 'USD' ? 'bg-[#16A34A] text-white shadow-md' : 'text-slate-400'}`}>
                    USD
                  </div>
                </button>
              </div>
            )}

            {router.pathname === '/' && (
              <div className="flex items-center justify-end p-2">
                <button
                  onClick={toggleCurrency}
                  className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200 shadow-sm"
                >
                  <div className={`px-5 py-1.5 rounded-full text-xs font-black transition-all ${currency === 'ARS' ? 'bg-[#71C5EE] text-white shadow-md' : 'text-slate-400'}`}>
                    ARS
                  </div>
                  <div className={`px-5 py-1.5 rounded-full text-xs font-black transition-all ${currency === 'USD' ? 'bg-[#16A34A] text-white shadow-md' : 'text-slate-400'}`}>
                    USD
                  </div>
                </button>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Catálogo</p>
              <div className="flex flex-col gap-3 ml-2">
                <Link href="/catalog" onClick={() => setOpen(false)} className="text-slate-800 font-medium hover:text-blue-600">Todos los productos</Link>
                {categories.map(c => (
                  <Link key={c.id} href={`/catalog/${c.slug}`} onClick={() => setOpen(false)} className="text-slate-600 hover:text-blue-600">{c.name}</Link>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Servicios</p>
              <div className="flex flex-col gap-3 ml-2">
                <Link href="/services" onClick={() => setOpen(false)} className="text-slate-800 font-medium hover:text-blue-600">Ver servicios</Link>
                <Link href="/services/reparacion-iphones" onClick={() => setOpen(false)} className="text-slate-600 hover:text-blue-600">Reparación de iPhones</Link>
              </div>
            </div>

            <Link href="/contacto" onClick={() => setOpen(false)} className="mt-2 p-4 rounded-2xl bg-blue-50 text-blue-700 font-medium inline-flex items-center justify-center gap-2">
              <Mail size={18} /> Escribinos
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
