'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { label: 'Wardrobe', href: '/collection' },
  { label: 'Lab', href: '/layering' },
  { label: 'Ritual', href: '/schedule' },
  { label: 'Identity', href: '/profile' }
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/80 backdrop-blur-md px-2 sm:px-6">
      <div className="mx-auto grid h-16 max-w-md grid-cols-4 items-center">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 group transition-all duration-300"
            >
              <span className={`text-[10px] uppercase tracking-[0.1em] font-bold transition-colors duration-300 ${active ? 'text-[#c49a3c]' : 'text-stone-400 group-hover:text-stone-600'}`}>
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="nav-underline"
                  className="h-0.5 w-4 bg-[#c49a3c]"
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
