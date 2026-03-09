import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Folder, Plus, Music, Edit2, Save } from 'lucide-react';

export default function ProjectDetail() {
  const location = useLocation();
  const projectId = new URLSearchParams(location.search).get('id');
  const [project, setProject] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState('songs');

  useEffect(() => {
    const init = async () => {
      try {
        const proj = await base44.entities.Project.filter({ id: projectId });
        if (proj.length > 0) {
          setProject(proj[0]);
          setFormData(proj[0]);

          const projectItems = await base44.entities.ProjectItem.filter({ project_id: projectId });
          const jobIds = projectItems.map(pi => pi.job_id);
          
          if (jobIds.length > 0) {
            const allJobs = await base44.entities.Job.filter({});
            setJobs(allJobs.filter(j => jobIds.includes(j.id)));
          }
        }
      } catch (err) {
        console.error('Error loading project:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [projectId]);

  const handleSave = async () => {
    try {
      await base44.entities.Project.update(projectId, formData);
      setProject(formData);
      setEditing(false);
    } catch (err) {
      console.error('Error saving project:', err);
    }
  };

  if (loading || !project) {
    return <div style={{ color: 'hsl(var(--color-muted))' }}>Loading project...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Folder className="w-8 h-8 mt-1" style={{ color: 'hsl(var(--color-primary))' }} />
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: 'hsl(var(--color-text))' }}>
              {project.name}
            </h1>
            {project.artist_name && (
              <p style={{ color: 'hsl(var(--color-muted))' }}>{project.artist_name}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="p-2 rounded-lg transition-all"
          style={{ backgroundColor: 'hsl(var(--color-input))', color: 'hsl(var(--color-primary))' }}
        >
          {editing ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b" style={{ borderColor: 'hsl(var(--color-border))' }}>
        {[
          { id: 'songs', label: 'Songs' },
          { id: 'notes', label: 'Notes' },
          { id: 'metadata', label: 'Metadata' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-3 text-sm font-medium border-b-2 transition-colors"
            style={{
              color: activeTab === tab.id ? 'hsl(var(--color-primary))' : 'hsl(var(--color-muted))',
              borderColor: activeTab === tab.id ? 'hsl(var(--color-primary))' : 'transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-lg p-6" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}>
        {activeTab === 'songs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'hsl(var(--color-text))' }}>
                Songs & Jobs ({jobs.length})
              </h3>
              <Link
                to={`${createPageUrl('StemsNew')}?project_id=${projectId}`}
                className="inline-flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-medium"
                style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}
              >
                <Plus className="w-4 h-4" /> Add Stems
              </Link>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'hsl(var(--color-muted))' }}>
                <Music className="w-8 h-8 mx-auto mb-2" style={{ opacity: 0.5 }} />
                <p className="text-sm mb-3">No songs added yet</p>
                <Link
                  to={`${createPageUrl('StemsNew')}?project_id=${projectId}`}
                  className="inline-flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}
                >
                  <Plus className="w-4 h-4" /> Create First Song
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {jobs.map(job => (
                  <Link
                    key={job.id}
                    to={`${createPageUrl('JobDetail')}?id=${job.id}`}
                    className="p-4 rounded-lg transition-all hover:bg-opacity-75"
                    style={{ backgroundColor: 'hsl(var(--color-background))' }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium" style={{ color: 'hsl(var(--color-text))' }}>
                          {job.title}
                        </h4>
                        <p className="text-xs mt-1" style={{ color: 'hsl(var(--color-muted))' }}>
                          {job.mode} • {job.quality} • {job.status}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'hsl(var(--color-primary) / 0.1)', color: 'hsl(var(--color-primary))' }}>
                        {job.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'hsl(var(--color-text))' }}>Notes</h3>
            {editing ? (
              <textarea
                value={formData.notes || ''}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                rows="8"
                className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{ backgroundColor: 'hsl(var(--color-input))', border: `1px solid hsl(var(--color-border))`, color: 'hsl(var(--color-text))' }}
              />
            ) : (
              <p style={{ color: project.notes ? 'hsl(var(--color-text))' : 'hsl(var(--color-muted))' }} className="whitespace-pre-wrap">
                {project.notes || 'No notes yet'}
              </p>
            )}
          </div>
        )}

        {activeTab === 'metadata' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(var(--color-text))' }}>Project Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                disabled={!editing}
                className="w-full h-10 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: editing ? 'hsl(var(--color-input))' : 'hsl(var(--color-background))', border: `1px solid hsl(var(--color-border))`, color: 'hsl(var(--color-text))' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(var(--color-text))' }}>Artist Name</label>
              <input
                type="text"
                value={formData.artist_name}
                onChange={e => setFormData({ ...formData, artist_name: e.target.value })}
                disabled={!editing}
                className="w-full h-10 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: editing ? 'hsl(var(--color-input))' : 'hsl(var(--color-background))', border: `1px solid hsl(var(--color-border))`, color: 'hsl(var(--color-text))' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(var(--color-text))' }}>Release Name</label>
              <input
                type="text"
                value={formData.release_name}
                onChange={e => setFormData({ ...formData, release_name: e.target.value })}
                disabled={!editing}
                className="w-full h-10 px-3 rounded-lg text-sm outline-none"
                style={{ backgroundColor: editing ? 'hsl(var(--color-input))' : 'hsl(var(--color-background))', border: `1px solid hsl(var(--color-border))`, color: 'hsl(var(--color-text))' }}
              />
            </div>

            {editing && (
              <button
                onClick={handleSave}
                className="w-full h-10 rounded-lg text-sm font-semibold mt-6"
                style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}
              >
                Save Changes
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}