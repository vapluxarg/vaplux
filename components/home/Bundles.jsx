import { getWhatsAppUrl } from '@/utils/whatsapp'

export default function Bundles(){
  const wa = (msg) => getWhatsAppUrl(msg)
  return (
    <section className="relative overflow-hidden bg-tech-sky bg-grid noise-overlay">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold">Bundles y Accesorios</h2>
        <p className="text-slateInk/80 mt-1">Ahorros inteligentes con combos recomendados.</p>
        <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="card-structure rounded-xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">iPhone: MagSafe + AirPods Pro 2</h3>
              <span className="inline-flex rounded px-2 py-1 bg-success/15 text-success text-sm">Ahorro</span>
            </div>
            <ul className="mt-3 text-slateInk/80 space-y-1">
              <li>• Cargador MagSafe</li>
              <li>• AirPods Pro (2ª Gen)</li>
              <li>• Cable USB‑C</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a className="btn-cta btn-cta-primary" href={wa('Quiero el bundle iPhone: MagSafe + AirPods Pro 2')}>Agregar bundle</a>
              <a className="btn-cta btn-cta-secondary" href="/catalog/iphone">Más en iPhone</a>
            </div>
          </div>
          <div className="card-structure rounded-xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Mac: USB‑C Digital AV + AirPods</h3>
              <span className="inline-flex rounded px-2 py-1 bg-success/15 text-success text-sm">Ahorro</span>
            </div>
            <ul className="mt-3 text-slateInk/80 space-y-1">
              <li>• Adaptador USB‑C Digital AV</li>
              <li>• AirPods</li>
              <li>• Cable USB‑C</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a className="btn-cta btn-cta-primary" href={wa('Quiero el bundle Mac: USB‑C Digital AV + AirPods')}>Agregar bundle</a>
              <a className="btn-cta btn-cta-secondary" href="/catalog/electronica">Más en Tecnología</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
