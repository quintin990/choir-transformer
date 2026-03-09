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
    if (window.self !== window.top) {
      alert('Checkout is only available from the published app. Visit auralyn.io to upgrade.');
      return;
    }
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
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'hsl(var(--color-text))', letterSpacing: '-0.03em' }}>Simple, Transparent Pricing</h1>
        <p className="text-lg" style={{ color: 'hsl(var(--color-muted))' }}>Pay for what you use. No hidden fees. Cancel anytime.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        {PLANS.map(plan => {
          const isFree = plan.name === 'Free';
          return (
            <div
              key={plan.name}
              className="rounded-2xl border p-8 relative"
              style={{
                backgroundColor: 'hsl(var(--color-card))',
                borderColor: plan.featured ? 'hsl(var(--color-primary))' : 'hsl(var(--color-border))',
                borderWidth: plan.featured ? '2px' : '1px',
              }}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}>
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--color-text))' }}>{plan.name}</h2>
                <p style={{ color: 'hsl(var(--color-muted))' }}>{plan.description}</p>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold" style={{ color: 'hsl(var(--color-text))' }}>{plan.price}</span>
                  <span style={{ color: 'hsl(var(--color-muted))' }}>{plan.period}</span>
                </div>
              </div>

              {isFree ? (
                <Link
                  to={createPageUrl(plan.ctaUrl)}
                  className="w-full h-11 rounded-lg text-sm font-semibold transition-all mb-6 flex items-center justify-center"
                  style={{
                    backgroundColor: 'hsl(var(--color-input))',
                    color: 'hsl(var(--color-text))',
                    border: `1px solid hsl(var(--color-border))`,
                  }}
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  onClick={handleProCheckout}
                  className="w-full h-11 rounded-lg text-sm font-semibold transition-all mb-6"
                  style={{
                    backgroundColor: 'hsl(var(--color-primary))',
                    color: 'hsl(var(--color-primary-foreground))',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {plan.cta}
                </button>
              )}

              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'hsl(var(--color-accent))' }} />
                    ) : (
                      <div className="w-5 h-5 rounded border shrink-0 mt-0.5" style={{ borderColor: 'hsl(var(--color-border))' }} />
                    )}
                    <span className="text-sm" style={{ color: feature.included ? 'hsl(var(--color-text))' : 'hsl(var(--color-muted))' }}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border p-6 text-center" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))' }}>
        <p style={{ color: 'hsl(var(--color-muted))' }}>
          Need a custom plan or team license?{' '}
          <a href="mailto:hello@auralyn.io" style={{ color: 'hsl(var(--color-primary))', fontWeight: 'bold' }}>Contact us</a>
        </p>
      </div>
    </div>
  );
}