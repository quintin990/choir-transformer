import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle } from 'lucide-react';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [defaultMode, setDefaultMode] = useState('two_stems');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        const profiles = await base44.entities.Profile.filter({ user_id: me.id });
        if (profiles.length > 0) {
          setProfile(profiles[0]);
          setDefaultMode(profiles[0].default_mode || 'two_stems');
        }
      } catch {
        base44.auth.redirectToLogin('/Settings');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const data = { user_id: user.id, default_mode: defaultMode };
    if (profile) {
      await base44.entities.Profile.update(profile.id, data);
    } else {
      const p = await base44.entities.Profile.create(data);
      setProfile(p);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Manage your account preferences.</p>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-4">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Account</h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-white/30 mb-0.5">Name</p>
            <p className="text-white text-sm">{user?.full_name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-white/30 mb-0.5">Email</p>
            <p className="text-white text-sm">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-white/30 mb-0.5">Plan</p>
            <span className="inline-block text-xs bg-violet-500/15 text-violet-300 rounded-full px-2.5 py-0.5 capitalize">{profile?.plan || 'Free'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-4">
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest">Preferences</h2>
        <div className="space-y-1.5">
          <Label className="text-white/60 text-xs">Default Separation Mode</Label>
          <Select value={defaultMode} onValueChange={setDefaultMode}>
            <SelectTrigger className="bg-white/[0.04] border-white/10 text-white rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="two_stems">2 Stems – Vocals & Band</SelectItem>
              <SelectItem value="four_stems">4 Stems – Full Split</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : null}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <button
        onClick={() => base44.auth.logout()}
        className="text-sm text-white/30 hover:text-white/60 transition-colors"
      >
        Sign out →
      </button>
    </div>
  );
}