import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const BAND_LABELS = {
  '20': 'Sub', '60': 'Bass', '250': 'Lo-Mid',
  '500': 'Mid', '2000': '2k', '4000': '4k',
  '6000': '6k', '10000': '10k', '20000': '20k',
};

export default function ReferenceEQChart({ eqData, compareData, compareName }) {
  if (!eqData || !eqData.frequencies || eqData.frequencies.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
        <p className="text-white/25 text-sm">No EQ curve data available.</p>
      </div>
    );
  }

  // Merge reference + compare data into one array keyed by freq
  const compareMap = {};
  if (compareData?.frequencies) {
    compareData.frequencies.forEach(p => { compareMap[p.freq] = p.level; });
  }

  const data = eqData.frequencies.map(point => ({
    freq: point.freq,
    reference: point.level,
    ...(compareData ? { [compareName || 'comparison']: compareMap[point.freq] ?? null } : {}),
  }));

  const freqLabel = (v) => BAND_LABELS[v] || (Number(v) >= 1000 ? `${Number(v)/1000}k` : v);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Frequency Response</p>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-violet-400 inline-block rounded" />Reference</span>
          {compareData && <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-400 inline-block rounded" />{compareName || 'Comparison'}</span>}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="refGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cmpGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff07" />
          <XAxis dataKey="freq" tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={freqLabel} />
          <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} domain={['auto', 'auto']} width={28} />
          <ReferenceLine y={0} stroke="#ffffff15" strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{ background: '#0d0d15', border: '1px solid #ffffff10', borderRadius: 8, fontSize: 12 }}
            labelFormatter={v => `${freqLabel(v)} Hz`}
            formatter={(v, name) => [`${v?.toFixed ? v.toFixed(1) : v} dB`, name]}
          />
          <Area type="monotone" dataKey="reference" stroke="#0ea5e9" strokeWidth={2} fill="url(#refGrad)" dot={false} />
          {compareData && <Area type="monotone" dataKey={compareName || 'comparison'} stroke="#34d399" strokeWidth={2} fill="url(#cmpGrad)" dot={false} connectNulls />}
        </AreaChart>
      </ResponsiveContainer>
      {eqData.analysis && (
        <p className="text-white/40 text-xs mt-3 leading-relaxed">{eqData.analysis}</p>
      )}
    </div>
  );
}