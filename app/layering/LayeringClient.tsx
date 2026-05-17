'use client'

import { useState, useMemo } from 'react'

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

function FragrancePickerCard({
  f,
  selected,
  onClick,
}: {
  f: LayeringFragrance
  selected: boolean
  onClick: () => void
}) {
  const pc = PHASE_CONFIG[f.phase]
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
      {/* Name + concept */}
      <div>
        <h3 className="text-white font-bold text-base">{protocol.name}</h3>
        <p className="text-slate-400 text-sm mt-0.5">{protocol.concept}</p>
      </div>

      {/* Base + Top */}
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

      {/* Stats row */}
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

      {/* Anosmia warning */}
      {protocol.anosmia_warning && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2">
          <p className="text-red-300 text-xs">⚠ {protocol.anosmia_warning}</p>
        </div>
      )}

      {/* Application note */}
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
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = fragrances.find(f => f.id === selectedId) ?? null

  const displayList = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return fragrances
    return fragrances.filter(
      f =>
        f.name.toLowerCase().includes(q) ||
        f.brand.toLowerCase().includes(q)
    )
  }, [fragrances, query])

  // Phase-compatible pairings: if Phase 1 selected → show Phase 2 + Phase 3, etc.
  const pairings = useMemo(() => {
    if (!selected) return []
    return fragrances.filter(f => f.id !== selected.id && f.phase !== selected.phase)
  }, [fragrances, selected])

  // Highlight protocols where the selected fragrance name appears as base or top
  const isHighlighted = (p: LayeringProtocol) => {
    if (!selected) return false
    const n = selected.name.toLowerCase()
    return (
      p.base_fragrance_name.toLowerCase().includes(n) ||
      p.top_fragrance_name.toLowerCase().includes(n)
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight">Layering Lab</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Select a fragrance to discover compatible pairings and expert protocols.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-10">
        {/* Search + picker */}
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
                  selected={f.id === selectedId}
                  onClick={() => setSelectedId(prev => (prev === f.id ? null : f.id))}
                />
              ))}
            </div>
          )}
        </section>

        {/* Phase-compatible pairings */}
        {selected ? (
          <section>
            <h2 className="text-base font-semibold text-slate-200 mb-1">
              Phase-Compatible Pairings
            </h2>
            <p className="text-slate-500 text-sm mb-3">
              You selected <span className="text-white font-medium">{selected.name}</span> (Phase {selected.phase}).
              Showing Phase {selected.phase === 1 ? '2 & 3' : selected.phase === 2 ? '1 & 3' : '1 & 2'} fragrances.
            </p>
            {pairings.length === 0 ? (
              <p className="text-slate-600 text-sm italic">No other fragrances in collection.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {pairings.map(f => (
                  <PairingCard key={f.id} f={f} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <p className="text-slate-600 text-sm italic">
            Select a fragrance above to see compatible pairings.
          </p>
        )}

        {/* Expert protocols */}
        <section>
          <h2 className="text-base font-semibold text-slate-200 mb-1">Expert Protocols</h2>
          {selected && (
            <p className="text-slate-500 text-sm mb-3">
              Protocols featuring <span className="text-amber-400 font-medium">{selected.name}</span> are highlighted.
            </p>
          )}
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

      {/* Footer */}
      <div className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-600 space-y-1">
        <p>Scentral · Personal Fragrance Intelligence</p>
        <p>
          <a href="/disclaimer" className="text-slate-500 text-xs hover:text-slate-300 underline">
            For personal use only · Not medical advice · Always patch test · View full disclaimer
          </a>
        </p>
      </div>
    </div>
  )
}
