import '@/styles/globals.css'
import { CartProvider } from '@/context/CartContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import { CategoriesProvider } from '@/context/CategoriesContext'
import FloatingActions from '@/components/FloatingActions'
import Footer from '@/components/Footer'
import CartSidebar from '@/components/CartSidebar'
import { Inter, Space_Grotesk, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })

export default function App({ Component, pageProps }) {
  const getLayout = Component.getLayout || ((page) => (
    <div className={`relative min-h-full ${inter.variable} ${spaceGrotesk.variable} ${playfair.variable}`}>
      {page}
      <Footer />
      <FloatingActions />
      <CartSidebar />
    </div>
  ));

  return (
    <>
      <Head>
        <title>Vaplux | Tecnología y el mejor servicio de La Plata</title>
        <meta name="description" content="Envíos a todo el país. Tecnología, Apple, Samsung, Xiaomi y productos de vapeo de máxima calidad." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Vaplux" />
        <meta property="og:image" content="/assets/logo.PNG" />
        <link rel="icon" href="/assets/logo.PNG" />
        <link rel="apple-touch-icon" href="/assets/logo.PNG" />
        <meta name="theme-color" content="#0066ff" />
      </Head>
      <CurrencyProvider>
        <CategoriesProvider>
          <CartProvider>
            {getLayout(<Component {...pageProps} />)}
            <Analytics />
            <SpeedInsights />
          </CartProvider>
        </CategoriesProvider>
      </CurrencyProvider>
    </>
  )
}
