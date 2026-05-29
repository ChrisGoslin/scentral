'use client'

import { useState, useMemo } from 'react'
import LayeringResult from './LayeringResult'
import SupabaseAuth from '../components/SupabaseAuth'

export type LayeringFragrance = {
  id: string
  brand: string
  name: string
  phase: 1 | 2 | 3
  phase_label: string
  family: string
  application_zone: string
  anosmia_risk: 'High' | 'Medium' | 'Low'
  rating: number | null
  image_url: string | null
  application_method?: string | null
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

const PHASE_CONFIG = {
  1: { badge: 'bg-amber-900 text-amber-200', emoji: '🛑', label: 'Anchor' },
  2: { badge: 'bg-violet-900 text-violet-200', emoji: '🧬', label: 'Modulate' },
  3: { badge: 'bg-sky-900 text-sky-200', emoji: '⚡', label: 'Top' },
} as const

function PhaseBadge({ phase }: { phase: 1 | 2 | 3 }) {
  const c = PHASE_CONFIG[phase]
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>
      {c.emoji} Ph{phase}
    </span>
  )
}

function AnomsiaBadge({ risk }: { risk: 'High' | 'Medium' | 'Low' }) {
  const cls =
    risk === 'High'
      ? 'bg-red-900 text-red-200'
      : risk === 'Medium'
      ? 'bg-orange-900/60 text-orange-300'
      : 'bg-slate-700 text-slate-400'
  return <span className={`text-xs px-2 py-0.5 rounded font-medium ${cls}`}>ARR {risk}</span>
}

function BottleImage({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="w-8 h-8 object-contain flex-shrink-0"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  )
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
      className={`w-full text-left rounded-xl border p-3 flex flex-col gap-1.5 transition-all ${
        selected
          ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500'
          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        {f.image_url && <BottleImage src={f.image_url} alt={f.name} />}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 truncate">{f.brand}</p>
          <p className="text-white text-sm font-medium truncate">{f.name}</p>
        </div>
        <PhaseBadge phase={f.phase} />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <AnomsiaBadge risk={f.anosmia_risk} />
        <span className="text-xs text-slate-500 truncate">{f.application_zone}</span>
      </div>
    </button>
  )
}

function PairingCard({ f }: { f: LayeringFragrance }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-3 flex flex-col gap-1.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 truncate">{f.brand}</p>
          <p className="text-white text-sm font-semibold truncate">{f.name}</p>
        </div>
        <PhaseBadge phase={f.phase} />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <AnomsiaBadge risk={f.anosmia_risk} />
        <span className="text-xs text-slate-500">{f.application_zone}</span>
      </div>
    </div>
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
      className={`rounded-xl border bg-slate-900 p-4 flex flex-col gap-3 transition-all ${
        highlighted ? 'border-amber-400 ring-2 ring-amber-400' : 'border-slate-700'
      }`}
    >
      <div>
        <h3 className="text-white font-bold text-base">{protocol.name}</h3>
        <p className="text-slate-400 text-sm mt-0.5">{protocol.concept}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800/60 rounded-lg p-2.5">
          <p className="text-slate-500 text-xs mb-1">Base (apply first)</p>
          <p className="text-white text-sm font-medium">{protocol.base_fragrance_name}</p>
          <p className="text-amber-400 text-xs mt-0.5">{protocol.base_sprays} sprays</p>
        </div>
        <div className="bg-slate-800/60 rounded-lg p-2.5">
          <p className="text-slate-500 text-xs mb-1">Top (apply after)</p>
          <p className="text-white text-sm font-medium">{protocol.top_fragrance_name}</p>
          <p className="text-amber-400 text-xs mt-0.5">{protocol.top_sprays} sprays</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span className="text-slate-400">
          <span className="text-slate-500">Sillage: </span>
          <span className="text-white">{protocol.predicted_sillage}</span>
        </span>
        <span className="text-slate-400">
          <span className="text-slate-500">Duration: </span>
          <span className="text-white">{protocol.predicted_hours}h</span>
        </span>
        <span className="text-slate-400">
          <span className="text-slate-500">Occasion: </span>
          <span className="text-white">{protocol.occasion}</span>
        </span>
        <span className="text-slate-400">
          <span className="text-slate-500">Season: </span>
          <span className="text-white">{protocol.season}</span>
        </span>
      </div>

      {protocol.anosmia_warning && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2">
          <p className="text-red-300 text-xs">⚠ {protocol.anosmia_warning}</p>
        </div>
      )}

      {protocol.application_note && (
        <p className="text-slate-400 text-xs italic">{protocol.application_note}</p>
      )}
    </div>
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
  const [selectedBaseId, setSelectedBaseId] = useState<string | null>(null)
  const [selectedTopId, setSelectedTopId] = useState<string | null>(null)
  const [result, setResult] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState('Anytime')
  const [weather, setWeather] = useState('Moderate Temp')
  const [occasion, setOccasion] = useState('General Wear')

  const selectedBase = fragrances.find(f => f.id === selectedBaseId) ?? null
  const selectedTop = fragrances.find(f => f.id === selectedTopId) ?? null

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
    const sel = selectedBase ?? selectedTop
    if (!sel) return []
    return fragrances.filter(f => f.id !== sel.id && f.phase !== sel.phase)
  }, [fragrances, selectedBase, selectedTop])

  const isHighlighted = (p: LayeringProtocol) => {
    const namesToCheck = [selectedBase?.name?.toLowerCase(), selectedTop?.name?.toLowerCase()].filter(Boolean)
    if (namesToCheck.length === 0) return false
    return namesToCheck.some(n => p.base_fragrance_name.toLowerCase().includes(n!) || p.top_fragrance_name.toLowerCase().includes(n!))
  }

  async function handleFormulate() {
    if (!selectedBase || !selectedTop) return
    setLoading(true)
    setResult(null)

    const payload = {
      brand_1: selectedBase.brand,
      name_1: selectedBase.name,
      phase_1: String(selectedBase.phase),
      family_1: selectedBase.family,
      application_zone_1: selectedBase.application_zone,
      application_method_1: selectedBase.application_method ?? 'Standard Spray',
      anosmia_risk_1: selectedBase.anosmia_risk,
      brand_2: selectedTop.brand,
      name_2: selectedTop.name,
      phase_2: String(selectedTop.phase),
      family_2: selectedTop.family,
      application_zone_2: selectedTop.application_zone,
      application_method_2: selectedTop.application_method ?? 'Standard Spray',
      anosmia_risk_2: selectedTop.anosmia_risk,
      time_of_day: timeOfDay,
      weather,
      occasion,
    }

    try {
      const res = await fetch('/api/formulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      setResult(json)
    } catch (e) {
      setResult({ error: 'Failed to call formulate API' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight">Layering Lab</h1>
          <p className="text-slate-400 text-sm mt-0.5">Select two fragrances to formulate a combination and view expert guidance.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-10">
        <section>
          <h2 className="text-base font-semibold text-slate-200 mb-3">Your Collection</h2>

          <input
            type="text"
            placeholder="Search by brand or name…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full max-w-sm bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-1 focus:ring-slate-500 placeholder-slate-500"
          />

          {displayList.length === 0 ? (
            <p className="text-slate-600 text-sm italic">No fragrances match &quot;{query}&quot;.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {displayList.map(f => (
                <FragrancePickerCard
                  key={f.id}
                  f={f}
                  selected={f.id === selectedBaseId || f.id === selectedTopId}
                  onClick={() => {
                    if (!selectedBaseId) return setSelectedBaseId(f.id)
                    if (selectedBaseId && selectedBaseId !== f.id && !selectedTopId) return setSelectedTopId(f.id)
                    if (selectedBaseId === f.id) return setSelectedBaseId(null)
                    if (selectedTopId === f.id) return setSelectedTopId(null)
                    setSelectedTopId(f.id)
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-slate-400 text-xs">Time of day</label>
              <select value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)} className="ml-2 bg-slate-800 border border-slate-700 text-white text-sm rounded-md px-2 py-1">
                {['Anytime','Morning','Afternoon','Evening','Night'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-slate-400 text-xs">Weather</label>
              <select value={weather} onChange={e => setWeather(e.target.value)} className="ml-2 bg-slate-800 border border-slate-700 text-white text-sm rounded-md px-2 py-1">
                {['Moderate Temp','Warm','Cold','Humid','Dry'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-slate-400 text-xs">Occasion</label>
              <select value={occasion} onChange={e => setOccasion(e.target.value)} className="ml-2 bg-slate-800 border border-slate-700 text-white text-sm rounded-md px-2 py-1">
                {['General Wear','Date Night','Office','Gym','Formal'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {selectedBase || selectedTop ? (
            <section>
              <h2 className="text-base font-semibold text-slate-200 mb-1">Selected Pair</h2>
              <p className="text-slate-500 text-sm mb-3">
                Base: <span className="text-white font-medium">{selectedBase?.name ?? '—'}</span> · Top: <span className="text-white font-medium">{selectedTop?.name ?? '—'}</span>
              </p>
              <div className="flex gap-2">
                <button onClick={handleFormulate} disabled={!selectedBase || !selectedTop || loading} className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-black disabled:opacity-50">
                  {loading ? 'Formulating…' : 'Formulate'}
                </button>
                <button onClick={() => { setSelectedBaseId(null); setSelectedTopId(null); setResult(null); }} className="rounded-lg border border-slate-700 px-4 py-2 text-sm">Clear</button>
              </div>
            </section>
          ) : (
            <p className="text-slate-600 text-sm italic">Select two fragrances above to compare and formulate a combo.</p>
          )}
        </div>

        {selectedBase ? (
          <section>
            <h2 className="text-base font-semibold text-slate-200 mb-1">Phase-Compatible Pairings</h2>
            <p className="text-slate-500 text-sm mb-3">Showing fragrances compatible with your selection.</p>
            {pairings.length === 0 ? (
              <p className="text-slate-600 text-sm italic">No pairings found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {pairings.map(f => (
                  <PairingCard key={f.id} f={f} />
                ))}
              </div>
            )}
          </section>
        ) : null}

        <section>
          <h2 className="text-base font-semibold text-slate-200 mb-1">Expert Protocols</h2>
          {protocols.length === 0 ? (
            <p className="text-slate-600 text-sm italic">No protocols found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {protocols.map(p => (
                <ProtocolCard key={p.id} protocol={p} highlighted={isHighlighted(p)} />
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-600 space-y-1">
        <p>Scentral · Personal Fragrance Intelligence</p>
        <p>
          <a href="/disclaimer" className="text-slate-500 text-xs hover:text-slate-300 underline">For personal use only · Not medical advice · Always patch test · View full disclaimer</a>
        </p>
      </div>

      {result && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setResult(null)} />
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-slate-900 border border-slate-700 p-6">
            <button onClick={() => setResult(null)} className="absolute right-3 top-3 text-slate-400">✕</button>
            <LayeringResult
              result={result}
              base={selectedBase}
              top={selectedTop}
              onSaveSuccess={() => { /* noop for now */ }}
            />
          </div>
        </div>
      )}

      <div className="fixed bottom-20 right-4 z-40">
        <SupabaseAuth />
      </div>
    </div>
  )
}
