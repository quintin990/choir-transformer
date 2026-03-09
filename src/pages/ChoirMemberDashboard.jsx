import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { Loader2, Music, CheckCircle2, AlertCircle, Play, Volume2 } from 'lucide-react';
import Card from '../components/auralyn/Card';

export default function ChoirMemberDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [choir, setChoir] = useState(null);
  const [setlists, setSetlists] = useState([]);
  const [selectedSetlist, setSelectedSetlist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [readiness, setReadiness] = useState({});
  const [assets, setAssets] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);

        // Get membership
        const mems = await base44.entities.ChoirMembership.filter({ user_id: u.id, status: 'approved' });
        if (!mems.length) {
          navigate(createPageUrl('Choir'));
          return;
        }
        setMembership(mems[0]);

        // Get choir
        const choirs = await base44.entities.Choir.filter({ id: mems[0].choir_id });
        if (choirs.length) setChoir(choirs[0]);

        // Get setlists
        const lists = await base44.entities.Setlist.filter({ choir_id: mems[0].choir_id });
        setSetlists(lists);
        if (lists.length) {
          setSelectedSetlist(lists[0].id);
          await loadSetlistSongs(lists[0].id, mems[0]);
        }

        // Get readiness records
        const readinessData = await base44.entities.SongReadiness.filter({ user_id: u.id });
        const readinessMap = {};
        readinessData.forEach(r => {
          readinessMap[r.choir_song_id] = r.status;
        });
        setReadiness(readinessMap);
      } catch {
        navigate(createPageUrl('Choir'));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadSetlistSongs = async (setlistId, mem) => {
    const setlistSongs = await base44.entities.SetlistSong.filter({ setlist_id: setlistId });
    setSongs(setlistSongs);

    // Load assets for each song's part
    const assetsMap = {};
    for (const ss of setlistSongs) {
      const songAssets = await base44.entities.ChoirAsset.filter({
        choir_song_id: ss.choir_song_id,
        $or: [
          { part_scope: 'all' },
          { part_scope: mem.part || 'none' }
        ]
      });
      assetsMap[ss.choir_song_id] = songAssets;
    }
    setAssets(assetsMap);
  };

  const handleReadinessChange = async (songId, status) => {
    const existing = await base44.entities.SongReadiness.filter({
      choir_song_id: songId,
      user_id: user.id
    });

    if (existing.length) {
      await base44.entities.SongReadiness.update(existing[0].id, { status });
    } else {
      await base44.entities.SongReadiness.create({
        choir_song_id: songId,
        user_id: user.id,
        status
      });
    }

    setReadiness(prev => ({ ...prev, [songId]: status }));
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" style={{ color: '#1EA0FF' }} /></div>;

  const statusConfig = {
    mastered: { icon: CheckCircle2, color: '#19D3A2', label: 'Mastered' },
    learning: { icon: Music, color: '#1EA0FF', label: 'Learning' },
    need_help: { icon: AlertCircle, color: '#FFB020', label: 'Need Help' }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#EAF2FF' }}>{choir?.name}</h1>
        <p className="text-sm" style={{ color: '#9CB2D6' }}>
          {membership?.part && membership.part !== 'none' ? `${membership.part.charAt(0).toUpperCase() + membership.part.slice(1)} • ` : ''}
          View setlists, listen to your parts, and track readiness
        </p>
      </div>

      {/* Setlist Selector */}
      {setlists.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {setlists.map(list => (
            <button
              key={list.id}
              onClick={async () => {
                setSelectedSetlist(list.id);
                await loadSetlistSongs(list.id, membership);
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: selectedSetlist === list.id ? '#1EA0FF' : '#0F1A2E',
                borderColor: selectedSetlist === list.id ? '#1EA0FF' : '#1C2A44',
                border: '1px solid',
                color: selectedSetlist === list.id ? '#fff' : '#9CB2D6'
              }}
            >
              {list.name}
            </button>
          ))}
        </div>
      )}

      {/* Songs List */}
      <Card>
        <div className="space-y-3">
          {songs.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: '#9CB2D6' }}>No songs in this setlist yet</p>
          ) : (
            songs.map(setlistSong => {
              const status = readiness[setlistSong.choir_song_id] || 'learning';
              const cfg = statusConfig[status];
              const Icon = cfg.icon;

              return (
                <div key={setlistSong.id} className="p-4 rounded-lg border" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: '#EAF2FF' }}>{setlistSong.song_title}</h3>
                      <p className="text-xs mt-1" style={{ color: '#9CB2D6' }}>Your readiness status</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                      <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                    </div>
                  </div>

                  {/* Readiness Buttons */}
                  <div className="flex gap-2 mb-3">
                    {Object.entries(statusConfig).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => handleReadinessChange(setlistSong.choir_song_id, key)}
                        className="px-3 py-1.5 rounded text-xs font-medium transition-all"
                        style={{
                          backgroundColor: status === key ? cfg.color + '20' : '#1C2A44',
                          border: `1px solid ${status === key ? cfg.color : '#1C2A44'}`,
                          color: status === key ? cfg.color : '#9CB2D6'
                        }}
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>

                  {/* Assets */}
                  {assets[setlistSong.choir_song_id]?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs" style={{ color: '#9CB2D6' }}>Your assets</p>
                      <div className="flex gap-2 flex-wrap">
                        {assets[setlistSong.choir_song_id].map(asset => (
                          <a
                            key={asset.id}
                            href={asset.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                            style={{ backgroundColor: '#1EA0FF20', border: '1px solid #1EA0FF', color: '#1EA0FF' }}
                          >
                            <Volume2 className="w-3 h-3" />
                            {asset.type.toUpperCase()}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}