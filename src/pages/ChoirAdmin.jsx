import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Music, Calendar, Mic2, CheckCircle2, Clock, Trash2 } from 'lucide-react';

export default function ChoirAdmin() {
  const [user, setUser] = useState(null);
  const [choir, setChoir] = useState(null);
  const [members, setMembers] = useState([]);
  const [songs, setSongs] = useState([]);
  const [activeTab, setActiveTab] = useState('members');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const memberships = await base44.entities.ChoirMembership.filter({
          user_id: currentUser.id,
        });

        if (memberships.length > 0) {
          const mem = memberships[0];
          const choirs = await base44.entities.Choir.filter({ id: mem.choir_id });
          if (choirs.length > 0) {
            setChoir(choirs[0]);

            const allMembers = await base44.entities.ChoirMembership.filter({
              choir_id: mem.choir_id
            });
            setMembers(allMembers);

            const choirSongs = await base44.entities.ChoirSong.filter({
              choir_id: mem.choir_id
            });
            setSongs(choirSongs);
          }
        }
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const approveMember = async (memberId) => {
    try {
      await base44.entities.ChoirMembership.update(memberId, { status: 'approved' });
      setMembers(members.map(m => m.id === memberId ? { ...m, status: 'approved' } : m));
    } catch (err) {
      console.error('Error approving member:', err);
    }
  };

  const removeMember = async (memberId) => {
    try {
      await base44.entities.ChoirMembership.delete(memberId);
      setMembers(members.filter(m => m.id !== memberId));
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  if (loading || !choir) {
    return <div style={{ color: 'hsl(var(--color-muted))' }}>Loading admin panel...</div>;
  }

  const pendingMembers = members.filter(m => m.status === 'pending');
  const approvedMembers = members.filter(m => m.status === 'approved');

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--color-text))' }}>
          {choir.name} Admin
        </h1>
        <p style={{ color: 'hsl(var(--color-muted))' }}>Manage your choir</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b" style={{ borderColor: 'hsl(var(--color-border))' }}>
        {[
          { id: 'members', label: 'Members', icon: Users },
          { id: 'songs', label: 'Songs', icon: Music },
          { id: 'schedule', label: 'Schedule', icon: Calendar },
          { id: 'setlists', label: 'Setlists', icon: Mic2 },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2"
              style={{
                color: activeTab === tab.id ? 'hsl(var(--color-primary))' : 'hsl(var(--color-muted))',
                borderColor: activeTab === tab.id ? 'hsl(var(--color-primary))' : 'transparent',
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {pendingMembers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--color-text))' }}>
                <Clock className="w-5 h-5 inline mr-2" /> Pending Approval ({pendingMembers.length})
              </h3>
              <div className="space-y-2">
                {pendingMembers.map(member => (
                  <div
                    key={member.id}
                    className="p-4 rounded-lg flex items-center justify-between"
                    style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}
                  >
                    <div>
                      <p className="font-medium" style={{ color: 'hsl(var(--color-text))' }}>{member.user_name}</p>
                      <p className="text-sm" style={{ color: 'hsl(var(--color-muted))' }}>{member.user_email}</p>
                    </div>
                    <button
                      onClick={() => approveMember(member.id)}
                      className="px-3 h-9 rounded-lg text-sm font-medium flex items-center gap-2"
                      style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--color-text))' }}>
              <Users className="w-5 h-5 inline mr-2" /> Members ({approvedMembers.length})
            </h3>
            <div className="space-y-2">
              {approvedMembers.map(member => (
                <div
                  key={member.id}
                  className="p-4 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}
                >
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: 'hsl(var(--color-text))' }}>
                      {member.user_name}
                      {member.role !== 'member' && (
                        <span className="ml-2 text-xs px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: 'hsl(var(--color-primary) / 0.1)', color: 'hsl(var(--color-primary))' }}>
                          {member.role}
                        </span>
                      )}
                    </p>
                    <p className="text-sm" style={{ color: 'hsl(var(--color-muted))' }}>
                      {member.part && <span className="capitalize">{member.part}</span>}
                    </p>
                  </div>
                  {member.role === 'member' && (
                    <button
                      onClick={() => removeMember(member.id)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: 'hsl(var(--color-destructive))' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Songs Tab */}
      {activeTab === 'songs' && (
        <div>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--color-text))' }}>
            <Music className="w-5 h-5 inline mr-2" /> Songs ({songs.length})
          </h3>
          {songs.length === 0 ? (
            <p style={{ color: 'hsl(var(--color-muted))' }} className="text-center py-8">No songs yet</p>
          ) : (
            <div className="space-y-2">
              {songs.map(song => (
                <div
                  key={song.id}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}
                >
                  <h4 className="font-medium" style={{ color: 'hsl(var(--color-text))' }}>{song.title}</h4>
                  {song.bpm && (
                    <p className="text-sm" style={{ color: 'hsl(var(--color-muted))' }}>
                      {song.bpm} BPM • {song.key} • {song.time_signature}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Schedule & Setlists Tabs - Coming Soon */}
      {(activeTab === 'schedule' || activeTab === 'setlists') && (
        <div className="text-center py-12" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px dashed hsl(var(--color-border))`, borderRadius: '0.75rem' }}>
          <p style={{ color: 'hsl(var(--color-muted))' }}>Coming soon</p>
        </div>
      )}
    </div>
  );
}