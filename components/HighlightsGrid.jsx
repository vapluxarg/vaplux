import { Star } from 'lucide-react'

export default function HighlightsGrid({ items = [] }) {
  if (!Array.isArray(items) || items.length === 0) return null
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold mb-3">Destacados</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((it, i) => (
          <div key={i} className="card p-4">
            <div className="text-2xl mb-2">{it.icon || <Star size={24} className="text-brand" />}</div>
            <p className="font-medium">{it.title}</p>
            <p className="text-sm text-slate-600">{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
