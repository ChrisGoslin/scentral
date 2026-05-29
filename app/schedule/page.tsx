'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Sun, Wind, Droplets, MapPin, Clock, Sparkles } from 'lucide-react';
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

  useEffect(() => {
    setMounted(true);
    // Simulate fetching local telemetry (Ready for real API hookup)
    setTimeout(() => {
      setWeather({
        temp: 18,
        condition: 'Humid',
        humidity: 82,
        location: 'Dublin, IE'
      });
    }, 1000);

    // Fetch user's wardrobe
    async function fetchWardrobe() {
      const { data: { session } } = await supabase.auth.getSession();
      let query = supabase.from('fragrances').select('brand, name, primary_vector, notes');
      
      if (session?.user) {
        query = query.eq('user_id', session.user.id);
      } else {
        query = query.eq('is_public', true).limit(10); // Fallback to public for demo
      }

      const { data } = await query;
      if (data && data.length > 0) {
        setWardrobe(data);
      } else {
        // Ultimate fallback if completely empty
        setWardrobe([
          { brand: 'Lattafa', name: 'His Confession', primary_vector: 'Woody Powdery', notes: 'Spices, Lavender, Iris, Vanilla' },
          { brand: 'Afnan', name: 'Turathi Blue', primary_vector: 'Woody Citrus', notes: 'Grapefruit, Ambroxan, Woods' }
        ]);
      }
    }
    
    fetchWardrobe();
  }, []);

  async function handleConsultAlchemist() {
    if (!intent.trim() || !weather || wardrobe.length === 0) return;
    setLoading(true);
    setProtocol(null);

    try {
      const res = await fetch('/api/sommelier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent,
          weather,
          wardrobe
        })
      });

      const data = await res.json();
      if (res.ok) {
        setProtocol(data);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">Daily Ritual</h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl">
            State your intent for the day. The Alchemist will synthesize local atmospheric telemetry and your wardrobe to construct a bespoke sillage architecture.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Input & Telemetry */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Intent Input */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl relative z-20">
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">Set The Vibe</h3>
              <textarea
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="e.g. 'I have a high-stakes meeting at noon and a date tonight. I want to build around His Confession.'"
                rows={4}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition resize-none mb-4"
              />
              <button
                onClick={handleConsultAlchemist}
                disabled={loading || !intent.trim()}
                className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-900 font-bold py-3 px-4 rounded-xl transition uppercase tracking-widest text-xs"
              >
                <Sparkles size={14} />
                {loading ? 'Synthesizing...' : 'Consult Alchemist'}
              </button>
            </div>

            {/* Telemetry Panel */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <MapPin size={120} />
              </div>
              <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-6">Local Telemetry</h3>
              
              {!weather ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-8 bg-slate-800 rounded w-1/2" />
                  <div className="h-12 bg-slate-800 rounded w-3/4" />
                </div>
              ) : (
                <div className="space-y-6 relative z-10">
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-light">{weather.temp}°</span>
                    <span className="text-xl text-slate-400 mb-1">{weather.condition}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#06070a] rounded-2xl p-4 border border-slate-800/50">
                      <Droplets className="text-blue-400 mb-2" size={20} />
                      <div className="text-2xl font-semibold">{weather.humidity}%</div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">Humidity</div>
                    </div>
                    <div className="bg-[#06070a] rounded-2xl p-4 border border-slate-800/50">
                      <Wind className="text-slate-300 mb-2" size={20} />
                      <div className="text-2xl font-semibold">14<span className="text-sm text-slate-500">km/h</span></div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">Wind</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-800/50 flex justify-between items-center text-xs text-slate-400">
                    <span>{weather.location}</span>
                    <span><Clock size={12} className="inline mr-1" /> {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              )}
            </div>

            {protocol && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-amber-950/20 border border-amber-900/30 rounded-3xl p-6 backdrop-blur-xl"
               >
                 <h3 className="text-xs uppercase tracking-widest text-amber-500/70 font-bold mb-3">Alchemist Synthesis</h3>
                 <p className="text-sm text-amber-100/70 leading-relaxed italic">
                   "{protocol.narrative}"
                 </p>
               </motion.div>
            )}
          </div>

          {/* Sillage Recommendation (Right Column) */}
          <div className="lg:col-span-2">
             <div className="bg-[#0a0f18]/80 border border-slate-800 rounded-3xl p-8 min-h-[500px] backdrop-blur-2xl relative flex flex-col">
                
                {!protocol && !loading && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                     <span className="text-6xl mb-4 opacity-50">⚗️</span>
                     <p className="text-lg">The Alchemist awaits your intent.</p>
                     <p className="text-sm opacity-60">Enter a vibe to generate today's Spritz Schedule.</p>
                   </div>
                )}

                {loading && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-amber-500/50">
                     <div className="w-24 h-24 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin mb-6" />
                     <p className="tracking-[0.2em] uppercase text-xs font-bold animate-pulse">Calculating Olfactory Kinematics...</p>
                   </div>
                )}

                {protocol && !loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
                    <div className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-4">
                      <h3 className="text-2xl font-semibold">Protocol: {protocol.title}</h3>
                      <button className="text-[10px] uppercase tracking-widest font-bold px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full transition text-slate-300">
                        Log to Archives
                      </button>
                    </div>

                    <div className="space-y-6 relative">
                       {/* Connection Line */}
                       <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-amber-500/50 via-violet-500/50 to-sky-500/50" />

                       {protocol.schedule.map((node, i) => (
                         <ProtocolNode key={i} {...node} />
                       ))}
                    </div>
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
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-6 relative z-10"
    >
      <div className="flex flex-col items-center mt-1">
        <div className={`w-20 h-20 rounded-full ${color}/10 border border-slate-600/30 flex items-center justify-center backdrop-blur-md`}>
          <div className={`w-4 h-4 rounded-full ${color} shadow-[0_0_15px_currentColor]`} />
        </div>
      </div>
      
      <div className="flex-1 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700 transition group">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{phase}</span>
          <span className="text-xs font-mono text-amber-400/80 bg-[#06070a] border border-slate-800 px-2 py-1 rounded-md shadow-inner">{time}</span>
        </div>
        <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
        <p className="text-sm text-slate-400 mb-4 leading-relaxed">{desc}</p>
        
        <div className="flex items-center gap-3 pt-4 border-t border-slate-800/50">
           <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs border border-slate-700">🧪</div>
           <div>
             <div className="text-[10px] uppercase tracking-widest text-slate-500">Extract Required</div>
             <div className="text-sm font-medium text-slate-200">{bottle} <span className="text-slate-500 font-normal ml-1">by {brand}</span></div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
