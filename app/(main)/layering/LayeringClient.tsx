'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Search, X, AlertTriangle, Check } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import Sheet from '@/components/ui/Sheet'
import LoadingShimmer from '@/components/ui/LoadingShimmer'
import ErrorInline from '@/components/ui/ErrorInline'
import Disclosure from '@/components/ui/Disclosure'
import AuthSheet from '@/components/auth/AuthSheet'

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

export type FormulateResult = {
  combo_name: string
  application_steps: string[]
  sillage_prediction: string
  occasion_tag: string
  anosmia_warning: string | null
  claude_note: string
}

type PendingFormulation = {
  slot1: LayeringFragrance
  slot2: LayeringFragrance
  occasion: string
  result: FormulateResult
}

const PENDING_KEY = 'scentral_pending_formulation'

const OCCASIONS = ['Anytime', 'Date', 'Office', 'Gym', 'Formal'] as const
type Occasion = typeof OCCASIONS[number]

const OCCASION_API_MAP: Record<Occasion, string> = {
  Anytime: 'anytime',
  Date: 'date',
  Office: 'work',
  Gym: 'gym',
  Formal: 'formal',
}

const PHASE_LABEL: Record<number, string> = { 1: 'Anchor', 2: 'Modulator', 3: 'Top' }

/* ── Helpers ────────────────────────────────────────────── */

function parseSprayCount(steps: string[], fragName: string): number | null {
  const words = fragName.toLowerCase().split(' ').slice(0, 2)
  for (const step of steps) {
    const s = step.toLowerCase()
    if (words.some(w => s.includes(w))) {
      const m = s.match(/(\d+)\s*sprays?/)
      if (m) return parseInt(m[1], 10)
    }
  }
  return null
}

function parseLasts(sillage: string): string | null {
  const range = sillage.match(/(\d+)\s*[-–]\s*(\d+)\s*hours?/i)
  if (range) return `~${range[1]}–${range[2]}h`
  const single = sillage.match(/(\d+)\s*hours?/i)
  if (single) return `~${single[1]}h`
  return null
}

const SHOW_COMMERCE_SLOT = false

/* ── Sub-components ─────────────────────────────────────── */

function PhaseTag({ phase }: { phase: 1 | 2 | 3 }) {
  return (
    <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {PHASE_LABEL[phase]}
    </span>
  )
}

function PickerSlot({ label, fragrance, onClick }: { label: string; fragrance: LayeringFragrance | null; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 rounded-[var(--r-card)] border p-4 flex flex-col gap-1 transition-all text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] min-h-[80px]"
      style={{
        background: 'var(--surface)',
        borderColor: fragrance ? 'var(--accent)' : 'var(--line)',
        boxShadow: fragrance ? '0 0 12px rgba(201,162,75,0.1)' : undefined,
      }}
    >
      <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
      {fragrance ? (
        <>
          <p style={{ fontSize: 14, fontFamily: 'var(--font-display)', color: 'var(--text)', lineHeight: '18px' }}>{fragrance.name}</p>
          <PhaseTag phase={fragrance.phase} />
        </>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Tap to pick</p>
      )}
    </button>
  )
}

function FragrancePickerRow({ f, selected, disabled, onClick }: { f: LayeringFragrance; selected: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left"
      style={{
        opacity: disabled ? 0.4 : 1,
        background: selected ? 'var(--surface-2)' : undefined,
        borderLeft: selected ? '2px solid var(--accent)' : '2px solid transparent',
      }}
    >
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.brand}</p>
        <p style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-display)', lineHeight: '18px' }}>{f.name}</p>
      </div>
      <PhaseTag phase={f.phase} />
    </button>
  )
}

/* ── Result card ────────────────────────────────────────── */

function ResultCard({
  result,
  slot1,
  slot2,
  onTryAnother,
  onSave,
  saveState,
}: {
  result: FormulateResult
  slot1: LayeringFragrance | null
  slot2: LayeringFragrance | null
  onTryAnother: () => void
  onSave: () => void
  saveState: 'idle' | 'saving' | 'saved' | 'error'
}) {
  const fragrances = [slot1, slot2].filter(Boolean) as LayeringFragrance[]
  const lasts = parseLasts(result.sillage_prediction)

  const sprayRows = fragrances.map(f => ({
    name: f.name,
    brand: f.brand,
    sprays: parseSprayCount(result.application_steps, f.name),
  }))

  return (
    <div className="flex flex-col gap-5 py-4">
      <div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)', lineHeight: '28px' }}>
          Your formulation
        </h2>
        {result.occasion_tag && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{result.occasion_tag}</p>
        )}
      </div>

      {/* Spray rows */}
      <div className="flex flex-col gap-2">
        {sprayRows.map(({ name, brand, sprays }) => (
          <div key={name} className="flex items-baseline justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{brand} </span>
              <span style={{ fontSize: 15, color: 'var(--text)', fontFamily: 'var(--font-display)' }}>{name}</span>
            </div>
            <span style={{ fontSize: 15, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
              {sprays !== null ? `→ ${sprays} sprays` : '→ per instructions'}
            </span>
          </div>
        ))}
      </div>

      {/* Sillage + Lasts */}
      <div className="flex flex-col gap-1.5" style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
        <div className="flex justify-between">
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sillage</span>
          <span style={{ fontSize: 13, color: 'var(--text)', maxWidth: '60%', textAlign: 'right' }}>
            {result.sillage_prediction.split('.')[0]}
          </span>
        </div>
        {lasts && (
          <div className="flex justify-between">
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Lasts</span>
            <span style={{ fontSize: 13, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{lasts}</span>
          </div>
        )}
      </div>

      {/* Why */}
      <div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Why</p>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: '22px', fontStyle: 'italic' }}>{result.claude_note}</p>
      </div>

      {/* Commerce slot — HIDDEN in MVP */}
      {SHOW_COMMERCE_SLOT && (
        <div style={{ display: 'none' }} aria-hidden="true">{/* Where to buy — post-MVP */}</div>
      )}

      {/* Anosmia warning */}
      {result.anosmia_warning && (
        <div className="flex items-start gap-2 rounded-[var(--r-btn)] p-3" style={{ background: 'rgba(196,121,75,0.1)', border: '1px solid var(--warning)' }}>
          <AlertTriangle size={16} strokeWidth={1.75} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          <p style={{ fontSize: 13, color: 'var(--warning)' }}>{result.anosmia_warning}</p>
        </div>
      )}

      {/* Save button */}
      {saveState === 'saved' ? (
        <div className="flex items-center justify-center gap-2 rounded-[var(--r-btn)] py-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--positive)' }}>
          <Check size={16} strokeWidth={1.75} style={{ color: 'var(--positive)' }} />
          <span style={{ fontSize: 14, color: 'var(--positive)' }}>Saved</span>
        </div>
      ) : (
        <Button fullWidth disabled={saveState === 'saving'} onClick={onSave}>
          {saveState === 'saving' ? 'Saving…' : 'Save formulation'}
        </Button>
      )}

      <Button variant="secondary" fullWidth onClick={onTryAnother}>Try another</Button>

      <Disclosure text="Personal recommendation — not sponsored." />
    </div>
  )
}

/* ── Main component ─────────────────────────────────────── */

export default function LayeringClient({ fragrances }: { fragrances: LayeringFragrance[] }) {
  const [slot1, setSlot1] = useState<LayeringFragrance | null>(null)
  const [slot2, setSlot2] = useState<LayeringFragrance | null>(null)
  const [occasion, setOccasion] = useState<Occasion>('Anytime')
  const [pickerFor, setPickerFor] = useState<'slot1' | 'slot2' | null>(null)
  const [pickerQuery, setPickerQuery] = useState('')
  const [resultOpen, setResultOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<FormulateResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [authSheetOpen, setAuthSheetOpen] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const canFormulate = slot1 !== null && slot2 !== null && slot1.id !== slot2.id

  /* ── Pending formulation: restore + auto-save after magic-link return ── */
  const doSave = useCallback(async (
    s1: LayeringFragrance,
    s2: LayeringFragrance,
    occ: string,
    r: FormulateResult
  ) => {
    setSaveState('saving')
    const sprayBase = parseSprayCount(r.application_steps, s1.name)
    const sprayTop = parseSprayCount(r.application_steps, s2.name)

    try {
      const res = await fetch('/api/layering/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_fragrance_id: s1.id,
          top_fragrance_id: s2.id,
          name: r.combo_name,
          occasion: occ,
          time_of_day: 'morning',
          weather: 'moderate',
          rationale: r.claude_note,
          formulation: r,
          base_sprays: sprayBase,
          top_sprays: sprayTop,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }, [])

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(PENDING_KEY) : null
    if (!raw) return

    let pending: PendingFormulation | null = null
    try { pending = JSON.parse(raw) } catch { /* ignore */ }
    if (!pending) return

    localStorage.removeItem(PENDING_KEY)

    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      const { slot1: s1, slot2: s2, occasion: occ, result: r } = pending!
      setSlot1(s1)
      setSlot2(s2)
      setOccasion(occ as Occasion)
      setResult(r)
      setResultOpen(true)
      doSave(s1, s2, occ, r)
    })
  }, [doSave])

  /* ── Picker ── */
  const displayList = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase()
    if (!q) return fragrances
    return fragrances.filter(f =>
      f.name.toLowerCase().includes(q) || f.brand.toLowerCase().includes(q)
    )
  }, [fragrances, pickerQuery])

  function openPicker(slot: 'slot1' | 'slot2') {
    setPickerQuery('')
    setPickerFor(slot)
  }

  function selectFragrance(f: LayeringFragrance) {
    if (pickerFor === 'slot1') {
      setSlot1(f)
      if (slot2?.id === f.id) setSlot2(null)
    } else if (pickerFor === 'slot2') {
      setSlot2(f)
      if (slot1?.id === f.id) setSlot1(null)
    }
    setPickerFor(null)
    setPickerQuery('')
    setResult(null)
    setError(null)
    setSaveState('idle')
  }

  /* ── Formulate ── */
  async function handleFormulate() {
    if (!slot1 || !slot2) return
    setIsLoading(true)
    setResult(null)
    setError(null)
    setSaveState('idle')
    setResultOpen(true)

    try {
      const res = await fetch('/api/formulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fragrance1: {
            name: slot1.name, brand: slot1.brand, phase: slot1.phase,
            phase_label: slot1.phase_label, family: slot1.family,
            projection: slot1.projection, application_zone: slot1.application_zone,
            application_method: slot1.application_method,
            anosmia_risk: slot1.anosmia_risk, lean: slot1.lean,
          },
          fragrance2: {
            name: slot2.name, brand: slot2.brand, phase: slot2.phase,
            phase_label: slot2.phase_label, family: slot2.family,
            projection: slot2.projection, application_zone: slot2.application_zone,
            application_method: slot2.application_method,
            anosmia_risk: slot2.anosmia_risk, lean: slot2.lean,
          },
          context: {
            time_of_day: 'morning',
            weather: 'moderate',
            occasion: OCCASION_API_MAP[occasion],
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Formulation failed')
      setResult(data.result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  /* ── Save ── */
  async function handleSave() {
    if (!slot1 || !slot2 || !result) return

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      // Stash formulation in localStorage, then open auth sheet
      const pending: PendingFormulation = {
        slot1, slot2, occasion: OCCASION_API_MAP[occasion], result,
      }
      localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
      setAuthSheetOpen(true)
      return
    }

    await doSave(slot1, slot2, OCCASION_API_MAP[occasion], result)
  }

  function handleTryAnother() {
    setResultOpen(false)
    setResult(null)
    setError(null)
    setSaveState('idle')
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      {/* Header */}
      <div className="px-4 pt-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>Lab</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Build a pairing</p>
      </div>

      <div className="px-4 py-6 flex flex-col gap-6">
        {/* Picker slots */}
        <div className="flex gap-3">
          <PickerSlot label="Anchor" fragrance={slot1} onClick={() => openPicker('slot1')} />
          <PickerSlot label="Top" fragrance={slot2} onClick={() => openPicker('slot2')} />
        </div>

        {/* Occasion chips */}
        <div className="flex flex-col gap-2">
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Occasion</p>
          <div className="flex gap-2 flex-wrap">
            {OCCASIONS.map(o => (
              <Chip key={o} selected={occasion === o} onClick={() => setOccasion(o)}>{o}</Chip>
            ))}
          </div>
        </div>

        {/* Formulate button */}
        <Button fullWidth disabled={!canFormulate} onClick={handleFormulate}>Formulate</Button>

        {!canFormulate && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: -12 }}>
            Pick two fragrances to begin
          </p>
        )}
      </div>

      {/* Fragrance picker sheet */}
      <Sheet open={pickerFor !== null} onClose={() => { setPickerFor(null); setPickerQuery('') }}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--text)' }}>
              Pick {pickerFor === 'slot1' ? 'Anchor' : 'Top'}
            </h2>
            <button onClick={() => { setPickerFor(null); setPickerQuery('') }}>
              <X size={18} strokeWidth={1.75} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          <div className="relative">
            <Search size={14} strokeWidth={1.75} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name or brand…"
              value={pickerQuery}
              onChange={e => setPickerQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 rounded-[var(--r-btn)] text-sm focus:outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', color: 'var(--text)' }}
            />
          </div>

          <div className="flex flex-col" style={{ marginLeft: -16, marginRight: -16 }}>
            {displayList.length === 0 ? (
              <p className="px-4 py-4" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                No fragrances match &quot;{pickerQuery}&quot;.
              </p>
            ) : (
              displayList.map(f => {
                const isOtherSlot = pickerFor === 'slot1' ? f.id === slot2?.id : f.id === slot1?.id
                const isCurrentSlot = pickerFor === 'slot1' ? f.id === slot1?.id : f.id === slot2?.id
                return (
                  <FragrancePickerRow
                    key={f.id}
                    f={f}
                    selected={isCurrentSlot}
                    disabled={isOtherSlot}
                    onClick={() => selectFragrance(f)}
                  />
                )
              })
            )}
          </div>
        </div>
      </Sheet>

      {/* Result sheet */}
      <Sheet open={resultOpen} onClose={() => { if (!isLoading) setResultOpen(false) }}>
        {isLoading ? (
          <div className="flex flex-col gap-4 py-4">
            <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>Formulating…</p>
            <LoadingShimmer variant="line" />
          </div>
        ) : error ? (
          <div className="flex flex-col gap-4 py-4">
            <ErrorInline message={error} onRetry={handleFormulate} />
            <Button variant="secondary" fullWidth onClick={handleTryAnother}>Try another</Button>
          </div>
        ) : result ? (
          <ResultCard
            result={result}
            slot1={slot1}
            slot2={slot2}
            onTryAnother={handleTryAnother}
            onSave={handleSave}
            saveState={saveState}
          />
        ) : null}
      </Sheet>

      {/* Auth sheet */}
      <AuthSheet
        open={authSheetOpen}
        onClose={() => setAuthSheetOpen(false)}
      />
    </div>
  )
}
