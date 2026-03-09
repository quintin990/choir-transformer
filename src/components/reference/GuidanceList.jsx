import React from 'react';
import { Lightbulb } from 'lucide-react';

export default function GuidanceList({ guidance, dynamicAnalysis, stereoAnalysis }) {
  const items = [
    ...(guidance || []),
  ];

  if (items.length === 0 && !dynamicAnalysis && !stereoAnalysis) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest text-xs">Mixing Recommendations</h3>
      </div>

      {dynamicAnalysis && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <p className="text-xs font-medium text-white/40 mb-1">Dynamics</p>
          <p className="text-sm text-white/70 leading-relaxed">{dynamicAnalysis}</p>
        </div>
      )}

      {stereoAnalysis && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
          <p className="text-xs font-medium text-white/40 mb-1">Stereo Field</p>
          <p className="text-sm text-white/70 leading-relaxed">{stereoAnalysis}</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3">
              <span className="text-amber-400 text-sm font-bold shrink-0">{i + 1}</span>
              <p className="text-sm text-white/65 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}