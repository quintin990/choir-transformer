import React from 'react';
import { Link } from 'react-router-dom';
import { Music2, Mic, Layers, Zap, ArrowRight, Check } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Music2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white">StemForge</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link to={createPageUrl('Pricing')} className="text-white/50 hover:text-white transition-colors px-3 py-1.5">Pricing</Link>
          <Link to={createPageUrl('Dashboard')} className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition-colors font-medium">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-600/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-8 text-sm text-violet-300">
          <Zap className="w-3.5 h-3.5" />
          AI-powered stem separation
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
          Split any track into<br />
          <span className="text-violet-400">clean stems</span>
        </h1>
        <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Separate vocals, drums, bass, and more from any audio file using state-of-the-art AI models. Professional quality in minutes.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to={createPageUrl('NewJob')}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Separate a track
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to={createPageUrl('Pricing')}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white px-4 py-3 transition-colors text-sm"
          >
            View pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Mic,
              title: 'Vocal isolation',
              desc: 'Crystal-clear vocal tracks with minimal bleed from instruments.',
            },
            {
              icon: Layers,
              title: '4-stem separation',
              desc: 'Vocals, drums, bass, and other — all isolated independently.',
            },
            {
              icon: Zap,
              title: 'Fast processing',
              desc: 'Powered by RunPod GPU infrastructure. Most tracks in under 5 min.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-violet-600/20 flex items-center justify-center mb-4">
                <Icon className="w-4.5 h-4.5 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Simple CTA */}
      <section className="max-w-2xl mx-auto px-6 pb-24 text-center">
        <div className="bg-gradient-to-b from-violet-600/20 to-violet-600/5 border border-violet-500/20 rounded-2xl p-10">
          <h2 className="text-2xl font-bold mb-3">Start for free</h2>
          <p className="text-white/50 mb-6 text-sm">10 free credits every month. No credit card required.</p>
          <div className="flex justify-center gap-6 text-sm text-white/40 mb-8">
            {['10 credits/month', 'All stem modes', 'WAV & MP3 output'].map(f => (
              <span key={f} className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-violet-400" />{f}</span>
            ))}
          </div>
          <Link
            to={createPageUrl('Dashboard')}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Open the app
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}