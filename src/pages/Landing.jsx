import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Music, Heart, Microscope, ArrowRight, Check } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function Landing() {
  return (
    <div style={{ backgroundColor: '#0B1220', color: '#EAF2FF' }}>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-5 pt-32 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs font-medium"
          style={{ backgroundColor: '#1EA0FF12', border: '1px solid #1EA0FF30', color: '#1EA0FF' }}>
          <Zap className="w-3 h-3" /> AI-powered audio tools
        </div>
        <h1 className="text-6xl sm:text-8xl font-bold mb-8 leading-[1.0]" style={{ letterSpacing: '-0.04em' }}>
          Hear it.{' '}
          <span style={{
            background: 'linear-gradient(135deg, #1EA0FF 0%, #19D3A2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Separate it. Master it.
          </span>
        </h1>
        <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-4 leading-relaxed" style={{ color: '#9CB2D6' }}>
          Split tracks into stems, extract SATB harmony parts, plan your songs and manage your choir — all in one place.
        </p>
        <p className="text-sm mb-12" style={{ color: '#4A6080' }}>
          Studio-grade audio separation. Smart practice tools. Complete choir management.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl('StemsNew')} className="inline-flex items-center justify-center gap-2 px-8 h-12 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: '#1EA0FF', color: '#fff' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor='#3BAEFF'} onMouseLeave={e => e.currentTarget.style.backgroundColor='#1EA0FF'}>
            Start Separation <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to={createPageUrl('ReferenceNew')} className="inline-flex items-center justify-center gap-2 px-8 h-12 rounded-xl text-sm font-semibold border transition-all"
            style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#1EA0FF60'; e.currentTarget.style.backgroundColor='#1EA0FF08'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#1C2A44'; e.currentTarget.style.backgroundColor='transparent'; }}>
            Analyze Reference
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-5 py-20">
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { icon: Music, title: 'Studio‑Quality Separation', desc: 'Isolate vocals, drums, bass and more. Get SATB parts automatically.' },
            { icon: Zap, title: 'Smart Practice', desc: 'Solo and mute parts, adjust tempo, loop sections and practise with context mixes.' },
            { icon: Heart, title: 'Song Planner & Choir Management', desc: 'Track song progress, performance dates, lyrics, sheet music and readiness. Assign parts and manage members.' },
            { icon: Microscope, title: 'Reference Mix & Match', desc: 'Analyze any song for LUFS, EQ curves and stereo width. Compare your mix to your favourite reference.' },
          ].map(({ icon: Icon, title, desc }, idx) => (
            <div key={idx} className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
              <Icon className="w-8 h-8 mb-4" style={{ color: '#1EA0FF' }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: '#EAF2FF' }}>{title}</h3>
              <p className="text-sm" style={{ color: '#6A8AAD' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-5xl mx-auto px-5 py-20">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ letterSpacing: '-0.03em' }}>How it Works</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { num: '1', title: 'Upload your song', desc: 'Drag and drop any audio file — MP3, WAV, FLAC, M4A.' },
            { num: '2', title: 'Auralyn separates', desc: 'AI extracts vocals, instruments, SATB parts and analyzes metadata.' },
            { num: '3', title: 'Practice & manage', desc: 'Use smart tools to learn your part, or share with your choir.' },
          ].map(({ num, title, desc }) => (
            <div key={num} className="text-center">
              <p className="text-5xl font-bold mb-4 opacity-20" style={{ color: '#1EA0FF' }}>{num}</p>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#EAF2FF' }}>{title}</h3>
              <p className="text-sm" style={{ color: '#6A8AAD' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-5 py-20">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ letterSpacing: '-0.03em' }}>Loved by singers and directors</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { quote: 'I uploaded our new song on Tuesday and by Thursday my sopranos were already singing their part.', role: 'Minister of Music' },
            { quote: 'As an alto I always struggled to hear my part. Auralyn gave me my line clearly. Game changer.', role: 'Alto Section Leader' },
            { quote: 'We learn a new complex piece in one week instead of four. Amazing tool.', role: 'Choir Director' },
          ].map(({ quote, role }, idx) => (
            <div key={idx} className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
              <p className="text-sm italic mb-4" style={{ color: '#9CB2D6' }}>"{quote}"</p>
              <p className="text-xs font-semibold" style={{ color: '#1EA0FF' }}>{role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="max-w-3xl mx-auto px-5 pb-24">
        <div className="rounded-2xl border p-12 text-center" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
          <h2 className="text-3xl font-bold mb-4" style={{ letterSpacing: '-0.03em' }}>Start Free. Upgrade When You're Ready.</h2>
          <p className="text-base mb-8" style={{ color: '#9CB2D6' }}>
            Free: 2 jobs/day, 2-stem separation. Pro: unlimited jobs, SATB, harmony guide, choir management.
          </p>
          <Link to={createPageUrl('Pricing')} className="inline-flex items-center justify-center gap-2 px-8 h-12 rounded-xl text-sm font-semibold transition-all"
            style={{ backgroundColor: '#19D3A2', color: '#fff' }}
            onMouseEnter={e => e.currentTarget.style.opacity='0.9'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
            View Pricing <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}