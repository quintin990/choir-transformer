import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Music2, Scissors, BarChart2, Download, ArrowRight, Clock, Shield } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#070d14] text-white">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-28 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-sky-400/10 border border-sky-400/20 rounded-full px-4 py-1.5 text-violet-300 text-xs font-medium mb-8">
          <Music2 className="w-3.5 h-3.5" />
          AI stem separation powered by Demucs
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold leading-[1.1] tracking-tight mb-5">
          Isolate any track<br />
          <span className="text-sky-400">in minutes</span>
        </h1>
        <p className="text-white/50 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
          Upload your song, split it into stems — vocals, drums, bass, and more — and get detailed audio analysis.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to={createPageUrl('NewJob')}
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl h-11 px-6 text-sm font-semibold transition-colors"
          >
            Start new job
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to={createPageUrl('Pricing')}
            className="inline-flex items-center h-11 px-6 text-sm text-white/50 hover:text-white transition-colors"
          >
            See pricing
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <p className="text-white/30 text-xs font-semibold uppercase tracking-widest text-center mb-8">How it works</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { n: '1', title: 'Upload your track', desc: 'MP3, WAV, FLAC, AIFF, or M4A up to 200 MB.' },
            { n: '2', title: 'Choose settings', desc: 'Pick 2 or 4 stems and select quality: Fast, Balanced, or High Quality.' },
            { n: '3', title: 'Download & mix', desc: 'Get individual stems and a full ZIP. Preview in the browser.' },
          ].map(({ n, title, desc }) => (
            <div key={n} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
              <span className="text-xs font-bold text-sky-400 mb-3 block">{n}</span>
              <h3 className="text-white font-semibold text-sm mb-2">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-3 gap-4">
          {([
            { Icon: Scissors, title: '2 & 4 Stem Modes', desc: 'Vocals + Band, or full four-way separation: vocals, drums, bass, other.' },
            { Icon: BarChart2, title: 'Detailed Analysis', desc: 'Duration, sample rate, LUFS, crest factor, and stereo width after separation.' },
            { Icon: Clock, title: '7-Day Storage', desc: 'Files are retained for 7 days then automatically deleted for your privacy.' },
            { Icon: Shield, title: 'Rights-First Design', desc: 'You confirm ownership before every job. Your music, your control.' },
            { Icon: Download, title: 'Multiple Formats', desc: 'Download stems as WAV, FLAC, or MP3 and grab a full ZIP archive.' },
            { Icon: Music2, title: 'In-Browser Preview', desc: 'Listen to every stem directly in the app before downloading.' },
          ]).map(({ Icon, title, desc }) => (
            <div key={title} className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-sky-400" />
              </div>
              <h3 className="text-white text-sm font-semibold mb-1">{title}</h3>
              <p className="text-white/35 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-xl mx-auto px-6 pb-28 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to separate?</h2>
        <Link
          to={createPageUrl('NewJob')}
          className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl h-11 px-8 text-sm font-semibold transition-colors"
        >
          Start for free
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}