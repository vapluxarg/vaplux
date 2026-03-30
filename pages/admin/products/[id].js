import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { supabase } from '@/utils/supabase'
import { FileEdit, ShoppingCart, MonitorSmartphone, Clipboard, DollarSign, BarChart, Camera, Video } from 'lucide-react'

export async function getServerSideProps({ params }) {
  const { id } = params
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    return { notFound: true }
  }

  return { props: { product } }
}

export default function EditProduct({ product }) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])

  // Form State initialized from product
  const [store, setStore] = useState(product.store || 'vaplux')
  const [title, setTitle] = useState(product.title || '')
  const [slug, setSlug] = useState(product.slug || '')
  const [categoryId, setCategoryId] = useState(product.category_id || '')
  const [subcategoryId, setSubcategoryId] = useState(product.subcategory_id || '')

  const [priceArs, setPriceArs] = useState(product.price_ars || '')
  const [priceUsd, setPriceUsd] = useState(product.price_usd || '')
  const [preferredCurrency, setPreferredCurrency] = useState(product.preferred_currency || 'usd')
  const [hasPromo, setHasPromo] = useState(product.has_promo || false)
  const [promoPrice, setPromoPrice] = useState(product.promo_price || '')
  const [stock, setStock] = useState(product.stock || '')
  const [mlLink, setMlLink] = useState(product.ml_link || '')

  const [description, setDescription] = useState(product.description || '')

  const [images, setImages] = useState(() => {
    if (!product.image_urls) return []
    return product.image_urls.map(url => ({
      preview: url,
      isExisting: true,
      url: url
    }))
  })
  const [video, setVideo] = useState(null)

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []))
    supabase.from('subcategories').select('*').then(({ data }) => setSubcategories(data || []))
  }, [])

  const handleTitleChange = (e) => {
    setTitle(e.target.value)
    // No auto-slug para evitar romper links existentes
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > 3) {
      alert('Máximo 3 imágenes permitidas')
      return
    }

    const previewFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false
    }))

    setImages(prev => [...prev, ...previewFiles])
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFile = async (file, type) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2, 10)}-${Date.now()}.${fileExt}`
    const filePath = `${store}/${type}s/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('products').getPublicUrl(filePath)
    return data.publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const imageUrls = []
      for (const img of images) {
        if (img.isExisting) {
          imageUrls.push(img.url)
        } else if (img.file) {
          const url = await uploadFile(img.file, 'image')
          imageUrls.push(url)
        }
      }

      let videoUrl = product.video_url || null
      if (video?.file) {
        videoUrl = await uploadFile(video.file, 'video')
      } else if (video === false) {
        videoUrl = null // Si implementáramos borrar el video
      }

      const { error } = await supabase.from('products').update({
        store,
        title,
        slug,
        category_id: categoryId || null,
        subcategory_id: subcategoryId || null,
        price_ars: priceArs ? Number(priceArs) : 0,
        price_usd: priceUsd ? Number(priceUsd) : 0,
        preferred_currency: preferredCurrency,
        has_promo: hasPromo,
        promo_price: hasPromo && promoPrice ? Number(promoPrice) : null,
        stock: stock ? Number(stock) : 0,
        ml_link: mlLink || null,
        description,
        image_urls: imageUrls,
        video_url: videoUrl
      }).eq('id', product.id)

      if (error) throw error

      router.push('/admin/products')
    } catch (err) {
      console.error(err)
      alert('Error guardando el producto. ' + err.message)
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(c => c.store === store)

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link href="/admin/products" className="text-xs font-bold text-slate-500 hover:text-blue-600 mb-1 inline-flex items-center gap-1">
            ← Volver al Inventario
          </Link>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Editar Producto</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 text-sm"
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start" onSubmit={e => e.preventDefault()}>
        {/* COLUMNA IZQUIERDA */}
        <div className="lg:col-span-2 space-y-6">
          {/* BLOQUE 1: INFORMACIÓN GENERAL */}
          <section className="bg-white p-5 rounded-sm shadow-sm border border-slate-200 border-t-2 border-t-blue-500">
            <h2 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><FileEdit size={16} className="text-blue-500" /> Información Principal</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 bg-slate-50 p-3 rounded-sm border border-slate-200 flex items-center gap-4">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide w-32 shrink-0">Tienda Origen</label>
                <div className="flex gap-2 flex-1">
                  <label className={`flex-1 flex items-center justify-center gap-2 rounded-sm py-2 px-3 cursor-pointer transition-colors border ${store === 'vaplux' ? 'border-sky-500 bg-sky-50 text-sky-800 font-bold' : 'border-slate-300 text-slate-500 hover:bg-white bg-white'}`}>
                    <input type="radio" name="store" value="vaplux" checked={store === 'vaplux'} onChange={(e) => { setStore(e.target.value); setCategoryId(''); setSubcategoryId(''); }} className="hidden" />
                    <span className="text-sm flex items-center gap-1"><ShoppingCart size={14} /> Vaplux</span>
                  </label>
                  <label className={`flex-1 flex items-center justify-center gap-2 rounded-sm py-2 px-3 cursor-pointer transition-colors border ${store === 'fantech' ? 'border-zinc-800 bg-zinc-800 text-white font-bold' : 'border-slate-300 text-slate-500 hover:bg-white bg-white'}`}>
                    <input type="radio" name="store" value="fantech" checked={store === 'fantech'} onChange={(e) => { setStore(e.target.value); setCategoryId(''); setSubcategoryId(''); }} className="hidden" />
                    <span className="text-sm flex items-center gap-1"><MonitorSmartphone size={14} /> Fantech</span>
                  </label>
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre Comercial <span className="text-red-500">*</span></label>
                <input value={title} onChange={handleTitleChange} className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-sm" placeholder="Ej: iPhone 15 Pro Max 256GB" required />
              </div>

              <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-700 block mb-1">Slug URL <span className="text-red-500">*</span></label>
                <input value={slug} onChange={e => setSlug(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 font-mono text-xs text-slate-600" placeholder="iphone-15-pro-max-256gb" required />
              </div>

              <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-700 block mb-1">Categoría</label>
                <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setSubcategoryId(''); }} className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-sm">
                  <option value="">Seleccionar...</option>
                  {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="text-xs font-bold text-slate-700 block mb-1">Subcategoría</label>
                <select value={subcategoryId} onChange={e => setSubcategoryId(e.target.value)} className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-sm" disabled={!categoryId}>
                  <option value="">Seleccionar...</option>
                  {subcategories.filter(s => s.category_id === categoryId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* BLOQUE 4: DESCRIPCION */}
          <section className="bg-white p-5 rounded-sm shadow-sm border border-slate-200 border-t-2 border-t-amber-500">
            <h2 className="text-sm font-bold text-slate-800 mb-2 pb-2 border-b border-slate-100 flex items-center gap-2"><Clipboard size={16} className="text-sky-500" /> Descripción Comercial</h2>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              rows={12}
              className="w-full bg-white border border-slate-300 rounded-sm p-3 outline-none focus:ring-1 focus:ring-blue-500 text-sm leading-relaxed"
              placeholder="Especificaciones (una por renglón)..."
            ></textarea>
          </section>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="lg:col-span-1 space-y-6">
          {/* BLOQUE 2: PRECIOS */}
          <section className="bg-white p-5 rounded-sm shadow-sm border border-slate-200 border-t-2 border-t-emerald-500">
            <h2 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><DollarSign size={16} className="text-emerald-500" /> Precios y Cotización</h2>

            <div className="grid grid-cols-1 gap-4 items-start">
              <div className="col-span-1">
                <label className="text-xs font-bold text-slate-700 block mb-1">Moneda Base</label>
                <div className="flex bg-slate-100 p-0.5 rounded-sm border border-slate-200">
                  <button type="button" onClick={() => setPreferredCurrency('usd')} className={`flex-1 py-1.5 font-bold rounded-sm text-xs transition-colors ${preferredCurrency === 'usd' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-200'}`}>USD</button>
                  <button type="button" onClick={() => setPreferredCurrency('ars')} className={`flex-1 py-1.5 font-bold rounded-sm text-xs transition-colors ${preferredCurrency === 'ars' ? 'bg-white text-blue-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-200'}`}>ARS</button>
                </div>
              </div>

              <div className="col-span-1">
                <label className={`text-xs font-bold block mb-1 ${preferredCurrency === 'usd' ? 'text-emerald-700' : 'text-slate-500'}`}>Precio Fijo USD</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                  <input type="number" value={priceUsd} onChange={e => setPriceUsd(e.target.value)} className={`w-full bg-white border rounded-sm pl-6 pr-3 py-2 outline-none focus:ring-1 font-mono text-sm ${preferredCurrency === 'usd' ? 'border-emerald-400 focus:ring-emerald-500 shadow-inner' : 'border-slate-300'}`} placeholder="0" disabled={preferredCurrency === 'ars'} />
                </div>
              </div>

              <div className="col-span-1">
                <label className={`text-xs font-bold block mb-1 ${preferredCurrency === 'ars' ? 'text-blue-700' : 'text-slate-500'}`}>Precio Fijo ARS</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                  <input type="number" value={priceArs} onChange={e => setPriceArs(e.target.value)} className={`w-full bg-white border rounded-sm pl-6 pr-3 py-2 outline-none focus:ring-1 font-mono text-sm ${preferredCurrency === 'ars' ? 'border-blue-400 focus:ring-blue-500 shadow-inner' : 'border-slate-300'}`} placeholder="0" disabled={preferredCurrency === 'usd'} />
                </div>
              </div>
            </div>

              {/* Promo Pricing */}
              <div className="col-span-1 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">Precio en Promo</label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasPromo}
                      onChange={e => { setHasPromo(e.target.checked); if (!e.target.checked) setPromoPrice('') }}
                      className="accent-orange-500 w-3.5 h-3.5"
                    />
                    <span className={`text-[10px] font-bold uppercase ${hasPromo ? 'text-orange-600' : 'text-slate-400'}`}>
                      {hasPromo ? 'Activo' : 'Sin promo'}
                    </span>
                  </label>
                </div>
                {hasPromo && (
                  <div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400 font-bold text-xs">$</span>
                      <input
                        type="number"
                        value={promoPrice}
                        onChange={e => setPromoPrice(e.target.value)}
                        className="w-full bg-orange-50 border border-orange-300 rounded-sm pl-6 pr-3 py-2 outline-none focus:ring-1 focus:ring-orange-400 font-mono text-sm"
                        placeholder="Precio con descuento"
                      />
                    </div>
                    {promoPrice && (preferredCurrency === 'ars' ? priceArs : priceUsd) && (
                      <p className="text-[10px] text-emerald-600 font-bold mt-1">
                        Descuento: {(100 - (Number(promoPrice) / Number(preferredCurrency === 'ars' ? priceArs : priceUsd)) * 100).toFixed(0)}% OFF
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">En la misma moneda que el precio base ({preferredCurrency.toUpperCase()})</p>
                  </div>
                )}
              </div>
          </section>

          {/* BLOQUE DATA */}
          <section className="bg-white p-5 rounded-sm shadow-sm border border-slate-200 border-t-2 border-t-indigo-500">
            <h2 className="text-sm font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2"><BarChart size={16} className="text-amber-500" /> Operativa</h2>

            <div className="grid grid-cols-1 gap-4">
              <div className="col-span-1">
                <label className="text-xs font-bold text-slate-700 block mb-1">Stock Disponible</label>
                <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-sm font-mono" placeholder="0" />
              </div>

              <div className="col-span-1">
                <label className="text-xs font-bold text-slate-700 block mb-1">Enlace de MercadoLibre (opcional)</label>
                <input type="url" value={mlLink} onChange={e => setMlLink(e.target.value)} className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 text-sm text-blue-600" placeholder="https://articulo.mercadolibre.com.ar/..." />
              </div>
            </div>
          </section>

          {/* BLOQUE 3: MEDIA */}
          <section className="bg-white p-5 rounded-sm shadow-sm border border-slate-200 border-t-2 border-t-purple-500">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Camera size={16} className="text-purple-500" /> Multimedia</h2>
              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-sm">{images.length}/3 Fotos</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {images.map((img, i) => (
                <div key={i} className="aspect-square relative bg-white border border-slate-200 rounded-sm overflow-hidden group">
                  <img src={img.preview} alt={`preview-${i}`} className="w-full h-full object-contain p-1" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-600 text-white h-6 w-6 flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 transition-opacity text-xs shadow-sm">✕</button>
                </div>
              ))}

              {images.length < 3 && (
                <label className="aspect-square bg-slate-50 border border-dashed border-slate-300 rounded-sm flex flex-col items-center justify-center text-slate-400 hover:text-purple-600 hover:bg-purple-50 cursor-pointer transition-colors">
                  <span className="text-2xl font-light">+</span>
                  <span className="text-xs font-bold">Subir Foto</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            <div className="border border-slate-200 rounded-sm p-3">
              <label className="text-xs font-bold text-slate-700 block mb-2">Video (Máx 1)</label>
              {video || product.video_url ? (
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-sm">
                  <Video size={18} className="text-slate-600" />
                  <span className="flex-1 text-xs font-bold text-slate-600 truncate">{video?.file ? video.file.name : 'Video actual'}</span>
                  <button type="button" onClick={() => setVideo(false)} className="text-red-600 hover:text-red-700 text-xs font-bold hover:underline">Eliminar</button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-3 bg-slate-50 border border-dashed border-slate-300 p-3 rounded-sm cursor-pointer hover:bg-slate-100 transition-colors">
                  <Video size={20} className="text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">Seleccionar video .mp4</span>
                  <input type="file" accept="video/*" onChange={e => { if (e.target.files[0]) setVideo({ file: e.target.files[0] }) }} className="hidden" />
                </label>
              )}
            </div>
          </section>
        </div>
      </form>
    </div>
  )
}

EditProduct.getLayout = page => <AdminLayout>{page}</AdminLayout>
