import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Users, Loader2 } from 'lucide-react';

export default function ChoirJoin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    setLoading(true);
    try {
      const choirs = await base44.entities.Choir.filter({ invite_code: inviteCode.toUpperCase() });
      if (choirs.length === 0) {
        setError('Invalid invite code');
        setLoading(false);
        return;
      }

      const choir = choirs[0];

      // Check if already member
      const existing = await base44.entities.ChoirMembership.filter({
        choir_id: choir.id,
        user_id: user.id
      });

      if (existing.length > 0) {
        setError('You are already a member of this choir');
        setLoading(false);
        return;
      }

      // Create membership (pending)
      await base44.entities.ChoirMembership.create({
        choir_id: choir.id,
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name,
        status: 'pending',
        role: 'member',
        part: 'none',
      });

      navigate(createPageUrl('ChoirDashboard'));
    } catch (err) {
      setError(err.message || 'Failed to join choir');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2.5 mb-8">
        <Users className="w-6 h-6" style={{ color: 'hsl(var(--color-primary))' }} />
        <h1 className="text-3xl font-bold" style={{ color: 'hsl(var(--color-text))' }}>Join Choir</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg text-sm" style={{ backgroundColor: 'hsl(var(--color-destructive) / 0.1)', border: `1px solid hsl(var(--color-destructive) / 0.3)`, color: 'hsl(var(--color-destructive))' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleJoin} className="rounded-lg p-6 space-y-6" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(var(--color-text))' }}>
            Invite Code
          </label>
          <input
            type="text"
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-character code"
            maxLength="6"
            className="w-full h-12 px-4 rounded-lg text-lg font-mono outline-none text-center tracking-widest"
            style={{ backgroundColor: 'hsl(var(--color-input))', border: `1px solid hsl(var(--color-border))`, color: 'hsl(var(--color-text))' }}
            onFocus={e => e.target.style.borderColor = 'hsl(var(--color-primary))'}
            onBlur={e => e.target.style.borderColor = 'hsl(var(--color-border))'}
          />
          <p className="text-xs mt-2" style={{ color: 'hsl(var(--color-muted))' }}>
            Ask your choir director for the invite code
          </p>
        </div>

        <div className="flex gap-3">
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
            disabled={loading || !inviteCode.trim()}
            className="flex-1 h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Join Choir
          </button>
        </div>
      </form>

      <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}>
        <h3 className="font-semibold mb-2" style={{ color: 'hsl(var(--color-text))' }}>Don't have an invite code?</h3>
        <p style={{ color: 'hsl(var(--color-muted))' }} className="text-sm mb-3">
          You can create your own choir or contact your director for an invite code.
        </p>
      </div>
    </div>
  );
}