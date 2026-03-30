import '@/styles/globals.css'
import { CartProvider } from '@/context/CartContext'
import { CurrencyProvider } from '@/context/CurrencyContext'
import FloatingActions from '@/components/FloatingActions'
import Footer from '@/components/Footer'
import CartSidebar from '@/components/CartSidebar'
import { Inter, Space_Grotesk, Playfair_Display } from 'next/font/google'

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
    <CurrencyProvider>
      <CartProvider>
        {getLayout(<Component {...pageProps} />)}
      </CartProvider>
    </CurrencyProvider>
  )
}
