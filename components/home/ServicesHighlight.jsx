import Link from 'next/link'
import { MessageCircle, Wrench, ShieldCheck } from 'lucide-react'

export default function ServicesHighlight(){
  return (
    <section className="relative overflow-hidden bg-tech-white bg-grid noise-overlay">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold">Servicios Técnicos</h2>
        <p className="text-slateInk/80 mt-1">Soporte real con garantía, repuestos originales y asesoramiento experto.</p>
        <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-6 mt-6 items-stretch">
          <div className="card-structure rounded-xl p-6 h-full flex flex-col">
            <div className="flex"><MessageCircle size={28} className="text-brand" /></div>
            <h3 className="font-semibold mt-2">Asesoramiento Personalizado</h3>
            <p className="text-sm text-slateInk/80 mt-1">Elegí el dispositivo perfecto según tus necesidades.</p>
            <Link className="btn-cta btn-cta-secondary mt-auto inline-flex" href="/contacto">Consultar</Link>
          </div>
          <div className="card-structure rounded-xl p-6 h-full flex flex-col">
            <div className="flex"><Wrench size={28} className="text-brand" /></div>
            <h3 className="font-semibold mt-2">Reparación de iPhones</h3>
            <p className="text-sm text-slateInk/80 mt-1">Diagnóstico gratuito, repuestos originales y garantía.</p>
            <Link className="btn-cta btn-cta-secondary mt-auto inline-flex" href="/services/reparacion-iphones">Ver Más</Link>
          </div>
          <div className="card-structure rounded-xl p-6 h-full flex flex-col">
            <div className="flex"><ShieldCheck size={28} className="text-brand" /></div>
            <h3 className="font-semibold mt-2">Garantía y Post‑venta</h3>
            <p className="text-sm text-slateInk/80 mt-1">Protección completa y soporte por WhatsApp.</p>
            <Link className="btn-cta btn-cta-secondary mt-auto inline-flex" href="/services">Información</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
