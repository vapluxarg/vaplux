import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState, createContext, useContext } from 'react'
import { supabase } from '@/utils/supabase'
import { LayoutDashboard, Package, Zap, Tag, LogOut, Megaphone, Loader2, Percent, FlaskConical, Scale } from 'lucide-react'

export const AdminContext = createContext()

export function useAdmin() {
  return useContext(AdminContext)
}

export default function AdminLayout({ children }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [store, setStore] = useState('vaplux')

  useEffect(() => {
    const saved = localStorage.getItem('adminStore')
    if (saved) setStore(saved)
  }, [])

  const changeStore = (newStore) => {
    setStore(newStore)
    localStorage.setItem('adminStore', newStore)
  }

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return

      if (session) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        if (router.pathname !== '/admin/login') {
          router.push('/admin/login')
        }
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        if (router.pathname !== '/admin/login') {
          router.push('/admin/login')
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router.pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (router.pathname === '/admin/login') {
    return <>{children}</>
  }

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen bg-slate-50 items-center justify-center font-sans">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <AdminContext.Provider value={{ globalStore: store, setGlobalStore: changeStore }}>
      <div className="flex h-screen bg-slate-100 font-sans text-slate-800 text-sm">
        {/* Sidebar */}
        <aside className="w-56 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-700 z-10">
          <div className="h-12 flex items-center shadow-md bg-slate-950 px-4 border-b border-slate-800">
            <span className="text-white font-bold text-sm tracking-wide">Vaplux<span className="text-blue-500 font-normal ml-1">ERP</span></span>
          </div>

          <div className="p-3 border-b border-slate-800 bg-slate-900/50">
            <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1 block">Contexto</label>
            <select
              value={store}
              onChange={(e) => changeStore(e.target.value)}
              className="w-full bg-slate-800 border-none text-white text-xs rounded-sm py-1.5 px-2 outline-none focus:ring-1 focus:ring-blue-500 shadow-inner"
            >
              <option value="vaplux">Vaplux</option>
              <option value="fantech">Fantech</option>
            </select>
          </div>

          <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
            <Link href="/admin" className={`flex items-center gap-2 px-3 py-2 rounded-sm transition-colors text-xs font-medium ${router.pathname === '/admin' ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-2 border-transparent'}`}>
              <LayoutDashboard size={14} className="shrink-0" /> Dashboard
            </Link>
            <Link href="/admin/products" className={`flex items-center gap-2 px-3 py-2 rounded-sm transition-colors text-xs font-medium ${router.pathname.startsWith('/admin/products') ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-2 border-transparent'}`}>
              <Package size={14} className="shrink-0" /> Productos
            </Link>
            <Link href="/admin/bulk" className={`flex items-center gap-2 px-3 py-2 rounded-sm transition-colors text-xs font-medium ${router.pathname === '/admin/bulk' ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-2 border-transparent'}`}>
              <Zap size={14} className="shrink-0" /> Edición Masiva
            </Link>
            <Link href="/admin/categories" className={`flex items-center gap-2 px-3 py-2 rounded-sm transition-colors text-xs font-medium ${router.pathname === '/admin/categories' ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-2 border-transparent'}`}>
              <Tag size={14} className="shrink-0" /> Categorías
            </Link>
            <Link href="/admin/promotions" className={`flex items-center gap-2 px-3 py-2 rounded-sm transition-colors text-xs font-medium ${router.pathname === '/admin/promotions' ? 'bg-orange-600/20 text-orange-400 border-l-2 border-orange-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-2 border-transparent'}`}>
              <Megaphone size={14} className="shrink-0" /> Promociones
            </Link>
            <Link href="/admin/discounts" className={`flex items-center gap-2 px-3 py-2 rounded-sm transition-colors text-xs font-medium ${router.pathname.startsWith('/admin/discounts') ? 'bg-green-600/20 text-green-400 border-l-2 border-green-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-2 border-transparent'}`}>
              <Percent size={14} className="shrink-0" /> Descuentos
            </Link>

            <div className="my-1 border-t border-slate-800" />
            <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold px-3 py-1">Análisis</p>

            <Link href="/admin/analytics" className={`flex items-center gap-2 px-3 py-2 rounded-sm transition-colors text-xs font-medium ${router.pathname === '/admin/analytics' ? 'bg-violet-600/20 text-violet-400 border-l-2 border-violet-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-2 border-transparent'}`}>
              <FlaskConical size={14} className="shrink-0" /> Sandbox
            </Link>
            <Link href="/admin/compare" className={`flex items-center gap-2 px-3 py-2 rounded-sm transition-colors text-xs font-medium ${router.pathname === '/admin/compare' ? 'bg-cyan-600/20 text-cyan-400 border-l-2 border-cyan-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white border-l-2 border-transparent'}`}>
              <Scale size={14} className="shrink-0" /> Comparar Tiendas
            </Link>
          </nav>

          <div className="p-2 border-t border-slate-800">
            <button onClick={handleLogout} className="flex w-full items-center gap-2 px-3 py-2 rounded-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors text-xs font-medium border-l-2 border-transparent">
              <LogOut size={14} className="shrink-0" /> Salir
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-200/50">
          <header className="h-12 bg-white border-b border-slate-300 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-semibold text-slate-800 capitalize tracking-tight flex items-center gap-2">
                {router.pathname === '/admin' ? 'Dashboard General' : router.pathname.split('/').pop()}
              </h2>
            </div>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-xs text-slate-500 font-medium tracking-wide">SYSTEM ADMIN</div>
              <div className="h-6 w-6 bg-slate-800 text-white rounded text-[10px] flex items-center justify-center font-bold">A</div>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-4 w-full h-full">
            {children}
          </div>
        </main>
      </div>
    </AdminContext.Provider>
  )
}
