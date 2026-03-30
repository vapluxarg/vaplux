import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { UserCheck, Wrench, Package, CheckCircle } from 'lucide-react'
import { getWhatsAppUrl } from '@/utils/whatsapp'

export default function TrabajaConNosotros(){
  const iconMap = {
    sales: <UserCheck size={28} className="text-brand" />,
    tech: <Wrench size={28} className="text-brand" />,
    package: <Package size={28} className="text-brand" />,
  }

  const opportunities = [
    { icon:'sales', t:'Ventas y Atención', d:'Perfil orientado a clientes, manejo de WhatsApp y seguimiento comercial.' },
    { icon:'tech', t:'Técnico de iPhone', d:'Experiencia en hardware y microsoldadura (deseable). Atención a detalle y calidad.' },
    { icon:'package', t:'Logística', d:'Gestión de entregas, control de stock y coordinación con proveedores.' },
  ]

  const benefits = [
    'Capacitación continua y certificaciones internas',
    'Bonos por desempeño y objetivos',
    'Ambiente colaborativo y crecimiento real',
    'Acceso anticipado a nuevos productos',
  ]

  return (
    <div className="home-celeste min-h-screen selection:bg-blue-100">
      <Navbar />
      <header className="relative overflow-hidden pt-12 pb-16">
        <div className="aurora-layer opacity-30" />
        <div className="relative max-w-[1400px] mx-auto px-6 md:px-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 mb-8 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
            <span className="text-slate-300">/</span>
            <Link href="/services" className="hover:text-blue-600 transition-colors">Servicios</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Trabajá con Nosotros</span>
          </nav>

          <span className="text-blue-600 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Crecimiento Vaplux</span>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6 leading-none">Sumate al <br/> Equipo</h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mb-10 leading-relaxed">Buscamos talento para expandir nuestra red. Ofrecemos capacitación continua, un ambiente dinámico y oportunidades reales de carrera.</p>
          
          <div className="flex gap-4 flex-wrap">
            <a className="btn-cta bg-blue-600 text-white font-black px-8 py-5 rounded-2xl shadow-xl shadow-blue-900/10 hover:bg-blue-700 transition-all hover:-translate-y-1" href={getWhatsAppUrl('Hola! Quiero postularme a Vaplux')} target="_blank" rel="noreferrer">Postularme</a>
            <a className="btn-cta bg-white text-slate-900 font-bold px-8 py-5 rounded-2xl border border-slate-200 hover:bg-slate-50 shadow-sm transition-all" href="#oportunidades">Ver vacantes</a>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 md:px-12">
        <section id="oportunidades" className="py-20">
          <div className="mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Oportunidades Abiertas</h2>
            <p className="text-slate-500 font-medium mt-2">Explorá los perfiles que estamos buscando actualmente.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {opportunities.map((o, i) => (
              <div key={i} className="group bg-white rounded-[2.5rem] p-10 shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100/50 transition-colors" />
                
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  {iconMap[o.icon]}
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{o.t}</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-1">{o.d}</p>
                
                <a 
                  className="w-full bg-slate-50 hover:bg-blue-600 text-slate-900 hover:text-white font-black py-4 rounded-2xl text-center transition-all shadow-sm border border-slate-100" 
                  href={getWhatsAppUrl(`Hola! Quiero postularme: ${o.t}`)}
                  target="_blank" 
                  rel="noreferrer"
                >
                  Postularme
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 bg-slate-100 rounded-[3rem] p-12 md:p-20 relative overflow-hidden mb-20">
           <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-blue-600 text-xs font-black uppercase tracking-[0.3em] mb-4 block">¿Por qué Vaplux?</span>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-6">Beneficios de sumarte a nuestro equipo</h2>
                <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">Trabajar en Vaplux significa formar parte de una empresa en constante innovación y con un enfoque absoluto en la calidad.</p>
                
                <ul className="space-y-4">
                  {benefits.map((b, i) => (
                    <li key={i} className="flex items-center gap-4 p-5 bg-white rounded-[1.5rem] border border-slate-200 shadow-sm font-black text-slate-900">
                       <CheckCircle size={20} className="text-blue-600 shrink-0" />
                       {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl relative overflow-hidden">
                 <div className="aurora-layer opacity-10" />
                 <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Envíanos tu Perfil</h3>
                 <p className="text-slate-500 font-medium mb-10">Si no encontrás una vacante que se ajuste a vos pero creés que podés aportar valor, no dudes en escribirnos.</p>
                 <a 
                   className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-900/10 hover:bg-blue-700 transition-all active:scale-95 group/wa"
                   href={getWhatsAppUrl('Hola! Quiero sumarme al equipo Vaplux')} 
                   target="_blank" 
                   rel="noreferrer"
                 >
                   <svg className="w-7 h-7 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.032c0 2.12.554 4.189 1.605 6.01L0 24l6.104-1.602a11.834 11.834 0 005.681 1.448h.005c6.635 0 12.032-5.397 12.032-12.034a11.783 11.783 0 00-3.414-8.139z"/></svg>
                   Hablar por WhatsApp
                 </a>
              </div>
           </div>
        </section>
      </main>
    </div>
  )
}
