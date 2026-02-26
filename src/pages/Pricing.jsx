import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, Zap, Loader2, CheckCircle } from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 10,
    description: 'Try the platform',
    features: ['10 credits/month', 'Stem separation (2-stem)', 'WAV & MP3 output', 'Community support'],
    cta: 'Current Plan',
    highlight: false,
    priceId: null,
    mode: null,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    credits: 100,
    description: 'For indie creators',
    features: ['100 credits/month', 'All separation modes', 'All output formats', 'Mix Assistant', 'Email support'],
    cta: 'Upgrade to Starter',
    highlight: false,
    priceId: 'price_1T5EKdDPbH08DQTSKlDbkN4g',
    mode: 'subscription',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    credits: 500,
    description: 'For professionals',
    features: ['500 credits/month', 'Batch processing', 'AI audio repair', 'Google Drive sync', 'Priority processing', 'Priority support'],
    cta: 'Upgrade to Pro',
    highlight: true,
    priceId: 'price_1T5EKdDPbH08DQTSl2DwUVTR',
    mode: 'subscription',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    credits: null,
    description: 'For teams & studios',
    features: ['Unlimited credits', 'Team seats', 'API access', 'Custom models', 'SLA guarantee', 'Dedicated support'],
    cta: 'Contact Us',
    highlight: false,
    priceId: null,
    mode: null,
  },
];

const CREDIT_PACKS = [
  { credits: 50, price: 4.99, label: 'Starter Pack', priceId: 'price_1T5EKdDPbH08DQTSth4zYs4s' },
  { credits: 200, price: 14.99, label: 'Best Value', highlight: true, priceId: 'price_1T5EKdDPbH08DQTSVM0aBeDy' },
  { credits: 500, price: 29.99, label: 'Pro Pack', priceId: 'price_1T5EKdDPbH08DQTSdbCONpkJ' },
];

export default function Pricing() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleUpgrade = async (planId) => {
    if (planId === 'enterprise') {
      window.open('mailto:hello@soundforge.ai?subject=Enterprise Plan', '_blank');
      return;
    }
    setLoading(true);
    // Stripe checkout would go here
    alert(`Stripe checkout for ${planId} plan coming soon!`);
    setLoading(false);
  };

  const handleBuyCredits = async (pack) => {
    setLoading(true);
    alert(`Stripe checkout for ${pack.credits} credits coming soon!`);
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-3">Simple, transparent pricing</h1>
        <p className="text-muted-foreground text-lg">Choose a plan or buy credits as you go.</p>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = user?.plan === plan.id;
          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col ${plan.highlight ? 'border-primary shadow-lg shadow-primary/10' : ''}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-2">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <p className="text-sm text-primary font-medium">
                  {plan.credits ? `${plan.credits} credits/month` : 'Unlimited credits'}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.highlight ? 'default' : 'outline'}
                  disabled={isCurrent || loading}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {isCurrent ? 'Current Plan' : plan.cta}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Credit Packs */}
      <div>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Or buy credits à la carte</h2>
          <p className="text-muted-foreground">Credits never expire. Use them anytime.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {CREDIT_PACKS.map((pack) => (
            <Card
              key={pack.credits}
              className={`text-center ${pack.highlight ? 'border-primary' : ''}`}
            >
              <CardContent className="pt-6">
                {pack.highlight && (
                  <Badge className="mb-3 bg-primary text-primary-foreground">Best Value</Badge>
                )}
                <div className="text-3xl font-bold mb-1">{pack.credits}</div>
                <div className="text-muted-foreground text-sm mb-3">credits</div>
                <div className="text-2xl font-bold text-primary mb-4">${pack.price}</div>
                <div className="text-xs text-muted-foreground mb-4">
                  ${(pack.price / pack.credits).toFixed(2)} per credit
                </div>
                <Button
                  variant={pack.highlight ? 'default' : 'outline'}
                  className="w-full gap-2"
                  onClick={() => handleBuyCredits(pack)}
                  disabled={loading}
                >
                  <Zap className="w-4 h-4" />
                  Buy {pack.credits} Credits
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Credit usage table */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-base">Credit Usage</CardTitle>
          <CardDescription>How many credits each operation costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {[
              ['Stem Separation (2-stem)', '2 credits'],
              ['Stem Separation (4-stem)', '3 credits'],
              ['AI Audio Repair', '+1 credit'],
              ['Mix Reference Analysis', '1 credit'],
              ['Batch Job (per file)', '2–3 credits'],
            ].map(([op, cost]) => (
              <div key={op} className="flex justify-between py-2 text-sm">
                <span>{op}</span>
                <span className="font-medium text-primary">{cost}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}