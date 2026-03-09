import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const STATUSES = [
  { value: 'mastered', label: '✓ Mastered', color: '#19D3A2', bg: '#19D3A215' },
  { value: 'learning', label: '~ Learning', color: '#FFB020', bg: '#FFB02015' },
  { value: 'need_help', label: '! Need Help', color: '#FF4D6D', bg: '#FF4D6D15' },
];

export default function ReadinessTracker({ songId, userId }) {
  const [status, setStatus] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!songId || !userId) return;
    base44.entities.SongReadiness.filter({ choir_song_id: songId, user_id: userId })
      .then(res => {
        if (res.length) { setStatus(res[0].status); setRecordId(res[0].id); }
      }).catch(() => {});
  }, [songId, userId]);

  const handleSelect = async (val) => {
    if (saving) return;
    setSaving(true);
    try {
      if (recordId) {
        await base44.entities.SongReadiness.update(recordId, { status: val });
      } else {
        const created = await base44.entities.SongReadiness.create({ choir_song_id: songId, user_id: userId, status: val });
        setRecordId(created.id);
      }
      setStatus(val);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider font-semibold mb-1.5" style={{ color: '#9CB2D6' }}>My Readiness</p>
      <div className="flex gap-1.5">
        {STATUSES.map(s => (
          <button key={s.value} onClick={() => handleSelect(s.value)} disabled={saving}
            className="flex-1 h-7 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-50"
            style={{
              backgroundColor: status === s.value ? s.bg : 'transparent',
              color: status === s.value ? s.color : '#9CB2D6',
              border: `1px solid ${status === s.value ? s.color + '50' : '#1C2A44'}`,
            }}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}