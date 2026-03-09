import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Users, Plus, LogIn, Megaphone, Music, ChevronRight, Mic2, Clock, ChevronDown, LogOut, Check } from 'lucide-react';
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
  const [allMemberships, setAllMemberships] = useState([]);
  const [allChoirs, setAllChoirs] = useState({});
  const [activeMembershipId, setActiveMembershipId] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const membership = allMemberships.find(m => m.id === activeMembershipId) || null;
  const choir = membership ? allChoirs[membership.choir_id] : null;

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);

        const mems = await base44.entities.ChoirMembership.filter({ user_id: u.id });
        const active = mems.filter(m => ['approved', 'pending'].includes(m.status));
        setAllMemberships(active);

        if (active.length === 0) { setLoading(false); return; }

        // Load all choir names
        const choirMap = {};
        await Promise.all(active.map(async m => {
          const ch = await base44.entities.Choir.filter({ id: m.choir_id });
          if (ch.length) choirMap[m.choir_id] = ch[0];
        }));
        setAllChoirs(choirMap);

        // Pick first approved, else first pending
        const firstApproved = active.find(m => m.status === 'approved') || active[0];
        setActiveMembershipId(firstApproved.id);

        if (firstApproved.status === 'approved') {
          await loadChoirData(firstApproved.choir_id);
        }
      } catch {
        base44.auth.redirectToLogin('/Choir');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadChoirData = async (choirId) => {
    const [ann, sng] = await Promise.all([
      base44.entities.ChoirAnnouncement.filter({ choir_id: choirId }, '-created_date', 3),
      base44.entities.ChoirSong.filter({ choir_id: choirId }, '-created_date', 5),
    ]);
    setAnnouncements(ann);
    setSongs(sng);
  };

  const switchChoir = async (mem) => {
    setActiveMembershipId(mem.id);
    setSwitcherOpen(false);
    setAnnouncements([]);
    setSongs([]);
    if (mem.status === 'approved') {
      await loadChoirData(mem.choir_id);
    }
  };

  const handleLeave = async () => {
    if (!membership) return;
    const choirName = choir?.name || 'this choir';
    if (!confirm(`Leave "${choirName}"? This cannot be undone.`)) return;
    setLeaving(true);
    await base44.entities.ChoirMembership.update(membership.id, { status: 'removed' });
    const updated = allMemberships.filter(m => m.id !== membership.id);
    setAllMemberships(updated);
    if (updated.length > 0) {
      const next = updated.find(m => m.status === 'approved') || updated[0];
      setActiveMembershipId(next.id);
      if (next.status === 'approved') await loadChoirData(next.choir_id);
    } else {
      setActiveMembershipId(null);
    }
    setLeaving(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]">
      <div className="w-5 h-5 border border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1EA0FF' }} />
    </div>;
  }

  // No membership
  if (allMemberships.length === 0) {
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
            className="flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold"
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
  if (membership?.status === 'pending') {
    return (
      <div className="max-w-xl mx-auto mt-10 space-y-5">
        <ChoirSwitcher allMemberships={allMemberships} allChoirs={allChoirs} membership={membership} onSwitch={switchChoir} open={switcherOpen} setOpen={setSwitcherOpen} />
        <div className="text-center space-y-4 py-8">
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
          <button onClick={handleLeave} disabled={leaving}
            className="h-9 px-4 rounded-lg text-xs font-medium flex items-center gap-1.5 mx-auto"
            style={{ border: '1px solid #FF4D6D30', color: '#FF4D6D' }}>
            <LogOut className="w-3.5 h-3.5" /> {leaving ? 'Leaving…' : 'Cancel request'}
          </button>
        </div>
      </div>
    );
  }

  const isDirector = ['admin', 'director'].includes(membership?.role);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Choir Switcher */}
      <ChoirSwitcher allMemberships={allMemberships} allChoirs={allChoirs} membership={membership} onSwitch={switchChoir} open={switcherOpen} setOpen={setSwitcherOpen} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#EAF2FF' }}>{choir?.name || '—'}</h1>
          {choir?.church_name && <p className="text-sm mt-0.5" style={{ color: '#9CB2D6' }}>{choir.church_name}{choir.location ? ` · ${choir.location}` : ''}</p>}
        </div>
        <div className="flex items-center gap-2 mt-1 shrink-0">
          <PartBadge part={membership?.part} />
          {isDirector && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
              style={{ backgroundColor: '#9B74FF20', color: '#9B74FF', border: '1px solid #9B74FF40' }}>
              {membership.role}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Link to={createPageUrl('ChoirJoin')}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-colors"
          style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}>
          <Plus className="w-3.5 h-3.5" /> Join Another
        </Link>
        <Link to={createPageUrl('ChoirPart')}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-colors"
          style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}>
          <Mic2 className="w-3.5 h-3.5" /> Set your part
        </Link>
        {isDirector && (
          <Link to={createPageUrl('ChoirAdmin')}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium"
            style={{ backgroundColor: '#9B74FF18', color: '#9B74FF', border: '1px solid #9B74FF30' }}>
            <Users className="w-3.5 h-3.5" /> Director Dashboard
          </Link>
        )}
        <button onClick={handleLeave} disabled={leaving}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 ml-auto"
          style={{ borderColor: '#FF4D6D30', color: '#FF4D6D' }}>
          <LogOut className="w-3.5 h-3.5" /> {leaving ? 'Leaving…' : 'Leave Choir'}
        </button>
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
            <Link to={createPageUrl('ChoirSongs')} className="text-xs flex items-center gap-1" style={{ color: '#1EA0FF' }}>
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

function ChoirSwitcher({ allMemberships, allChoirs, membership, onSwitch, open, setOpen }) {
  if (allMemberships.length <= 1) return null;

  const currentChoir = membership ? allChoirs[membership.choir_id] : null;

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-medium border transition-colors"
        style={{ borderColor: '#1C2A44', color: '#9CB2D6', backgroundColor: '#0F1A2E' }}>
        <Users className="w-3.5 h-3.5" />
        <span style={{ color: '#EAF2FF' }}>{currentChoir?.name || '—'}</span>
        <span className="text-[10px] px-1.5 py-px rounded-full" style={{ backgroundColor: '#1C2A44', color: '#9CB2D6' }}>
          {allMemberships.length} choirs
        </span>
        <ChevronDown className="w-3.5 h-3.5 ml-auto" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div className="absolute top-10 left-0 z-50 rounded-xl border py-1 min-w-[220px] shadow-xl"
          style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
          {allMemberships.map(mem => {
            const ch = allChoirs[mem.choir_id];
            const isActive = mem.id === membership?.id;
            return (
              <button key={mem.id} onClick={() => onSwitch(mem)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors"
                style={{ backgroundColor: isActive ? '#1EA0FF10' : 'transparent' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#1C2A44'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#1C2A44' }}>
                  <Users className="w-3 h-3" style={{ color: isActive ? '#1EA0FF' : '#9CB2D6' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: '#EAF2FF' }}>{ch?.name || mem.choir_id}</p>
                  <p className="text-[10px] capitalize" style={{ color: '#9CB2D6' }}>
                    {mem.status === 'pending' ? '⏳ Pending' : mem.role}
                  </p>
                </div>
                {isActive && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#1EA0FF' }} />}
              </button>
            );
          })}
          <div className="border-t mx-2 mt-1 pt-1" style={{ borderColor: '#1C2A44' }}>
            <Link to={createPageUrl('ChoirJoin')} onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors w-full"
              style={{ color: '#9CB2D6' }}
              onMouseEnter={e => e.currentTarget.style.color = '#EAF2FF'}
              onMouseLeave={e => e.currentTarget.style.color = '#9CB2D6'}>
              <Plus className="w-3.5 h-3.5" /> Join another choir
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}