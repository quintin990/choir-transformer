import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Settings as SettingsIcon, User, Zap, LogOut } from 'lucide-react';
import Card, { CardHeader } from '../components/auralyn/Card';

const PLAN_LIMITS = { free: 5, pro: 100 };

export default function Settings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
          <CardHeader title="Plan" subtitle="Auralyn Free" />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: plan === 'pro' ? '#FFB020' : '#9CB2D6' }} />
                <span className="text-sm font-semibold capitalize" style={{ color: '#EAF2FF' }}>{plan} plan</span>
              </div>
              {plan === 'free' && (
                <span className="text-[11px] px-2 py-0.5 rounded font-medium cursor-pointer transition-colors"
                  style={{ backgroundColor: '#1EA0FF18', color: '#1EA0FF', border: '1px solid #1EA0FF30' }}>
                  Upgrade to Pro →
                </span>
              )}
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