'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AccordCreator from './components/AccordCreator'
import SpritzSchedulerTeaser from './components/SpritzSchedulerTeaser'
import AudioChord from './components/AudioChord'

export default function Home() {
  const [showAccordCreator, setShowAccordCreator] = useState(false)

  if (showAccordCreator) {
    return (
      <div className="fade-up">
        <button 
          onClick={() => setShowAccordCreator(false)}
          className="fixed top-8 left-8 z-50 text-slate-400 hover:text-amber-400 transition flex items-center gap-2 text-sm font-medium uppercase tracking-widest"
        >
          ← Return to Sanctuary
        </button>
        <AccordCreator />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06070a] via-[#071022] to-[#0b0f13] text-white flex items-center justify-center">
      <main className="max-w-6xl w-full px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center fade-up">
        <section className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight">Scentral — where notes compose memory</h1>

          <p className="text-slate-300 max-w-xl text-lg">Discover pairings. Formulate insights. Save rituals that linger. A minimal, sensory-first lab for exploring fragrance layering.</p>

          <div className="flex flex-wrap gap-4 items-center">
            <button 
              onClick={() => setShowAccordCreator(true)}
              className="inline-flex items-center gap-3 bg-amber-400/95 text-slate-900 px-5 py-3 rounded-full shadow-md transform transition hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-4 focus:ring-amber-300/30 font-bold"
            >
              Start Accord Creator
            </button>

            <Link href="/library" className="px-4 py-3 rounded-full border border-slate-700 text-slate-200 hover:bg-slate-800/60 transition">
              Open Wardrobe
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/layering" className="group relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800 px-6 py-4 transition transform hover:-translate-y-1 shadow-sm hover:border-amber-400/30 backdrop-blur-xl">
              <span className="absolute left-0 top-0 h-full w-1 bg-amber-400 transform -translate-x-6 group-hover:translate-x-0 transition"></span>
              <div className="relative z-10 text-sm font-bold uppercase tracking-widest text-slate-300 group-hover:text-amber-50">Layering Lab</div>
            </Link>

            <Link href="/dna-match" className="group relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800 px-6 py-4 transition transform hover:-translate-y-1 shadow-sm hover:border-amber-400/30 backdrop-blur-xl">
              <span className="absolute left-0 top-0 h-full w-1 bg-sky-400 transform -translate-x-6 group-hover:translate-x-0 transition"></span>
              <div className="relative z-10 text-sm font-bold uppercase tracking-widest text-slate-300 group-hover:text-amber-50">Resonance Match</div>
            </Link>
          </div>
        </section>

        <aside className="relative flex items-center justify-center p-8">
          <AudioChord />
          <SpritzSchedulerTeaser onUnlock={() => window.location.href = '/login'} />
        </aside>
      </main>
    </div>
  )
}

