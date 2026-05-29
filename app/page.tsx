import Image from 'next/image'
import Link from 'next/link'
import DemoSave from './components/DemoSave'
import ScentBloom from './components/ScentBloom'
import AudioChord from './components/AudioChord'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06070a] via-[#071022] to-[#0b0f13] text-white flex items-center justify-center">
      <main className="max-w-6xl w-full px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <section className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight tracking-tight">Scentral — where notes compose memory</h1>

          <p className="text-slate-300 max-w-xl text-lg">Discover pairings. Formulate insights. Save rituals that linger. A minimal, sensory-first lab for exploring fragrance layering.</p>

          <div className="flex flex-wrap gap-4 items-center">
            <Link href="/layering" className="inline-flex items-center gap-3 bg-amber-400/95 text-slate-900 px-5 py-3 rounded-full shadow-md transform transition hover:-translate-y-1 active:scale-95 focus:outline-none focus:ring-4 focus:ring-amber-300/30">Open Layering Lab</Link>

            <Link href="/collection" className="px-4 py-3 rounded-full border border-slate-700 text-slate-200 hover:bg-slate-800/60 transition">Open Collection</Link>
          </div>

          <div className="mt-6">
            <DemoSave />
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/schedule" className="group relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/40 px-6 py-4 transition transform hover:-translate-y-1 shadow-sm">
              <span className="absolute left-0 top-0 h-full w-1 bg-amber-400 transform -translate-x-6 group-hover:translate-x-0 transition"></span>
              <div className="relative z-10">Schedule (placeholder)</div>
            </Link>

            <Link href="/profile" className="group relative overflow-hidden rounded-2xl bg-slate-800/50 border border-slate-700/40 px-6 py-4 transition transform hover:-translate-y-1 shadow-sm">
              <span className="absolute left-0 top-0 h-full w-1 bg-rose-300/80 transform -translate-x-6 group-hover:translate-x-0 transition"></span>
              <div className="relative z-10">Profile (placeholder)</div>
            </Link>
          </div>
        </section>

        <aside className="relative flex items-center justify-center">
          <AudioChord />
          <div className="w-[320px] h-[320px]">
            <ScentBloom>
              <Image src="/images/landing-art.svg" alt="" width={320} height={320} className="animate-float" priority />
            </ScentBloom>
          </div>
          <div className="absolute bottom-6 text-sm text-slate-400">Hints of amber, rose, and green — gently layered</div>
        </aside>
      </main>
    </div>
  )
}

