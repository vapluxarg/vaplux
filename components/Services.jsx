import Link from 'next/link'
import { Wrench, Briefcase, ShieldCheck } from 'lucide-react'

const icons = {
  wrench: <Wrench size={30} className="text-brand" />,
  briefcase: <Briefcase size={30} className="text-brand" />,
  shield: <ShieldCheck size={30} className="text-brand" />,
}

export default function Services(){
  const items = [
    {
      icon: 'wrench',
      title: 'Reparación de iPhones',
      desc: 'Diagnóstico profesional, repuestos de calidad y garantía escrita. Cambios de pantalla, batería, cámaras y más.',
      cta: { label: 'Ver detalles', href: '/services/reparacion-iphones' }
    },
    {
      icon: 'briefcase',
      title: 'Trabajá con Nosotros',
      desc: 'Sumate a nuestra red de partners y distribuidores. Capacitación, soporte y beneficios exclusivos.',
      cta: { label: 'Ver oportunidades', href: '/services/trabaja-con-nosotros' }
    },
    {
      icon: 'shield',
      title: 'Garantía & Soporte',
      desc: 'Políticas claras de garantía y asistencia postventa para que compres con tranquilidad. Atención de Lunes a Sábado.',
      cta: { label: 'Información', href: '/contacto' }
    },
  ]

  return (
    <section className="relative py-20 bg-transparent overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-blue-600 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Experiencia Vaplux</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">Soluciones Técnicas y Soporte Especializado</h2>
          </div>
          <p className="text-slate-500 font-medium max-w-sm">Respaldamos cada uno de nuestros productos con un equipo técnico de primer nivel y soporte continuo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((s, i) => (
            <div key={i} className="group relative">
              <div className="h-full bg-white rounded-[2.5rem] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col items-start transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100/50 transition-colors" />
                
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  {icons[s.icon]}
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{s.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-1">{s.desc}</p>
                
                <Link
                  href={s.cta.href}
                  className="inline-flex items-center gap-2 text-blue-600 font-black text-sm uppercase tracking-widest group-hover:gap-4 transition-all"
                >
                  {s.cta.label}
                  <span className="text-xl">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
