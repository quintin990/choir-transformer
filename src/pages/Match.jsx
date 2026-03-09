import React, { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';

export default function Match() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto text-center py-20">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs font-medium"
        style={{ backgroundColor: '#FFB02010', border: '1px solid #FFB02030', color: '#FFB020' }}>
        Coming Soon
      </div>

      <h1 className="text-4xl font-bold mb-4" style={{ color: '#EAF2FF', letterSpacing: '-0.03em' }}>Reference Match</h1>
      <p className="text-lg mb-12 max-w-xl mx-auto" style={{ color: '#9CB2D6' }}>
        Upload your mix and a reference track. Auralyn will compare and suggest tonal balance, loudness, dynamic and stereo adjustments to bring your mix in line with your favourite reference.
      </p>

      <form onSubmit={handleSubmit} className="rounded-xl border p-8 max-w-md mx-auto" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
        <p className="text-sm mb-4" style={{ color: '#6A8AAD' }}>
          Be among the first to try Reference Match. Join our beta.
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-4 h-10 rounded-lg text-sm"
            style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', border: '1px solid #1C2A44', color: '#EAF2FF' }}
            required
          />
          <button
            type="submit"
            className="px-6 h-10 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
            style={{ backgroundColor: '#FFB020', color: '#0B1220' }}
            onMouseEnter={e => e.currentTarget.style.opacity='0.9'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
            <Mail className="w-4 h-4" />
          </button>
        </div>
        {submitted && (
          <p className="text-xs mt-3" style={{ color: '#19D3A2' }}>✓ Thanks! We'll be in touch soon.</p>
        )}
      </form>
    </div>
  );
}