import React from 'react';

function Metric({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
      <p className="text-white/35 text-xs mb-1.5">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value ?? '—'}</p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function loudnessColor(lufs) {
  if (lufs == null) return 'text-white';
  if (lufs > -9) return 'text-red-400';
  if (lufs > -14) return 'text-amber-400';
  return 'text-emerald-400';
}

export default function ReferenceMetrics({ analysis }) {
  const lufs = analysis.lufs;
  const peak = analysis.peak_db;
  const dr = analysis.dynamic_range?.dynamic_range;
  const width = analysis.stereo_width?.width_percentage;
  const compression = analysis.dynamic_range?.compression_level;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Metric
        label="Integrated LUFS"
        value={lufs != null ? lufs.toFixed(1) : null}
        sub="Target: −14 LUFS streaming"
        color={loudnessColor(lufs)}
      />
      <Metric
        label="True Peak"
        value={peak != null ? `${peak.toFixed(1)} dBTP` : null}
        sub="Recommended: < −1 dBTP"
        color={peak != null && peak > -1 ? 'text-red-400' : 'text-white'}
      />
      <Metric
        label="Dynamic Range"
        value={dr != null ? `${dr.toFixed(0)} dR` : null}
        sub={compression || ''}
      />
      <Metric
        label="Stereo Width"
        value={width != null ? `${Math.round(width)}%` : null}
        sub="0% = mono, 100% = wide"
      />
    </div>
  );
}