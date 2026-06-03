'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Archive, FlaskConical, User } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Collection', href: '/collection', Icon: Archive },
  { label: 'Lab',        href: '/layering',   Icon: FlaskConical },
  { label: 'You',        href: '/you',        Icon: User },
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
      <div
        className="mx-auto grid h-14 max-w-md items-center"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
      >
        {NAV_ITEMS.map(({ label, href, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 py-1 min-h-[44px]"
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={22}
                strokeWidth={1.75}
                fill={isActive ? 'var(--accent)' : 'none'}
                color={isActive ? 'var(--accent)' : 'var(--text-muted)'}
                style={{ transition: `color var(--motion-fast), fill var(--motion-fast)` }}
              />
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
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
