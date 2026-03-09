import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ArrowLeft, FolderOpen, Layers, Activity, GitCompare, Plus, X, Search, ChevronRight, Pencil, Check } from 'lucide-react';
import { format } from 'date-fns';
import Card from '../components/auralyn/Card';
import StatusBadge from '../components/auralyn/StatusBadge';

const KIND_CFG = {
  stems:     { label: 'Stems',     color: '#1EA0FF', Icon: Layers },
  reference: { label: 'Reference', color: '#19D3A2', Icon: Activity },
  match:     { label: 'Match',     color: '#9B74FF', Icon: GitCompare },
};

export default function ProjectDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = new URLSearchParams(location.search).get('id');

  const [project, setProject] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addSearch, setAddSearch] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await base44.auth.me();
        const [projects, projectJobs, allJobs] = await Promise.all([
          base44.entities.Project.filter({ id: projectId }),
          base44.entities.Job.filter({ project_id: projectId }),
          base44.entities.Job.list('-created_date', 100),
        ]);
        if (!projects.length) { navigate(createPageUrl('ProjectsList')); return; }
        const proj = projects[0];
        setProject(proj);
        setEditForm({ name: proj.name, artist_name: proj.artist_name || '', release_name: proj.release_name || '', notes: proj.notes || '' });
        setJobs(projectJobs);
        setAvailableJobs(allJobs.filter(j => !j.project_id));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [projectId]);

  const handleAddJob = async (job) => {
    await base44.entities.Job.update(job.id, { project_id: projectId });
    setJobs(prev => [...prev, { ...job, project_id: projectId }]);
    setAvailableJobs(prev => prev.filter(j => j.id !== job.id));
    setAddOpen(false);
    setAddSearch('');
  };

  const handleRemoveJob = async (job) => {
    await base44.entities.Job.update(job.id, { project_id: null });
    setJobs(prev => prev.filter(j => j.id !== job.id));
    setAvailableJobs(prev => [...prev, { ...job, project_id: null }]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await base44.entities.Project.update(projectId, editForm);
      setProject(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[40vh] text-sm" style={{ color: '#9CB2D6' }}>Loading…</div>;
  if (!project) return null;

  const grouped = { stems: [], reference: [], match: [] };
  jobs.forEach(j => { if (grouped[j.kind]) grouped[j.kind].push(j); });

  const filtered = availableJobs.filter(j => {
    const q = addSearch.toLowerCase();
    return !q || (j.title || j.input_file_name || '').toLowerCase().includes(q);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Link to={createPageUrl('ProjectsList')}
        className="inline-flex items-center gap-1.5 text-xs transition-colors"
        style={{ color: '#9CB2D6' }}
        onMouseEnter={e => e.currentTarget.style.color = '#EAF2FF'}
        onMouseLeave={e => e.currentTarget.style.color = '#9CB2D6'}>
        <ArrowLeft className="w-3.5 h-3.5" /> All projects
      </Link>

      {/* Project header */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#1EA0FF18' }}>
            <FolderOpen className="w-5 h-5" style={{ color: '#1EA0FF' }} />
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                {[
                  { key: 'name', placeholder: 'Project name' },
                  { key: 'artist_name', placeholder: 'Artist' },
                  { key: 'release_name', placeholder: 'Release / EP / Album' },
                ].map(({ key, placeholder }) => (
                  <input key={key} value={editForm[key] || ''} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="block w-full rounded px-2 h-8 text-sm outline-none"
                    style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF' }} />
                ))}
                <textarea value={editForm.notes || ''} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Notes…" rows={2}
                  className="block w-full rounded px-2 py-1.5 text-xs outline-none resize-none"
                  style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF' }} />
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving}
                    className="h-7 px-3 rounded text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                    style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
                    <Check className="w-3 h-3" /> {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="h-7 px-3 rounded text-xs border"
                    style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-base font-bold" style={{ color: '#EAF2FF' }}>{project.name}</h1>
                {project.artist_name && <p className="text-sm mt-0.5" style={{ color: '#9CB2D6' }}>{project.artist_name}</p>}
                {project.release_name && <p className="text-xs mt-0.5" style={{ color: '#9CB2D6' }}>{project.release_name}</p>}
                {project.notes && <p className="text-xs mt-2 italic leading-relaxed" style={{ color: '#9CB2D6' }}>{project.notes}</p>}
                <p className="text-[11px] mt-2" style={{ color: '#9CB2D6' }}>
                  {jobs.length} job{jobs.length !== 1 ? 's' : ''} · Updated {format(new Date(project.updated_date || project.created_date), 'MMM d, yyyy')}
                </p>
              </div>
            )}
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="p-1.5 rounded transition-colors shrink-0"
              style={{ color: '#9CB2D6' }}
              onMouseEnter={e => e.currentTarget.style.color = '#EAF2FF'}
              onMouseLeave={e => e.currentTarget.style.color = '#9CB2D6'}>
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </Card>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {[
          { kind: 'stems', page: 'StemsNew', color: '#1EA0FF', Icon: Layers },
          { kind: 'reference', page: 'ReferenceNew', color: '#19D3A2', Icon: Activity },
        ].map(({ kind, page, color, Icon }) => (
          <Link key={kind} to={`${createPageUrl(page)}?project_id=${projectId}`}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold capitalize transition-all border"
            style={{ backgroundColor: `${color}10`, borderColor: `${color}30`, color }}>
            <Icon className="w-3.5 h-3.5" /> New {kind}
          </Link>
        ))}
        <button onClick={() => setAddOpen(v => !v)}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold border transition-all"
          style={{ borderColor: addOpen ? '#1EA0FF40' : '#1C2A44', color: addOpen ? '#1EA0FF' : '#9CB2D6', backgroundColor: 'transparent' }}>
          <Plus className="w-3.5 h-3.5" /> Add existing job
        </button>
      </div>

      {/* Add existing job */}
      {addOpen && (
        <Card>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9CB2D6' }} />
            <input value={addSearch} onChange={e => setAddSearch(e.target.value)}
              placeholder="Search by title or filename…"
              autoFocus
              className="w-full pl-9 pr-3 h-9 rounded-lg text-sm outline-none"
              style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF' }}
              onFocus={e => e.target.style.borderColor = '#1EA0FF'}
              onBlur={e => e.target.style.borderColor = '#1C2A44'} />
          </div>
          {filtered.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: '#9CB2D6' }}>No unassigned jobs found.</p>
          ) : (
            <div className="space-y-1 max-h-52 overflow-y-auto">
              {filtered.slice(0, 30).map(job => {
                const cfg = KIND_CFG[job.kind] || KIND_CFG.stems;
                const KindIcon = cfg.Icon;
                return (
                  <button key={job.id} onClick={() => handleAddJob(job)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                    style={{ backgroundColor: '#0B1220' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1C2A44'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0B1220'}>
                    <div className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cfg.color}18` }}>
                      <KindIcon className="w-3 h-3" style={{ color: cfg.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate" style={{ color: '#EAF2FF' }}>
                        {job.title || job.input_file_name || 'Untitled'}
                      </p>
                      <p className="text-[11px]" style={{ color: '#9CB2D6' }}>{job.kind} · {job.status}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Jobs grouped by kind */}
      {['stems', 'reference', 'match'].map(kind => {
        const kindJobs = grouped[kind];
        if (!kindJobs.length) return null;
        const cfg = KIND_CFG[kind];
        const KindIcon = cfg.Icon;
        return (
          <Card key={kind}>
            <div className="flex items-center gap-2 mb-4">
              <KindIcon className="w-4 h-4" style={{ color: cfg.color }} />
              <h3 className="text-sm font-semibold" style={{ color: '#EAF2FF' }}>{cfg.label}</h3>
              <span className="text-[11px] px-1.5 py-0.5 rounded font-medium"
                style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}>
                {kindJobs.length}
              </span>
            </div>
            <div className="space-y-2">
              {kindJobs.map(job => (
                <div key={job.id} className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: '#EAF2FF' }}>
                      {job.title || job.input_file_name || 'Untitled'}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#9CB2D6' }}>
                      {format(new Date(job.created_date), 'MMM d')}
                      {job.mode ? ` · ${job.mode === 'four_stems' ? '4 stems' : '2 stems'}` : ''}
                      {job.clip_start_sec != null ? ` · ${Math.floor(job.clip_start_sec)}s–${Math.floor(job.clip_end_sec)}s` : ''}
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                  <Link to={`${createPageUrl('JobDetail')}?id=${job.id}`}
                    className="p-1.5 rounded transition-colors"
                    style={{ color: '#9CB2D6' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#1EA0FF'}
                    onMouseLeave={e => e.currentTarget.style.color = '#9CB2D6'}>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <button onClick={() => handleRemoveJob(job)}
                    className="p-1.5 rounded transition-colors"
                    style={{ color: '#9CB2D6' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#FF4D6D'}
                    onMouseLeave={e => e.currentTarget.style.color = '#9CB2D6'}
                    title="Remove from project">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {jobs.length === 0 && (
        <Card className="text-center py-12">
          <FolderOpen className="w-6 h-6 mx-auto mb-2 opacity-20" style={{ color: '#9CB2D6' }} />
          <p className="text-sm" style={{ color: '#9CB2D6' }}>No jobs in this project yet. Create or add one above.</p>
        </Card>
      )}
    </div>
  );
}