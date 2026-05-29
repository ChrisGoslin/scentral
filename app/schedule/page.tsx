'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Sun, Wind, Droplets, MapPin, Clock, Sparkles, Star, MessageCircle } from 'lucide-react';
import AudioChord from '../components/AudioChord';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface WeatherNode {
  temp: number;
  condition: 'Clear' | 'Rain' | 'Humid' | 'Cold';
  humidity: number;
  location: string;
}

interface ScheduleNode {
  phase: string;
  time: string;
  color: string;
  title: string;
  desc: string;
  bottle: string;
  brand: string;
}

interface Protocol {
  id?: string;
  title: string;
  narrative: string;
  schedule: ScheduleNode[];
}

export default function PredictiveEngine() {
  const [weather, setWeather] = useState<WeatherNode | null>(null);
  const [mounted, setMounted] = useState(false);
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [wardrobe, setWardrobe] = useState<any[]>([]);
  
  // Reflection State
  const [showReflection, setShowReflection] = useState(false);
  const [reflection, setReflection] = useState({ rating: 5, compliments: 0, notes: '' });
  const [savingReflection, setSavingReflection] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => {
      setWeather({
        temp: 18,
        condition: 'Humid',
        humidity: 82,
        location: 'Dublin, IE'
      });
    }, 1000);

    async function fetchWardrobe() {
      const { data: { session } } = await supabase.auth.getSession();
      let query = supabase.from('fragrances').select('brand, name, primary_vector, notes');
      if (session?.user) query = query.eq('user_id', session.user.id);
      else query = query.eq('is_public', true).limit(10);

      const { data } = await query;
      if (data && data.length > 0) setWardrobe(data);
    }
    fetchWardrobe();
  }, []);

  async function handleConsultAlchemist() {
    if (!intent.trim() || !weather || wardrobe.length === 0) return;
    setLoading(true);
    setProtocol(null);
    setShowReflection(false);

    try {
      const res = await fetch('/api/sommelier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent, weather, wardrobe })
      });

      const data = await res.json();
      if (res.ok) setProtocol(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function saveToArchives() {
    if (!protocol) return;
    // Logic to save protocol to Supabase 'wear_logs' would go here
    setShowReflection(true);
  }

  async function submitReflection() {
    if (!protocol) return;
    setSavingReflection(true);
    
    try {
      const res = await fetch('/api/sommelier/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocol_id: protocol.id || 'generated',
          rating: reflection.rating,
          compliments: reflection.compliments,
          notes: reflection.notes
        })
      });

      if (res.ok) {
        setShowReflection(false);
        setProtocol(null);
        setIntent('');
        alert("The Alchemist has recorded your wisdom. Future formulations will be more precise.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingReflection(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06070a] via-[#071022] to-[#0b0f13] text-white pt-24 pb-32">
      <div className="max-w-5xl mx-auto px-6 space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-3 text-amber-400/80 mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">The Alchemist Online</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">Daily Ritual</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl relative z-20 shadow-2xl">
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">Set The Vibe</h3>
              <textarea
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="e.g. 'I have a high-stakes meeting at noon and a date tonight.'"
                rows={4}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition resize-none mb-4"
              />
              <button
                onClick={handleConsultAlchemist}
                disabled={loading || !intent.trim()}
                className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-900 font-bold py-3 px-4 rounded-xl transition uppercase tracking-widest text-xs shadow-lg"
              >
                <Sparkles size={14} />
                {loading ? 'Synthesizing...' : 'Consult Alchemist'}
              </button>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden">
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-6">Local Telemetry</h3>
              {weather && (
                <div className="space-y-6">
                  <div className="flex items-end gap-2 text-white">
                    <span className="text-5xl font-light">{weather.temp}°</span>
                    <span className="text-xl text-slate-400 mb-1">{weather.condition}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#06070a] rounded-2xl p-4 border border-slate-800/50">
                      <Droplets className="text-blue-400 mb-2" size={20} />
                      <div className="text-2xl font-semibold">{weather.humidity}%</div>
                      <div className="text-[10px] text-slate-500">Humidity</div>
                    </div>
                    <div className="bg-[#06070a] rounded-2xl p-4 border border-slate-800/50">
                      <Wind className="text-slate-300 mb-2" size={20} />
                      <div className="text-2xl font-semibold text-white">14</div>
                      <div className="text-[10px] text-slate-500">Wind</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
             <div className="bg-[#0a0f18]/80 border border-slate-800 rounded-4xl p-8 min-h-[500px] backdrop-blur-3xl relative flex flex-col shadow-2xl overflow-hidden">
                {!protocol && !loading && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                     <span className="text-6xl mb-4 opacity-50">⚗️</span>
                     <p className="text-lg italic font-serif">The Alchemist awaits your intent.</p>
                   </div>
                )}

                {loading && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-500">
                     <div className="w-24 h-24 border-2 border-amber-500/20 border-t-amber-400 rounded-full animate-spin mb-6" />
                     <p className="tracking-[0.3em] uppercase text-[10px] font-bold animate-pulse">Consulting Olfactory Archives...</p>
                   </div>
                )}

                {protocol && !loading && !showReflection && (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex-1">
                    <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-6">
                      <h3 className="text-3xl font-serif italic text-amber-50">{protocol.title}</h3>
                      <button 
                        onClick={saveToArchives}
                        className="text-[10px] uppercase tracking-widest font-bold px-5 py-2.5 bg-amber-400 text-slate-900 rounded-full transition hover:bg-amber-300 shadow-xl shadow-amber-900/10"
                      >
                        Enshrine Daily Log
                      </button>
                    </div>
                    <div className="space-y-8 relative">
                       <div className="absolute left-[39px] top-10 bottom-10 w-[1px] bg-slate-800" />
                       {protocol.schedule.map((node, i) => (
                         <ProtocolNode key={i} {...node} />
                       ))}
                    </div>
                  </motion.div>
                )}

                {showReflection && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full text-center space-y-8">
                     <div className="space-y-2">
                       <h3 className="text-4xl font-serif italic text-amber-400">Evening Reflection</h3>
                       <p className="text-slate-400">How did "{protocol?.title}" resonate today?</p>
                     </div>
                     
                     <div className="flex justify-center gap-4">
                        {[1,2,3,4,5].map(star => (
                          <Star 
                            key={star} 
                            onClick={() => setReflection({...reflection, rating: star})}
                            className={`cursor-pointer transition-colors ${reflection.rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} 
                            size={32} 
                          />
                        ))}
                     </div>

                     <div className="space-y-4 text-left">
                        <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold">Compliment Factor</label>
                        <div className="flex gap-2">
                           {[0, 1, 2, '3+'].map(num => (
                             <button 
                                key={num}
                                onClick={() => setReflection({...reflection, compliments: typeof num === 'string' ? 3 : num})}
                                className={`flex-1 py-2 rounded-lg border transition ${reflection.compliments === (typeof num === 'string' ? 3 : num) ? 'bg-amber-400 text-slate-900 border-amber-400' : 'border-slate-800 text-slate-400 hover:border-slate-600'}`}
                             >
                               {num}
                             </button>
                           ))}
                        </div>
                     </div>

                     <textarea 
                        value={reflection.notes}
                        onChange={(e) => setReflection({...reflection, notes: e.target.value})}
                        placeholder="Log any anomalies or shifts in the scent arc..."
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-sm focus:border-amber-400/50 transition resize-none h-32"
                     />

                     <button 
                        onClick={submitReflection}
                        disabled={savingReflection}
                        className="w-full bg-slate-100 text-slate-950 font-bold py-4 rounded-2xl transition hover:bg-white disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                        {savingReflection ? 'Recording Wisdom...' : 'Complete Daily Ritual'}
                        {!savingReflection && <Sparkles size={16} />}
                     </button>
                  </motion.div>
                )}
             </div>
          </div>
        </div>
      </div>
      <aside className="fixed bottom-8 right-8 z-50">
        <AudioChord />
      </aside>
    </div>
  );
}

function ProtocolNode({ phase, time, color, title, desc, bottle, brand }: ScheduleNode) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-6 relative z-10 group">
      <div className="flex flex-col items-center mt-1">
        <div className={`w-20 h-20 rounded-full ${color}/5 border border-white/5 flex items-center justify-center backdrop-blur-sm group-hover:border-white/10 transition-colors`}>
          <div className={`w-3 h-3 rounded-full ${color} shadow-[0_0_20px_currentColor]`} />
        </div>
      </div>
      <div className="flex-1 bg-white/2 border border-white/5 rounded-3xl p-6 transition group-hover:bg-white/5 group-hover:border-white/10 shadow-xl">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold">{phase}</span>
          <span className="text-[10px] font-mono text-amber-400/70 bg-black/40 px-3 py-1 rounded-full">{time}</span>
        </div>
        <h4 className="text-lg font-medium text-white mb-2">{title}</h4>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">{desc}</p>
        <div className="flex items-center gap-3 pt-5 border-t border-white/5">
           <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg">✨</div>
           <div>
             <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Vessel selection</div>
             <div className="text-sm font-semibold text-slate-200">{bottle} <span className="text-slate-500 font-normal ml-1">· {brand}</span></div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
