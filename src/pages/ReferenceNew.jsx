import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Loader2, BarChart3, Lock, AlertCircle, ChevronDown } from 'lucide-react';
import Card, { CardHeader } from '../components/auralyn/Card';
import FileDropZone from '../components/auralyn/FileDropZone';
import WaveformInteractive from '../components/waveform/WaveformInteractive';
import { SongInfoCollapsible } from '../components/auralyn/SongInfoPanel';
import CleanAudioPanel from '../components/auralyn/CleanAudioPanel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProBadge } from '../components/auralyn/ProBadge';

export default function ReferenceNew() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [title, setTitle] = useState('');
  const [targetPlatform, setTargetPlatform] = useState('streaming');
  const [customLufs, setCustomLufs] = useState(-14);
  const [rights, setRights] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('');
  const [error, setError] = useState('');
  const [plan, setPlan] = useState('free');
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [songInfo, setSongInfo] = useState({});
  const [cleanEnabled, setCleanEnabled] = useState(false);
  const [cleanOptions, setCleanOptions] = useState({});
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(null);
  const [duration, setDuration] = useState(0);
  const [expandedSettings, setExpandedSettings] = useState(true);

  useEffect(() => {
    base44.auth.me().catch(() => base44.auth.redirectToLogin('/reference/new'));
    base44.functions.invoke('syncProfilePlan', {}).then(res => setPlan(res.data?.plan || 'free')).catch(() => {});
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

  const targetLufs = targetPlatform === 'streaming' ? -14 : targetPlatform === 'broadcast' ? -23 : customLufs;
  const canSubmit = file && !fileError && rights && !loading;

  const handleStart = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      setStage('Uploading file…');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFileUrl(file_url);

      setStage('Creating analysis job…');
      const createRes = await base44.functions.invoke('createJob', {
        kind: 'reference',
        title,
        input_file_url: file_url,
        input_file_name: file.name,
        input_file_size_bytes: file.size,
        input_mime: file.type,
        target_platform: targetPlatform,
        target_lufs: targetLufs,
        clip_start_sec: clipStart || 0,
        clip_end_sec: clipEnd,
        clean_audio_enabled: cleanEnabled,
        clean_audio_options_json: cleanEnabled ? cleanOptions : null,
        rights_confirmed: true,
        ...songInfo,
      });

      const jobId = createRes.data.job_id;
      setStage('Starting analysis…');
      await base44.functions.invoke('startJob', { job_id: jobId });
      navigate(`${createPageUrl('JobDetail')}?id=${jobId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
      setLoading(false);
      setStage('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <BarChart3 className="w-5 h-5" style={{ color: 'hsl(var(--color-primary))' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'hsl(var(--color-text))' }}>Reference Analysis</h1>
        </div>
        <p className="text-base mb-2" style={{ color: 'hsl(var(--color-muted))' }}>Upload a reference track to measure LUFS, EQ, stereo width, BPM, key and more.</p>
        {plan === 'free' && (
          <p className="text-sm flex items-center gap-1.5" style={{ color: 'hsl(var(--color-muted))' }}>
            Free plan includes basic analysis ·
            <a href={createPageUrl('Pricing')} className="underline font-medium" style={{ color: 'hsl(var(--color-primary))' }}>Pro for advanced metrics</a>
          </p>
        )}
        {plan === 'pro' && (
          <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: 'hsl(var(--color-accent))' }}>
            ✓ Pro — Full analysis suite
          </span>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border px-4 py-3 text-sm" style={{ backgroundColor: 'hsl(var(--color-destructive) / 0.1)', borderColor: 'hsl(var(--color-destructive) / 0.3)', color: 'hsl(var(--color-destructive))' }}>
          {error}
        </div>
      )}

      {/* Upload & Trim */}
      <Card className="mb-6">
        <CardHeader title="Upload Reference" subtitle="MP3, WAV, FLAC, AIFF · max 200 MB" />
        <FileDropZone file={file} onFile={handleFile} error={fileError} />
        <p className="text-xs mt-4" style={{ color: 'hsl(var(--color-muted))' }}>
          We'll measure LUFS, crest factor, loudness range, spectral balance and stereo width.
        </p>

        {/* Waveform */}
        {file && (
          <div className="mt-6">
            <div className="mb-3">
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--color-text))' }}>Trim to analyze a section (optional)</h3>
              <p className="text-xs" style={{ color: 'hsl(var(--color-muted))' }}>Leave full or drag to analyze part of the track.</p>
            </div>
            <WaveformInteractive audioFile={file} onRangeChange={handleRange} maxClip={300} minClip={5} />
          </div>
        )}
      </Card>

      {/* Settings */}
      <Card className="mb-6">
        <div onClick={() => setExpandedSettings(!expandedSettings)} className="flex items-center justify-between cursor-pointer p-5 border-b" style={{ borderColor: 'hsl(var(--color-border))' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'hsl(var(--color-text))' }}>Analysis Settings</h3>
          <ChevronDown className="w-5 h-5 transition-transform" style={{ transform: expandedSettings ? 'rotate(180deg)' : '', color: 'hsl(var(--color-muted))' }} />
        </div>

        {expandedSettings && (
          <div className="p-5 space-y-5">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(var(--color-text))' }}>Job title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Reference track name…"
                className="w-full rounded-lg px-3 h-10 text-sm outline-none" style={{ backgroundColor: 'hsl(var(--color-input))', border: `1px solid hsl(var(--color-border))`, color: 'hsl(var(--color-text))' }}
                onFocus={e => e.target.style.borderColor = 'hsl(var(--color-primary))'}
                onBlur={e => e.target.style.borderColor = 'hsl(var(--color-border))'} />
            </div>

            {/* Target Platform */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(var(--color-text))' }}>Target platform</label>
              <Select value={targetPlatform} onValueChange={setTargetPlatform}>
                <SelectTrigger className="h-10 text-sm rounded-lg" style={{ backgroundColor: 'hsl(var(--color-input))', borderColor: 'hsl(var(--color-border))', color: 'hsl(var(--color-text))' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="streaming">Streaming (−14 LUFS)</SelectItem>
                  <SelectItem value="broadcast">Broadcast (−23 LUFS)</SelectItem>
                  <SelectItem value="custom">Custom LUFS</SelectItem>
                </SelectContent>
              </Select>
              {targetPlatform === 'custom' && (
                <div className="mt-3">
                  <label className="block text-xs mb-2" style={{ color: 'hsl(var(--color-muted))' }}>Target LUFS</label>
                  <input type="number" value={customLufs} onChange={e => setCustomLufs(parseFloat(e.target.value))}
                    className="w-full rounded-lg px-3 h-10 text-sm outline-none" style={{ backgroundColor: 'hsl(var(--color-input))', border: `1px solid hsl(var(--color-border))`, color: 'hsl(var(--color-text))' }} />
                </div>
              )}
            </div>

            {/* Clean Audio */}
            <div className="border-t pt-4" style={{ borderColor: 'hsl(var(--color-border))' }}>
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input type="checkbox" checked={cleanEnabled} onChange={e => setCleanEnabled(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-[hsl(var(--color-primary))]" />
                <span className="text-sm font-medium" style={{ color: 'hsl(var(--color-text))' }}>Pre-process reference audio</span>
              </label>
              {cleanEnabled && (
                <div className="ml-7 space-y-2 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={cleanOptions.denoise || false}
                      onChange={e => setCleanOptions({ ...cleanOptions, denoise: e.target.checked })}
                      className="w-4 h-4 cursor-pointer accent-[hsl(var(--color-primary))]" />
                    <span style={{ color: 'hsl(var(--color-muted))' }}>Denoise</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={cleanOptions.deverb || false}
                      onChange={e => setCleanOptions({ ...cleanOptions, deverb: e.target.checked })}
                      className="w-4 h-4 cursor-pointer accent-[hsl(var(--color-primary))]" />
                    <span style={{ color: 'hsl(var(--color-muted))' }}>De-reverb</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={cleanOptions.normalize || false}
                      onChange={e => setCleanOptions({ ...cleanOptions, normalize: e.target.checked })}
                      className="w-4 h-4 cursor-pointer accent-[hsl(var(--color-primary))]" />
                    <span style={{ color: 'hsl(var(--color-muted))' }}>Loudness normalize</span>
                  </label>
                </div>
              )}
            </div>

            {/* Rights */}
            <label className="flex items-start gap-3 cursor-pointer pt-2 border-t" style={{ borderColor: 'hsl(var(--color-border))' }}>
              <input type="checkbox" checked={rights} onChange={e => setRights(e.target.checked)}
                className="mt-1 w-4 h-4 cursor-pointer accent-[hsl(var(--color-primary))]" />
              <span className="text-sm leading-relaxed" style={{ color: rights ? 'hsl(var(--color-text))' : 'hsl(var(--color-muted))' }}>
                I confirm I have the rights to analyze this audio.
              </span>
            </label>
          </div>
        )}
      </Card>

      {/* Song Info Detection */}
      {file && (
        <div className="mb-6">
          <SongInfoCollapsible
            file={file}
            inputFileUrl={uploadedFileUrl}
            clipStart={clipStart}
            clipEnd={clipEnd}
            onDetected={d => setSongInfo({
              bpm_detected: d.bpm_detected,
              bpm_confidence: d.bpm_confidence,
              key_detected: d.key_detected,
              key_confidence: d.key_confidence,
              time_signature_detected: d.time_signature_detected,
              time_signature_confidence: d.time_signature_confidence,
            })}
          />
        </div>
      )}

      {/* Submit */}
      <button disabled={!canSubmit} onClick={handleStart}
        className="w-full h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{stage || 'Working…'}</> : 'Start Analysis'}
      </button>

      {/* Info */}
      <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))` }}>
        <h4 className="text-sm font-semibold mb-2" style={{ color: 'hsl(var(--color-text))' }}>What we measure</h4>
        <ul className="text-xs space-y-1" style={{ color: 'hsl(var(--color-muted))' }}>
          <li>• <strong>LUFS</strong> – Integrated, short-term and true peak loudness</li>
          <li>• <strong>Loudness Range (LRA)</strong> – Dynamic range and crest factor</li>
          <li>• <strong>Spectral Balance</strong> – Frequency response by octave band</li>
          <li>• <strong>Stereo Field</strong> – Width, correlation and M/S ratio</li>
          <li>• <strong>Song Info</strong> – Detected BPM, key and time signature</li>
        </ul>
      </div>
    </div>
  );
}