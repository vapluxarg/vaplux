import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/utils/supabase'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    })
    
    if (error) {
      setError('Credenciales incorrectas: ' + error.message)
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans px-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgb(0,0,0,0.07)] ring-1 ring-slate-200">
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-slate-900 rounded-2xl shadow-sm mx-auto flex items-center justify-center mb-4">
            <span className="text-white font-bold text-3xl">V</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">Ingresá tus credenciales para acceder</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder="admin@vaplux.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-2">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold rounded-xl px-4 py-3 transition-colors mt-2"
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
