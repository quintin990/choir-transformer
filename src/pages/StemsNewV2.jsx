import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Loader2, Upload, Music, AlertCircle } from 'lucide-react';

export default function StemsNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = new URLSearchParams(location.search).get('project_id');

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [title, setTitle] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('');
  const [error, setError] = useState('');
  const [plan, setPlan] = useState('free');
  const [rights, setRights] = useState(false);

  // Settings state
  const [mode, setMode] = useState('two_stems');
  const [quality, setQuality] = useState('balanced');
  const [cleanupOptions, setCleanupOptions] = useState({
    remove_background_noise: false,
    reduce_clicking: false,
    reduce_hum: false,
  });

  useEffect(() => {
    base44.auth.me().catch(() => base44.auth.redirectToLogin(createPageUrl('StemsNew')));
    base44.functions.invoke('syncProfilePlan', {}).then(res => setPlan(res.data?.plan || 'free')).catch(() => {});
  }, []);

  const SUPPORTED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aiff'];
  const SUPPORTED_NAMES = ['mp3', 'wav', 'm4a', 'aiff'];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const validateFile = (f) => {
    if (!SUPPORTED_FORMATS.includes(f.type) && !SUPPORTED_NAMES.some(ext => f.name.toLowerCase().endsWith(ext))) {
      return `Only MP3, WAV, M4A, and AIFF supported.`;
    }
    if (f.size > 200 * 1024 * 1024) {
      return `Max file size is 200 MB.`;
    }
    return '';
  };

  const handleFile = (f) => {
    const err = validateFile(f);
    setFile(f);
    setFileError(err);
    if (!err) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleStart = async () => {
    if (!file || fileError || !rights) return;
    setLoading(true);
    setError('');
    try {
      setStage('Uploading file…');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      setStage('Creating job…');
      const createRes = await base44.functions.invoke('createJob', {
        kind: 'stems',
        title: title || file.name,
        input_file_url: file_url,
        input_file_name: file.name,
        input_file_size_bytes: file.size,
        input_mime: file.type,
        mode,
        quality,
        project_id: projectId || null,
        clean_audio_enabled: Object.values(cleanupOptions).some(v => v),
        clean_audio_options_json: cleanupOptions,
      });

      const jobId = createRes.data.id;
      setStage('Starting separation…');
      await base44.functions.invoke('startJob', { job_id: jobId });
      navigate(`${createPageUrl('JobDetail')}?id=${jobId}`);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || 'Something went wrong. Try again.');
      setLoading(false);
      setStage('');
    }
  };

  const canSubmit = file && !fileError && rights && !loading;

  return (
    <div className="flex gap-8 max-w-7xl mx-auto">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#EAF2FF', letterSpacing: '-0.03em' }}>
            Stem Separation
          </h1>
          <p className="text-lg" style={{ color: '#9CB2D6' }}>
            Upload a track. Auralyn isolates vocals, drums, bass, and more.
          </p>
          {plan === 'free' && (
            <p className="text-sm mt-3 flex items-center gap-1.5" style={{ color: '#6A8AAD' }}>
              Free plan · 2 jobs/day ·
              <a href={createPageUrl('Pricing')} className="underline" style={{ color: '#1EA0FF' }}>Upgrade</a>
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-lg border p-4 flex gap-3"
            style={{ backgroundColor: '#FF4D6D10', borderColor: '#FF4D6D30', color: '#FF4D6D' }}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className="rounded-xl border-2 border-dashed p-12 text-center transition-all cursor-pointer group"
          style={{
            backgroundColor: dragActive ? '#1EA0FF10' : '#0F1A2E',
            borderColor: dragActive ? '#1EA0FF' : '#1C2A44',
          }}>
          <input
            type="file"
            accept=".mp3,.wav,.m4a,.aiff,.mpeg,.x-aiff"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 transition-colors"
              style={{ color: dragActive ? '#1EA0FF' : '#6A8AAD' }} />
            <h3 className="text-lg font-bold mb-1" style={{ color: '#EAF2FF' }}>
              {file ? file.name : 'Drop audio here'}
            </h3>
            <p className="text-sm mb-4" style={{ color: '#9CB2D6' }}>
              {file ? 'Drag to replace or' : 'or'} click to browse
            </p>
            <p className="text-xs" style={{ color: '#6A8AAD' }}>
              MP3, WAV, M4A, AIFF · max 200 MB
            </p>
          </label>
        </div>

        {fileError && (
          <div className="mt-4 p-3 rounded-lg text-sm flex gap-2"
            style={{ backgroundColor: '#FF4D6D10', borderColor: '#FF4D6D30', color: '#FF4D6D', border: '1px solid #FF4D6D30' }}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {fileError}
          </div>
        )}

        {file && !fileError && (
          <div className="mt-6 p-4 rounded-lg border"
            style={{ backgroundColor: '#19D3A210', borderColor: '#19D3A230', color: '#19D3A2' }}>
            <p className="text-sm font-medium">✓ File ready for processing</p>
            <p className="text-xs mt-1 opacity-75">
              {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
        )}

        {file && (
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2" style={{ color: '#9CB2D6' }}>
              Job title
            </label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Track name…"
              className="w-full rounded-lg px-4 h-10 text-sm outline-none transition-colors"
              style={{
                backgroundColor: '#0B1220',
                border: '1px solid #1C2A44',
                color: '#EAF2FF',
              }}
              onFocus={e => e.target.style.borderColor = '#1EA0FF'}
              onBlur={e => e.target.style.borderColor = '#1C2A44'}
            />
          </div>
        )}

        {file && (
          <label className="flex items-start gap-3 cursor-pointer mt-6 p-4 rounded-lg transition-all group"
            style={{ backgroundColor: rights ? '#19D3A210' : '#0F1A2E' }}>
            <input
              type="checkbox"
              checked={rights}
              onChange={e => setRights(e.target.checked)}
              className="mt-1 w-4 h-4 cursor-pointer accent-[#1EA0FF]"
            />
            <span className="text-sm leading-relaxed" style={{ color: rights ? '#EAF2FF' : '#9CB2D6' }}>
              I confirm I have the rights to process this audio and agree to the terms of service.
            </span>
          </label>
        )}

        {file && canSubmit && (
          <button
            onClick={handleStart}
            className="w-full h-12 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all mt-6"
            style={{ backgroundColor: '#1EA0FF', color: '#fff' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#3BAEFF'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1EA0FF'}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {stage || 'Processing…'}
              </>
            ) : (
              <>
                <Music className="w-4 h-4" />
                Start Separation
              </>
            )}
          </button>
        )}
      </div>

      {/* Settings Sidebar */}
      {file && (
        <div className="w-80 shrink-0">
          <div className="rounded-xl border sticky top-24 p-6"
            style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
            <h2 className="text-lg font-bold mb-6" style={{ color: '#EAF2FF' }}>Settings</h2>

            {/* Separation Mode */}
            <div className="mb-6">
              <label className="block text-xs font-semibold mb-2.5 uppercase tracking-wide" style={{ color: '#9CB2D6' }}>
                Separation Mode
              </label>
              <div className="space-y-2">
                {[
                  { value: 'two_stems', label: '2 Stems', desc: 'Vocals + Band' },
                  { value: 'four_stems', label: '4 Stems', desc: 'Vocals + Drums + Bass + Other' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all group"
                    style={{
                      backgroundColor: mode === opt.value ? '#1EA0FF15' : '#0B1220',
                      border: `1px solid ${mode === opt.value ? '#1EA0FF' : '#1C2A44'}`,
                    }}>
                    <input
                      type="radio"
                      name="mode"
                      value={opt.value}
                      checked={mode === opt.value}
                      onChange={e => setMode(e.target.value)}
                      className="accent-[#1EA0FF]"
                    />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#EAF2FF' }}>{opt.label}</p>
                      <p className="text-xs" style={{ color: '#6A8AAD' }}>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="mb-6">
              <label className="block text-xs font-semibold mb-2.5 uppercase tracking-wide" style={{ color: '#9CB2D6' }}>
                Quality
              </label>
              <div className="space-y-2">
                {[
                  { value: 'fast', label: 'Fast', desc: 'Quick preview' },
                  { value: 'balanced', label: 'Balanced', desc: 'Recommended' },
                  { value: 'hq', label: 'High Quality', desc: 'Best results' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
                    style={{
                      backgroundColor: quality === opt.value ? '#1EA0FF15' : '#0B1220',
                      border: `1px solid ${quality === opt.value ? '#1EA0FF' : '#1C2A44'}`,
                    }}>
                    <input
                      type="radio"
                      name="quality"
                      value={opt.value}
                      checked={quality === opt.value}
                      onChange={e => setQuality(e.target.value)}
                      className="accent-[#1EA0FF]"
                    />
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#EAF2FF' }}>{opt.label}</p>
                      <p className="text-xs" style={{ color: '#6A8AAD' }}>{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Cleanup Options */}
            <div>
              <label className="block text-xs font-semibold mb-2.5 uppercase tracking-wide" style={{ color: '#9CB2D6' }}>
                Audio Cleanup
              </label>
              <div className="space-y-2.5">
                {[
                  { key: 'remove_background_noise', label: 'Remove background noise' },
                  { key: 'reduce_clicking', label: 'Reduce clicking' },
                  { key: 'reduce_hum', label: 'Reduce hum' },
                ].map(opt => (
                  <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={cleanupOptions[opt.key]}
                      onChange={e => setCleanupOptions({
                        ...cleanupOptions,
                        [opt.key]: e.target.checked,
                      })}
                      className="w-4 h-4 rounded accent-[#1EA0FF] cursor-pointer"
                    />
                    <span className="text-sm" style={{ color: '#9CB2D6' }}>{opt.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs mt-3 p-2 rounded" style={{ backgroundColor: '#1EA0FF10', color: '#6A8AAD' }}>
                💡 Cleanup options are applied after separation for cleaner results.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}