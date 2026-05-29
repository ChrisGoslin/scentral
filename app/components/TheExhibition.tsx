import { Fragrance } from '@/app/lib/types';

// The Exhibition
// A visual shelf component that showcases the user's top "Enshrined" fragrances.

export default function TheExhibition({ fragrances }: { fragrances: Fragrance[] }) {
  // Take top 4 for the exhibition shelf
  const topShelf = fragrances.slice(0, 4);

  if (topShelf.length === 0) return null;

  return (
    <section className="mb-20 fade-up">
      <div className="flex items-end justify-between mb-8">
        <div>
           <h2 className="text-3xl font-bold tracking-tight text-white mb-2">The Exhibition</h2>
           <p className="text-slate-400 text-sm">Your most prestigious enshrinements, curated for display.</p>
        </div>
        <button className="text-[10px] uppercase tracking-widest font-bold text-amber-400/80 hover:text-amber-400 transition">
          Rearrange Shelf
        </button>
      </div>

      <div className="relative">
        {/* The physical shelf structure */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-slate-800 to-slate-950 rounded-b-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20" />
        <div className="absolute bottom-4 left-4 right-4 h-[1px] bg-white/5 z-20" />

        <div className="flex gap-4 md:gap-8 overflow-x-auto pb-8 pt-4 px-4 snap-x hide-scrollbar relative z-10">
          {topShelf.map((f, i) => (
            <div 
              key={f.id} 
              className="snap-center shrink-0 w-[200px] md:w-[240px] flex flex-col items-center group cursor-pointer"
            >
              {/* Bottle Pedestal Area */}
              <div className="relative w-full aspect-[3/4] mb-6 flex items-end justify-center">
                {/* Backlight Glow based on index */}
                <div className={`absolute inset-0 bg-gradient-to-t ${i % 2 === 0 ? 'from-amber-500/10' : 'from-sky-500/10'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl`} />
                
                {f.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={f.image_url} 
                    alt={f.name}
                    className="h-[80%] w-auto object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)] group-hover:-translate-y-2 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div className="h-[70%] w-16 bg-gradient-to-b from-slate-700 to-slate-900 rounded-t-xl rounded-b-sm shadow-2xl group-hover:-translate-y-2 transition-transform duration-500 border-x border-t border-white/10 flex items-center justify-center">
                    <span className="text-slate-600 text-xs font-serif italic opacity-50 text-center px-1">
                      {f.brand?.slice(0,3).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Plaque */}
              <div className="text-center w-full px-2">
                <h3 className="text-white font-bold truncate text-sm mb-1">{f.name}</h3>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 truncate">{f.brand}</p>
                <div className="mt-3 w-8 h-[1px] bg-amber-500/30 mx-auto group-hover:w-16 transition-all duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <style dangerouslySetContent={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
}
