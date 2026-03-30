import Image from 'next/image'

export default function FloatingActions(){
  const wa = 'https://wa.me/5492216703630?text=Hola!%20Quiero%20consultar%20por%20un%20producto%20de%20Vaplux.'
  return (
    <div className="fixed right-4 bottom-4 flex flex-col gap-3 z-50">
      <a
        href={wa}
        aria-label="WhatsApp"
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 bg-white border border-slate-100 overflow-hidden"
      >
        <Image 
          src="/assets/whatsapp.png" 
          alt="WhatsApp Logo" 
          width={56} 
          height={56} 
          className="w-full h-full object-cover"
        />
      </a>
    </div>
  )
}
