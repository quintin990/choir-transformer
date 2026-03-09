import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function ProjectNew() {
  const [formData, setFormData] = useState({
    name: '',
    artist_name: '',
    release_name: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Project name is required');
      return;
    }

    setLoading(true);
    try {
      const user = await base44.auth.me();
      const result = await base44.entities.Project.create({
        ...formData,
        user_id: user.id,
      });
      window.location.href = createPageUrl(`ProjectDetail?id=${result.id}`);
    } catch (err) {
      console.error('Error creating project:', err);
      alert('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8" style={{ color: '#EAF2FF', letterSpacing: '-0.03em' }}>New Project</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#9CB2D6' }}>Project Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 h-10 rounded-lg text-sm"
            style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', border: '1px solid #1C2A44', color: '#EAF2FF' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#9CB2D6' }}>Artist Name</label>
          <input
            type="text"
            value={formData.artist_name}
            onChange={e => setFormData({ ...formData, artist_name: e.target.value })}
            className="w-full px-4 h-10 rounded-lg text-sm"
            style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', border: '1px solid #1C2A44', color: '#EAF2FF' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#9CB2D6' }}>Release Name</label>
          <input
            type="text"
            value={formData.release_name}
            onChange={e => setFormData({ ...formData, release_name: e.target.value })}
            className="w-full px-4 h-10 rounded-lg text-sm"
            style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', border: '1px solid #1C2A44', color: '#EAF2FF' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#9CB2D6' }}>Notes</label>
          <textarea
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-3 rounded-lg text-sm"
            rows="4"
            style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', border: '1px solid #1C2A44', color: '#EAF2FF' }}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-11 rounded-lg text-sm font-semibold transition-all"
            style={{ backgroundColor: '#1EA0FF', color: '#fff' }}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 h-11 rounded-lg text-sm font-semibold border"
            style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}