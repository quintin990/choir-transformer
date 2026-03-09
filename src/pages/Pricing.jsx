import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'Forever',
    description: 'Perfect to get started',
    cta: 'Start Free',
    ctaUrl: 'StemsNew',
    features: [
      { text: '2 jobs per day', included: true },
      { text: '2-stem separation (vocals & band)', included: true },
      { text: 'MP3 output', included: true },
      { text: 'Balanced quality', included: true },
      { text: '7-day retention', included: true },
      { text: '4-stem & SATB modes', included: false },
      { text: 'Clean audio & harmony', included: false },
      { text: 'Projects & choir management', included: false },
      { text: 'Reference & match features', included: false },
      { text: 'Priority GPU', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'For serious musicians',
    cta: 'Start Pro',
    ctaUrl: 'Pricing',
    featured: true,
    features: [
      { text: 'Unlimited jobs', included: true },
      { text: '2-4 stem modes + SATB', included: true },
      { text: 'WAV, FLAC, MP3 output', included: true },
      { text: 'High quality + artifact-free', included: true },
      { text: '30-day retention', included: true },
      { text: 'Clean audio & harmony guide', included: true },
      { text: 'SATB split (experimental)', included: true },
      { text: 'Projects & choir management', included: true },
      { text: 'Reference analysis & match', included: true },
      { text: 'Priority GPU processing', included: true },
    ],
  },
];

export default function Pricing() {
  const handleProCheckout = async () => {
    try {
      const response = await base44.functions.invoke('createCheckoutSession', { plan: 'pro' });
      window.location.href = response.data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Unable to proceed with checkout. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4" style={{ color: '#EAF2FF', letterSpacing: '-0.03em' }}>Simple, Transparent Pricing</h1>
        <p className="text-lg" style={{ color: '#6A8AAD' }}>Pay for what you use. No hidden fees. Cancel anytime.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className="rounded-2xl border p-8 relative"
            style={{
              backgroundColor: '#0F1A2E',
              borderColor: plan.featured ? '#1EA0FF' : '#1C2A44',
              borderWidth: plan.featured ? '2px' : '1px',
            }}
          >
            {plan.featured && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
                MOST POPULAR
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#EAF2FF' }}>{plan.name}</h2>
              <p style={{ color: '#6A8AAD' }}>{plan.description}</p>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold" style={{ color: '#EAF2FF' }}>{plan.price}</span>
                <span style={{ color: '#6A8AAD' }}>{plan.period}</span>
              </div>
            </div>

            <button
              onClick={plan.name === 'Pro' ? handleProCheckout : null}
              as={plan.name === 'Free' ? Link : undefined}
              to={plan.name === 'Free' ? createPageUrl(plan.ctaUrl) : undefined}
              className="w-full h-11 rounded-lg text-sm font-semibold transition-all mb-6"
              style={{
                backgroundColor: plan.featured ? '#1EA0FF' : '#1C2A44',
                color: plan.featured ? '#fff' : '#9CB2D6',
              }}
              onMouseEnter={e => {
                if (plan.featured) e.currentTarget.style.backgroundColor = '#3BAEFF';
              }}
              onMouseLeave={e => {
                if (plan.featured) e.currentTarget.style.backgroundColor = '#1EA0FF';
              }}
            >
              {plan.cta}
            </button>

            <div className="space-y-3">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {feature.included ? (
                    <Check className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#19D3A2' }} />
                  ) : (
                    <div className="w-5 h-5 rounded border shrink-0 mt-0.5" style={{ borderColor: '#1C2A44' }} />
                  )}
                  <span className="text-sm" style={{ color: feature.included ? '#9CB2D6' : '#4A6080' }}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border p-6 text-center" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
        <p style={{ color: '#9CB2D6' }}>
          Need a custom plan or team license?{' '}
          <a href="mailto:hello@auralyn.io" style={{ color: '#1EA0FF', fontWeight: 'bold' }}>Contact us</a>
        </p>
      </div>
    </div>
  );
}