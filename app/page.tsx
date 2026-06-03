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
      <div className="fade-up bg-[var(--bg)] text-[var(--text)] min-h-screen">
        <button 
          onClick={() => setShowAccordCreator(false)}
          className="fixed top-8 left-8 z-50 text-[var(--text-muted)] hover:text-[var(--accent)] transition flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]"
        >
          ← Return to Sanctuary
        </button>
        <AccordCreator />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center transition-colors duration-700">
      <main className="max-w-6xl w-full px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-20 items-center fade-up">
        <section className="space-y-10">
          <div className="space-y-2">
            <div className="w-12 h-0.5 bg-[var(--accent)] mb-6" />
            <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-muted)] font-bold">The Atelier</p>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-serif italic leading-tight tracking-tight">
              Scentral — <br />
              <span className="text-[var(--text-muted)]">where notes compose memory</span>
            </h1>

            <p className="text-[var(--text-muted)] max-w-xl text-lg font-light leading-relaxed">
              Discover pairings. Formulate insights. Save rituals that linger. 
              A minimal, sensory-first sanctuary for exploring fragrance layering.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 items-center">
            <button 
              onClick={() => setShowAccordCreator(true)}
              className="bg-[var(--accent)] text-white px-10 py-4 rounded-[var(--r-btn)] shadow-sm transition-all hover:bg-[var(--accent-press)] active:scale-95 font-bold uppercase tracking-widest text-[10px]"
            >
              Enter The Atelier
            </button>

            <Link href="/collection" className="text-[var(--text)] border-b border-[var(--text)] pb-1 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all uppercase tracking-[0.2em] text-[10px] font-bold">
              Explore The Wardrobe
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/layering" className="group relative overflow-hidden bg-[var(--surface)] border border-[var(--line)] px-6 py-5 transition-all hover:bg-[var(--surface-2)] shadow-sm">
              <div className="relative z-10 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] group-hover:text-[var(--accent)]">Atelier Sessions</div>
            </Link>

            <Link href="/dna-match" className="group relative overflow-hidden bg-[var(--surface)] border border-[var(--line)] px-6 py-5 transition-all hover:bg-[var(--surface-2)] shadow-sm">
              <div className="relative z-10 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] group-hover:text-[var(--accent)]">Resonance Engine</div>
            </Link>
          </div>
        </section>

        <aside className="relative flex items-center justify-center p-8 bg-[var(--surface)] border border-[var(--line)] aspect-square">
          <AudioChord />
          <SpritzSchedulerTeaser onUnlock={() => window.location.href = '/login'} />
        </aside>
      </main>
    </div>
  )
}

