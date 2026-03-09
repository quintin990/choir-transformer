import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Music, ChevronRight, Loader2 } from 'lucide-react';
import Card from '../components/auralyn/Card';

export default function ChoirSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [choirId, setChoirId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        const mems = await base44.entities.ChoirMembership.filter({ user_id: u.id, status: 'approved' });
        if (!mems.length) { setLoading(false); return; }
        const cid = mems[0].choir_id;
        setChoirId(cid);
        const s = await base44.entities.ChoirSong.filter({ choir_id: cid }, '-created_date');
        setSongs(s);
      } catch {
        base44.auth.redirectToLogin('/ChoirSongs');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#1EA0FF' }} /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to={createPageUrl('Choir')} className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#9CB2D6' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
      </div>
      <h1 className="text-xl font-bold" style={{ color: '#EAF2FF' }}>Songs</h1>

      <Card padding="p-0">
        {songs.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: '#9CB2D6' }}>No songs added yet.</p>
        ) : (
          <div className="divide-y" style={{ borderColor: '#1C2A44' }}>
            {songs.map(s => (
              <Link key={s.id} to={`${createPageUrl('ChoirSongDetail')}?id=${s.id}`}
                className="flex items-center gap-3 px-4 py-3 group transition-colors"
                style={{ color: 'inherit' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor='#0F1A2E'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
                <Music className="w-4 h-4 shrink-0" style={{ color: '#1EA0FF' }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#EAF2FF' }}>{s.title}</p>
                  <p className="text-xs" style={{ color: '#9CB2D6' }}>
                    {[s.key, s.bpm && `${s.bpm} BPM`, s.time_signature].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#9CB2D6' }} />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}