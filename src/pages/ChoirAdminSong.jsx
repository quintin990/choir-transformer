import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Trash2, Loader2, Check, Download } from 'lucide-react';
import Card, { CardHeader } from '../components/auralyn/Card';

const PART_SCOPES = ['all', 'soprano', 'alto', 'tenor', 'bass'];
const ASSET_TYPES = ['stem', 'guide', 'satb', 'notes', 'pdf', 'link'];
const PART_COLORS = { soprano: '#1EA0FF', alto: '#19D3A2', tenor: '#FFB020', bass: '#9B74FF', all: '#9CB2D6' };

function AssetForm({ songId, choirId, jobAssets, onAdded }) {
  const [form, setForm] = useState({ name: '', url: '', type: 'stem', part_scope: 'all' });
  const [saving, setSaving] = useState(false);
  const [pickFrom, setPickFrom] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) return;
    setSaving(true);
    const res = await base44.functions.invoke('publishJobAssetsToChoir', {
      choir_song_id: songId,
      assets: [{ ...form, choir_id: choirId }],
    });
    setSaving(false);
    if (res.data?.assets?.length) {
      onAdded(res.data.assets[0]);
      setForm({ name: '', url: '', type: 'stem', part_scope: 'all' });
    }
  };

  const pickJobAsset = (ja) => {
    setForm(f => ({ ...f, name: ja.name || ja.type, url: ja.url, type: 'stem' }));
    setPickFrom(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {jobAssets.length > 0 && (
        <div>
          <button type="button" onClick={() => setPickFrom(v => v ? null : 'pick')}
            className="text-xs px-3 h-7 rounded-lg border"
            style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}>
            Pick from job outputs ▾
          </button>
          {pickFrom && (
            <div className="mt-2 rounded-lg overflow-hidden border" style={{ borderColor: '#1C2A44' }}>
              {jobAssets.map(ja => (
                <button key={ja.id} type="button" onClick={() => pickJobAsset(ja)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-left border-b"
                  style={{ borderColor: '#1C2A44', color: '#EAF2FF', backgroundColor: '#0B1220' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor='#1C2A44'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor='#0B1220'}>
                  <span>{ja.name || ja.type}</span>
                  <span style={{ color: '#9CB2D6' }}>{ja.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] block mb-1" style={{ color: '#9CB2D6' }}>Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Soprano Part"
            className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none"
            style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF', caretColor: '#1EA0FF' }} />
        </div>
        <div>
          <label className="text-[11px] block mb-1" style={{ color: '#9CB2D6' }}>Part Scope</label>
          <select value={form.part_scope} onChange={e => set('part_scope', e.target.value)}
            className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none"
            style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF' }}>
            {PART_SCOPES.map(p => <option key={p} value={p}>{p === 'all' ? 'All parts' : p}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] block mb-1" style={{ color: '#9CB2D6' }}>Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)}
            className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none"
            style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF' }}>
            {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[11px] block mb-1" style={{ color: '#9CB2D6' }}>URL *</label>
        <input value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://..."
          className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none font-mono"
          style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF', caretColor: '#1EA0FF' }} />
      </div>

      <button type="submit" disabled={saving || !form.name.trim() || !form.url.trim()}
        className="h-9 px-4 rounded-lg text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
        style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
        Publish Asset
      </button>
    </form>
  );
}

export default function ChoirAdminSong() {
  const songId = new URLSearchParams(window.location.search).get('id');
  const [song, setSong] = useState(null);
  const [assets, setAssets] = useState([]);
  const [jobAssets, setJobAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await base44.auth.me();
        const songs = await base44.entities.ChoirSong.filter({ id: songId });
        if (!songs.length) { setLoading(false); return; }
        const s = songs[0];
        setSong(s);

        const [ca, ja] = await Promise.all([
          base44.entities.ChoirAsset.filter({ choir_song_id: songId }),
          s.job_id ? base44.entities.JobAsset.filter({ job_id: s.job_id }) : Promise.resolve([]),
        ]);
        setAssets(ca);
        setJobAssets(ja);
      } catch {
        base44.auth.redirectToLogin('/ChoirAdminSong?id=' + songId);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [songId]);

  const handleDelete = async (assetId) => {
    await base44.entities.ChoirAsset.delete(assetId);
    setAssets(prev => prev.filter(a => a.id !== assetId));
  };

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#1EA0FF' }} /></div>;
  if (!song) return <div className="text-center mt-20"><p style={{ color: '#9CB2D6' }}>Song not found.</p></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link to={createPageUrl('ChoirAdmin')} className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#9CB2D6' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Director Dashboard
      </Link>

      <div>
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#9CB2D6' }}>Managing Assets</p>
        <h1 className="text-xl font-bold" style={{ color: '#EAF2FF' }}>{song.title}</h1>
        <p className="text-xs mt-0.5" style={{ color: '#9CB2D6' }}>
          {[song.key, song.bpm && `${song.bpm} BPM`, song.time_signature].filter(Boolean).join(' · ') || 'No metadata'}
        </p>
      </div>

      {/* Published assets */}
      <Card>
        <CardHeader title="Published Assets" subtitle={`${assets.length} file${assets.length !== 1 ? 's' : ''} published`} />
        {assets.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: '#9CB2D6' }}>No assets published yet.</p>
        ) : (
          <div className="space-y-2">
            {assets.map(a => {
              const color = PART_COLORS[a.part_scope] || '#9CB2D6';
              return (
                <div key={a.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ backgroundColor: '#0B1220', border: `1px solid ${color}20` }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: '#EAF2FF' }}>{a.name}</p>
                    <p className="text-[10px]" style={{ color }}>
                      {a.part_scope === 'all' ? 'All parts' : a.part_scope} · {a.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <a href={a.url} download={a.name}
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ color: '#9CB2D6', border: '1px solid #1C2A44' }}>
                      <Download className="w-3 h-3" />
                    </a>
                    <button onClick={() => handleDelete(a.id)}
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ color: '#FF4D6D', backgroundColor: '#FF4D6D10' }}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Publish new asset */}
      <Card>
        <CardHeader title="Publish New Asset" subtitle="Upload a file or link to a URL and assign it to a voice part" />
        <AssetForm
          songId={songId}
          choirId={song.choir_id}
          jobAssets={jobAssets}
          onAdded={a => setAssets(prev => [...prev, a])}
        />
      </Card>
    </div>
  );
}