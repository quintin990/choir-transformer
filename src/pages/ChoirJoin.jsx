import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ArrowLeft, LogIn, Loader2 } from 'lucide-react';

export default function ChoirJoin() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    const res = await base44.functions.invoke('joinChoirByInviteCode', { invite_code: code.trim() });
    setLoading(false);
    if (res.data?.error) {
      setError(res.data.error);
    } else {
      navigate(createPageUrl('Choir'));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 space-y-6">
      <Link to={createPageUrl('Choir')} className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#9CB2D6' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </Link>

      <div>
        <h1 className="text-xl font-bold mb-1" style={{ color: '#EAF2FF' }}>Join a Choir</h1>
        <p className="text-sm" style={{ color: '#9CB2D6' }}>Enter the invite code from your choir director.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: '#9CB2D6' }}>Invite Code</label>
          <input
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. ABCD1234"
            maxLength={8}
            className="w-full h-10 px-3 rounded-lg text-sm font-mono tracking-widest uppercase focus:outline-none"
            style={{ backgroundColor: '#0F1A2E', border: '1px solid #1C2A44', color: '#EAF2FF', caretColor: '#1EA0FF' }}
          />
        </div>

        {error && <p className="text-xs" style={{ color: '#FF4D6D' }}>{error}</p>}

        <button type="submit" disabled={loading || !code.trim()}
          className="w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          Request Access
        </button>
      </form>
    </div>
  );
}