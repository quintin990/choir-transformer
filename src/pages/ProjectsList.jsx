import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Plus, Folder, Music, Calendar, MoreVertical, Trash2 } from 'lucide-react';

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const allProjects = await base44.entities.Project.filter({ user_id: currentUser.id });
        setProjects(allProjects);
      } catch (err) {
        console.error('Error loading projects:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleDelete = async (projectId) => {
    try {
      await base44.entities.Project.delete(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  if (loading) {
    return <div style={{ color: 'hsl(var(--color-muted))' }}>Loading projects...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <Folder className="w-6 h-6" style={{ color: 'hsl(var(--color-primary))' }} />
            <h1 className="text-3xl font-bold" style={{ color: 'hsl(var(--color-text))' }}>Projects</h1>
          </div>
          <p style={{ color: 'hsl(var(--color-muted))' }}>Create and manage your music projects</p>
        </div>
        <Link
          to={createPageUrl('ProjectNew')}
          className="inline-flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-semibold transition-all"
          style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}
        >
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px dashed hsl(var(--color-border))`, borderRadius: '0.75rem', padding: '2rem' }}>
          <Folder className="w-12 h-12 mx-auto mb-4" style={{ color: 'hsl(var(--color-muted))' }} />
          <p style={{ color: 'hsl(var(--color-muted))' }} className="mb-4">No projects yet</p>
          <Link
            to={createPageUrl('ProjectNew')}
            className="inline-flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}
          >
            <Plus className="w-4 h-4" /> Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <Link
              key={project.id}
              to={`${createPageUrl('ProjectDetail')}?id=${project.id}`}
              className="rounded-lg p-5 transition-all hover:shadow-lg"
              style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1" style={{ color: 'hsl(var(--color-text))' }}>
                    {project.name}
                  </h3>
                  {project.artist_name && (
                    <p className="text-sm" style={{ color: 'hsl(var(--color-muted))' }}>
                      {project.artist_name}
                    </p>
                  )}
                </div>
                <button
                  onClick={e => {
                    e.preventDefault();
                    setDeleteId(project.id);
                  }}
                  className="p-1 rounded transition-colors"
                  style={{ color: 'hsl(var(--color-muted))' }}
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {project.release_name && (
                <p className="text-xs mb-3" style={{ color: 'hsl(var(--color-muted))' }}>
                  Release: <strong>{project.release_name}</strong>
                </p>
              )}

              <div className="flex gap-3 text-xs" style={{ color: 'hsl(var(--color-muted))' }}>
                <span className="flex items-center gap-1">
                  <Music className="w-3 h-3" /> Songs
                </span>
                {project.notes && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Has notes
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-5" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-lg p-6 max-w-sm" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'hsl(var(--color-text))' }}>Delete project?</h3>
            <p className="mb-6" style={{ color: 'hsl(var(--color-muted))' }}>
              This will permanently delete the project. Attached jobs will remain.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 h-10 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: 'hsl(var(--color-input))', color: 'hsl(var(--color-muted))', border: `1px solid hsl(var(--color-border))` }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 h-10 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: 'hsl(var(--color-destructive))', color: 'hsl(var(--color-primary-foreground))' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}