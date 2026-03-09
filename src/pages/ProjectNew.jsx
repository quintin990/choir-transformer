import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import Card from '../components/auralyn/Card';

const FIELDS = [
  { key: 'name', label: 'Project name', placeholder: 'e.g. Album mix session', required: true },
  { key: 'artist_name', label: 'Artist', placeholder: 'e.g. The Band' },
  { key: 'release_name', label: 'Release / EP / Album', placeholder: 'e.g. First Light EP' },
];

export default function ProjectNew() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', artist_name: '', release_name: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin('/ProjectNew'));
  }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Project name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const project = await base44.entities.Project.create({ ...form, user_id: user?.id || '' });
      navigate(`${createPageUrl('ProjectDetail')}?id=${project.id}`);
    } catch {
      setError('Failed to create project. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Link to={createPageUrl('ProjectsList')}
        className="inline-flex items-center gap-1.5 text-xs mb-6 transition-colors"
        style={{ color: '#9CB2D6' }}
        onMouseEnter={e => e.currentTarget.style.color = '#EAF2FF'}
        onMouseLeave={e => e.currentTarget.style.color = '#9CB2D6'}>
        <ArrowLeft className="w-3.5 h-3.5" /> All projects
      </Link>

      <div className="flex items-center gap-2.5 mb-6">
        <FolderOpen className="w-4 h-4" style={{ color: '#1EA0FF' }} />
        <h1 className="text-xl font-bold" style={{ color: '#EAF2FF', letterSpacing: '-0.02em' }}>New Project</h1>
      </div>

      <Card>
        <div className="space-y-4">
          {FIELDS.map(({ key, label, placeholder, required }) => (
            <div key={key}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CB2D6' }}>
                {label}{required && <span style={{ color: '#FF4D6D' }}> *</span>}
              </label>
              <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full rounded-lg px-3 h-9 text-sm outline-none"
                style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF' }}
                onFocus={e => e.target.style.borderColor = '#1EA0FF'}
                onBlur={e => e.target.style.borderColor = '#1C2A44'}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CB2D6' }}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="BPM, key, engineer notes, session goals…"
              rows={3} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
              style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF' }}
              onFocus={e => e.target.style.borderColor = '#1EA0FF'}
              onBlur={e => e.target.style.borderColor = '#1C2A44'} />
          </div>

          {error && <p className="text-xs" style={{ color: '#FF4D6D' }}>{error}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 h-10 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
              style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
              {saving ? 'Creating…' : 'Create Project'}
            </button>
            <Link to={createPageUrl('ProjectsList')}
              className="h-10 px-5 rounded-lg text-sm font-semibold flex items-center border transition-all"
              style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}>
              Cancel
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}