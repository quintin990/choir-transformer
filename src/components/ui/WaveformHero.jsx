import React, { useEffect, useRef } from 'react';

const STEMS = [
  { label: 'Vocals',  color: '#818cf8', opacity: 0.9, bars: [3,7,11,6,14,9,5,12,8,4,10,13,7,11,5,9,6,12,8,3,10,7,14,5,9,11,6,8,4,12,7,10,5,13,8,6,11,4,9,7,12,5,10,8,13,6,9,4,11,7] },
  { label: 'Drums',   color: '#34d399', opacity: 0.9, bars: [7,13,5,11,8,4,12,6,10,14,3,9,7,13,5,11,8,4,12,6,10,14,3,9,7,13,5,11,8,4,12,6,10,14,3,9,7,13,5,11,8,4,12,6,10,14,3,9,7,13] },
  { label: 'Bass',    color: '#fbbf24', opacity: 0.85, bars: [11,5,9,7,13,4,10,8,12,6,14,3,11,5,9,7,13,4,10,8,12,6,14,3,11,5,9,7,13,4,10,8,12,6,14,3,11,5,9,7,13,4,10,8,12,6,14,3,11,5] },
  { label: 'Other',   color: '#f472b6', opacity: 0.85, bars: [5,10,7,12,4,9,6,13,3,11,8,5,10,7,12,4,9,6,13,3,11,8,5,10,7,12,4,9,6,13,3,11,8,5,10,7,12,4,9,6,13,3,11,8,5,10,7,12,4,9] },
];

export default function WaveformHero() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      {/* Outer glow */}
      <div className="absolute -inset-6 bg-sky-500/5 rounded-3xl blur-2xl pointer-events-none" />

      {/* Panel */}
      <div className="relative bg-[#0a1220] border border-white/[0.07] rounded-2xl overflow-hidden shadow-2xl">
        {/* Fake toolbar */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.05]">
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="ml-3 text-[10px] text-white/20 font-mono">stemforge — track.wav</span>
        </div>

        {/* Waveform rows */}
        <div className="px-4 py-4 space-y-2">
          {STEMS.map(({ label, color, opacity, bars }) => (
            <div key={label} className="flex items-center gap-3 group">
              {/* Label */}
              <div className="w-14 shrink-0 flex items-center justify-between">
                <span className="text-[11px] font-medium text-white/40 group-hover:text-white/60 transition-colors">{label}</span>
              </div>
              {/* Fader thumb */}
              <div className="w-4 shrink-0 flex items-center justify-center">
                <div className="w-1 h-5 rounded-full bg-white/20 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-1.5 rounded-sm bg-white/40" />
                </div>
              </div>
              {/* Bars */}
              <div className="flex-1 h-10 flex items-center gap-[1.5px]">
                {bars.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-[1px] transition-all"
                    style={{
                      height: `${Math.max(8, (h / 14) * 100)}%`,
                      backgroundColor: color,
                      opacity: opacity * (0.6 + (h / 14) * 0.4),
                    }}
                  />
                ))}
              </div>
              {/* Volume readout */}
              <span className="w-8 text-right text-[10px] font-mono text-white/20 shrink-0">−{Math.floor(6 + Math.random() * 10)}dB</span>
            </div>
          ))}
        </div>

        {/* Playhead overlay */}
        <div className="absolute top-12 bottom-0 w-px bg-sky-400/60 shadow-[0_0_8px_1px_rgba(56,189,248,0.5)]" style={{ left: '35%' }} />

        {/* Bottom progress bar */}
        <div className="px-4 py-3 border-t border-white/[0.05] flex items-center gap-3">
          <span className="text-[10px] font-mono text-white/25">1:23</span>
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500/60 rounded-full" style={{ width: '35%' }} />
          </div>
          <span className="text-[10px] font-mono text-white/25">3:47</span>
        </div>
      </div>
    </div>
  );
}