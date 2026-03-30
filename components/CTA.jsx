import Link from 'next/link'
import { getWhatsAppUrl } from '@/utils/whatsapp'

export default function CTA(){
  return (
    <section className="relative max-w-5xl mx-auto px-4 py-14">
      <div className="aurora-layer" />
      <div className="rounded-2xl p-8 md:p-10 card-structure relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, var(--color-accent), transparent 60%)' }} />
        <h2 className="text-2xl md:text-3xl font-semibold text-aurora">¿Listo para subir de nivel?</h2>
        <p className="text-slateInk/80 mt-2 max-w-2xl">Tecnología seleccionada y soporte cercano. Tu próximo upgrade empieza acá.</p>
        <div className="mt-6 flex gap-3">
          <Link href="/catalog/" className="btn-cta btn-cta-primary">Explorar ahora</Link>
          <a href={getWhatsAppUrl()} target="_blank" rel="noreferrer" className="btn-cta btn-cta-secondary">Hablar por WhatsApp</a>
        </div>
      </div>
    </section>
  )
}
