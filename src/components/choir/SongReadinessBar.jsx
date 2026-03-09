import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function SongReadinessBar({ songId, totalMembers = 0, compact = false }) {
  const [readiness, setReadiness] = useState([]);

  useEffect(() => {
    if (!songId) return;
    base44.entities.SongReadiness.filter({ choir_song_id: songId })
      .then(setReadiness).catch(() => {});
  }, [songId]);

  const mastered = readiness.filter(r => r.status === 'mastered').length;
  const learning = readiness.filter(r => r.status === 'learning').length;
  const needHelp = readiness.filter(r => r.status === 'need_help').length;
  const total = totalMembers || readiness.length || 1;
  const responded = readiness.length;

  if (readiness.length === 0 && !compact) {
    return <p className="text-[10px]" style={{ color: '#9CB2D6' }}>No responses yet</p>;
  }

  return (
    <div className="space-y-1">
      <div className="h-1.5 rounded-full overflow-hidden flex" style={{ backgroundColor: '#1C2A44' }}>
        <div style={{ width: `${(mastered / total) * 100}%`, backgroundColor: '#19D3A2', transition: 'width 0.4s ease' }} />
        <div style={{ width: `${(learning / total) * 100}%`, backgroundColor: '#FFB020', transition: 'width 0.4s ease' }} />
        <div style={{ width: `${(needHelp / total) * 100}%`, backgroundColor: '#FF4D6D', transition: 'width 0.4s ease' }} />
      </div>
      <div className="flex gap-2.5 text-[10px]">
        {mastered > 0 && <span style={{ color: '#19D3A2' }}>✓ {mastered}</span>}
        {learning > 0 && <span style={{ color: '#FFB020' }}>~ {learning}</span>}
        {needHelp > 0 && <span style={{ color: '#FF4D6D' }}>! {needHelp}</span>}
        {responded === 0 && <span style={{ color: '#9CB2D6' }}>No responses</span>}
        {totalMembers > 0 && responded < totalMembers && (
          <span style={{ color: '#9CB2D6' }}>· {totalMembers - responded} pending</span>
        )}
      </div>
    </div>
  );
}