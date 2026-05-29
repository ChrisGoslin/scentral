'use client';

// The Lexicon — a repository of olfactory wisdom and personal insights.

import { useState, useEffect } from 'react';
import AudioChord from '../components/AudioChord';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
}

const STORAGE_KEY = 'lexicon-wisdom';

const categories = [
  'Olfactory Families',
  'Layering Protocols',
  'Projection & Sillage',
  'Longevity Dynamics',
  'Chemical Resonance',
  'Other',
];

function readStoredNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Note[]) : [];
  } catch {
    return [];
  }
}

export default function LexiconPage() {
  const [notes, setNotes] = useState<Note[]>(readStoredNotes);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [showAddSection, setShowAddSection] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // Silent failure for storage issues
    }
  }, [notes]);

  const addNote = () => {
    if (!title.trim() || !content.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      category,
      createdAt: new Date().toISOString(),
    };

    setNotes([newNote, ...notes]);
    setTitle('');
    setContent('');
    setShowAddSection(false);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06070a] via-[#071022] to-[#0b0f13] text-white">
      <main className="max-w-4xl mx-auto px-6 py-16 space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold tracking-tight">The Lexicon</h1>
            <p className="text-slate-400 text-lg">
              Capture your observations on olfactory science and artistry.
            </p>
          </div>
          <button
            onClick={() => setShowAddSection(!showAddSection)}
            className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 hover:border-amber-400/50 hover:bg-slate-700 px-6 py-3 rounded-full transition text-sm font-medium"
          >
            {showAddSection ? 'Close Portal' : 'Record Wisdom'}
            <span className="text-amber-400">{showAddSection ? '×' : '＋'}</span>
          </button>
        </header>

        {showAddSection && (
          <section className="fade-up bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl space-y-6">
            <h2 className="text-2xl font-semibold mb-6">New Observation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. The impact of high humidity on Vetiver"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400/50 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400/50 transition appearance-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-900">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4 flex flex-col">
                <div className="flex-1">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Reflections</label>
                  <textarea
                    placeholder="Document your findings..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400/50 transition resize-none h-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={addNote}
                className="bg-amber-400 text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-amber-300 transition shadow-lg"
              >
                Save to Lexicon
              </button>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {notes.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
              <p className="text-slate-500 text-lg">The Lexicon is currently awaiting your first observation.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="group relative bg-slate-900/40 border border-slate-800/80 hover:border-amber-400/20 rounded-3xl p-8 transition-all hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                    {note.category}
                  </span>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition"
                  >
                    ×
                  </button>
                </div>
                
                <h3 className="text-xl font-bold mb-3 group-hover:text-amber-50">{note.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 whiteSpace-pre-wrap">
                  {note.content}
                </p>
                
                <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between">
                  <span className="text-[10px] text-slate-600 font-mono italic">
                    Recorded {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="fixed bottom-8 right-8 z-50">
          <AudioChord />
        </aside>
      </main>
    </div>
  );
}
