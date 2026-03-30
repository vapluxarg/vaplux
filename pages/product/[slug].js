import Head from 'next/head'
import Link from 'next/link'
import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/utils/supabase'
import { getDolarBlue } from '@/utils/dolar'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import ProductGallery from '@/components/ProductGallery'
import PurchasePanel from '@/components/PurchasePanel'
import SpecsSection from '@/components/SpecsSection'
import StickyBuyBar from '@/components/StickyBuyBar'
import { Truck, ShieldCheck, FileText, Package } from 'lucide-react'
import { trackProductEvent } from '@/utils/analytics'
import { getWhatsAppUrl } from '@/utils/whatsapp'

export async function getServerSideProps({ params }) {
  const { slug } = params;

  // Buscar producto por su slug
  const { data: rawProduct, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .single();

  if (error || !rawProduct) return { notFound: true }

  const { data: rawRelated } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('category_id', rawProduct.category_id)
    .neq('id', rawProduct.id)
    .limit(4);

  const dolarBlue = await getDolarBlue();

  const mapProd = (p) => {
    return {
      ...p,
      name: p.title,
      category: p.categories?.name || 'Vaplux',
      specs: p.description ? p.description.split('\n') : [],
      image: p.image_urls?.[0] || null,
      secondaryImage: p.image_urls?.[1] || null,
      slug: p.slug || p.id
    };
  };

  return {
    props: {
      product: mapProd(rawProduct),
      related: (rawRelated || []).map(mapProd)
    }
  }
}

export default function ProductPage({ product, related }) {
  const { add } = useCart()
  const { currency, dolarBlue, formatPrice, getProductPrice, formatPromoPrice } = useCurrency()
  const images = [product?.image, product?.secondaryImage].filter(Boolean)

  // Track view once per page load (fire-and-forget)
  useEffect(() => {
    if (product?.id) trackProductEvent('view', product.id)
  }, [product?.id])

  // WhatsApp direct purchase: fires whatsapp_checkout event
  // (which atomically increments added_to_cart_count + whatsapp_clicks)
  const handleWhatsApp = (p, qty = 1) => {
    trackProductEvent('whatsapp_checkout', p.id)
    const unitPrice = getProductPrice(p)
    const lineTotal = unitPrice * qty
    const msg = `Hola, equipo de Vaplux. 👋\n\nMe gustaría recibir más información o avanzar con la compra del siguiente producto:\n\n▪ ${p.name} (Cant: ${qty}) - ${formatPrice(lineTotal)}\n\n💰 *Total estimado:* ${formatPrice(lineTotal)}\n\nQuedo a la espera de los pasos a seguir. ¡Muchas gracias!`
    window.open(getWhatsAppUrl(msg), '_blank')
  }

  // MercadoLibre: fires meli_click event
  const handleMeli = (p) => {
    trackProductEvent('meli_click', p.id)
  }

  return (
    <div className="home-celeste min-h-screen font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <Head>
        <title>{`${product.name} · Vaplux`}</title>
      </Head>
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-12 py-8 lg:py-12">
        {/* Breadcrumb - More subtle and premium */}
        <nav className="flex items-center gap-3 text-xs md:text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
          <span className="text-slate-300">/</span>
          <Link href={`/catalog?category=${product.category?.toLowerCase()}`} className="hover:text-blue-600 transition-colors">{product.category}</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 border-b-2 border-blue-600 pb-0.5">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Gallery Side */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="lg:sticky lg:top-32 transition-all">
              <ProductGallery images={images} alt={product.name} />

              {/* Specs placed below gallery, similar to ML for better flow */}
              <div className="hidden lg:block mt-8 pr-10">
                <SpecsSection specs={product.specs} />
              </div>
            </div>
          </div>

          {/* Purchase Side */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="inline-flex w-fit items-center gap-2 px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md shadow-lg shadow-blue-500/20">
                {product.category}
              </div>
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tighter text-slate-900 leading-[0.95]">
                {product.name}
              </h1>
            </div>

            <div className="relative">
              <PurchasePanel product={product} onAdd={add} onWhatsApp={handleWhatsApp} onMeli={handleMeli} />
            </div>

            {/* Service Highlights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-[2rem] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4 group hover:border-blue-200 transition-all">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all"><Truck size={24} /></div>
                <div>
                  <p className="font-black text-slate-900 text-sm tracking-tight">Envío veloz</p>
                  <p className="text-xs text-slate-500 font-medium tracking-tight">A todo el país</p>
                </div>
              </div>
              <div className="p-6 rounded-[2rem] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 flex items-center gap-4 group hover:border-emerald-200 transition-all">
                <div className="w-12 h-12 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all"><ShieldCheck size={24} /></div>
                <div>
                  <p className="font-black text-slate-900 text-sm tracking-tight">Seguridad</p>
                  <p className="text-xs text-slate-500 font-medium tracking-tight">Garantía oficial</p>
                </div>
              </div>
            </div>

            {/* Mobile Specs (below purchase) */}
            <div className="lg:hidden">
              <SpecsSection specs={product.specs} />
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {related && related.length > 0 && (
          <section className="mt-8 mb-6 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-screen h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            <div className="pt-8 flex flex-col items-center">
              <span className="text-blue-600 text-xs font-black uppercase tracking-[0.3em] mb-4">Quizás te guste</span>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-10 tracking-tighter text-center">También podría interesarte</h2>

              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {related.map(p => (
                  <div key={p.id} className="group relative">
                    <Link href={`/product/${p.slug}`} className="block">
                      <div className="aspect-square bg-white rounded-[2rem] p-6 mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex items-center justify-center relative overflow-hidden group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-500">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="object-contain max-w-full max-h-full transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors" />
                      </div>
                      <div className="px-2 text-center">
                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mb-1">{p.category}</p>
                        <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-1">{p.name}</h3>
                        <p className="font-black text-slate-900 text-2xl tracking-tighter">
                          {p.has_promo ? formatPromoPrice(p) : formatPrice(getProductPrice(p))}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <StickyBuyBar product={product} onAdd={add} onWhatsApp={handleWhatsApp} />
    </div>
  )
}
