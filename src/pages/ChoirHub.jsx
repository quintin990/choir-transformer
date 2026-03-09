import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Users, Music, Settings, ChevronDown } from 'lucide-react';
import MemberVoicePartAssignment from '../components/choir/MemberVoicePartAssignment';
import RehearsalScheduler from '../components/choir/RehearsalScheduler';
import SongReadinessTracker from '../components/choir/SongReadinessTracker';
import StemMixerController from '../components/choir/StemMixerController';

const TABS = [
  { id: 'members', label: 'Members', icon: Users },
  { id: 'songs', label: 'Songs', icon: Music },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function ChoirHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'members');
  const [user, setUser] = useState(null);
  const [choir, setChoir] = useState(null);
  const [membership, setMembership] = useState(null);
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const memberships = await base44.entities.ChoirMembership.filter({
          user_id: currentUser.id,
          status: 'approved',
        });

        if (memberships.length === 0) {
          setLoading(false);
          return;
        }

        const userMembership = memberships[0];
        setMembership(userMembership);

        const choirData = await base44.entities.Choir.filter({ id: userMembership.choir_id });
        if (choirData.length > 0) {
          setChoir(choirData[0]);
        }

        const choirSongs = await base44.entities.ChoirSong.filter({
          choir_id: userMembership.choir_id,
        });
        setSongs(choirSongs);

        if (choirSongs.length > 0) {
          setSelectedSong(choirSongs[0]);
          // Fetch job data for the selected song
          const jobData = await base44.entities.Job.filter({
            id: choirSongs[0].job_id,
          });
          if (jobData.length > 0) {
            setJob(jobData[0]);
          }
        }
      } catch (err) {
        console.error('Error initializing ChoirHub:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const isDirector = membership?.role === 'director' || membership?.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p style={{ color: '#6A8AAD' }}>Loading choir data...</p>
      </div>
    );
  }

  if (!choir || !membership) {
    return (
      <div className="max-w-5xl mx-auto px-5 py-12">
        <p style={{ color: '#FF4D6D' }}>No choir found. Please join a choir first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#EAF2FF', letterSpacing: '-0.03em' }}>
          {choir.name}
        </h1>
        <p style={{ color: '#6A8AAD' }}>
          {choir.church_name && `${choir.church_name} • `}
          {choir.location}
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-4 border-b overflow-x-auto" style={{ borderColor: '#1C2A44' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchParams({ tab: tab.id });
              }}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap"
              style={{
                color: isActive ? '#EAF2FF' : '#9CB2D6',
                borderColor: isActive ? '#1EA0FF' : 'transparent',
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {/* Members Tab */}
        {activeTab === 'members' && isDirector && (
          <div className="space-y-6">
            <MemberVoicePartAssignment choirId={choir.id} />
          </div>
        )}

        {activeTab === 'members' && !isDirector && (
          <div className="rounded-xl border p-8 text-center" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
            <p style={{ color: '#6A8AAD' }}>
              Only directors can manage voice parts. Contact your choir director for more information.
            </p>
          </div>
        )}

        {/* Songs Tab */}
        {activeTab === 'songs' && (
          <div className="space-y-6">
            {/* Song selector */}
            {songs.length > 0 && (
              <div className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
                <label className="text-sm font-medium mb-3 block" style={{ color: '#EAF2FF' }}>
                  Select a song to practice
                </label>
                <div className="relative">
                  <select
                    value={selectedSong?.id || ''}
                    onChange={e => {
                      const song = songs.find(s => s.id === e.target.value);
                      setSelectedSong(song);
                      // Fetch job data
                      if (song?.job_id) {
                        base44.entities.Job.filter({ id: song.job_id }).then(jobData => {
                          if (jobData.length > 0) setJob(jobData[0]);
                        });
                      }
                    }}
                    className="w-full h-10 px-4 rounded-lg text-sm appearance-none pr-8"
                    style={{
                      backgroundColor: '#0B1220',
                      borderColor: '#1C2A44',
                      color: '#EAF2FF',
                      border: '1px solid #1C2A44',
                    }}
                  >
                    {songs.map(song => (
                      <option key={song.id} value={song.id}>
                        {song.title}
                        {song.bpm && ` • ${song.bpm} BPM`}
                        {song.key && ` • ${song.key}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: '#9CB2D6' }}
                  />
                </div>
              </div>
            )}

            {selectedSong && (
              <>
                {/* Song info */}
                <div className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#EAF2FF' }}>
                    {selectedSong.title}
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4 text-sm">
                    {selectedSong.bpm && (
                      <div>
                        <p style={{ color: '#6A8AAD' }}>Tempo</p>
                        <p className="font-semibold mt-1" style={{ color: '#EAF2FF' }}>
                          {selectedSong.bpm} BPM
                        </p>
                      </div>
                    )}
                    {selectedSong.key && (
                      <div>
                        <p style={{ color: '#6A8AAD' }}>Key</p>
                        <p className="font-semibold mt-1" style={{ color: '#EAF2FF' }}>
                          {selectedSong.key}
                        </p>
                      </div>
                    )}
                    {selectedSong.time_signature && (
                      <div>
                        <p style={{ color: '#6A8AAD' }}>Time Signature</p>
                        <p className="font-semibold mt-1" style={{ color: '#EAF2FF' }}>
                          {selectedSong.time_signature}
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedSong.notes && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: '#1C2A44' }}>
                      <p style={{ color: '#9CB2D6', fontSize: '0.875rem' }}>
                        {selectedSong.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Mixer */}
                {job && job.stems && (
                  <StemMixerController jobId={job.id} stems={job.stems} />
                )}

                {/* Readiness tracker (for directors only) */}
                {isDirector && (
                  <SongReadinessTracker choirId={choir.id} choirSongId={selectedSong.id} />
                )}

                {/* Rehearsal schedule (for directors only) */}
                {isDirector && (
                  <RehearsalScheduler choirId={choir.id} />
                )}
              </>
            )}

            {songs.length === 0 && (
              <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
                <Music className="w-8 h-8 mx-auto mb-3 opacity-50" style={{ color: '#6A8AAD' }} />
                <p style={{ color: '#6A8AAD' }}>
                  No songs in this choir yet. Your director will add songs soon.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#EAF2FF' }}>
              Choir Settings
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm" style={{ color: '#6A8AAD' }}>Choir ID</p>
                <p className="text-sm font-mono mt-1" style={{ color: '#1EA0FF' }}>
                  {choir.id}
                </p>
              </div>
              {choir.invite_code && (
                <div>
                  <p className="text-sm" style={{ color: '#6A8AAD' }}>Invite Code</p>
                  <p className="text-sm font-mono mt-1" style={{ color: '#1EA0FF' }}>
                    {choir.invite_code}
                  </p>
                </div>
              )}
              <p className="text-xs" style={{ color: '#4A6080' }}>
                {isDirector ? 'You are a director. ' : 'You are a member. '}
                Contact the choir director for additional settings.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}