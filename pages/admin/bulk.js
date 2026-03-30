import { useState, useEffect } from 'react'
import AdminLayout, { useAdmin } from '@/components/admin/AdminLayout'
import { supabase } from '@/utils/supabase'
import { DollarSign, MapPin, Package, Flame } from 'lucide-react'

export default function AdminBulk() {
  const { globalStore } = useAdmin()
  const [mode, setMode] = useState('price_usd') // price_usd, price_ars, stock
  const [inputText, setInputText] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const processBulk = async () => {
    if (!inputText.trim()) return
    setLoading(true)
    setResults(null)

    const lines = inputText.split('\n').map(l => l.trim()).filter(Boolean)
    const logs = []
    let successCount = 0
    let errorCount = 0

    for (const line of lines) {
      // Split by tab, comma, or multiple spaces to support Excel paste
      const parts = line.split(/[\t,]|  +/).map(p => p.trim()).filter(Boolean)
      
      let identifier = ''
      let valueStr = ''
      
      if (parts.length >= 2) {
         identifier = parts[0]
         valueStr = parts[parts.length - 1]
      } else {
         const spaceSplit = line.split(' ')
         if (spaceSplit.length >= 2) {
             valueStr = spaceSplit.pop()
             identifier = spaceSplit.join(' ')
         } else {
             logs.push({ line, status: 'error', message: 'Formato inválido. Usá: nombredelproducto 1200' })
             errorCount++
             continue
         }
      }

      const value = Number(valueStr)
      if (isNaN(value)) {
         logs.push({ line, status: 'error', message: `El valor "${valueStr}" no es identificable como número.` })
         errorCount++
         continue
      }

      // Try to find product by exact slug OR exact title (case insensitive) within the global store
      const { data: products, error: searchError } = await supabase
        .from('products')
        .select('id, title, slug')
        .eq('store', globalStore)
        .or(`slug.ilike.${identifier},title.ilike.${identifier}`)
        .limit(1)

      if (searchError || !products || products.length === 0) {
         logs.push({ line, status: 'error', message: `No se encontró en la TBD el producto "${identifier}"` })
         errorCount++
         continue
      }

      const product = products[0]
      const updateData = {}
      if (mode === 'promo_price') {
         updateData.promo_price = value
         updateData.has_promo = true
      } else {
         updateData[mode] = value
      }

      const { error: updateError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', product.id)

      if (updateError) {
         logs.push({ line, status: 'error', message: 'Aviso de falla DB: ' + updateError.message })
         errorCount++
      } else {
         logs.push({ line, status: 'success', message: `✓ Actualizado ${product.title} a ${value}` })
         successCount++
      }
    }

    setResults({ logs, successCount, errorCount, total: lines.length })
    setLoading(false)
  }

  return (
    <div className="max-w-4xl space-y-4 pb-12">
      <div className="flex justify-between items-center bg-white p-3 rounded-sm shadow-sm border border-slate-200 flex-wrap gap-4">
         <div className="flex items-center gap-4">
           <h1 className="text-lg font-bold text-slate-800">Actualización Masiva (Bulk Editor)</h1>
           <div className="h-5 w-px bg-slate-300"></div>
           <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 uppercase rounded-sm border border-slate-200 tracking-widest">{globalStore}</span>
         </div>
      </div>
      
      <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-200 border-t-2 border-t-amber-500">
        <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded-sm border border-slate-100">Esta es una herramienta avanzada para agilizar tu flujo de trabajo. Podés copiar celdas directamente desde un Excel o escribir manualmente usando el formato esperado. El sistema detectará automáticamente a qué producto te referís buscando coincidencias exactas en su Nombre Comercial o en su Slug.</p>

        <div className="mb-6">
          <label className="text-xs font-bold text-slate-700 block mb-2">¿Qué variable de la base querés sobreescribir?</label>
          <div className="flex gap-2">
            <label className={`flex-1 flex items-center justify-center gap-2 border rounded-sm py-2 px-3 cursor-pointer transition-colors ${mode === 'price_usd' ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-sm' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
              <input type="radio" checked={mode === 'price_usd'} onChange={() => setMode('price_usd')} className="hidden" />
              <DollarSign size={16} /> <span className="text-xs">Precio Fijo USD</span>
            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 border rounded-sm py-2 px-3 cursor-pointer transition-colors ${mode === 'price_ars' ? 'border-blue-500 bg-blue-50 text-blue-800 font-bold shadow-sm' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
              <input type="radio" checked={mode === 'price_ars'} onChange={() => setMode('price_ars')} className="hidden" />
              <MapPin size={16} /> <span className="text-xs">Precio Fijo ARS</span>
            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 border rounded-sm py-2 px-3 cursor-pointer transition-colors ${mode === 'promo_price' ? 'border-orange-500 bg-orange-50 text-orange-800 font-bold shadow-sm' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
              <input type="radio" checked={mode === 'promo_price'} onChange={() => setMode('promo_price')} className="hidden" />
              <Flame size={16} /> <span className="text-xs">Precio Promo</span>
            </label>
            <label className={`flex-1 flex items-center justify-center gap-2 border rounded-sm py-2 px-3 cursor-pointer transition-colors ${mode === 'stock' ? 'border-amber-500 bg-amber-50 text-amber-800 font-bold shadow-sm' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
              <input type="radio" checked={mode === 'stock'} onChange={() => setMode('stock')} className="hidden" />
              <Package size={16} /> <span className="text-xs">Stock Físico</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-end mb-1">
            <label className="text-xs font-bold text-slate-700 block">Pegá acá tus columnas (Nombre + Valor)</label>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm font-mono font-bold">Ej: iphone-15-pro-max 1200</span>
          </div>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            rows={10}
            className="w-full bg-slate-900 border border-slate-800 rounded-sm p-3 outline-none focus:ring-1 focus:ring-blue-500 text-emerald-400 font-mono text-xs leading-relaxed whitespace-pre shadow-inner selection:bg-emerald-900 custom-scrollbar"
            placeholder={`iphone-15-pro-max    1200\niphone-14           850\nauricular-jbl-go    60`}
          />
        </div>

        <button 
          onClick={processBulk}
          disabled={loading || !inputText.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-sm font-semibold transition-colors w-full flex justify-center items-center gap-2 text-sm shadow-sm"
        >
          {loading ? <span className="animate-spin text-sm">⏳</span> : <span className="text-sm">⚡</span>} 
          {loading ? 'Ejecutando sentencias SQL en vivo...' : 'Ejecutar Actualización Masiva'}
        </button>
      </div>

      {results && (
        <div className="bg-slate-900 rounded-sm p-4 shadow-sm text-slate-300 font-mono text-xs border border-slate-800">
           <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white uppercase tracking-wider text-[10px]">Reporte de Ejecución</h3>
              <div className="flex gap-2">
                <div className="bg-slate-800 px-2 py-0.5 rounded-sm border border-slate-700"><span className="text-slate-500 text-[10px]">Total</span> <span className="text-white font-bold ml-1">{results.total}</span></div>
                <div className="bg-emerald-900/30 px-2 py-0.5 rounded-sm border border-emerald-900/50"><span className="text-emerald-500 text-[10px]">Éxito</span> <span className="text-emerald-400 font-bold ml-1">{results.successCount}</span></div>
                <div className="bg-red-900/30 px-2 py-0.5 rounded-sm border border-red-900/50"><span className="text-red-500 text-[10px]">Fallo</span> <span className="text-red-400 font-bold ml-1">{results.errorCount}</span></div>
              </div>
           </div>
           
           <div className="max-h-64 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
              {results.logs.map((log, i) => (
                <div key={i} className={`flex items-start gap-2 p-1.5 rounded-sm border ${log.status === 'error' ? 'bg-red-500/10 border-red-500/20' : 'hover:bg-slate-800/50 border-transparent transition-colors'}`}>
                   <span className={`shrink-0 font-bold mt-0.5 text-[10px] ${log.status === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>
                     [{log.status === 'error' ? 'FAIL' : ' OK '}]
                   </span>
                   <div className="flex-1 break-all">
                     <span className={log.status === 'error' ? 'text-red-300' : 'text-slate-300'}>{log.line}</span>
                     <div className={`text-[10px] mt-0.5 ${log.status === 'error' ? 'text-red-400' : 'text-emerald-500/80'}`}>{log.message}</div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  )
}

AdminBulk.getLayout = page => <AdminLayout>{page}</AdminLayout>
