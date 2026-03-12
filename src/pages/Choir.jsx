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
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);

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
          <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--color-border))' }}>
            <Users className="w-7 h-7" style={{ color: 'hsl(var(--color-muted))' }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--color-text))' }}>No Active Choir</h1>
          <p className="text-sm" style={{ color: 'hsl(var(--color-muted))' }}>
            Join an existing choir with an invite code, or create your own.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={createPageUrl('ChoirJoin')}
            className="flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'hsl(var(--color-card))', color: 'hsl(var(--color-text))', border: '1px solid hsl(var(--color-border))' }}>
            <LogIn className="w-4 h-4" /> Join a Choir
          </Link>
          <Link to={createPageUrl('ChoirCreate')}
            className="flex items-center justify-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}>
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
        {leaveConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="rounded-2xl p-6 w-full max-w-sm space-y-4" style={{ backgroundColor: 'hsl(var(--color-card))', border: '1px solid hsl(var(--color-border))' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto" style={{ backgroundColor: 'hsl(var(--color-destructive) / 0.1)' }}>
                <LogOut className="w-5 h-5" style={{ color: 'hsl(var(--color-destructive))' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--color-text))' }}>Cancel request to "{choir?.name}"?</p>
                <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--color-muted))' }}>
                  Your join request will be withdrawn. You can rejoin with the invite code.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setLeaveConfirmOpen(false)}
                  className="flex-1 h-9 rounded-lg text-xs font-medium border"
                  style={{ borderColor: 'hsl(var(--color-border))', color: 'hsl(var(--color-muted))' }}>
                  Keep waiting
                </button>
                <button onClick={() => { setLeaveConfirmOpen(false); handleLeave(); }} disabled={leaving}
                  className="flex-1 h-9 rounded-lg text-xs font-semibold disabled:opacity-40"
                  style={{ backgroundColor: 'hsl(var(--color-destructive))', color: '#fff' }}>
                  {leaving ? 'Cancelling…' : 'Cancel request'}
                </button>
              </div>
            </div>
          </div>
        )}
        <ChoirSwitcher allMemberships={allMemberships} allChoirs={allChoirs} membership={membership} onSwitch={switchChoir} open={switcherOpen} setOpen={setSwitcherOpen} />
        <div className="text-center space-y-4 py-8">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center" style={{ backgroundColor: '#FFB02015' }}>
            <Clock className="w-7 h-7" style={{ color: '#FFB020' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold mb-2" style={{ color: 'hsl(var(--color-text))' }}>Request Pending Approval</h1>
            {choir && <p className="text-sm font-medium mb-2" style={{ color: 'hsl(var(--color-primary))' }}>{choir.name}{choir.church_name ? ` · ${choir.church_name}` : ''}</p>}
            <p className="text-sm" style={{ color: 'hsl(var(--color-muted))' }}>
              Your request has been sent. You'll be notified once your director approves it.
            </p>
          </div>
          <button onClick={() => setLeaveConfirmOpen(true)}
            className="h-9 px-4 rounded-lg text-xs font-medium flex items-center gap-1.5 mx-auto"
            style={{ border: '1px solid hsl(var(--color-destructive) / 0.3)', color: 'hsl(var(--color-destructive))' }}>
            <LogOut className="w-3.5 h-3.5" /> Cancel request
          </button>
        </div>
      </div>
    );
  }

  const isDirector = ['admin', 'director'].includes(membership?.role);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Leave Confirm Modal */}
      {leaveConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 w-full max-w-sm space-y-4" style={{ backgroundColor: 'hsl(var(--color-card))', border: '1px solid hsl(var(--color-border))' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto" style={{ backgroundColor: 'hsl(var(--color-destructive) / 0.1)' }}>
              <LogOut className="w-5 h-5" style={{ color: 'hsl(var(--color-destructive))' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--color-text))' }}>Leave "{choir?.name}"?</p>
              <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--color-muted))' }}>
                You'll lose access to this choir's songs and announcements. You can rejoin with an invite code.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setLeaveConfirmOpen(false)}
                className="flex-1 h-9 rounded-lg text-xs font-medium border"
                style={{ borderColor: 'hsl(var(--color-border))', color: 'hsl(var(--color-muted))' }}>
                Cancel
              </button>
              <button onClick={() => { setLeaveConfirmOpen(false); handleLeave(); }} disabled={leaving}
                className="flex-1 h-9 rounded-lg text-xs font-semibold disabled:opacity-40"
                style={{ backgroundColor: 'hsl(var(--color-destructive))', color: '#fff' }}>
                {leaving ? 'Leaving…' : 'Yes, leave'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Choir Switcher */}
      <ChoirSwitcher allMemberships={allMemberships} allChoirs={allChoirs} membership={membership} onSwitch={switchChoir} open={switcherOpen} setOpen={setSwitcherOpen} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--color-text))' }}>{choir?.name || '—'}</h1>
          {choir?.church_name && <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--color-muted))' }}>{choir.church_name}{choir.location ? ` · ${choir.location}` : ''}</p>}
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
          style={{ borderColor: 'hsl(var(--color-border))', color: 'hsl(var(--color-muted))' }}>
          <Plus className="w-3.5 h-3.5" /> Join Another
        </Link>
        <Link to={createPageUrl('ChoirPart')}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-colors"
          style={{ borderColor: 'hsl(var(--color-border))', color: 'hsl(var(--color-muted))' }}>
          <Mic2 className="w-3.5 h-3.5" /> Set your part
        </Link>
        {isDirector && (
          <Link to={createPageUrl('ChoirAdmin')}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium"
            style={{ backgroundColor: '#9B74FF18', color: '#9B74FF', border: '1px solid #9B74FF30' }}>
            <Users className="w-3.5 h-3.5" /> Director Dashboard
          </Link>
        )}
        <button onClick={() => setLeaveConfirmOpen(true)}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-colors ml-auto"
          style={{ borderColor: 'hsl(var(--color-destructive) / 0.3)', color: 'hsl(var(--color-destructive))' }}>
          <LogOut className="w-3.5 h-3.5" /> Leave Choir
        </button>
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader title="Announcements" />
        {announcements.length === 0 ? (
          <p className="text-sm text-center py-5" style={{ color: 'hsl(var(--color-muted))' }}>No announcements yet.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map(a => (
              <div key={a.id} className="rounded-lg p-3" style={{ backgroundColor: 'hsl(var(--color-background))', border: '1px solid hsl(var(--color-border))' }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-semibold" style={{ color: 'hsl(var(--color-text))' }}>{a.title}</p>
                  <span className="text-[10px] shrink-0" style={{ color: 'hsl(var(--color-muted))' }}>
                    {a.created_date ? format(new Date(a.created_date), 'MMM d') : ''}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--color-muted))' }}>{a.message}</p>
                {a.created_by_name && <p className="text-[10px] mt-1.5" style={{ color: 'hsl(var(--color-muted))' }}>— {a.created_by_name}</p>}
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
            <Link to={createPageUrl('ChoirSongs')} className="text-xs flex items-center gap-1" style={{ color: 'hsl(var(--color-primary))' }}>
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          }
        />
        {songs.length === 0 ? (
          <p className="text-sm text-center py-5" style={{ color: 'hsl(var(--color-muted))' }}>No songs added yet.</p>
        ) : (
          <div className="space-y-1.5">
            {songs.map(s => (
              <Link key={s.id} to={`${createPageUrl('ChoirSongDetail')}?id=${s.id}`}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg group transition-colors"
                style={{ backgroundColor: 'hsl(var(--color-background))', border: '1px solid hsl(var(--color-border))' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='hsl(var(--color-primary) / 0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='hsl(var(--color-border))'}>
                <div className="flex items-center gap-2.5">
                  <Music className="w-3.5 h-3.5 shrink-0" style={{ color: 'hsl(var(--color-primary))' }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'hsl(var(--color-text))' }}>{s.title}</p>
                    <p className="text-[10px]" style={{ color: 'hsl(var(--color-muted))' }}>
                      {[s.key, s.bpm && `${s.bpm} BPM`, s.time_signature].filter(Boolean).join(' · ') || 'No metadata'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'hsl(var(--color-muted))' }} />
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
        style={{ borderColor: 'hsl(var(--color-border))', color: 'hsl(var(--color-muted))', backgroundColor: 'hsl(var(--color-card))' }}>
        <Users className="w-3.5 h-3.5" />
        <span style={{ color: 'hsl(var(--color-text))' }}>{currentChoir?.name || '—'}</span>
        <span className="text-[10px] px-1.5 py-px rounded-full" style={{ backgroundColor: 'hsl(var(--color-border))', color: 'hsl(var(--color-muted))' }}>
          {allMemberships.length} choirs
        </span>
        <ChevronDown className="w-3.5 h-3.5 ml-auto" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div className="absolute top-10 left-0 z-50 rounded-xl border py-1 min-w-[220px] shadow-xl"
          style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))' }}>
          {allMemberships.map(mem => {
            const ch = allChoirs[mem.choir_id];
            const isActive = mem.id === membership?.id;
            return (
              <button key={mem.id} onClick={() => onSwitch(mem)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors"
                style={{ backgroundColor: isActive ? 'hsl(var(--color-primary) / 0.08)' : 'transparent' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'hsl(var(--color-border))'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'hsl(var(--color-border))' }}>
                  <Users className="w-3 h-3" style={{ color: isActive ? 'hsl(var(--color-primary))' : 'hsl(var(--color-muted))' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'hsl(var(--color-text))' }}>{ch?.name || mem.choir_id}</p>
                  <p className="text-[10px] capitalize" style={{ color: 'hsl(var(--color-muted))' }}>
                    {mem.status === 'pending' ? '⏳ Pending' : mem.role}
                  </p>
                </div>
                {isActive && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#1EA0FF' }} />}
              </button>
            );
          })}
          <div className="border-t mx-2 mt-1 pt-1" style={{ borderColor: 'hsl(var(--color-border))' }}>
            <Link to={createPageUrl('ChoirJoin')} onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors w-full"
              style={{ color: 'hsl(var(--color-muted))' }}
              onMouseEnter={e => e.currentTarget.style.color = 'hsl(var(--color-text))'}
              onMouseLeave={e => e.currentTarget.style.color = 'hsl(var(--color-muted))'}>
              <Plus className="w-3.5 h-3.5" /> Join another choir
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}