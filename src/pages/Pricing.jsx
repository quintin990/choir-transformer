import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Check, ArrowRight, Loader2 } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    desc: 'Perfect for trying out stem separation.',
    features: [
      '2 jobs per day',
      '2-stem separation (Vocals & Band)',
      'WAV and MP3 output',
      'Balanced quality model',
      '7-day file retention',
      'In-browser preview',
    ],
    cta: 'Get started free',
    ctaUrl: 'StemsNew',
    highlight: false,
  },
  {
    name: 'Pro',
...
    ctaUrl: 'StemsNew',
    highlight: true,
  },
];

export default function Pricing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleProClick = async () => {
    if (window.self !== window.top) {
      alert('Checkout is only available from the published app, not inside the editor preview.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('createCheckoutSession', {
        priceId: 'price_1T8t6qDPbH08DQTSwIFtMT7c',
      });
      if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        setError(res.data?.error || 'Failed to start checkout.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-white mb-3">Simple, transparent pricing</h1>
        <p className="text-white/40 text-base">Start free. Upgrade when you need more power.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className={`rounded-2xl p-7 flex flex-col ${
              plan.highlight
                ? 'bg-sky-500/20 border-2 border-sky-400/40 relative'
                : 'bg-white/[0.03] border border-white/5'
            }`}
          >
            {plan.highlight && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-sky-400 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                Most popular
              </span>
            )}
            <div className="mb-5">
              <h2 className="text-lg font-bold text-white mb-1">{plan.name}</h2>
              <p className="text-white/40 text-sm">{plan.desc}</p>
            </div>
            <div className="mb-6 flex items-end gap-1">
              <span className="text-4xl font-bold text-white">{plan.price}</span>
              {plan.period && <span className="text-white/40 pb-1">{plan.period}</span>}
            </div>
            <ul className="space-y-2.5 flex-1 mb-7">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                  <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            {plan.highlight ? (
              <button
                onClick={handleProClick}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 bg-sky-500 hover:bg-sky-400 text-white w-full"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Redirecting…' : plan.cta}
                {!loading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <Link
                to={createPageUrl('StemsNew')}
                className="inline-flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold transition-colors bg-white/5 hover:bg-white/10 text-white"
              >
                {plan.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-6 text-center text-sm" style={{ color: '#FF4D6D' }}>{error}</div>
      )}
      {/* FAQ-style note */}
      <div className="mt-14 text-center">
        <p className="text-white/30 text-sm">
          Have questions? <a href="mailto:support@auralyn.app" className="text-sky-400 hover:text-violet-300 transition-colors">Contact us</a>
        </p>
      </div>
    </div>
  );
}