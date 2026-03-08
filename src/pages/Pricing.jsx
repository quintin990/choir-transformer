import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['5 jobs per month', '2-stem separation', 'WAV / MP3 output', 'Standard model only'],
    cta: 'Get started',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per month',
    features: ['Unlimited jobs', '2 & 4-stem separation', 'All output formats', 'All AI models', 'Google Drive export', 'Batch processing'],
    cta: 'Start Pro',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['Everything in Pro', 'API access', 'Priority processing', 'Custom retention', 'Dedicated support'],
    cta: 'Contact us',
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-white mb-3">Simple pricing</h1>
        <p className="text-white/40">Start free, upgrade when you need more.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className={`rounded-2xl p-6 flex flex-col ${
              plan.highlight
                ? 'bg-violet-600/20 border-2 border-violet-500/40'
                : 'bg-white/[0.03] border border-white/5'
            }`}
          >
            {plan.highlight && (
              <span className="text-xs font-semibold text-violet-300 bg-violet-500/20 rounded-full px-3 py-1 self-start mb-4">Most popular</span>
            )}
            <h2 className="text-lg font-bold text-white">{plan.name}</h2>
            <div className="mt-2 mb-6">
              <span className="text-3xl font-bold text-white">{plan.price}</span>
              {plan.period && <span className="text-white/40 text-sm ml-1">{plan.period}</span>}
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                  <CheckCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <Link to={createPageUrl('Dashboard')}>
              <Button className={`w-full ${plan.highlight ? 'bg-violet-600 hover:bg-violet-500 text-white border-0' : 'bg-white/5 hover:bg-white/10 text-white border-0'}`}>
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}