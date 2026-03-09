import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Download, Music, FileText, Link2, Loader2 } from 'lucide-react';
import Card, { CardHeader } from '../components/auralyn/Card';

const PART_COLORS = { soprano: '#1EA0FF', alto: '#19D3A2', tenor: '#FFB020', bass: '#9B74FF', all: '#9CB2D6' };
const ASSET_ICONS = { stem: Music, guide: Music, satb: Music, notes: FileText, pdf: FileText, link: Link2 };

export default function ChoirSongDetail() {
  const songId = new URLSearchParams(window.location.search).get('id');
  const [song, setSong] = useState(null);
  const [assets, setAssets] = useState([]);
  const [myPart, setMyPart] = useState('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const u = await base44.auth.me();
        const mems = await base44.entities.ChoirMembership.filter({ user_id: u.id, status: 'approved' });
        if (mems.length) setMyPart(mems[0].part || 'none');

        const songs = await base44.entities.ChoirSong.filter({ id: songId });
        if (songs.length) {
          setSong(songs[0]);
          const all = await base44.entities.ChoirAsset.filter({ choir_song_id: songId });
          setAssets(all);
        }
      } catch {
        base44.auth.redirectToLogin('/ChoirSongDetail?id=' + songId);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [songId]);

  if (loading) return <div className="flex justify-center mt-20"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#1EA0FF' }} /></div>;
  if (!song) return <div className="text-center mt-20"><p style={{ color: '#9CB2D6' }}>Song not found.</p></div>;

  const visibleAssets = assets.filter(a => a.part_scope === 'all' || a.part_scope === myPart);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <Link to={createPageUrl('ChoirSongs')} className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#9CB2D6' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Songs
      </Link>

      <Card>
        <h1 className="text-xl font-bold mb-1" style={{ color: '#EAF2FF' }}>{song.title}</h1>
        <div className="flex flex-wrap gap-3 mt-2">
          {song.key && <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#1C2A44', color: '#9CB2D6' }}>Key: <strong style={{ color: '#EAF2FF' }}>{song.key}</strong></span>}
          {song.bpm && <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#1C2A44', color: '#9CB2D6' }}>BPM: <strong style={{ color: '#EAF2FF' }}>{song.bpm}</strong></span>}
          {song.time_signature && <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#1C2A44', color: '#9CB2D6' }}>Time: <strong style={{ color: '#EAF2FF' }}>{song.time_signature}</strong></span>}
        </div>
        {song.notes && (
          <p className="text-sm mt-3 leading-relaxed" style={{ color: '#9CB2D6' }}>{song.notes}</p>
        )}
      </Card>

      <Card>
        <CardHeader title="Downloads" subtitle={myPart !== 'none' ? `Showing files for ${myPart} + all parts` : 'All available files'} />
        {visibleAssets.length === 0 ? (
          <p className="text-sm text-center py-5" style={{ color: '#9CB2D6' }}>No files available for your part yet.</p>
        ) : (
          <div className="space-y-2">
            {visibleAssets.map(a => {
              const Icon = ASSET_ICONS[a.type] || Music;
              const color = PART_COLORS[a.part_scope] || '#9CB2D6';
              return (
                <div key={a.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ backgroundColor: '#0B1220', border: `1px solid ${color}20` }}>
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: '#EAF2FF' }}>{a.name}</p>
                      <p className="text-[10px]" style={{ color: '#9CB2D6' }}>
                        {a.part_scope === 'all' ? 'All parts' : a.part_scope}
                        {' · '}{a.type}
                      </p>
                    </div>
                  </div>
                  {a.type === 'link' ? (
                    <a href={a.url} target="_blank" rel="noopener noreferrer"
                      className="h-7 px-3 rounded-lg text-xs font-medium flex items-center gap-1"
                      style={{ backgroundColor: color + '18', color }}>
                      <Link2 className="w-3 h-3" /> Open
                    </a>
                  ) : (
                    <a href={a.url} download={a.name}
                      className="h-7 px-3 rounded-lg text-xs font-medium flex items-center gap-1"
                      style={{ backgroundColor: color + '18', color }}>
                      <Download className="w-3 h-3" /> Download
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}