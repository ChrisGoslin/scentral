import { createClient } from '@supabase/supabase-js'
import LayeringClient, { type LayeringFragrance } from './LayeringClient'
import EmptyState from '@/components/ui/EmptyState'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export default async function LayeringPage() {
  const { data, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, phase, phase_label, family, projection, application_zone, application_method, anosmia_risk, lean, rating, image_url')
    .order('brand', { ascending: true })

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          headline="Couldn't load fragrances"
          caption={error.message}
        />
      </div>
    )
  }

  return <LayeringClient fragrances={(data ?? []) as LayeringFragrance[]} />
}
