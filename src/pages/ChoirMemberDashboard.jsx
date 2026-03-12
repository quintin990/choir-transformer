import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import {
  Loader2, Music, CheckCircle2, AlertCircle, Download,
  Users, Bell, Library, ListMusic, Volume2, Play
} from 'lucide-react';
import PracticePlayer from '../components/practice/PracticePlayer';

const PART_COLORS = {
  soprano: '#1EA0FF',
  alto: '#19D3A2',
  tenor: '#F59E0B',
  bass: '#A78BFA',
  all: '#9CB2D6',
  none: '#9CB2D6',
};

const STATUS_CONFIG = {
  mastered: { icon: CheckCircle2, color: '#19D3A2', label: 'Mastered' },
  learning: { icon: Music, color: '#1EA0FF', label: 'Learning' },
  need_help: { icon: AlertCircle, color: '#F59E0B', label: 'Need Help' },
};

function PartBadge({ part }) {
  const color = PART_COLORS[part] || '#9CB2D6';
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
      style={{ backgroundColor: color + '20', color, border: `1px solid ${color}40` }}>
      {part}
    </span>
  );
}

function ReadinessButtons({ songId, current, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
        const Icon = cfg.icon;
        const active = current === key;
        return (
          <button key={key} onClick={() => onChange(songId, key)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
            style={{
              backgroundColor: active ? cfg.color + '22' : '#1C2A44',
              border: `1px solid ${active ? cfg.color : '#1C2A44'}`,
              color: active ? cfg.color : '#9CB2D6',
            }}>
            <Icon className="w-3 h-3" />
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

function AssetCard({ asset, userPart }) {
  const isMyPart = asset.part_scope === userPart || asset.part_scope === 'all';
  const color = PART_COLORS[asset.part_scope] || '#9CB2D6';
  const isAudio = asset.type === 'stem' || asset.type === 'guide' || asset.type === 'satb';

  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg gap-3"
      style={{
        backgroundColor: isMyPart ? color + '10' : '#0B1220',
        border: `1px solid ${isMyPart ? color + '40' : '#1C2A44'}`,
      }}>
      <div className="flex items-center gap-2 min-w-0">
        {isAudio ? <Volume2 className="w-3.5 h-3.5 shrink-0" style={{ color }} />
          : <Download className="w-3.5 h-3.5 shrink-0" style={{ color }} />}
        <div className="min-w-0">
          <p className="text-xs font-medium truncate" style={{ color: '#EAF2FF' }}>{asset.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <PartBadge part={asset.part_scope} />
            <span className="text-[10px]" style={{ color: '#9CB2D6' }}>{asset.type.toUpperCase()}</span>
            {isMyPart && <span className="text-[10px] font-bold" style={{ color }}>★ Your Part</span>}
          </div>
        </div>
      </div>
      <a href={asset.url} target="_blank" rel="noopener noreferrer" download={asset.name}
        className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80"
        style={{ backgroundColor: color + '20', color, border: `1px solid ${color}50` }}>
        <Download className="w-3 h-3" /> Get
      </a>
    </div>
  );
}

function SongCard({ song, assets, readiness, userPart, onReadinessChange }) {
  const [showPlayer, setShowPlayer] = useState(false);
  const status = readiness[song.id] || 'learning';
  const cfg = STATUS_CONFIG[status];
  const StatusIcon = cfg.icon;

  const audioStems = (assets[song.id] || []).filter(a =>
    ['stem', 'guide', 'satb'].includes(a.type) && a.url
  );
  const stemMap = audioStems.reduce((acc, a) => ({ ...acc, [a.name]: a.url }), {});
  const hasAudio = audioStems.length > 0;

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
      {/* Song header */}
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#EAF2FF' }}>{song.song_title || song.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <StatusIcon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
            <span className="text-xs font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasAudio && (
            <button onClick={() => setShowPlayer(v => !v)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
              style={{
                backgroundColor: showPlayer ? '#1EA0FF22' : '#1C2A44',
                color: showPlayer ? '#1EA0FF' : '#9CB2D6',
                border: `1px solid ${showPlayer ? '#1EA0FF50' : '#1C2A44'}`,
              }}>
              <Play className="w-3 h-3" /> Practice
            </button>
          )}
        </div>
      </div>

      {/* Assets */}
      {(assets[song.id] || []).length > 0 && (
        <div className="px-4 pb-3 space-y-1.5">
          {(assets[song.id] || []).map(a => (
            <AssetCard key={a.id} asset={a} userPart={userPart} />
          ))}
        </div>
      )}

      {/* Practice player */}
      {showPlayer && hasAudio && (
        <div className="px-4 pb-4">
          <PracticePlayer stems={audioStems} userPart={userPart} />
        </div>
      )}

      {/* Readiness */}
      <div className="px-4 pb-4 border-t pt-3" style={{ borderColor: '#1C2A44' }}>
        <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: '#4A6080' }}>
          Mark your readiness
        </p>
        <ReadinessButtons songId={song.id || song.choir_song_id} current={status} onChange={onReadinessChange} />
      </div>
    </div>
  );
}

export default function ChoirMemberDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [choir, setChoir] = useState(null);
  const [activeTab, setActiveTab] = useState('setlists');
  const [setlists, setSetlists] = useState([]);
  const [selectedSetlist, setSelectedSetlist] = useState(null);
  const [setlistSongs, setSetlistSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [readiness, setReadiness] = useState({});
  const [assets, setAssets] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        const mems = await base44.entities.ChoirMembership.filter({ user_id: u.id, status: 'approved' });
        if (!mems.length) { navigate(createPageUrl('Choir')); return; }
        const mem = mems[0];
        setMembership(mem);

        const [choirs, lists, songs, anns, readinessData] = await Promise.all([
          base44.entities.Choir.filter({ id: mem.choir_id }),
          base44.entities.Setlist.filter({ choir_id: mem.choir_id }),
          base44.entities.ChoirSong.filter({ choir_id: mem.choir_id }),
          base44.entities.ChoirAnnouncement.filter({ choir_id: mem.choir_id }),
          base44.entities.SongReadiness.filter({ user_id: u.id }),
        ]);

        if (choirs.length) setChoir(choirs[0]);
        setSetlists(lists);
        setAllSongs(songs);
        setAnnouncements(anns.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));

        const readinessMap = {};
        readinessData.forEach(r => { readinessMap[r.choir_song_id] = r.status; });
        setReadiness(readinessMap);

        if (lists.length) {
          setSelectedSetlist(lists[0].id);
          await loadSetlistData(lists[0].id, mem, songs);
        }

        // Pre-load assets for all songs
        await loadAllAssets(songs, mem);
      } catch {
        navigate(createPageUrl('Choir'));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadAllAssets = async (songs, mem) => {
    const assetsMap = {};
    await Promise.all(songs.map(async (song) => {
      const songAssets = await base44.entities.ChoirAsset.filter({ choir_song_id: song.id });
      assetsMap[song.id] = songAssets.filter(a =>
        a.part_scope === 'all' || a.part_scope === (mem.part || 'none')
      );
    }));
    setAssets(prev => ({ ...prev, ...assetsMap }));
  };

  const loadSetlistData = async (setlistId, mem, songs) => {
    const ss = await base44.entities.SetlistSong.filter({ setlist_id: setlistId });
    setSetlistSongs(ss);
  };

  const handleSetlistChange = async (listId) => {
    setSelectedSetlist(listId);
    await loadSetlistData(listId, membership, allSongs);
  };

  const handleReadinessChange = async (songId, status) => {
    const existing = await base44.entities.SongReadiness.filter({ choir_song_id: songId, user_id: user.id });
    if (existing.length) {
      await base44.entities.SongReadiness.update(existing[0].id, { status });
    } else {
      await base44.entities.SongReadiness.create({ choir_song_id: songId, user_id: user.id, status });
    }
    setReadiness(prev => ({ ...prev, [songId]: status }));
  };

  const setlistSongDetails = setlistSongs.map(ss => {
    const song = allSongs.find(s => s.id === ss.choir_song_id);
    return song ? { ...song, song_title: ss.song_title || song.title } : null;
  }).filter(Boolean);

  const masteredCount = allSongs.filter(s => readiness[s.id] === 'mastered').length;
  const learningCount = allSongs.filter(s => readiness[s.id] === 'learning').length;
  const needHelpCount = allSongs.filter(s => readiness[s.id] === 'need_help').length;

  if (loading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#1EA0FF' }} />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#EAF2FF', letterSpacing: '-0.03em' }}>
            {choir?.name || 'My Choir'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            {membership?.part && membership.part !== 'none' && (
              <PartBadge part={membership.part} />
            )}
            <span className="text-sm" style={{ color: '#9CB2D6' }}>
              {user?.full_name || user?.email}
            </span>
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex gap-3 shrink-0">
          {[
            { count: masteredCount, label: 'Mastered', color: '#19D3A2' },
            { count: learningCount, label: 'Learning', color: '#1EA0FF' },
            { count: needHelpCount, label: 'Need Help', color: '#F59E0B' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.count}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: '#4A6080' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: '#0B1220' }}>
        {[
          { id: 'setlists', icon: ListMusic, label: 'Setlists' },
          { id: 'library', icon: Library, label: 'Song Library' },
          { id: 'announcements', icon: Bell, label: `Updates${announcements.length ? ` (${announcements.length})` : ''}` },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                backgroundColor: active ? '#1C2A44' : 'transparent',
                color: active ? '#EAF2FF' : '#4A6080',
              }}>
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SETLISTS TAB */}
      {activeTab === 'setlists' && (
        <div className="space-y-4">
          {setlists.length === 0 ? (
            <div className="text-center py-12 rounded-xl border" style={{ borderColor: '#1C2A44' }}>
              <ListMusic className="w-8 h-8 mx-auto mb-3 opacity-20" style={{ color: '#9CB2D6' }} />
              <p className="text-sm" style={{ color: '#9CB2D6' }}>No setlists yet</p>
            </div>
          ) : (
            <>
              {/* Setlist selector */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {setlists.map(list => (
                  <button key={list.id} onClick={() => handleSetlistChange(list.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0"
                    style={{
                      backgroundColor: selectedSetlist === list.id ? '#1EA0FF' : '#0F1A2E',
                      border: `1px solid ${selectedSetlist === list.id ? '#1EA0FF' : '#1C2A44'}`,
                      color: selectedSetlist === list.id ? '#fff' : '#9CB2D6',
                    }}>
                    {list.name}
                    {list.event_date && (
                      <span className="ml-1.5 opacity-70">
                        · {new Date(list.event_date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Song cards */}
              <div className="space-y-3">
                {setlistSongDetails.length === 0 ? (
                  <p className="text-sm text-center py-8" style={{ color: '#9CB2D6' }}>No songs in this setlist</p>
                ) : (
                  setlistSongDetails.map(song => (
                    <SongCard
                      key={song.id}
                      song={song}
                      assets={assets}
                      readiness={readiness}
                      userPart={membership?.part || 'all'}
                      onReadinessChange={handleReadinessChange}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* LIBRARY TAB */}
      {activeTab === 'library' && (
        <div className="space-y-3">
          {allSongs.length === 0 ? (
            <div className="text-center py-12 rounded-xl border" style={{ borderColor: '#1C2A44' }}>
              <Music className="w-8 h-8 mx-auto mb-3 opacity-20" style={{ color: '#9CB2D6' }} />
              <p className="text-sm" style={{ color: '#9CB2D6' }}>No songs in the library yet</p>
            </div>
          ) : (
            allSongs.map(song => (
              <SongCard
                key={song.id}
                song={song}
                assets={assets}
                readiness={readiness}
                userPart={membership?.part || 'all'}
                onReadinessChange={handleReadinessChange}
              />
            ))
          )}
        </div>
      )}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (
        <div className="space-y-3">
          {announcements.length === 0 ? (
            <div className="text-center py-12 rounded-xl border" style={{ borderColor: '#1C2A44' }}>
              <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" style={{ color: '#9CB2D6' }} />
              <p className="text-sm" style={{ color: '#9CB2D6' }}>No announcements yet</p>
            </div>
          ) : (
            announcements.map(ann => (
              <div key={ann.id} className="rounded-xl border p-4"
                style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-semibold" style={{ color: '#EAF2FF' }}>{ann.title}</h3>
                  <span className="text-[10px] shrink-0" style={{ color: '#4A6080' }}>
                    {new Date(ann.created_date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#9CB2D6' }}>{ann.message}</p>
                {ann.created_by_name && (
                  <p className="text-[10px] mt-2" style={{ color: '#4A6080' }}>— {ann.created_by_name}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}