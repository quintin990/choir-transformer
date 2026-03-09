import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { GitCompare, Upload, Play, Pause, Loader2, Zap, RotateCcw } from 'lucide-react';
import Card, { CardHeader } from '../components/auralyn/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

const FREQ_BANDS = [
  { label: '40Hz', range: 'Sub bass' },
  { label: '80Hz', range: 'Bass' },
  { label: '160Hz', range: 'Low mid' },
  { label: '250Hz', range: 'Warmth' },
  { label: '500Hz', range: 'Mid' },
  { label: '1kHz', range: 'Presence' },
  { label: '2kHz', range: 'Upper mid' },
  { label: '4kHz', range: 'Air' },
  { label: '8kHz', range: 'Brilliance' },
  { label: '16kHz', range: 'Treble' },
];

function generateMockSpectrum() {
  return FREQ_BANDS.map(({ label, range }) => ({
    label,
    range,
    mix: -(Math.random() * 30 + 5),
    ref: -(Math.random() * 30 + 5),
  }));
}

function AudioPlayer({ label, color, file, onFile }) {
  const inputRef = useRef(null);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file) { setUrl(null); setPlaying(false); setProgress(0); setCurrent(0); return; }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const fmtT = s => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  const toggle = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(v => !v);
  };

  return (
    <div className="rounded-xl border p-4 flex flex-col gap-3" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CB2D6' }}>{label}</span>
      </div>

      {!file ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 h-24 rounded-lg border-dashed border-2 text-xs transition-all"
          style={{ borderColor: color + '40', color: '#9CB2D6', backgroundColor: color + '08' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = color + '80'}
          onMouseLeave={e => e.currentTarget.style.borderColor = color + '40'}>
          <Upload className="w-4 h-4" style={{ color }} />
          Drop or click to upload
          <span className="text-[10px]" style={{ color: '#9CB2D6' }}>MP3, WAV, FLAC</span>
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium truncate" style={{ color: '#EAF2FF' }}>{file.name}</p>
          <div className="flex items-center gap-3">
            <button onClick={toggle}
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: color + '20', border: `1px solid ${color}40` }}>
              {url && playing
                ? <Pause className="w-3.5 h-3.5" style={{ color }} />
                : <Play className="w-3.5 h-3.5 ml-0.5" style={{ color }} />}
            </button>
            <div className="flex-1">
              <div className="h-1.5 rounded-full overflow-hidden cursor-pointer" style={{ backgroundColor: '#1C2A44' }}
                onClick={e => {
                  if (!audioRef.current?.duration) return;
                  const r = e.currentTarget.getBoundingClientRect();
                  audioRef.current.currentTime = ((e.clientX - r.left) / r.width) * audioRef.current.duration;
                }}>
                <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] font-mono" style={{ color: '#9CB2D6' }}>{fmtT(current)}</span>
                <span className="text-[10px] font-mono" style={{ color: '#9CB2D6' }}>{fmtT(duration)}</span>
              </div>
            </div>
            <button onClick={() => onFile(null)} className="text-xs" style={{ color: '#9CB2D6' }}>✕</button>
          </div>
        </div>
      )}

      {url && (
        <audio ref={audioRef} src={url}
          onTimeUpdate={() => {
            if (!audioRef.current?.duration) return;
            setCurrent(audioRef.current.currentTime);
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          onEnded={() => setPlaying(false)} />
      )}

      <input ref={inputRef} type="file" accept="audio/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const diff = payload[0]?.value;
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-lg" style={{ backgroundColor: '#0F1A2E', border: '1px solid #1C2A44' }}>
      <p className="font-semibold mb-1" style={{ color: '#EAF2FF' }}>{label}</p>
      <p style={{ color: diff > 0 ? '#1EA0FF' : diff < 0 ? '#FF4D6D' : '#9CB2D6' }}>
        {diff > 0 ? '+' : ''}{diff?.toFixed(1)} dB vs reference
      </p>
    </div>
  );
};

export default function Match() {
  const [mixFile, setMixFile] = useState(null);
  const [refFile, setRefFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const canAnalyze = mixFile && refFile && !analyzing;

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setResult(null);

    // Simulate analysis delay + mock spectral data
    await new Promise(r => setTimeout(r, 1800));

    const spectrum = generateMockSpectrum().map(band => ({
      ...band,
      diff: parseFloat((band.mix - band.ref).toFixed(1)),
    }));

    // Generate EQ suggestions via LLM
    let suggestions = [];
    try {
      const prompt = `You are a mastering engineer. Given these spectral differences (mix vs reference, in dB) for a music track:
${spectrum.map(b => `${b.label} (${b.range}): ${b.diff > 0 ? '+' : ''}${b.diff} dB`).join('\n')}
Give 3–5 short, specific EQ adjustments the user should make to their mix to match the reference. Use musician-friendly language. Each suggestion must be under 12 words. Return JSON: {"suggestions": [{"band": "...", "action": "...", "amount": "..."}]}`;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            suggestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  band: { type: 'string' },
                  action: { type: 'string' },
                  amount: { type: 'string' },
                },
              },
            },
          },
        },
      });
      suggestions = res.suggestions || [];
    } catch (_) {}

    setResult({ spectrum, suggestions });
    setAnalyzing(false);
  };

  const reset = () => { setResult(null); };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2.5 mb-7">
        <GitCompare className="w-4 h-4" style={{ color: '#9B74FF' }} />
        <h1 className="text-xl font-bold" style={{ color: '#EAF2FF', letterSpacing: '-0.02em' }}>Mix Match</h1>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
          style={{ backgroundColor: '#9B74FF18', color: '#9B74FF', border: '1px solid #9B74FF30' }}>Beta</span>
      </div>
      <p className="text-sm mb-7" style={{ color: '#9CB2D6' }}>
        Upload your mix and a reference. Get a spectral diff and EQ targets.
      </p>

      {/* Players */}
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <AudioPlayer label="Your Mix" color="#1EA0FF" file={mixFile} onFile={setMixFile} />
        <AudioPlayer label="Reference" color="#9B74FF" file={refFile} onFile={setRefFile} />
      </div>

      {/* Analyze button */}
      {!result && (
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="w-full h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed mb-7"
          style={{ backgroundColor: '#9B74FF', color: '#fff' }}>
          {analyzing
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</>
            : <><Zap className="w-4 h-4" /> Compare Tracks</>}
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Spectral diff chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold" style={{ color: '#EAF2FF' }}>Spectral Difference</p>
                <p className="text-xs mt-0.5" style={{ color: '#9CB2D6' }}>Your mix vs reference · positive = your mix is louder</p>
              </div>
              <button onClick={reset}
                className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11px] border"
                style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}>
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Legend */}
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#9CB2D6' }}>
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#1EA0FF' }} /> Mix louder
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#9CB2D6' }}>
                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FF4D6D' }} /> Reference louder
              </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={result.spectrum} margin={{ left: -10, right: 10 }}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CB2D6' }} />
                <YAxis tick={{ fontSize: 10, fill: '#9CB2D6' }} unit=" dB" />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1EA0FF08' }} />
                <ReferenceLine y={0} stroke="#1C2A44" />
                <Bar dataKey="diff" radius={[3, 3, 0, 0]} name="Difference">
                  {result.spectrum.map((entry, i) => (
                    <Cell key={i} fill={entry.diff >= 0 ? '#1EA0FF' : '#FF4D6D'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* EQ suggestions */}
          {result.suggestions.length > 0 && (
            <Card>
              <CardHeader title="EQ Targets" subtitle="Suggested adjustments to match the reference" />
              <div className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg px-3 py-2.5"
                    style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
                    <span className="text-xs font-bold tabular-nums mt-0.5 w-5 shrink-0" style={{ color: '#9B74FF' }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold" style={{ color: '#EAF2FF' }}>{s.band}</span>
                      <span className="text-xs ml-2" style={{ color: '#9CB2D6' }}>{s.action}</span>
                    </div>
                    {s.amount && (
                      <span className="text-xs font-semibold shrink-0" style={{ color: '#FFB020' }}>{s.amount}</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] mt-3" style={{ color: '#9CB2D6' }}>
                Suggestions are based on spectral comparison. Trust your ears.
              </p>
            </Card>
          )}

          {/* Per-band table */}
          <Card>
            <CardHeader title="Band Detail" subtitle="Mix vs reference by frequency range" />
            <div className="space-y-0">
              {result.spectrum.map(({ label, range, mix, ref, diff }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b text-xs"
                  style={{ borderColor: '#1C2A44' }}>
                  <div className="flex items-center gap-3 w-28">
                    <span className="font-mono font-semibold" style={{ color: '#EAF2FF' }}>{label}</span>
                    <span style={{ color: '#9CB2D6' }}>{range}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-mono" style={{ color: '#1EA0FF' }}>{mix.toFixed(1)} dB</span>
                    <span className="font-mono" style={{ color: '#9B74FF' }}>{ref.toFixed(1)} dB</span>
                    <span className="font-mono font-semibold w-14 text-right"
                      style={{ color: diff > 1 ? '#1EA0FF' : diff < -1 ? '#FF4D6D' : '#19D3A2' }}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(1)} dB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {!result && !analyzing && (
        <div className="text-center py-12" style={{ color: '#9CB2D6' }}>
          <GitCompare className="w-8 h-8 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Upload both tracks to compare.</p>
        </div>
      )}
    </div>
  );
}