'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { label: 'Collection', href: '/collection' },
  { label: 'Lab',        href: '/layering'   },
  { label: 'Schedule',   href: '/schedule'   },
  { label: 'You',        href: '/you'         },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--line)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="mx-auto grid h-14 max-w-md items-center gap-1" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 py-1 min-h-[44px]"
            >
              <span
                style={{
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  fontWeight: 700,
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  transition: `color var(--motion-fast)`,
                }}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-underline"
                  className="rounded-full"
                  style={{ height: 2, width: 16, background: 'var(--accent)' }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
