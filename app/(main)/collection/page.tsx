// app/collection/page.tsx
// Scentral — My Collection screen
// Fetches all 76 fragrances from Supabase, groups by phase.
// No auth required for MVP — fragrances table has public read policy.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

type Fragrance = {
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
    roman: 'I',
    description: 'Apply first — heavy bases that lock to skin and last all day.',
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    badge: 'bg-stone-200 text-stone-700',
    dot: 'bg-[#c49a3c]',
  },
  {
    phase: 2,
    label: 'Textural Modulators',
    roman: 'II',
    description: 'The bridge layer — amplifies and shapes what sits above and below.',
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    badge: 'bg-stone-200 text-stone-700',
    dot: 'bg-[#c49a3c]',
  },
  {
    phase: 3,
    label: 'Exothermic Tops',
    roman: 'III',
    description: 'Apply last — volatile molecules that project and evolve fastest.',
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    badge: 'bg-stone-200 text-stone-700',
    dot: 'bg-[#c49a3c]',
  },
]

const PROJECTION_ORDER = ['Beast Mode', 'Strong', 'Moderate', 'Medium', 'Weak']

function projectionColor(p: string) {
  switch (p) {
    case 'Beast Mode': return 'text-red-700'
    case 'Strong': return 'text-orange-700'
    case 'Moderate': return 'text-yellow-700'
    case 'Medium': return 'text-green-700'
    default: return 'text-stone-500'
  }
}

function anosmiaColor(a: string) {
  switch (a) {
    case 'High': return 'text-red-700'
    case 'Medium': return 'text-yellow-700'
    default: return 'text-green-700'
  }
}

function ratingStars(r: number | null) {
  if (r === null) return <span className="text-stone-400 text-xs italic">Unrated</span>
  return (
    <span className="text-[#c49a3c] font-serif font-semibold text-sm">{r}/10</span>
  )
}

function FragranceCard({ f, phaseConfig }: { f: Fragrance; phaseConfig: typeof PHASES[0] }) {
  const isMatured = f.maturation?.toLowerCase() === 'ready'
  return (
    <div className={`luxury-card p-4 flex flex-col gap-2 transition-all`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-stone-500 truncate">{f.brand}</p>
          <h3 className="text-stone-900 font-serif text-base leading-tight mt-0.5">{f.name}</h3>
        </div>
        <div className="flex-shrink-0 text-right">
          {ratingStars(f.rating)}
        </div>
      </div>

      {/* Family */}
      <p className="text-stone-600 text-xs italic font-serif">{f.family}</p>

      {/* Meta pills */}
      <div className="flex flex-wrap gap-1 mt-1">
        <span className={`text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-tighter ${phaseConfig.badge}`}>{f.lean}</span>
        <span className={`text-[10px] font-bold uppercase tracking-tighter ${projectionColor(f.projection)}`}>{f.projection}</span>
        <span className="text-xs text-stone-300">·</span>
        <span className="text-[10px] text-stone-500 uppercase tracking-tighter">{f.temperature}</span>
      </div>

      {/* Application zone */}
      <p className="text-[10px] text-stone-500 truncate mt-1">
        <span className="text-stone-400 uppercase tracking-widest">Zone: </span>{f.application_zone}
      </p>

      {/* Maturation status */}
      <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-stone-100">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isMatured ? 'bg-green-600' : 'bg-[#c49a3c]'}`} />
        <span className="text-[10px] uppercase tracking-widest text-stone-400">
          {isMatured ? 'Ready' : `Matures: ${f.maturation}`}
        </span>
        {f.anosmia_risk === 'High' && (
          <span className="ml-auto text-[10px] text-red-700 font-bold uppercase tracking-tighter">⚠ ARR High</span>
        )}
      </div>
    </div>
  )
}

export default async function CollectionPage() {
  const { data: fragrances, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, phase, phase_label, family, use_case, projection, lean, rating, maturation, spritz_count, application_zone, application_method, anosmia_risk, temperature, inspired_by, image_url')
    .order('brand', { ascending: true })

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-red-700">Failed to load collection: {error.message}</p>
      </div>
    )
  }

  const byPhase = (phase: number) =>
    (fragrances ?? [])
      .filter(f => f.phase === phase)
      .sort((a, b) => {
        // Sort by projection desc, then rating desc, then name
        const pa = PROJECTION_ORDER.indexOf(a.projection)
        const pb = PROJECTION_ORDER.indexOf(b.projection)
        if (pa !== pb) return pa - pb
        if ((b.rating ?? 0) !== (a.rating ?? 0)) return (b.rating ?? 0) - (a.rating ?? 0)
        return a.name.localeCompare(b.name)
      })

  const total = fragrances?.length ?? 0

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Header */}
      <div className="border-b border-stone-200 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-baseline justify-between">
          <div>
            <h1 className="editorial-title text-3xl font-serif tracking-tight">My Collection</h1>
            <p className="text-stone-500 text-sm mt-1">{total} fragrances across 3 phases</p>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
            <span>Phase I: Anchor</span>
            <span>Phase II: Modulate</span>
            <span>Phase III: Top</span>
          </div>
        </div>
      </div>

      {/* Phase sections */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-20">
        {PHASES.map(phaseConfig => {
          const items = byPhase(phaseConfig.phase)
          return (
            <section key={phaseConfig.phase}>
              {/* Phase header */}
              <div className="flex items-center gap-4 mb-8">
                <span className="text-2xl font-serif text-[#c49a3c]">{phaseConfig.roman}</span>
                <div>
                  <h2 className="text-xl font-serif text-stone-900">
                    Phase {phaseConfig.phase} — {phaseConfig.label}
                    <span className="ml-3 text-sm font-sans font-normal text-stone-400">({items.length})</span>
                  </h2>
                  <p className="text-stone-500 text-xs mt-1 uppercase tracking-widest">{phaseConfig.description}</p>
                </div>
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {items.map(f => (
                  <FragranceCard key={f.id} f={f as Fragrance} phaseConfig={phaseConfig} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-stone-200 px-6 py-12 text-center text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold">
        Scentral · Personal Fragrance Intelligence
      </div>
    </div>
  )
}
