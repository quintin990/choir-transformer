import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Calendar, Music, Users, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Card, { CardHeader } from '../components/auralyn/Card';
import SetlistSongRow from '../components/setlist/SetlistSongRow.jsx';

export default function SetlistManager() {
  const [user, setUser] = useState(null);
  const [choir, setChoir] = useState(null);
  const [setlist, setSetlist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [readiness, setReadiness] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingSetlist, setEditingSetlist] = useState(false);
  const [editingNotes, setEditingNotes] = useState({});
  const [error, setError] = useState(null);

  const setlistId = new URLSearchParams(window.location.search).get('id');

  useEffect(() => {
    const init = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      if (setlistId) {
        const sl = await base44.entities.Setlist.list();
        const found = sl.find(s => s.id === setlistId);
        if (found) {
          setSetlist(found);
          const c = await base44.entities.Choir.list();
          setChoir(c.find(x => x.id === found.choir_id));

          const setlistSongs = await base44.entities.SetlistSong.filter({ setlist_id: setlistId }, 'position');
          setSongs(setlistSongs);

          const readinessList = await base44.entities.SongReadiness.list();
          const map = {};
          readinessList.forEach(r => {
            if (!map[r.choir_song_id]) map[r.choir_song_id] = [];
            map[r.choir_song_id].push(r);
          });
          setReadiness(map);
        }
      }

      setLoading(false);
    };

    init();
  }, [setlistId]);

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.index === destination.index) return;

    const newSongs = Array.from(songs);
    const [moved] = newSongs.splice(source.index, 1);
    newSongs.splice(destination.index, 0, moved);

    setSongs(newSongs);

    for (let i = 0; i < newSongs.length; i++) {
      await base44.entities.SetlistSong.update(newSongs[i].id, { position: i });
    }
  };

  const updateSetlistField = async (field, value) => {
    if (!setlist) return;

    // Check for duplicate name if updating the name field
    if (field === 'name' && value !== setlist.name) {
      const existingSetlists = await base44.entities.Setlist.filter({ choir_id: choir.id });
      const isDuplicate = existingSetlists.some(s => s.id !== setlist.id && s.name.toLowerCase() === value.toLowerCase());
      if (isDuplicate) {
        setError(`A setlist named "${value}" already exists in this choir.`);
        return;
      }
    }

    setError(null);
    const updated = { ...setlist, [field]: value };
    setSetlist(updated);
    await base44.entities.Setlist.update(setlist.id, { [field]: value });
  };

  const updateSongNotes = async (songId, notes) => {
    setEditingNotes({ ...editingNotes, [songId]: notes });
    await base44.entities.SetlistSong.update(songId, { notes });
  };

  const removeSong = async (songId) => {
    setSongs(songs.filter(s => s.id !== songId));
    await base44.entities.SetlistSong.delete(songId);
  };

  if (loading) return <div className="text-center py-8" style={{ color: '#9CB2D6' }}>Loading...</div>;
  if (!setlist || !choir) return <div className="text-center py-8" style={{ color: '#EF4444' }}>Setlist not found</div>;

  const totalReadiness = songs.reduce((acc, song) => {
    const parts = readiness[song.choir_song_id] || [];
    if (parts.length === 0) return acc;
    const mastered = parts.filter(p => p.status === 'mastered').length;
    return acc + (mastered / parts.length);
  }, 0);
  const avgReadiness = songs.length > 0 ? Math.round((totalReadiness / songs.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <Link to={createPageUrl('ChoirSetlists')} className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: '#1EA0FF' }}>
        <ArrowLeft className="w-4 h-4" /> Back to Setlists
      </Link>

      <Card padding="p-6">
        <CardHeader
          title={editingSetlist ? 'Edit Setlist' : setlist.name}
          subtitle={choir.name}
        />

        {editingSetlist ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold block mb-2" style={{ color: '#9CB2D6' }}>Name</label>
              <input
                type="text"
                value={setlist.name}
                onChange={(e) => updateSetlistField('name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', color: '#EAF2FF' }}
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-2" style={{ color: '#9CB2D6' }}>Event Name</label>
              <input
                type="text"
                value={setlist.event_name || ''}
                onChange={(e) => updateSetlistField('event_name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', color: '#EAF2FF' }}
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-2" style={{ color: '#9CB2D6' }}>Event Date</label>
              <input
                type="date"
                value={setlist.event_date || ''}
                onChange={(e) => updateSetlistField('event_date', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', color: '#EAF2FF' }}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditingSetlist(false)} className="px-4 h-9 rounded-lg text-sm font-medium border" style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-xs" style={{ color: '#9CB2D6' }}>Event Date</p>
                <p className="text-sm font-semibold mt-1" style={{ color: '#EAF2FF' }}>{setlist.event_date ? new Date(setlist.event_date).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: '#9CB2D6' }}>Songs</p>
                <p className="text-sm font-semibold mt-1" style={{ color: '#EAF2FF' }}>{songs.length}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: '#9CB2D6' }}>Avg Readiness</p>
                <p className="text-sm font-semibold mt-1" style={{ color: '#1EA0FF' }}>{avgReadiness}% mastered</p>
              </div>
            </div>
            <button onClick={() => setEditingSetlist(true)} className="px-4 h-9 rounded-lg text-sm font-medium" style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
              Edit Details
            </button>
          </div>
        )}
      </Card>

      <Card padding="p-6">
        <CardHeader title="Setlist" subtitle={`${songs.length} song${songs.length !== 1 ? 's' : ''}`} />

        {songs.length === 0 ? (
          <p style={{ color: '#6A8AAD' }} className="text-sm">No songs in this setlist yet.</p>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="songs">
              {(provided, snapshot) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {songs.map((song, idx) => (
                    <Draggable key={song.id} draggableId={song.id} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <SetlistSongRow
                            song={song}
                            readiness={readiness[song.choir_song_id] || []}
                            onNotesChange={(notes) => updateSongNotes(song.id, notes)}
                            onRemove={() => removeSong(song.id)}
                            isEditing={!!editingNotes[song.id]}
                            onEditToggle={(isEdit) => {
                              if (!isEdit) {
                                const newNotes = { ...editingNotes };
                                delete newNotes[song.id];
                                setEditingNotes(newNotes);
                              }
                            }}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </Card>
    </div>
  );
}