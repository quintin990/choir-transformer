import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Activity } from 'lucide-react';
import Card, { CardHeader } from '../components/auralyn/Card';
import FileDropZone from '../components/auralyn/FileDropZone';
import WaveformEditor from '../components/waveform/WaveformEditor';
import { SongInfoCollapsible } from '../components/auralyn/SongInfoPanel';

export default function ReferenceNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = new URLSearchParams(location.search).get('project_id');

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('streaming');
  const [customLufs, setCustomLufs] = useState('-14');
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('');
  const [error, setError] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [songInfo, setSongInfo] = useState({});

  useEffect(() => {
    base44.auth.me().catch(() => base44.auth.redirectToLogin('/ReferenceNew'));
  }, []);

  const handleFile = (f, err) => {
    setFile(f);
    setFileError(err || '');
    if (f && !err) setTitle(f.name.replace(/\.[^.]+$/, ''));
    if (!f) { setClipStart(0); setClipEnd(null); }
  };

  const handleRange = ({ start, end }) => {
    setClipStart(start);
    setClipEnd(end);
  };

  const canSubmit = file && !fileError && !loading && (clipEnd == null || (clipEnd - clipStart >= 5));

  const handleStart = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      setStage('Uploading file…');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFileUrl(file_url);

      setStage('Creating job…');
      const createRes = await base44.functions.invoke('createJob', {
        kind: 'reference',
        title,
        input_file_url: file_url,
        input_file_name: file.name,
        input_file_size_bytes: file.size,
        input_mime: file.type,
        target_platform: platform,
        target_lufs: platform === 'custom' ? parseFloat(customLufs) : platform === 'streaming' ? -14 : -23,
        rights_confirmed: true,
        clip_start_sec: clipStart || 0,
        clip_end_sec: clipEnd,
        project_id: projectId || null,
        ...songInfo,
      });

      const jobId = createRes.data.job_id;
      setStage('Queuing analysis…');
      await base44.functions.invoke('startJob', { job_id: jobId });
      navigate(`${createPageUrl('JobDetail')}?id=${jobId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
      setLoading(false);
      setStage('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-7">
        <div className="flex items-center gap-2.5 mb-1.5">
          <Activity className="w-4 h-4" style={{ color: '#19D3A2' }} />
          <h1 className="text-xl font-bold" style={{ color: '#EAF2FF', letterSpacing: '-0.02em' }}>Reference Analysis</h1>
        </div>
        <p className="text-sm" style={{ color: '#9CB2D6' }}>
          Upload a reference track. Auralyn extracts loudness, tonal balance, dynamics, and stereo width.
        </p>
        {projectId && (
          <span className="inline-flex items-center gap-1 text-[11px] mt-2 px-2 py-0.5 rounded-md font-medium"
            style={{ backgroundColor: '#19D3A218', color: '#19D3A2', border: '1px solid #19D3A230' }}>
            Attached to project
          </span>
        )}
      </div>

      {error && (
        <div className="mb-5 rounded-lg border px-4 py-3 text-sm"
          style={{ backgroundColor: '#FF4D6D10', borderColor: '#FF4D6D30', color: '#FF4D6D' }}>
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <CardHeader title="Upload reference" subtitle="Any format. Full technical analysis." />
          <FileDropZone file={file} onFile={handleFile} error={fileError} />
        </Card>

        <Card>
          <CardHeader title="Analysis settings" />
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CB2D6' }}>Job title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Reference name…"
                className="w-full rounded-lg px-3 h-9 text-sm outline-none"
                style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF' }}
                onFocus={e => e.target.style.borderColor = '#19D3A2'}
                onBlur={e => e.target.style.borderColor = '#1C2A44'} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CB2D6' }}>Target platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="h-9 text-sm rounded-lg" style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', color: '#EAF2FF' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="streaming">Streaming — target −14 LUFS</SelectItem>
                  <SelectItem value="broadcast">Broadcast — target −23 LUFS</SelectItem>
                  <SelectItem value="custom">Custom target</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {platform === 'custom' && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CB2D6' }}>Target LUFS</label>
                <input type="number" value={customLufs} onChange={e => setCustomLufs(e.target.value)}
                  placeholder="-14" min="-40" max="-6" step="0.5"
                  className="w-full rounded-lg px-3 h-9 text-sm outline-none"
                  style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF' }} />
              </div>
            )}
            <div className="rounded-lg p-3 text-xs space-y-1.5" style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
              <p className="font-semibold mb-2" style={{ color: '#EAF2FF' }}>Metrics extracted</p>
              {['Integrated LUFS', 'True peak dBTP', 'Loudness range (LRA)', 'Crest factor', 'Stereo correlation', 'Tonal balance curve', 'Stereo width by band'].map(m => (
                <div key={m} className="flex items-center gap-2" style={{ color: '#9CB2D6' }}>
                  <div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: '#19D3A2' }} />
                  {m}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Waveform */}
      <div className="mb-5">
        <WaveformEditor audioFile={file} onRangeChange={handleRange} maxClip={120} minClip={5} />
      </div>

      {file && clipStart != null && clipEnd != null && (
        <div className="mb-4 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: '#19D3A208', border: '1px solid #19D3A220', color: '#9CB2D6' }}>
          Analyzing <span style={{ color: '#EAF2FF' }}>{Math.round(clipEnd - clipStart)}s</span> of audio.
          Process only a section to save compute — useful for quick reference checks before running the full track.
        </div>
      )}

      {file && (
        <div className="mb-5">
          <SongInfoCollapsible
            file={file}
            inputFileUrl={uploadedFileUrl}
            clipStart={clipStart}
            clipEnd={clipEnd}
            onDetected={d => setSongInfo({
              bpm_detected: d.bpm_detected,
              bpm_confidence: d.bpm_confidence,
              bpm_confirmed: d.bpm_confirmed ?? null,
              key_detected: d.key_detected,
              key_confidence: d.key_confidence,
              key_confirmed: d.key_confirmed ?? null,
              time_signature_detected: d.time_signature_detected,
              time_signature_confidence: d.time_signature_confidence,
              time_signature_confirmed: d.time_signature_confirmed ?? null,
            })}
          />
        </div>
      )}

      <button disabled={!canSubmit} onClick={handleStart}
        className="w-full h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#19D3A2', color: '#0B1220' }}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{stage || 'Working…'}</> : 'Analyze Reference'}
      </button>
    </div>
  );
}