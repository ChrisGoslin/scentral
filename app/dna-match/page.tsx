import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import DNAMatchClient from './DNAMatchClient';

async function loadFragrances() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: fragrances, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, primary_vector, image_url')
    .order('brand')
    .order('name');

  if (error) {
    console.error('Failed to load fragrances:', error);
    return [];
  }

  return fragrances || [];
}

export default async function ResonancePage() {
  const fragrances = await loadFragrances();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06070a] via-[#071022] to-[#0b0f13] text-white">
      <DNAMatchClient fragrances={fragrances} />
    </div>
  );
}
