import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Loader2, Layers, Lock, Upload, Music, AlertCircle, ChevronDown } from 'lucide-react';
import Card, { CardHeader } from '../components/auralyn/Card';
import FileDropZone from '../components/auralyn/FileDropZone';
import WaveformInteractive from '../components/waveform/WaveformInteractive';
import { ProBadge, UpgradeBanner } from '../components/auralyn/ProBadge';
import { SongInfoCollapsible } from '../components/auralyn/SongInfoPanel';
import CleanAudioPanel from '../components/auralyn/CleanAudioPanel';
import HarmonyPanel from '../components/auralyn/HarmonyPanel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [plan, setPlan] = useState('free');
  const [limitHit, setLimitHit] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [songInfo, setSongInfo] = useState({});
  const [cleanEnabled, setCleanEnabled] = useState(false);
  const [cleanOptions, setCleanOptions] = useState({});
  const [harmonyMode, setHarmonyMode] = useState('none');
  const [harmonyOptions, setHarmonyOptions] = useState({ focus: 'lead_vocal', guide_stem: true, notes: false });
  const [expandedSettings, setExpandedSettings] = useState(true);

  useEffect(() => {
    base44.auth.me().catch(() => base44.auth.redirectToLogin('/stems/new'));
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

  const canSubmit = file && !fileError && rights && !loading && (clipEnd == null || (clipEnd - clipStart >= 5));

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
        clean_audio_enabled: cleanEnabled,
        clean_audio_options_json: cleanEnabled ? cleanOptions : null,
        harmony_mode: harmonyMode,
        harmony_options_json: harmonyMode !== 'none' ? harmonyOptions : null,
        ...songInfo,
      });

      const jobId = createRes.data.job_id;
      setStage('Starting separation…');
      await base44.functions.invoke('startJob', { job_id: jobId });
      navigate(`${createPageUrl('JobDetail')}?id=${jobId}`);
    } catch (err) {
      const data = err.response?.data;
      if (data?.upgrade_required) {
        setLimitHit(true);
        setError('');
      } else {
        setError(data?.error || 'Something went wrong. Try again.');
      }
      setLoading(false);
      setStage('');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <Layers className="w-5 h-5" style={{ color: 'hsl(var(--color-primary))' }} />
          <h1 className="text-3xl font-bold" style={{ color: 'hsl(var(--color-text))' }}>Stem Separation</h1>
        </div>
        <p className="text-base mb-2" style={{ color: 'hsl(var(--color-muted))' }}>Upload a track and isolate vocals, drums, bass, guitars and more using studio-quality AI.</p>
        {plan === 'free' && (
          <p className="text-sm flex items-center gap-1.5" style={{ color: 'hsl(var(--color-muted))' }}>
            Free plan · 2 jobs/day ·
            <a href={createPageUrl('Pricing')} className="underline font-medium" style={{ color: 'hsl(var(--color-primary))' }}>Upgrade for unlimited</a>
          </p>
        )}
        {plan === 'pro' && (
          <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: 'hsl(var(--color-accent))' }}>
            ✓ Pro — Unlimited jobs
          </span>
        )}
        {projectId && (
          <span className="inline-flex items-center gap-1 text-xs mt-3 px-3 py-1 rounded-md font-medium" style={{ backgroundColor: 'hsl(var(--color-primary) / 0.1)', color: 'hsl(var(--color-primary))', border: `1px solid hsl(var(--color-primary) / 0.3)` }}>
            Attached to project
          </span>
        )}
      </div>

      {limitHit && <UpgradeBanner />}
      {error && !limitHit && (
        <div className="mb-6 rounded-lg border px-4 py-3 text-sm" style={{ backgroundColor: 'hsl(var(--color-destructive) / 0.1)', borderColor: 'hsl(var(--color-destructive) / 0.3)', color: 'hsl(var(--color-destructive))' }}>
          {error}
        </div>
      )}

      {/* Upload & Waveform Section */}
      <Card className="mb-6">
        <CardHeader title="Upload & Trim" subtitle="MP3, WAV, FLAC, AIFF · max 200 MB" />
        <FileDropZone file={file} onFile={handleFile} error={fileError} />
        <p className="text-xs mt-4" style={{ color: 'hsl(var(--color-muted))' }}>
          Files are processed securely. Outputs can be deleted after 7 days.
        </p>

        {/* Waveform for trimming */}
        {file && (
          <div className="mt-6">
            <div className="mb-3">
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'hsl(var(--color-text))' }}>Click and drag to select region</h3>
              <p className="text-xs" style={{ color: 'hsl(var(--color-muted))' }}>Drag the handles to trim the track to process only a section.</p>
            </div>
            <WaveformInteractive audioFile={file} onRangeChange={handleRange} maxClip={120} minClip={5} />
          </div>
        )}

        {file && clipStart != null && clipEnd != null && (
          <div className="mt-4 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: 'hsl(var(--color-primary) / 0.1)', border: `1px solid hsl(var(--color-primary) / 0.3)`, color: 'hsl(var(--color-muted))' }}>
            Processing <span style={{ color: 'hsl(var(--color-text))', fontWeight: 600 }}>{Math.round(clipEnd - clipStart)}s</span> of audio. Processing a section saves compute—useful for testing quality before full track.
          </div>
        )}
      </Card>

      {/* Settings Section */}
      <Card className="mb-6">
        <div onClick={() => setExpandedSettings(!expandedSettings)} className="flex items-center justify-between cursor-pointer p-5 border-b" style={{ borderColor: 'hsl(var(--color-border))' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'hsl(var(--color-text))' }}>Processing Settings</h3>
          <ChevronDown className="w-5 h-5 transition-transform" style={{ transform: expandedSettings ? 'rotate(180deg)' : '', color: 'hsl(var(--color-muted))' }} />
        </div>

        {expandedSettings && (
          <div className="p-5 space-y-5">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(var(--color-text))' }}>Job title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Track name…"
                className="w-full rounded-lg px-3 h-10 text-sm outline-none" style={{ backgroundColor: 'hsl(var(--color-input))', border: `1px solid hsl(var(--color-border))`, color: 'hsl(var(--color-text))' }}
                onFocus={e => e.target.style.borderColor = 'hsl(var(--color-primary))'}
                onBlur={e => e.target.style.borderColor = 'hsl(var(--color-border))'} />
            </div>

            {/* Separation Mode */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'hsl(var(--color-text))' }}>
                Separation mode
                {plan === 'free' && <span className="text-xs font-normal" style={{ color: 'hsl(var(--color-muted))' }}>· 6-stem requires <ProBadge /></span>}
              </label>
              <Select value={mode} onValueChange={v => { if (v.includes('six') && plan === 'free') return; setMode(v); }}>
                <SelectTrigger className="h-10 text-sm rounded-lg" style={{ backgroundColor: 'hsl(var(--color-input))', borderColor: 'hsl(var(--color-border))', color: 'hsl(var(--color-text))' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="two_stems">2 Stems — Vocals + Band</SelectItem>
                  <SelectItem value="four_stems">4 Stems — Vocals + Drums + Bass + Other</SelectItem>
                  <SelectItem value="six_stems" disabled={plan === 'free'}>
                    <span className="flex items-center gap-2">
                      {plan === 'free' && <Lock className="w-3 h-3" />}
                      6 Stems — Vocals + Drums + Bass + Guitar + Keys + Other
                      {plan === 'free' && <ProBadge />}
                    </span>
                  </SelectItem>
                  <SelectItem value="choir_vocals_band">Choir — Choir Vocals + Band</SelectItem>
                  <SelectItem value="satb_experimental" disabled={plan === 'free'}>
                    <span className="flex items-center gap-2">
                      {plan === 'free' && <Lock className="w-3 h-3" />}
                      SATB Experimental — Soprano, Alto, Tenor, Bass
                      {plan === 'free' && <ProBadge />}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quality */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'hsl(var(--color-text))' }}>
                Quality
                {plan === 'free' && <span className="text-xs font-normal" style={{ color: 'hsl(var(--color-muted))' }}>· HQ requires <ProBadge /></span>}
              </label>
              <Select value={quality} onValueChange={v => { if (v === 'hq' && plan === 'free') return; setQuality(v); }}>
                <SelectTrigger className="h-10 text-sm rounded-lg" style={{ backgroundColor: 'hsl(var(--color-input))', borderColor: 'hsl(var(--color-border))', color: 'hsl(var(--color-text))' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast — quick preview</SelectItem>
                  <SelectItem value="balanced">Balanced — recommended</SelectItem>
                  <SelectItem value="hq" disabled={plan === 'free'}>
                    <span className="flex items-center gap-2">
                      {plan === 'free' && <Lock className="w-3 h-3" />}
                      High Quality — best result
                      {plan === 'free' && <ProBadge />}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Output Format */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'hsl(var(--color-text))' }}>
                Output format
                {plan === 'free' && <span className="text-xs font-normal" style={{ color: 'hsl(var(--color-muted))' }}>· FLAC requires <ProBadge /></span>}
              </label>
              <Select value={outputFormat} onValueChange={v => { if (v === 'flac' && plan === 'free') return; setOutputFormat(v); }}>
                <SelectTrigger className="h-10 text-sm rounded-lg" style={{ backgroundColor: 'hsl(var(--color-input))', borderColor: 'hsl(var(--color-border))', color: 'hsl(var(--color-text))' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wav">WAV — lossless</SelectItem>
                  <SelectItem value="flac" disabled={plan === 'free'}>
                    <span className="flex items-center gap-2">
                      {plan === 'free' && <Lock className="w-3 h-3" />}
                      FLAC — compressed lossless
                      {plan === 'free' && <ProBadge />}
                    </span>
                  </SelectItem>
                  <SelectItem value="mp3">MP3 — compressed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rights Confirmation */}
            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input type="checkbox" checked={rights} onChange={e => setRights(e.target.checked)}
                className="mt-1 w-4 h-4 cursor-pointer accent-[hsl(var(--color-primary))]" />
              <span className="text-sm leading-relaxed" style={{ color: rights ? 'hsl(var(--color-text))' : 'hsl(var(--color-muted))' }}>
                I confirm I have the rights to process this audio.
              </span>
            </label>
          </div>
        )}
      </Card>

      {/* Clean Audio */}
      {file && (
        <div className="mb-6">
          <CleanAudioPanel
            variant="stems"
            enabled={cleanEnabled}
            onToggle={setCleanEnabled}
            options={cleanOptions}
            onOptions={setCleanOptions}
          />
        </div>
      )}

      {/* Harmony Engine */}
      {file && (
        <div className="mb-6">
          <HarmonyPanel
            mode={harmonyMode}
            onMode={setHarmonyMode}
            options={harmonyOptions}
            onOptions={setHarmonyOptions}
          />
        </div>
      )}

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

      {/* Submit Button */}
      <button disabled={!canSubmit} onClick={handleStart}
        className="w-full h-12 rounded-lg text-base font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />{stage || 'Working…'}</> : 'Start Separation'}
      </button>
    </div>
  );
}