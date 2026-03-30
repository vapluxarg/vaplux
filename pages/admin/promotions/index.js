import { useState, useEffect } from 'react'
import AdminLayout, { useAdmin } from '@/components/admin/AdminLayout'
import { supabase } from '@/utils/supabase'
import { Megaphone, PlusCircle, Edit2, Trash2, Power, PowerOff, ImageIcon, Calendar, Package, Tag, X } from 'lucide-react'

export async function getServerSideProps() {
  const [{ data: promotions }, { data: products }, { data: categories }] = await Promise.all([
    supabase.from('promotions').select('*').order('created_at', { ascending: false }),
    supabase.from('products').select('id, title, store, has_promo').eq('is_active', true).order('title'),
    supabase.from('categories').select('id, name, store').order('name'),
  ])
  return { props: { initialPromotions: promotions || [], allProducts: products || [], allCategories: categories || [] } }
}

export default function AdminPromotions({ initialPromotions, allProducts, allCategories }) {
  const { globalStore } = useAdmin()
  const [promotions, setPromotions] = useState(initialPromotions)

  // Form state
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [bannerImageUrl, setBannerImageUrl] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [store, setStore] = useState(globalStore || 'vaplux')
  const [loading, setLoading] = useState(false)

  // Association: products (max 5) OR category
  const [targetType, setTargetType] = useState('none') // 'none' | 'products' | 'category'
  const [selectedProductIds, setSelectedProductIds] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')

  useEffect(() => {
    if (!isEditing && globalStore) setStore(globalStore)
  }, [globalStore, isEditing])

  const filtered = promotions.filter(p => !globalStore || p.store === globalStore)
  const filteredProducts = allProducts.filter(p => p.store === store)
  const filteredCategories = allCategories.filter(c => c.store === store)

  const resetForm = () => {
    setIsEditing(false); setEditingId(null)
    setTitle(''); setShortDescription(''); setBannerImageUrl(''); setExpiresAt('')
    setStore(globalStore || 'vaplux')
    setTargetType('none'); setSelectedProductIds([]); setSelectedCategoryId('')
  }

  const handleEdit = (promo) => {
    setIsEditing(true); setEditingId(promo.id)
    setTitle(promo.title || ''); setShortDescription(promo.short_description || '')
    setBannerImageUrl(promo.banner_image_url || '')
    setExpiresAt(promo.expires_at ? promo.expires_at.substring(0, 16) : '')
    setStore(promo.store || 'vaplux')
    // Restore target type
    if (promo.category_id) {
      setTargetType('category'); setSelectedCategoryId(promo.category_id); setSelectedProductIds([])
    } else if (promo.product_ids?.length > 0) {
      setTargetType('products'); setSelectedProductIds(promo.product_ids); setSelectedCategoryId('')
    } else {
      setTargetType('none'); setSelectedProductIds([]); setSelectedCategoryId('')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta promoción definitivamente?')) return
    const { error } = await supabase.from('promotions').delete().eq('id', id)
    if (!error) {
      setPromotions(promotions.filter(p => p.id !== id))
      if (isEditing && editingId === id) resetForm()
    } else { alert('Error al borrar: ' + error.message) }
  }

  const handleToggleActive = async (promo) => {
    const newActive = !promo.is_active
    if (newActive) {
      const otherIds = promotions.filter(p => p.id !== promo.id && p.is_active).map(p => p.id)
      if (otherIds.length > 0) {
        await supabase.from('promotions').update({ is_active: false }).in('id', otherIds)
        setPromotions(prev => prev.map(p => otherIds.includes(p.id) ? { ...p, is_active: false } : p))
      }
    }
    const { data, error } = await supabase.from('promotions').update({ is_active: newActive }).eq('id', promo.id).select()
    if (!error && data?.[0]) setPromotions(prev => prev.map(p => p.id === promo.id ? data[0] : p))
  }

  const toggleProduct = (productId) => {
    setSelectedProductIds(prev => {
      if (prev.includes(productId)) return prev.filter(id => id !== productId)
      if (prev.length >= 5) { alert('Máximo 5 productos por promoción'); return prev }
      return [...prev, productId]
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    const payload = {
      title,
      short_description: shortDescription || null,
      banner_image_url: bannerImageUrl || null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      store,
      product_ids: targetType === 'products' ? selectedProductIds : [],
      category_id: targetType === 'category' ? selectedCategoryId || null : null,
    }
    try {
      if (isEditing) {
        const { data, error } = await supabase.from('promotions').update(payload).eq('id', editingId).select()
        if (error) throw error
        setPromotions(promotions.map(p => p.id === editingId ? data[0] : p))
        resetForm()
      } else {
        const { data, error } = await supabase.from('promotions').insert([{ ...payload, is_active: false }]).select()
        if (error) throw error
        setPromotions([data[0], ...promotions])
        resetForm()
      }
    } catch (err) { alert('Error: ' + err.message) }
    finally { setLoading(false) }
  }

  const activePromo = filtered.find(p => p.is_active)

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-3 rounded-sm shadow-sm border border-slate-200 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Megaphone size={18} className="text-orange-500" /> Promociones
          </h1>
          <div className="h-5 w-px bg-slate-300"></div>
          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 uppercase rounded-sm border border-slate-200 tracking-widest">{globalStore}</span>
        </div>
        {activePromo && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-sm">
            <Power size={12} /> Activa: <span className="truncate max-w-[180px]">{activePromo.title}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario lateral */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-sm shadow-sm border border-slate-200 border-t-2 border-t-orange-500 p-4 sticky top-16 max-h-[calc(100vh-80px)] overflow-y-auto">
            <h2 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                {isEditing ? <Edit2 size={16} className="text-orange-500" /> : <PlusCircle size={16} className="text-blue-500" />}
                {isEditing ? 'Editar Promoción' : 'Nueva Promoción'}
              </span>
              {isEditing && (
                <button type="button" onClick={resetForm} className="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded-sm hover:bg-red-100 border border-red-100 uppercase">Cancelar</button>
              )}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Store */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tienda</label>
                <div className="flex gap-2">
                  {['vaplux', 'fantech'].map(s => (
                    <label key={s} className={`flex-1 flex items-center justify-center rounded-sm py-1.5 cursor-pointer transition-colors border text-xs font-semibold ${store === s ? (s === 'vaplux' ? 'border-sky-500 bg-sky-50 text-sky-800' : 'border-zinc-800 bg-zinc-800 text-white') : 'border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                      <input type="radio" value={s} checked={store === s} onChange={() => { setStore(s); setSelectedProductIds([]); setSelectedCategoryId('') }} className="hidden" />
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Título del Pop-up <span className="text-red-500">*</span></label>
                <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 outline-none focus:ring-1 focus:ring-orange-400 text-sm" placeholder="Ej: 20% OFF en iPhones" required />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descripción corta</label>
                <textarea value={shortDescription} onChange={e => setShortDescription(e.target.value)} rows={3} className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 outline-none focus:ring-1 focus:ring-orange-400 text-sm resize-none" placeholder="Describí brevemente la promo..." />
              </div>

              {/* Banner */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1"><ImageIcon size={12} /> URL de imagen / banner</label>
                <input type="url" value={bannerImageUrl} onChange={e => setBannerImageUrl(e.target.value)} className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 outline-none focus:ring-1 focus:ring-orange-400 text-xs text-slate-500 font-mono" placeholder="https://..." />
                {bannerImageUrl && <img src={bannerImageUrl} alt="preview" className="mt-2 w-full h-20 object-cover rounded-sm border border-slate-200" onError={e => e.target.style.display='none'} />}
              </div>

              {/* Expires */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center gap-1"><Calendar size={12} /> Expira el (opcional)</label>
                <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 outline-none focus:ring-1 focus:ring-orange-400 text-xs" />
              </div>

              {/* Target: products or category */}
              <div className="border-t border-slate-100 pt-4">
                <label className="text-xs font-bold text-slate-700 block mb-2">Asociar a (opcional)</label>
                <div className="flex gap-1.5 mb-3">
                  {[
                    { val: 'none', label: 'Ninguno', icon: null },
                    { val: 'products', label: 'Productos', icon: Package },
                    { val: 'category', label: 'Categoría', icon: Tag },
                  ].map(({ val, label, icon: Icon }) => (
                    <button key={val} type="button" onClick={() => { setTargetType(val); setSelectedProductIds([]); setSelectedCategoryId('') }}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-sm border transition-colors flex items-center justify-center gap-1 ${targetType === val ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'}`}>
                      {Icon && <Icon size={10} />} {label}
                    </button>
                  ))}
                </div>

                {/* Products selector */}
                {targetType === 'products' && (
                  <div>
                    <p className="text-[10px] text-slate-500 mb-2">Seleccioná hasta 5 productos ({selectedProductIds.length}/5)</p>
                    <div className="space-y-1 max-h-48 overflow-y-auto border border-slate-200 rounded-sm p-1.5 bg-slate-50">
                      {filteredProducts.length === 0 ? (
                        <p className="text-[10px] text-slate-400 text-center py-4">No hay productos activos para esta tienda.</p>
                      ) : filteredProducts.map(p => {
                        const selected = selectedProductIds.includes(p.id)
                        return (
                          <button key={p.id} type="button" onClick={() => toggleProduct(p.id)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-[11px] font-medium transition-colors text-left ${selected ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'bg-white text-slate-700 border border-slate-200 hover:bg-orange-50'}`}>
                            <div className={`w-3.5 h-3.5 rounded-sm border shrink-0 flex items-center justify-center ${selected ? 'bg-orange-500 border-orange-500' : 'border-slate-300'}`}>
                              {selected && <X size={8} className="text-white" />}
                            </div>
                            <span className="truncate flex-1">{p.title}</span>
                            {p.has_promo && <span className="text-[9px] bg-orange-100 text-orange-600 border border-orange-300 px-1 rounded-sm shrink-0">PROMO</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Category selector */}
                {targetType === 'category' && (
                  <div>
                    <select value={selectedCategoryId} onChange={e => setSelectedCategoryId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 outline-none focus:ring-1 focus:ring-orange-400 text-xs">
                      <option value="">Seleccioná una categoría...</option>
                      {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">Se mostrarán todos los productos de esta categoría en el popup.</p>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading}
                className={`w-full text-white px-4 py-2 rounded-sm font-semibold shadow-sm transition-colors text-xs disabled:opacity-60 ${isEditing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {loading ? 'Guardando...' : (isEditing ? 'Actualizar Promoción' : 'Guardar Promoción')}
              </button>
            </form>
          </div>
        </div>

        {/* Tabla central */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden text-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-full">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Promoción</th>
                    <th className="px-3 py-2">Asociación</th>
                    <th className="px-3 py-2">Expira</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filtered.map(p => (
                    <tr key={p.id} className={`transition-colors group ${isEditing && editingId === p.id ? 'bg-orange-50/50' : 'hover:bg-slate-50'}`}>
                      <td className="px-3 py-2">
                        <button onClick={() => handleToggleActive(p)}
                          title={p.is_active ? 'Desactivar' : 'Activar (solo una a la vez)'}
                          className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-sm transition-all border ${p.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'}`}>
                          {p.is_active ? <Power size={10} /> : <PowerOff size={10} />}
                          {p.is_active ? 'Activa' : 'Inactiva'}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-semibold text-slate-800 truncate max-w-[180px]">{p.title}</div>
                        {p.short_description && <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{p.short_description}</div>}
                      </td>
                      <td className="px-3 py-2">
                        {p.category_id ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-sm"><Tag size={9}/> Categoría</span>
                        ) : p.product_ids?.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-sm"><Package size={9}/> {p.product_ids.length} prods.</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-400">
                        {p.expires_at ? new Date(p.expires_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800 mx-1 inline-flex items-center" title="Editar"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 mx-1 inline-flex items-center" title="Eliminar"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan="5" className="p-6 text-center text-slate-500 text-xs font-medium">No hay promociones para esta tienda.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

AdminPromotions.getLayout = page => <AdminLayout>{page}</AdminLayout>
