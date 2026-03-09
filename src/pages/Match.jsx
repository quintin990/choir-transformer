import React from 'react';
import { GitCompare, Zap } from 'lucide-react';

export default function Match() {
  return (
    <div className="max-w-xl mx-auto mt-24 text-center space-y-5">
      <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ backgroundColor: '#1C2A44' }}>
        <GitCompare className="w-7 h-7" style={{ color: '#9CB2D6' }} />
      </div>
      <div>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full mb-3"
          style={{ backgroundColor: '#FFB02015', color: '#FFB020', border: '1px solid #FFB02030' }}>
          <Zap className="w-3 h-3" /> Coming Soon
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#EAF2FF' }}>Match</h1>
        <p className="text-sm leading-relaxed" style={{ color: '#9CB2D6' }}>
          Match your mix against a reference track — align loudness, tonal balance, and dynamics automatically.
        </p>
      </div>
    </div>
  );
}