'use client';

// The Global Sillage — Ambient Social Network
// Replaces the legacy "Reddit-style" community feed with a passive, WebGL-inspired data visualization.

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import type { Fragrance } from '@/lib/types';
import AudioChord from '../components/AudioChord';

const supabase = createClient();

type SillageNode = Pick<Fragrance, 'id' | 'name' | 'brand' | 'primary_vector' | 'created_at'> & {
  x: number;
  y: number;
  size: number;
  delay: number;
};

export default function GlobalSillagePage() {
  const [nodes, setNodes] = useState<SillageNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<SillageNode | null>(null);

  useEffect(() => {
    async function loadSillage() {
      const { data, error } = await supabase
        .from('fragrances')
        .select('id, name, brand, primary_vector, created_at')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(40);

      if (!error && data) {
        // Map database rows into physical nodes for the ambient canvas
        const mapped = data.map((f) => ({
          ...f,
          x: Math.random() * 80 + 10, // 10% to 90% vw
          y: Math.random() * 70 + 15, // 15% to 85% vh
          size: Math.random() * 40 + 20, // 20px to 60px
          delay: Math.random() * 5,
        }));
        setNodes(mapped);
      }
      setLoading(false);
    }

    loadSillage();
  }, []);

  // Helper to color the orbs based on the Scent DNA vector
  const getColor = (vector: string | null) => {
    const v = (vector || '').toLowerCase();
    if (v.includes('wood') || v.includes('oud') || v.includes('amber')) return 'bg-amber-500 shadow-amber-500/50';
    if (v.includes('fresh') || v.includes('aquatic') || v.includes('citrus')) return 'bg-sky-400 shadow-sky-400/50';
    if (v.includes('floral') || v.includes('rose')) return 'bg-purple-500 shadow-purple-500/50';
    if (v.includes('spice') || v.includes('vanilla') || v.includes('gourmand')) return 'bg-rose-500 shadow-rose-500/50';
    return 'bg-slate-400 shadow-slate-400/50'; // Fallback
  };

  return (
    <div className="min-h-screen bg-[#020305] text-white overflow-hidden relative">
      {/* HUD Header */}
      <header className="absolute top-8 left-8 z-50 space-y-1 pointer-events-none">
        <h1 className="text-2xl font-bold tracking-widest uppercase text-slate-200">The Global Sillage</h1>
        <p className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live Ambient Telemetry
        </p>
      </header>

      {/* The Ambient Canvas */}
      <main className="absolute inset-0 w-full h-full">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-slate-700 text-xs uppercase tracking-[0.3em] animate-pulse">Syncing Atmosphere...</div>
          </div>
        ) : (
          nodes.map((node) => (
            <motion.div
              key={node.id}
              className={`absolute rounded-full shadow-[0_0_30px_currentColor] mix-blend-screen cursor-pointer ${getColor(node.primary_vector)}`}
              style={{
                width: node.size,
                height: node.size,
                left: \`\${node.x}%\`,
                top: \`\${node.y}%\`,
              }}
              animate={{
                y: [\`\${node.y}%\`, \`\${node.y - 5}%\`, \`\${node.y}%\`],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: node.delay,
                ease: 'easeInOut'
              }}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            />
          ))
        )}
      </main>

      {/* Hover Info Panel (Zero-Click Acquisition hook) */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/80 backdrop-blur-2xl border border-slate-700 rounded-3xl p-6 shadow-2xl min-w-[320px] pointer-events-auto"
          >
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 flex justify-between">
              <span>Radiating Now</span>
              <span>{hoveredNode.primary_vector || 'Unknown Vector'}</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{hoveredNode.name}</h3>
            <p className="text-slate-400 text-sm mb-4">{hoveredNode.brand}</p>
            
            <div className="flex gap-3">
              <button className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-900 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition">
                Extract Decant
              </button>
              <button className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition border border-slate-600">
                + Wardrobe
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="fixed bottom-8 right-8 z-50 pointer-events-none">
        <AudioChord />
      </aside>
    </div>
  );
}
