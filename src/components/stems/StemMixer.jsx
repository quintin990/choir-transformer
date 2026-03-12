import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Volume2, Repeat, Loader2 } from 'lucide-react';
import WaveformCanvas from './WaveformCanvas';

const STEM_COLORS = {
  vocals: '#a78bfa',
  drums: '#f472b6',
  bass: '#34d399',
  other: '#60a5fa',
  accompaniment: '#fbbf24',
  piano: '#fb923c',
  guitar: '#e879f9',
  melody: '#a78bfa',
};
const FALLBACK_COLORS = ['#a78bfa', '#f472b6', '#34d399', '#60a5fa', '#fbbf24', '#fb923c'];

export default function StemMixer({ stems }) {
  const stemNames = Object.keys(stems || {});
  const audioCtxRef = useRef(null);
  const buffersRef = useRef({});
  const sourceNodesRef = useRef({});
  const gainNodesRef = useRef({});
  const analyserNodesRef = useRef({});
  const startTimeRef = useRef(0);
  const offsetRef = useRef(0);
  const animRef = useRef(null);

  const [stemStates, setStemStates] = useState(() => {
    const s = {};
    stemNames.forEach(n => { s[n] = { muted: false, soloed: false, volume: 1 }; });
    return s;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Load buffers
  useEffect(() => {
    if (!stemNames.length) return;
    const load = async () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;

        await Promise.all(stemNames.map(async (name) => {
          const res = await fetch(stems[name]);
          const ab = await res.arrayBuffer();
          const buf = await ctx.decodeAudioData(ab);
          buffersRef.current[name] = buf;

          const gain = ctx.createGain();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 512;
          gain.connect(analyser);
          analyser.connect(ctx.destination);
          gainNodesRef.current[name] = gain;
          analyserNodesRef.current[name] = analyser;
        }));

        const maxDur = Math.max(...Object.values(buffersRef.current).map(b => b.duration));
        setDuration(maxDur);
        setLoading(false);
      } catch (e) {
        console.error('StemMixer load error:', e);
        setLoadError(true);
        setLoading(false);
      }
    };
    load();
    return () => {
      if (audioCtxRef.current) audioCtxRef.current.close();
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  const stopAll = useCallback(() => {
    Object.values(sourceNodesRef.current).forEach(src => { try { src.stop(); } catch {} });
    sourceNodesRef.current = {};
    cancelAnimationFrame(animRef.current);
  }, []);

  const startPlayback = useCallback((offset) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    stopAll();

    stemNames.forEach(name => {
      const buf = buffersRef.current[name];
      if (!buf) return;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(gainNodesRef.current[name]);
      src.start(0, offset);
      sourceNodesRef.current[name] = src;
    });

    startTimeRef.current = ctx.currentTime;
    offsetRef.current = offset;
    setIsPlaying(true);

    const tick = () => {
      const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
      const cur = Math.min(offsetRef.current + elapsed, duration);
      setCurrentTime(cur);
      if (cur < duration) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
        offsetRef.current = 0;
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [stemNames, duration, stopAll]);

  const pause = useCallback(() => {
    const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
    offsetRef.current = offsetRef.current + elapsed;
    stopAll();
    setIsPlaying(false);
  }, [stopAll]);

  const seek = useCallback((time) => {
    offsetRef.current = time;
    setCurrentTime(time);
    if (isPlaying) startPlayback(time);
  }, [isPlaying, startPlayback]);

  const togglePlay = () => {
    if (loading) return;
    if (isPlaying) pause();
    else startPlayback(offsetRef.current);
  };

  // Apply gain based on mute/solo/volume
  useEffect(() => {
    const hasSolo = Object.values(stemStates).some(s => s.soloed);
    stemNames.forEach(name => {
      const g = gainNodesRef.current[name];
      const st = stemStates[name];
      if (!g || !st) return;
      const active = !st.muted && (!hasSolo || st.soloed);
      g.gain.setTargetAtTime(active ? st.volume : 0, audioCtxRef.current?.currentTime || 0, 0.02);
    });
  }, [stemStates]);

  const toggleMute = (name) => setStemStates(p => ({ ...p, [name]: { ...p[name], muted: !p[name].muted, soloed: false } }));
  const toggleSolo = (name) => setStemStates(p => ({ ...p, [name]: { ...p[name], soloed: !p[name].soloed, muted: false } }));
  const setVolume = (name, v) => setStemStates(p => ({ ...p, [name]: { ...p[name], volume: v } }));

  const fmt = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  const pct = duration ? (currentTime / duration) * 100 : 0;

  const hasSolo = Object.values(stemStates).some(s => s.soloed);

  if (loadError) return null;

  return (
    <div className="bg-[#0d0d1a] border border-white/8 rounded-2xl overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[0,1,2,3,4].map(i => (
              <div key={i} className={`w-0.5 rounded-full bg-violet-500 transition-all duration-150 ${isPlaying ? 'animate-pulse' : ''}`}
                style={{ height: isPlaying ? `${8 + Math.sin(i * 1.3) * 5}px` : '4px', animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
          <span className="text-xs font-semibold text-white/80 tracking-wider uppercase ml-1">Stem Mixer</span>
        </div>
        {loading ? (
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading…
          </div>
        ) : (
          <span className="text-xs text-white/25">{stemNames.length} stems · {fmt(duration)}</span>
        )}
      </div>

      {/* Column headers */}
      <div className="px-4 py-2 flex items-center gap-4 border-b border-white/[0.03]">
        <span className="w-20 text-[10px] uppercase tracking-wider text-white/20">Stem</span>
        <span className="flex-1 text-[10px] uppercase tracking-wider text-white/20">Waveform</span>
        <span className="w-20 text-[10px] uppercase tracking-wider text-white/20 text-center">Volume</span>
        <span className="w-24 text-[10px] uppercase tracking-wider text-white/20 text-center">Play · Mute · Solo</span>
      </div>

      {/* Stem rows */}
      <div className="divide-y divide-white/[0.03]">
        {stemNames.map((name, idx) => {
          const color = STEM_COLORS[name.toLowerCase()] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
          const st = stemStates[name] || { muted: false, soloed: false, volume: 1 };
          const isActive = !st.muted && (!hasSolo || st.soloed);

          return (
            <div
              key={name}
              className={`px-4 py-3 flex items-center gap-4 transition-opacity duration-200 ${!isActive ? 'opacity-25' : ''}`}
            >
              {/* Name */}
              <div className="w-20 shrink-0 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white/10"
                  style={{ backgroundColor: color }} />
                <span className="text-xs font-medium text-white/80 capitalize truncate">{name}</span>
              </div>

              {/* Waveform */}
              <div className="flex-1 h-10 min-w-0 bg-white/[0.02] rounded-lg overflow-hidden cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  seek(((e.clientX - rect.left) / rect.width) * duration);
                }}>
                <WaveformCanvas
                  analyserNode={analyserNodesRef.current[name]}
                  color={color}
                  isActive={isActive && isPlaying}
                  buffer={buffersRef.current[name]}
                  currentTime={currentTime}
                  duration={duration}
                />
              </div>

              {/* Volume */}
              <div className="w-20 shrink-0 flex items-center gap-1.5">
                <Volume2 className="w-3 h-3 text-white/20 shrink-0" />
                <Slider
                  value={[st.volume]}
                  onValueChange={([v]) => setVolume(name, v)}
                  min={0} max={1.5} step={0.01}
                  disabled={loading}
                  className="cursor-pointer"
                />
              </div>

              {/* Mute / Solo / Play */}
              <div className="w-24 shrink-0 flex items-center justify-center gap-1">
                {/* Solo play button */}
                <button
                  onClick={() => {
                    // Solo this stem and play
                    setStemStates(p => {
                      const next = {};
                      Object.keys(p).forEach(k => { next[k] = { ...p[k], soloed: k === name, muted: false }; });
                      return next;
                    });
                    if (!isPlaying) startPlayback(offsetRef.current);
                  }}
                  title="Preview this stem"
                  className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                    st.soloed
                      ? 'bg-violet-500/30 text-violet-300 ring-1 ring-violet-500/50'
                      : 'bg-white/5 text-white/30 hover:text-white/60 hover:bg-white/8'
                  }`}
                >
                  <Play className="w-3 h-3 ml-0.5" />
                </button>
                <button
                  onClick={() => toggleMute(name)}
                  title="Mute"
                  className={`w-7 h-7 rounded-md text-[10px] font-bold tracking-wide transition-all ${
                    st.muted
                      ? 'bg-red-500/25 text-red-400 ring-1 ring-red-500/40'
                      : 'bg-white/5 text-white/30 hover:text-white/60 hover:bg-white/8'
                  }`}
                >M</button>
                <button
                  onClick={() => toggleSolo(name)}
                  title="Solo"
                  className={`w-7 h-7 rounded-md text-[10px] font-bold tracking-wide transition-all ${
                    st.soloed
                      ? 'bg-amber-500/25 text-amber-400 ring-1 ring-amber-500/40'
                      : 'bg-white/5 text-white/30 hover:text-white/60 hover:bg-white/8'
                  }`}
                >S</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transport */}
      <div className="px-5 py-4 border-t border-white/5 space-y-3 bg-white/[0.01]">
        {/* Seekbar */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] tabular-nums text-white/30 w-8 text-right shrink-0">{fmt(currentTime)}</span>
          <div
            className="flex-1 relative h-1 bg-white/8 rounded-full cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              seek(((e.clientX - rect.left) / rect.width) * duration);
            }}
          >
            {/* Track fill */}
            <div className="absolute inset-y-0 left-0 bg-violet-600 rounded-full transition-all"
              style={{ width: `${pct}%` }} />
            {/* Thumb */}
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg -ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${pct}%` }} />
          </div>
          <span className="text-[11px] tabular-nums text-white/30 w-8 shrink-0">{fmt(duration)}</span>
        </div>

        {/* Play controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => { offsetRef.current = 0; setCurrentTime(0); if (isPlaying) startPlayback(0); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={togglePlay}
            disabled={loading}
            className="w-11 h-11 rounded-full bg-violet-600 hover:bg-violet-500 disabled:opacity-30 flex items-center justify-center text-white transition-all shadow-lg shadow-violet-600/20 active:scale-95"
          >
            {isPlaying
              ? <Pause className="w-4 h-4" />
              : <Play className="w-4 h-4 ml-0.5" />
            }
          </button>
          <div className="w-7" /> {/* spacer */}
        </div>
      </div>
    </div>
  );
}