import React, { useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function ReferenceNew() {
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [targetPlatform, setTargetPlatform] = useState('streaming');
  const [customLufs, setCustomLufs] = useState('-14');
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 200 * 1024 * 1024) {
        alert('File must be under 200 MB');
        return;
      }
      setFile(selected);
      setJobTitle(selected.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !rightsConfirmed) {
      alert('Please select a file and confirm rights');
      return;
    }

    setLoading(true);
    try {
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      const jobRes = await base44.functions.invoke('createJob', {
        kind: 'reference',
        title: jobTitle,
        input_file_url: uploadRes.file_url,
        input_file_name: file.name,
        target_platform: targetPlatform,
        target_lufs: targetPlatform === 'custom' ? parseFloat(customLufs) : null,
      });
      window.location.href = createPageUrl(`JobDetail?id=${jobRes.data.id}`);
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2" style={{ color: '#EAF2FF', letterSpacing: '-0.03em' }}>Analyze Reference</h1>
      <p style={{ color: '#6A8AAD' }}>Upload a reference track to analyze LUFS, EQ curves, and stereo width.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* File Upload */}
        <div className="rounded-xl border p-8 text-center cursor-pointer transition-all"
          style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44', borderStyle: file ? 'solid' : 'dashed' }}
          onDragOver={e => { e.preventDefault(); }}
          onDrop={e => {
            e.preventDefault();
            const dropped = e.dataTransfer.files[0];
            if (dropped) handleFileSelect({ target: { files: [dropped] } });
          }}>
          {file ? (
            <div>
              <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: '#19D3A2' }} />
              <p style={{ color: '#EAF2FF', fontWeight: 'bold' }}>{file.name}</p>
              <p style={{ color: '#6A8AAD', fontSize: '0.875rem' }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button type="button" onClick={() => setFile(null)} className="text-xs mt-2" style={{ color: '#FF4D6D' }}>
                Remove
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: '#9CB2D6' }} />
              <p style={{ color: '#EAF2FF', fontWeight: 'bold' }}>Drag and drop your audio file</p>
              <p style={{ color: '#6A8AAD', fontSize: '0.875rem' }}>or click to browse. Max 200 MB.</p>
              <input
                type="file"
                onChange={handleFileSelect}
                accept="audio/*"
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="mt-4 inline-block px-6 h-10 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: '#1EA0FF', color: '#fff', cursor: 'pointer' }}>
                Select File
              </label>
            </>
          )}
        </div>

        {file && (
          <>
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#9CB2D6' }}>Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                className="w-full px-4 h-10 rounded-lg text-sm"
                style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', border: '1px solid #1C2A44', color: '#EAF2FF' }}
              />
            </div>

            {/* Target Platform */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#9CB2D6' }}>Target Platform</label>
              <select
                value={targetPlatform}
                onChange={e => setTargetPlatform(e.target.value)}
                className="w-full px-4 h-10 rounded-lg text-sm"
                style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', border: '1px solid #1C2A44', color: '#EAF2FF' }}
              >
                <option value="streaming">Streaming (-14 LUFS)</option>
                <option value="broadcast">Broadcast (-23 LUFS)</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {targetPlatform === 'custom' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#9CB2D6' }}>Target LUFS</label>
                <input
                  type="number"
                  value={customLufs}
                  onChange={e => setCustomLufs(e.target.value)}
                  step="0.1"
                  className="w-full px-4 h-10 rounded-lg text-sm"
                  style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', border: '1px solid #1C2A44', color: '#EAF2FF' }}
                />
              </div>
            )}

            {/* Rights Confirmation */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="rights"
                checked={rightsConfirmed}
                onChange={e => setRightsConfirmed(e.target.checked)}
                className="mt-1"
              />
              <label htmlFor="rights" style={{ color: '#9CB2D6' }}>
                I confirm I have the rights to analyze this audio
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg text-sm font-semibold transition-all"
              style={{ backgroundColor: '#1EA0FF', color: '#fff' }}
            >
              {loading ? 'Analyzing...' : 'Analyze Reference'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}