import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Music2, Scissors, Zap, Download, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-violet-300 text-sm mb-8">
          <Zap className="w-3.5 h-3.5" />
          AI-powered stem separation
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
          Split any track into<br />
          <span className="text-violet-400">individual stems</span>
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
          Isolate vocals, drums, bass, and instruments from any audio file in minutes using state-of-the-art AI models.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to={createPageUrl('Dashboard')}>
            <Button className="bg-violet-600 hover:bg-violet-500 text-white border-0 h-11 px-6 text-sm font-medium gap-2">
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to={createPageUrl('Pricing')}>
            <Button variant="ghost" className="text-white/60 hover:text-white h-11 px-6 text-sm">
              View pricing
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { Icon: Scissors, title: '2 & 4 Stem Modes', desc: 'Separate into vocals + band, or get full isolation: vocals, drums, bass, and other instruments.' },
            { Icon: Zap, title: 'Multiple AI Models', desc: 'Choose from Fast, Balanced, High Quality, or Artifact-Free models depending on your needs.' },
            { Icon: Download, title: 'WAV / FLAC / MP3', desc: 'Download your stems in any format. Save directly to Google Drive with one click.' },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
              <div className="w-9 h-9 rounded-lg bg-violet-600/15 flex items-center justify-center mb-4">
                <Icon className="w-4 h-4 text-violet-400" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-2">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}