import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const STEMS_OPTIONS = [
  { key: 'vocal_denoise',   label: 'Vocal denoise' },
  { key: 'de_reverb',       label: 'De-reverb vocals' },
  { key: 'reduce_hum',      label: 'Reduce hum' },
  { key: 'loudness_normalize', label: 'Loudness normalize stems' },
];

const REFERENCE_OPTIONS = [
  { key: 'de_noise',   label: 'De-noise' },
  { key: 'de_reverb',  label: 'De-reverb' },
  { key: 'normalize',  label: 'Normalize' },
];

export default function CleanAudioPanel({ variant = 'stems', enabled, onToggle, options, onOptions }) {
  const [open, setOpen] = useState(false);
  const opts = variant === 'stems' ? STEMS_OPTIONS : REFERENCE_OPTIONS;

  const toggle = (key) => {
    onOptions({ ...options, [key]: !options[key] });
  };

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#9CB2D6' }} />
          <span className="text-xs font-medium" style={{ color: '#9CB2D6' }}>Clean Audio</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#1C2A44', color: '#9CB2D6' }}>optional</span>
          {enabled && (
            <span className="text-[10px]" style={{ color: '#19D3A2' }}>On</span>
          )}
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5" style={{ color: '#9CB2D6' }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: '#9CB2D6' }} />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t space-y-3" style={{ borderColor: '#1C2A44' }}>
          <p className="text-xs pt-3" style={{ color: '#9CB2D6' }}>
            Reduce noise and room sound before exporting stems.
          </p>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={!!enabled} onChange={e => onToggle(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-[#19D3A2]" />
            <span className="text-xs font-medium" style={{ color: enabled ? '#EAF2FF' : '#9CB2D6' }}>
              Enable Clean Audio
            </span>
          </label>

          {enabled && (
            <div className="space-y-2 pl-1">
              {opts.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={!!options[key]} onChange={() => toggle(key)}
                    className="w-3.5 h-3.5 rounded cursor-pointer accent-[#19D3A2]" />
                  <span className="text-xs" style={{ color: options[key] ? '#EAF2FF' : '#9CB2D6' }}>{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}