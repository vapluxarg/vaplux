import AdminLayout, { useAdmin } from '@/components/admin/AdminLayout'
import { supabase } from '@/utils/supabase'
import { useState, useEffect, useCallback } from 'react'
import { useCurrency } from '@/context/CurrencyContext'
import {
  Percent, DollarSign, Plus, Trash2, Power, PowerOff,
  RefreshCw, Tag, Clock, Hash, AlertCircle, CheckCircle2,
  ChevronDown, ChevronUp, Sparkles, Info
} from 'lucide-react'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_LABELS = {
  percentage: 'Porcentaje',
  fixed_ars:  'Fijo ARS',
  fixed_usd:  'Fijo USD',
}

const TYPE_ICONS = {
  percentage: Percent,
  fixed_ars:  DollarSign,
  fixed_usd:  DollarSign,
}

const TYPE_COLORS = {
  percentage: 'bg-violet-100 text-violet-700',
  fixed_ars:  'bg-sky-100 text-sky-700',
  fixed_usd:  'bg-emerald-100 text-emerald-700',
}

function formatExpiry(date) {
  if (!date) return null
  return new Date(date).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function isExpired(date) {
  if (!date) return false
  return new Date(date) < new Date()
}

function StatusBadge({ code }) {
  const expired   = isExpired(code.expires_at)
  const exhausted = code.max_uses !== null && code.uses_count >= code.max_uses
  if (!code.is_active) return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wide">Inactivo</span>
  if (expired)         return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wide">Vencido</span>
  if (exhausted)       return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">Sin usos</span>
  return                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">Activo ✓</span>
}

function formatDiscount(code) {
  if (code.type === 'percentage') {
    let s = `${code.value}%`
    if (code.cap_ars) s += ` (tope $${Number(code.cap_ars).toLocaleString('es-AR')})`
    if (code.cap_usd) s += ` / U$D ${Number(code.cap_usd)}`
    return s
  }
  if (code.type === 'fixed_ars') return `$${Number(code.value).toLocaleString('es-AR')}`
  if (code.type === 'fixed_usd') return `U$D ${Number(code.value)}`
  return code.value
}

// ─── Form field wrapper ───────────────────────────────────────────────────────

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {label}
        {hint && <span className="ml-1 font-normal normal-case text-slate-400">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

// ─── New Code Form ────────────────────────────────────────────────────────────

function NewCodeForm({ store, dolarBlue, onSaved, onCancel }) {
  const [form, setForm] = useState({
    code: '', store, type: 'percentage', value: '',
    cap_ars: '', cap_usd: '', expires_at: '', max_uses: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  const handleCapArsChange = (val) => {
    set('cap_ars', val)
    if (val && dolarBlue) set('cap_usd', (parseFloat(val) / dolarBlue).toFixed(2) || '')
  }
  const handleCapUsdChange = (val) => {
    set('cap_usd', val)
    if (val && dolarBlue) set('cap_ars', (parseFloat(val) * dolarBlue).toFixed(0) || '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.code.trim()) return setError('El código no puede estar vacío.')
    if (!form.value || isNaN(parseFloat(form.value))) return setError('Ingresá un valor válido.')
    setSaving(true)
    const payload = {
      code:       form.code.trim().toUpperCase(),
      store:      form.store,
      type:       form.type,
      value:      parseFloat(form.value),
      cap_ars:    form.cap_ars ? parseFloat(form.cap_ars) : null,
      cap_usd:    form.cap_usd ? parseFloat(form.cap_usd) : null,
      expires_at: form.expires_at || null,
      max_uses:   form.max_uses ? parseInt(form.max_uses, 10) : null,
    }
    const { error: err } = await supabase.from('discount_codes').insert([payload])
    setSaving(false)
    if (err) return setError(err.message)
    onSaved()
  }

  const isPercentage = form.type === 'percentage'

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-blue-200 rounded-sm shadow-md overflow-hidden">
      {/* Form header */}
      <div className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <Sparkles size={14} />
        <span className="text-sm font-bold">Nuevo Código de Descuento</span>
        <span className="ml-auto text-[10px] font-medium bg-white/20 px-2 py-0.5 rounded uppercase tracking-widest">{store}</span>
      </div>

      <div className="p-5 space-y-5">
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 text-xs">
            <AlertCircle size={13} className="shrink-0" /> {error}
          </div>
        )}

        {/* Row 1: Code + Store + Type + Value */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center font-black">1</span>
            Configuración principal
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Código">
              <input
                value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())}
                placeholder="Ej: VERANO10"
                className="admin-input font-mono tracking-widest text-blue-700 font-bold placeholder:font-normal placeholder:text-slate-400 placeholder:tracking-normal"
                required
              />
            </Field>
            <Field label="Tienda">
              <select value={form.store} onChange={e => set('store', e.target.value)} className="admin-input">
                <option value="vaplux">Vaplux</option>
                <option value="fantech">Fantech</option>
              </select>
            </Field>
            <Field label="Tipo de descuento">
              <select value={form.type} onChange={e => set('type', e.target.value)} className="admin-input">
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed_ars">Fijo en ARS ($)</option>
                <option value="fixed_usd">Fijo en USD (U$D)</option>
              </select>
            </Field>
            <Field label={`Valor ${isPercentage ? '(%)' : form.type === 'fixed_ars' ? '(ARS $)' : '(USD U$D)'}`}>
              <input
                type="number" min="0" step="any" required
                value={form.value}
                onChange={e => set('value', e.target.value)}
                placeholder={isPercentage ? '10' : '2000'}
                className="admin-input font-bold"
              />
            </Field>
          </div>
        </div>

        {/* Caps — solo porcentaje */}
        {isPercentage && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] flex items-center justify-center font-black">2</span>
              Tope máximo de descuento
              <span className="text-slate-400 font-normal ml-1 normal-case">(opcional)</span>
              <span title="Si el descuento calculado supera este tope, se aplica el tope">
                <Info size={11} className="text-slate-400 cursor-help" />
              </span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-violet-50 border border-violet-100 rounded p-3">
              <Field label="Tope en ARS ($)">
                <div className="relative">
                  <input
                    type="number" min="0" step="any"
                    value={form.cap_ars}
                    onChange={e => handleCapArsChange(e.target.value)}
                    placeholder="Ej: 5000"
                    className="admin-input pr-20"
                  />
                  {form.cap_ars && dolarBlue && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-violet-500 font-medium">
                      ≈ U$D {(parseFloat(form.cap_ars) / dolarBlue).toFixed(2)}
                    </span>
                  )}
                </div>
              </Field>
              <Field label="Tope en USD (U$D)">
                <div className="relative">
                  <input
                    type="number" min="0" step="any"
                    value={form.cap_usd}
                    onChange={e => handleCapUsdChange(e.target.value)}
                    placeholder="Ej: 5"
                    className="admin-input pr-24"
                  />
                  {form.cap_usd && dolarBlue && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-violet-500 font-medium">
                      ≈ ${(parseFloat(form.cap_usd) * dolarBlue).toLocaleString('es-AR')}
                    </span>
                  )}
                </div>
              </Field>
            </div>
          </div>
        )}

        {/* Vencimiento + usos */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5 flex items-center gap-1.5">
            <span className={`w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center font-black ${isPercentage ? 'bg-slate-500' : 'bg-violet-500'}`}>
              {isPercentage ? '3' : '2'}
            </span>
            Límites
            <span className="text-slate-400 font-normal ml-1 normal-case">(opcionales)</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Vence el" hint="— dejar vacío para sin vencimiento">
              <div className="relative">
                <Clock size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={e => set('expires_at', e.target.value)}
                  className="admin-input pl-6"
                />
              </div>
            </Field>
            <Field label="Máx. usos" hint="— dejar vacío para ilimitado">
              <div className="relative">
                <Hash size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="number" min="1" step="1"
                  value={form.max_uses}
                  onChange={e => set('max_uses', e.target.value)}
                  placeholder="Ilimitado"
                  className="admin-input pl-6"
                />
              </div>
            </Field>
          </div>
        </div>

        {/* Preview chip */}
        {form.code && form.value && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded px-3 py-2">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            <span className="text-[11px] text-slate-500">Vista previa:</span>
            <code className="text-[11px] font-bold font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">{form.code || 'CODIGO'}</code>
            <span className="text-[11px] text-slate-500">→</span>
            <span className="text-[11px] font-bold text-emerald-600">
              {isPercentage ? `${form.value}% OFF` : form.type === 'fixed_ars' ? `-$${form.value}` : `-U$D ${form.value}`}
            </span>
            {form.expires_at && <span className="text-[10px] text-slate-400 ml-auto">Vence: {new Date(form.expires_at).toLocaleDateString('es-AR')}</span>}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
          <button
            type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded transition-colors disabled:opacity-50 shadow-sm"
          >
            {saving ? <RefreshCw size={13} className="animate-spin" /> : <Plus size={13} />}
            {saving ? 'Guardando...' : 'Crear Código'}
          </button>
          <button type="button" onClick={onCancel}
            className="px-4 py-2 text-slate-500 hover:text-slate-700 text-xs font-medium rounded transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </form>
  )
}

// ─── Uses inline sub-table ────────────────────────────────────────────────────

function UsesRow({ code }) {
  const [open, setOpen]       = useState(false)
  const [uses, setUses]       = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (open) { setOpen(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('discount_code_uses').select('*')
      .eq('discount_code_id', code.id)
      .order('created_at', { ascending: false }).limit(50)
    setUses(data || [])
    setLoading(false)
    setOpen(true)
  }

  return (
    <>
      <button onClick={load} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-semibold transition-colors">
        {code.uses_count}
        {loading ? <RefreshCw size={11} className="animate-spin" /> : open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>
      {open && uses.length > 0 && (
        <tr className="bg-blue-50/50 border-t border-blue-100">
          <td colSpan={7} className="px-4 pb-3 pt-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Últimos usos — {code.code}</p>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-blue-100">
                  <th className="pb-1 pr-4">Fecha</th>
                  <th className="pb-1 pr-4">Moneda</th>
                  <th className="pb-1 pr-4">Descuento</th>
                  <th className="pb-1 pr-4">Antes</th>
                  <th className="pb-1">Después</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100/50">
                {uses.map(u => (
                  <tr key={u.id} className="text-slate-600">
                    <td className="py-1 pr-4 text-slate-400">{new Date(u.created_at).toLocaleString('es-AR')}</td>
                    <td className="py-1 pr-4">{u.currency || '—'}</td>
                    <td className="py-1 pr-4 font-semibold text-emerald-700">
                      -{u.currency === 'USD' ? 'U$D ' : '$'}{Number(u.discount_amount || 0).toLocaleString('es-AR')}
                    </td>
                    <td className="py-1 pr-4 text-slate-500">{u.currency === 'USD' ? 'U$D ' : '$'}{Number(u.cart_total_before || 0).toLocaleString('es-AR')}</td>
                    <td className="py-1 font-bold text-slate-800">{u.currency === 'USD' ? 'U$D ' : '$'}{Number(u.cart_total_after || 0).toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DiscountsPage() {
  const { globalStore } = useAdmin()
  const { dolarBlue }   = useCurrency()
  const [codes, setCodes]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchCodes = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('discount_codes').select('*')
      .eq('store', globalStore)
      .order('created_at', { ascending: false })
    setCodes(data || [])
    setLoading(false)
  }, [globalStore])

  useEffect(() => { fetchCodes() }, [fetchCodes])

  const toggleActive = async (code) => {
    await supabase.from('discount_codes').update({ is_active: !code.is_active }).eq('id', code.id)
    fetchCodes()
  }

  const deleteCode = async (id) => {
    if (!confirm('¿Eliminar este código? También borrará el historial de usos.')) return
    await supabase.from('discount_codes').delete().eq('id', id)
    fetchCodes()
  }

  // Stats
  const active   = codes.filter(c => c.is_active && !isExpired(c.expires_at)).length
  const expired  = codes.filter(c => isExpired(c.expires_at)).length
  const totalUses = codes.reduce((s, c) => s + (c.uses_count || 0), 0)

  return (
    <div className="space-y-4 pb-8">

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-3 rounded-sm shadow-sm border border-slate-200 flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Tag size={15} className="text-green-500" /> Códigos de Descuento
          </h1>
          {!loading && codes.length > 0 && (
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="text-emerald-600">{active} activos</span>
              {expired > 0 && <span className="text-red-500">{expired} vencidos</span>}
              <span className="text-slate-400">{totalUses} usos totales</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchCodes}
            className="p-1.5 rounded-sm border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowForm(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-sm transition-colors shadow-sm ${showForm ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            <Plus size={13} /> {showForm ? 'Cancelar' : 'Nuevo Código'}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <NewCodeForm
          store={globalStore}
          dolarBlue={dolarBlue}
          onSaved={() => { setShowForm(false); fetchCodes() }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Table */}
      <div className="bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <RefreshCw size={18} className="animate-spin mr-2" /> Cargando...
          </div>
        ) : codes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
            <Tag size={28} strokeWidth={1.5} />
            <p className="text-sm font-medium">No hay códigos de descuento para {globalStore}.</p>
            <button onClick={() => setShowForm(true)} className="text-blue-600 text-xs font-semibold hover:underline">
              Crear el primero
            </button>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-200">
                <th className="px-4 py-2.5 text-left">Código</th>
                <th className="px-4 py-2.5 text-left">Tipo</th>
                <th className="px-4 py-2.5 text-left">Descuento</th>
                <th className="px-4 py-2.5 text-left">Vencimiento</th>
                <th className="px-4 py-2.5 text-center">Usos</th>
                <th className="px-4 py-2.5 text-center">Estado</th>
                <th className="px-4 py-2.5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {codes.map(code => {
                const TypeIcon = TYPE_ICONS[code.type] || Tag
                // KEY on the fragment, not on the inner <tr>
                return (
                  <UsesRowWrapper key={code.id} code={code} TypeIcon={TypeIcon} onToggle={toggleActive} onDelete={deleteCode} />
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .admin-input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 0.4rem 0.6rem;
          font-size: 0.75rem;
          color: #1e293b;
          background: white;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .admin-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
        }
        .admin-input::placeholder {
          color: #94a3b8;
        }
      `}</style>
    </div>
  )
}

// ─── Row component (wraps <tr> + optional sub-table <tr>) ────────────────────
// Extracted so the fragment key lives at the component level, avoiding the warning.

function UsesRowWrapper({ code, TypeIcon, onToggle, onDelete }) {
  const [open, setOpen]       = useState(false)
  const [uses, setUses]       = useState([])
  const [loading, setLoading] = useState(false)

  const loadUses = async () => {
    if (open) { setOpen(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('discount_code_uses').select('*')
      .eq('discount_code_id', code.id)
      .order('created_at', { ascending: false }).limit(50)
    setUses(data || [])
    setLoading(false)
    setOpen(true)
  }

  return (
    <>
      <tr className={`hover:bg-slate-50/60 transition-colors ${!code.is_active ? 'opacity-60' : ''}`}>
        {/* Code */}
        <td className="px-4 py-2.5">
          <span className="font-mono font-bold text-slate-800 tracking-widest bg-slate-100 px-2 py-0.5 rounded text-[11px]">
            {code.code}
          </span>
        </td>

        {/* Type badge */}
        <td className="px-4 py-2.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${TYPE_COLORS[code.type] || 'bg-slate-100 text-slate-600'}`}>
            <TypeIcon size={10} />
            {TYPE_LABELS[code.type] || code.type}
          </span>
        </td>

        {/* Discount value */}
        <td className="px-4 py-2.5 font-semibold text-slate-700">{formatDiscount(code)}</td>

        {/* Expiry */}
        <td className={`px-4 py-2.5 ${isExpired(code.expires_at) ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
          {formatExpiry(code.expires_at) ?? <span className="text-slate-300">Sin límite</span>}
        </td>

        {/* Uses */}
        <td className="px-4 py-2.5 text-center">
          <button onClick={loadUses} className="flex items-center gap-1 mx-auto text-blue-600 hover:text-blue-800 text-xs font-semibold transition-colors">
            <span>{code.uses_count}</span>
            {code.max_uses && <span className="text-slate-400 font-normal">/{code.max_uses}</span>}
            {loading ? <RefreshCw size={10} className="animate-spin" /> : open ? <ChevronUp size={10} /> : code.uses_count > 0 ? <ChevronDown size={10} /> : null}
          </button>
        </td>

        {/* Status */}
        <td className="px-4 py-2.5 text-center">
          <StatusBadge code={code} />
        </td>

        {/* Actions */}
        <td className="px-4 py-2.5 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => onToggle(code)}
              title={code.is_active ? 'Desactivar' : 'Activar'}
              className={`p-1.5 rounded transition-colors ${code.is_active ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
            >
              {code.is_active ? <PowerOff size={13} /> : <Power size={13} />}
            </button>
            <button
              onClick={() => onDelete(code.id)}
              title="Eliminar"
              className="p-1.5 rounded text-red-400 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      </tr>

      {/* Uses sub-table */}
      {open && uses.length > 0 && (
        <tr className="bg-blue-50/40 border-t border-blue-100">
          <td colSpan={7} className="px-4 pb-3 pt-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Últimos usos — {code.code}</p>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-blue-100">
                  <th className="pb-1 pr-4">Fecha</th>
                  <th className="pb-1 pr-4">Moneda</th>
                  <th className="pb-1 pr-4">Descuento</th>
                  <th className="pb-1 pr-4">Antes</th>
                  <th className="pb-1">Después</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100/50">
                {uses.map(u => (
                  <tr key={u.id} className="text-slate-600">
                    <td className="py-1 pr-4 text-slate-400">{new Date(u.created_at).toLocaleString('es-AR')}</td>
                    <td className="py-1 pr-4">{u.currency || '—'}</td>
                    <td className="py-1 pr-4 font-semibold text-emerald-700">
                      -{u.currency === 'USD' ? 'U$D ' : '$'}{Number(u.discount_amount || 0).toLocaleString('es-AR')}
                    </td>
                    <td className="py-1 pr-4 text-slate-500">{u.currency === 'USD' ? 'U$D ' : '$'}{Number(u.cart_total_before || 0).toLocaleString('es-AR')}</td>
                    <td className="py-1 font-bold text-slate-800">{u.currency === 'USD' ? 'U$D ' : '$'}{Number(u.cart_total_after || 0).toLocaleString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  )
}

DiscountsPage.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>
}
