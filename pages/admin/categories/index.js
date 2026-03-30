import { useState, useEffect } from 'react'
import AdminLayout, { useAdmin } from '@/components/admin/AdminLayout'
import { supabase } from '@/utils/supabase'
import { ShoppingCart, MonitorSmartphone, Folder, Edit, Trash2, Edit2, PlusCircle, X } from 'lucide-react'

export async function getServerSideProps() {
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: subcategories } = await supabase
    .from('subcategories')
    .select('*')
    .order('created_at', { ascending: false })

  return { props: { initialCategories: categories || [], initialSubcategories: subcategories || [] } }
}

export default function AdminCategories({ initialCategories, initialSubcategories }) {
  const { globalStore } = useAdmin()
  const [categories, setCategories] = useState(initialCategories)
  const [subcategories, setSubcategories] = useState(initialSubcategories)
  
  // Form State
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [store, setStore] = useState(globalStore || 'vaplux')
  const [loading, setLoading] = useState(false)
  
  // Subcategory Form State
  const [subName, setSubName] = useState('')
  const [subSlug, setSubSlug] = useState('')
  const [subLoading, setSubLoading] = useState(false)

  // Sync default form store with globalStore when not editing
  useEffect(() => {
    if (!isEditing && globalStore) setStore(globalStore)
  }, [globalStore, isEditing])

  const filtered = categories.filter(c => !globalStore || c.store === globalStore)

  const handleNameChange = (e) => {
    setName(e.target.value)
    if (!isEditing || slug === '') {
      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    }
  }

  const resetForm = () => {
    setIsEditing(false)
    setEditingId(null)
    setName('')
    setSlug('')
    setStore('vaplux')
  }

  const handleEdit = (category) => {
    setIsEditing(true)
    setEditingId(category.id)
    setName(category.name || '')
    setSlug(category.slug || '')
    setStore(category.store || 'vaplux')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta categoría definitivamente? (Atención: No podrás hacerlo si aún hay productos asociados)')) {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (!error) {
        setCategories(categories.filter(c => c.id !== id))
        if (isEditing && editingId === id) resetForm()
      } else {
        alert('Error al borrar: ' + error.message)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isEditing) {
        // UPDATE
        const { data, error } = await supabase.from('categories').update({
          name, slug, store
        }).eq('id', editingId).select()
        
        if (error) throw error
        setCategories(categories.map(c => c.id === editingId ? data[0] : c))
        resetForm()
      } else {
        // INSERT
        const { data, error } = await supabase.from('categories').insert([{
          name, slug, store
        }]).select()
        
        if (error) throw error
        const newCategory = data[0]
        setCategories([newCategory, ...categories])
        // Auto-enter edit mode so admin can immediately add subcategories
        handleEdit(newCategory)
      }
    } catch (err) {
      alert('Error guardando la categoría: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubNameChange = (e) => {
    setSubName(e.target.value)
    if (subSlug === '' || subSlug === subName.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
      setSubSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    }
  }

  const handleAddSubcategory = async (e) => {
    e.preventDefault()
    if (!editingId || !subName || !subSlug) return
    setSubLoading(true)
    try {
      const { data, error } = await supabase.from('subcategories').insert([{
        category_id: editingId,
        name: subName,
        slug: subSlug
      }]).select()
      
      if (error) throw error
      setSubcategories([...subcategories, data[0]])
      setSubName('')
      setSubSlug('')
    } catch (err) {
      alert('Error agregando subcategoría: ' + err.message)
    } finally {
      setSubLoading(false)
    }
  }

  const handleDeleteSubcategory = async (id) => {
    if (confirm('¿Eliminar esta subcategoría definitivamente?')) {
      const { error } = await supabase.from('subcategories').delete().eq('id', id)
      if (!error) {
        setSubcategories(subcategories.filter(s => s.id !== id))
      }
    }
  }

  return (
    <div className="space-y-4 pb-12">
      <div className="flex justify-between items-center bg-white p-3 rounded-sm shadow-sm border border-slate-200 flex-wrap gap-4">
         <div className="flex items-center gap-4">
           <h1 className="text-lg font-bold text-slate-800">Categorías</h1>
           <div className="h-5 w-px bg-slate-300"></div>
           <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 uppercase rounded-sm border border-slate-200 tracking-widest">{globalStore}</span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Formulario Lateral */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-sm shadow-sm border border-slate-200 border-t-2 border-t-amber-500 p-4 sticky top-16">
            <h2 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                {isEditing ? <Edit2 size={16} className="text-amber-500" /> : <PlusCircle size={16} className="text-blue-500" />}
                {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
              </span>
              {isEditing && (
                <button type="button" onClick={resetForm} className="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded-sm hover:bg-red-100 border border-red-100 uppercase">Cancelar</button>
              )}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tienda de origen</label>
                <div className="flex gap-2">
                  <label className={`flex-1 flex items-center justify-center gap-2 rounded-sm py-1.5 cursor-pointer transition-colors border ${store === 'vaplux' ? 'border-sky-500 bg-sky-50 text-sky-800 font-bold shadow-sm' : 'border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                    <input type="radio" name="store" value="vaplux" checked={store === 'vaplux'} onChange={(e) => setStore(e.target.value)} className="hidden" />
                    <span className="text-xs flex items-center gap-1"><ShoppingCart size={14} /> Vaplux</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 rounded-sm py-1.5 cursor-pointer transition-colors border ${store === 'fantech' ? 'border-zinc-800 bg-zinc-800 text-white font-bold shadow-sm' : 'border-slate-300 text-slate-500 hover:bg-slate-50'}`}>
                    <input type="radio" name="store" value="fantech" checked={store === 'fantech'} onChange={(e) => setStore(e.target.value)} className="hidden" />
                    <span className="text-xs flex items-center gap-1"><MonitorSmartphone size={14} /> Fantech</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre Visible <span className="text-red-500">*</span></label>
                <input value={name} onChange={handleNameChange} className="w-full bg-white border border-slate-300 rounded-sm px-3 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 text-sm" placeholder="Ej: Celulares" required />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">URL de acceso (Slug) <span className="text-red-500">*</span></label>
                <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 font-mono text-xs text-slate-600" placeholder="celulares" required />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full text-white px-4 py-2 rounded-sm font-semibold shadow-sm transition-colors text-xs ${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loading ? 'Guardando...' : (isEditing ? 'Actualizar Categoría' : 'Guardar y Agregar Subcategorías →')}
              </button>
            </form>

            {/* Hint para categoría nueva */}
            {!isEditing && (
              <p className="text-[10px] text-slate-400 mt-3 text-center">
                Después de guardar podrás agregar subcategorías.
              </p>
            )}
          </div>

          {/* Subcategorías Editor */}
          {isEditing && (
            <div className="bg-white rounded-sm shadow-sm border border-slate-200 border-t-2 border-t-purple-500 p-4 mt-6 sticky top-[420px]">
              <h3 className="text-xs font-bold text-slate-800 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2"><Folder size={14} className="text-purple-500" /> Subcategorías</h3>
              
              <div className="mb-4">
                {subcategories.filter(s => s.category_id === editingId).length === 0 ? (
                  <p className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded-sm italic">No hay subcategorías para esta categoría.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {subcategories.filter(s => s.category_id === editingId).map(sub => (
                      <li key={sub.id} className="flex justify-between items-center bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-sm">
                        <div className="flex flex-col">
                           <span className="text-xs font-semibold text-slate-700">{sub.name}</span>
                           <span className="text-[9px] font-mono text-slate-400">/{sub.slug}</span>
                        </div>
                        <button onClick={() => handleDeleteSubcategory(sub.id)} className="text-red-500 hover:text-red-700 ml-2 inline-flex items-center" title="Eliminar subcategoría"><X size={12} /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <form onSubmit={handleAddSubcategory} className="space-y-3 bg-slate-50 p-3 rounded-sm border border-slate-100">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 block mb-1">Nueva Subcategoría</label>
                  <input value={subName} onChange={handleSubNameChange} className="w-full bg-white border border-slate-300 rounded-sm px-2 py-1 outline-none focus:ring-1 focus:ring-purple-500 text-xs" placeholder="Ej: Fundas" required />
                </div>
                <div>
                  <input value={subSlug} onChange={e => setSubSlug(e.target.value)} className="w-full bg-white border border-slate-300 rounded-sm px-2 py-1 outline-none focus:ring-1 focus:ring-purple-500 font-mono text-[10px] text-slate-500" placeholder="fundas" required />
                </div>
                <button type="submit" disabled={subLoading} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-2 py-1.5 rounded-sm font-semibold transition-colors text-[10px] shadow-sm">
                  {subLoading ? '...' : '+ Añadir'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Tabla Central */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden text-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-full">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="px-3 py-2 text-left">Categoría</th>
                    <th className="px-3 py-2 text-center">Tienda</th>
                    <th className="px-3 py-2 text-left">Ruta (Slug)</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filtered.map(c => (
                    <tr key={c.id} className={`transition-colors group ${isEditing && editingId === c.id ? 'bg-amber-50/50' : 'hover:bg-slate-50'}`}>
                      <td className="px-3 py-2">
                        <div className="font-semibold text-slate-800">{c.name}</div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="text-[10px] font-bold uppercase text-slate-400">{c.store.substring(0, 3)}</span>
                      </td>
                      <td className="px-3 py-2 font-mono text-[10px] text-slate-500">
                        /{c.slug}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-800 mx-1 inline-flex items-center" title="Editar"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:text-red-700 mx-1 inline-flex items-center" title="Eliminar"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan="4" className="p-6 text-center text-slate-500 text-xs font-medium">No hay categorías cargadas.</td></tr>
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

AdminCategories.getLayout = page => <AdminLayout>{page}</AdminLayout>
