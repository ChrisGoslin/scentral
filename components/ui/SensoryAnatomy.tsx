'use client'

import React from 'react'

/**
 * SensoryAnatomy — minimal body silhouette showing fragrance application zones.
 * `zone` is a comma-separated string from the fragrances table, e.g. "wrist, neck" or "pulse points".
 */

type Zone = {
  id: string
  label: string
  // position on the SVG canvas (cx, cy as % of 80×200 viewBox)
  cx: number
  cy: number
}

const KNOWN_ZONES: Zone[] = [
  { id: 'neck',         label: 'Neck',         cx: 40, cy: 38  },
  { id: 'chest',        label: 'Chest',        cx: 40, cy: 68  },
  { id: 'wrist',        label: 'Wrists',       cx: 14, cy: 108 },
  { id: 'elbow',        label: 'Inner elbow',  cx: 16, cy: 90  },
  { id: 'behind ears',  label: 'Behind ears',  cx: 28, cy: 28  },
  { id: 'pulse points', label: 'Pulse points', cx: 40, cy: 108 },
  { id: 'hair',         label: 'Hair',         cx: 40, cy: 12  },
  { id: 'behind knee',  label: 'Knees',        cx: 40, cy: 158 },
  { id: 'ankle',        label: 'Ankles',       cx: 40, cy: 180 },
]

function matchZones(zone: string): Zone[] {
  const parts = zone.toLowerCase().split(/[,/]+/).map(s => s.trim()).filter(Boolean)
  const matched: Zone[] = []
  for (const part of parts) {
    const z = KNOWN_ZONES.find(z => z.id === part || part.includes(z.id) || z.id.includes(part))
    if (z && !matched.find(m => m.id === z.id)) matched.push(z)
  }
  // Fallback: if nothing matched, default to neck + wrist
  if (matched.length === 0) {
    const fallback = KNOWN_ZONES.filter(z => z.id === 'neck' || z.id === 'wrist')
    return fallback
  }
  return matched
}

interface SensoryAnatomyProps {
  zone: string | null | undefined
}

export default function SensoryAnatomy({ zone }: SensoryAnatomyProps) {
  if (!zone) return null

  const activeZones = matchZones(zone)

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-card)',
        padding: '14px 16px',
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
      }}
    >
      {/* Body SVG */}
      <svg
        viewBox="0 0 80 200"
        width={48}
        height={120}
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        {/* Minimal body silhouette */}
        {/* Head */}
        <ellipse cx="40" cy="16" rx="11" ry="13" fill="none" stroke="var(--line)" strokeWidth="1.5" />
        {/* Neck */}
        <rect x="36" y="28" width="8" height="8" rx="1" fill="none" stroke="var(--line)" strokeWidth="1.5" />
        {/* Torso */}
        <path d="M24 36 Q16 44 14 80 Q14 100 22 104 L58 104 Q66 100 66 80 Q64 44 56 36 Z"
          fill="none" stroke="var(--line)" strokeWidth="1.5" />
        {/* Left arm */}
        <path d="M24 40 Q10 60 10 90 Q10 100 14 104" fill="none" stroke="var(--line)" strokeWidth="1.5" />
        {/* Right arm */}
        <path d="M56 40 Q70 60 70 90 Q70 100 66 104" fill="none" stroke="var(--line)" strokeWidth="1.5" />
        {/* Left wrist/hand */}
        <ellipse cx="13" cy="108" rx="4" ry="5" fill="none" stroke="var(--line)" strokeWidth="1.5" />
        {/* Right wrist/hand */}
        <ellipse cx="67" cy="108" rx="4" ry="5" fill="none" stroke="var(--line)" strokeWidth="1.5" />
        {/* Left leg */}
        <path d="M30 104 Q26 140 26 160 Q26 176 30 184" fill="none" stroke="var(--line)" strokeWidth="1.5" />
        {/* Right leg */}
        <path d="M50 104 Q54 140 54 160 Q54 176 50 184" fill="none" stroke="var(--line)" strokeWidth="1.5" />

        {/* Active zone dots */}
        {activeZones.map(z => (
          <g key={z.id}>
            <circle cx={z.cx} cy={z.cy} r="5" fill="var(--accent)" opacity="0.9" />
            <circle cx={z.cx} cy={z.cy} r="7" fill="var(--accent)" opacity="0.2" />
          </g>
        ))}
      </svg>

      {/* Zone labels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 2 }}>
        <p style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: 'var(--text-muted)', margin: 0,
        }}>
          Application zones
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {activeZones.map(z => (
            <span
              key={z.id}
              style={{
                fontSize: 12, fontWeight: 500,
                background: 'var(--surface-2)', border: '1px solid var(--accent)',
                color: 'var(--accent)',
                borderRadius: 'var(--r-chip)',
                padding: '3px 10px',
              }}
            >
              {z.label}
            </span>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: '16px' }}>
          {zone}
        </p>
      </div>
    </div>
  )
}
