'use client';

import { useState, useMemo } from 'react';
import AudioChord from '../components/AudioChord';

interface Fragrance {
  id: string;
  brand: string;
  name: string;
  primary_vector: string;
  image_url?: string | null;
}

interface DNAMatchResult {
  success: boolean;
  score: number;
  category: string;
  narrative: string;
  cached: boolean;
}

const PALETTE = {
  bg: '#06070a',
  bgSecondary: '#0d1324',
  accent: '#f5b76a', // Amber/Gold
  accentGreen: '#4ade80',
  accentBlue: '#38bdf8',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#1e293b',
};

export default function ResonanceClient({ fragrances }: { fragrances: Fragrance[] }) {
  const [fragA, setFragA] = useState<Fragrance | null>(null);
  const [fragB, setFragB] = useState<Fragrance | null>(null);
  const [result, setResult] = useState<DNAMatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');

  const filteredA = useMemo(
    () =>
      fragrances.filter(
        (f) =>
          `${f.brand} ${f.name}`.toLowerCase().includes(searchA.toLowerCase()) && f.id !== fragB?.id
      ),
    [searchA, fragB, fragrances]
  );

  const filteredB = useMemo(
    () =>
      fragrances.filter(
        (f) =>
          `${f.brand} ${f.name}`.toLowerCase().includes(searchB.toLowerCase()) && f.id !== fragA?.id
      ),
    [searchB, fragA, fragrances]
  );

  const handleFindMatch = async () => {
    if (!fragA || !fragB) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/dna-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fragrance_a_id: fragA.id,
          fragrance_b_id: fragB.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResult(data);
        setExpanded(false);
      } else {
        console.error('Resonance synthesis failed:', data.error);
      }
    } catch (error) {
      console.error('Request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryColor = result
    ? result.category.includes('Twin')
      ? PALETTE.accentGreen
      : result.category.includes('Strategic')
        ? PALETTE.accent
        : result.category.includes('Homage')
          ? PALETTE.accentBlue
          : result.category.includes('Cousin')
            ? PALETTE.textMuted
            : PALETTE.textMuted
    : PALETTE.accent;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
      <header className="space-y-2">
        <h1 className="text-5xl font-bold tracking-tight">Olfactory Resonance</h1>
        <p className="text-slate-400 text-lg">Synthesize the chemical harmony between two essences.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <FragrancePicker
          label="Essence Alpha"
          selected={fragA}
          search={searchA}
          onSearchChange={setSearchA}
          filtered={filteredA}
          onSelect={setFragA}
        />

        <FragrancePicker
          label="Essence Beta"
          selected={fragB}
          search={searchB}
          onSearchChange={setSearchB}
          filtered={filteredB}
          onSelect={setFragB}
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleFindMatch}
          disabled={!fragA || !fragB || loading}
          className={`w-full max-w-sm py-4 rounded-2xl font-bold text-lg transition-all shadow-xl ${
            !fragA || !fragB || loading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-amber-400 text-slate-900 hover:bg-amber-300 active:scale-95'
          }`}
        >
          {loading ? 'Synthesizing Resonance...' : 'Find Resonance'}
        </button>
      </div>

      {result && (
        <div className="fade-up bg-slate-900/50 border border-slate-800 rounded-3xl p-10 backdrop-blur-xl text-center space-y-8">
          <ScoreRing score={result.score} />

          <div className="space-y-4">
            <div
              className="inline-block px-6 py-2 rounded-full border-2 font-bold text-sm uppercase tracking-widest"
              style={{ borderColor: categoryColor, color: categoryColor }}
            >
              {result.category}
            </div>
            
            <div className="max-w-xl mx-auto">
              <button 
                onClick={() => setExpanded(!expanded)}
                className="text-amber-400/80 hover:text-amber-300 transition text-sm font-medium"
              >
                {expanded ? 'Hide Editorial Note ▲' : 'Read Editorial Note ▼'}
              </button>
              
              {expanded && (
                <div className="mt-6 p-6 bg-slate-950/50 rounded-2xl text-slate-300 italic leading-relaxed">
                  {result.narrative}
                </div>
              )}
            </div>
          </div>

          {result.cached && <div className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">🔄 Retrieved from Archives</div>}
        </div>
      )}

      <aside className="fixed bottom-8 right-8 z-50">
        <AudioChord />
      </aside>
    </div>
  );
}

function FragrancePicker({
  label,
  selected,
  search,
  onSearchChange,
  filtered,
  onSelect,
}: {
  label: string;
  selected: Fragrance | null;
  search: string;
  onSearchChange: (s: string) => void;
  filtered: Fragrance[];
  onSelect: (f: Fragrance | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-widest text-amber-400/80">{label}</label>
      
      {!selected ? (
        <input
          type="text"
          placeholder="Search essences..."
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-4 focus:outline-none focus:border-amber-400/50 transition text-white placeholder-slate-600"
        />
      ) : (
        <div className="flex items-center gap-4 bg-slate-900 border border-amber-400/30 rounded-2xl p-4 shadow-lg group">
          {selected.image_url && (
            <img src={selected.image_url} alt="" className="w-12 h-12 object-contain rounded-lg" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{selected.brand}</p>
            <p className="text-white font-semibold truncate">{selected.name}</p>
          </div>
          <button 
            onClick={() => onSelect(null)} 
            className="text-slate-600 hover:text-red-400 transition"
          >
            ×
          </button>
        </div>
      )}

      {open && !selected && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
          {filtered.slice(0, 8).map((f) => (
            <div
              key={f.id}
              onClick={() => {
                onSelect(f);
                onSearchChange('');
                setOpen(false);
              }}
              className="px-5 py-4 cursor-pointer hover:bg-slate-800 border-b border-slate-800 last:border-0 transition flex items-center gap-4"
            >
              {f.image_url && <img src={f.image_url} alt="" className="w-8 h-8 object-contain opacity-70" />}
              <div className="flex-1 min-w-0">
                <p className="text-slate-500 text-[10px] uppercase font-bold">{f.brand}</p>
                <p className="text-slate-200 text-sm truncate">{f.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
      <svg width="160" height="160" viewBox="0 0 120 120" className="transform -rotate-90">
        <circle cx="60" cy="60" r="45" fill="none" stroke="#1e293b" strokeWidth="2" />
        <circle
          cx="60"
          cy="60"
          r="45"
          fill="none"
          stroke="url(#resonance-gradient)"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="resonance-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f5b76a" />
            <stop offset="100%" stopColor="#f87171" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0">
        <span className="text-4xl font-bold text-white tracking-tighter">{score}</span>
        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Harmony</span>
      </div>
    </div>
  );
}
