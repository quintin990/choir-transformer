import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Layers, Activity, GitCompare, ArrowRight, Mic2, Users, Music2, Zap, ChevronRight, Download, Zap as ZapIcon, Share2, Shield } from 'lucide-react';

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
      <section className="max-w-5xl mx-auto px-5 pt-32 pb-24 text-center">

        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 text-xs font-medium"
          style={{ backgroundColor: '#1EA0FF12', border: '1px solid #1EA0FF30', color: '#1EA0FF' }}>
          <ZapIcon className="w-3 h-3" />
          INTRODUCING AURALYN
        </div>

        {/* Headline */}
        <h1 className="text-6xl sm:text-8xl font-bold mb-8 leading-[1.0]"
          style={{ letterSpacing: '-0.04em' }}>
          Stop struggling.{' '}
          <span style={{
            background: 'linear-gradient(135deg, #1EA0FF 0%, #19D3A2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Start transforming.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-4 leading-relaxed" style={{ color: '#9CB2D6' }}>
          Upload your song, separate vocals and instruments, split harmony parts, and level up your practice — whether you're a solo singer or running a full choir.
        </p>
        <p className="text-sm mb-14" style={{ color: '#4A6080' }}>
          Studio-grade audio separation. Smart practice tools. Complete choir management.
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

      {/* ── Problem/Solution ── */}
      <section className="max-w-5xl mx-auto px-5 py-24">
       <div className="text-center mb-16">
         <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ letterSpacing: '-0.03em', color: '#EAF2FF' }}>
           The problem
         </h2>
         <p className="text-lg max-w-2xl mx-auto mb-12" style={{ color: '#9CB2D6' }}>
           Whether you're learning your alto part at midnight or preparing Sunday's set on Thursday morning, hours get lost on tasks that steal time from what matters.
         </p>

         <div className="grid sm:grid-cols-2 gap-6 mb-8">
           <div className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#FF4D6D40' }}>
             <p className="text-sm leading-relaxed" style={{ color: '#9CB2D6' }}>
               <span style={{ color: '#FF4D6D', fontWeight: 'bold' }}>❌ Struggling</span> to isolate your voice part from a full recording
             </p>
           </div>
           <div className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#FF4D6D40' }}>
             <p className="text-sm leading-relaxed" style={{ color: '#9CB2D6' }}>
               <span style={{ color: '#FF4D6D', fontWeight: 'bold' }}>❌ Manually teaching</span> or recording each part one by one
             </p>
           </div>
           <div className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#FF4D6D40' }}>
             <p className="text-sm leading-relaxed" style={{ color: '#9CB2D6' }}>
               <span style={{ color: '#FF4D6D', fontWeight: 'bold' }}>❌ Juggling spreadsheets,</span> emails, and file sharing for choir admin
             </p>
           </div>
           <div className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#FF4D6D40' }}>
             <p className="text-sm leading-relaxed" style={{ color: '#9CB2D6' }}>
               <span style={{ color: '#FF4D6D', fontWeight: 'bold' }}>❌ Hours wasted</span> every week on prep that steals from making music
             </p>
           </div>
         </div>

         <p className="text-sm mb-16" style={{ color: '#4A6080' }}>
           <span style={{ color: '#19D3A2', fontWeight: 'bold' }}>✓ More time making music. Less time managing it.</span>
         </p>
       </div>
      </section>

      {/* ── How it Works ── */}
      <section className="max-w-5xl mx-auto px-5 pb-24">
       <div className="text-center mb-16">
         <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#9B74FF' }}>HOW IT WORKS</p>
         <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ letterSpacing: '-0.03em', color: '#EAF2FF' }}>
           Three steps. That's it.
         </h2>
         <p className="text-sm" style={{ color: '#6A8AAD' }}>From a single song to individual practice parts in minutes — not hours.</p>
       </div>

       <div className="grid sm:grid-cols-3 gap-8">
         {[
           { num: '01', icon: Download, title: 'Upload Your Song', desc: 'Drop in any song or track — MP3, WAV, FLAC. One file is all it takes.' },
           { num: '02', icon: ZapIcon, title: 'Auralyn Separates & Processes', desc: 'Our AI separates vocals from instruments, splits harmony parts (SATB), and even isolates individual band stems — automatically.' },
           { num: '03', icon: Share2, title: 'Practice, Plan & Manage', desc: 'Practice with the Smart Practice Player, track your song progress, build personal practice plans — or share parts with your choir if you\'re a director.' }
         ].map(({ num, icon: Icon, title, desc }) => (
           <div key={num} className="text-left">
             <p className="text-4xl font-bold mb-6 opacity-20" style={{ color: '#1EA0FF' }}>{num}</p>
             <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#1EA0FF15', border: '1px solid #1EA0FF25' }}>
               <Icon className="w-6 h-6" style={{ color: '#1EA0FF' }} />
             </div>
             <h3 className="text-lg font-bold mb-3" style={{ color: '#EAF2FF' }}>{title}</h3>
             <p className="text-sm leading-relaxed" style={{ color: '#6A8AAD' }}>{desc}</p>
           </div>
         ))}
       </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="max-w-5xl mx-auto px-5 pt-24 pb-24">
       <div className="text-center mb-12">
         <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#9B74FF' }}>FEATURES</p>
         <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ letterSpacing: '-0.03em', color: '#EAF2FF' }}>
           Everything you need. Nothing you don't.
         </h2>
         <p className="text-sm" style={{ color: '#6A8AAD' }}>Built for singers, arrangers, and choir directors who want to spend less time on logistics and more time on music.</p>
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
                <Link key={title} to={createPageUrl(href)} className="block hover:no-underline group">
                  <div className="rounded-2xl border p-6 relative flex flex-col h-full transition-all group-hover:border-opacity-100"
                    style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = color + '40'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#1C2A44'; }}>
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

      {/* ── Testimonials ── */}
      <section className="max-w-5xl mx-auto px-5 py-24">
       <div className="text-center mb-16">
         <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#9B74FF' }}>FROM THE CHOIR FAMILY</p>
         <h2 className="text-3xl sm:text-4xl font-bold" style={{ letterSpacing: '-0.03em', color: '#EAF2FF' }}>
           Voices from the ministry.
         </h2>
       </div>

       <div className="grid sm:grid-cols-3 gap-6">
         {[
           { quote: 'I uploaded our new Kirk Franklin song on Tuesday and by Thursday my sopranos were already singing their part. I\'ve never had that kind of turnaround before in 12 years of directing.', role: 'MINISTER OF MUSIC, GRACEFIELDS CHAPEL' },
           { quote: 'As an alto I always struggled to hear my part in recordings. Auralyn gave me my line clearly and I could practice it at home before rehearsal. It changed everything for me.', role: 'ALTO SECTION LEADER, PRAISE TEAM, LONDON' },
           { quote: 'We learn a new complex piece in one week instead of four. The SATB separation is amazing and I could practice on my own. I don\'t know how we managed without this tool.', role: 'CHOIR DIRECTOR, CHARIS FAMILY CHOIR - KNUST, GHANA' }
         ].map(({ quote, role }, idx) => (
           <div key={idx} className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
             <p className="text-sm leading-relaxed mb-4" style={{ color: '#9CB2D6', fontStyle: 'italic' }}>
               "{quote}"
             </p>
             <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9B74FF' }}>
               {role}
             </p>
           </div>
         ))}
       </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-3xl mx-auto px-5 pb-24 text-center">
       <div className="rounded-2xl border p-12 sm:p-16" style={{ backgroundColor: '#0F1A2E', borderColor: '#19D3A240', background: 'linear-gradient(135deg, rgba(15,26,46,0.8) 0%, rgba(28,16,48,0.6) 100%)' }}>
         <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ letterSpacing: '-0.03em', color: '#EAF2FF' }}>
           You deserve better music prep.
         </h2>
         <p className="text-base leading-relaxed mb-8 max-w-lg mx-auto" style={{ color: '#9CB2D6' }}>
           Join singers and directors who've stopped wasting hours on prep and started focusing on what they do best — making music.
         </p>
         <div className="flex flex-col sm:flex-row gap-4 justify-center">
           <Link to={createPageUrl('StemsNew')}
             className="inline-flex items-center justify-center gap-2 px-7 h-12 rounded-xl text-sm font-semibold transition-all"
             style={{ backgroundColor: '#1EA0FF', color: '#fff' }}
             onMouseEnter={e => e.currentTarget.style.backgroundColor = '#3BAEFF'}
             onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1EA0FF'}>
             Get Started — It's Free
             <ArrowRight className="w-4 h-4" />
           </Link>
           <Link to={createPageUrl('Pricing')}
             className="inline-flex items-center justify-center gap-2 px-7 h-12 rounded-xl text-sm font-semibold border transition-all"
             style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}
             onMouseEnter={e => { e.currentTarget.style.borderColor = '#1EA0FF60'; e.currentTarget.style.backgroundColor = '#1EA0FF08'; }}
             onMouseLeave={e => { e.currentTarget.style.borderColor = '#1C2A44'; e.currentTarget.style.backgroundColor = 'transparent'; }}>
             View Pricing
           </Link>
         </div>
         <p className="text-xs mt-8" style={{ color: '#4A6080' }}>
           Free tier includes audio processing for everyone. Upgrade anytime for SATB parts, premium processing, and choir management tools.
         </p>
       </div>
      </section>
      </div>
      );
      }