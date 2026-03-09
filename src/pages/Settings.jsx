import React, { useState, useEffect } from 'react';
import { LogOut, Trash2, Sun, Moon } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [defaultMode, setDefaultMode] = useState('two_stems');
  const [defaultQuality, setDefaultQuality] = useState('balanced');
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setDisplayName(currentUser.full_name || '');

        const profiles = await base44.entities.Profile.filter({ user_id: currentUser.id });
        if (profiles.length > 0) {
          setProfile(profiles[0]);
          setDefaultMode(profiles[0].default_mode || 'two_stems');
          setDefaultQuality(profiles[0].default_quality || 'balanced');
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    };
    init();
  }, []);

  const handleThemeToggle = () => {
    const root = document.documentElement;
    const newIsDark = !isDarkTheme;
    
    if (newIsDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setIsDarkTheme(newIsDark);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profile) {
        await base44.entities.Profile.update(profile.id, {
          default_mode: defaultMode,
          default_quality: defaultQuality,
        });
      } else {
        await base44.entities.Profile.create({
          user_id: user.id,
          default_mode: defaultMode,
          default_quality: defaultQuality,
        });
      }
      alert('Settings saved!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await base44.auth.logout();
  };

  if (!user) {
    return <div style={{ color: 'hsl(var(--color-muted))' }}>Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8" style={{ color: 'hsl(var(--color-text))' }}>Settings</h1>

      {/* Profile Section */}
      <div className="rounded-xl border p-6 mb-6" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'hsl(var(--color-text))' }}>Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(var(--color-muted))' }}>Display Name</label>
            <input
              type="text"
              value={displayName}
              disabled
              className="w-full px-4 h-10 rounded-lg text-sm"
              style={{ backgroundColor: 'hsl(var(--color-input))', borderColor: 'hsl(var(--color-border))', border: '1px solid', color: 'hsl(var(--color-muted))' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(var(--color-muted))' }}>Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 h-10 rounded-lg text-sm"
              style={{ backgroundColor: 'hsl(var(--color-input))', borderColor: 'hsl(var(--color-border))', border: '1px solid', color: 'hsl(var(--color-muted))' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(var(--color-muted))' }}>Plan</label>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
              style={{ backgroundColor: user.role === 'admin' ? 'hsl(var(--color-primary) / 0.1)' : 'hsl(var(--color-accent) / 0.1)' }}>
              <span style={{ color: user.role === 'admin' ? 'hsl(var(--color-primary))' : 'hsl(var(--color-accent))', fontWeight: 'bold' }}>
                {user.role === 'admin' ? 'Pro' : 'Free'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="rounded-xl border p-6 mb-6" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'hsl(var(--color-text))' }}>Preferences</h2>
        <div className="space-y-4">
          {/* Theme Toggle */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'hsl(var(--color-text))' }}>Theme</label>
            <div className="flex items-center gap-3">
              <button
                onClick={handleThemeToggle}
                className="flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: isDarkTheme ? 'hsl(var(--color-input))' : 'hsl(var(--color-primary))',
                  color: isDarkTheme ? 'hsl(var(--color-muted))' : 'hsl(var(--color-primary-foreground))',
                  border: `1px solid hsl(var(--color-border))`
                }}
              >
                {isDarkTheme ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                {isDarkTheme ? 'Dark' : 'Light'}
              </button>
              <span className="text-xs" style={{ color: 'hsl(var(--color-muted))' }}>
                Currently using <strong>{isDarkTheme ? 'dark' : 'light'}</strong> theme
              </span>
            </div>
          </div>

          <div className="border-t pt-4" style={{ borderColor: 'hsl(var(--color-border))' }}>
            <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(var(--color-text))' }}>Default Separation Mode</label>
            <select
              value={defaultMode}
              onChange={e => setDefaultMode(e.target.value)}
              className="w-full px-4 h-10 rounded-lg text-sm"
              style={{ backgroundColor: 'hsl(var(--color-input))', borderColor: 'hsl(var(--color-border))', border: '1px solid', color: 'hsl(var(--color-text))' }}
            >
              <option value="two_stems">2 Stems (Vocals & Band)</option>
              <option value="four_stems">4 Stems (Vocals, Drums, Bass, Other)</option>
              <option value="six_stems">6 Stems (Vocals, Drums, Bass, Guitar, Keys, Other)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(var(--color-text))' }}>Default Quality</label>
            <select
              value={defaultQuality}
              onChange={e => setDefaultQuality(e.target.value)}
              className="w-full px-4 h-10 rounded-lg text-sm"
              style={{ backgroundColor: 'hsl(var(--color-input))', borderColor: 'hsl(var(--color-border))', border: '1px solid', color: 'hsl(var(--color-text))' }}
            >
              <option value="fast">Fast</option>
              <option value="balanced">Balanced</option>
              <option value="hq">High Quality</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 h-10 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {/* Account Section */}
      <div className="rounded-xl border p-6 mb-6" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'hsl(var(--color-text))' }}>Account</h2>
        <div className="space-y-3">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 h-10 rounded-lg text-sm font-semibold transition-all border"
            style={{ borderColor: 'hsl(var(--color-destructive) / 0.4)', color: 'hsl(var(--color-destructive))' }}
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 h-10 rounded-lg text-sm font-semibold transition-all border"
            style={{ borderColor: 'hsl(var(--color-destructive) / 0.4)', color: 'hsl(var(--color-destructive))' }}
          >
            <Trash2 className="w-4 h-4" /> Delete Account & Data
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5">
          <div className="rounded-xl border p-6 max-w-sm" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'hsl(var(--color-text))' }}>Delete Account?</h3>
            <p className="mb-6" style={{ color: 'hsl(var(--color-muted))' }}>
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-10 rounded-lg text-sm font-semibold border"
                style={{ borderColor: 'hsl(var(--color-border))', color: 'hsl(var(--color-muted))' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Account deletion request submitted.');
                  setShowDeleteModal(false);
                }}
                className="flex-1 h-10 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: 'hsl(var(--color-destructive))', color: 'hsl(var(--color-primary-foreground))' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}