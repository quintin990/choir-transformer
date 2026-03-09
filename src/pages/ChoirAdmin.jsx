import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Copy, Check, Plus, Loader2, ChevronRight, Megaphone, Music, ArrowLeft, ListOrdered } from 'lucide-react';
import Card, { CardHeader } from '../components/auralyn/Card';
import SongReadinessBar from '../components/choir/SongReadinessBar';

const PART_COLORS = { soprano: '#1EA0FF', alto: '#19D3A2', tenor: '#FFB020', bass: '#9B74FF', none: '#9CB2D6' };
const STATUS_COLORS = { pending: '#FFB020', approved: '#19D3A2', rejected: '#FF4D6D', removed: '#9CB2D6' };

export default function ChoirAdmin() {
  const [choir, setChoir] = useState(null);
  const [membership, setMembership] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [projects, setProjects] = useState([]);

  // Announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annMsg, setAnnMsg] = useState('');
  const [annSaving, setAnnSaving] = useState(false);
  const [annDone, setAnnDone] = useState(false);

  // Song form
  const [songTitle, setSongTitle] = useState('');
  const [songProjectId, setSongProjectId] = useState('');
  const [songKey, setSongKey] = useState('');
  const [songBpm, setSongBpm] = useState('');
  const [songSaving, setSongSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        const mems = await base44.entities.ChoirMembership.filter({ user_id: u.id, status: 'approved' });
        const myMem = mems.find(m => ['admin', 'director'].includes(m.role));
        if (!myMem) { window.location.href = createPageUrl('Choir'); return; }
        setMembership(myMem);

        const [choirs, allMembers, projs] = await Promise.all([
          base44.entities.Choir.filter({ id: myMem.choir_id }),
          base44.entities.ChoirMembership.filter({ choir_id: myMem.choir_id }),
          base44.entities.Project.filter({ user_id: u.id }),
        ]);
        if (choirs.length) setChoir(choirs[0]);
        setMembers(allMembers.sort((a, b) => (a.status === 'pending' ? -1 : 1)));
        setProjects(projs);
      } catch {
        base44.auth.redirectToLogin('/ChoirAdmin');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(choir?.invite_code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMemberAction = async (mem, status, role) => {
    const res = await base44.functions.invoke('approveMember', { membership_id: mem.id, status, ...(role ? { role } : {}) });
    if (res.data?.membership) {
      setMembers(prev => prev.map(m => m.id === mem.id ? res.data.membership : m));
    }
  };

  const handleAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMsg.trim()) return;
    setAnnSaving(true);
    await base44.functions.invoke('createAnnouncement', { choir_id: choir.id, title: annTitle, message: annMsg });
    setAnnTitle(''); setAnnMsg('');
    setAnnSaving(false);
    setAnnDone(true);
    setTimeout(() => setAnnDone(false), 2500);
  };

  const handleCreateSong = async (e) => {
    e.preventDefault();
    if (!songTitle.trim()) return;
    setSongSaving(true);
    await base44.functions.invoke('createChoirSongFromProject', {
      choir_id: choir.id,
      project_id: songProjectId || undefined,
      title: songTitle,
      key: songKey || undefined,
      bpm: songBpm || undefined,
    });
    setSongTitle(''); setSongProjectId(''); setSongKey(''); setSongBpm('');
    setSongSaving(false);
  };

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#1EA0FF' }} /></div>;

  const pendingMembers = members.filter(m => m.status === 'pending');
  const approvedMembers = members.filter(m => m.status === 'approved');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to={createPageUrl('Choir')} className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#9CB2D6' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> My Choir
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#9CB2D6' }}>Director Dashboard</p>
          <h1 className="text-xl font-bold" style={{ color: '#EAF2FF' }}>{choir?.name || '—'}</h1>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full mt-1 shrink-0"
          style={{ backgroundColor: '#9B74FF20', color: '#9B74FF', border: '1px solid #9B74FF40' }}>
          {membership?.role}
        </span>
      </div>

      {/* Invite code */}
      <Card>
        <CardHeader title="Invite Code" subtitle="Share this with singers to join your choir" />
        <div className="flex items-center gap-3">
          <div className="flex-1 h-10 px-4 rounded-lg font-mono text-lg font-bold tracking-widest flex items-center"
            style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF' }}>
            {choir?.invite_code || '—'}
          </div>
          <button onClick={copyCode}
            className="h-10 px-4 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
            style={{ backgroundColor: copied ? '#19D3A220' : '#1C2A44', color: copied ? '#19D3A2' : '#EAF2FF', border: `1px solid ${copied ? '#19D3A230' : 'transparent'}` }}>
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </button>
        </div>
      </Card>

      {/* Pending members link to dedicated page */}
      {pendingMembers.length > 0 && (
        <Card>
          <CardHeader title={`Pending Requests (${pendingMembers.length})`} />
          <Link to={`${createPageUrl('ChoirAdminMembers')}?choirId=${choir?.id}`}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-xs font-semibold transition-all"
            style={{ backgroundColor: '#FFB02020', color: '#FFB020', border: '1px solid #FFB02030' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FFB02030'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FFB02020'; }}>
            Manage Requests
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </Card>
      )}

      {/* Members list */}
      <Card>
        <CardHeader title={`Members (${approvedMembers.length})`} />
        {approvedMembers.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: '#9CB2D6' }}>No approved members yet.</p>
        ) : (
          <div className="space-y-1.5">
            {approvedMembers.map(m => (
              <div key={m.id} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg"
                style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div>
                    <p className="text-xs font-medium truncate" style={{ color: '#EAF2FF' }}>{m.user_name || m.user_email}</p>
                    <p className="text-[10px]" style={{ color: '#9CB2D6' }}>{m.user_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {m.part && m.part !== 'none' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded capitalize"
                      style={{ backgroundColor: (PART_COLORS[m.part] || '#9CB2D6') + '20', color: PART_COLORS[m.part] || '#9CB2D6' }}>
                      {m.part}
                    </span>
                  )}
                  <select
                    value={m.role}
                    onChange={e => handleMemberAction(m, 'approved', e.target.value)}
                    className="h-6 px-1.5 rounded text-[11px] font-medium focus:outline-none"
                    style={{ backgroundColor: '#1C2A44', color: '#9CB2D6', border: '1px solid #2A3A54' }}>
                    <option value="member">Member</option>
                    <option value="director">Director</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button onClick={() => handleMemberAction(m, 'removed')}
                    className="text-[11px] px-2 py-0.5 rounded" style={{ color: '#FF4D6D', backgroundColor: '#FF4D6D10' }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Post announcement */}
      <Card>
        <CardHeader title="Post Announcement" />
        <form onSubmit={handleAnnouncement} className="space-y-3">
          <input value={annTitle} onChange={e => setAnnTitle(e.target.value)} placeholder="Title"
            className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none"
            style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF', caretColor: '#1EA0FF' }} />
          <textarea value={annMsg} onChange={e => setAnnMsg(e.target.value)} placeholder="Message" rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none"
            style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF', caretColor: '#1EA0FF' }} />
          <button type="submit" disabled={annSaving || !annTitle.trim() || !annMsg.trim()}
            className="h-9 px-4 rounded-lg text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: annDone ? '#19D3A2' : '#1EA0FF', color: '#fff' }}>
            {annSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Megaphone className="w-3.5 h-3.5" />}
            {annDone ? 'Posted!' : 'Post'}
          </button>
        </form>
      </Card>

      {/* Add Song */}
      <Card>
        <CardHeader title="Add Song" />
        <form onSubmit={handleCreateSong} className="space-y-3">
          <input value={songTitle} onChange={e => setSongTitle(e.target.value)} placeholder="Song title *"
            className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none"
            style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF', caretColor: '#1EA0FF' }} />
          <div className="grid grid-cols-2 gap-2">
            <input value={songKey} onChange={e => setSongKey(e.target.value)} placeholder="Key (e.g. Bb)"
              className="h-9 px-3 rounded-lg text-sm focus:outline-none"
              style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF', caretColor: '#1EA0FF' }} />
            <input value={songBpm} onChange={e => setSongBpm(e.target.value)} placeholder="BPM"
              type="number"
              className="h-9 px-3 rounded-lg text-sm focus:outline-none"
              style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF', caretColor: '#1EA0FF' }} />
          </div>
          {projects.length > 0 && (
            <select value={songProjectId} onChange={e => setSongProjectId(e.target.value)}
              className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none"
              style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: songProjectId ? '#EAF2FF' : '#9CB2D6' }}>
              <option value="">Link to project (optional)</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          <div className="flex items-center justify-between gap-3">
            <button type="submit" disabled={songSaving || !songTitle.trim()}
              className="h-9 px-4 rounded-lg text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
              {songSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Add Song
            </button>
            <Link to={createPageUrl('ChoirSongs')} className="text-xs flex items-center gap-1" style={{ color: '#1EA0FF' }}>
              View all songs <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </form>
      </Card>

      {/* Rehearsal Progress */}
      <Card>
        <CardHeader
          title="Rehearsal Progress"
          subtitle="Member self-reported readiness per song"
          action={
            <Link to={createPageUrl('ChoirSetlists')} className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11px] font-medium"
              style={{ backgroundColor: '#1EA0FF15', color: '#1EA0FF', border: '1px solid #1EA0FF25' }}>
              <ListOrdered className="w-3 h-3" /> Setlists
            </Link>
          }
        />
        <ChoirReadinessList choirId={choir?.id} memberCount={approvedMembers.length} />
      </Card>

      {/* Songs with asset management links */}
      <Card>
        <CardHeader title="Manage Song Assets" />
        <ChoirSongsList choirId={choir?.id} />
      </Card>
    </div>
  );
}

function ChoirReadinessList({ choirId, memberCount }) {
  const [songs, setSongs] = useState([]);
  useEffect(() => {
    if (!choirId) return;
    base44.entities.ChoirSong.filter({ choir_id: choirId }, '-created_date', 20).then(setSongs).catch(() => {});
  }, [choirId]);

  if (!songs.length) return <p className="text-xs text-center py-4" style={{ color: '#9CB2D6' }}>No songs yet.</p>;

  return (
    <div className="space-y-3">
      {songs.map(s => (
        <div key={s.id}>
          <p className="text-xs font-medium mb-1.5" style={{ color: '#EAF2FF' }}>{s.title}</p>
          <SongReadinessBar songId={s.id} totalMembers={memberCount} />
        </div>
      ))}
    </div>
  );
}

function ChoirSongsList({ choirId }) {
  const [songs, setSongs] = useState([]);
  useEffect(() => {
    if (!choirId) return;
    base44.entities.ChoirSong.filter({ choir_id: choirId }, '-created_date', 20).then(setSongs).catch(() => {});
  }, [choirId]);

  if (!songs.length) return <p className="text-xs text-center py-4" style={{ color: '#9CB2D6' }}>No songs yet.</p>;

  return (
    <div className="space-y-1.5">
      {songs.map(s => (
        <Link key={s.id} to={`${createPageUrl('ChoirAdminSong')}?id=${s.id}`}
          className="flex items-center justify-between px-3 py-2.5 rounded-lg group"
          onMouseEnter={e => e.currentTarget.style.backgroundColor='#1C2A44'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}
          style={{ color: 'inherit' }}>
          <div className="flex items-center gap-2.5">
            <Music className="w-3.5 h-3.5 shrink-0" style={{ color: '#1EA0FF' }} />
            <p className="text-xs font-medium" style={{ color: '#EAF2FF' }}>{s.title}</p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: '#9CB2D6' }} />
        </Link>
      ))}
    </div>
  );
}