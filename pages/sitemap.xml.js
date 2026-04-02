import { supabase } from '@/utils/supabase'

const URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vaplux.com';

function generateSiteMap(products, categories) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${URL}</loc>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>${URL}/catalog</loc>
       <changefreq>daily</changefreq>
       <priority>0.9</priority>
     </url>
     <url>
       <loc>${URL}/services</loc>
       <changefreq>monthly</changefreq>
       <priority>0.8</priority>
     </url>
     ${categories
       .map(({ slug }) => {
         return `
       <url>
           <loc>${`${URL}/catalog/${slug}`}</loc>
           <changefreq>weekly</changefreq>
           <priority>0.8</priority>
       </url>
     `;
       })
       .join('')}
     ${products
       .map(({ slug }) => {
         return `
       <url>
           <loc>${`${URL}/product/${slug}`}</loc>
           <changefreq>daily</changefreq>
           <priority>0.7</priority>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

export async function getServerSideProps({ res }) {
  const { data: products } = await supabase.from('products').select('slug').eq('store', 'vaplux').eq('is_active', true);
  const { data: categories } = await supabase.from('categories').select('slug').eq('store', 'vaplux').eq('is_active', true);

  const sitemap = generateSiteMap(products || [], categories || []);

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default function SiteMap() {}
