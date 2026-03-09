import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Scissors, BarChart2, Download, Music2, Shield, Zap } from 'lucide-react';
import WaveformHero from '../components/ui/WaveformHero';

const FEATURES = [
  { Icon: Scissors,  title: '2 & 4 Stem Modes',   desc: 'Vocals + Band or full split into vocals, drums, bass & other.' },
  { Icon: BarChart2, title: 'Audio Analysis',      desc: 'LUFS, crest factor, stereo width and EQ on every job.' },
  { Icon: Zap,       title: 'Fast Processing',     desc: 'Results in under 2 minutes. Powered by Demucs AI models.' },
  { Icon: Download,  title: 'WAV · FLAC · MP3',    desc: 'Pick your format. Download individual stems or a ZIP.' },
  { Icon: Music2,    title: 'In-browser preview',  desc: 'Listen to every stem right in the app before downloading.' },
  { Icon: Shield,    title: '7-day retention',     desc: 'Files auto-delete after 7 days. Your data, your control.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#070d14] text-white overflow-x-hidden">

      {/* ── HERO — full viewport ── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-5 py-12 text-center relative">
        {/* Background glow blobs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-sky-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-indigo-500/6 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative w-full max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-xs text-sky-300/80 font-medium">AI-powered · Demucs v4</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-5">
            Split any song<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
              into stems
            </span>
          </h1>

          <p className="text-white/40 text-base sm:text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Upload a track. Get vocals, drums, bass, and more — separated cleanly by AI in under 2 minutes.
          </p>

          {/* Waveform DAW panel */}
          <div className="mb-10">
            <WaveformHero />
          </div>

          {/* CTA */}
          <Link
            to={createPageUrl('NewJob')}
            className="inline-flex items-center gap-2.5 bg-sky-500 hover:bg-sky-400 active:scale-95 text-white rounded-full h-12 px-8 text-sm font-semibold transition-all shadow-xl shadow-sky-500/25"
          >
            Browse my files
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-white/20 text-xs mt-3">Free · MP3, WAV, FLAC, AIFF supported</p>
        </div>
      </section>

      {/* ── HOW IT WORKS — tight strip ── */}
      <section className="border-t border-white/[0.05] py-16 px-5">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] text-center mb-10">How it works</p>
          <div className="grid sm:grid-cols-3 gap-6 text-center sm:text-left">
            {[
              { n: '01', title: 'Upload', desc: 'Drop in any audio file up to 200 MB.' },
              { n: '02', title: 'Separate', desc: 'AI splits the track into clean individual stems.' },
              { n: '03', title: 'Download', desc: 'Preview in-browser, then grab WAV, FLAC, or MP3.' },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex sm:block gap-4 items-start">
                <span className="text-xs font-bold text-sky-400/40 shrink-0">{n}</span>
                <div>
                  <h3 className="text-white text-sm font-semibold mt-1 mb-1">{title}</h3>
                  <p className="text-white/30 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="border-t border-white/[0.05] py-16 px-5 pb-24">
        <div className="max-w-2xl mx-auto">
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] text-center mb-10">Features</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 hover:bg-white/[0.04] hover:border-white/10 transition-all">
                <Icon className="w-3.5 h-3.5 text-sky-400 mb-3" />
                <h3 className="text-white text-xs font-semibold mb-1">{title}</h3>
                <p className="text-white/30 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}