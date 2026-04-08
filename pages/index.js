import Navbar from '@/components/Navbar'
import HeroVisual from '@/components/home/HeroVisual'
import dynamic from 'next/dynamic'
import { supabase } from '@/utils/supabase'

const TechTicker = dynamic(() => import('@/components/home/TechTicker'))
const CategoryShowcase = dynamic(() => import('@/components/home/CategoryShowcase'))
const ServicePrecision = dynamic(() => import('@/components/home/ServicePrecision'))
const PromotionPopup = dynamic(() => import('@/components/PromotionPopup'), { ssr: false })

export async function getStaticProps() {
  const { data: promo } = await supabase
    .from('promotions')
    .select('id, title, short_description, banner_image_url, expires_at')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  // Fetch Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .eq('store', 'vaplux')
    .order('name')

  // Fetch all active products once to avoid N+1 queries. Include stat columns to compute popularity.
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, title, price_ars, price_usd, image_urls, preferred_currency, slug, has_promo, promo_price, category_id, has_variants, is_imported, stock, product_variants(price_usd, price_ars, preferred_currency), views_count, whatsapp_clicks, meli_clicks, added_to_cart_count')
    .eq('is_active', true)
    .eq('store', 'vaplux')

  const productsList = allProducts || []

  // Compute top 3 products based on overall popularity
  const topProducts = [...productsList]
    .map(p => ({
      ...p,
      popularityScore: (p.views_count || 0) + (p.whatsapp_clicks || 0) + (p.meli_clicks || 0) + (p.added_to_cart_count || 0)
    }))
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, 3)

  // Group products by category in memory (taking top 2 per category)
  const categoryProducts = (categories || []).map((cat) => {
    const prods = productsList
      .filter(p => p.category_id === cat.id)
      .slice(0, 2)
    return { ...cat, products: prods }
  })

  return {
    props: { 
      activePromotion: promo || null,
      topProducts,
      categoryProducts
    },
    revalidate: 60
  }
}

export default function Home({ activePromotion, topProducts, categoryProducts }) {
  return (
    <div className="home-celeste overflow-x-hidden">
      <Navbar />
      <HeroVisual topProducts={topProducts} />
      <TechTicker />
      <CategoryShowcase categoryProducts={categoryProducts} />
      <ServicePrecision />
      <PromotionPopup promotion={activePromotion} />
    </div>
  )
}
