// app/layering/page.tsx
// Server component — fetches fragrances + layering_protocols, passes to client.

import { createClient } from '@supabase/supabase-js'
import LayeringClient, { type LayeringFragrance, type LayeringProtocol } from './LayeringClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export default async function LayeringPage() {
  const [fragrancesResult, protocolsResult] = await Promise.all([
    supabase
      .from('fragrances')
      .select('id, brand, name, phase, phase_label, family, projection, application_zone, application_method, anosmia_risk, lean, rating, image_url')
      .order('brand', { ascending: true }),
    supabase
      .from('layering_protocols')
      .select('*')
      .order('name', { ascending: true }),
  ])

  if (fragrancesResult.error || protocolsResult.error) {
    const msg = fragrancesResult.error?.message ?? protocolsResult.error?.message
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-red-700">Failed to load layering data: {msg}</p>
      </div>
    )
  }

  return (
    <LayeringClient
      fragrances={(fragrancesResult.data ?? []) as LayeringFragrance[]}
      protocols={(protocolsResult.data ?? []) as LayeringProtocol[]}
    />
  )
}
