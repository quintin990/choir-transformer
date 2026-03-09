import React, { useState } from 'react';
import { GitCompare, Zap, Activity, BarChart2, Sliders, CheckCircle } from 'lucide-react';

const FEATURES = [
  { icon: Activity, label: 'Loudness Matching', desc: 'LUFS-accurate loudness alignment to any reference' },
  { icon: BarChart2, label: 'Tonal Balance', desc: 'EQ curve matching across the full frequency spectrum' },
  { icon: Sliders, label: 'Dynamic Range', desc: 'Compression and transient shaping to match dynamics' },
  { icon: GitCompare, label: 'Side-by-side Compare', desc: 'A/B your mix against the reference in real time' },
];

export default function Match() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = (e) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 space-y-14">
      {/* Hero */}
      <div className="text-center space-y-5">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full"
          style={{ backgroundColor: '#FFB02015', color: '#FFB020', border: '1px solid #FFB02030' }}>
          <Zap className="w-3 h-3" /> Coming Soon
        </div>

        <div className="relative mx-auto w-20 h-20">
          {/* Glow rings */}
          <div className="absolute inset-0 rounded-full animate-pulse" style={{ backgroundColor: '#1EA0FF08', transform: 'scale(1.6)' }} />
          <div className="absolute inset-0 rounded-full" style={{ backgroundColor: '#1EA0FF10', transform: 'scale(1.3)' }} />
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
            style={{ backgroundColor: '#0F1A2E', border: '1px solid #1C3A5E' }}>
            <GitCompare className="w-9 h-9" style={{ color: '#1EA0FF' }} />
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-3" style={{ color: '#EAF2FF', letterSpacing: '-0.03em' }}>Match</h1>
          <p className="text-base leading-relaxed max-w-md mx-auto" style={{ color: '#9CB2D6' }}>
            Instantly align your mix to any reference track — loudness, tonal balance, and dynamics, automatically.
          </p>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FEATURES.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="rounded-xl p-4 flex gap-3.5"
            style={{ backgroundColor: '#0F1A2E', border: '1px solid #1C2A44' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: '#1EA0FF12' }}>
              <Icon className="w-4 h-4" style={{ color: '#1EA0FF' }} />
            </div>
            <div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: '#EAF2FF' }}>{label}</p>
              <p className="text-xs leading-relaxed" style={{ color: '#9CB2D6' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Notify form */}
      <div className="rounded-2xl p-6 text-center space-y-4"
        style={{ backgroundColor: '#0F1A2E', border: '1px solid #1C2A44' }}>
        {submitted ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <CheckCircle className="w-7 h-7" style={{ color: '#19D3A2' }} />
            <p className="text-sm font-semibold" style={{ color: '#EAF2FF' }}>You're on the list!</p>
            <p className="text-xs" style={{ color: '#9CB2D6' }}>We'll notify you as soon as Match launches.</p>
          </div>
        ) : (
          <>
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: '#EAF2FF' }}>Get early access</p>
              <p className="text-xs" style={{ color: '#9CB2D6' }}>Be the first to know when Match goes live.</p>
            </div>
            <form onSubmit={handleNotify} className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 h-9 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF' }}
              />
              <button type="submit"
                className="h-9 px-4 rounded-lg text-sm font-semibold shrink-0"
                style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
                Notify me
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}