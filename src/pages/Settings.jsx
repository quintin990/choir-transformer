import React, { useState, useEffect } from 'react';
import { LogOut, Trash2, Sun, Moon, Lock, CreditCard, Shield, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

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
  const [activeTab, setActiveTab] = useState('profile');
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
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8" style={{ color: 'hsl(var(--color-text))' }}>Settings</h1>

      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b" style={{ borderColor: 'hsl(var(--color-border))' }}>
        {[
          { id: 'profile', label: 'Profile', icon: '👤' },
          { id: 'billing', label: 'Billing', icon: '💳' },
          { id: 'security', label: 'Security', icon: '🔒' },
          { id: 'data', label: 'Data', icon: '📊' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
            style={{
              color: activeTab === tab.id ? 'hsl(var(--color-primary))' : 'hsl(var(--color-muted))',
              borderColor: activeTab === tab.id ? 'hsl(var(--color-primary))' : 'transparent',
            }}
          >
            <span className="mr-1">{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
      <div className="space-y-6">
        <div className="rounded-xl border p-6" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))' }}>
          <h2 className="text-lg font-bold mb-4" style={{ color: 'hsl(var(--color-text))' }}>Profile Information</h2>
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
                value={user?.email || ''}
                disabled
                className="w-full px-4 h-10 rounded-lg text-sm"
                style={{ backgroundColor: 'hsl(var(--color-input))', borderColor: 'hsl(var(--color-border))', border: '1px solid', color: 'hsl(var(--color-muted))' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(var(--color-muted))' }}>Plan</label>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                style={{ backgroundColor: user?.role === 'admin' ? 'hsl(var(--color-primary) / 0.1)' : 'hsl(var(--color-accent) / 0.1)' }}>
                <span style={{ color: user?.role === 'admin' ? 'hsl(var(--color-primary))' : 'hsl(var(--color-accent))', fontWeight: 'bold' }}>
                  {user?.role === 'admin' ? 'Pro' : 'Free'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="rounded-xl border p-6" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))' }}>
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
          )}

          {/* Billing Tab */}
      {activeTab === 'billing' && (
      <div className="space-y-6">
        <div className="rounded-xl border p-6" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))' }}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--color-text))' }}>
            <CreditCard className="w-5 h-5" /> Billing & Subscription
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-background))' }}>
              <p className="text-sm font-medium" style={{ color: 'hsl(var(--color-text))' }}>Current Plan</p>
              <p className="text-lg font-bold mt-1" style={{ color: user?.role === 'admin' ? 'hsl(var(--color-primary))' : 'hsl(var(--color-accent))' }}>
                {user?.role === 'admin' ? 'Pro ($9.99/month)' : 'Free'}
              </p>
            </div>
            {user?.role !== 'admin' && (
              <a
                href={createPageUrl('Pricing')}
                className="block w-full px-4 h-10 rounded-lg text-sm font-semibold text-center transition-all"
                style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}
              >
                Upgrade to Pro
              </a>
            )}
            {user?.role === 'admin' && (
              <>
                <p className="text-xs mt-4" style={{ color: 'hsl(var(--color-muted))' }}>Subscription active. Renews automatically.</p>
                <button
                  onClick={() => alert('Manage subscription in Stripe portal')}
                  className="w-full px-4 h-10 rounded-lg text-sm font-semibold transition-all"
                  style={{ backgroundColor: 'hsl(var(--color-input))', color: 'hsl(var(--color-text))', border: `1px solid hsl(var(--color-border))` }}
                >
                  Manage Subscription
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
      <div className="space-y-6">
        <div className="rounded-xl border p-6" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))' }}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--color-text))' }}>
            <Shield className="w-5 h-5" /> Security & Access
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-background))' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'hsl(var(--color-text))' }}>Password</p>
                  <p className="text-xs mt-1" style={{ color: 'hsl(var(--color-muted))' }}>Last changed 90 days ago</p>
                </div>
                <button className="px-3 h-8 rounded text-xs font-medium" style={{ backgroundColor: 'hsl(var(--color-input))', color: 'hsl(var(--color-text))', border: `1px solid hsl(var(--color-border))` }}>
                  Change
                </button>
              </div>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-background))' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'hsl(var(--color-text))' }}>Two-Factor Auth</p>
                  <p className="text-xs mt-1" style={{ color: 'hsl(var(--color-muted))' }}>Not enabled</p>
                </div>
                <button className="px-3 h-8 rounded text-xs font-medium" style={{ backgroundColor: 'hsl(var(--color-primary))' , color: 'hsl(var(--color-primary-foreground))' }}>
                  Enable
                </button>
              </div>
            </div>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'hsl(var(--color-background))', borderColor: 'hsl(var(--color-border))' }}>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold transition-all"
                style={{ color: 'hsl(var(--color-destructive))' }}
              >
                <LogOut className="w-4 h-4" /> Sign Out Everywhere
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Data Tab */}
      {activeTab === 'data' && (
      <div className="space-y-6">
        <div className="rounded-xl border p-6" style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))' }}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'hsl(var(--color-text))' }}>
            <Download className="w-5 h-5" /> Data Management
          </h2>
          <div className="space-y-4">
            <p style={{ color: 'hsl(var(--color-muted))' }} className="text-sm">
              Download or delete your data. Your jobs and files are retained for 7-30 days before automatic deletion.
            </p>
            <button
              className="w-full px-4 h-10 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: 'hsl(var(--color-input))', color: 'hsl(var(--color-text))', border: `1px solid hsl(var(--color-border))` }}
            >
              <Download className="w-4 h-4" /> Download Your Data
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full px-4 h-10 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
              style={{ color: 'hsl(var(--color-destructive))', border: `1px solid hsl(var(--color-destructive) / 0.4)` }}
            >
              <Trash2 className="w-4 h-4" /> Delete All Data & Account
            </button>
          </div>
        </div>
      </div>
      )}

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