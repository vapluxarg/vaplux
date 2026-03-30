import Link from 'next/link'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { Instagram } from 'lucide-react'

export default function Contacto(){
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [motivo, setMotivo] = useState('Consulta de producto')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  const validar = () => {
    if (!nombre.trim()) return 'Ingresá tu nombre.'
    if (!email.trim()) return 'Ingresá tu email.'
    const re = /[^\s@]+@[^\s@]+\.[^\s@]+/
    if (!re.test(email)) return 'Ingresá un email válido.'
    if (!mensaje.trim()) return 'Contanos en qué podemos ayudarte.'
    return ''
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const err = validar()
    if (err) { setError(err); return }
    setError('')
    const subject = encodeURIComponent(`Vaplux - ${motivo}`)
    const body = encodeURIComponent(`Nombre: ${nombre}\nEmail: ${email}\nMotivo: ${motivo}\n\nMensaje:\n${mensaje}`)
    window.location.href = `mailto:vaplux.arg@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <div className="home-celeste min-h-screen selection:bg-blue-100">
      <Navbar />
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 mb-12 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900">Contacto</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Text Content */}
          <div className="lg:col-span-5 space-y-12">
            <header>
              <span className="text-blue-600 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Hablemos</span>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none mb-6">Estamos <br/> para Vos</h1>
              <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-md">Tecnología premium respaldada por soporte real. Elegí el canal que prefieras o completá el formulario y nos pondremos en contacto.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <a 
                href="https://wa.me/?text=Hola%20Vaplux%2C%20necesito%20asesoramiento"
                target="_blank" rel="noopener noreferrer"
                className="group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 group-hover:text-white transition-all shadow-sm">
                  <svg className="w-9 h-9 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.032c0 2.12.554 4.189 1.605 6.01L0 24l6.104-1.602a11.834 11.834 0 005.681 1.448h.005c6.635 0 12.032-5.397 12.032-12.034a11.783 11.783 0 00-3.414-8.139z"/></svg>
                </div>
                <h3 className="font-black text-slate-900 mb-2 text-xl">WhatsApp</h3>
                <p className="text-slate-500 text-sm font-medium">Asesoramiento ágil y personalizado.</p>
              </a>

              <a 
                href="https://instagram.com/vaplux.arg"
                target="_blank" rel="noreferrer"
                className="group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-pink-600 group-hover:text-white transition-all shadow-sm">
                  <Instagram size={36} />
                </div>
                <h3 className="font-black text-slate-900 mb-2 text-xl">Instagram</h3>
                <p className="text-slate-500 text-sm font-medium">Novedades y Lanzamientos.</p>
              </a>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                <div className="aurora-layer opacity-20" />
                <h3 className="font-black text-2xl mb-6 relative z-10">Horarios & Atención</h3>
                <ul className="space-y-4 relative z-10 text-white/70 font-medium">
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Lunes a Sábado: 10:00 – 19:00</li>
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Respuesta estimada: 1–6 horas</li>
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Envíos a todo el país</li>
                </ul>
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-7 bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-[0_20px_80px_rgba(0,0,0,0.04)] relative">
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Envíanos un Mensaje</h2>
            <p className="text-slate-500 font-medium mb-12">Completá el formulario y un asesor te responderá a la brevedad.</p>
            
            <form className="space-y-8" onSubmit={onSubmit} noValidate>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1" htmlFor="nombre">Nombre Completo</label>
                  <input id="nombre" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900 placeholder:text-slate-300" placeholder="Juan Pérez" value={nombre} onChange={e=>setNombre(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1" htmlFor="email">Email de Contacto</label>
                  <input id="email" type="email" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900 placeholder:text-slate-300" placeholder="juan@email.com" value={email} onChange={e=>setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2 text-start">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1" htmlFor="motivo">Motivo de Consulta</label>
                <select id="motivo" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900 appearance-none cursor-pointer" value={motivo} onChange={e=>setMotivo(e.target.value)}>
                  <option>Consulta de producto</option>
                  <option>Soporte postventa</option>
                  <option>Cotización/Mayorista</option>
                  <option>Otro</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1" htmlFor="mensaje">Tu Mensaje</label>
                <textarea id="mensaje" rows={5} className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-900 placeholder:text-slate-300 resize-none" placeholder="¿En qué podemos ayudarte?" value={mensaje} onChange={e=>setMensaje(e.target.value)} required />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                  {error}
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-6">
                <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-black px-12 py-5 rounded-2xl shadow-xl shadow-blue-900/10 hover:bg-blue-700 transition-all active:scale-95">
                  Enviar Mensaje
                </button>
                <p className="text-xs text-slate-400 font-medium max-w-[200px] text-center sm:text-left">
                  Te responderemos al email proporcionado.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}