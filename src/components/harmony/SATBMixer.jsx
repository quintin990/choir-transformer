import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Download, Volume2, VolumeX, BookOpen, RotateCcw } from 'lucide-react';

const fmtT = s => {
  if (!s || isNaN(s)) return '0:00';
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
};

function VolumeSlider({ value, onChange, color, disabled }) {
  return (
    <input
      type="range" min="0" max="1" step="0.01"
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      disabled={disabled}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:opacity-40"
      style={{ accentColor: color, backgroundColor: '#1C2A44' }}
    />
  );
}

function TrackRow({ track, volume, muted, soloed, anySolo, rehearsal, onVolume, onMute, onSolo }) {
  const effectiveVol = (() => {
    if (muted) return 0;
    if (anySolo && !soloed) {
      return rehearsal && track.kind === 'voice' ? 0.15 : 0;
    }
    return volume;
  })();

  const isSilent = effectiveVol === 0;

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all"
      style={{ backgroundColor: soloed ? track.color + '10' : '#0B1220', border: `1px solid ${soloed ? track.color + '40' : '#1C2A44'}` }}>

      {/* Color dot + label */}
      <div className="flex items-center gap-2 w-24 shrink-0">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: isSilent ? '#1C2A44' : track.color }} />
        <span className="text-xs font-semibold truncate" style={{ color: isSilent ? '#9CB2D6' : '#EAF2FF' }}>
          {track.label}
        </span>
      </div>

      {/* Volume slider */}
      <div className="flex-1">
        <VolumeSlider value={volume} onChange={onVolume} color={track.color} disabled={muted} />
      </div>

      {/* Volume % */}
      <span className="text-[10px] font-mono w-7 text-right shrink-0" style={{ color: '#9CB2D6' }}>
        {Math.round(volume * 100)}
      </span>

      {/* Mute */}
      <button
        onClick={onMute}
        title={muted ? 'Unmute' : 'Mute'}
        className="w-7 h-7 rounded flex items-center justify-center shrink-0 transition-colors"
        style={{ backgroundColor: muted ? '#FF4D6D20' : '#1C2A44', color: muted ? '#FF4D6D' : '#9CB2D6' }}>
        {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
      </button>

      {/* Solo */}
      <button
        onClick={onSolo}
        title={soloed ? 'Unsolo' : 'Solo'}
        className="w-7 h-7 rounded text-[10px] font-bold flex items-center justify-center shrink-0 transition-colors"
        style={{ backgroundColor: soloed ? track.color + '30' : '#1C2A44', color: soloed ? track.color : '#9CB2D6', border: soloed ? `1px solid ${track.color}60` : '1px solid transparent' }}>
        S
      </button>

      {/* Download */}
      {track.url && (
        <a href={track.url} download={`${track.label.toLowerCase()}.wav`}
          className="w-7 h-7 rounded flex items-center justify-center shrink-0"
          style={{ color: '#9CB2D6', border: '1px solid #1C2A44' }}
          onMouseEnter={e => { e.currentTarget.style.color = track.color; e.currentTarget.style.borderColor = track.color + '60'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#9CB2D6'; e.currentTarget.style.borderColor = '#1C2A44'; }}>
          <Download className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}

export default function SATBMixer({ tracks, presets, title }) {
  // tracks: [{ id, label, url, color, kind: 'voice'|'instrument' }]
  const [playing, setPlaying]       = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]     = useState(0);
  const [volumes, setVolumes]       = useState(() => Object.fromEntries(tracks.map(t => [t.id, 1])));
  const [muted, setMuted]           = useState(() => Object.fromEntries(tracks.map(t => [t.id, false])));
  const [soloId, setSoloId]         = useState(null);
  const [rehearsal, setRehearsal]   = useState(false);
  const [loaded, setLoaded]         = useState(0);
  const [loadError, setLoadError]   = useState(false);

  const ctxRef   = useRef(null);
  const gains    = useRef({});
  const audioEls = useRef({});
  const masterEl = useRef(null);
  const isSeeking = useRef(false);

  // Build Web Audio graph once
  useEffect(() => {
    if (!tracks.length) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) { setLoadError(true); return; }

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    let loadedCount = 0;
    const total = tracks.length;

    tracks.forEach((track, i) => {
      const el = new Audio();
      el.crossOrigin = 'anonymous';
      el.preload = 'metadata';
      el.src = track.url;

      const source = ctx.createMediaElementSource(el);
      const gain = ctx.createGain();
      gain.gain.value = 1;
      source.connect(gain);
      gain.connect(ctx.destination);

      gains.current[track.id] = gain;
      audioEls.current[track.id] = el;

      if (i === 0) {
        masterEl.current = el;
        el.addEventListener('loadedmetadata', () => setDuration(el.duration || 0));
        el.addEventListener('timeupdate', () => {
          if (!isSeeking.current) setCurrentTime(el.currentTime);
        });
        el.addEventListener('ended', () => { setPlaying(false); setCurrentTime(0); });
      }

      el.addEventListener('canplay', () => {
        loadedCount++;
        setLoaded(loadedCount);
      }, { once: true });

      el.addEventListener('error', () => setLoadError(true), { once: true });
    });

    return () => {
      Object.values(audioEls.current).forEach(el => { el.pause(); el.src = ''; });
      ctx.close().catch(() => {});
    };
  }, []);

  // Recompute gain values whenever mixer state changes
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;

    tracks.forEach(({ id, kind }) => {
      const gain = gains.current[id];
      if (!gain) return;
      let vol = volumes[id];
      if (muted[id]) { vol = 0; }
      else if (soloId && soloId !== id) {
        vol = (rehearsal && kind === 'voice') ? 0.15 : 0;
      }
      gain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), now, 0.015);
    });
  }, [volumes, muted, soloId, rehearsal]);

  const togglePlay = useCallback(async () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') await ctx.resume();

    if (playing) {
      Object.values(audioEls.current).forEach(el => el.pause());
      setPlaying(false);
    } else {
      const playPromises = Object.values(audioEls.current).map(el => el.play().catch(() => {}));
      await Promise.all(playPromises);
      setPlaying(true);
    }
  }, [playing]);

  const handleSeek = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const t = pct * duration;
    isSeeking.current = true;
    Object.values(audioEls.current).forEach(el => { el.currentTime = t; });
    setCurrentTime(t);
    setTimeout(() => { isSeeking.current = false; }, 200);
  }, [duration]);

  const applyPreset = useCallback((preset) => {
    setVolumes(prev => ({ ...prev, ...preset.volumes }));
    setMuted(Object.fromEntries(tracks.map(t => [t.id, false])));
    setSoloId(null);
  }, [tracks]);

  const resetMixer = () => {
    setVolumes(Object.fromEntries(tracks.map(t => [t.id, 1])));
    setMuted(Object.fromEntries(tracks.map(t => [t.id, false])));
    setSoloId(null);
  };

  const allLoaded = loaded >= tracks.length;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const voiceTracks = tracks.filter(t => t.kind === 'voice');
  const hasVoices = voiceTracks.length > 0;

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
      {/* Header */}
      {title && (
        <div className="px-4 py-3 border-b" style={{ borderColor: '#1C2A44' }}>
          <p className="text-sm font-semibold" style={{ color: '#EAF2FF' }}>{title}</p>
        </div>
      )}

      {/* Transport */}
      <div className="px-4 py-3 border-b" style={{ borderColor: '#1C2A44' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            disabled={!allLoaded || loadError}
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 disabled:opacity-40 transition-colors"
            style={{ backgroundColor: '#1EA0FF20', border: '1px solid #1EA0FF40' }}>
            {!allLoaded && !loadError
              ? <span className="w-3.5 h-3.5 border border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1EA0FF' }} />
              : playing
                ? <Pause className="w-4 h-4" style={{ color: '#1EA0FF' }} />
                : <Play className="w-4 h-4 ml-0.5" style={{ color: '#1EA0FF' }} />}
          </button>

          {/* Scrubber */}
          <div className="flex-1 flex items-center gap-2">
            <span className="text-[11px] font-mono tabular-nums w-10 text-right shrink-0" style={{ color: '#9CB2D6' }}>{fmtT(currentTime)}</span>
            <div className="flex-1 h-2 rounded-full cursor-pointer relative overflow-hidden"
              style={{ backgroundColor: '#1C2A44' }}
              onClick={handleSeek}>
              <div className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${progress}%`, backgroundColor: '#1EA0FF' }} />
            </div>
            <span className="text-[11px] font-mono tabular-nums w-10 shrink-0" style={{ color: '#9CB2D6' }}>{fmtT(duration)}</span>
          </div>

          {/* Reset */}
          <button onClick={resetMixer} title="Reset mixer"
            className="w-7 h-7 rounded flex items-center justify-center shrink-0"
            style={{ color: '#9CB2D6', border: '1px solid #1C2A44' }}
            onMouseEnter={e => e.currentTarget.style.color='#EAF2FF'}
            onMouseLeave={e => e.currentTarget.style.color='#9CB2D6'}>
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {loadError && (
          <p className="text-[11px] mt-2" style={{ color: '#FFB020' }}>
            Some tracks failed to load. Check audio URLs or CORS settings.
          </p>
        )}
        {!allLoaded && !loadError && (
          <p className="text-[11px] mt-1.5" style={{ color: '#9CB2D6' }}>
            Loading tracks… {loaded}/{tracks.length}
          </p>
        )}
      </div>

      {/* Presets */}
      {presets?.length > 0 && (
        <div className="px-4 py-2.5 border-b" style={{ borderColor: '#1C2A44' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#9CB2D6' }}>Quick Presets</p>
          <div className="flex flex-wrap gap-1.5">
            {presets.map(preset => (
              <button key={preset.label} onClick={() => applyPreset(preset)}
                className="text-[11px] px-2.5 py-1 rounded-lg transition-colors"
                style={{ backgroundColor: '#1C2A44', color: '#9CB2D6', border: '1px solid #1C2A44' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor='#1EA0FF15'; e.currentTarget.style.color='#EAF2FF'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor='#1C2A44'; e.currentTarget.style.color='#9CB2D6'; }}>
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rehearsal mode */}
      {hasVoices && (
        <div className="px-4 py-2.5 border-b" style={{ borderColor: '#1C2A44' }}>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setRehearsal(v => !v)}
              className="w-9 h-5 rounded-full relative transition-colors shrink-0"
              style={{ backgroundColor: rehearsal ? '#9B74FF' : '#1C2A44' }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm"
                style={{ left: rehearsal ? '18px' : '2px' }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" style={{ color: rehearsal ? '#9B74FF' : '#9CB2D6' }} />
                <span className="text-xs font-medium" style={{ color: rehearsal ? '#EAF2FF' : '#9CB2D6' }}>Rehearsal Mode</span>
              </div>
              <p className="text-[10px] mt-0.5" style={{ color: '#9CB2D6' }}>
                Solo a part — other voices play softly in background so you can stay in tune.
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Track controls */}
      <div className="px-4 py-3 space-y-2">
        <div className="hidden sm:flex items-center gap-3 px-3 pb-1">
          <div className="w-24 shrink-0" />
          <div className="flex-1 text-[10px] uppercase tracking-wider" style={{ color: '#9CB2D6' }}>Volume</div>
          <div className="w-7 shrink-0" />
          <div className="w-7 text-[10px] text-center uppercase tracking-wider shrink-0" style={{ color: '#9CB2D6' }}>Mute</div>
          <div className="w-7 text-[10px] text-center uppercase tracking-wider shrink-0" style={{ color: '#9CB2D6' }}>Solo</div>
          <div className="w-7 shrink-0" />
        </div>

        {tracks.map(track => (
          <TrackRow
            key={track.id}
            track={track}
            volume={volumes[track.id] ?? 1}
            muted={!!muted[track.id]}
            soloed={soloId === track.id}
            anySolo={!!soloId}
            rehearsal={rehearsal}
            onVolume={v => setVolumes(prev => ({ ...prev, [track.id]: v }))}
            onMute={() => setMuted(prev => ({ ...prev, [track.id]: !prev[track.id] }))}
            onSolo={() => setSoloId(prev => prev === track.id ? null : track.id)}
          />
        ))}
      </div>
    </div>
  );
}