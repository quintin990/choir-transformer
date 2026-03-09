import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause } from 'lucide-react';
import ChannelStrip from './ChannelStrip';

const STEM_ORDER = ['vocals', 'drums', 'bass', 'other', 'no_vocals'];

function buildPreset(names, existing = {}) {
  const g = { ...(existing.gains || {}) };
  const p = { ...(existing.pans || {}) };
  const m = { ...(existing.mutes || {}) };
  const s = { ...(existing.solos || {}) };
  const eq = { ...(existing.eqs || {}) };
  names.forEach(n => {
    if (g[n] == null) g[n] = 100;
    if (p[n] == null) p[n] = 0;
    if (m[n] == null) m[n] = false;
    if (s[n] == null) s[n] = false;
    if (!eq[n]) eq[n] = { low: 0, mid: 0, high: 0 };
  });
  return { gains: g, pans: p, mutes: m, solos: s, eqs: eq };
}

export default function MixConsole({ stems = {}, format = 'wav', initialPreset, onPresetChange }) {
  const names = STEM_ORDER.filter(n => stems[n]).concat(Object.keys(stems).filter(n => !STEM_ORDER.includes(n)));
  const [preset, setPreset] = useState(() => buildPreset(names, initialPreset));
  const [playing, setPlaying] = useState(false);
  const [levels, setLevels] = useState({});

  const audioRefs = useRef({});
  const ctxRef = useRef(null);
  const gainNodesRef = useRef({});
  const panNodesRef = useRef({});
  const analyserNodesRef = useRef({});
  const animRef = useRef(null);

  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;
    names.forEach(name => {
      const el = audioRefs.current[name];
      if (!el) return;
      try {
        const src = ctx.createMediaElementSource(el);
        const gainNode = ctx.createGain();
        const panNode = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(gainNode);
        if (panNode) { gainNode.connect(panNode); panNode.connect(analyser); }
        else gainNode.connect(analyser);
        analyser.connect(ctx.destination);
        gainNodesRef.current[name] = gainNode;
        if (panNode) panNodesRef.current[name] = panNode;
        analyserNodesRef.current[name] = analyser;
      } catch (err) { console.warn('MixConsole audio node error:', name, err.message); }
    });
    return () => { cancelAnimationFrame(animRef.current); ctx.close(); };
  }, []);

  useEffect(() => {
    const anySolo = Object.values(preset.solos).some(Boolean);
    names.forEach(name => {
      const gainNode = gainNodesRef.current[name];
      if (!gainNode || !ctxRef.current) return;
      const effectiveMute = preset.mutes[name] || (anySolo && !preset.solos[name]);
      const gainVal = effectiveMute ? 0 : (preset.gains[name] ?? 100) / 100;
      gainNode.gain.setTargetAtTime(gainVal, ctxRef.current.currentTime, 0.02);
      const panNode = panNodesRef.current[name];
      if (panNode) panNode.pan.setTargetAtTime((preset.pans[name] ?? 0) / 100, ctxRef.current.currentTime, 0.02);
    });
  }, [preset]);

  const updateLevels = useCallback(() => {
    const lv = {};
    names.forEach(name => {
      const a = analyserNodesRef.current[name];
      if (!a) return;
      const data = new Uint8Array(a.frequencyBinCount);
      a.getByteFrequencyData(data);
      lv[name] = (data.reduce((s, v) => s + v, 0) / data.length / 255) * 100;
    });
    setLevels(lv);
    animRef.current = requestAnimationFrame(updateLevels);
  }, []);

  const togglePlay = async () => {
    if (ctxRef.current?.state === 'suspended') await ctxRef.current.resume();
    const audios = Object.values(audioRefs.current);
    if (playing) {
      audios.forEach(a => a?.pause());
      cancelAnimationFrame(animRef.current);
      setLevels({});
    } else {
      await Promise.allSettled(audios.map(a => a?.play()));
      updateLevels();
    }
    setPlaying(v => !v);
  };

  const handleChange = (stemName, field, value) => {
    setPreset(prev => {
      const next = {
        gains: { ...prev.gains },
        pans: { ...prev.pans },
        mutes: { ...prev.mutes },
        solos: { ...prev.solos },
        eqs: { ...prev.eqs, [stemName]: { ...(prev.eqs[stemName] || {}) } },
      };
      if (field === 'gain') next.gains[stemName] = value;
      else if (field === 'pan') next.pans[stemName] = value;
      else if (field === 'muted') next.mutes[stemName] = value;
      else if (field === 'solo') next.solos[stemName] = value;
      else if (field === 'eq_low') next.eqs[stemName].low = value;
      else if (field === 'eq_mid') next.eqs[stemName].mid = value;
      else if (field === 'eq_high') next.eqs[stemName].high = value;
      if (onPresetChange) onPresetChange(next);
      return next;
    });
  };

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#070E1A', borderColor: '#1C2A44' }}>
      {/* Console header */}
      <div className="flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: '#1C2A44', backgroundColor: '#0A1422' }}>
        <div>
          <p className="text-xs font-semibold" style={{ color: '#EAF2FF' }}>Live Mix Console</p>
          <p className="text-[11px] mt-0.5" style={{ color: '#9CB2D6' }}>Gain · Pan · 3-band EQ · M/S — settings auto-saved to export preset</p>
        </div>
        <button onClick={togglePlay}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{ backgroundColor: playing ? '#1C2A44' : '#1EA0FF', color: '#EAF2FF' }}>
          {playing ? <><Pause className="w-3.5 h-3.5" /> Stop</> : <><Play className="w-3.5 h-3.5 ml-0.5" /> Play all</>}
        </button>
      </div>

      {/* Hidden audio elements */}
      <div style={{ display: 'none' }}>
        {names.map(name => (
          <audio key={name} ref={el => audioRefs.current[name] = el} src={stems[name]}
            onEnded={() => { setPlaying(false); setLevels({}); cancelAnimationFrame(animRef.current); }} />
        ))}
      </div>

      {/* Channel strips */}
      <div className="flex overflow-x-auto">
        {names.map(name => (
          <ChannelStrip
            key={name}
            name={name}
            gain={preset.gains[name] ?? 100}
            pan={preset.pans[name] ?? 0}
            muted={preset.mutes[name] ?? false}
            solo={preset.solos[name] ?? false}
            eq={preset.eqs[name] ?? { low: 0, mid: 0, high: 0 }}
            level={levels[name] ?? 0}
            onChange={(field, value) => handleChange(name, field, value)}
          />
        ))}
      </div>

      {/* Download row */}
      <div className="flex flex-wrap gap-2 px-4 py-3 border-t" style={{ borderColor: '#1C2A44', backgroundColor: '#0A1422' }}>
        {names.map(name => (
          <a key={name} href={stems[name]} download={`${name}.${format}`}
            className="text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all capitalize"
            style={{ backgroundColor: '#1C2A44', color: '#9CB2D6' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1EA0FF18'; e.currentTarget.style.color = '#1EA0FF'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1C2A44'; e.currentTarget.style.color = '#9CB2D6'; }}>
            ↓ {name.replace('_', ' ')}
          </a>
        ))}
      </div>
    </div>
  );
}