'use client'

import { useState, useMemo } from 'react'

export type LayeringFragrance = {
  id: string
  brand: string
  name: string
  phase: 1 | 2 | 3
  phase_label: string
  family: string
  projection: string
  application_zone: string
  application_method: string
  anosmia_risk: 'High' | 'Medium' | 'Low'
  lean: string
  rating: number | null
  image_url: string | null
}

export type LayeringProtocol = {
  id: string
  name: string
  concept: string
  base_fragrance_name: string
  base_sprays: number | string
  top_fragrance_name: string
  top_sprays: number | string
  predicted_sillage: string
  predicted_hours: number | string
  occasion: string
  season: string
  anosmia_warning: string | null
  application_note: string | null
}

type FormulateResult = {
  combo_name: string
  application_steps: string[]
  sillage_prediction: string
  occasion_tag: string
  anosmia_warning: string | null
  claude_note: string
}

type Context = {
  time_of_day: string
  weather: string
  occasion: string
}

const PHASE_CONFIG = {
  1: { badge: 'bg-stone-200 text-stone-700', dot: 'bg-[#c49a3c]', label: 'Anchor' },
  2: { badge: 'bg-stone-200 text-stone-700', dot: 'bg-[#c49a3c]', label: 'Modulate' },
  3: { badge: 'bg-stone-200 text-stone-700', dot: 'bg-[#c49a3c]', label: 'Top' },
} as const

const TIME_OPTIONS = ['morning', 'afternoon', 'evening', 'night']
const WEATHER_OPTIONS = ['cold', 'cool', 'warm', 'hot']
const OCCASION_OPTIONS = ['daily', 'work', 'date', 'formal', 'casual']

function PhaseBadge({ phase }: { phase: 1 | 2 | 3 }) {
  const c = PHASE_CONFIG[phase]
  return (
    <span className={`text-[10px] uppercase tracking-tighter px-2 py-0.5 rounded-sm font-bold flex items-center gap-1.5 ${c.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      PH{phase}
    </span>
  )
}

function AnosmíaBadge({ risk }: { risk: 'High' | 'Medium' | 'Low' }) {
  const cls =
    risk === 'High'
      ? 'text-red-700'
      : risk === 'Medium'
      ? 'text-yellow-700'
      : 'text-stone-500'
  return <span className={`text-[10px] font-bold uppercase tracking-tighter ${cls}`}>ARR {risk}</span>
}

function FragrancePickerCard({
  f,
  selected,
  onClick,
}: {
  f: LayeringFragrance
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`luxury-card w-full text-left p-4 flex flex-col gap-2 transition-all ${
        selected
          ? 'ring-2 ring-[#c49a3c] border-[#c49a3c] shadow-md'
          : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {f.image_url && (
          <img
            src={f.image_url}
            alt={f.name}
            className="w-8 h-8 object-contain flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-stone-500 truncate">{f.brand}</p>
          <p className="text-stone-900 font-serif text-sm font-medium truncate">{f.name}</p>
        </div>
        <PhaseBadge phase={f.phase} />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <AnosmíaBadge risk={f.anosmia_risk} />
        <span className="text-[10px] text-stone-400 uppercase tracking-widest truncate">{f.application_zone}</span>
      </div>
    </button>
  )
}

function PairingPickerCard({
  f,
  selected,
  onClick,
}: {
  f: LayeringFragrance
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`luxury-card w-full text-left p-4 flex flex-col gap-2 transition-all ${
        selected
          ? 'ring-2 ring-[#c49a3c] border-[#c49a3c] shadow-md'
          : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-stone-500 truncate">{f.brand}</p>
          <p className="text-stone-900 font-serif text-sm font-semibold truncate">{f.name}</p>
        </div>
        <PhaseBadge phase={f.phase} />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <AnosmíaBadge risk={f.anosmia_risk} />
        <span className="text-[10px] text-stone-400 uppercase tracking-widest">{f.application_zone}</span>
      </div>
    </button>
  )
}

function ProtocolCard({
  protocol,
  highlighted,
}: {
  protocol: LayeringProtocol
  highlighted: boolean
}) {
  return (
    <div
      className={`luxury-card p-4 flex flex-col gap-3 transition-all ${
        highlighted ? 'ring-2 ring-[#c49a3c] border-[#c49a3c] shadow-md' : ''
      }`}
    >
      <div>
        <h3 className="text-stone-900 font-serif font-bold text-base">{protocol.name}</h3>
        <p className="text-stone-500 text-sm mt-0.5">{protocol.concept}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-stone-50 rounded-sm p-2.5 border border-stone-100">
          <p className="text-stone-400 text-[10px] uppercase tracking-widest mb-1">Base (apply first)</p>
          <p className="text-stone-900 text-sm font-medium">{protocol.base_fragrance_name}</p>
          <p className="text-[#c49a3c] text-[10px] font-bold uppercase tracking-tighter mt-0.5">{protocol.base_sprays} sprays</p>
        </div>
        <div className="bg-stone-50 rounded-sm p-2.5 border border-stone-100">
          <p className="text-stone-400 text-[10px] uppercase tracking-widest mb-1">Top (apply after)</p>
          <p className="text-stone-900 text-sm font-medium">{protocol.top_fragrance_name}</p>
          <p className="text-[#c49a3c] text-[10px] font-bold uppercase tracking-tighter mt-0.5">{protocol.top_sprays} sprays</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] uppercase tracking-tighter">
        <span className="text-stone-400">
          <span className="text-stone-300 font-bold uppercase tracking-widest mr-1">Sillage:</span>
          <span className="text-stone-600 font-bold">{protocol.predicted_sillage}</span>
        </span>
        <span className="text-stone-400">
          <span className="text-stone-300 font-bold uppercase tracking-widest mr-1">Duration:</span>
          <span className="text-stone-600 font-bold">{protocol.predicted_hours}h</span>
        </span>
        <span className="text-stone-400">
          <span className="text-stone-300 font-bold uppercase tracking-widest mr-1">Occasion:</span>
          <span className="text-stone-600 font-bold">{protocol.occasion}</span>
        </span>
        <span className="text-stone-400">
          <span className="text-stone-300 font-bold uppercase tracking-widest mr-1">Season:</span>
          <span className="text-stone-600 font-bold">{protocol.season}</span>
        </span>
      </div>

      {protocol.anosmia_warning && (
        <div className="bg-red-50 border border-red-100 rounded-sm px-3 py-2">
          <p className="text-red-700 text-[10px] font-bold uppercase tracking-tighter">⚠ {protocol.anosmia_warning}</p>
        </div>
      )}

      {protocol.application_note && (
        <p className="text-stone-400 text-[10px] uppercase tracking-widest italic">{protocol.application_note}</p>
      )}
    </div>
  )
}

function ContextPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${
        active
          ? 'bg-stone-900 border-stone-900 text-stone-50 font-bold'
          : 'border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-600'
      }`}
    >
      {label}
    </button>
  )
}

function FormulatePanel({
  fragrance1,
  fragrance2,
  context,
  setContext,
  onFormulate,
  isLoading,
  result,
  error,
}: {
  fragrance1: LayeringFragrance
  fragrance2: LayeringFragrance
  context: Context
  setContext: (c: Context) => void
  onFormulate: () => void
  isLoading: boolean
  result: FormulateResult | null
  error: string | null
}) {
  return (
    <section className="luxury-card p-6 flex flex-col gap-6">
      {/* Combo header */}
      <div>
        <p className="editorial-subtitle mb-2">Ready to Formulate</p>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-stone-900 font-serif font-semibold">{fragrance1.name}</span>
          <span className="text-stone-400">+</span>
          <span className="text-stone-900 font-serif font-semibold">{fragrance2.name}</span>
        </div>
        <p className="text-stone-500 text-[10px] uppercase tracking-widest mt-1">
          Ph{fragrance1.phase} {fragrance1.lean} · Ph{fragrance2.phase} {fragrance2.lean}
        </p>
      </div>

      {/* Context selectors */}
      <div className="flex flex-col gap-4">
        <div>
          <p className="editorial-subtitle mb-2 text-[10px]">When?</p>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map(t => (
              <ContextPill
                key={t}
                label={t}
                active={context.time_of_day === t}
                onClick={() => setContext({ ...context, time_of_day: t })}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="editorial-subtitle mb-2 text-[10px]">Weather?</p>
          <div className="flex flex-wrap gap-2">
            {WEATHER_OPTIONS.map(w => (
              <ContextPill
                key={w}
                label={w}
                active={context.weather === w}
                onClick={() => setContext({ ...context, weather: w })}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="editorial-subtitle mb-2 text-[10px]">Occasion?</p>
          <div className="flex flex-wrap gap-2">
            {OCCASION_OPTIONS.map(o => (
              <ContextPill
                key={o}
                label={o}
                active={context.occasion === o}
                onClick={() => setContext({ ...context, occasion: o })}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Formulate button */}
      <button
        onClick={onFormulate}
        disabled={isLoading}
        className="self-start px-6 py-2.5 rounded-sm bg-stone-900 text-stone-50 font-bold text-xs uppercase tracking-widest hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Formulating…' : 'Formulate'}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-sm px-4 py-3">
          <p className="text-red-700 text-xs font-bold uppercase tracking-tighter">⚠ {error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="border-t border-stone-100 pt-6 flex flex-col gap-5">
          <div>
            <h3 className="editorial-title text-2xl">{result.combo_name}</h3>
            <span className="inline-block mt-2 text-[10px] px-2.5 py-1 rounded-sm bg-stone-200 text-stone-700 font-bold uppercase tracking-tighter">
              {result.occasion_tag}
            </span>
          </div>

          <div>
            <p className="editorial-subtitle text-[10px] mb-2">Application</p>
            <ol className="flex flex-col gap-2">
              {result.application_steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-stone-100 text-stone-400 text-[10px] flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <span className="text-stone-600 font-serif">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="editorial-subtitle text-[10px] mb-1">Sillage</p>
            <p className="text-stone-600 font-serif text-sm">{result.sillage_prediction}</p>
          </div>

          <div>
            <p className="editorial-subtitle text-[10px] mb-1">Why these work</p>
            <p className="text-stone-600 font-serif text-sm italic">{result.claude_note}</p>
          </div>

          {result.anosmia_warning && (
            <div className="bg-red-50 border border-red-100 rounded-sm px-4 py-3">
              <p className="text-red-700 text-xs font-bold uppercase tracking-tighter">⚠ {result.anosmia_warning}</p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default function LayeringClient({
  fragrances,
  protocols,
}: {
  fragrances: LayeringFragrance[]
  protocols: LayeringProtocol[]
}) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [secondId, setSecondId] = useState<string | null>(null)
  const [context, setContext] = useState<Context>({ time_of_day: 'evening', weather: 'cool', occasion: 'casual' })
  const [result, setResult] = useState<FormulateResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formulateError, setFormulateError] = useState<string | null>(null)

  const selected = fragrances.find(f => f.id === selectedId) ?? null
  const second = fragrances.find(f => f.id === secondId) ?? null

  const displayList = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return fragrances
    return fragrances.filter(
      f =>
        f.name.toLowerCase().includes(q) ||
        f.brand.toLowerCase().includes(q)
    )
  }, [fragrances, query])

  const pairings = useMemo(() => {
    if (!selected) return []
    return fragrances.filter(f => f.id !== selected.id && f.phase !== selected.phase)
  }, [fragrances, selected])

  const isHighlighted = (p: LayeringProtocol) => {
    if (!selected) return false
    const n = selected.name.toLowerCase()
    return (
      p.base_fragrance_name.toLowerCase().includes(n) ||
      p.top_fragrance_name.toLowerCase().includes(n)
    )
  }

  function handleSelectFirst(id: string) {
    const next = selectedId === id ? null : id
    setSelectedId(next)
    setSecondId(null)
    setResult(null)
    setFormulateError(null)
  }

  function handleSelectSecond(id: string) {
    const next = secondId === id ? null : id
    setSecondId(next)
    setResult(null)
    setFormulateError(null)
  }

  async function handleFormulate() {
    if (!selected || !second) return
    setIsLoading(true)
    setResult(null)
    setFormulateError(null)
    try {
      const res = await fetch('/api/formulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fragrance1: {
            name: selected.name, brand: selected.brand, phase: selected.phase,
            phase_label: selected.phase_label, family: selected.family,
            projection: selected.projection, application_zone: selected.application_zone,
            application_method: selected.application_method,
            anosmia_risk: selected.anosmia_risk, lean: selected.lean,
          },
          fragrance2: {
            name: second.name, brand: second.brand, phase: second.phase,
            phase_label: second.phase_label, family: second.family,
            projection: second.projection, application_zone: second.application_zone,
            application_method: second.application_method,
            anosmia_risk: second.anosmia_risk, lean: second.lean,
          },
          context,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Request failed')
      setResult(data.result)
    } catch (e) {
      setFormulateError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Header */}
      <div className="border-b border-stone-200 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="editorial-title">Layering Lab</h1>
          <p className="text-stone-500 text-sm mt-2 font-serif">
            Pick two fragrances from different phases, then let Scentral formulate the combo.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-16">

        {/* Step 1 — pick first fragrance */}
        <section>
          <h2 className="editorial-subtitle mb-1">
            Step 1 — Pick a fragrance
          </h2>
          <p className="text-stone-500 text-xs uppercase tracking-widest mb-4">Select one from your collection to start.</p>

          <input
            type="text"
            placeholder="Search by brand or name…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full max-w-sm bg-white border border-stone-200 text-stone-900 text-sm rounded-sm px-4 py-2.5 mb-6 focus:outline-none focus:ring-1 focus:ring-stone-400 placeholder-stone-300 transition-all"
          />

          {displayList.length === 0 ? (
            <p className="text-stone-400 text-sm italic font-serif">No fragrances match &quot;{query}&quot;.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayList.map(f => (
                <FragrancePickerCard
                  key={f.id}
                  f={f}
                  selected={f.id === selectedId}
                  onClick={() => handleSelectFirst(f.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Step 2 — pick pairing */}
        {selected ? (
          <section>
            <h2 className="editorial-subtitle mb-1">
              Step 2 — Pick a pairing
            </h2>
            <p className="text-stone-500 text-xs uppercase tracking-widest mb-4">
              <span className="text-stone-900 font-bold">{selected.name}</span> is Phase {selected.phase}.
              {' '}Showing Phase {selected.phase === 1 ? '2 & 3' : selected.phase === 2 ? '1 & 3' : '1 & 2'} fragrances.
            </p>
            {pairings.length === 0 ? (
              <p className="text-stone-400 text-sm italic font-serif">No other fragrances in collection.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {pairings.map(f => (
                  <PairingPickerCard
                    key={f.id}
                    f={f}
                    selected={f.id === secondId}
                    onClick={() => handleSelectSecond(f.id)}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <p className="text-stone-400 text-sm italic font-serif">Select a fragrance above to see compatible pairings.</p>
        )}

        {/* Step 3 — Formulate */}
        {selected && second && (
          <FormulatePanel
            fragrance1={selected}
            fragrance2={second}
            context={context}
            setContext={setContext}
            onFormulate={handleFormulate}
            isLoading={isLoading}
            result={result}
            error={formulateError}
          />
        )}

        {/* Expert protocols */}
        <section>
          <h2 className="editorial-subtitle mb-1">Expert Protocols</h2>
          {selected && (
            <p className="text-stone-500 text-xs uppercase tracking-widest mb-4">
              Protocols featuring <span className="text-[#c49a3c] font-bold">{selected.name}</span> are highlighted.
            </p>
          )}
          {protocols.length === 0 ? (
            <p className="text-stone-400 text-sm italic font-serif">No protocols found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {protocols.map(p => (
                <ProtocolCard key={p.id} protocol={p} highlighted={isHighlighted(p)} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <div className="border-t border-stone-200 px-6 py-12 text-center text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold space-y-2">
        <p>Scentral · Personal Fragrance Intelligence</p>
        <p>
          <a href="/disclaimer" className="text-stone-400 hover:text-stone-600 transition-colors">
            For personal use only · Not medical advice · Always patch test · View full disclaimer
          </a>
        </p>
      </div>
    </div>
  )
}
