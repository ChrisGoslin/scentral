'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  {
    label: 'Enshrinement',
    href: '/library',
    icon: (active: boolean) => (
      <svg className={`h-5 w-5 ${active ? 'text-amber-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1} d="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    label: 'Resonance',
    href: '/dna-match',
    icon: (active: boolean) => (
      <svg className={`h-5 w-5 ${active ? 'text-amber-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1} d="M19.428 15.428a2 2 0 0 0-1.022-.547l-2.387-.477a6 6 0 0 0-3.86.517l-.318.158a6 6 0 0 1-3.86.517L6.05 15.21a2 2 0 0 0-1.806.547M8 4h8l-1 1v5.172a2 2 0 0 0 .586 1.414l5 5C21.846 17.846 20.953 20 19.171 20H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 0 0 9 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    label: 'Ritual',
    href: '/schedule',
    icon: (active: boolean) => (
      <svg className={`h-5 w-5 ${active ? 'text-amber-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Sillage',
    href: '/community',
    icon: (active: boolean) => (
      <svg className={`h-5 w-5 ${active ? 'text-amber-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
      </svg>
    ),
  },
  {
    label: 'Identity',
    href: '/profile',
    icon: (active: boolean) => (
      <svg className={`h-5 w-5 ${active ? 'text-amber-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1} d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-lg items-center justify-around px-6">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center gap-1 group"
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.div 
                  layoutId="scentral-nav-glow"
                  className="absolute -top-4 w-12 h-12 bg-amber-400/5 blur-xl rounded-full" 
                />
              )}
              <div className="relative z-10 transition-transform duration-500 group-hover:scale-110">
                {item.icon(active)}
              </div>
              <span className={`text-[8px] uppercase tracking-[0.2em] font-bold transition-colors duration-500 ${active ? 'text-amber-400' : 'text-slate-600'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
