import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, FolderOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const user = await base44.auth.me();
        const userProjects = await base44.entities.Project.filter({ user_id: user.id });
        setProjects(userProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await base44.entities.Project.delete(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  if (loading) {
    return <div style={{ color: '#6A8AAD' }}>Loading projects...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#EAF2FF', letterSpacing: '-0.03em' }}>Projects</h1>
        <Link to={createPageUrl('ProjectNew')} className="flex items-center gap-2 px-6 h-10 rounded-lg text-sm font-semibold transition-all"
          style={{ backgroundColor: '#1EA0FF', color: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor='#3BAEFF'} onMouseLeave={e => e.currentTarget.style.backgroundColor='#1EA0FF'}>
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border p-12 text-center" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
          <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" style={{ color: '#6A8AAD' }} />
          <p style={{ color: '#6A8AAD' }}>No projects yet. Create one to organize your work.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {projects.map(project => (
            <Link key={project.id} to={createPageUrl(`ProjectDetail?id=${project.id}`)}
              className="rounded-xl border p-6 transition-all group"
              style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='#1EA0FF40'} onMouseLeave={e => e.currentTarget.style.borderColor='#1C2A44'}>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#EAF2FF' }}>{project.name}</h3>
              {project.artist_name && <p style={{ color: '#6A8AAD', fontSize: '0.875rem' }}>By {project.artist_name}</p>}
              {project.release_name && <p style={{ color: '#6A8AAD', fontSize: '0.875rem' }}>Release: {project.release_name}</p>}
              <div className="mt-4 flex items-center justify-between">
                <span style={{ color: '#9CB2D6', fontSize: '0.875rem' }}>
                  Last updated: {new Date(project.updated_date).toLocaleDateString()}
                </span>
                <button onClick={(e) => {
                  e.preventDefault();
                  handleDelete(project.id);
                }} className="p-2 rounded hover:bg-red-500 hover:bg-opacity-10 transition-all">
                  <Trash2 className="w-4 h-4" style={{ color: '#FF4D6D' }} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}