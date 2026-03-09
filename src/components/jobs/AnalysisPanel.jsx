import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function StatBlock({ label, value, unit }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
      <p className="text-white/40 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold text-lg">{value ?? '—'}{unit && <span className="text-white/40 text-sm ml-1">{unit}</span>}</p>
    </div>
  );
}

export default function AnalysisPanel({ job }) {
  const analysis = job.analysis || {};

  // Build a simple mock EQ curve from analysis data or show placeholder
  const eqCurve = analysis.eq_curve
    ? Object.entries(analysis.eq_curve).map(([freq, db]) => ({ freq: Number(freq), db: Number(db) }))
    : null;

  const lufs = analysis.lufs ?? null;
  const crestFactor = analysis.crest_factor ?? null;
  const dynamicRange = analysis.dynamic_range ?? null;
  const stereoWidth = analysis.stereo_width ?? null;

  const hasAnalysis = lufs !== null || crestFactor !== null || dynamicRange !== null || eqCurve;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">Analysis</h2>

      {/* Technical stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBlock label="Duration" value={job.duration_seconds ? `${Math.round(job.duration_seconds)}s` : null} />
        <StatBlock label="Sample Rate" value={job.sample_rate ? `${(job.sample_rate / 1000).toFixed(1)}kHz` : null} />
        <StatBlock label="Channels" value={job.channels === 2 ? 'Stereo' : job.channels === 1 ? 'Mono' : null} />
        <StatBlock label="Format" value={job.output_format?.toUpperCase()} />
      </div>

      {hasAnalysis && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBlock label="LUFS (integrated)" value={lufs !== null ? lufs.toFixed(1) : null} unit="LUFS" />
            <StatBlock label="Crest Factor" value={crestFactor !== null ? crestFactor.toFixed(1) : null} unit="dB" />
            <StatBlock label="Dynamic Range" value={dynamicRange !== null ? dynamicRange.toFixed(1) : null} unit="dR" />
            <StatBlock label="Stereo Width" value={stereoWidth !== null ? `${Math.round(stereoWidth * 100)}%` : null} />
          </div>

          {eqCurve && eqCurve.length > 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <p className="text-xs text-white/40 mb-4">EQ Curve (Frequency vs. dB)</p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={eqCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="freq" scale="log" domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={v => v >= 1000 ? `${v/1000}k` : v} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} domain={['auto', 'auto']} />
                  <Tooltip contentStyle={{ background: '#0f0f17', border: '1px solid #ffffff10', borderRadius: 8 }} labelFormatter={v => `${v} Hz`} formatter={v => [`${v.toFixed(1)} dB`, 'Level']} />
                  <Line type="monotone" dataKey="db" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {analysis.summary && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <p className="text-xs text-white/40 mb-2">Summary & Suggestions</p>
              <p className="text-white/70 text-sm leading-relaxed">{analysis.summary}</p>
            </div>
          )}

          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div className="space-y-2">
              {analysis.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="text-violet-400 shrink-0 mt-0.5">→</span>
                  {s}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!hasAnalysis && (
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-5 text-center">
          <p className="text-white/30 text-sm">Detailed analysis will appear here once the job completes with a worker that supports it.</p>
        </div>
      )}
    </div>
  );
}