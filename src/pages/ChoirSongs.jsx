import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Music, Play } from 'lucide-react';
import PracticePlayer from '../components/practice/PracticePlayer';

export default function ChoirSongs() {
  const [user, setUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const memberships = await base44.entities.ChoirMembership.filter({
          user_id: currentUser.id,
          status: 'approved'
        });

        if (memberships.length > 0) {
          const mem = memberships[0];
          setMembership(mem);

          const choirSongs = await base44.entities.ChoirSong.filter({
            choir_id: mem.choir_id
          });
          setSongs(choirSongs);
        }
      } catch (err) {
        console.error('Error loading songs:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return <div style={{ color: 'hsl(var(--color-muted))' }}>Loading songs...</div>;
  }

  if (songs.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <Music className="w-12 h-12 mx-auto mb-4" style={{ color: 'hsl(var(--color-muted))' }} />
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--color-text))' }}>No Songs Yet</h2>
        <p style={{ color: 'hsl(var(--color-muted))' }}>Your director will add songs to practice</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2.5 mb-8">
        <Music className="w-6 h-6" style={{ color: 'hsl(var(--color-primary))' }} />
        <h1 className="text-3xl font-bold" style={{ color: 'hsl(var(--color-text))' }}>Your Songs</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Song List */}
        <div className="lg:col-span-1 space-y-2 max-h-96 overflow-y-auto">
          {songs.map(song => (
            <button
              key={song.id}
              onClick={() => setSelectedSong(song)}
              className="w-full text-left p-4 rounded-lg transition-all"
              style={{
                backgroundColor: selectedSong?.id === song.id ? 'hsl(var(--color-primary) / 0.1)' : 'hsl(var(--color-card))',
                border: `1px solid ${selectedSong?.id === song.id ? 'hsl(var(--color-primary))' : 'hsl(var(--color-border))'}`,
              }}
            >
              <div className="flex items-start gap-2">
                <Play className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'hsl(var(--color-primary))' }} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm" style={{ color: 'hsl(var(--color-text))' }}>
                    {song.title}
                  </h4>
                  {song.bpm && (
                    <p className="text-xs mt-1" style={{ color: 'hsl(var(--color-muted))' }}>
                      {song.bpm} BPM • {song.key} • {song.time_signature}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Practice Player */}
        <div className="lg:col-span-2">
          {selectedSong ? (
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'hsl(var(--color-text))' }}>
                {selectedSong.title}
              </h2>
              <PracticePlayer
                stems={[
                  { name: membership.part || 'Soprano', url: null },
                  { name: 'Full Choir', url: null },
                ]}
                userPart={membership.part || 'soprano'}
                onSessionLog={session => {
                  console.log('Practice session logged:', session);
                }}
              />
              {selectedSong.notes && (
                <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}>
                  <h4 className="font-semibold text-sm mb-2" style={{ color: 'hsl(var(--color-text))' }}>Director's Notes</h4>
                  <p className="text-sm" style={{ color: 'hsl(var(--color-muted))' }}>{selectedSong.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px dashed hsl(var(--color-border))`, borderRadius: '0.75rem' }}>
              <Music className="w-8 h-8 mx-auto mb-2" style={{ color: 'hsl(var(--color-muted))' }} />
              <p style={{ color: 'hsl(var(--color-muted))' }}>Select a song to start practicing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}