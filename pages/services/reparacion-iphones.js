import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { Smartphone, Battery, Plug, Camera, Volume2, Droplets, ShieldCheck, Zap, CheckCircle, DollarSign } from 'lucide-react'
import { getWhatsAppUrl } from '@/utils/whatsapp'

export default function ReparacionIphones(){
  const iconMap = {
    phone: <Smartphone size={28} className="text-brand" />,
    battery: <Battery size={28} className="text-brand" />,
    plug: <Plug size={28} className="text-brand" />,
    camera: <Camera size={28} className="text-brand" />,
    volume: <Volume2 size={28} className="text-brand" />,
    droplet: <Droplets size={28} className="text-brand" />,
    shield: <ShieldCheck size={28} className="text-white" />,
    zap: <Zap size={28} className="text-white" />,
    check: <CheckCircle size={28} className="text-white" />,
    dollar: <DollarSign size={28} className="text-white" />,
  }

  const features = [
    { icon: 'phone', title: 'Pantalla Completa', price: 'Desde $25.000', items: ['Pantalla original o AAA+', 'Incluye instalación', 'Garantía 6 meses', 'Tiempo: 30 minutos'] },
    { icon: 'battery', title: 'Cambio de Batería', price: 'Desde $12.000', items: ['Batería original', 'Calibración incluida', 'Garantía 12 meses', 'Tiempo: 20 minutos'] },
    { icon: 'plug', title: 'Puerto de Carga', price: 'Desde $8.000', items: ['Limpieza profunda', 'Reemplazo si es necesario', 'Garantía 3 meses', 'Tiempo: 15 minutos'] },
    { icon: 'camera', title: 'Cámara', price: 'Desde $15.000', items: ['Cámara original', 'Calibración enfoque', 'Garantía 6 meses', 'Tiempo: 45 minutos'] },
    { icon: 'volume', title: 'Audio y Altavoces', price: 'Desde $10.000', items: ['Altavoz original', 'Micrófono incluido', 'Garantía 6 meses', 'Tiempo: 30 minutos'] },
    { icon: 'droplet', title: 'Daño por Líquidos', price: 'Desde $20.000', items: ['Diagnóstico gratuito', 'Limpieza ultrasónica', 'Garantía según daño', 'Tiempo: 24-48hs'] },
  ]

  const steps = [
    { n:1, t:'Diagnóstico', d:'Evaluación completa y gratuita de tu iPhone' },
    { n:2, t:'Presupuesto', d:'Cotización transparente y aprobación previa' },
    { n:3, t:'Reparación', d:'Técnicos certificados y repuestos originales' },
    { n:4, t:'Pruebas', d:'Verificación total antes de entregar' },
    { n:5, t:'Entrega', d:'Garantía extendida y soporte post-reparación' },
  ]

  const guarantees = [
    { icon:'shield', t:'Garantía Extendida', d:'Hasta 12 meses según servicio' },
    { icon:'zap', t:'Reparación Express', d:'La mayoría en el día' },
    { icon:'check', t:'Repuestos Originales', d:'Originales o AAA+ de alta calidad' },
    { icon:'dollar', t:'Mejor Precio', d:'Relación precio/calidad optimizada' },
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
            <span className="text-slate-900">Reparación iPhone</span>
          </nav>

          <span className="text-blue-600 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Staff Certificado</span>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6 leading-none">Reparación <br/> de iPhones</h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mb-10 leading-relaxed">Ofrecemos el servicio técnico más avanzado del país. Técnicos especializados, repuestos originales y garantía escrita inmediata.</p>
          
          <div className="flex gap-4 flex-wrap">
            <a className="btn-cta bg-blue-600 text-white font-black px-8 py-5 rounded-2xl shadow-xl shadow-blue-900/10 hover:bg-blue-700 transition-all hover:-translate-y-1" href={getWhatsAppUrl('Hola, necesito reparar mi iPhone')} target="_blank" rel="noreferrer">Cotizar ahora</a>
            <a className="btn-cta bg-white text-slate-900 font-bold px-8 py-5 rounded-2xl border border-slate-200 hover:bg-slate-50 shadow-sm transition-all" href="#servicios">Ver servicios</a>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 md:px-12">
        <section id="servicios" className="py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((s, i) => (
              <div key={i} className="group h-full bg-white rounded-[2.5rem] p-8 shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30 group-hover:bg-blue-100 group-hover:opacity-50 transition-all" style={{background:'radial-gradient(circle, #3b82f6, transparent 70%)'}} />
                
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  {iconMap[s.icon]}
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">{s.title}</h3>
                
                <ul className="flex-1 space-y-3 mb-8">
                  {s.items.map((li, j) => (
                    <li key={j} className="flex items-center gap-3 text-slate-500 font-medium text-sm">
                       <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                       {li}
                    </li>
                  ))}
                </ul>

                <a 
                  className="w-full bg-slate-50 hover:bg-blue-600 text-slate-900 hover:text-white font-black py-4 rounded-2xl text-center transition-all shadow-sm border border-slate-100 flex items-center justify-center gap-3 group/wa" 
                  href={getWhatsAppUrl(`Quiero cotizar ${s.title}`)}
                  target="_blank" 
                  rel="noreferrer"
                >
                  <svg className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.032c0 2.12.554 4.189 1.605 6.01L0 24l6.104-1.602a11.834 11.834 0 005.681 1.448h.005c6.635 0 12.032-5.397 12.032-12.034a11.783 11.783 0 00-3.414-8.139z"/></svg>
                  Consultar Costo
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 mb-20 bg-slate-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-white">
           <div className="aurora-layer opacity-20" />
           <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-blue-400 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Compromiso Real</span>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">Tu tranquilidad es nuestra prioridad</h2>
                <p className="text-white/60 font-medium text-lg leading-relaxed mb-10">Más de 10 años de experiencia técnica respaldada por garantía escrita en cada componente que reemplazamos.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {guarantees.map((g, i) => (
                    <div key={i} className="flex flex-col gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">{iconMap[g.icon]}</div>
                      <div>
                         <h4 className="font-black tracking-tight text-xl mb-1">{g.t}</h4>
                         <p className="text-white/50 text-sm font-medium">{g.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                 <h3 className="text-2xl font-black mb-6">Nuestro Proceso</h3>
                 <div className="space-y-6">
                    {steps.map((s, i) => (
                      <div key={i} className="flex gap-6 items-start p-6 bg-white/5 rounded-[1.5rem] border border-white/10 hover:bg-white/10 transition-colors">
                         <div className="text-4xl font-black text-white/10">{i+1}</div>
                         <div>
                            <h5 className="font-black text-lg mb-1">{s.t}</h5>
                            <p className="text-white/40 text-sm leading-relaxed">{s.d}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </section>
      </main>
    </div>
  )
}
