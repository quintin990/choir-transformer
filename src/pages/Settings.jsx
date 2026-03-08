import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle, User, SlidersHorizontal, Cloud } from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'defaults', label: 'Defaults', icon: SlidersHorizontal },
  { id: 'cloud', label: 'Cloud', icon: Cloud },
];

export default function Settings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    display_name: '',
    default_output_format: 'wav',
    default_separation_mode: 'two_stems',
    default_separation_model: 'balanced',
    default_mp3_bitrate: '320',
    default_mp3_mode: 'cbr',
    default_wav_sample_rate: '44100',
    default_wav_bit_depth: '16',
  });
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        const profiles = await base44.entities.Profile.filter({ user_id: me.id });
        if (profiles.length > 0) setProfile(profiles[0]);
      } catch {
        base44.auth.redirectToLogin('/Settings');
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError('');
    try {
      if (profile.id) {
        await base44.entities.Profile.update(profile.id, profile);
      } else {
        const created = await base44.entities.Profile.create({ ...profile, user_id: user.id });
        setProfile(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/5 rounded-xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === id ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {tab === 'profile' && (
          <>
            <div className="space-y-2">
              <Label className="text-white/60 text-xs uppercase tracking-wider">Email</Label>
              <Input value={user.email} disabled className="bg-white/[0.02] border-white/5 text-white/40" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name" className="text-white/60 text-xs uppercase tracking-wider">Display name</Label>
              <Input
                id="display_name"
                value={profile.display_name || ''}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                placeholder="Your name"
                className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/20"
              />
            </div>
          </>
        )}

        {tab === 'defaults' && (
          <>
            <div className="space-y-2">
              <Label className="text-white/60 text-xs uppercase tracking-wider">Default stems</Label>
              <Select value={profile.default_separation_mode} onValueChange={(v) => setProfile({ ...profile, default_separation_mode: v })}>
                <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="two_stems">2 stems (vocals + band)</SelectItem>
                  <SelectItem value="four_stems">4 stems</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-xs uppercase tracking-wider">Default model</Label>
              <Select value={profile.default_separation_model} onValueChange={(v) => setProfile({ ...profile, default_separation_model: v })}>
                <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="high_quality">High quality</SelectItem>
                  <SelectItem value="artifact_free">Artifact-free</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/60 text-xs uppercase tracking-wider">Default output format</Label>
              <Select value={profile.default_output_format} onValueChange={(v) => setProfile({ ...profile, default_output_format: v })}>
                <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wav">WAV (lossless)</SelectItem>
                  <SelectItem value="flac">FLAC</SelectItem>
                  <SelectItem value="mp3">MP3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {tab === 'cloud' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3.5">
              <div>
                <p className="text-sm text-white font-medium">Google Drive</p>
                <p className="text-xs text-emerald-400 mt-0.5">Connected</p>
              </div>
              <Button variant="outline" size="sm" className="border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-xs">
                Disconnect
              </Button>
            </div>
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3.5 opacity-40">
              <div>
                <p className="text-sm text-white">Dropbox</p>
                <p className="text-xs text-white/30 mt-0.5">Coming soon</p>
              </div>
            </div>
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3.5 opacity-40">
              <div>
                <p className="text-sm text-white">OneDrive</p>
                <p className="text-xs text-white/30 mt-0.5">Coming soon</p>
              </div>
            </div>
          </div>
        )}

        {(tab === 'profile' || tab === 'defaults') && (
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-500 text-white border-0"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save changes'}
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
            {error && <span className="text-xs text-red-400">{error}</span>}
          </div>
        )}
      </form>
    </div>
  );
}