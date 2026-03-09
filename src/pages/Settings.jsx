import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Settings as SettingsIcon, Zap, LogOut, Loader2 } from 'lucide-react';
import Card, { CardHeader } from '../components/auralyn/Card';

const PLAN_LIMITS = { free: 5, pro: 100 };

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [billingError, setBillingError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        setDisplayName(u.full_name || '');
        const profiles = await base44.entities.Profile.filter({ user_id: u.id });
        if (profiles.length > 0) setProfile(profiles[0]);
      } catch {
        base44.auth.redirectToLogin('/Settings');
      }
    };
    init();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: displayName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleBillingClick = async () => {
    if (plan === 'free') { navigate(createPageUrl('Pricing')); return; }
    setPortalLoading(true);
    setBillingError('');
    try {
      const res = await base44.functions.invoke('createBillingPortalSession', {});
      if (res.data?.portalUrl) window.location.href = res.data.portalUrl;
      else setBillingError(res.data?.error || 'Could not open billing portal.');
    } catch (err) {
      setBillingError(err.response?.data?.error || 'Could not open billing portal.');
    } finally {
      setPortalLoading(false);
    }
  };

  const plan = profile?.plan || 'free';
  const used = profile?.daily_jobs_used || 0;
  const limit = PLAN_LIMITS[plan];

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-2.5 mb-7">
        <SettingsIcon className="w-4 h-4" style={{ color: '#9CB2D6' }} />
        <h1 className="text-xl font-bold" style={{ color: '#EAF2FF', letterSpacing: '-0.02em' }}>Settings</h1>
      </div>

      <div className="space-y-4">
        {/* Profile */}
        <Card>
          <CardHeader title="Profile" />
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CB2D6' }}>Display name</label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full rounded-lg px-3 h-9 text-sm outline-none"
                style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF' }}
                onFocus={e => e.target.style.borderColor='#1EA0FF'}
                onBlur={e => e.target.style.borderColor='#1C2A44'}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CB2D6' }}>Email</label>
              <input
                value={user?.email || ''}
                disabled
                className="w-full rounded-lg px-3 h-9 text-sm"
                style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#9CB2D6' }}
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-9 px-5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              style={{ backgroundColor: '#1EA0FF', color: '#fff' }}
            >
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
            </button>
          </div>
        </Card>

        {/* Plan */}
        <Card>
          <CardHeader title="Plan" subtitle={plan === 'pro' ? 'Auralyn Pro' : 'Auralyn Free'} />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: plan === 'pro' ? '#FFB020' : '#9CB2D6' }} />
                <span className="text-sm font-semibold capitalize" style={{ color: '#EAF2FF' }}>{plan} plan</span>
                {profile?.subscription_status && profile.subscription_status !== 'none' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase"
                    style={{ backgroundColor: plan === 'pro' ? '#19D3A218' : '#1C2A44', color: plan === 'pro' ? '#19D3A2' : '#9CB2D6' }}>
                    {profile.subscription_status}
                  </span>
                )}
              </div>
              <button
                onClick={handleBillingClick}
                disabled={portalLoading}
                className="text-[11px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
                style={{ backgroundColor: plan === 'pro' ? '#1C2A44' : '#1EA0FF18', color: plan === 'pro' ? '#9CB2D6' : '#1EA0FF', border: `1px solid ${plan === 'pro' ? 'transparent' : '#1EA0FF30'}` }}>
                {portalLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                {plan === 'pro' ? 'Manage billing' : 'Upgrade to Pro →'}
              </button>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5" style={{ color: '#9CB2D6' }}>
                <span>Jobs today</span>
                <span className="tabular-nums font-medium" style={{ color: '#EAF2FF' }}>{used} / {limit}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#1C2A44' }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (used / limit) * 100)}%`, backgroundColor: used >= limit ? '#FF4D6D' : '#1EA0FF' }} />
              </div>
            </div>
            {billingError && <p className="text-xs" style={{ color: '#FF4D6D' }}>{billingError}</p>}
            {profile?.current_period_end && plan === 'pro' && (
              <p className="text-[11px]" style={{ color: '#9CB2D6' }}>
                Renews {new Date(profile.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </Card>

        {/* Account actions */}
        <Card>
          <CardHeader title="Account" />
          <div className="space-y-2">
            <button
              onClick={() => base44.auth.logout()}
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: '#9CB2D6' }}
              onMouseEnter={e => e.currentTarget.style.color='#EAF2FF'}
              onMouseLeave={e => e.currentTarget.style.color='#9CB2D6'}
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
            <button
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: '#9CB2D6' }}
              onMouseEnter={e => e.currentTarget.style.color='#FF4D6D'}
              onMouseLeave={e => e.currentTarget.style.color='#9CB2D6'}
            >
              <span>Delete my data</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}