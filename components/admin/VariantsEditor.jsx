import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, GitMerge, ChevronDown, ChevronUp } from 'lucide-react'

/**
 * Generates all combinations from attribute groups.
 * e.g. { Color: ['Rojo','Negro'], Memoria: ['128GB','256GB'] }
 * → [['Rojo','128GB'], ['Negro','128GB'], ['Rojo','256GB'], ...]
 */
function cartesianProduct(groups) {
  const keys = Object.keys(groups)
  if (keys.length === 0) return []
  const values = keys.map(k => groups[k].filter(v => v.trim() !== ''))
  if (values.some(v => v.length === 0)) return []

  const result = values.reduce((acc, curr) => {
    const combined = []
    acc.forEach(a => curr.forEach(b => combined.push([...a, b])))
    return combined
  }, [[]])

  return result.map(combo =>
    combo.reduce((obj, val, i) => ({ ...obj, [keys[i]]: val }), {})
  )
}

function buildLabel(attrs) {
  return Object.values(attrs).join(' / ')
}

/**
 * VariantsEditor
 * Props:
 *   - variants: array of { id?, label, attributes, price_usd, price_ars, preferred_currency, stock }
 *   - onChange: (variants) => void
 *   - isImported: bool (if true, stock fields are hidden)
 */
export default function VariantsEditor({ variants = [], onChange, isImported = false }) {
  // attribute groups: { [domainName]: string[] }
  const [attrGroups, setAttrGroups] = useState(() => {
    // Reconstruct from existing variants
    if (variants.length === 0) return {}
    const keys = variants.flatMap(v => Object.keys(v.attributes || {}))
    const unique = [...new Set(keys)]
    const groups = {}
    unique.forEach(k => {
      groups[k] = [...new Set(variants.map(v => v.attributes?.[k]).filter(Boolean))]
    })
    return groups
  })

  const [newAttrName, setNewAttrName] = useState('')
  const [collapsed, setCollapsed] = useState(false)

  // Add a new attribute domain (e.g. "Color")
  const addDomain = () => {
    const name = newAttrName.trim()
    if (!name || attrGroups[name]) return
    setAttrGroups(prev => ({ ...prev, [name]: [''] }))
    setNewAttrName('')
  }

  const removeDomain = (key) => {
    setAttrGroups(prev => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const updateValue = (domain, idx, val) => {
    setAttrGroups(prev => {
      const arr = [...prev[domain]]
      arr[idx] = val
      return { ...prev, [domain]: arr }
    })
  }

  const addValue = (domain) => {
    setAttrGroups(prev => ({ ...prev, [domain]: [...prev[domain], ''] }))
  }

  const removeValue = (domain, idx) => {
    setAttrGroups(prev => {
      const arr = prev[domain].filter((_, i) => i !== idx)
      return { ...prev, [domain]: arr.length > 0 ? arr : [''] }
    })
  }

  // Regenerate combinations whenever attrGroups change
  const regenerate = useCallback(() => {
    const combos = cartesianProduct(attrGroups)
    if (combos.length === 0) {
      onChange([])
      return
    }
    // Merge with existing variants to preserve prices
    const updated = combos.map(attrs => {
      const label = buildLabel(attrs)
      const existing = variants.find(v => v.label === label)
      return existing
        ? { ...existing, attributes: attrs, label }
        : {
            id: null,
            label,
            attributes: attrs,
            price_usd: '',
            price_ars: '',
            preferred_currency: 'usd',
            stock: isImported ? null : 0,
          }
    })
    onChange(updated)
  }, [attrGroups, isImported])

  const updateVariant = (idx, field, value) => {
    const next = variants.map((v, i) => i === idx ? { ...v, [field]: value } : v)
    onChange(next)
  }

  const hasGroups = Object.keys(attrGroups).length > 0

  return (
    <div className="space-y-4">
      {/* Attribute Domains Builder */}
      <div className="space-y-3">
        {Object.entries(attrGroups).map(([domain, values]) => (
          <div key={domain} className="bg-slate-50 border border-slate-200 rounded-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wide">{domain}</span>
              <button type="button" onClick={() => removeDomain(domain)} className="text-red-400 hover:text-red-600 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {values.map((val, i) => (
                <div key={i} className="flex items-center gap-1 bg-white border border-slate-300 rounded-sm px-2 py-1">
                  <input
                    type="text"
                    value={val}
                    onChange={e => updateValue(domain, i, e.target.value)}
                    placeholder={`Opción ${i + 1}`}
                    className="text-xs outline-none w-24 text-slate-700"
                  />
                  {values.length > 1 && (
                    <button type="button" onClick={() => removeValue(domain, i)} className="text-slate-300 hover:text-red-500 ml-1 transition-colors">×</button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addValue(domain)}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 px-2 py-1 border border-dashed border-blue-300 rounded-sm hover:bg-blue-50 transition-colors"
              >
                + Valor
              </button>
            </div>
          </div>
        ))}

        {/* Add new domain */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newAttrName}
            onChange={e => setNewAttrName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDomain())}
            placeholder="Ej: Color, Memoria, Procesador..."
            className="flex-1 bg-white border border-slate-300 rounded-sm px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
          />
          <button
            type="button"
            onClick={addDomain}
            className="bg-slate-700 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1"
          >
            <Plus size={13} /> Atributo
          </button>
        </div>
      </div>

      {/* Generate button */}
      {hasGroups && (
        <button
          type="button"
          onClick={regenerate}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <GitMerge size={14} />
          Generar {cartesianProduct(attrGroups).length} combinación(es)
        </button>
      )}

      {/* Variants table */}
      {variants.length > 0 && (
        <div className="border border-slate-200 rounded-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setCollapsed(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <span>{variants.length} combinaciones generadas</span>
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          {!collapsed && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[500px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
                    <th className="px-3 py-2 text-left font-bold">Variante</th>
                    <th className="px-3 py-2 text-center font-bold">Moneda</th>
                    <th className="px-3 py-2 text-right font-bold">Precio USD</th>
                    <th className="px-3 py-2 text-right font-bold">Precio ARS</th>
                    {!isImported && <th className="px-3 py-2 text-center font-bold">Stock</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {variants.map((v, i) => (
                    <tr key={v.label} className="hover:bg-slate-50">
                      <td className="px-3 py-1.5 font-semibold text-slate-800">{v.label}</td>
                      <td className="px-3 py-1.5 text-center">
                        <div className="flex bg-slate-100 p-0.5 rounded-sm border border-slate-200 w-fit mx-auto">
                          <button
                            type="button"
                            onClick={() => updateVariant(i, 'preferred_currency', 'usd')}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-sm transition-colors ${v.preferred_currency === 'usd' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}
                          >USD</button>
                          <button
                            type="button"
                            onClick={() => updateVariant(i, 'preferred_currency', 'ars')}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-sm transition-colors ${v.preferred_currency === 'ars' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
                          >ARS</button>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">$</span>
                          <input
                            type="number"
                            value={v.price_usd ?? ''}
                            onChange={e => updateVariant(i, 'price_usd', e.target.value)}
                            className={`w-24 border rounded-sm pl-5 pr-2 py-1 text-right outline-none focus:ring-1 font-mono text-[11px] ${v.preferred_currency === 'usd' ? 'border-emerald-400 bg-emerald-50/50 focus:ring-emerald-400' : 'border-slate-200 bg-white'}`}
                            placeholder="0"
                            disabled={v.preferred_currency === 'ars'}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">$</span>
                          <input
                            type="number"
                            value={v.price_ars ?? ''}
                            onChange={e => updateVariant(i, 'price_ars', e.target.value)}
                            className={`w-24 border rounded-sm pl-5 pr-2 py-1 text-right outline-none focus:ring-1 font-mono text-[11px] ${v.preferred_currency === 'ars' ? 'border-blue-400 bg-blue-50/50 focus:ring-blue-400' : 'border-slate-200 bg-white'}`}
                            placeholder="0"
                            disabled={v.preferred_currency === 'usd'}
                          />
                        </div>
                      </td>
                      {!isImported && (
                        <td className="px-3 py-1.5 text-center">
                          <input
                            type="number"
                            value={v.stock ?? ''}
                            onChange={e => updateVariant(i, 'stock', e.target.value === '' ? null : Number(e.target.value))}
                            className="w-16 border border-slate-200 rounded-sm px-2 py-1 text-center outline-none focus:ring-1 focus:ring-blue-500 font-mono text-[11px]"
                            placeholder="0"
                          />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
