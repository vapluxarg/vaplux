import Image from 'next/image'
import { motion } from 'framer-motion'

const points = [
  { id: 'screen', label: 'Pantalla', x: '70%', y: '18%' },
  { id: 'battery', label: 'Batería', x: '50%', y: '60%' },
  { id: 'port', label: 'Puerto de Carga', x: '52%', y: '85%' },
]

export default function ServicePrecision(){
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-[#0f172a]">
      {/* Aurora glow behind section */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-6">
            Servicio Técnico de <span className="text-blue-500">Precisión.</span>
          </h3>
          <p className="text-xl text-slate-400 font-medium max-w-md leading-relaxed mb-10">
            Diagnóstico experto con tecnología de punta y repuestos originales. Cada reparación es una obra de ingeniería con garantía asegurada.
          </p>
          
          <div className="space-y-6">
            {['Pantallas Retina', 'Baterías de Alta Capacidad', 'Microsoldadura Especializada'].map((text, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="h-2 w-12 bg-blue-500/20 group-hover:bg-blue-500 transition-all duration-500" />
                <span className="text-slate-200 font-bold uppercase tracking-widest text-xs">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-colors duration-1000" />
          <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
            <div className="relative w-full p-4">
              <Image
                src="https://i.pinimg.com/1200x/29/62/22/296222848ac42cf0e8d909ef64e38e7e.jpg"
                alt="Blueprint iPhone"
                width={1200}
                height={1600}
                className="object-contain mix-blend-screen opacity-80"
                style={{ width: '100%', height: 'auto' }}
                unoptimized
              />
            </div>
            {/* puntos interactivos */}
            {points.map(p => (
              <div key={p.id} className="absolute" style={{ left: p.x, top: p.y }}>
                <div className="group/dot relative">
                  <div className="h-4 w-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-help animate-pulse" />
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/dot:opacity-100 transition-all whitespace-nowrap bg-white text-[#0f172a] text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-xl">
                    {p.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
