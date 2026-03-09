import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';

export default function ChoirCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', church_name: '', location: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    setError('');
    const res = await base44.functions.invoke('createChoir', form);
    setLoading(false);
    if (res.data?.error) {
      setError(res.data.error);
    } else {
      navigate(createPageUrl('ChoirAdmin'));
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-6">
      <Link to={createPageUrl('Choir')} className="inline-flex items-center gap-1.5 text-xs" style={{ color: '#9CB2D6' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </Link>

      <div>
        <h1 className="text-xl font-bold mb-1" style={{ color: '#EAF2FF' }}>Create a Choir</h1>
        <p className="text-sm" style={{ color: '#9CB2D6' }}>You'll be the admin and can invite members via an invite code.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { key: 'name', label: 'Choir Name', placeholder: 'e.g. Citylight Worship Choir', required: true },
          { key: 'church_name', label: 'Church / Organisation', placeholder: 'e.g. Citylight Church' },
          { key: 'location', label: 'Location', placeholder: 'e.g. London, UK' },
        ].map(({ key, label, placeholder, required }) => (
          <div key={key}>
            <label className="text-xs font-medium block mb-1.5" style={{ color: '#9CB2D6' }}>
              {label}{required && <span style={{ color: '#FF4D6D' }}> *</span>}
            </label>
            <input
              value={form[key]}
              onChange={e => set(key, e.target.value)}
              placeholder={placeholder}
              className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none"
              style={{ backgroundColor: '#0F1A2E', border: '1px solid #1C2A44', color: '#EAF2FF', caretColor: '#1EA0FF' }}
            />
          </div>
        ))}

        <div>
          <label className="text-xs font-medium block mb-1.5" style={{ color: '#9CB2D6' }}>Description</label>
          <textarea
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="A short description of your choir..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none"
            style={{ backgroundColor: '#0F1A2E', border: '1px solid #1C2A44', color: '#EAF2FF', caretColor: '#1EA0FF' }}
          />
        </div>

        {error && <p className="text-xs" style={{ color: '#FF4D6D' }}>{error}</p>}

        <button type="submit" disabled={loading || !form.name.trim()}
          className="w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Create Choir
        </button>
      </form>
    </div>
  );
}