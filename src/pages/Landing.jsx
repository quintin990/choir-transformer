import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Scissors, BarChart2, Download, Clock, Shield, Music2 } from 'lucide-react';
import WaveformHero from '../components/ui/WaveformHero';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#070d14] text-white">

      {/* ── Hero ── */}
      <section className="max-w-2xl mx-auto px-6 pt-24 pb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400/70 mb-6">
          AI stem separation · powered by Demucs
        </p>
        <h1 className="text-5xl sm:text-6xl font-bold leading-[1.08] tracking-tight mb-5">
          Split any song<br />
          <span className="text-sky-400">into stems</span>
        </h1>
        <p className="text-white/40 text-lg max-w-md mx-auto mb-10 leading-relaxed">
          Drag in your track. Get vocals, drums, bass, and more — separated cleanly by AI.
        </p>

        {/* Waveform visual */}
        <div className="mb-10">
          <WaveformHero />
        </div>

        {/* CTA */}
        <Link
          to={createPageUrl('NewJob')}
          className="inline-flex items-center gap-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-full h-13 px-8 text-sm font-semibold transition-all shadow-lg shadow-sky-500/20 hover:shadow-sky-400/30"
        >
          Browse my files
          <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-white/20 text-xs mt-4">Free · No account required to try</p>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-white/25 text-xs font-semibold uppercase tracking-[0.18em] text-center mb-10">How it works</p>
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { n: '01', title: 'Upload your track', desc: 'Drop in an MP3, WAV, FLAC, or AIFF — up to 200 MB.' },
            { n: '02', title: 'Choose your stems', desc: '2-stem (Vocals + Band) or 4-stem full split. Pick your quality.' },
            { n: '03', title: 'Download & mix', desc: 'Preview in-browser, download individual stems or a full ZIP.' },
          ].map(({ n, title, desc }) => (
            <div key={n} className="relative pl-1">
              <span className="text-[10px] font-bold text-sky-400/50 tracking-widest">{n}</span>
              <h3 className="text-white font-semibold text-sm mt-2 mb-1.5">{title}</h3>
              <p className="text-white/35 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { Icon: Scissors,   title: '2 & 4 stem modes',    desc: 'Vocals + Band or full four-way split into vocals, drums, bass, other.' },
            { Icon: BarChart2,  title: 'Detailed analysis',   desc: 'LUFS, crest factor, stereo width, and EQ analysis on every job.' },
            { Icon: Clock,      title: '7-day storage',       desc: 'Files are retained for 7 days then automatically deleted.' },
            { Icon: Shield,     title: 'Rights-first design', desc: 'You confirm ownership before every job. Your music, your control.' },
            { Icon: Download,   title: 'Multiple formats',    desc: 'Download as WAV, FLAC, or MP3 — plus a full ZIP archive.' },
            { Icon: Music2,     title: 'In-browser preview',  desc: 'Listen to every stem directly in the app before downloading.' },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="bg-white/[0.025] border border-white/[0.04] rounded-2xl p-5 hover:bg-white/[0.04] transition-colors">
              <Icon className="w-4 h-4 text-sky-400 mb-3" />
              <h3 className="text-white text-sm font-semibold mb-1.5">{title}</h3>
              <p className="text-white/30 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-lg mx-auto px-6 pb-28 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Ready to separate?</h2>
        <p className="text-white/30 text-sm mb-7">Processing usually takes under 2 minutes.</p>
        <Link
          to={createPageUrl('NewJob')}
          className="inline-flex items-center gap-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-full h-12 px-8 text-sm font-semibold transition-all shadow-lg shadow-sky-500/20"
        >
          Start for free
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}