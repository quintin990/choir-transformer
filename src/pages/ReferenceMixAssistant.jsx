import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FlaskConical, ArrowRight } from 'lucide-react';

export default function ReferenceMixAssistant() {
  return (
    <div className="max-w-xl mx-auto px-6 py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
        <FlaskConical className="w-6 h-6 text-violet-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">Reference Mix Assistant</h1>
      <p className="text-white/40 text-sm leading-relaxed mb-2">
        Upload a reference track and get detailed audio analysis: LUFS, spectral response, dynamic range, stereo width, and actionable mixing suggestions.
      </p>
      <p className="text-white/25 text-sm mb-8">
        This feature is currently in development and will be available with the Pro plan.
      </p>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-left space-y-3 mb-8">
        <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">Coming soon</p>
        {[
          'Upload a reference track (MP3, WAV, FLAC)',
          'Integrated LUFS and peak analysis',
          'Frequency spectrum comparison',
          'Stereo width and dynamic range metrics',
          'Side-by-side mixing recommendations',
          'Export analysis as a PDF report',
        ].map(item => (
          <div key={item} className="flex items-start gap-2 text-sm text-white/50">
            <span className="text-violet-500 mt-0.5">·</span>
            {item}
          </div>
        ))}
      </div>

      <Link
        to={createPageUrl('Pricing')}
        className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
      >
        View Pro plan
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}