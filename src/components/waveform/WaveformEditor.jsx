import React, { useRef, useEffect, useState } from 'react';

const fmt = (s) => {
  if (s == null || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export default function WaveformEditor({
  audioFile = null,
  onRangeChange,
  initialStart = 0,
  initialEnd = null,
  maxClip = 120,
  minClip = 5,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [peaks, setPeaks] = useState(null);
  const [duration, setDuration] = useState(0);
  const [selStart, setSelStart] = useState(initialStart);
  const [selEnd, setSelEnd] = useState(initialEnd);
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const bufferRef = useRef(null);
  const sourceRef = useRef(null);
  const animRef = useRef(null);
  const listenersRef = useRef({});
  const selRef = useRef({ start: 0, end: null });

  // Keep selRef in sync
  useEffect(() => { selRef.current = { start: selStart, end: selEnd }; }, [selStart, selEnd]);

  // Load & decode audio file
  useEffect(() => {
    if (!audioFile) { setPeaks(null); setDuration(0); return; }
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    setPeaks(null);

    (async () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const ab = await audioFile.arrayBuffer();
        if (cancelled) { ctx.close(); return; }
        const buffer = await ctx.decodeAudioData(ab);
        if (cancelled) { ctx.close(); return; }
        bufferRef.current = buffer;
        const dur = buffer.duration;
        setDuration(dur);
        const endInit = initialEnd != null ? Math.min(initialEnd, dur) : Math.min(maxClip, dur);
        setSelStart(0);
        setSelEnd(endInit);
        if (onRangeChange) onRangeChange({ start: 0, end: endInit, duration: dur });

        const ch = buffer.getChannelData(0);
        const BARS = 900;
        const block = Math.floor(ch.length / BARS);
        const ps = Array.from({ length: BARS }, (_, i) => {
          const s = i * block;
          let max = 0;
          for (let j = 0; j < block && s + j < ch.length; j++) {
            const abs = Math.abs(ch[s + j]);
            if (abs > max) max = abs;
          }
          return max;
        });
        setPeaks(ps);
        await ctx.close();
      } catch (err) {
        if (!cancelled) setLoadError('Could not decode audio.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [audioFile]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    const cont = containerRef.current;
    if (!canvas || !cont) return;
    canvas.width = cont.offsetWidth;
    canvas.height = 80;

    if (!peaks || !duration) return;
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#070E1A';
    ctx.fillRect(0, 0, W, H);

    const sX = selStart != null ? Math.round((selStart / duration) * W) : null;
    const eX = selEnd != null ? Math.round((selEnd / duration) * W) : null;

    if (sX != null && eX != null) {
      ctx.fillStyle = '#1EA0FF18';
      ctx.fillRect(sX, 0, eX - sX, H);
    }

    const bw = W / peaks.length;
    peaks.forEach((peak, i) => {
      const x = i * bw;
      const t = (i / peaks.length) * duration;
      const inSel = selStart != null && selEnd != null && t >= selStart && t <= selEnd;
      const bh = Math.max(2, peak * (H - 8) * 0.9);
      const y = (H - bh) / 2;
      ctx.fillStyle = inSel ? '#1EA0FF' : '#1C3A5E';
      ctx.fillRect(x, y, Math.max(1, bw - 0.5), bh);
    });

    const drawHandle = (x) => {
      ctx.fillStyle = '#1EA0FF';
      ctx.fillRect(x - 1, 0, 2, H);
      ctx.beginPath();
      ctx.arc(x, 8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0B1220';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };
    if (sX != null) drawHandle(sX);
    if (eX != null) drawHandle(eX);

    if (playhead > 0) {
      const px = Math.round((playhead / duration) * W);
      ctx.fillStyle = '#FFB020';
      ctx.fillRect(px, 0, 2, H);
    }
  }, [peaks, duration, selStart, selEnd, playhead]);

  useEffect(() => {
    const resize = () => { if (canvasRef.current && peaks) { /* trigger redraw */ setPlayhead(h => h); } };
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [peaks]);

  // Cleanup drag listeners on unmount
  useEffect(() => {
    return () => {
      if (listenersRef.current.move) window.removeEventListener('mousemove', listenersRef.current.move);
      if (listenersRef.current.up) window.removeEventListener('mouseup', listenersRef.current.up);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  const getTimeAt = (clientX) => {
    const r = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(r.width, clientX - r.left));
    return (x / r.width) * duration;
  };

  const handleMouseDown = (e) => {
    if (!duration || !canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    const localX = e.clientX - r.left;
    const { start, end } = selRef.current;

    const sX = start != null ? (start / duration) * r.width : null;
    const eX = end != null ? (end / duration) * r.width : null;

    let dragType;
    let curStart = start;
    let curEnd = end;

    if (sX != null && Math.abs(localX - sX) < 12) {
      dragType = 'start';
    } else if (eX != null && Math.abs(localX - eX) < 12) {
      dragType = 'end';
    } else {
      dragType = 'end';
      curStart = getTimeAt(e.clientX);
      curEnd = Math.min(duration, curStart + 30);
      setSelStart(curStart);
      setSelEnd(curEnd);
    }

    const onMove = (e) => {
      const t = getTimeAt(e.clientX);
      if (dragType === 'start') {
        const maxS = Math.max(0, (curEnd ?? duration) - minClip);
        curStart = Math.max(0, Math.min(maxS, t));
        setSelStart(curStart);
      } else {
        const minE = (curStart ?? 0) + minClip;
        const maxE = Math.min(duration, (curStart ?? 0) + maxClip);
        curEnd = Math.max(minE, Math.min(maxE, t));
        setSelEnd(curEnd);
      }
    };

    const onUp = () => {
      window.removeEventListener('mousemove', listenersRef.current.move);
      window.removeEventListener('mouseup', listenersRef.current.up);
      if (onRangeChange) onRangeChange({ start: curStart, end: curEnd, duration });
    };

    listenersRef.current = { move: onMove, up: onUp };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const setRange = (s, e) => {
    const start = Math.max(0, s);
    const end = Math.min(duration, e);
    setSelStart(start);
    setSelEnd(end);
    if (onRangeChange) onRangeChange({ start, end, duration });
  };

  const togglePlay = async () => {
    if (playing) {
      sourceRef.current?.stop?.();
      setPlaying(false);
      cancelAnimationFrame(animRef.current);
      return;
    }
    if (!bufferRef.current || selStart == null || selEnd == null) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const src = ctx.createBufferSource();
      src.buffer = bufferRef.current;
      src.connect(ctx.destination);
      src.start(0, selStart, selEnd - selStart);
      sourceRef.current = src;
      setPlaying(true);
      const wall0 = Date.now(), audio0 = selStart;
      const animate = () => {
        const ph = audio0 + (Date.now() - wall0) / 1000;
        if (ph >= selEnd) { setPlaying(false); setPlayhead(selStart); ctx.close(); return; }
        setPlayhead(ph);
        animRef.current = requestAnimationFrame(animate);
      };
      animate();
      src.onended = () => { setPlaying(false); setPlayhead(selStart); cancelAnimationFrame(animRef.current); };
    } catch (err) {
      console.error('WaveformEditor playback error:', err);
    }
  };

  const clipLen = selStart != null && selEnd != null ? selEnd - selStart : null;
  const isErr = clipLen != null && (clipLen < minClip || clipLen > maxClip);

  const [editingStart, setEditingStart] = useState(false);
  const [editingEnd, setEditingEnd] = useState(false);
  const [editVal, setEditVal] = useState('');

  const parseTime = (str) => {
    const parts = str.trim().split(':');
    if (parts.length === 2) return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
    return parseFloat(str);
  };

  const commitStart = () => {
    const t = parseTime(editVal);
    if (!isNaN(t)) {
      const s = Math.max(0, Math.min(t, (selEnd ?? duration) - minClip));
      setSelStart(s);
      if (onRangeChange) onRangeChange({ start: s, end: selEnd, duration });
    }
    setEditingStart(false);
  };

  const commitEnd = () => {
    const t = parseTime(editVal);
    if (!isNaN(t)) {
      const e = Math.max((selStart ?? 0) + minClip, Math.min(duration, Math.min((selStart ?? 0) + maxClip, t)));
      setSelEnd(e);
      if (onRangeChange) onRangeChange({ start: selStart, end: e, duration });
    }
    setEditingEnd(false);
  };

  const handleKeyStep = (e, type) => {
    const step = e.shiftKey ? 5 : 1;
    const dir = e.key === 'ArrowUp' ? 1 : e.key === 'ArrowDown' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const cur = parseTime(editVal);
    if (!isNaN(cur)) setEditVal(fmt(cur + dir * step));
  };

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#070E1A', borderColor: '#1C2A44' }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: '#1C2A44', backgroundColor: '#0A1422' }}>
        <div>
          <p className="text-xs font-semibold" style={{ color: '#EAF2FF' }}>Trim Range</p>
          <p className="text-[10px] mt-0.5" style={{ color: '#9CB2D6' }}>
            Drag handles or click times to edit.
          </p>
        </div>
        {clipLen != null && (
          <div className="flex items-center gap-1.5 ml-3 shrink-0">
            {/* Start time — editable */}
            {editingStart ? (
              <input
                autoFocus
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                onBlur={commitStart}
                onKeyDown={e => { if (e.key === 'Enter') commitStart(); if (e.key === 'Escape') setEditingStart(false); }}
                className="h-7 px-2.5 rounded-lg text-[12px] font-mono tabular-nums font-semibold outline-none w-16 text-center"
                style={{ backgroundColor: '#1EA0FF18', border: '1px solid #1EA0FF60', color: '#1EA0FF' }}
              />
            ) : (
              <button
                onClick={() => { setEditVal(fmt(playing ? playhead : selStart)); setEditingStart(true); }}
                title="Click to edit start time"
                className="flex items-center gap-1 h-7 px-2.5 rounded-lg transition-all"
                style={{ backgroundColor: playing ? '#FFB02015' : '#0B1220', border: `1px solid ${playing ? '#FFB02040' : '#1C2A44'}` }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: playing ? '#FFB020' : '#1C2A44', boxShadow: playing ? '0 0 5px #FFB020' : 'none', transition: 'all 0.2s' }} />
                <span className="text-[12px] font-mono tabular-nums font-semibold"
                  style={{ color: playing ? '#FFB020' : '#9CB2D6', letterSpacing: '0.04em', minWidth: 36, textAlign: 'right' }}>
                  {fmt(playing ? playhead : selStart)}
                </span>
              </button>
            )}
            <span className="text-[10px]" style={{ color: '#1C2A44' }}>—</span>
            {/* End time — editable */}
            {editingEnd ? (
              <input
                autoFocus
                value={editVal}
                onChange={e => setEditVal(e.target.value)}
                onBlur={commitEnd}
                onKeyDown={e => { if (e.key === 'Enter') commitEnd(); if (e.key === 'Escape') setEditingEnd(false); }}
                className="h-7 px-2.5 rounded-lg text-[12px] font-mono tabular-nums font-semibold outline-none w-16 text-center"
                style={{ backgroundColor: '#1EA0FF18', border: '1px solid #1EA0FF60', color: '#1EA0FF' }}
              />
            ) : (
              <button
                onClick={() => { setEditVal(fmt(selEnd)); setEditingEnd(true); }}
                title="Click to edit end time"
                className="h-7 px-2.5 rounded-lg flex items-center transition-all"
                style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
                <span className="text-[12px] font-mono tabular-nums font-semibold"
                  style={{ color: '#9CB2D6', letterSpacing: '0.04em' }}>
                  {fmt(selEnd)}
                </span>
              </button>
            )}
            {/* Duration pill */}
            <div className="h-7 px-2.5 rounded-lg flex items-center"
              style={{ backgroundColor: isErr ? '#FF4D6D12' : '#1EA0FF10', border: `1px solid ${isErr ? '#FF4D6D30' : '#1EA0FF25'}` }}>
              <span className="text-[11px] font-mono tabular-nums font-bold"
                style={{ color: isErr ? '#FF4D6D' : '#1EA0FF', letterSpacing: '0.03em' }}>
                {fmt(clipLen)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div ref={containerRef} style={{ height: 80, position: 'relative' }}>
        {!audioFile && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs" style={{ color: '#9CB2D6' }}>Upload a file to see waveform</p>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#070E1A' }}>
            <p className="text-xs animate-pulse" style={{ color: '#9CB2D6' }}>Decoding audio…</p>
          </div>
        )}
        {loadError && !loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs" style={{ color: '#FF4D6D' }}>{loadError}</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: 80, display: peaks ? 'block' : 'none', cursor: 'crosshair', userSelect: 'none' }}
          onMouseDown={handleMouseDown}
        />
      </div>

      {/* Controls */}
      <div className="px-4 py-2.5 border-t flex items-center justify-between gap-3 flex-wrap"
        style={{ borderColor: '#1C2A44', backgroundColor: '#0A1422' }}>
        <button onClick={togglePlay} disabled={!peaks}
          className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11px] font-medium transition-all disabled:opacity-30"
          style={{ backgroundColor: '#1EA0FF18', color: '#1EA0FF', border: '1px solid #1EA0FF30' }}>
          {playing ? '■ Stop' : '▶ Play selection'}
        </button>
        <div className="flex gap-1.5">
          {[
            { label: 'Full track', fn: () => setRange(0, duration) },
            { label: 'First 30s', fn: () => setRange(0, 30) },
            { label: 'Chorus (~40%)', fn: () => setRange(duration * 0.38, duration * 0.38 + 30) },
          ].map(({ label, fn }) => (
            <button key={label} onClick={fn} disabled={!peaks}
              className="h-7 px-2.5 rounded-lg text-[11px] font-medium disabled:opacity-30"
              style={{ backgroundColor: '#1C2A44', color: '#9CB2D6' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1EA0FF18'; e.currentTarget.style.color = '#1EA0FF'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1C2A44'; e.currentTarget.style.color = '#9CB2D6'; }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {isErr && (
        <div className="px-4 py-1.5 text-[11px]" style={{ color: '#FF4D6D', backgroundColor: '#FF4D6D08' }}>
          {clipLen < minClip ? `Minimum clip length is ${minClip} seconds.` : `Maximum clip length is ${maxClip} seconds.`}
        </div>
      )}
    </div>
  );
}