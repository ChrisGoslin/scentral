'use client'

import React from 'react'
import { Info } from 'lucide-react'

type SpritzZone = {
  id: string
  label: string
  fact: string
  coordinates: { x: number; y: number } // Percentage based
}

const ZONES: Record<string, SpritzZone> = {
  'neck': {
    id: 'neck',
    label: 'Neck',
    fact: 'Pulse points here provide high projection.',
    coordinates: { x: 50, y: 25 }
  },
  'wrists': {
    id: 'wrists',
    label: 'Wrists',
    fact: 'Classic spot, but avoid rubbing them together!',
    coordinates: { x: 30, y: 60 }
  },
  'chest': {
    id: 'chest',
    label: 'Chest',
    fact: 'Creates a scent cloud that rises to your nose.',
    coordinates: { x: 50, y: 40 }
  },
  'behind-ears': {
    id: 'behind-ears',
    label: 'Behind Ears',
    fact: 'Great for intimacy and "scent trails".',
    coordinates: { x: 55, y: 20 }
  },
  'inner-elbows': {
    id: 'inner-elbows',
    label: 'Inner Elbows',
    fact: 'Warm area that helps scent last longer.',
    coordinates: { x: 25, y: 50 }
  }
}

interface SensoryAnatomyProps {
  zone?: string
  className?: string
}

export default function SensoryAnatomy({ zone, className }: SensoryAnatomyProps) {
  const normalizedZone = zone?.toLowerCase().replace(/\s+/g, '-') || ''
  const activeZone = ZONES[normalizedZone] || ZONES['neck'] // Default to neck if unknown

  return (
    <div className={`flex flex-col gap-4 p-4 rounded-[var(--r-card)] ${className}`} style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}>
      <div className="flex items-center gap-2">
        <div 
          className="relative w-24 h-32 bg-[var(--surface-2)] rounded-full overflow-hidden flex-shrink-0"
        >
          {/* Simple abstract human silhouette representation */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[var(--text-muted)] opacity-20" />
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-14 h-20 rounded-t-full bg-[var(--text-muted)] opacity-20" />
          
          {/* Active zone indicator */}
          <div 
            className="absolute w-3 h-3 rounded-full bg-[var(--accent)] animate-pulse"
            style={{ 
              left: `${activeZone.coordinates.x}%`, 
              top: `${activeZone.coordinates.y}%`,
              boxShadow: '0 0 8px var(--accent)'
            }}
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Spritz Zone: {activeZone.label}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: '18px', fontWeight: 500 }}>
            {activeZone.label}
          </p>
          <div className="flex items-start gap-1.5 mt-1">
            <Info size={12} className="text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: '16px', fontStyle: 'italic' }}>
              {activeZone.fact}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
