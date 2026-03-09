import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Users, Music, Calendar, Plus, ArrowRight } from 'lucide-react';

export default function ChoirDashboard() {
  const [user, setUser] = useState(null);
  const [choir, setChoir] = useState(null);
  const [membership, setMembership] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [songs, setSongs] = useState([]);
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

          const choirs = await base44.entities.Choir.filter({ id: mem.choir_id });
          if (choirs.length > 0) {
            setChoir(choirs[0]);

            const ann = await base44.entities.ChoirAnnouncement.filter({ choir_id: mem.choir_id });
            setAnnouncements(ann.slice(0, 3));

            const choirSongs = await base44.entities.ChoirSong.filter({ choir_id: mem.choir_id });
            setSongs(choirSongs.slice(0, 5));
          }
        }
      } catch (err) {
        console.error('Error loading choir:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return <div style={{ color: 'hsl(var(--color-muted))' }}>Loading choir dashboard...</div>;
  }

  if (!membership) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'hsl(var(--color-muted))' }} />
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--color-text))' }}>No Choir Yet</h2>
        <p className="mb-6" style={{ color: 'hsl(var(--color-muted))' }}>Join a choir or create one to get started</p>
        <div className="flex gap-3 justify-center">
          <Link
            to={createPageUrl('ChoirJoin')}
            className="px-4 h-10 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}
          >
            Join Choir
          </Link>
          <Link
            to={createPageUrl('ChoirCreate')}
            className="px-4 h-10 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'hsl(var(--color-input))', color: 'hsl(var(--color-text))', border: `1px solid hsl(var(--color-border))` }}
          >
            Create Choir
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--color-text))' }}>
          {choir.name}
        </h1>
        <p style={{ color: 'hsl(var(--color-muted))' }}>
          {membership.part && <span className="capitalize">Your part: <strong>{membership.part}</strong> • </span>}
          {choir.location}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Members', value: '12' },
          { label: 'Songs', value: songs.length },
          { label: 'Part', value: membership.part || 'TBD' },
          { label: 'Status', value: membership.status },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}>
            <p className="text-xs mb-1" style={{ color: 'hsl(var(--color-muted))' }}>{stat.label}</p>
            <p className="text-lg font-bold" style={{ color: 'hsl(var(--color-text))' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Announcements */}
        <div className="lg:col-span-2 rounded-lg p-6" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold" style={{ color: 'hsl(var(--color-text))' }}>Announcements</h3>
            <Link
              to={createPageUrl('Choir')}
              className="text-xs font-medium flex items-center gap-1"
              style={{ color: 'hsl(var(--color-primary))' }}
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {announcements.length === 0 ? (
            <p style={{ color: 'hsl(var(--color-muted))' }} className="text-sm">No announcements yet</p>
          ) : (
            <div className="space-y-3">
              {announcements.map(ann => (
                <div key={ann.id} className="p-3 rounded" style={{ backgroundColor: 'hsl(var(--color-background))' }}>
                  <h4 className="font-medium text-sm" style={{ color: 'hsl(var(--color-text))' }}>{ann.title}</h4>
                  <p className="text-xs mt-1" style={{ color: 'hsl(var(--color-muted))' }}>{ann.message.substring(0, 80)}...</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <Link
            to={createPageUrl('ChoirSongs')}
            className="block p-4 rounded-lg transition-all hover:shadow-md"
            style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Music className="w-4 h-4" style={{ color: 'hsl(var(--color-primary))' }} />
              <span className="font-semibold" style={{ color: 'hsl(var(--color-text))' }}>Your Songs</span>
            </div>
            <p className="text-xs" style={{ color: 'hsl(var(--color-muted))' }}>Practice your part</p>
          </Link>

          {membership.role !== 'member' && (
            <Link
              to={createPageUrl('ChoirAdmin')}
              className="block p-4 rounded-lg transition-all hover:shadow-md"
              style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" style={{ color: 'hsl(var(--color-accent))' }} />
                <span className="font-semibold" style={{ color: 'hsl(var(--color-text))' }}>Admin Panel</span>
              </div>
              <p className="text-xs" style={{ color: 'hsl(var(--color-muted))' }}>Manage choir</p>
            </Link>
          )}

          <div className="p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-input))', border: `1px solid hsl(var(--color-border))` }}>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4" style={{ color: 'hsl(var(--color-muted))' }} />
              <span className="font-semibold text-sm" style={{ color: 'hsl(var(--color-text))' }}>Next Rehearsal</span>
            </div>
            <p className="text-xs" style={{ color: 'hsl(var(--color-muted))' }}>Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}