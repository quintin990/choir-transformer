import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, ChevronRight, Calendar, Clock, Loader2, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '../components/auralyn/Card';

const fmtDuration = (secs) => {
  if (!secs) return null;
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}m ${s > 0 ? s + 's' : ''}`.trim();
};

export default function ChoirSetlists() {
  const [setlists, setSetlists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [membership, setMembership] = useState(null);
  const [isDirector, setIsDirector] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [newName, setNewName] = useState('');
  const [newEvent, setNewEvent] = useState('');
  const [newDate, setNewDate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        const mems = await base44.entities.ChoirMembership.filter({ user_id: u.id, status: 'approved' });
        const myMem = mems[0];
        if (!myMem) { window.location.href = createPageUrl('Choir'); return; }
        setMembership(myMem);
        setIsDirector(['admin', 'director'].includes(myMem.role));

        const [sls, ss] = await Promise.all([
          base44.entities.Setlist.filter({ choir_id: myMem.choir_id }, '-created_date'),
          base44.entities.ChoirSong.filter({ choir_id: myMem.choir_id }),
        ]);
        setSetlists(sls);
        setSongs(ss);
      } catch {
        base44.auth.redirectToLogin('/ChoirSetlists');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    const u = await base44.auth.me();
    const sl = await base44.entities.Setlist.create({
      choir_id: membership.choir_id,
      name: newName.trim(),
      event_name: newEvent.trim() || undefined,
      event_date: newDate || undefined,
      created_by_user_id: u.id,
    });
    setSetlists(prev => [sl, ...prev]);
    setNewName(''); setNewEvent(''); setNewDate('');
    setShowForm(false);
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this setlist?')) return;
    await base44.entities.Setlist.delete(id);
    setSetlists(prev => prev.filter(s => s.id !== id));
  };

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#1EA0FF' }} /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link to={createPageUrl('Choir')} className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#9CB2D6' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> My Choir
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: '#9CB2D6' }}>Performance</p>
          <h1 className="text-xl font-bold" style={{ color: '#EAF2FF' }}>Setlists</h1>
        </div>
        {isDirector && (
          <button onClick={() => setShowForm(v => !v)}
            className="h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
            <Plus className="w-3.5 h-3.5" /> New Setlist
          </button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader title="Create Setlist" />
          <form onSubmit={handleCreate} className="space-y-3">
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Setlist name *"
              className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none"
              style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF', caretColor: '#1EA0FF' }} />
            <div className="grid grid-cols-2 gap-2">
              <input value={newEvent} onChange={e => setNewEvent(e.target.value)} placeholder="Event name"
                className="h-9 px-3 rounded-lg text-sm focus:outline-none"
                style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF', caretColor: '#1EA0FF' }} />
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                className="h-9 px-3 rounded-lg text-sm focus:outline-none"
                style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: newDate ? '#EAF2FF' : '#9CB2D6', colorScheme: 'dark' }} />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving || !newName.trim()}
                className="h-8 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Create
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="h-8 px-3 rounded-lg text-xs font-medium" style={{ color: '#9CB2D6', border: '1px solid #1C2A44' }}>
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {setlists.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Calendar className="w-8 h-8 mx-auto mb-3 opacity-20" style={{ color: '#9CB2D6' }} />
            <p className="text-sm font-medium" style={{ color: '#EAF2FF' }}>No setlists yet</p>
            <p className="text-xs mt-1" style={{ color: '#9CB2D6' }}>Directors can create setlists for upcoming events.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {setlists.map(sl => (
            <SetlistCard key={sl.id} setlist={sl} songs={songs} isDirector={isDirector} onDelete={handleDelete} choirId={membership?.choir_id} />
          ))}
        </div>
      )}
    </div>
  );
}

function SetlistCard({ setlist, songs, isDirector, onDelete, choirId }) {
  const [items, setItems] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [allSongs, setAllSongs] = useState(songs);
  const [addingId, setAddingId] = useState('');
  const [addingPos, setAddingPos] = useState(null);

  useEffect(() => {
    base44.entities.SetlistSong.filter({ setlist_id: setlist.id }, 'position').then(setItems).catch(() => {});
  }, [setlist.id]);

  useEffect(() => { setAllSongs(songs); }, [songs]);

  const totalSecs = items.reduce((acc, item) => {
    const song = allSongs.find(s => s.id === item.choir_song_id);
    return acc + (song?.duration_seconds || 0);
  }, 0);

  const addSong = async () => {
    if (!addingId) return;
    const song = allSongs.find(s => s.id === addingId);
    const pos = items.length;
    const created = await base44.entities.SetlistSong.create({
      setlist_id: setlist.id,
      choir_song_id: addingId,
      song_title: song?.title || '',
      position: pos,
    });
    setItems(prev => [...prev, created]);
    setAddingId('');
    setAddingPos(null);
  };

  const removeSong = async (itemId) => {
    await base44.entities.SetlistSong.delete(itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const sortedItems = [...items].sort((a, b) => a.position - b.position);
  const availableSongs = allSongs.filter(s => !items.find(i => i.choir_song_id === s.id));

  return (
    <Card padding="p-0">
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold" style={{ color: '#EAF2FF' }}>{setlist.name}</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {setlist.event_name && (
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#1EA0FF15', color: '#1EA0FF' }}>
                  {setlist.event_name}
                </span>
              )}
              {setlist.event_date && (
                <span className="flex items-center gap-1 text-[10px]" style={{ color: '#9CB2D6' }}>
                  <Calendar className="w-3 h-3" /> {setlist.event_date}
                </span>
              )}
              <span className="text-[10px]" style={{ color: '#9CB2D6' }}>{items.length} songs</span>
              {totalSecs > 0 && (
                <span className="flex items-center gap-1 text-[10px]" style={{ color: '#19D3A2' }}>
                  <Clock className="w-3 h-3" /> {fmtDuration(totalSecs)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isDirector && (
              <button onClick={e => { e.stopPropagation(); onDelete(setlist.id); }}
                className="w-7 h-7 rounded flex items-center justify-center"
                style={{ color: '#FF4D6D', backgroundColor: '#FF4D6D10' }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronRight className="w-4 h-4 transition-transform" style={{ color: '#9CB2D6', transform: expanded ? 'rotate(90deg)' : 'none' }} />
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-4 pb-4 space-y-2" style={{ borderColor: '#1C2A44' }}>
          {/* Duration summary bar */}
          {totalSecs > 0 && (
            <div className="mt-3 p-3 rounded-lg flex items-center justify-between"
              style={{ backgroundColor: '#0B1220', border: '1px solid #19D3A230' }}>
              <div>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9CB2D6' }}>Total Duration</p>
                <p className="text-lg font-bold tabular-nums" style={{ color: '#19D3A2' }}>{fmtDuration(totalSecs)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9CB2D6' }}>Songs</p>
                <p className="text-lg font-bold" style={{ color: '#EAF2FF' }}>{items.length}</p>
              </div>
            </div>
          )}

          {/* Song list */}
          <div className="mt-2 space-y-1">
            {sortedItems.map((item, idx) => {
              const song = allSongs.find(s => s.id === item.choir_song_id);
              return (
                <div key={item.id} className="flex items-center gap-2 px-2 py-2 rounded-lg"
                  style={{ backgroundColor: '#070E1A', border: '1px solid #1C2A44' }}>
                  <span className="text-[10px] font-mono w-4 text-center shrink-0" style={{ color: '#9CB2D6' }}>{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: '#EAF2FF' }}>{item.song_title || song?.title}</p>
                    {song && (
                      <p className="text-[10px]" style={{ color: '#9CB2D6' }}>
                        {[song.key, song.bpm ? `${song.bpm} BPM` : null, song.duration_seconds ? fmtDuration(song.duration_seconds) : null].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  {isDirector && (
                    <button onClick={() => removeSong(item.id)}
                      className="w-6 h-6 flex items-center justify-center rounded shrink-0"
                      style={{ color: '#FF4D6D', backgroundColor: '#FF4D6D10' }}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {isDirector && availableSongs.length > 0 && (
            <div className="flex gap-2 mt-2">
              <select value={addingId} onChange={e => setAddingId(e.target.value)}
                className="flex-1 h-8 px-2 rounded-lg text-xs focus:outline-none"
                style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: addingId ? '#EAF2FF' : '#9CB2D6' }}>
                <option value="">Add a song…</option>
                {availableSongs.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
              <button onClick={addSong} disabled={!addingId}
                className="h-8 px-3 rounded-lg text-xs font-semibold disabled:opacity-40"
                style={{ backgroundColor: '#1EA0FF20', color: '#1EA0FF', border: '1px solid #1EA0FF30' }}>
                Add
              </button>
            </div>
          )}

          {sortedItems.length === 0 && (
            <p className="text-xs text-center py-3" style={{ color: '#9CB2D6' }}>No songs added yet.</p>
          )}
        </div>
      )}
    </Card>
  );
}