import React, { useState, useMemo } from 'react';

const STEM_COLORS = {
  vocals:    { line: '#38bdf8', glow: 'rgba(56,189,248,0.15)',   badge: 'bg-sky-500/15 text-sky-300' },
  drums:     { line: '#34d399', glow: 'rgba(52,211,153,0.15)',   badge: 'bg-emerald-500/15 text-emerald-300' },
  bass:      { line: '#fbbf24', glow: 'rgba(251,191,36,0.15)',   badge: 'bg-amber-500/15 text-amber-300' },
  other:     { line: '#f472b6', glow: 'rgba(244,114,182,0.15)',  badge: 'bg-pink-500/15 text-pink-300' },
  no_vocals: { line: '#22d3ee', glow: 'rgba(34,211,238,0.15)',   badge: 'bg-cyan-500/15 text-cyan-300' },
};

const FREQ_LABELS = ['20', '100', '500', '2k', '8k', '20k'];
const W = 300, H = 56;

function freqToX(freq) {
  return (Math.log10(freq / 20) / Math.log10(1000)) * W;
}

function getEQPath(hpOn, hpFreq, lpOn, lpFreq) {
  const N = 120;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = t * W;
    const freq = 20 * Math.pow(1000, t);
    let g = 1;
    if (hpOn) {
      const ratio = freq / hpFreq;
      g *= ratio * ratio / (1 + ratio * ratio);
    }
    if (lpOn) {
      const ratio = lpFreq / freq;
      g *= ratio * ratio / (1 + ratio * ratio);
    }
    const y = H - g * H * 0.82 - H * 0.06;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return 'M ' + pts.join(' L ');
}

function getAreaPath(hpOn, hpFreq, lpOn, lpFreq) {
  const N = 120;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = t * W;
    const freq = 20 * Math.pow(1000, t);
    let g = 1;
    if (hpOn) {
      const ratio = freq / hpFreq;
      g *= ratio * ratio / (1 + ratio * ratio);
    }
    if (lpOn) {
      const ratio = lpFreq / freq;
      g *= ratio * ratio / (1 + ratio * ratio);
    }
    const y = H - g * H * 0.82 - H * 0.06;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M 0,${H} L ${pts.join(' L ')} L ${W},${H} Z`;
}

const HP_FREQS = [20, 30, 50, 80, 120, 200, 350, 500, 800, 1200, 2000, 3500];
const LP_FREQS = [800, 1200, 2000, 3500, 5000, 8000, 10000, 14000, 18000, 20000];

function fmtFreq(hz) {
  return hz >= 1000 ? `${(hz / 1000).toFixed(hz >= 10000 ? 0 : 1)}k` : `${hz}`;
}

function StemEQ({ name, url, format }) {
  const [hpOn, setHpOn] = useState(false);
  const [hpIdx, setHpIdx] = useState(3);   // default 80 Hz
  const [lpOn, setLpOn] = useState(false);
  const [lpIdx, setLpIdx] = useState(6);   // default 10kHz

  const hpFreq = HP_FREQS[hpIdx];
  const lpFreq = LP_FREQS[lpIdx];
  const colors = STEM_COLORS[name?.toLowerCase()] || STEM_COLORS.vocals;

  const linePath = useMemo(() => getEQPath(hpOn, hpFreq, lpOn, lpFreq), [hpOn, hpFreq, lpOn, lpFreq]);
  const areaPath = useMemo(() => getAreaPath(hpOn, hpFreq, lpOn, lpFreq), [hpOn, hpFreq, lpOn, lpFreq]);

  const gradId = `eq-grad-${name}`;

  return (
    <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl overflow-hidden">
      {/* Stem name */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05]">
        <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-md ${colors.badge}`}>{name}</span>
        <a
          href={url}
          download={`${name}_eq.${format}`}
          className="text-[11px] text-white/30 hover:text-sky-400 transition-colors"
        >
          ↓ Download
        </a>
      </div>

      {/* EQ curve */}
      <div className="px-4 pt-3 pb-1">
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="rounded-lg overflow-hidden" style={{ height: 56 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.line} stopOpacity="0.25" />
              <stop offset="100%" stopColor={colors.line} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(y => (
            <line key={y} x1="0" y1={y * H} x2={W} y2={y * H} stroke="white" strokeOpacity="0.04" strokeWidth="0.5" />
          ))}
          {FREQ_LABELS.map((_, i) => {
            const freqs = [20, 100, 500, 2000, 8000, 20000];
            const x = freqToX(freqs[i]);
            return <line key={i} x1={x} y1="0" x2={x} y2={H} stroke="white" strokeOpacity="0.04" strokeWidth="0.5" />;
          })}
          {/* Area fill */}
          <path d={areaPath} fill={`url(#${gradId})`} />
          {/* Curve */}
          <path d={linePath} fill="none" stroke={colors.line} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* HP cutoff marker */}
          {hpOn && (
            <line x1={freqToX(hpFreq)} y1="0" x2={freqToX(hpFreq)} y2={H}
              stroke={colors.line} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="2,2" />
          )}
          {/* LP cutoff marker */}
          {lpOn && (
            <line x1={freqToX(lpFreq)} y1="0" x2={freqToX(lpFreq)} y2={H}
              stroke={colors.line} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="2,2" />
          )}
        </svg>
        {/* Freq labels */}
        <div className="flex justify-between mt-0.5 mb-2">
          {FREQ_LABELS.map(l => (
            <span key={l} className="text-[9px] text-white/15 font-mono">{l}</span>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-3">
        {/* HP */}
        <div className={`rounded-xl p-3 transition-colors ${hpOn ? 'bg-white/[0.05] border border-white/[0.08]' : 'bg-white/[0.02] border border-white/[0.04]'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-white/50">High-Pass</span>
            <button
              onClick={() => setHpOn(v => !v)}
              className={`w-8 h-4 rounded-full relative transition-colors ${hpOn ? 'bg-sky-500' : 'bg-white/10'}`}
            >
              <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${hpOn ? 'left-4.5' : 'left-0.5'}`} />
            </button>
          </div>
          <input
            type="range" min={0} max={HP_FREQS.length - 1} value={hpIdx}
            onChange={e => { setHpIdx(Number(e.target.value)); setHpOn(true); }}
            className="w-full h-1 appearance-none rounded-full cursor-pointer accent-sky-500"
            style={{ background: `linear-gradient(to right, ${hpOn ? '#38bdf8' : '#ffffff22'} ${(hpIdx / (HP_FREQS.length - 1)) * 100}%, #ffffff11 0)` }}
          />
          <p className={`text-[10px] font-mono mt-1.5 ${hpOn ? 'text-sky-400' : 'text-white/20'}`}>
            {fmtFreq(hpFreq)} Hz
          </p>
        </div>

        {/* LP */}
        <div className={`rounded-xl p-3 transition-colors ${lpOn ? 'bg-white/[0.05] border border-white/[0.08]' : 'bg-white/[0.02] border border-white/[0.04]'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-white/50">Low-Pass</span>
            <button
              onClick={() => setLpOn(v => !v)}
              className={`w-8 h-4 rounded-full relative transition-colors ${lpOn ? 'bg-sky-500' : 'bg-white/10'}`}
            >
              <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${lpOn ? 'left-4.5' : 'left-0.5'}`} />
            </button>
          </div>
          <input
            type="range" min={0} max={LP_FREQS.length - 1} value={lpIdx}
            onChange={e => { setLpIdx(Number(e.target.value)); setLpOn(true); }}
            className="w-full h-1 appearance-none rounded-full cursor-pointer accent-sky-500"
            style={{ background: `linear-gradient(to right, ${lpOn ? '#38bdf8' : '#ffffff22'} ${(lpIdx / (LP_FREQS.length - 1)) * 100}%, #ffffff11 0)` }}
          />
          <p className={`text-[10px] font-mono mt-1.5 ${lpOn ? 'text-sky-400' : 'text-white/20'}`}>
            {fmtFreq(lpFreq)} Hz
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StemEQPanel({ stems, format }) {
  if (!stems || Object.keys(stems).length === 0) return null;
  return (
    <div className="space-y-3">
      {Object.entries(stems).map(([name, url]) => (
        <StemEQ key={name} name={name} url={url} format={format} />
      ))}
    </div>
  );
}