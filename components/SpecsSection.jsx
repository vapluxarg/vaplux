export default function SpecsSection({ groups, specs, theme = {} }) {
  const hasGroups = groups && Object.keys(groups).length > 0
  const list = Array.isArray(specs) ? specs : []
  const headingClass = theme.headingClass || 'text-slate-900'
  const cardBase = 'p-3 border rounded-md'
  const cardClass = theme.cardClass ? `${cardBase} ${theme.cardClass}` : cardBase

  return (
    <section className="mt-12">
      <h2 className={`text-xl font-black mb-6 tracking-tight ${headingClass}`}>Características Principales</h2>
      
      <div className="grid grid-cols-1 border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        {hasGroups ? (
          Object.entries(groups).map(([name, items], idx) => (
            <div key={idx} className={`grid grid-cols-1 md:grid-cols-3 border-b border-slate-100 last:border-0`}>
              <div className="bg-slate-50/50 p-4 font-black text-slate-900 text-sm uppercase tracking-wider flex items-center">{name}</div>
              <div className="md:col-span-2 p-4 text-slate-600 text-sm bg-white">
                <ul className="space-y-1">
                  {items.map((it, i) => (<li key={i} className="flex items-start gap-2"><span>•</span> {it}</li>))}
                </ul>
              </div>
            </div>
          ))
        ) : (
          list.length > 0 ? (
            list.map((s, i) => {
              const [label, ...val] = s.includes(':') ? s.split(':') : [null, s]
              return (
                <div key={i} className={`grid grid-cols-1 md:grid-cols-3 border-b border-slate-100 last:border-0 ${i % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}`}>
                  {label ? (
                    <>
                      <div className="p-4 font-bold text-slate-800 text-sm bg-slate-50/50 flex items-center">{label}</div>
                      <div className="md:col-span-2 p-4 text-slate-600 text-sm">{val.join(':').trim()}</div>
                    </>
                  ) : (
                    <div className="md:col-span-3 p-4 text-slate-600 text-sm flex items-start gap-3">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{s}</span>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm bg-white">No hay especificaciones detalladas para este producto.</div>
          )
        )}
      </div>
    </section>
  )
}
