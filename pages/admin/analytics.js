import AdminLayout, { useAdmin } from '@/components/admin/AdminLayout'
import { supabase } from '@/utils/supabase'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  Eye, MessageCircle, ShoppingCart, ExternalLink, TrendingUp,
  RefreshCw, Calendar, Package, Tag, SlidersHorizontal,
  Search, ChevronDown, X, ArrowUpDown, FlaskConical, Layers
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend, LineChart, Line, CartesianGrid
} from 'recharts'

export async function getServerSideProps() {
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('id,title,store,category_id,stock,is_active,views_count,whatsapp_clicks,meli_clicks,added_to_cart_count,has_promo,promo_price,has_variants,is_imported,categories(name)')
      .order('views_count', { ascending: false }),
    supabase.from('categories').select('id,name,store,views_count').order('name'),
  ])
  return { props: { allProducts: products || [], allCategories: categories || [] } }
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#ec4899', '#06b6d4', '#f59e0b', '#84cc16']

const PERIOD_OPTIONS = [
  { label: '7 días', value: 7 },
  { label: '30 días', value: 30 },
  { label: '90 días', value: 90 },
  { label: 'All-time', value: null },
  { label: 'Desde fecha', value: 'custom' },
]

function groupByDay(events) {
  const m = {}
  events.forEach(ev => {
    const d = new Date(ev.created_at)
    const k = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
    if (!m[k]) m[k] = { date: k, view: 0, cart_add: 0, whatsapp_checkout: 0, meli_click: 0 }
    m[k][ev.event_type] = (m[k][ev.event_type] || 0) + 1
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
        <p key={i} style={{ color: p.color }}>{p.name}: <b>{p.value?.toLocaleString('es-AR')}</b></p>
      ))}
    </div>
  )
}

function KPI({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white p-3.5 rounded-sm shadow-sm border border-slate-200 border-t-2" style={{ borderTopColor: color }}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} style={{ color }} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <div className="text-xl font-extrabold text-slate-800">{value}</div>
      {sub && <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
  )
}

function MultiSelect({ options, selected, onChange, placeholder }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef()

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const sel = new Set(selected)
  const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase())).slice(0, 60)

  const toggle = id => {
    const s = new Set(sel)
    s.has(id) ? s.delete(id) : s.add(id)
    onChange([...s])
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-sm text-xs min-w-[190px] shadow-sm hover:border-blue-300 transition-colors"
      >
        <span className="flex-1 text-left truncate text-slate-500">
          {selected.length === 0
            ? placeholder
            : <span className="text-slate-700">{selected.length} seleccionado{selected.length > 1 ? 's' : ''}</span>
          }
        </span>
        {selected.length > 0 && (
          <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{selected.length}</span>
        )}
        <ChevronDown size={11} className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-slate-200 rounded-sm shadow-2xl z-50">
          <div className="p-2 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50 rounded-t-sm">
            <Search size={11} className="text-slate-400 shrink-0" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)}
              placeholder="Buscar..." className="flex-1 bg-transparent text-xs outline-none text-slate-700 placeholder-slate-400" />
            {q && <button onClick={() => setQ('')}><X size={10} className="text-slate-400 hover:text-slate-600" /></button>}
          </div>

          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0
              ? <p className="text-xs text-slate-400 text-center py-5">Sin resultados</p>
              : filtered.map(opt => (
                <button key={opt.id} onClick={() => toggle(opt.id)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors ${sel.has(opt.id) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${sel.has(opt.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                    {sel.has(opt.id) && <span className="text-white text-[8px] font-bold leading-none">✓</span>}
                  </div>
                  <span className="truncate flex-1 font-medium">{opt.label}</span>
                  {opt.sub && <span className="text-[10px] text-slate-400 shrink-0">{opt.sub}</span>}
                </button>
              ))
            }
          </div>

          <div className="p-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">{options.filter(o => o.label.toLowerCase().includes(q.toLowerCase())).length} resultados</span>
            {selected.length > 0 && (
              <button onClick={() => { onChange([]); setOpen(false) }} className="text-[10px] text-red-400 hover:text-red-600 font-medium">
                Limpiar todo
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Funnel({ data }) {
  const base = data[0]?.value || 0
  if (!base) return <p className="text-xs text-slate-400 text-center py-8">Sin datos en el período</p>
  return (
    <div className="space-y-3 mt-1">
      {data.map((step, i) => {
        const pct = base > 0 ? (step.value / base) * 100 : 0
        return (
          <div key={step.name}>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="font-semibold text-slate-600">{step.name}</span>
              <span className="font-bold" style={{ color: step.fill }}>
                {step.value.toLocaleString('es-AR')}
                {i > 0 && <span className="text-slate-400 font-normal ml-1">({pct.toFixed(1)}%)</span>}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 0.5)}%`, background: step.fill }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function AnalyticsSandbox({ allProducts, allCategories }) {
  const { globalStore } = useAdmin()

  const [mode, setMode] = useState('product')
  const [selectedIds, setSelectedIds] = useState([])
  const [period, setPeriod] = useState(7)
  const [customDate, setCustomDate] = useState('')
  const [viewMode, setViewMode] = useState('compare')
  const [sortCol, setSortCol] = useState('views')
  const [sortAsc, setSortAsc] = useState(false)
  const [events, setEvents] = useState([])
  const [variantsData, setVariantsData] = useState([])
  const [loading, setLoading] = useState(false)

  const products = useMemo(() => allProducts.filter(p => !globalStore || p.store === globalStore), [allProducts, globalStore])
  const cats = useMemo(() => allCategories.filter(c => !globalStore || c.store === globalStore), [allCategories, globalStore])

  const productOptions = useMemo(() => products.map(p => ({
    id: p.id, label: p.title, sub: p.categories?.name || '—'
  })), [products])

  const categoryOptions = useMemo(() => cats.map(c => ({
    id: c.id, label: c.name,
    sub: `${products.filter(p => p.category_id === c.id).length} prod.`
  })), [cats, products])

  useEffect(() => setSelectedIds([]), [mode, globalStore])

  const sinceDate = useMemo(() => {
    if (period === null) return null
    if (period === 'custom') return customDate ? new Date(customDate).toISOString() : null
    const d = new Date(); d.setDate(d.getDate() - period); return d.toISOString()
  }, [period, customDate])

  const fetchEvents = useCallback(async () => {
    if (selectedIds.length === 0) { setEvents([]); return }
    setLoading(true)
    let entityIds = selectedIds
    if (mode === 'category') {
      entityIds = products.filter(p => selectedIds.includes(p.category_id)).map(p => p.id)
    }
    if (!entityIds.length) { setEvents([]); setLoading(false); return }

    let q = supabase.from('analytics_events')
      .select('id,event_type,entity_id,variant_id,created_at')
      .eq('entity_type', 'product')
      .in('entity_id', entityIds)
      .order('created_at', { ascending: true })
    if (sinceDate) q = q.gte('created_at', sinceDate)

    const { data: evData } = await q
    setEvents(evData || [])

    // Fetch variant labels for context
    if (mode === 'product' && selectedIds.length > 0) {
      const { data: vData } = await supabase.from('product_variants')
        .select('id,product_id,label,views_count,added_to_cart_count,whatsapp_clicks,meli_clicks')
        .in('product_id', entityIds)
      setVariantsData(vData || [])
    } else {
      setVariantsData([])
    }

    setLoading(false)
  }, [selectedIds, sinceDate, mode, products])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  const activeProds = useMemo(() => {
    if (mode === 'product') return products.filter(p => selectedIds.includes(p.id))
    return products.filter(p => selectedIds.includes(p.category_id))
  }, [mode, products, selectedIds])

  // All-time from product fields
  const totalViews = activeProds.reduce((s, p) => s + (p.views_count || 0), 0)
  const totalWA    = activeProds.reduce((s, p) => s + (p.whatsapp_clicks || 0), 0)
  const totalML    = activeProds.reduce((s, p) => s + (p.meli_clicks || 0), 0)
  const totalCart  = activeProds.reduce((s, p) => s + (p.added_to_cart_count || 0), 0)

  // Period from events
  const periodViews = events.filter(e => e.event_type === 'view').length
  const periodWA    = events.filter(e => e.event_type === 'whatsapp_checkout').length
  const periodML    = events.filter(e => e.event_type === 'meli_click').length
  const periodCart  = events.filter(e => ['cart_add','whatsapp_checkout'].includes(e.event_type)).length

  const convWA   = periodViews > 0 ? `${((periodWA / periodViews) * 100).toFixed(1)}%` : '—'
  const convCart = periodViews > 0 ? `${((periodCart / periodViews) * 100).toFixed(1)}%` : '—'

  const timeSeriesData = useMemo(() => groupByDay(events), [events])

  const donutData = useMemo(() => ([
    { name: 'Vistas', value: periodViews, fill: '#3b82f6' },
    { name: 'Carrito', value: Math.max(0, periodCart - periodWA), fill: '#8b5cf6' },
    { name: 'WA Directo', value: periodWA, fill: '#10b981' },
    { name: 'ML Click', value: periodML, fill: '#f59e0b' },
  ].filter(d => d.value > 0)), [periodViews, periodCart, periodWA, periodML])

  const isAllTime = period === null
  const funnelData = [
    { name: 'Vistas',        value: isAllTime ? totalViews : periodViews, fill: '#3b82f6' },
    { name: 'Carrito',       value: isAllTime ? totalCart  : periodCart,  fill: '#8b5cf6' },
    { name: 'WhatsApp',      value: isAllTime ? totalWA    : periodWA,    fill: '#10b981' },
    { name: 'MercadoLibre',  value: isAllTime ? totalML    : periodML,    fill: '#f59e0b' },
  ]

  // Compare table rows (all-time product fields)
  const compareRows = useMemo(() => activeProds.map(p => ({
    id: p.id,
    title: p.title,
    cat: p.categories?.name || '—',
    views: p.views_count || 0,
    wa: p.whatsapp_clicks || 0,
    ml: p.meli_clicks || 0,
    cart: p.added_to_cart_count || 0,
    stock: p.stock ?? 0,
    convWA: p.views_count > 0 ? ((p.whatsapp_clicks / p.views_count) * 100).toFixed(1) : '0.0',
    convCart: p.views_count > 0 ? ((p.added_to_cart_count / p.views_count) * 100).toFixed(1) : '0.0',
    hasPromo: p.has_promo, hasVariants: p.has_variants, isImported: p.is_imported,
  })).sort((a, b) => {
    const av = a[sortCol]; const bv = b[sortCol]
    const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv
    return sortAsc ? cmp : -cmp
  }), [activeProds, sortCol, sortAsc])

  const best = useMemo(() => {
    const cols = ['views','wa','ml','cart']
    const result = {}
    cols.forEach(c => { result[c] = Math.max(...compareRows.map(r => r[c]), 0) })
    result.convWA   = Math.max(...compareRows.map(r => parseFloat(r.convWA)), 0)
    result.convCart = Math.max(...compareRows.map(r => parseFloat(r.convCart)), 0)
    return result
  }, [compareRows])

  const periodLabel = period === null ? 'All-time' : period === 'custom' ? `Desde ${customDate || '—'}` : `Últimos ${period} días`
  const hasSelection = selectedIds.length > 0
  const isMulti = activeProds.length > 1
  const selItems = mode === 'product' ? activeProds : cats.filter(c => selectedIds.includes(c.id))

  const sortToggle = col => { if (sortCol === col) setSortAsc(!sortAsc); else { setSortCol(col); setSortAsc(false) } }

  return (
    <div className="space-y-4 pb-8">

      {/* ── Controls ── */}
      <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-3">
        <div className="flex flex-wrap items-center gap-2">

          {/* Header label */}
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-1">
            <FlaskConical size={14} className="text-violet-500" /> Sandbox
          </span>

          {/* Mode */}
          <div className="flex rounded-sm border border-slate-200 overflow-hidden">
            {[{label:'Productos', value:'product', Icon: Package},{label:'Categorías', value:'category', Icon: Tag}].map(m => (
              <button key={m.value} onClick={() => setMode(m.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold transition-colors ${mode === m.value ? 'bg-violet-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                <m.Icon size={11} />{m.label}
              </button>
            ))}
          </div>

          {/* Period */}
          <div className="flex items-center gap-1">
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
          </div>

          {/* Multiselect */}
          <MultiSelect
            options={mode === 'product' ? productOptions : categoryOptions}
            selected={selectedIds}
            onChange={setSelectedIds}
            placeholder={mode === 'product' ? 'Seleccionar productos…' : 'Seleccionar categorías…'}
          />

          {/* View mode toggle */}
          {isMulti && mode === 'product' && (
            <div className="flex rounded-sm border border-slate-200 overflow-hidden">
              {[{label:'Comparar', v:'compare'},{label:'Agrupar', v:'group'}].map(m => (
                <button key={m.v} onClick={() => setViewMode(m.v)}
                  className={`px-2.5 py-1.5 text-[10px] font-bold transition-colors ${viewMode === m.v ? 'bg-purple-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                  {m.label}
                </button>
              ))}
            </div>
          )}

          <button onClick={fetchEvents} disabled={loading || !hasSelection}
            className="p-1.5 border border-slate-200 rounded-sm bg-white text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-40 transition-colors ml-auto">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Selected chips */}
        {hasSelection && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-medium">Seleccionado:</span>
            {selItems.slice(0, 5).map(item => (
              <span key={item.id} className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 text-[10px] font-medium px-2 py-0.5 rounded-full border border-violet-100">
                {item.title || item.name}
                <button onClick={() => setSelectedIds(p => p.filter(id => id !== item.id))}><X size={9} /></button>
              </span>
            ))}
            {selectedIds.length > 5 && <span className="text-[10px] text-slate-400">+{selectedIds.length - 5} más</span>}
          </div>
        )}
      </div>

      {/* ── Empty state ── */}
      {!hasSelection && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
          <SlidersHorizontal size={40} strokeWidth={1.2} />
          <p className="text-sm font-semibold text-slate-500">Analytics Sandbox</p>
          <p className="text-xs text-center max-w-xs text-slate-400">
            Seleccioná uno o más {mode === 'product' ? 'productos' : 'categorías'} para ver métricas detalladas, gráficos y comparaciones.
          </p>
        </div>
      )}

      {hasSelection && (
        <>
          {/* ── Period KPIs ── */}
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar size={11} /> {periodLabel}
              {loading && <RefreshCw size={10} className="animate-spin ml-1 text-blue-400" />}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              <KPI label="Vistas" value={isAllTime ? totalViews.toLocaleString('es-AR') : periodViews.toLocaleString('es-AR')} icon={Eye} color="#3b82f6" sub={isAllTime ? 'all-time' : 'en el período'} />
              <KPI label="Carrito" value={isAllTime ? totalCart.toLocaleString('es-AR') : periodCart.toLocaleString('es-AR')} icon={ShoppingCart} color="#8b5cf6" sub="add + WA directo" />
              <KPI label="WA Checkout" value={isAllTime ? totalWA.toLocaleString('es-AR') : periodWA.toLocaleString('es-AR')} icon={MessageCircle} color="#10b981" />
              <KPI label="ML Clicks" value={isAllTime ? totalML.toLocaleString('es-AR') : periodML.toLocaleString('es-AR')} icon={ExternalLink} color="#f97316" />
              <KPI label="Conv. WA" value={isAllTime ? (totalViews > 0 ? `${((totalWA/totalViews)*100).toFixed(1)}%` : '—') : convWA} icon={TrendingUp} color="#ec4899" sub="vista→WA" />
              <KPI label="Conv. Carrito" value={isAllTime ? (totalViews > 0 ? `${((totalCart/totalViews)*100).toFixed(1)}%` : '—') : convCart} icon={TrendingUp} color="#06b6d4" sub="vista→carrito" />
            </div>
          </div>

          {/* ── Line chart ── */}
          {!isAllTime && (
            <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-4">
              <h3 className="text-xs font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Calendar size={13} className="text-blue-500" /> Eventos por día — {periodLabel}
              </h3>
              {timeSeriesData.length === 0
                ? <p className="text-xs text-slate-400 text-center py-10">Sin eventos registrados en este período.</p>
                : (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={timeSeriesData} margin={{ left: 0, right: 12, top: 4, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={<Tip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="view" name="Vistas" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="cart_add" name="Carrito" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="whatsapp_checkout" name="WA" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="meli_click" name="ML" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )
              }
            </div>
          )}

          {/* ── Donut + Funnel ── */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-4">
              <h3 className="text-xs font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">Distribución de eventos</h3>
              {donutData.length === 0
                ? <p className="text-xs text-slate-400 text-center py-8">Sin eventos en este período</p>
                : (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={donutData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                        outerRadius={70} innerRadius={36} paddingAngle={3}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}>
                        {donutData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                      </Pie>
                      <Tooltip content={<Tip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )
              }
            </div>
            <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-4">
              <h3 className="text-xs font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">
                Embudo — {isAllTime ? 'All-time (contadores)' : periodLabel}
              </h3>
              <Funnel data={funnelData} />
            </div>
          </div>

          {/* ── Comparison table (multi-product, compare mode) ── */}
          {isMulti && (viewMode === 'compare' || mode === 'category') && (
            <div className="bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
                <ArrowUpDown size={13} className="text-violet-500" />
                <h3 className="text-xs font-bold text-slate-700">Tabla Comparativa — Totales All-time</h3>
                <span className="text-[10px] text-slate-400 ml-auto">Click en columna para ordenar · <span className="text-green-600 font-medium">verde = mejor</span></span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-2 text-left">Producto</th>
                      <th className="px-4 py-2 text-left">Cat.</th>
                      {[
                        {key:'views', label:'Vistas'},
                        {key:'wa', label:'WA'},
                        {key:'ml', label:'ML'},
                        {key:'cart', label:'Carrito'},
                        {key:'convWA', label:'Conv.WA%'},
                        {key:'convCart', label:'Conv.Cart%'},
                        {key:'stock', label:'Stock'},
                      ].map(col => (
                        <th key={col.key} className="px-4 py-2 text-center cursor-pointer hover:text-blue-600 transition-colors select-none"
                          onClick={() => sortToggle(col.key)}>
                          {col.label} {sortCol === col.key ? (sortAsc ? '↑' : '↓') : ''}
                        </th>
                      ))}
                      <th className="px-4 py-2 text-center">Tipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {compareRows.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-slate-800 max-w-[160px] truncate">{row.title}</td>
                        <td className="px-4 py-2.5 text-slate-400">{row.cat}</td>
                        {[
                          {key:'views', val: row.views.toLocaleString('es-AR'), raw: row.views, best: best.views},
                          {key:'wa',    val: row.wa.toLocaleString('es-AR'),    raw: row.wa,    best: best.wa},
                          {key:'ml',    val: row.ml.toLocaleString('es-AR'),    raw: row.ml,    best: best.ml},
                          {key:'cart',  val: row.cart.toLocaleString('es-AR'),  raw: row.cart,  best: best.cart},
                          {key:'convWA',   val: `${row.convWA}%`,   raw: parseFloat(row.convWA),   best: best.convWA},
                          {key:'convCart', val: `${row.convCart}%`, raw: parseFloat(row.convCart), best: best.convCart},
                          {key:'stock', val: row.stock, raw: row.stock, best: null },
                        ].map(c => (
                          <td key={c.key} className={`px-4 py-2.5 text-center font-semibold ${c.best !== null && c.raw === c.best && c.best > 0 ? 'bg-green-50 text-green-700' : 'text-slate-600'}`}>
                            {c.key === 'stock'
                              ? <span className={`px-2 py-0.5 rounded-sm font-bold ${row.stock <= 0 ? 'bg-red-100 text-red-700' : row.stock <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{row.stock}</span>
                              : c.val
                            }
                          </td>
                        ))}
                        <td className="px-4 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            {row.hasVariants  && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">VAR</span>}
                            {row.isImported   && <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">IMP</span>}
                            {row.hasPromo     && <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">PROMO</span>}
                            {!row.hasVariants && !row.isImported && !row.hasPromo && <span className="text-[9px] text-slate-400">—</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Grouped bar (group mode or 1 product) ── */}
          {(viewMode === 'group' || !isMulti) && activeProds.length > 0 && (
            <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-4">
              <h3 className="text-xs font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">
                Métricas comparadas — {activeProds.length > 1 ? 'Agrupadas' : activeProds[0]?.title}
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={compareRows.slice(0, 15).map(r => ({
                    name: r.title.length > 18 ? r.title.substring(0, 18) + '…' : r.title,
                    Vistas: r.views, WA: r.wa, Carrito: r.cart
                  }))}
                  layout="vertical"
                  margin={{ left: 8, right: 16, top: 0, bottom: 0 }}
                >
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={130} axisLine={false} tickLine={false} />
                  <Tooltip content={<Tip />} cursor={{ fill: '#f8fafc' }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Vistas" fill="#3b82f6" radius={[0,3,3,0]} barSize={8} />
                  <Bar dataKey="WA"     fill="#10b981" radius={[0,3,3,0]} barSize={8} />
                  <Bar dataKey="Carrito" fill="#8b5cf6" radius={[0,3,3,0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── Variants Breakdown ── */}
          {mode === 'product' && selectedIds.length === 1 && variantsData.length > 0 && (
            <div className="bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
                <Layers size={13} className="text-purple-500" />
                <h3 className="text-xs font-bold text-slate-700">Desglose por Variante — {activeProds[0]?.title}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-4 py-2 text-left">Variante</th>
                      <th className="px-4 py-2 text-center">Vistas (Período)</th>
                      <th className="px-4 py-2 text-center">Carrito (Período)</th>
                      <th className="px-4 py-2 text-center">WA (Período)</th>
                      <th className="px-4 py-2 text-center border-l bg-blue-50/30">Vistas (Total)</th>
                      <th className="px-4 py-2 text-center bg-violet-50/30">Carrito (Total)</th>
                      <th className="px-4 py-2 text-center bg-emerald-50/30">WA (Total)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variantsData.map(v => {
                      const vEvents = events.filter(e => e.variant_id === v.id)
                      const pViews = vEvents.filter(e => e.event_type === 'view').length
                      const pWA    = vEvents.filter(e => e.event_type === 'whatsapp_checkout').length
                      const pCart  = vEvents.filter(e => ['cart_add','whatsapp_checkout'].includes(e.event_type)).length
                      
                      return (
                        <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2 border-r border-slate-100 font-bold text-slate-700">{v.label}</td>
                          <td className="px-4 py-2 text-center font-medium text-blue-600">{pViews.toLocaleString('es-AR')}</td>
                          <td className="px-4 py-2 text-center font-medium text-violet-600">{pCart.toLocaleString('es-AR')}</td>
                          <td className="px-4 py-2 text-center font-medium text-emerald-600">{pWA.toLocaleString('es-AR')}</td>
                          
                          <td className="px-4 py-2 text-center border-l bg-blue-50/20 text-blue-900">{v.views_count?.toLocaleString('es-AR') || 0}</td>
                          <td className="px-4 py-2 text-center bg-violet-50/20 text-violet-900">{v.added_to_cart_count?.toLocaleString('es-AR') || 0}</td>
                          <td className="px-4 py-2 text-center bg-emerald-50/20 text-emerald-900">{v.whatsapp_clicks?.toLocaleString('es-AR') || 0}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

AnalyticsSandbox.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>
}
