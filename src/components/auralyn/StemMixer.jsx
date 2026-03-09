import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const STEM_CFG = {
  vocals:    { color: '#1EA0FF', label: 'Vocals' },
  drums:     { color: '#19D3A2', label: 'Drums' },
  bass:      { color: '#FFB020', label: 'Bass' },
  other:     { color: '#9B74FF', label: 'Other' },
  no_vocals: { color: '#00D8FF', label: 'Band' },
};

function VUMeter({ level }) {
  const bars = 12;
  return (
    <div className="flex flex-col-reverse gap-px" style={{ height: 60 }}>
      {Array.from({ length: bars }, (_, i) => {
        const threshold = (i / bars) * 100;
        const active = level > threshold;
        const color = i > 9 ? '#FF4D6D' : i > 7 ? '#FFB020' : '#19D3A2';
        return (
          <div key={i} className="w-2 rounded-sm transition-all duration-75"
            style={{ height: 3, backgroundColor: active ? color : '#1C2A44' }} />
        );
      })}
    </div>
  );
}

function Fader({ value, onChange, color, disabled }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-mono tabular-nums" style={{ color: '#9CB2D6' }}>
        {value === 0 ? '-∞' : value > 100 ? `+${Math.round(20 * Math.log10(value / 100))}` : `${Math.round(20 * Math.log10(value / 100))}`}dB
      </span>
      <div className="relative" style={{ height: 80 }}>
        <input
          type="range" min={0} max={130} value={value}
          onChange={e => onChange(Number(e.target.value))}
          disabled={disabled}
          className="appearance-none cursor-pointer disabled:opacity-40"
          style={{
            writingMode: 'vertical-lr',
            direction: 'rtl',
            height: 80,
            width: 6,
            WebkitAppearance: 'slider-vertical',
            background: `linear-gradient(to top, ${color} ${(value / 130) * 100}%, #1C2A44 0)`,
            borderRadius: 3,
            outline: 'none',
          }}
        />
      </div>
    </div>
  );
}

export default function StemMixer({ stems, format = 'wav' }) {
  const audioRefs = useRef({});
  const [playing, setPlaying] = useState(false);
  const [gains, setGains] = useState(() => {
    const g = {};
    Object.keys(stems).forEach(k => g[k] = 100);
    return g;
  });
  const [muted, setMuted] = useState({});
  const [levels, setLevels] = useState({});
  const animRef = useRef(null);
  const ctxRef = useRef(null);
  const gainNodesRef = useRef({});
  const analyserNodesRef = useRef({});

  // Build Web Audio graph on mount
  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;

    Object.entries(stems).forEach(([name, url]) => {
      const el = audioRefs.current[name];
      if (!el) return;
      const src = ctx.createMediaElementSource(el);
      const gainNode = ctx.createGain();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(gainNode);
      gainNode.connect(analyser);
      analyser.connect(ctx.destination);
      gainNodesRef.current[name] = gainNode;
      analyserNodesRef.current[name] = analyser;
    });

    return () => {
      cancelAnimationFrame(animRef.current);
      ctx.close();
    };
  }, []);

  // Update gain nodes
  useEffect(() => {
    Object.entries(gains).forEach(([name, val]) => {
      const node = gainNodesRef.current[name];
      if (node) {
        const isMuted = muted[name];
        node.gain.setTargetAtTime(isMuted ? 0 : val / 100, ctxRef.current?.currentTime || 0, 0.02);
      }
    });
  }, [gains, muted]);

  const updateLevels = useCallback(() => {
    const newLevels = {};
    Object.entries(analyserNodesRef.current).forEach(([name, analyser]) => {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      newLevels[name] = (avg / 255) * 100;
    });
    setLevels(newLevels);
    animRef.current = requestAnimationFrame(updateLevels);
  }, []);

  const togglePlay = async () => {
    if (ctxRef.current?.state === 'suspended') await ctxRef.current.resume();
    const audios = Object.values(audioRefs.current);
    if (playing) {
      audios.forEach(a => a?.pause());
      cancelAnimationFrame(animRef.current);
    } else {
      const promises = audios.map(a => a?.play());
      await Promise.allSettled(promises);
      updateLevels();
    }
    setPlaying(v => !v);
  };

  const handleEnded = () => {
    setPlaying(false);
    cancelAnimationFrame(animRef.current);
  };

  const toggleMute = (name) => setMuted(m => ({ ...m, [name]: !m[name] }));

  const stemEntries = Object.entries(stems);

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#070E1A', borderColor: '#1C2A44' }}>
      {/* Console header */}
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: '#1C2A44', backgroundColor: '#0A1422' }}>
        <div>
          <p className="text-xs font-semibold" style={{ color: '#EAF2FF' }}>Live Mix Console</p>
          <p className="text-[11px] mt-0.5" style={{ color: '#9CB2D6' }}>Adjust gain per stem · preview in real time</p>
        </div>
        <button
          onClick={togglePlay}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{ backgroundColor: playing ? '#1C2A44' : '#1EA0FF', color: '#EAF2FF' }}
        >
          {playing ? <><Pause className="w-3.5 h-3.5" /> Stop</> : <><Play className="w-3.5 h-3.5 ml-0.5" /> Play all</>}
        </button>
      </div>

      {/* Channel strips */}
      <div className="flex divide-x overflow-x-auto" style={{ divideColor: '#1C2A44' }}>
        {stemEntries.map(([name, url]) => {
          const cfg = STEM_CFG[name.toLowerCase()] || { color: '#1EA0FF', label: name };
          const isMuted = muted[name];
          return (
            <div key={name} className="flex flex-col items-center px-4 py-4 gap-3 min-w-[88px]"
              style={{ borderColor: '#1C2A44' }}>
              {/* Audio element */}
              <audio
                ref={el => audioRefs.current[name] = el}
                src={url}
                onEnded={handleEnded}
                loop={false}
              />

              {/* VU meter */}
              <VUMeter level={isMuted ? 0 : levels[name] || 0} />

              {/* Fader */}
              <Fader
                value={gains[name] ?? 100}
                onChange={val => setGains(g => ({ ...g, [name]: val }))}
                color={isMuted ? '#1C2A44' : cfg.color}
                disabled={isMuted}
              />

              {/* Mute button */}
              <button
                onClick={() => toggleMute(name)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-xs font-bold"
                style={{
                  backgroundColor: isMuted ? '#FF4D6D18' : '#1C2A44',
                  color: isMuted ? '#FF4D6D' : '#9CB2D6',
                  border: `1px solid ${isMuted ? '#FF4D6D40' : 'transparent'}`,
                }}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* Label + download */}
              <div className="text-center">
                <p className="text-[11px] font-semibold capitalize" style={{ color: cfg.color }}>{cfg.label}</p>
                <a href={url} download={`${name}.${format}`}
                  className="text-[10px] transition-colors mt-0.5 block"
                  style={{ color: '#9CB2D6' }}
                  onMouseEnter={e => e.target.style.color='#1EA0FF'}
                  onMouseLeave={e => e.target.style.color='#9CB2D6'}
                >
                  ↓ DL
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}