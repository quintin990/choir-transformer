import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Layers, Activity, GitCompare, ArrowRight, Mic2, Users, Music2, Zap, ChevronRight } from 'lucide-react';

const FEATURES = [
  {
    icon: Layers,
    title: 'Stems',
    color: '#1EA0FF',
    points: ['Vocals', 'Drums', 'Bass', 'Other'],
    desc: 'Split any track into clean individual stems using neural separation.',
    href: 'StemsNew',
  },
  {
    icon: Activity,
    title: 'Reference',
    color: '#19D3A2',
    points: ['Integrated LUFS', 'EQ balance curve', 'Stereo width', 'True peak'],
    desc: 'Measure any reference mix with studio-grade technical accuracy.',
    href: 'ReferenceNew',
  },
  {
    icon: GitCompare,
    title: 'Match',
    color: '#9B74FF',
    points: ['Tonal difference', 'Loudness targets', 'Stereo guidance', 'Bus chain export'],
    desc: 'Compare your mix to a reference. Get a clear action plan.',
    soon: true,
  },
];

const STATS = [
  { value: '4-stem', label: 'Neural separation' },
  { value: 'WAV / FLAC', label: 'Lossless output' },
  { value: 'LUFS+', label: 'Reference metrics' },
  { value: 'SATB', label: 'Choir AI splits' },
];

function WaveformViz() {
  const bars = Array.from({ length: 80 }, (_, i) => ({
    h: 6 + Math.abs(Math.sin(i * 0.45) * 28 + Math.sin(i * 0.2) * 14 + Math.sin(i * 0.9) * 8),
    o: 0.25 + 0.55 * Math.abs(Math.sin(i * 0.38)),
  }));
  return (
    <div className="flex items-center gap-[2.5px] justify-center">
      {bars.map((b, i) => (
        <div key={i} className="rounded-full flex-shrink-0"
          style={{ width: 2.5, height: b.h, backgroundColor: '#1EA0FF', opacity: b.o }} />
      ))}
    </div>
  );
}

export default function Landing() {
  return (
    <div style={{ backgroundColor: '#0B1220', color: '#EAF2FF', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-5 pt-24 pb-20 text-center">

        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs font-medium"
          style={{ backgroundColor: '#1EA0FF12', border: '1px solid #1EA0FF30', color: '#1EA0FF' }}>
          <Zap className="w-3 h-3" />
          AI-powered audio tools for musicians &amp; producers
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl font-bold mb-6 leading-[1.02]"
          style={{ letterSpacing: '-0.04em' }}>
          Hear it.{' '}
          <span style={{
            color: '#1EA0FF',
            background: 'linear-gradient(135deg, #1EA0FF 0%, #19D3A2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Shape it.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl max-w-xl mx-auto mb-3 leading-relaxed" style={{ color: '#9CB2D6' }}>
          Split tracks into stems, analyze reference mixes, and share parts with your choir — all in one place.
        </p>
        <p className="text-sm mb-12" style={{ color: '#4A6080' }}>
          Studio-grade audio intelligence. No installation required.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16">
          <Link to={createPageUrl('StemsNew')}
            className="inline-flex items-center gap-2 px-7 h-12 rounded-xl text-sm font-semibold transition-all shadow-lg"
            style={{ backgroundColor: '#1EA0FF', color: '#fff', boxShadow: '0 0 30px #1EA0FF30' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#3BAEFF'; e.currentTarget.style.boxShadow = '0 0 40px #1EA0FF50'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1EA0FF'; e.currentTarget.style.boxShadow = '0 0 30px #1EA0FF30'; }}>
            <Layers className="w-4 h-4" />
            Start Stem Separation
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link to={createPageUrl('ReferenceNew')}
            className="inline-flex items-center gap-2 px-7 h-12 rounded-xl text-sm font-semibold transition-all border"
            style={{ backgroundColor: 'transparent', color: '#EAF2FF', borderColor: '#1C2A44' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1EA0FF60'; e.currentTarget.style.backgroundColor = '#1EA0FF08'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1C2A44'; e.currentTarget.style.backgroundColor = 'transparent'; }}>
            <Activity className="w-4 h-4" />
            Analyze a Reference
          </Link>
          <Link to={createPageUrl('Pricing')}
            className="inline-flex items-center gap-2 px-5 h-12 rounded-xl text-sm font-medium transition-all"
            style={{ color: '#6A8AAD' }}
            onMouseEnter={e => e.currentTarget.style.color = '#9CB2D6'}
            onMouseLeave={e => e.currentTarget.style.color = '#6A8AAD'}>
            View Pricing
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Waveform visual */}
        <div className="relative">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px" style={{ background: 'linear-gradient(90deg, transparent, #1EA0FF15, transparent)' }} />
          <WaveformViz />
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y" style={{ borderColor: '#1C2A44', backgroundColor: '#0C1525' }}>
        <div className="max-w-5xl mx-auto px-5 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-lg font-bold mb-0.5" style={{ color: '#EAF2FF', fontFamily: "'DM Mono', monospace", letterSpacing: '-0.02em' }}>{value}</p>
              <p className="text-xs" style={{ color: '#4A6080' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="max-w-5xl mx-auto px-5 pt-20 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ letterSpacing: '-0.03em', color: '#EAF2FF' }}>
            Everything your ears need
          </h2>
          <p className="text-sm" style={{ color: '#6A8AAD' }}>Three tools. One workflow.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, color, points, desc, soon, href }) => {
            const card = (
              <div className="rounded-2xl border p-6 relative flex flex-col h-full transition-all"
                style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
                {soon && (
                  <span className="absolute top-5 right-5 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                    style={{ backgroundColor: '#1C2A44', color: '#9CB2D6', border: '1px solid #243550' }}>
                    Soon
                  </span>
                )}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${color}15`, border: `1px solid ${color}25` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: '#EAF2FF' }}>{title}</h3>
                <p className="text-sm mb-5 leading-relaxed flex-1" style={{ color: '#6A8AAD' }}>{desc}</p>
                <div className="space-y-2 mb-5">
                  {points.map(p => (
                    <div key={p} className="flex items-center gap-2.5 text-xs" style={{ color: '#9CB2D6' }}>
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color, opacity: 0.7 }} />
                      {p}
                    </div>
                  ))}
                </div>
                {href && (
                  <div className="flex items-center gap-1 text-xs font-medium" style={{ color: color + 'aa' }}>
                    Get started <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            );

            return href
              ? (
                <Link key={title} to={createPageUrl(href)} className="block hover:no-underline group"
                  style={{ '--card-border': '#1C2A44', '--card-border-hover': color + '40' } as React.CSSProperties}>
                  <div className="rounded-2xl border p-6 relative flex flex-col h-full transition-all group-hover:border-opacity-100"
                    style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = color + '40'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#1C2A44'}>
                    {soon && (
                      <span className="absolute top-5 right-5 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                        style={{ backgroundColor: '#1C2A44', color: '#9CB2D6', border: '1px solid #243550' }}>
                        Soon
                      </span>
                    )}
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                      style={{ backgroundColor: `${color}15`, border: `1px solid ${color}25` }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <h3 className="text-base font-bold mb-2" style={{ color: '#EAF2FF' }}>{title}</h3>
                    <p className="text-sm mb-5 leading-relaxed flex-1" style={{ color: '#6A8AAD' }}>{desc}</p>
                    <div className="space-y-2 mb-5">
                      {points.map(p => (
                        <div key={p} className="flex items-center gap-2.5 text-xs" style={{ color: '#9CB2D6' }}>
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color, opacity: 0.7 }} />
                          {p}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium" style={{ color: color + 'aa' }}>
                      Get started <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              )
              : <div key={title}>{card}</div>;
          })}
        </div>
      </section>

      {/* ── Choir CTA strip ── */}
      <section className="max-w-5xl mx-auto px-5 pb-24">
        <div className="rounded-2xl border p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44', background: 'linear-gradient(135deg, #0F1A2E 60%, #1C1030 100%)' }}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" style={{ color: '#9B74FF' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9B74FF' }}>For Choirs</span>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#EAF2FF', letterSpacing: '-0.02em' }}>
              Share parts with your choir
            </h3>
            <p className="text-sm leading-relaxed max-w-md" style={{ color: '#6A8AAD' }}>
              Split recordings into SATB parts, share with members by voice, and track rehearsal readiness — all in one place.
            </p>
          </div>
          <Link to={createPageUrl('Choir')}
            className="shrink-0 inline-flex items-center gap-2 px-6 h-11 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
            style={{ backgroundColor: '#9B74FF', color: '#fff', boxShadow: '0 0 24px #9B74FF25' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#AB84FF'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#9B74FF'; }}>
            <Users className="w-4 h-4" />
            Open Choir Hub
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}