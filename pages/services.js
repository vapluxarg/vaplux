import Navbar from '@/components/Navbar'
import Services from '@/components/Services'

export default function ServicesPage(){
  return (
    <div className="home-celeste min-h-screen">
      <Navbar />
      <header className="relative overflow-hidden pt-16 pb-12">
        <div className="aurora-layer opacity-40" />
        <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 text-center">
          <span className="text-blue-600 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Soporte Certificado</span>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6">Nuestros Servicios</h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Técnicos especializados, repuestos originales y una red de oportunidades para tu crecimiento.</p>
        </div>
      </header>
      <Services />
    </div>
  )
}
