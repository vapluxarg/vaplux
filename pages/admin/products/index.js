import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminLayout, { useAdmin } from '@/components/admin/AdminLayout'
import { supabase } from '@/utils/supabase'
import { toPng } from 'html-to-image'
import { getDolarBlue } from '@/utils/dolar'
import { Download, Package, Edit, Trash2, FileText, Camera } from 'lucide-react'

export async function getServerSideProps() {
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })
    
  const { data: categories } = await supabase.from('categories').select('*')

  return { props: { initialProducts: products || [], initialCategories: categories || [] } }
}

export default function AdminProducts({ initialProducts, initialCategories }) {
  const { globalStore } = useAdmin()
  const [products, setProducts] = useState(initialProducts)
  const [filterCategory, setFilterCategory] = useState('all')

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportCurrency, setExportCurrency] = useState('original') // original, usd, ars
  const [dolarRate, setDolarRate] = useState(1200)

  useEffect(() => {
    getDolarBlue().then(rate => setDolarRate(rate))
  }, [])
  
  const toggleActive = async (id, currentStatus) => {
    const { error } = await supabase.from('products').update({ is_active: !currentStatus }).eq('id', id)
    if (!error) {
      setProducts(products.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p))
    }
  }

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este producto defintivamente?')) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (!error) setProducts(products.filter(p => p.id !== id))
    }
  }

  const filtered = products.filter(p => {
    const matchStore = !globalStore || p.store === globalStore;
    const matchCategory = filterCategory === 'all' || p.category_id === filterCategory;
    return matchStore && matchCategory;
  })

  const handleExport = async (format) => {
    // 1. Filter only in-stock products
    let toExport = filtered.filter(p => p.stock > 0)
    
    // 2. Map fields and calculate prices
    const rows = toExport.map(p => {
      let finalPrice = ''
      
      if (exportCurrency === 'original') {
        finalPrice = p.preferred_currency === 'usd' ? `U$D ${p.price_usd}` : `$ ${p.price_ars}`
      } else if (exportCurrency === 'usd') {
        const val = p.preferred_currency === 'usd' ? p.price_usd : (p.price_ars / dolarRate)
        finalPrice = `U$D ${Math.round(val)}`
      } else if (exportCurrency === 'ars') {
        const val = p.preferred_currency === 'ars' ? p.price_ars : (p.price_usd * dolarRate)
        finalPrice = `$ ${Math.round(val)}`
      }

      return {
        category: p.categories?.name || '-',
        name: p.title,
        price: finalPrice
      }
    })

    if (format === 'csv') {
      const headers = ['Categoría', 'Producto', 'Precio']
      const csvRows = rows.map(r => `"${r.category}","${r.name.replace(/"/g, '""')}","${r.price}"`)
      const csvContent = [headers.join(','), ...csvRows].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `lista_precios_${globalStore}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setShowExportModal(false)
    } else if (format === 'png') {
      const container = document.createElement('div')
      // Make sure the browser renders it fully by putting it behind the current view
      container.style.position = 'fixed'
      container.style.left = '0'
      container.style.top = '0'
      container.style.zIndex = '-9999'
      container.style.width = '800px'
      
      container.innerHTML = `
        <div style="padding: 24px; background: white; font-family: sans-serif; width: 100%; color: #1e293b; box-sizing: border-box;">
          <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; text-transform: uppercase;">Lista de Precios ${globalStore}</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #cbd5e1; text-transform: uppercase; font-size: 11px;">
                <th style="padding: 10px;">Categoría</th>
                <th style="padding: 10px;">Producto</th>
                <th style="padding: 10px; text-align: right;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(r => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px; color: #64748b; font-size: 12px;">${r.category}</td>
                  <td style="padding: 10px; font-weight: 600;">${r.name}</td>
                  <td style="padding: 10px; text-align: right; font-family: monospace; font-size: 15px; font-weight: bold; color: ${r.price.includes('U$D') ? '#047857' : '#1d4ed8'}">${r.price}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 24px; font-size: 10px; color: #94a3b8; text-align: right;">Generado automáticamente por Vaplux ERP</div>
        </div>
      `
      
      document.body.appendChild(container)
      
      try {
        // Wait a frame for browser to calculate layout and paint the DOM element
        await new Promise(resolve => setTimeout(resolve, 150))
        
        const dataUrl = await toPng(container, { backgroundColor: '#ffffff', pixelRatio: 2 })
        const link = document.createElement('a')
        link.download = `lista_precios_${globalStore}.png`
        link.href = dataUrl
        link.click()
        setShowExportModal(false)
      } catch (err) {
        console.error('Error generando PNG:', err)
        alert('Error generando la imagen')
      } finally {
        document.body.removeChild(container)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-3 rounded-sm shadow-sm border border-slate-200 flex-wrap gap-4">
         <div className="flex items-center gap-4">
           <h1 className="text-lg font-bold text-slate-800">Inventario</h1>
           <div className="h-5 w-px bg-slate-300"></div>
           <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 uppercase rounded-sm border border-slate-200 tracking-widest">{globalStore}</span>
           <select 
             value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
             className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-sm py-1 px-2 outline-none focus:ring-1 focus:ring-blue-500 max-w-[200px]"
           >
             <option value="all">Todas las categorías</option>
             {initialCategories.filter(c => !globalStore || c.store === globalStore).map(c => (
               <option key={c.id} value={c.id}>{c.name}</option>
             ))}
           </select>
         </div>
         <div className="flex items-center gap-2">
           <button onClick={() => setShowExportModal(true)} className="text-xs bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-sm font-semibold transition-colors flex items-center gap-1"><Download size={14} /> Exportar Lista</button>
           <Link href="/admin/products/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-sm font-semibold transition-colors text-xs shadow-sm flex items-center gap-1">
              + Nuevo Producto
           </Link>
         </div>
      </div>

      <div id="inventory-table" className="bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <th className="px-3 py-2 text-left">SKU / Producto</th>
                <th className="px-3 py-2 text-left">Categoría</th>
                <th className="px-3 py-2 text-right">Precio USD</th>
                <th className="px-3 py-2 text-right">Precio ARS</th>
                <th className="px-3 py-2 text-center">Stock</th>
                <th className="px-3 py-2 text-center">Tienda</th>
                <th className="px-3 py-2 text-center">Estado</th>
                <th className="px-3 py-2 text-right w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 bg-slate-100 rounded-sm overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                        {p.image_urls?.[0] ? (
                          <img src={p.image_urls[0]} alt={p.title} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                        ) : (
                          <Package size={14} className="text-slate-400" />
                        )}
                      </div>
                      <div className="font-semibold text-slate-800 truncate max-w-[200px]" title={p.title}>{p.title}</div>
                    </div>
                  </td>
                  <td className="px-3 py-1.5 text-slate-600 truncate max-w-[120px]" title={p.categories?.name}>{p.categories?.name || '-'}</td>
                  <td className="px-3 py-1.5 text-right font-mono font-medium text-emerald-700">
                    <span className={p.preferred_currency === 'usd' ? 'font-bold' : 'opacity-70'}>{p.price_usd || 0}</span>
                  </td>
                  <td className="px-3 py-1.5 text-right font-mono font-medium text-blue-700">
                    <span className={p.preferred_currency === 'ars' ? 'font-bold' : 'opacity-70'}>{p.price_ars || 0}</span>
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    <span className={`inline-block min-w-[30px] font-mono text-center rounded-sm ${p.stock > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700 font-bold'}`}>
                      {p.stock || 0}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    <span className="text-[10px] font-bold uppercase text-slate-400">{p.store.substring(0, 3)}</span>
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    <button 
                      onClick={() => toggleActive(p.id, p.is_active)}
                      className={`px-2 py-0.5 rounded-sm text-[10px] font-bold transition-all border ${p.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                    >
                      {p.is_active ? 'Activo' : 'Pausa'}
                    </button>
                  </td>
                  <td className="px-3 py-1.5 text-right whitespace-nowrap">
                    <Link href={`/admin/products/${p.id}`} className="text-blue-600 hover:text-blue-800 mx-1 inline-flex items-center" title="Editar"><Edit size={14} /></Link>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 mx-1 inline-flex items-center" title="Eliminar"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="8" className="p-6 text-center text-slate-500 text-xs">No hay productos en esta selección.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-sm shadow-xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Download size={18} className="text-slate-500" /> Exportar Lista de Precios</h2>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            
            <p className="text-xs text-slate-500 mb-6 bg-amber-50 text-amber-800 p-2 rounded-sm border border-amber-200">
              La exportación incluirá <strong>solamente</strong> los productos de la tienda y categoría seleccionadas que tengan <strong>stock {'>'} 0</strong>.
            </p>

            <div className="mb-6 space-y-2">
              <label className="text-xs font-bold text-slate-700 block mb-2">Moneda a mostrar en la lista</label>
              
              <label className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition-colors ${exportCurrency==='original' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" checked={exportCurrency==='original'} onChange={() => setExportCurrency('original')} className="text-blue-600" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-800">Original</div>
                  <div className="text-[10px] text-slate-500">Mantiene la moneda base de cada producto.</div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition-colors ${exportCurrency==='usd' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" checked={exportCurrency==='usd'} onChange={() => setExportCurrency('usd')} className="text-emerald-600" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-800">Todo en Dólares (USD)</div>
                  <div className="text-[10px] text-slate-500">Convierte los pesos a USD usando Dólar Venta: ${dolarRate}</div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition-colors ${exportCurrency==='ars' ? 'border-sky-500 bg-sky-50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" checked={exportCurrency==='ars'} onChange={() => setExportCurrency('ars')} className="text-sky-600" />
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-800">Todo en Pesos (ARS)</div>
                  <div className="text-[10px] text-slate-500">Convierte los USD a pesos usando Dólar Venta: ${dolarRate}</div>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => handleExport('csv')}
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-sm text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <FileText size={14} /> Descargar CSV
              </button>
              <button 
                onClick={() => handleExport('png')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-sm text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Camera size={14} /> Generar Imagen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

AdminProducts.getLayout = page => <AdminLayout>{page}</AdminLayout>
