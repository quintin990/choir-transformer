import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Layers, Activity, GitCompare, ArrowRight, Mic2, Drum, Music2, Waves } from 'lucide-react';

const FEATURES = [
  {
    icon: Layers,
    title: 'Stems',
    color: '#1EA0FF',
    points: ['Vocals', 'Drums', 'Bass', 'Other'],
    desc: 'Split any track into clean individual stems using neural separation.',
  },
  {
    icon: Activity,
    title: 'Reference',
    color: '#19D3A2',
    points: ['Integrated LUFS', 'EQ balance curve', 'Stereo width', 'True peak'],
    desc: 'Measure any reference mix with studio-grade technical accuracy.',
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

export default function Landing() {
  return (
    <div style={{ backgroundColor: '#0B1220', color: '#EAF2FF', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-20 pb-16 text-center">
        {/* Wordmark */}
        <div className="inline-flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1EA0FF' }}>
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="text-3xl font-bold tracking-tight" style={{ color: '#EAF2FF', letterSpacing: '-0.03em' }}>Auralyn</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold mb-4" style={{ letterSpacing: '-0.03em', lineHeight: 1.05, color: '#EAF2FF' }}>
          Hear it.{' '}
          <span style={{ color: '#1EA0FF' }}>Shape it.</span>
        </h1>

        <p className="text-lg max-w-md mx-auto mb-10 leading-relaxed" style={{ color: '#9CB2D6' }}>
          Split tracks into stems and analyze reference mixes with studio-grade clarity.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link to={createPageUrl('StemsNew')}
            className="inline-flex items-center gap-2 px-6 h-11 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: '#1EA0FF', color: '#fff' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor='#3BAEFF'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor='#1EA0FF'}>
            <Layers className="w-4 h-4" />
            Start Stem Separation
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link to={createPageUrl('ReferenceNew')}
            className="inline-flex items-center gap-2 px-6 h-11 rounded-lg text-sm font-semibold transition-all border"
            style={{ backgroundColor: 'transparent', color: '#EAF2FF', borderColor: '#1C2A44' }}
            onMouseEnter={e => e.currentTarget.style.borderColor='#1EA0FF'}
            onMouseLeave={e => e.currentTarget.style.borderColor='#1C2A44'}>
            <Activity className="w-4 h-4" />
            Analyze a Reference
          </Link>
        </div>
      </section>

      {/* Waveform divider */}
      <div className="relative max-w-4xl mx-auto px-5 mb-16">
        <div className="flex items-center gap-1 justify-center opacity-20">
          {Array.from({ length: 64 }, (_, i) => (
            <div key={i} className="rounded-full flex-shrink-0" style={{
              width: 3,
              height: 4 + Math.sin(i * 0.5) * 16 + Math.sin(i * 0.3) * 8,
              backgroundColor: '#1EA0FF',
              opacity: 0.6 + 0.4 * Math.abs(Math.sin(i * 0.4)),
            }} />
          ))}
        </div>
      </div>

      {/* Feature cards */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <div className="grid sm:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, color, points, desc, soon }) => (
            <div key={title} className="rounded-xl border p-5 relative"
              style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
              {soon && (
                <span className="absolute top-4 right-4 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                  style={{ backgroundColor: '#1C2A44', color: '#9CB2D6' }}>
                  Soon
                </span>
              )}
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${color}18` }}>
                <Icon className="w-4.5 h-4.5" style={{ color }} />
              </div>
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#EAF2FF' }}>{title}</h3>
              <p className="text-xs mb-4 leading-relaxed" style={{ color: '#9CB2D6' }}>{desc}</p>
              <div className="space-y-1.5">
                {points.map(p => (
                  <div key={p} className="flex items-center gap-2 text-xs" style={{ color: '#9CB2D6' }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    {p}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}