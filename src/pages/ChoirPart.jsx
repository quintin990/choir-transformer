import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Loader2, Check } from 'lucide-react';

const PARTS = [
  { value: 'soprano', label: 'Soprano', desc: 'Highest female voice', color: '#1EA0FF' },
  { value: 'alto',    label: 'Alto',    desc: 'Lower female voice',   color: '#19D3A2' },
  { value: 'tenor',   label: 'Tenor',   desc: 'Higher male voice',    color: '#FFB020' },
  { value: 'bass',    label: 'Bass',    desc: 'Lowest male voice',    color: '#9B74FF' },
];

export default function ChoirPart() {
  const navigate = useNavigate();
  const [membership, setMembership] = useState(null);
  const [selected, setSelected] = useState('none');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        const mems = await base44.entities.ChoirMembership.filter({ user_id: u.id, status: 'approved' });
        if (mems.length) {
          setMembership(mems[0]);
          setSelected(mems[0].part || 'none');
        }
      } catch {
        base44.auth.redirectToLogin('/ChoirPart');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSave = async () => {
    if (!membership) return;
    setSaving(true);
    await base44.functions.invoke('setMemberPart', { membership_id: membership.id, part: selected });
    setSaving(false);
    navigate(createPageUrl('Choir'));
  };

  if (loading) return null;

  return (
    <div className="max-w-md mx-auto mt-10 space-y-6">
      <Link to={createPageUrl('Choir')} className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#9CB2D6' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </Link>

      <div>
        <h1 className="text-xl font-bold mb-1" style={{ color: '#EAF2FF' }}>Your Voice Part</h1>
        <p className="text-sm" style={{ color: '#9CB2D6' }}>
          Your part determines which rehearsal tracks and assets are shown to you.
        </p>
      </div>

      <div className="space-y-2">
        {PARTS.map(({ value, label, desc, color }) => (
          <button key={value} onClick={() => setSelected(value)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
            style={{
              backgroundColor: selected === value ? color + '12' : '#0F1A2E',
              border: `1px solid ${selected === value ? color + '60' : '#1C2A44'}`,
            }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: selected === value ? color + '20' : '#1C2A44' }}>
              {selected === value
                ? <Check className="w-4 h-4" style={{ color }} />
                : <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#1C2A44', border: `2px solid ${color}` }} />}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: selected === value ? '#EAF2FF' : '#9CB2D6' }}>{label}</p>
              <p className="text-xs" style={{ color: '#9CB2D6' }}>{desc}</p>
            </div>
          </button>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving || !membership}
        className="w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Save Part
      </button>
    </div>
  );
}