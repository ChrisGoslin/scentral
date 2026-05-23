'use client'

import { useState } from 'react'

export type Fragrance = {
  id: string
  brand: string
  name: string
  phase: 1 | 2 | 3
  phase_label: string
  family: string
  use_case: string
  projection: string
  lean: string
  rating: number | null
  maturation: string
  spritz_count: string
  application_zone: string
  application_method: string
  anosmia_risk: 'High' | 'Medium' | 'Low'
  temperature: string
  inspired_by: string | null
  image_url: string | null
}

const PHASES = [
  {
    phase: 1,
    label: 'Endothermic Anchors',
    emoji: '🛑',
    description: 'Apply first — heavy bases that lock to skin and last all day.',
    bg: 'bg-amber-950/30',
    border: 'border-amber-800/40',
    badge: 'bg-amber-900 text-amber-200',
    dot: 'bg-amber-500',
  },
  {
    phase: 2,
    label: 'Textural Modulators',
    emoji: '🧬',
    description: 'The bridge layer — amplifies and shapes what sits above and below.',
    bg: 'bg-violet-950/30',
    border: 'border-violet-800/40',
    badge: 'bg-violet-900 text-violet-200',
    dot: 'bg-violet-500',
  },
  {
    phase: 3,
    label: 'Exothermic Tops',
    emoji: '⚡',
    description: 'Apply last — volatile molecules that project and evolve fastest.',
    bg: 'bg-sky-950/30',
    border: 'border-sky-800/40',
    badge: 'bg-sky-900 text-sky-200',
    dot: 'bg-sky-400',
  },
]

const PROJECTION_ORDER = ['Beast Mode', 'Strong', 'Moderate', 'Medium', 'Weak']

function projectionColor(p: string) {
  switch (p) {
    case 'Beast Mode': return 'text-red-400'
    case 'Strong':     return 'text-orange-400'
    case 'Moderate':   return 'text-yellow-400'
    case 'Medium':     return 'text-green-400'
    default:           return 'text-slate-400'
  }
}

function ratingStars(r: number | null) {
  if (r === null) return <span className="text-slate-600 text-xs">Unrated</span>
  return <span className="text-amber-400 font-semibold text-sm">{r}/10</span>
}

function phaseConfigFor(phase: number) {
  return PHASES.find(p => p.phase === phase) ?? PHASES[0]
}

function DetailRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-800 last:border-0">
      <span className="text-slate-500 text-sm flex-shrink-0">{label}</span>
      <span className={`text-sm text-right ${valueClass ?? 'text-white'}`}>{value}</span>
    </div>
  )
}

// DetailPanelContent renders only the inner header + body; the parent manages the fixed container.
function DetailPanelContent({ fragrance, onClose }: { fragrance: Fragrance; onClose: () => void }) {
  const pc = phaseConfigFor(fragrance.phase)
  const isMatured = fragrance.maturation?.toLowerCase() === 'ready'

  return (
    <>
      {/* Sticky header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0 sticky top-0 bg-slate-900">
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${pc.badge}`}>
          {pc.emoji} Phase {fragrance.phase} — {fragrance.phase_label}
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors w-7 h-7 flex items-center justify-center rounded hover:bg-slate-800 text-base"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      {/* Scrollable content */}
      <div className="px-5 py-5 flex flex-col gap-5">
        {/* Brand + Name */}
        <div>
          <p className="text-slate-400 text-sm">{fragrance.brand}</p>
          <h2 className="text-white text-2xl font-bold leading-tight mt-0.5">{fragrance.name}</h2>
        </div>

        {/* Two columns: Spritz + Safety */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/60 rounded-lg p-3 flex flex-col gap-2.5">
            <h3 className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Spritz Instructions</h3>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Count</p>
              <p className="text-white text-sm">{fragrance.spritz_count}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Zone</p>
              <p className="text-white text-sm">{fragrance.application_zone}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Method</p>
              <p className="text-white text-sm">{fragrance.application_method}</p>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-lg p-3 flex flex-col gap-2.5">
            <h3 className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Anosmia &amp; Safety</h3>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Risk</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${
                fragrance.anosmia_risk === 'High'
                  ? 'bg-red-900 text-red-200'
                  : fragrance.anosmia_risk === 'Medium'
                  ? 'bg-orange-900/60 text-orange-300'
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {fragrance.anosmia_risk}
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Maturation</p>
              <p className={`text-sm ${isMatured ? 'text-green-400' : 'text-amber-400'}`}>
                {isMatured ? 'Ready' : fragrance.maturation}
              </p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Temperature</p>
              <p className="text-white text-sm">{fragrance.temperature}</p>
            </div>
          </div>
        </div>

        {/* Additional details */}
        <div className="flex flex-col">
          <DetailRow label="Family" value={fragrance.family} />
          <DetailRow label="Use Case" value={fragrance.use_case} />
          <DetailRow label="Projection" value={fragrance.projection} valueClass={projectionColor(fragrance.projection)} />
          <DetailRow label="Lean" value={fragrance.lean} />
          {fragrance.inspired_by && (
            <DetailRow label="Inspired By" value={fragrance.inspired_by} />
          )}
        </div>
      </div>
    </>
  )
}

function FragranceCard({
  f,
  phaseConfig,
  onClick,
}: {
  f: Fragrance
  phaseConfig: typeof PHASES[0]
  onClick: () => void
}) {
  const isMatured = f.maturation?.toLowerCase() === 'ready'
  return (
    <div
      className={`rounded-xl border ${phaseConfig.border} ${phaseConfig.bg} p-4 flex flex-col gap-2 hover:brightness-110 transition-all cursor-pointer`}
      onClick={onClick}
    >
      {/* Bottle image */}
      {f.image_url && (
        <div className="flex justify-center mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={f.image_url}
            alt={`${f.brand} ${f.name}`}
            className="h-24 w-auto object-contain drop-shadow-lg"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-400 truncate">{f.brand}</p>
          <h3 className="text-white font-semibold text-sm leading-tight">{f.name}</h3>
        </div>
        <div className="flex-shrink-0 text-right">
          {ratingStars(f.rating)}
        </div>
      </div>

      {/* Family */}
      <p className="text-slate-300 text-xs">{f.family}</p>

      {/* Meta pills */}
      <div className="flex flex-wrap gap-1">
        <span className={`text-xs px-2 py-0.5 rounded-full ${phaseConfig.badge}`}>{f.lean}</span>
        <span className={`text-xs font-medium ${projectionColor(f.projection)}`}>{f.projection}</span>
        <span className="text-xs text-slate-400">·</span>
        <span className="text-xs text-slate-400">{f.temperature}</span>
      </div>

      {/* Application zone */}
      <p className="text-xs text-slate-400 truncate">
        <span className="text-slate-500">Zone: </span>{f.application_zone}
      </p>

      {/* Maturation status */}
      <div className="flex items-center gap-1.5 mt-auto pt-1">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isMatured ? 'bg-green-500' : 'bg-amber-500'}`} />
        <span className="text-xs text-slate-400">
          {isMatured ? 'Ready' : `Matures: ${f.maturation}`}
        </span>
        {f.anosmia_risk === 'High' && (
          <span className="ml-auto text-xs text-red-400 font-medium">⚠ ARR High</span>
        )}
      </div>
    </div>
  )
}

type Filters = {
  season: string
  lean: string
  anosmia: string
}

const selectClass =
  'bg-slate-800 border border-slate-700 text-white text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-500'

export default function CollectionClient({ fragrances }: { fragrances: Fragrance[] }) {
  const [filters, setFilters] = useState<Filters>({ season: 'All', lean: 'All', anosmia: 'All' })
  const [selectedFragrance, setSelectedFragrance] = useState<Fragrance | null>(null)

  function set(key: keyof Filters, value: string) {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const filtered = fragrances.filter(f => {
    if (filters.season !== 'All' && f.temperature !== filters.season) return false
    if (filters.lean   !== 'All' && f.lean          !== filters.lean)   return false
    if (filters.anosmia !== 'All' && f.anosmia_risk !== filters.anosmia) return false
    return true
  })

  const byPhase = (phase: number) =>
    filtered
      .filter(f => f.phase === phase)
      .sort((a, b) => {
        const pa = PROJECTION_ORDER.indexOf(a.projection)
        const pb = PROJECTION_ORDER.indexOf(b.projection)
        if (pa !== pb) return pa - pb
        if ((b.rating ?? 0) !== (a.rating ?? 0)) return (b.rating ?? 0) - (a.rating ?? 0)
        return a.name.localeCompare(b.name)
      })

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-baseline justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Collection</h1>
            <p className="text-slate-400 text-sm mt-0.5">{fragrances.length} fragrances across 3 phases</p>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500">
            <span>🛑 Phase 1: Anchor</span>
            <span>🧬 Phase 2: Modulate</span>
            <span>⚡ Phase 3: Top</span>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="border-b border-slate-800 bg-slate-900 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-4">
          <span className="text-sm text-slate-400 font-medium">Filter:</span>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            Season
            <select value={filters.season} onChange={e => set('season', e.target.value)} className={selectClass}>
              {['All', 'Cold', 'Warm', 'Universal'].map(o => <option key={o}>{o}</option>)}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            Lean
            <select value={filters.lean} onChange={e => set('lean', e.target.value)} className={selectClass}>
              {['All', 'Masculine', 'Feminine', 'Unisex'].map(o => <option key={o}>{o}</option>)}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            Anosmia Risk
            <select value={filters.anosmia} onChange={e => set('anosmia', e.target.value)} className={selectClass}>
              {['All', 'High', 'Medium', 'Low'].map(o => <option key={o}>{o}</option>)}
            </select>
          </label>

          <span className="ml-auto text-sm text-slate-400">
            <span className="text-white font-semibold">{filtered.length}</span> of {fragrances.length} fragrances
          </span>
        </div>
      </div>

      {/* Phase sections */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {PHASES.map(phaseConfig => {
          const items = byPhase(phaseConfig.phase)
          return (
            <section key={phaseConfig.phase}>
              {/* Phase header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{phaseConfig.emoji}</span>
                <div>
                  <h2 className="text-lg font-semibold">
                    Phase {phaseConfig.phase} — {phaseConfig.label}
                    <span className="ml-2 text-sm font-normal text-slate-400">({items.length})</span>
                  </h2>
                  <p className="text-slate-400 text-xs">{phaseConfig.description}</p>
                </div>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {items.map(f => (
                  <FragranceCard
                    key={f.id}
                    f={f}
                    phaseConfig={phaseConfig}
                    onClick={() => setSelectedFragrance(f)}
                  />
                ))}
              </div>

              {items.length === 0 && (
                <p className="text-slate-600 text-sm italic">No fragrances match the current filters.</p>
              )}
            </section>
          )
        })}
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

      {/* Detail panel — slides in when a fragrance is selected */}
      <div
        className={`fixed top-0 right-0 h-full w-96 max-sm:w-full bg-slate-900 border-l border-slate-700 z-50 overflow-y-auto transition-transform duration-300 ${
          selectedFragrance ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedFragrance && (
          <DetailPanelContent
            fragrance={selectedFragrance}
            onClose={() => setSelectedFragrance(null)}
          />
        )}
      </div>

      {/* Overlay */}
      {selectedFragrance && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setSelectedFragrance(null)}
        />
      )}
    </div>
  )
}
