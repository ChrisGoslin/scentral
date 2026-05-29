'use client';

import { useState, useEffect } from 'react';
import DynamicAura from '../components/DynamicAura';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export default function ProfilePage() {
  const [dna, setDna] = useState({ woody: 25, floral: 25, fresh: 25, spicy: 25 });
  const [loading, setLoading] = useState(true);
  const [collectionCount, setCollectionCount] = useState(0);

  useEffect(() => {
    async function calculateScentDNA() {
      const { data: { session } } = await supabase.auth.getSession();
      
      let query = supabase.from('fragrances').select('primary_vector, notes');
      if (session?.user) {
        query = query.eq('user_id', session.user.id);
      } else {
        // Fallback to public network data for demo if logged out
        query = query.eq('is_public', true).limit(20);
      }

      const { data } = await query;
      
      if (data && data.length > 0) {
        setCollectionCount(data.length);
        let woody = 0, floral = 0, fresh = 0, spicy = 0;
        
        data.forEach(f => {
          const str = `${f.primary_vector} ${f.notes}`.toLowerCase();
          
          if (str.match(/wood|oud|cedar|sandalwood|amber|leather|vetiver|patchouli|oakmoss|musk|animalic|smoke|tobacco/)) woody += 1;
          if (str.match(/rose|jasmine|iris|floral|violet|tuberose|blossom|geranium|neroli|ylang|gardenia|peony/)) floral += 1;
          if (str.match(/citrus|bergamot|aquatic|marine|apple|fresh|lemon|grapefruit|mint|ozonic|cucumber|tea|green/)) fresh += 1;
          if (str.match(/spice|pepper|cardamom|cinnamon|vanilla|coffee|praline|caramel|clove|nutmeg|saffron|gourmand/)) spicy += 1;
        });

        const total = woody + floral + fresh + spicy;
        if (total > 0) {
          setDna({
            woody: Math.round((woody / total) * 100),
            floral: Math.round((floral / total) * 100),
            fresh: Math.round((fresh / total) * 100),
            spicy: Math.round((spicy / total) * 100),
          });
        }
      }
      setLoading(false);
    }

    calculateScentDNA();
  }, []);

  const dominantTrait = Object.entries(dna).reduce((a, b) => a[1] > b[1] ? a : b)[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06070a] via-[#071022] to-[#0b0f13] text-white">
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">Sovereign Identity</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Your olfactory fingerprint, dynamically synthesized from your {collectionCount > 0 ? collectionCount : 'enshrined'} essences. 
            Tap your aura to activate the sensory proxy.
          </p>
        </header>

        <section className="py-12 border-y border-slate-800/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
          {!loading && <DynamicAura dna={dna} size={280} />}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
            <h3 className="text-xl font-semibold mb-2 text-amber-50">Identity Analysis</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Based on your exact wardrobe chemistry, your aura is distinctly <span className="text-amber-400 font-bold uppercase tracking-widest">{dominantTrait}</span>-dominant. 
              This creates a sillage that leans into {dominantTrait === 'woody' ? 'deep, resinous foundations.' : dominantTrait === 'fresh' ? 'sharp, volatile projections.' : dominantTrait === 'floral' ? 'lush, botanical mid-tones.' : 'warm, gourmand tensions.'}
            </p>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl flex flex-col justify-center items-center text-center">
             <span className="text-4xl mb-4">🔮</span>
             <h3 className="text-xl font-semibold mb-2">Global Resonance</h3>
             <p className="text-slate-400 text-sm mb-4">
               There are 42 curators globally with a &gt;90% DNA match to your aura.
             </p>
             <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-full text-xs uppercase tracking-widest font-bold transition">
               Initiate Match
             </button>
          </div>
        </section>
      </main>
    </div>
  );
}