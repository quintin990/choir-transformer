import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Users, Plus, LogIn, Megaphone, Music, ChevronRight, Mic2, Clock } from 'lucide-react';
import Card, { CardHeader } from '../components/auralyn/Card';
import { format } from 'date-fns';

const PART_COLORS = { soprano: '#1EA0FF', alto: '#19D3A2', tenor: '#FFB020', bass: '#9B74FF', none: '#9CB2D6' };

function PartBadge({ part }) {
  const color = PART_COLORS[part] || PART_COLORS.none;
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
      style={{ backgroundColor: color + '20', color, border: `1px solid ${color}40` }}>
      {part || 'No part'}
    </span>
  );
}

export default function Choir() {
  const [user, setUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [choir, setChoir] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);

        const mems = await base44.entities.ChoirMembership.filter({ user_id: u.id });
        const approved = mems.find(m => m.status === 'approved');
        const pending = mems.find(m => m.status === 'pending');
        const active = approved || pending;

        if (!active) { setLoading(false); return; }
        setMembership(active);

        const ch = await base44.entities.Choir.filter({ id: active.choir_id });
        if (ch.length) setChoir(ch[0]);

        if (approved) {
          const [ann, sng] = await Promise.all([
            base44.entities.ChoirAnnouncement.filter({ choir_id: active.choir_id }, '-created_date', 3),
            base44.entities.ChoirSong.filter({ choir_id: active.choir_id }, '-created_date', 5),
          ]);
          setAnnouncements(ann);
          setSongs(sng);
        }
      } catch {
        base44.auth.redirectToLogin('/Choir');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]">
      <div className="w-5 h-5 border border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1EA0FF' }} />
    </div>;
  }

  // No membership
  if (!membership) {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center space-y-8">
        <div>
          <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ backgroundColor: '#1C2A44' }}>
            <Users className="w-7 h-7" style={{ color: '#9CB2D6' }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#EAF2FF' }}>No Active Choir</h1>
          <p className="text-sm" style={{ color: '#9CB2D6' }}>
            Join an existing choir with an invite code, or create your own.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={createPageUrl('ChoirJoin')}
            className="flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold transition-colors"
            style={{ backgroundColor: '#1C2A44', color: '#EAF2FF', border: '1px solid #2A3A54' }}>
            <LogIn className="w-4 h-4" /> Join a Choir
          </Link>
          <Link to={createPageUrl('ChoirCreate')}
            className="flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
            <Plus className="w-4 h-4" /> Create a Choir
          </Link>
        </div>
      </div>
    );
  }

  // Pending
  if (membership.status === 'pending') {
    return (
      <div className="max-w-xl mx-auto mt-16 text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ backgroundColor: '#FFB02015' }}>
          <Clock className="w-7 h-7" style={{ color: '#FFB020' }} />
        </div>
        <div>
          <h1 className="text-xl font-bold mb-2" style={{ color: '#EAF2FF' }}>Request Pending Approval</h1>
          {choir && <p className="text-sm font-medium mb-2" style={{ color: '#1EA0FF' }}>{choir.name}{choir.church_name ? ` · ${choir.church_name}` : ''}</p>}
          <p className="text-sm" style={{ color: '#9CB2D6' }}>
            Your request has been sent. You'll be notified once your director approves it.
          </p>
        </div>
        <button className="h-9 px-4 rounded-lg text-xs font-medium border" style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}>
          Contact admin
        </button>
      </div>
    );
  }

  // Approved
  const isDirector = ['admin', 'director'].includes(membership.role);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#9CB2D6' }}>My Choir</p>
          <h1 className="text-2xl font-bold" style={{ color: '#EAF2FF' }}>{choir?.name || '—'}</h1>
          {choir?.church_name && <p className="text-sm mt-0.5" style={{ color: '#9CB2D6' }}>{choir.church_name}{choir.location ? ` · ${choir.location}` : ''}</p>}
        </div>
        <div className="flex items-center gap-2 mt-1 shrink-0">
          <PartBadge part={membership.part} />
          {isDirector && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
              style={{ backgroundColor: '#9B74FF20', color: '#9B74FF', border: '1px solid #9B74FF40' }}>
              {membership.role}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to={createPageUrl('ChoirPart')}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-colors"
          style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}
          onMouseEnter={e => { e.currentTarget.style.color='#EAF2FF'; e.currentTarget.style.borderColor='#2A3A54'; }}
          onMouseLeave={e => { e.currentTarget.style.color='#9CB2D6'; e.currentTarget.style.borderColor='#1C2A44'; }}>
          <Mic2 className="w-3.5 h-3.5" /> Set your part
        </Link>
        {isDirector && (
          <Link to={createPageUrl('ChoirAdmin')}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium"
            style={{ backgroundColor: '#9B74FF18', color: '#9B74FF', border: '1px solid #9B74FF30' }}>
            <Users className="w-3.5 h-3.5" /> Director Dashboard
          </Link>
        )}
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader title="Announcements" />
        {announcements.length === 0 ? (
          <p className="text-sm text-center py-5" style={{ color: '#9CB2D6' }}>No announcements yet.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="rounded-lg p-3" style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-semibold" style={{ color: '#EAF2FF' }}>{a.title}</p>
                  <span className="text-[10px] shrink-0" style={{ color: '#9CB2D6' }}>
                    {a.created_date ? format(new Date(a.created_date), 'MMM d') : ''}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#9CB2D6' }}>{a.message}</p>
                {a.created_by_name && <p className="text-[10px] mt-1.5" style={{ color: '#9CB2D6' }}>— {a.created_by_name}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Songs */}
      <Card>
        <CardHeader
          title="Songs"
          action={
            <Link to={createPageUrl('ChoirSongs')} className="text-xs flex items-center gap-1"
              style={{ color: '#1EA0FF' }}>
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          }
        />
        {songs.length === 0 ? (
          <p className="text-sm text-center py-5" style={{ color: '#9CB2D6' }}>No songs added yet.</p>
        ) : (
          <div className="space-y-1.5">
            {songs.map(s => (
              <Link key={s.id} to={`${createPageUrl('ChoirSongDetail')}?id=${s.id}`}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg group transition-colors"
                style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#2A3A54'}
                onMouseLeave={e => e.currentTarget.style.borderColor='#1C2A44'}>
                <div className="flex items-center gap-2.5">
                  <Music className="w-3.5 h-3.5 shrink-0" style={{ color: '#1EA0FF' }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#EAF2FF' }}>{s.title}</p>
                    <p className="text-[10px]" style={{ color: '#9CB2D6' }}>
                      {[s.key, s.bpm && `${s.bpm} BPM`, s.time_signature].filter(Boolean).join(' · ') || 'No metadata'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#9CB2D6' }} />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}