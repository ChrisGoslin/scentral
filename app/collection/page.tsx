// app/collection/page.tsx
// Scentral — My Collection screen
// Fetches all fragrances server-side; passes them to CollectionClient for filtering.

import { createClient } from '@supabase/supabase-js'
import CollectionClient, { type Fragrance } from './CollectionClient'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export default async function CollectionPage() {
  const { data: fragrances, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, phase, phase_label, family, use_case, projection, lean, rating, maturation, spritz_count, application_zone, application_method, anosmia_risk, temperature, inspired_by, image_url')
    .order('brand', { ascending: true })

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-red-400">Failed to load collection: {error.message}</p>
      </div>
    )
  }

  return <CollectionClient fragrances={(fragrances ?? []) as Fragrance[]} />
}
