'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { LayeringFragrance } from './LayeringClient'

export default function LayeringResult({ result, base, top, onSaveSuccess }: {
  result: any
  base: LayeringFragrance | null
  top: LayeringFragrance | null
  onSaveSuccess?: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    // require signed-in user and include access token in Authorization header
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // @ts-ignore
      const { data: sessionData } = await supabase.auth.getSession()
      // @ts-ignore
      const accessToken = sessionData?.session?.access_token ?? null
      if (!accessToken) {
        setMessage('Please sign in before saving (use the magic link panel).')
        setSaving(false)
        return
      }

      const res = await fetch('/api/layering/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify({
          base_id: base?.id ?? null,
          top_id: top?.id ?? null,
          combo: result,
          combo_names: result?.combo_names ?? null,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Save failed')
      setMessage('Saved — view in Supabase table.')
      onSaveSuccess?.()
    } catch (e: any) {
      setMessage(String(e.message || e))
    } finally {
      setSaving(false)
    }
  }

  if (!result) return null

  return (
    <div>
      <h2 className="text-xl font-bold">{(result.combo_names && result.combo_names.join(' / ')) || 'Formulated Combo'}</h2>
      <p className="text-slate-400 text-sm mt-1">{result.why_it_works ?? ''}</p>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {result.application_steps && (
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Application Steps</h3>
            <pre className="whitespace-pre-wrap text-slate-300 text-sm mt-1 bg-slate-800 p-3 rounded">{Array.isArray(result.application_steps) ? result.application_steps.join('\n') : String(result.application_steps)}</pre>
          </div>
        )}

        <div className="flex gap-2 items-center">
          <div className="text-slate-400 text-sm">Sillage:</div>
          <div className="text-white">{result.predicted_sillage ?? '—'}</div>
          <div className="ml-4 text-slate-400 text-sm">Duration:</div>
          <div className="text-white">{result.predicted_hours ?? '—'}h</div>
        </div>

        {result.pro_tip && (
          <div className="bg-slate-800/50 p-3 rounded">
            <div className="text-slate-300 text-sm italic">Pro tip</div>
            <div className="text-white text-sm mt-1">{result.pro_tip}</div>
          </div>
        )}

        {result.anosmia_warning && (
          <div className="bg-red-950/40 border border-red-800/40 rounded-lg px-3 py-2">
            <p className="text-red-300 text-xs">⚠ {result.anosmia_warning}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        <button onClick={handleSave} disabled={saving} className="rounded bg-amber-500 px-4 py-2 text-black font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Save Combo'}</button>
        <a className="rounded border px-4 py-2" href="#" onClick={(e) => { e.preventDefault(); navigator.clipboard?.writeText(JSON.stringify(result)); setMessage('Copied result to clipboard') }}>Copy JSON</a>
      </div>

      {message && <p className="mt-3 text-sm text-slate-300">{message}</p>}
    </div>
  )
}
