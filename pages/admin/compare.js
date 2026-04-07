import AdminLayout from '@/components/admin/AdminLayout'
import { supabase } from '@/utils/supabase'
import { useState, useEffect, useMemo } from 'react'
import {
  Eye, MessageCircle, ShoppingCart, ExternalLink, TrendingUp,
  RefreshCw, Calendar, Scale, BarChart2, Package
} from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, BarChart, Bar, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie
} from 'recharts'

export async function getServerSideProps() {
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('id,title,store,category_id,stock,is_active,views_count,whatsapp_clicks,meli_clicks,added_to_cart_count,categories(name)')
      .order('views_count', { ascending: false }),
    supabase.from('categories').select('id,name,store,views_count').order('name'),
  ])
  return { props: { allProducts: products || [], allCategories: categories || [] } }
}

const PERIOD_OPTIONS = [
  { label: '7 días',    value: 7 },
  { label: '30 días',   value: 30 },
  { label: '90 días',   value: 90 },
  { label: 'All-time',  value: null },
  { label: 'Desde fecha', value: 'custom' },
]

const V_COLOR  = '#3b82f6'   // Vaplux — blue
const FT_COLOR = '#f97316'   // Fantech — orange

function groupByStoreDay(events, productMap) {
  const m = {}
  events.forEach(ev => {
    if (ev.event_type !== 'view') return
    const store = productMap[ev.entity_id]
    if (!store) return
    const d = new Date(ev.created_at)
    const k = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
    if (!m[k]) m[k] = { date: k, Vaplux: 0, Fantech: 0 }
    if (store === 'vaplux')  m[k].Vaplux++
    if (store === 'fantech') m[k].Fantech++
  })
  return Object.values(m).sort((a, b) => {
    const [da, ma] = a.date.split('/').map(Number)
    const [db, mb] = b.date.split('/').map(Number)
    return ma !== mb ? ma - mb : da - db
  })
}

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 text-white text-xs rounded px-3 py-2 shadow-xl">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <b>{(p.value ?? 0).toLocaleString('es-AR')}</b></p>
      ))}
    </div>
  )
}

function Delta({ a, b }) {
  if (!a && !b) return null
  const winner = a >= b ? 'Vaplux' : 'Fantech'
  const diff = b > 0 ? (((a - b) / b) * 100).toFixed(0) : '∞'
  const positive = a > b
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${positive ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
      {winner === 'Vaplux' ? `Vaplux +${Math.abs(diff)}%` : `Fantech +${Math.abs(diff)}%`}
    </span>
  )
}

function CompareCard({ label, vaplux, fantech, format = v => v?.toLocaleString('es-AR'), icon: Icon }) {
  const vNum = typeof vaplux === 'number' ? vaplux : parseFloat(vaplux) || 0
  const fNum = typeof fantech === 'number' ? fantech : parseFloat(fantech) || 0
  return (
    <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 bg-slate-50">
        {Icon && <Icon size={12} className="text-slate-400" />}
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <div className="ml-auto"><Delta a={vNum} b={fNum} /></div>
      </div>
      <div className="grid grid-cols-2 divide-x divide-slate-200">
        <div className="flex flex-col items-center py-3 px-4">
          <span className="text-[10px] font-bold text-blue-600 mb-1">Vaplux</span>
          <span className="text-xl font-extrabold text-slate-800">{format(vaplux)}</span>
        </div>
        <div className="flex flex-col items-center py-3 px-4">
          <span className="text-[10px] font-bold text-orange-500 mb-1">Fantech</span>
          <span className="text-xl font-extrabold text-slate-800">{format(fantech)}</span>
        </div>
      </div>
    </div>
  )
}

export default function CompareStores({ allProducts, allCategories }) {
  const [period, setPeriod] = useState(30)
  const [customDate, setCustomDate] = useState('')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)

  const vapluxProds  = useMemo(() => allProducts.filter(p => p.store === 'vaplux'),  [allProducts])
  const fantechProds = useMemo(() => allProducts.filter(p => p.store === 'fantech'), [allProducts])
  const vapluxCats   = useMemo(() => allCategories.filter(c => c.store === 'vaplux'),  [allCategories])
  const fantechCats  = useMemo(() => allCategories.filter(c => c.store === 'fantech'), [allCategories])

  // product id → store map (for event joining)
  const productMap = useMemo(() => {
    const m = {}
    allProducts.forEach(p => { m[p.id] = p.store })
    return m
  }, [allProducts])

  const sinceDate = useMemo(() => {
    if (period === null) return null
    if (period === 'custom') return customDate ? new Date(customDate).toISOString() : null
    const d = new Date(); d.setDate(d.getDate() - period); return d.toISOString()
  }, [period, customDate])

  const fetchEvents = async () => {
    setLoading(true)
    let q = supabase.from('analytics_events')
      .select('id,event_type,entity_id,created_at')
      .eq('entity_type', 'product')
      .order('created_at', { ascending: true })
    if (sinceDate) q = q.gte('created_at', sinceDate)
    const { data } = await q
    setEvents(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchEvents() }, [period, customDate])

  // Split events by store
  const vEvents  = useMemo(() => events.filter(e => productMap[e.entity_id] === 'vaplux'),  [events, productMap])
  const ftEvents = useMemo(() => events.filter(e => productMap[e.entity_id] === 'fantech'), [events, productMap])

  // All-time from product fields
  const v  = { views: vapluxProds.reduce((s,p)=>s+(p.views_count||0),0), wa: vapluxProds.reduce((s,p)=>s+(p.whatsapp_clicks||0),0), ml: vapluxProds.reduce((s,p)=>s+(p.meli_clicks||0),0), cart: vapluxProds.reduce((s,p)=>s+(p.added_to_cart_count||0),0), active: vapluxProds.filter(p=>p.is_active).length, lowStock: vapluxProds.filter(p=>p.is_active&&(p.stock??0)<=3).length }
  const ft = { views: fantechProds.reduce((s,p)=>s+(p.views_count||0),0), wa: fantechProds.reduce((s,p)=>s+(p.whatsapp_clicks||0),0), ml: fantechProds.reduce((s,p)=>s+(p.meli_clicks||0),0), cart: fantechProds.reduce((s,p)=>s+(p.added_to_cart_count||0),0), active: fantechProds.filter(p=>p.is_active).length, lowStock: fantechProds.filter(p=>p.is_active&&(p.stock??0)<=3).length }

  // Period metrics from events
  const vP  = { views: vEvents.filter(e=>e.event_type==='view').length, wa: vEvents.filter(e=>e.event_type==='whatsapp_checkout').length, ml: vEvents.filter(e=>e.event_type==='meli_click').length }
  const ftP = { views: ftEvents.filter(e=>e.event_type==='view').length, wa: ftEvents.filter(e=>e.event_type==='whatsapp_checkout').length, ml: ftEvents.filter(e=>e.event_type==='meli_click').length }

  const isAllTime = period === null

  const vConvWA   = (isAllTime ? v.views  : vP.views)  > 0 ? (((isAllTime ? v.wa  : vP.wa)  / (isAllTime ? v.views  : vP.views))  * 100).toFixed(1) : '0.0'
  const ftConvWA  = (isAllTime ? ft.views : ftP.views) > 0 ? (((isAllTime ? ft.wa : ftP.wa) / (isAllTime ? ft.views : ftP.views)) * 100).toFixed(1) : '0.0'
  const vAvg      = v.active  > 0 ? (v.views / v.active).toFixed(0)   : '0'
  const ftAvg     = ft.active > 0 ? (ft.views / ft.active).toFixed(0) : '0'

  // Time-series (views by day, split by store)
  const timeSeriesData = useMemo(() => groupByStoreDay(events, productMap), [events, productMap])

  // Category breakdown for bar chart
  const topCats = useMemo(() => {
    const all = [...vapluxCats, ...fantechCats].reduce((acc, c) => {
      if (!acc[c.name]) acc[c.name] = { name: c.name.length > 14 ? c.name.substring(0,14)+'…' : c.name, Vaplux: 0, Fantech: 0 }
      const prods = allProducts.filter(p => p.category_id === c.id)
      const total = prods.reduce((s,p)=>s+(p.views_count||0), 0)
      if (c.store === 'vaplux')  acc[c.name].Vaplux  += total
      if (c.store === 'fantech') acc[c.name].Fantech += total
      return acc
    }, {})
    return Object.values(all).sort((a,b)=>(b.Vaplux+b.Fantech)-(a.Vaplux+a.Fantech)).slice(0, 8)
  }, [vapluxCats, fantechCats, allProducts])

  // Radar data (normalize 0-100)
  const radarData = useMemo(() => {
    const norm = (a, b) => {
      const max = Math.max(a, b, 1)
      return { v: Math.round((a / max) * 100), ft: Math.round((b / max) * 100) }
    }
    const activeN   = norm(v.active,  ft.active)
    const viewsN    = norm(v.views,   ft.views)
    const waN       = norm(v.wa,      ft.wa)
    const mlN       = norm(v.ml,      ft.ml)
    const cartN     = norm(v.cart,    ft.cart)
    const avgN      = norm(parseFloat(vAvg), parseFloat(ftAvg))
    return [
      { subject: 'Prods. activos', Vaplux: activeN.v,  Fantech: activeN.ft  },
      { subject: 'Vistas totales', Vaplux: viewsN.v,   Fantech: viewsN.ft   },
      { subject: 'WA clicks',      Vaplux: waN.v,      Fantech: waN.ft      },
      { subject: 'ML clicks',      Vaplux: mlN.v,      Fantech: mlN.ft      },
      { subject: 'Carritos',       Vaplux: cartN.v,    Fantech: cartN.ft    },
      { subject: 'Avg vistas/prod',Vaplux: avgN.v,     Fantech: avgN.ft     },
    ]
  }, [v, ft, vAvg, ftAvg])

  // Cross-store top 10+10 mixed table
  const topVaplux  = vapluxProds.slice(0, 10)
  const topFantech = fantechProds.slice(0, 10)
  const crossTable = Array.from({ length: Math.max(topVaplux.length, topFantech.length) }, (_, i) => ({
    vp: topVaplux[i],  ft: topFantech[i],
  }))

  const periodLabel = period === null ? 'All-time' : period === 'custom' ? `Desde ${customDate || '—'}` : `Últimos ${period} días`

  return (
    <div className="space-y-5 pb-8">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-sm shadow-sm border border-slate-200 p-3">
        <h1 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Scale size={15} className="text-cyan-500" /> Comparación de Tiendas
        </h1>
        <div className="flex items-center gap-1 ml-auto">
          <div className="flex rounded-sm border border-slate-200 overflow-hidden">
            {PERIOD_OPTIONS.map(opt => (
              <button key={String(opt.value)} onClick={() => setPeriod(opt.value)}
                className={`px-2.5 py-1.5 text-[10px] font-bold transition-colors ${period === opt.value ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          {period === 'custom' && (
            <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="px-2 py-1 text-[10px] border border-slate-200 rounded-sm text-slate-700 outline-none focus:border-blue-400 bg-white" />
          )}
          <button onClick={fetchEvents} disabled={loading}
            className="p-1.5 border border-slate-200 rounded-sm bg-white text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-40 transition-colors">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        {/* Store legend */}
        <div className="flex items-center gap-4 w-full pt-1 border-t border-slate-100 mt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: V_COLOR }} />
            <span className="text-[11px] font-bold text-slate-600">Vaplux</span>
            <span className="text-[10px] text-slate-400">— {v.active} prod. activos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: FT_COLOR }} />
            <span className="text-[11px] font-bold text-slate-600">Fantech</span>
            <span className="text-[10px] text-slate-400">— {ft.active} prod. activos</span>
          </div>
          <span className="text-[10px] text-slate-400 ml-auto italic">{periodLabel}</span>
          {loading && <RefreshCw size={10} className="animate-spin text-blue-400" />}
        </div>
      </div>

      {/* ── KPI Cards grid ── */}
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">All-time acumulado</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <CompareCard label="Productos Activos" vaplux={v.active}  fantech={ft.active}  icon={Package} />
          <CompareCard label="Vistas Totales"    vaplux={v.views}   fantech={ft.views}   icon={Eye} />
          <CompareCard label="WA Clicks"         vaplux={v.wa}      fantech={ft.wa}      icon={MessageCircle} />
          <CompareCard label="ML Clicks"         vaplux={v.ml}      fantech={ft.ml}      icon={ExternalLink} />
        </div>
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Métricas adicionales</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <CompareCard label="Carritos"         vaplux={v.cart}           fantech={ft.cart}           icon={ShoppingCart} />
          <CompareCard label="Conv. WA%"        vaplux={parseFloat(vConvWA)} fantech={parseFloat(ftConvWA)} format={v => `${parseFloat(v).toFixed(1)}%`} icon={TrendingUp} />
          <CompareCard label="Avg vistas/prod"  vaplux={parseInt(vAvg)}   fantech={parseInt(ftAvg)}   icon={BarChart2} />
          <CompareCard label="Stock crítico ≤3" vaplux={v.lowStock}       fantech={ft.lowStock}       icon={Package} format={v => v} />
        </div>
      </div>

      {/* ── Period KPIs (events) ── */}
      {!isAllTime && (
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar size={11} /> {periodLabel} — eventos registrados
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <CompareCard label="Vistas período" vaplux={vP.views} fantech={ftP.views} icon={Eye} />
            <CompareCard label="WA período"     vaplux={vP.wa}    fantech={ftP.wa}    icon={MessageCircle} />
            <CompareCard label="ML período"     vaplux={vP.ml}    fantech={ftP.ml}    icon={ExternalLink} />
          </div>
        </div>
      )}

      {/* ── Line Chart (vistas por día) ── */}
      {!isAllTime && (
        <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Eye size={13} className="text-blue-500" /> Vistas por día — {periodLabel}
          </h3>
          {timeSeriesData.length === 0
            ? <p className="text-xs text-slate-400 text-center py-10">Sin eventos registrados en este período.</p>
            : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={timeSeriesData} margin={{ left: 0, right: 12, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<Tip />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="Vaplux"  stroke={V_COLOR}  strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="Fantech" stroke={FT_COLOR} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )
          }
        </div>
      )}

      {/* ── Bar Chart (categorías) + Radar ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        <div className="xl:col-span-2 bg-white rounded-sm shadow-sm border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <BarChart2 size={13} className="text-blue-500" /> Vistas por Categoría (all-time)
          </h3>
          {topCats.length === 0
            ? <p className="text-xs text-slate-400 text-center py-8">Sin datos.</p>
            : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topCats} margin={{ left: 0, right: 8, top: 0, bottom: 40 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} cursor={{ fill: '#f8fafc' }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Vaplux"  fill={V_COLOR}  radius={[3,3,0,0]} barSize={14} />
                  <Bar dataKey="Fantech" fill={FT_COLOR} radius={[3,3,0,0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">
            Radar de Fortalezas (normalizado 0-100)
          </h3>
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> Vaplux</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500"><span className="w-3 h-0.5 bg-orange-500 inline-block rounded" /> Fantech</span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748b' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: '#94a3b8' }} />
              <Radar name="Vaplux"  dataKey="Vaplux"  stroke={V_COLOR}  fill={V_COLOR}  fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Fantech" dataKey="Fantech" stroke={FT_COLOR} fill={FT_COLOR} fillOpacity={0.15} strokeWidth={2} />
              <Tooltip content={<Tip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Cross-store top products table ── */}
      <div className="bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
          <Scale size={13} className="text-cyan-500" />
          <h3 className="text-xs font-bold text-slate-700">Top 10 Productos — Cross-Store</h3>
          <span className="text-[10px] text-slate-400 ml-1">(ordenados por vistas totales)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-wider">
                <th className="px-4 py-2 text-left bg-blue-50 text-blue-700 border-r border-slate-200">
                  Vaplux — Producto
                </th>
                <th className="px-3 py-2 text-center bg-blue-50 text-blue-500 border-r border-slate-200 whitespace-nowrap">
                  Vistas
                </th>
                <th className="px-4 py-2 text-left bg-orange-50 text-orange-600">
                  Fantech — Producto
                </th>
                <th className="px-3 py-2 text-right bg-orange-50 text-orange-500 whitespace-nowrap">
                  Vistas
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {crossTable.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                  {/* Vaplux side */}
                  <td className="px-4 py-2 border-r border-slate-200">
                    {row.vp
                      ? <span className="font-medium text-slate-700 truncate block max-w-[180px]">{row.vp.title}</span>
                      : <span className="text-slate-300">—</span>
                    }
                  </td>
                  <td className="px-3 py-2 text-center border-r border-slate-200">
                    {row.vp
                      ? <span className="font-bold text-blue-600">{(row.vp.views_count||0).toLocaleString('es-AR')}</span>
                      : null
                    }
                  </td>
                  {/* Fantech side */}
                  <td className="px-4 py-2 border-l border-slate-200">
                    {row.ft
                      ? <span className="font-medium text-slate-700 truncate block max-w-[180px]">{row.ft.title}</span>
                      : <span className="text-slate-300">—</span>
                    }
                  </td>
                  <td className="px-3 py-2 text-right">
                    {row.ft
                      ? <span className="font-bold text-orange-500">{(row.ft.views_count||0).toLocaleString('es-AR')}</span>
                      : null
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

CompareStores.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>
}
