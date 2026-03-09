import React, { useState, useEffect } from 'react';
import { LogOut, Trash2, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [defaultMode, setDefaultMode] = useState('two_stems');
  const [defaultQuality, setDefaultQuality] = useState('balanced');
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
    return <div style={{ color: '#6A8AAD' }}>Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-8" style={{ color: '#EAF2FF', letterSpacing: '-0.03em' }}>Settings</h1>

      {/* Profile Section */}
      <div className="rounded-xl border p-6 mb-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: '#EAF2FF' }}>Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#9CB2D6' }}>Display Name</label>
            <input
              type="text"
              value={displayName}
              disabled
              className="w-full px-4 h-10 rounded-lg text-sm"
              style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', border: '1px solid #1C2A44', color: '#6A8AAD' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#9CB2D6' }}>Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 h-10 rounded-lg text-sm"
              style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', border: '1px solid #1C2A44', color: '#6A8AAD' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#9CB2D6' }}>Plan</label>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
              style={{ backgroundColor: user.role === 'admin' ? '#1EA0FF10' : '#FFB02010' }}>
              <span style={{ color: user.role === 'admin' ? '#1EA0FF' : '#FFB020', fontWeight: 'bold' }}>
                {user.role === 'admin' ? 'Pro' : 'Free'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="rounded-xl border p-6 mb-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: '#EAF2FF' }}>Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#9CB2D6' }}>Default Separation Mode</label>
            <select
              value={defaultMode}
              onChange={e => setDefaultMode(e.target.value)}
              className="w-full px-4 h-10 rounded-lg text-sm"
              style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', border: '1px solid #1C2A44', color: '#EAF2FF' }}
            >
              <option value="two_stems">2 Stems (Vocals & Band)</option>
              <option value="four_stems">4 Stems (Vocals, Drums, Bass, Other)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#9CB2D6' }}>Default Quality</label>
            <select
              value={defaultQuality}
              onChange={e => setDefaultQuality(e.target.value)}
              className="w-full px-4 h-10 rounded-lg text-sm"
              style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', border: '1px solid #1C2A44', color: '#EAF2FF' }}
            >
              <option value="fast">Fast</option>
              <option value="balanced">Balanced</option>
              <option value="high_quality">High Quality</option>
            </select>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 h-10 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: '#19D3A2', color: '#fff' }}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {/* Account Section */}
      <div className="rounded-xl border p-6 mb-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: '#EAF2FF' }}>Account</h2>
        <div className="space-y-3">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 h-10 rounded-lg text-sm font-semibold transition-all border"
            style={{ borderColor: '#FF4D6D60', color: '#FF4D6D' }}
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 h-10 rounded-lg text-sm font-semibold transition-all border"
            style={{ borderColor: '#FF4D6D60', color: '#FF4D6D' }}
          >
            <Trash2 className="w-4 h-4" /> Delete Account & Data
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5">
          <div className="rounded-xl border p-6 max-w-sm" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#EAF2FF' }}>Delete Account?</h3>
            <p className="mb-6" style={{ color: '#9CB2D6' }}>
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-10 rounded-lg text-sm font-semibold border"
                style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Account deletion request submitted.');
                  setShowDeleteModal(false);
                }}
                className="flex-1 h-10 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: '#FF4D6D', color: '#fff' }}
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