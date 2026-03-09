import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function BillingSuccess() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke('syncProfilePlan', {})
      .then(res => setPlan(res.data?.plan))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-md mx-auto text-center py-24 px-6">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: '#19D3A218' }}>
        {loading
          ? <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#19D3A2' }} />
          : <CheckCircle2 className="w-7 h-7" style={{ color: '#19D3A2' }} />
        }
      </div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: '#EAF2FF', letterSpacing: '-0.02em' }}>
        You're Pro.
      </h1>
      <p className="text-sm mb-8" style={{ color: '#9CB2D6' }}>
        Welcome to Auralyn Pro. Unlimited jobs, all quality models, and priority GPU processing are now unlocked.
      </p>
      <Link to={createPageUrl('Settings')}
        className="inline-flex items-center justify-center h-10 px-6 rounded-lg text-sm font-semibold"
        style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
        Go to Settings
      </Link>
    </div>
  );
}