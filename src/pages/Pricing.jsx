import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, Zap, Loader2, CheckCircle } from 'lucide-react';

const PLANS = [
  {
    id: 'free', name: 'Free', price: 0, credits: 10,
    desc: 'Try the platform',
    features: ['10 credits/month', '2-stem separation', 'WAV & MP3 output', 'Community support'],
    cta: 'Current plan', priceId: null, mode: null,
  },
  {
    id: 'starter', name: 'Starter', price: 19, credits: 100,
    desc: 'For indie creators',
    features: ['100 credits/month', 'All separation modes', 'All output formats', 'Mix Assistant', 'Email support'],
    cta: 'Get Starter', priceId: 'price_1T5EKdDPbH08DQTSKlDbkN4g', mode: 'subscription',
  },
  {
    id: 'pro', name: 'Pro', price: 49, credits: 500,
    desc: 'For professionals',
    features: ['500 credits/month', 'Batch processing', 'AI audio repair', 'Google Drive sync', 'Priority processing', 'Priority support'],
    cta: 'Get Pro', highlight: true, priceId: 'price_1T5EKdDPbH08DQTSl2DwUVTR', mode: 'subscription',
  },
  {
    id: 'enterprise', name: 'Enterprise', price: 99, credits: null,
    desc: 'For teams & studios',
    features: ['Unlimited credits', 'Team seats', 'API access', 'Custom models', 'SLA guarantee', 'Dedicated support'],
    cta: 'Contact us', priceId: null, mode: null,
  },
];

const CREDIT_PACKS = [
  { credits: 50, price: 4.99, label: 'Starter pack', priceId: 'price_1T5EKdDPbH08DQTSth4zYs4s' },
  { credits: 200, price: 14.99, label: 'Best value', highlight: true, priceId: 'price_1T5EKdDPbH08DQTSVM0aBeDy' },
  { credits: 500, price: 29.99, label: 'Pro pack', priceId: 'price_1T5EKdDPbH08DQTSdbCONpkJ' },
];

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    if (new URLSearchParams(window.location.search).get('success')) {
      setSuccessMsg('Payment successful! Credits will be updated shortly.');
    }
  }, []);

  const startCheckout = async (priceId, mode) => {
    if (window.self !== window.top) {
      alert('Checkout only works from the published app.');
      return;
    }
    setLoading(priceId);
    try {
      const res = await base44.functions.invoke('stripeCheckout', { price_id: priceId, mode });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const handlePlan = (plan) => {
    if (plan.id === 'enterprise') { window.open('mailto:hello@stemforge.ai?subject=Enterprise', '_blank'); return; }
    if (!plan.priceId) return;
    startCheckout(plan.priceId, plan.mode);
  };

  const plan = user?.plan || 'free';

  return (
    <div className="max-w-5xl mx-auto space-y-16">
      {successMsg && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <AlertDescription className="text-emerald-400">{successMsg}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="text-center pt-4">
        <h1 className="text-3xl font-bold text-white mb-2">Simple pricing</h1>
        <p className="text-white/40">Start free, scale as you grow.</p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PLANS.map((p) => {
          const isCurrent = plan === p.id;
          return (
            <div
              key={p.id}
              className={`relative flex flex-col bg-white/[0.03] rounded-2xl p-5 border transition-colors ${
                p.highlight ? 'border-violet-500/40 shadow-lg shadow-violet-500/10' : 'border-white/5'
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-violet-600 text-white text-xs font-medium px-3 py-1 rounded-full">Most popular</span>
                </div>
              )}
              <div className="mb-4">
                <p className="font-semibold text-white">{p.name}</p>
                <p className="text-white/40 text-xs mt-0.5">{p.desc}</p>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">${p.price}</span>
                <span className="text-white/30 text-sm">/mo</span>
                <p className="text-violet-400 text-xs font-medium mt-1">
                  {p.credits ? `${p.credits} credits/month` : 'Unlimited credits'}
                </p>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-white/50">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                className={`w-full ${p.highlight ? 'bg-violet-600 hover:bg-violet-500 text-white border-0' : 'bg-white/5 hover:bg-white/10 text-white border-white/10'}`}
                disabled={isCurrent || loading !== null}
                onClick={() => handlePlan(p)}
                variant={p.highlight ? 'default' : 'outline'}
              >
                {loading === p.priceId ? <Loader2 className="w-4 h-4 animate-spin" /> : (isCurrent ? 'Current plan' : p.cta)}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Credit packs */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-1">Buy credits à la carte</h2>
          <p className="text-white/40 text-sm">Credits never expire.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.credits}
              className={`text-center bg-white/[0.03] border rounded-2xl p-5 ${pack.highlight ? 'border-violet-500/40' : 'border-white/5'}`}
            >
              {pack.highlight && (
                <span className="bg-violet-600/20 text-violet-300 text-xs font-medium px-2.5 py-1 rounded-full mb-3 inline-block">Best value</span>
              )}
              <p className="text-3xl font-bold text-white">{pack.credits}</p>
              <p className="text-white/30 text-xs mb-3">credits</p>
              <p className="text-xl font-bold text-violet-400 mb-1">${pack.price}</p>
              <p className="text-white/25 text-xs mb-4">${(pack.price / pack.credits).toFixed(2)} per credit</p>
              <Button
                size="sm"
                className={`w-full gap-1.5 ${pack.highlight ? 'bg-violet-600 hover:bg-violet-500 text-white border-0' : 'bg-white/5 hover:bg-white/10 text-white border-white/10'}`}
                variant={pack.highlight ? 'default' : 'outline'}
                onClick={() => startCheckout(pack.priceId, 'payment')}
                disabled={loading !== null}
              >
                {loading === pack.priceId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Buy {pack.credits} credits
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Usage table */}
      <div className="max-w-sm mx-auto pb-8">
        <h3 className="text-sm font-medium text-white/40 mb-3 text-center uppercase tracking-wider">Credit usage</h3>
        <div className="bg-white/[0.03] border border-white/5 rounded-xl divide-y divide-white/5">
          {[
            ['2-stem separation', '2 credits'],
            ['4-stem separation', '3 credits'],
            ['AI audio repair', '+1 credit'],
            ['Mix analysis', '1 credit'],
            ['Batch (per file)', '2–3 credits'],
          ].map(([op, cost]) => (
            <div key={op} className="flex justify-between px-4 py-2.5 text-sm">
              <span className="text-white/50">{op}</span>
              <span className="text-violet-400 font-medium">{cost}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}