import Link from 'next/link'
import { useRouter } from 'next/router'
import { Wrench, Briefcase } from 'lucide-react'

export default function Footer() {
  const router = useRouter()
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 text-slate-400">

        {/* Brand Column */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3 mb-6">
            <img src={`${router.basePath || ''}/assets/logo.PNG`} alt="Vaplux" className="h-10 w-10 rounded-xl shadow-lg shadow-black/20" />
            <h3 className="font-black text-2xl text-white tracking-tighter">Vaplux</h3>
          </div>
          <p className="text-sm font-medium leading-relaxed max-w-xs">Tecnología premium y soporte real. Soluciones que se adaptan a tu ritmo y exigencia.</p>
        </div>

        {/* Links Columns */}
        <div className="lg:col-span-2 lg:col-start-6">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Explorar</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link className="hover:text-white transition-colors" href="/catalog/iphone/">iPhones</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/catalog/electronica/">Tecnología</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/catalog/varios/">Accesorios</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Servicios</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link className="inline-flex items-center gap-2 hover:text-white transition-colors group" href="/services/reparacion-iphones"><Wrench size={14} className="text-slate-600 group-hover:text-blue-500 transition-colors" /> Reparación de iPhones</Link></li>
            <li><Link className="inline-flex items-center gap-2 hover:text-white transition-colors group" href="/services/trabaja-con-nosotros"><Briefcase size={14} className="text-slate-600 group-hover:text-blue-500 transition-colors" /> Trabajá con Nosotros</Link></li>
            <li><Link className="hover:text-blue-400 transition-colors" href="/services">Ver todos los servicios</Link></li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">Soporte</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link className="hover:text-white transition-colors" href="/contacto">Contacto Automático</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/cart/">Carrito</Link></li>
            <li className="pt-2"><span className="text-slate-600 text-xs font-bold uppercase tracking-wider block">Atención</span><span className="text-slate-300">Lun a Sáb 10–19h</span></li>
          </ul>
        </div>

      </div>

      <div className="border-t border-slate-800/60">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-6 text-xs text-slate-500 font-medium flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} Vaplux. Todos los derechos reservados.</span>
          <div className="flex items-center gap-6">
            <Link className="hover:text-white transition-colors" href="/">Inicio</Link>
            <Link className="hover:text-white transition-colors" href="/catalog/">Catálogo</Link>
            <Link className="hover:text-white transition-colors" href="/contacto">Contacto</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
