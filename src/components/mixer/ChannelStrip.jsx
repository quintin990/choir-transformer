import React from 'react';

const COLORS = {
  vocals: '#1EA0FF', drums: '#19D3A2', bass: '#FFB020',
  other: '#9B74FF', no_vocals: '#00D8FF',
};

function MiniSlider({ label, value, min = -12, max = 12, step = 0.5, onChange, color = '#1EA0FF' }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
        style={{ accentColor: color, height: 3 }}
      />
      <span className="text-[9px] tabular-nums font-mono" style={{ color: value !== 0 ? color : '#9CB2D6' }}>
        {value > 0 ? `+${value}` : value}
      </span>
      <span className="text-[9px] uppercase tracking-wider" style={{ color: '#9CB2D6' }}>{label}</span>
    </div>
  );
}

const VU_BARS = 10;

export default function ChannelStrip({ name, gain = 100, pan = 0, muted = false, solo = false, eq = { low: 0, mid: 0, high: 0 }, level = 0, onChange }) {
  const color = COLORS[name?.toLowerCase()] || '#1EA0FF';
  const label = name ? name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' ') : 'Stem';
  const effectiveLevel = muted ? 0 : level;

  return (
    <div className="flex flex-col items-center gap-2 px-3 py-3 min-w-[88px]"
      style={{ borderRight: '1px solid #1C2A44' }}>
      {/* Name */}
      <div className="text-[11px] font-bold text-center capitalize" style={{ color }}>{label}</div>

      {/* VU meter */}
      <div className="flex flex-col-reverse gap-px" style={{ height: 50 }}>
        {Array.from({ length: VU_BARS }, (_, i) => {
          const threshold = (i / VU_BARS) * 100;
          const active = effectiveLevel > threshold;
          const barColor = i >= VU_BARS - 1 ? '#FF4D6D' : i >= VU_BARS - 2 ? '#FFB020' : '#19D3A2';
          return (
            <div key={i} className="transition-all duration-75"
              style={{ width: 22, height: 3, borderRadius: 1, backgroundColor: active ? barColor : '#1C2A44' }} />
          );
        })}
      </div>

      {/* Fader */}
      <div className="w-full">
        <input type="range" min={0} max={130} value={gain}
          onChange={e => onChange('gain', Number(e.target.value))}
          disabled={muted}
          className="w-full disabled:opacity-40 cursor-pointer"
          style={{ accentColor: color }}
        />
        <p className="text-[9px] text-center tabular-nums font-mono" style={{ color: '#9CB2D6' }}>
          {gain === 0 ? '-∞' : `${Math.round(20 * Math.log10(gain / 100))}dB`}
        </p>
      </div>

      {/* Pan */}
      <div className="w-full">
        <div className="flex justify-between text-[9px] mb-0.5" style={{ color: '#9CB2D6' }}>
          <span>L</span><span>R</span>
        </div>
        <input type="range" min={-100} max={100} value={pan}
          onChange={e => onChange('pan', Number(e.target.value))}
          className="w-full cursor-pointer"
          style={{ accentColor: '#1EA0FF' }}
        />
        <p className="text-[9px] text-center" style={{ color: pan !== 0 ? '#1EA0FF' : '#9CB2D6' }}>
          {pan === 0 ? 'C' : pan > 0 ? `R${pan}` : `L${Math.abs(pan)}`}
        </p>
      </div>

      {/* 3-band EQ */}
      <div className="w-full pt-2 space-y-1.5 border-t" style={{ borderColor: '#1C2A44' }}>
        <p className="text-[9px] text-center font-semibold uppercase tracking-wider" style={{ color: '#9CB2D6' }}>EQ</p>
        <MiniSlider label="Lo" value={eq.low} onChange={v => onChange('eq_low', v)} color={color} />
        <MiniSlider label="Mid" value={eq.mid} onChange={v => onChange('eq_mid', v)} color={color} />
        <MiniSlider label="Hi" value={eq.high} onChange={v => onChange('eq_high', v)} color={color} />
      </div>

      {/* Mute / Solo */}
      <div className="flex gap-1.5">
        <button onClick={() => onChange('muted', !muted)}
          className="w-9 h-6 rounded text-[9px] font-bold transition-all"
          style={{ backgroundColor: muted ? '#FF4D6D18' : '#1C2A44', color: muted ? '#FF4D6D' : '#9CB2D6', border: `1px solid ${muted ? '#FF4D6D40' : 'transparent'}` }}>
          M
        </button>
        <button onClick={() => onChange('solo', !solo)}
          className="w-9 h-6 rounded text-[9px] font-bold transition-all"
          style={{ backgroundColor: solo ? '#FFB02018' : '#1C2A44', color: solo ? '#FFB020' : '#9CB2D6', border: `1px solid ${solo ? '#FFB02040' : 'transparent'}` }}>
          S
        </button>
      </div>
    </div>
  );
}