import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { FolderOpen, Plus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import Card from '../components/auralyn/Card';

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await base44.auth.me();
        const data = await base44.entities.Project.list('-updated_date', 50);
        setProjects(data);
      } catch {
        base44.auth.redirectToLogin('/ProjectsList');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-7">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <FolderOpen className="w-4 h-4" style={{ color: '#1EA0FF' }} />
            <h1 className="text-xl font-bold" style={{ color: '#EAF2FF', letterSpacing: '-0.02em' }}>Projects</h1>
          </div>
          <p className="text-sm" style={{ color: '#9CB2D6' }}>Group stems, references, and mix notes by release or session</p>
        </div>
        <Link to={createPageUrl('ProjectNew')}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold transition-all"
          style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
          <Plus className="w-3.5 h-3.5" /> New Project
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm" style={{ color: '#9CB2D6' }}>Loading…</div>
      ) : projects.length === 0 ? (
        <Card className="text-center py-16">
          <FolderOpen className="w-8 h-8 mx-auto mb-3 opacity-20" style={{ color: '#9CB2D6' }} />
          <p className="text-sm font-medium mb-1" style={{ color: '#EAF2FF' }}>No projects yet</p>
          <p className="text-xs mb-5" style={{ color: '#9CB2D6' }}>
            Create a project to group your stems and references by artist or release.
          </p>
          <Link to={createPageUrl('ProjectNew')}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
            <Plus className="w-3.5 h-3.5" /> New Project
          </Link>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <Link key={project.id} to={`${createPageUrl('ProjectDetail')}?id=${project.id}`}>
              <div className="rounded-xl border p-5 transition-all hover:border-[#1EA0FF40]"
                style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#1EA0FF18' }}>
                    <FolderOpen className="w-4 h-4" style={{ color: '#1EA0FF' }} />
                  </div>
                  <ChevronRight className="w-4 h-4 mt-1 shrink-0" style={{ color: '#9CB2D6' }} />
                </div>
                <h3 className="text-sm font-semibold truncate mb-0.5" style={{ color: '#EAF2FF' }}>
                  {project.name}
                </h3>
                {project.artist_name && (
                  <p className="text-xs truncate mb-0.5" style={{ color: '#9CB2D6' }}>{project.artist_name}</p>
                )}
                {project.release_name && (
                  <p className="text-xs truncate" style={{ color: '#9CB2D6' }}>{project.release_name}</p>
                )}
                <p className="text-[11px] mt-3" style={{ color: '#9CB2D6' }}>
                  {format(new Date(project.updated_date || project.created_date), 'MMM d, yyyy')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}