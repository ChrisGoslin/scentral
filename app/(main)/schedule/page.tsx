'use client'

export default function SchedulePage() {
  const rituals = [
    {
      time: '08:00',
      label: 'Morning Awakening',
      description: 'Bright citrus or crisp aromatics to sharpen the mind.',
      status: 'Current',
    },
    {
      time: '13:00',
      label: 'Midday Reset',
      description: 'Soft woods or clean musks to maintain professional poise.',
      status: 'Upcoming',
    },
    {
      time: '19:00',
      label: 'Evening Decadence',
      description: 'Rich ambers or deep resins for the transition to night.',
      status: 'Upcoming',
    },
  ]

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-12">
        <header className="space-y-2 border-b border-stone-200 pb-8">
          <h1 className="editorial-title text-4xl">Ritual Planner</h1>
          <p className="text-stone-500 text-sm uppercase tracking-[0.2em]">Designing your olfactory arc</p>
        </header>

        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="editorial-title text-2xl text-[#c49a3c]">Today's Sequence</h2>
            <button className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 border border-stone-200 px-4 py-2 rounded-sm hover:bg-white transition-all">
              Edit Arc
            </button>
          </div>

          <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-stone-200">
            {rituals.map((ritual) => (
              <div key={ritual.time} className="relative pl-10">
                <div className={`absolute left-0 top-2 w-6 h-6 rounded-full border-2 border-stone-50 flex items-center justify-center ${ritual.status === 'Current' ? 'bg-[#c49a3c]' : 'bg-stone-200'}`}>
                  {ritual.status === 'Current' && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                </div>
                <div className={`luxury-card p-6 ${ritual.status === 'Current' ? 'ring-1 ring-[#c49a3c]/20' : ''}`}>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="text-stone-900 font-serif text-lg">{ritual.label}</h3>
                    <span className="text-stone-400 font-mono text-xs">{ritual.time}</span>
                  </div>
                  <p className="text-stone-500 text-sm leading-relaxed">{ritual.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-stone-100/50 rounded-sm p-8 border border-stone-200/60 text-center space-y-4">
          <h2 className="editorial-title text-xl">The Evening Transition</h2>
          <p className="text-stone-600 text-sm italic font-serif max-w-md mx-auto">
            "Scent is the most intimate layer of our architecture. As the day yields to night, our atmosphere must soften."
          </p>
          <div className="pt-4">
            <button className="bg-stone-900 text-stone-50 px-8 py-3 text-[10px] uppercase tracking-[0.3em] font-bold rounded-sm hover:bg-stone-800 transition-colors shadow-lg">
              Set Nightly Ritual
            </button>
          </div>
        </section>

        <footer className="pt-12 text-center text-[10px] uppercase tracking-[0.3em] text-stone-300 font-bold">
          Scentral · Olfactory Chronology
        </footer>
      </div>
    </div>
  )
}
