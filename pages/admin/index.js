import AdminLayout, { useAdmin } from '@/components/admin/AdminLayout'
import { supabase } from '@/utils/supabase'
import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import {
  PackageCheck, Eye, MessageCircle, ShoppingCart, ExternalLink,
  AlertTriangle, BarChart2, TrendingUp, Store, Calendar, RefreshCw
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, LineChart, Line, Legend, CartesianGrid, FunnelChart, Funnel, LabelList
} from 'recharts'

// ─── SSR: products + categories (static counters) ─────────────────────────────
export async function getServerSideProps() {
  const { data: products } = await supabase
    .from('products')
    .select('id, title, store, category_id, stock, is_active, views_count, whatsapp_clicks, meli_clicks, added_to_cart_count, categories(name)')
    .order('views_count', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, store, views_count')

  return { props: { allProducts: products || [], allCategories: categories || [] } }
}

// ─── Config ────────────────────────────────────────────────────────────────────
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#ec4899', '#06b6d4']

const PERIOD_OPTIONS = [
  { label: 'Hoy', days: 1 },
  { label: '7 días', days: 7 },
  { label: '30 días', days: 30 },
  { label: '90 días', days: 90 },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────
function MetricCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white p-4 rounded-sm shadow-sm border border-slate-200 border-t-2 flex flex-col gap-0.5" style={{ borderTopColor: color }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} style={{ color }} />
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-2xl font-extrabold text-slate-800">{value?.toLocaleString('es-AR')}</span>
      {sub && <span className="text-[10px] text-slate-400">{sub}</span>}
    </div>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 text-white text-xs rounded-sm px-3 py-2 shadow-xl">
      <p className="font-semibold mb-1 truncate max-w-[200px]">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{p.value?.toLocaleString('es-AR')}</span></p>
      ))}
    </div>
  )
}

// Group analytics events by day label (DD/MM)
function groupByDay(events) {
  const counts = {}
  events.forEach(ev => {
    const d = new Date(ev.created_at)
    const key = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
    const type = ev.event_type
    if (!counts[key]) counts[key] = { date: key, view: 0, cart_add: 0, whatsapp_checkout: 0, meli_click: 0 }
    counts[key][type] = (counts[key][type] || 0) + 1
  })
  return Object.values(counts).sort((a, b) => {
    const [da, ma] = a.date.split('/').map(Number)
    const [db, mb] = b.date.split('/').map(Number)
    return ma !== mb ? ma - mb : da - db
  })
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export default function AdminDashboard({ allProducts, allCategories }) {
  const { globalStore } = useAdmin()

  // Period state
  const [periodDays, setPeriodDays] = useState(7)
  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(false)

  // Filter by store
  const products = allProducts.filter(p => !globalStore || p.store === globalStore)
  const categories = allCategories.filter(c => !globalStore || c.store === globalStore)

  // ── Fetch events from analytics_events for selected period ──────────────────
  const fetchEvents = async () => {
    setLoadingEvents(true)
    const since = new Date()
    since.setDate(since.getDate() - periodDays)

    const { data } = await supabase
      .from('analytics_events')
      .select('id, event_type, entity_id, created_at')
      .eq('entity_type', 'product')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true })

    setEvents(data || [])
    setLoadingEvents(false)
  }

  useEffect(() => { fetchEvents() }, [periodDays, globalStore])

  // ── Filter events by store (join to products) ───────────────────────────────
  const productIds = useMemo(() => new Set(products.map(p => p.id)), [products])
  const storeEvents = useMemo(() => events.filter(e => productIds.has(e.entity_id)), [events, productIds])

  // ── KPI from events (time-period) ───────────────────────────────────────────
  const periodViews = storeEvents.filter(e => e.event_type === 'view').length
  const periodCartAdds = storeEvents.filter(e => e.event_type === 'cart_add' || e.event_type === 'whatsapp_checkout').length
  const periodWA = storeEvents.filter(e => e.event_type === 'whatsapp_checkout').length
  const periodMeli = storeEvents.filter(e => e.event_type === 'meli_click').length
  const cartConvRate = periodViews > 0 ? ((periodCartAdds / periodViews) * 100).toFixed(1) : '—'
  const waConvRate = periodViews > 0 ? ((periodWA / periodViews) * 100).toFixed(1) : '—'

  // ── Static totals (all time) ─────────────────────────────────────────────────
  const activeProducts = products.filter(p => p.is_active).length
  const totalViews = products.reduce((s, p) => s + (p.views_count || 0), 0)
  const totalWhatsapp = products.reduce((s, p) => s + (p.whatsapp_clicks || 0), 0)
  const totalCart = products.reduce((s, p) => s + (p.added_to_cart_count || 0), 0)
  const lowStock = products.filter(p => p.is_active && (p.stock ?? 0) <= 3).length
  const lowStockProducts = products.filter(p => p.is_active && (p.stock ?? 0) <= 3).sort((a,b) => (a.stock??0)-(b.stock??0)).slice(0,6)

  // ── Time series chart data ───────────────────────────────────────────────────
  const timeSeriesData = useMemo(() => groupByDay(storeEvents), [storeEvents])

  // ── Funnel data ──────────────────────────────────────────────────────────────
  const funnelData = [
    { name: 'Vistas', value: periodViews, fill: '#3b82f6' },
    { name: 'Carrito', value: periodCartAdds, fill: '#8b5cf6' },
    { name: 'WhatsApp', value: periodWA, fill: '#10b981' },
    { name: 'MercadoLibre', value: periodMeli, fill: '#f59e0b' },
  ]

  // ── Top products bar (static totals) ─────────────────────────────────────────
  const topByViews = [...products]
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 10)
    .map(p => ({
      name: p.title?.length > 22 ? p.title.substring(0, 22) + '…' : p.title,
      vistas: p.views_count || 0,
      whatsapp: p.whatsapp_clicks || 0,
      carrito: p.added_to_cart_count || 0,
    }))

  // ── Category breakdown ────────────────────────────────────────────────────────
  const catBreakdown = categories
    .map(c => ({
      name: c.name?.length > 14 ? c.name.substring(0, 14) + '…' : c.name,
      vistas: products.filter(p => p.category_id === c.id).reduce((s, p) => s + (p.views_count || 0), 0),
      productos: products.filter(p => p.category_id === c.id).length,
    }))
    .filter(c => c.productos > 0)
    .sort((a, b) => b.vistas - a.vistas)
    .slice(0, 8)

  // ── Store breakdown ────────────────────────────────────────────────────────
  const storeBreakdown = [
    { name: 'Vaplux', value: allProducts.filter(p => p.store === 'vaplux' && p.is_active).length },
    { name: 'Fantech', value: allProducts.filter(p => p.store === 'fantech' && p.is_active).length },
  ].filter(s => s.value > 0)

  return (
    <div className="space-y-5 pb-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between bg-white p-3 rounded-sm shadow-sm border border-slate-200 flex-wrap gap-3">
        <h1 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <BarChart2 size={16} className="text-blue-500" /> Dashboard · Métricas
        </h1>
        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex rounded-sm border border-slate-200 overflow-hidden">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.days}
                onClick={() => setPeriodDays(opt.days)}
                className={`px-2.5 py-1 text-[10px] font-bold transition-colors ${periodDays === opt.days ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={fetchEvents} disabled={loadingEvents} className="p-1.5 rounded-sm border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors disabled:opacity-40">
            <RefreshCw size={12} className={loadingEvents ? 'animate-spin' : ''} />
          </button>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 uppercase rounded-sm border border-slate-200 tracking-widest">{globalStore}</span>
        </div>
      </div>

      {/* ── Period KPI Cards ── */}
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Período: {PERIOD_OPTIONS.find(o=>o.days===periodDays)?.label}</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <MetricCard label="Vistas" value={periodViews} icon={Eye} color="#3b82f6" sub="en el período" />
          <MetricCard label="Carrito" value={periodCartAdds} icon={ShoppingCart} color="#8b5cf6" sub="(add + WA directo)" />
          <MetricCard label="WA Checkout" value={periodWA} icon={MessageCircle} color="#10b981" />
          <MetricCard label="ML Clicks" value={periodMeli} icon={ExternalLink} color="#f59e0b" />
          <MetricCard label="Conv. Carrito" value={`${cartConvRate}%`} icon={TrendingUp} color="#ec4899" sub="vista→carrito" />
          <MetricCard label="Conv. WhatsApp" value={`${waConvRate}%`} icon={MessageCircle} color="#06b6d4" sub="vista→WA" />
        </div>
      </div>

      {/* ── All-time KPI Cards ── */}
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Totales Acumulados</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <MetricCard label="Productos Activos" value={activeProducts} icon={PackageCheck} color="#3b82f6" sub={`de ${products.length} totales`} />
          <MetricCard label="Vistas Totales" value={totalViews} icon={Eye} color="#8b5cf6" />
          <MetricCard label="WhatsApp Total" value={totalWhatsapp} icon={MessageCircle} color="#10b981" />
          <MetricCard label="Carrito Total" value={totalCart} icon={ShoppingCart} color="#ec4899" />
          <MetricCard label="Stock Crítico" value={lowStock} icon={AlertTriangle} color={lowStock > 0 ? '#ef4444' : '#94a3b8'} sub="≤ 3 unidades" />
        </div>
      </div>

      {/* ── Time-series Line Chart ── */}
      <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-4">
        <h3 className="text-xs font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Calendar size={13} className="text-blue-500" /> Eventos por día — {PERIOD_OPTIONS.find(o=>o.days===periodDays)?.label}
        </h3>
        {timeSeriesData.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2 text-slate-400">
            <BarChart2 size={28} />
            <p className="text-xs font-medium">Sin eventos en este período todavía.</p>
            <p className="text-[10px]">Los eventos se registran cuando los usuarios visitan productos y realizan acciones.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timeSeriesData} margin={{ left: 0, right: 16, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="view" name="Vistas" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="cart_add" name="Carrito" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="whatsapp_checkout" name="WA Directo" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="meli_click" name="MercadoLibre" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Funnel + Top Products ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* Conversion funnel */}
        <div className="xl:col-span-2 bg-white rounded-sm shadow-sm border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp size={13} className="text-purple-500" /> Embudo de Conversión
          </h3>
          <div className="space-y-2 mt-2">
            {funnelData.map((step, i) => {
              const pct = funnelData[0].value > 0 ? (step.value / funnelData[0].value) * 100 : 0
              return (
                <div key={step.name}>
                  <div className="flex justify-between text-[10px] text-slate-600 mb-0.5">
                    <span className="font-semibold">{step.name}</span>
                    <span className="font-bold" style={{ color: step.fill }}>{step.value.toLocaleString('es-AR')} {i > 0 && <span className="text-slate-400">({pct.toFixed(1)}%)</span>}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(pct, 1)}%`, background: step.fill }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top 10 by views */}
        <div className="xl:col-span-3 bg-white rounded-sm shadow-sm border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Eye size={13} className="text-purple-500" /> Top Productos — Vistas Totales
          </h3>
          {topByViews.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Sin datos.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topByViews} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={125} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="vistas" name="Vistas" radius={[0, 3, 3, 0]} barSize={13}>
                  {topByViews.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Category views + Store pie ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 bg-white rounded-sm shadow-sm border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <BarChart2 size={13} className="text-blue-500" /> Vistas por Categoría (totales)
          </h3>
          {catBreakdown.length === 0 ? <p className="text-xs text-slate-400 text-center py-8">Sin datos.</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={catBreakdown} margin={{ left: 0, right: 8, top: 0, bottom: 40 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="vistas" name="Vistas" radius={[3, 3, 0, 0]} barSize={22}>
                  {catBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="xl:col-span-2 bg-white rounded-sm shadow-sm border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Store size={13} className="text-orange-500" /> Productos por Tienda
          </h3>
          {storeBreakdown.length === 0 ? <p className="text-xs text-slate-400 text-center py-8">Sin datos.</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={storeBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {storeBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Low Stock Table ── */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-sm shadow-sm border border-slate-200 border-t-2 border-t-red-500 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500" />
            <h3 className="text-xs font-bold text-slate-700">Stock Crítico (≤ 3 unidades)</h3>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-2 text-left">Producto</th>
                <th className="px-4 py-2 text-left">Cat.</th>
                <th className="px-4 py-2 text-center">Stock</th>
                <th className="px-4 py-2 text-center">Vistas</th>
                <th className="px-4 py-2 text-center">WA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowStockProducts.map(p => (
                <tr key={p.id} className="hover:bg-red-50/40 transition-colors">
                  <td className="px-4 py-2 font-medium text-slate-800 max-w-[180px] truncate">{p.title}</td>
                  <td className="px-4 py-2 text-slate-400">{p.categories?.name || '—'}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`font-bold px-2 py-0.5 rounded-sm ${(p.stock??0) === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{p.stock ?? 0}</span>
                  </td>
                  <td className="px-4 py-2 text-center text-slate-500">{(p.views_count||0).toLocaleString('es-AR')}</td>
                  <td className="px-4 py-2 text-center text-slate-500">{p.whatsapp_clicks||0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}

AdminDashboard.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>
}
