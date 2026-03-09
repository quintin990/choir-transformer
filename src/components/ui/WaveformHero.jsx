import React from 'react';

// Decorative stacked waveform bars — pure CSS/SVG, no audio needed
const STEMS = [
  { label: 'Vocals',  color: '#818cf8', bars: [4,8,12,7,15,10,6,13,9,5,11,14,8,12,6,10,7,13,9,4,11,8,15,6,10,12,7,9,5,13] },
  { label: 'Drums',   color: '#34d399', bars: [8,14,6,12,9,5,13,7,11,15,4,10,8,14,6,12,9,5,13,7,11,15,4,10,8,14,6,12,9,5] },
  { label: 'Bass',    color: '#f59e0b', bars: [12,6,10,8,14,5,11,9,13,7,15,4,12,6,10,8,14,5,11,9,13,7,15,4,12,6,10,8,14,5] },
  { label: 'Other',   color: '#f472b6', bars: [6,11,8,13,5,10,7,14,4,12,9,6,11,8,13,5,10,7,14,4,12,9,6,11,8,13,5,10,7,14] },
];

export default function WaveformHero() {
  return (
    <div className="relative mx-auto w-full max-w-lg select-none pointer-events-none">
      <div className="space-y-1.5">
        {STEMS.map(({ label, color, bars }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs text-white/30 w-12 text-right shrink-0">{label}</span>
            <div className="flex-1 h-10 flex items-center gap-[2px]">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-[1px] opacity-80"
                  style={{
                    height: `${(h / 15) * 100}%`,
                    backgroundColor: color,
                    minHeight: 2,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#070d14] pointer-events-none" />
    </div>
  );
}