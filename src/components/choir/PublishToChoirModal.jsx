import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Upload, Loader2, Check } from 'lucide-react';

const PART_SCOPES = ['all', 'soprano', 'alto', 'tenor', 'bass'];

function buildStemAssets(job) {
  const items = [];
  if (job.stems) {
    Object.entries(job.stems).forEach(([name, url]) => {
      items.push({ key: name, name: `${name} stem`, url, type: 'stem', part_scope: 'all', enabled: true });
    });
  }
  if (job.output_zip_file) {
    items.push({ key: 'zip', name: 'All stems (ZIP)', url: job.output_zip_file, type: 'stem', part_scope: 'all', enabled: false });
  }
  return items;
}

export default function PublishToChoirModal({ job, onClose }) {
  const [songs, setSongs] = useState([]);
  const [selectedSongId, setSelectedSongId] = useState('');
  const [assetItems, setAssetItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        const mems = await base44.entities.ChoirMembership.filter({ user_id: u.id, status: 'approved' });
        const directorMem = mems.find(m => ['admin', 'director'].includes(m.role));
        if (!directorMem) { setLoading(false); return; }

        const chSongs = await base44.entities.ChoirSong.filter({ choir_id: directorMem.choir_id }, '-created_date');
        setSongs(chSongs);

        const stems = buildStemAssets(job);
        setAssetItems(stems);
      } catch (e) {
        setError('Failed to load choir data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const toggleItem = (key) => {
    setAssetItems(prev => prev.map(a => a.key === key ? { ...a, enabled: !a.enabled } : a));
  };

  const setScope = (key, scope) => {
    setAssetItems(prev => prev.map(a => a.key === key ? { ...a, part_scope: scope } : a));
  };

  const handlePublish = async () => {
    if (!selectedSongId) { setError('Select a song first'); return; }
    const toPublish = assetItems.filter(a => a.enabled);
    if (!toPublish.length) { setError('Select at least one asset'); return; }
    setSaving(true);
    setError('');
    const res = await base44.functions.invoke('publishJobAssetsToChoir', {
      choir_song_id: selectedSongId,
      assets: toPublish.map(({ name, url, type, part_scope }) => ({ name, url, type, part_scope, job_id: job.id })),
    });
    setSaving(false);
    if (res.data?.error) {
      setError(res.data.error);
    } else {
      setDone(true);
      setTimeout(onClose, 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: '#00000080' }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#0F1A2E', border: '1px solid #1C2A44' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#1C2A44' }}>
          <div>
            <p className="text-sm font-bold" style={{ color: '#EAF2FF' }}>Publish to Choir</p>
            <p className="text-xs mt-0.5" style={{ color: '#9CB2D6' }}>{job.title || 'Untitled'}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#1C2A44', color: '#9CB2D6' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#1EA0FF' }} />
          </div>
        ) : done ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#19D3A220' }}>
              <Check className="w-6 h-6" style={{ color: '#19D3A2' }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: '#EAF2FF' }}>Published successfully</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Select song */}
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: '#9CB2D6' }}>Song</label>
              {songs.length === 0 ? (
                <p className="text-xs" style={{ color: '#FFB020' }}>No choir songs yet. Create one in the Director Dashboard first.</p>
              ) : (
                <select value={selectedSongId} onChange={e => setSelectedSongId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none"
                  style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: selectedSongId ? '#EAF2FF' : '#9CB2D6' }}>
                  <option value="">Select a song…</option>
                  {songs.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              )}
            </div>

            {/* Assets */}
            {assetItems.length > 0 && (
              <div>
                <label className="text-xs font-medium block mb-1.5" style={{ color: '#9CB2D6' }}>Assets to publish</label>
                <div className="space-y-2">
                  {assetItems.map(item => (
                    <div key={item.key} className="rounded-lg px-3 py-2.5 transition-all"
                      style={{ backgroundColor: item.enabled ? '#0B1220' : '#0F1A2E', border: `1px solid ${item.enabled ? '#1EA0FF30' : '#1C2A44'}` }}>
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                          <input type="checkbox" checked={item.enabled} onChange={() => toggleItem(item.key)}
                            className="w-3.5 h-3.5 rounded" />
                          <span className="text-xs font-medium truncate" style={{ color: item.enabled ? '#EAF2FF' : '#9CB2D6' }}>
                            {item.name}
                          </span>
                        </label>
                        {item.enabled && (
                          <select value={item.part_scope} onChange={e => setScope(item.key, e.target.value)}
                            className="h-6 px-1.5 rounded text-[11px] focus:outline-none shrink-0"
                            style={{ backgroundColor: '#1C2A44', color: '#9CB2D6', border: '1px solid #2A3A54' }}>
                            {PART_SCOPES.map(p => <option key={p} value={p}>{p === 'all' ? 'All parts' : p}</option>)}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-xs" style={{ color: '#FF4D6D' }}>{error}</p>}

            <button onClick={handlePublish} disabled={saving || !selectedSongId || songs.length === 0}
              className="w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Publish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}