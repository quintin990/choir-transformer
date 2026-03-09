import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { GitCompare, Sliders, Waves, Mic2, ArrowRight } from 'lucide-react';
import Card from '../components/auralyn/Card';

export default function Match() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleJoin = async () => {
    if (!email) return;
    try {
      await base44.integrations.Core.InvokeLLM({ prompt: `Waitlist signup for Auralyn Match: ${email}` });
    } catch (_) {}
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-2.5 mb-8">
        <GitCompare className="w-4 h-4" style={{ color: '#9B74FF' }} />
        <h1 className="text-xl font-bold" style={{ color: '#EAF2FF', letterSpacing: '-0.02em' }}>Mix Match</h1>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
          style={{ backgroundColor: '#1C2A44', color: '#9CB2D6' }}>Coming Soon</span>
      </div>

      <Card className="mb-5">
        <p className="text-2xl font-bold mb-2" style={{ color: '#EAF2FF', letterSpacing: '-0.02em' }}>
          Compare your mix to a reference.<br />
          <span style={{ color: '#9B74FF' }}>Get a clear action plan.</span>
        </p>
        <p className="text-sm mb-6" style={{ color: '#9CB2D6' }}>
          Upload your mix and a reference track. Auralyn will produce a technical difference report with concrete steps to close the gap.
        </p>

        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {[
            { icon: Waves,    title: 'Tonal balance diff',   desc: 'Frequency range comparison with suggested EQ adjustments.' },
            { icon: Sliders,  title: 'Loudness and dynamics', desc: 'LUFS delta, dynamic range, and compression guidance.' },
            { icon: Mic2,     title: 'Stereo field guidance', desc: 'Width, correlation, and panning recommendations.' },
            { icon: ArrowRight, title: 'Bus chain export',   desc: 'Settings to import directly into your DAW (future).' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-3 p-3 rounded-lg" style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
              <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#9B74FF' }} />
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: '#EAF2FF' }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: '#9CB2D6' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {submitted ? (
          <div className="text-sm font-medium py-3 text-center rounded-lg"
            style={{ backgroundColor: '#19D3A215', color: '#19D3A2', border: '1px solid #19D3A230' }}>
            You're on the list. We'll let you know when Match launches.
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 rounded-lg px-3 h-10 text-sm outline-none"
              style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF' }}
              onFocus={e => e.target.style.borderColor='#9B74FF'}
              onBlur={e => e.target.style.borderColor='#1C2A44'}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
            />
            <button
              onClick={handleJoin}
              disabled={!email}
              className="px-5 h-10 rounded-lg text-sm font-semibold transition-all disabled:opacity-30"
              style={{ backgroundColor: '#9B74FF', color: '#fff' }}
            >
              Join waitlist
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}