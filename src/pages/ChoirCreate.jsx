import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Users, Loader2 } from 'lucide-react';

export default function ChoirCreate() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    church_name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Choir name is required');
      return;
    }

    setLoading(true);
    try {
      const choir = await base44.entities.Choir.create({
        ...formData,
        owner_user_id: user.id,
        invite_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      });

      // Create owner membership
      await base44.entities.ChoirMembership.create({
        choir_id: choir.id,
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name,
        status: 'approved',
        role: 'director',
        part: 'director',
      });

      navigate(createPageUrl('ChoirDashboard'));
    } catch (err) {
      setError(err.message || 'Failed to create choir');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2.5 mb-8">
        <Users className="w-6 h-6" style={{ color: 'hsl(var(--color-primary))' }} />
        <h1 className="text-3xl font-bold" style={{ color: 'hsl(var(--color-text))' }}>Create Choir</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg text-sm" style={{ backgroundColor: 'hsl(var(--color-destructive) / 0.1)', border: `1px solid hsl(var(--color-destructive) / 0.3)`, color: 'hsl(var(--color-destructive))' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg p-6" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(var(--color-text))' }}>Choir Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. St. John's Choir"
            className="w-full h-10 px-3 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'hsl(var(--color-input))', border: `1px solid hsl(var(--color-border))`, color: 'hsl(var(--color-text))' }}
            onFocus={e => e.target.style.borderColor = 'hsl(var(--color-primary))'}
            onBlur={e => e.target.style.borderColor = 'hsl(var(--color-border))'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(var(--color-text))' }}>Church/Organization</label>
          <input
            type="text"
            value={formData.church_name}
            onChange={e => setFormData({ ...formData, church_name: e.target.value })}
            placeholder="e.g. St. John's Church"
            className="w-full h-10 px-3 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'hsl(var(--color-input))', border: `1px solid hsl(var(--color-border))`, color: 'hsl(var(--color-text))' }}
            onFocus={e => e.target.style.borderColor = 'hsl(var(--color-primary))'}
            onBlur={e => e.target.style.borderColor = 'hsl(var(--color-border))'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(var(--color-text))' }}>Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            placeholder="City, Country"
            className="w-full h-10 px-3 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'hsl(var(--color-input))', border: `1px solid hsl(var(--color-border))`, color: 'hsl(var(--color-text))' }}
            onFocus={e => e.target.style.borderColor = 'hsl(var(--color-primary))'}
            onBlur={e => e.target.style.borderColor = 'hsl(var(--color-border))'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(var(--color-text))' }}>Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Tell us about your choir..."
            rows="4"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={{ backgroundColor: 'hsl(var(--color-input))', border: `1px solid hsl(var(--color-border))`, color: 'hsl(var(--color-text))' }}
            onFocus={e => e.target.style.borderColor = 'hsl(var(--color-primary))'}
            onBlur={e => e.target.style.borderColor = 'hsl(var(--color-border))'}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(createPageUrl('ChoirDashboard'))}
            className="flex-1 h-10 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'hsl(var(--color-input))', color: 'hsl(var(--color-muted))', border: `1px solid hsl(var(--color-border))` }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Choir
          </button>
        </div>
      </form>
    </div>
  );
}