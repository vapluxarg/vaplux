import Navbar from '@/components/Navbar'
import HeroVisual from '@/components/home/HeroVisual'
import dynamic from 'next/dynamic'
import { supabase } from '@/utils/supabase'

const TechTicker = dynamic(() => import('@/components/home/TechTicker'))
const CategoryShowcase = dynamic(() => import('@/components/home/CategoryShowcase'))
const ServicePrecision = dynamic(() => import('@/components/home/ServicePrecision'))
const PromotionPopup = dynamic(() => import('@/components/PromotionPopup'), { ssr: false })

export async function getServerSideProps() {
  const { data: promo } = await supabase
    .from('promotions')
    .select('id, title, short_description, banner_image_url, expires_at')
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  // Fetch top 3 products by popularity for Hero
  const { data: topProducts } = await supabase
    .from('products')
    .select('id, title, price_ars, price_usd, image_urls, preferred_currency, meli_clicks, added_to_cart_count, slug, has_promo, promo_price')
    .eq('is_active', true)
    .order('added_to_cart_count', { ascending: false })
    .limit(3)

  // Fetch Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')

  // Fetch all active products once to avoid N+1 queries
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, title, price_ars, price_usd, image_urls, preferred_currency, slug, has_promo, promo_price, category_id')
    .eq('is_active', true)

  // Group products by category in memory (taking top 2 per category)
  const categoryProducts = (categories || []).map((cat) => {
    const prods = (allProducts || [])
      .filter(p => p.category_id === cat.id)
      .slice(0, 2)
    return { ...cat, products: prods }
  })

  return {
    props: { 
      activePromotion: promo || null,
      topProducts: topProducts || [],
      categoryProducts: categoryProducts || []
    }
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
