'use client'

import React, { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Chip from '@/components/ui/Chip'
import Sheet from '@/components/ui/Sheet'
import LoadingShimmer from '@/components/ui/LoadingShimmer'
import ErrorInline from '@/components/ui/ErrorInline'

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

function PhaseTag({ phase }: { phase: 1 | 2 | 3 }) {
  return (
    <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {PHASE_LABEL[phase]}
    </span>
  )
}

function PickerSlot({
  label,
  fragrance,
  onClick,
}: {
  label: string
  fragrance: LayeringFragrance | null
  onClick: () => void
}) {
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
      <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </p>
      {fragrance ? (
        <>
          <p style={{ fontSize: 14, fontFamily: 'var(--font-display)', color: 'var(--text)', lineHeight: '18px' }}>
            {fragrance.name}
          </p>
          <PhaseTag phase={fragrance.phase} />
        </>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Tap to pick</p>
      )}
    </button>
  )
}

function FragrancePickerRow({
  f,
  selected,
  disabled,
  onClick,
}: {
  f: LayeringFragrance
  selected: boolean
  disabled: boolean
  onClick: () => void
}) {
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
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {f.brand}
        </p>
        <p style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-display)', lineHeight: '18px' }}>
          {f.name}
        </p>
      </div>
      <PhaseTag phase={f.phase} />
    </button>
  )
}

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

  const canFormulate = slot1 !== null && slot2 !== null && slot1.id !== slot2.id

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
  }

  async function handleFormulate() {
    if (!slot1 || !slot2) return
    setIsLoading(true)
    setResult(null)
    setError(null)
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

  function handleTryAnother() {
    setResultOpen(false)
    setResult(null)
    setError(null)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      {/* Header */}
      <div className="px-4 pt-8 pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: '34px' }}>
          Lab
        </h1>
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
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Occasion
          </p>
          <div className="flex gap-2 flex-wrap">
            {OCCASIONS.map(o => (
              <Chip key={o} selected={occasion === o} onClick={() => setOccasion(o)}>
                {o}
              </Chip>
            ))}
          </div>
        </div>

        {/* Formulate button */}
        <Button
          fullWidth
          disabled={!canFormulate}
          onClick={handleFormulate}
        >
          Formulate
        </Button>

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

          {/* Search */}
          <div className="relative">
            <Search size={14} strokeWidth={1.75} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name or brand…"
              value={pickerQuery}
              onChange={e => setPickerQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 rounded-[var(--r-btn)] text-sm focus:outline-none"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--line)',
                color: 'var(--text)',
              }}
            />
          </div>

          {/* List */}
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
      <Sheet open={resultOpen} onClose={() => { if (!isLoading) { setResultOpen(false) } }}>
        {isLoading ? (
          <div className="flex flex-col gap-4 py-4">
            <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>Formulating…</p>
            <LoadingShimmer variant="line" />
          </div>
        ) : error ? (
          <div className="flex flex-col gap-4 py-4">
            <ErrorInline message={error} onRetry={() => { handleFormulate() }} />
            <Button variant="secondary" fullWidth onClick={handleTryAnother}>
              Try another
            </Button>
          </div>
        ) : result ? (
          /* Prompt 3 will fill in the full result card here */
          <ResultCard
            result={result}
            slot1={slot1}
            slot2={slot2}
            onTryAnother={handleTryAnother}
          />
        ) : null}
      </Sheet>
    </div>
  )
}

/* Placeholder for Prompt 3 — result card scaffold */
function ResultCard({
  result,
  slot1,
  slot2,
  onTryAnother,
}: {
  result: FormulateResult
  slot1: LayeringFragrance | null
  slot2: LayeringFragrance | null
  onTryAnother: () => void
}) {
  return (
    <div className="flex flex-col gap-4 py-4">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)' }}>
        {result.combo_name}
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{result.claude_note}</p>
      <Button fullWidth>Save formulation</Button>
      <Button variant="secondary" fullWidth onClick={onTryAnother}>Try another</Button>
    </div>
  )
}
