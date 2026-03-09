import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Layers } from 'lucide-react';
import Card, { CardHeader } from '../components/auralyn/Card';
import FileDropZone from '../components/auralyn/FileDropZone';
import WaveformEditor from '../components/waveform/WaveformEditor';

export default function StemsNew() {
  const navigate = useNavigate();
  const location = useLocation();
  const projectId = new URLSearchParams(location.search).get('project_id');

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState('two_stems');
  const [quality, setQuality] = useState('balanced');
  const [outputFormat, setOutputFormat] = useState('wav');
  const [rights, setRights] = useState(false);
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(null);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.me().catch(() => base44.auth.redirectToLogin('/StemsNew'));
  }, []);

  const handleFile = (f, err) => {
    setFile(f);
    setFileError(err || '');
    if (f && !err) setTitle(f.name.replace(/\.[^.]+$/, ''));
    if (!f) { setClipStart(0); setClipEnd(null); setDuration(0); }
  };

  const handleRange = ({ start, end, duration: dur }) => {
    setClipStart(start);
    setClipEnd(end);
    setDuration(dur);
  };

  const canSubmit = file && !fileError && rights && !loading && (clipEnd == null || (clipEnd - clipStart >= 5));

  const handleStart = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      setStage('Uploading file…');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      setStage('Creating job…');
      const createRes = await base44.functions.invoke('createJob', {
        kind: 'stems',
        title,
        input_file_url: file_url,
        input_file_name: file.name,
        input_file_size_bytes: file.size,
        input_mime: file.type,
        mode,
        quality,
        output_format: outputFormat,
        rights_confirmed: true,
        clip_start_sec: clipStart || 0,
        clip_end_sec: clipEnd,
        project_id: projectId || null,
      });

      const jobId = createRes.data.job_id;
      setStage('Starting separation…');
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
          <Layers className="w-4 h-4" style={{ color: '#1EA0FF' }} />
          <h1 className="text-xl font-bold" style={{ color: '#EAF2FF', letterSpacing: '-0.02em' }}>Stem Separation</h1>
        </div>
        <p className="text-sm" style={{ color: '#9CB2D6' }}>Upload a track. Auralyn isolates vocals, drums, bass, and more.</p>
        {projectId && (
          <span className="inline-flex items-center gap-1 text-[11px] mt-2 px-2 py-0.5 rounded-md font-medium"
            style={{ backgroundColor: '#1EA0FF18', color: '#1EA0FF', border: '1px solid #1EA0FF30' }}>
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
          <CardHeader title="Upload audio" subtitle="MP3, WAV, FLAC, AIFF · max 200 MB" />
          <FileDropZone file={file} onFile={handleFile} error={fileError} />
          <p className="text-xs mt-4" style={{ color: '#9CB2D6' }}>
            Files are processed securely. Outputs can be deleted after 7 days.
          </p>
        </Card>

        <Card>
          <CardHeader title="Settings" />
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CB2D6' }}>Job title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Track name…"
                className="w-full rounded-lg px-3 h-9 text-sm outline-none"
                style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF' }}
                onFocus={e => e.target.style.borderColor = '#1EA0FF'}
                onBlur={e => e.target.style.borderColor = '#1C2A44'} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CB2D6' }}>Separation mode</label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="h-9 text-sm rounded-lg" style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', color: '#EAF2FF' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="two_stems">2 Stems — Vocals + Band</SelectItem>
                  <SelectItem value="four_stems">4 Stems — Vocals + Drums + Bass + Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CB2D6' }}>Quality</label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger className="h-9 text-sm rounded-lg" style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', color: '#EAF2FF' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast — quick preview</SelectItem>
                  <SelectItem value="balanced">Balanced — recommended</SelectItem>
                  <SelectItem value="hq">High Quality — best result</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CB2D6' }}>Output format</label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger className="h-9 text-sm rounded-lg" style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', color: '#EAF2FF' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wav">WAV — lossless</SelectItem>
                  <SelectItem value="flac">FLAC — compressed lossless</SelectItem>
                  <SelectItem value="mp3">MP3 — compressed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-start gap-3 cursor-pointer pt-1">
              <input type="checkbox" checked={rights} onChange={e => setRights(e.target.checked)}
                className="mt-0.5 w-4 h-4 cursor-pointer accent-[#1EA0FF]" />
              <span className="text-xs leading-relaxed" style={{ color: rights ? '#EAF2FF' : '#9CB2D6' }}>
                I confirm I have the rights to process this audio.
              </span>
            </label>
          </div>
        </Card>
      </div>

      {/* Waveform / trim range */}
      <div className="mb-5">
        <WaveformEditor audioFile={file} onRangeChange={handleRange} maxClip={120} minClip={5} />
      </div>

      {file && clipStart != null && clipEnd != null && (
        <div className="mb-4 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: '#1EA0FF08', border: '1px solid #1EA0FF20', color: '#9CB2D6' }}>
          Processing only <span style={{ color: '#EAF2FF' }}>{Math.round(clipEnd - clipStart)}s</span> of audio.
          Process only a section to save compute — useful for testing separation quality before running the full track.
        </div>
      )}

      <button disabled={!canSubmit} onClick={handleStart}
        className="w-full h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{stage || 'Working…'}</> : 'Start Separation'}
      </button>
    </div>
  );
}