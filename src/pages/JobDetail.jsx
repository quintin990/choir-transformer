import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ArrowLeft, Download, RefreshCw, X, Loader2, Cloud, FileAudio, BarChart2, Music2, Sliders, FolderOpen, Upload } from 'lucide-react';
import PublishToChoirModal from '../components/choir/PublishToChoirModal';
import Card, { CardHeader } from '../components/auralyn/Card';
import StatusBadge from '../components/auralyn/StatusBadge';
import TagEditor from '../components/auralyn/TagEditor';
import MixConsole from '../components/mixer/MixConsole';
import ExportPanel from '../components/export/ExportPanel';
import SongInfoPanel from '../components/auralyn/SongInfoPanel';
import EnhanceTab from '../components/jobs/EnhanceTab';
import HarmonyTab from '../components/jobs/HarmonyTab';

const ACTIVE = ['queued', 'uploading', 'processing', 'packaging'];

function MetricBlock({ label, value, unit }) {
  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
      <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: '#9CB2D6' }}>{label}</p>
      <p className="text-lg font-bold tabular-nums" style={{ color: '#EAF2FF' }}>
        {value ?? '—'}{unit && <span className="text-xs font-normal ml-1" style={{ color: '#9CB2D6' }}>{unit}</span>}
      </p>
    </div>
  );
}

function StemPlayer({ name, url, format: fmt = 'wav' }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const COLORS = { vocals: '#1EA0FF', drums: '#19D3A2', bass: '#FFB020', other: '#9B74FF', no_vocals: '#00D8FF' };
  const color = COLORS[name?.toLowerCase()] || '#1EA0FF';
  const fmtT = s => { if (!s || isNaN(s)) return '0:00'; return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`; };
  const toggle = () => {
    if (!audioRef.current) return;
    playing ? audioRef.current.pause() : audioRef.current.play();
    setPlaying(v => !v);
  };
  return (
    <div className="rounded-lg px-4 py-3 flex items-center gap-3" style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
      <audio ref={audioRef} src={url}
        onTimeUpdate={() => { if (!audioRef.current?.duration) return; setCurrent(audioRef.current.currentTime); setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100); }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setPlaying(false)} />
      <button onClick={toggle} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: color + '20', border: `1px solid ${color}40` }}>
        {playing
          ? <span className="w-2.5 h-2.5 flex gap-0.5">{[0, 1].map(i => <span key={i} className="w-1 h-full rounded-sm" style={{ backgroundColor: color }} />)}</span>
          : <span className="w-0 h-0 ml-0.5 border-t-[5px] border-b-[5px] border-l-[8px] border-transparent" style={{ borderLeftColor: color }} />
        }
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1.5">
          <span className="text-xs font-semibold capitalize" style={{ color: '#EAF2FF' }}>{name?.replace('_', ' ')}</span>
          <span className="text-[11px] font-mono tabular-nums" style={{ color: '#9CB2D6' }}>{fmtT(current)} / {fmtT(duration)}</span>
        </div>
        <div className="h-1 rounded-full overflow-hidden cursor-pointer" style={{ backgroundColor: '#1C2A44' }}
          onClick={e => { if (!audioRef.current?.duration) return; const r = e.currentTarget.getBoundingClientRect(); audioRef.current.currentTime = ((e.clientX - r.left) / r.width) * audioRef.current.duration; }}>
          <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
        </div>
      </div>
      <a href={url} download={`${name}.${fmt}`}
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ color: '#9CB2D6', border: '1px solid #1C2A44' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#1EA0FF'; e.currentTarget.style.borderColor = '#1EA0FF40'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#9CB2D6'; e.currentTarget.style.borderColor = '#1C2A44'; }}>
        <Download className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

const TABS = ['results', 'console', 'export', 'enhance', 'harmony', 'song info', 'technical', 'files'];

export default function JobDetail() {
  const location = useLocation();
  const jobId = new URLSearchParams(location.search).get('id');

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('results');
  const [cancelling, setCancelling] = useState(false);
  const [driveMsg, setDriveMsg] = useState('');
  const [editTags, setEditTags] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isDirector, setIsDirector] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u =>
      base44.entities.ChoirMembership.filter({ user_id: u.id, status: 'approved' })
        .then(mems => setIsDirector(mems.some(m => ['admin', 'director'].includes(m.role))))
        .catch(() => {})
    ).catch(() => {});
  }, []);

  const poll = async () => {
    const res = await base44.functions.invoke('pollJob', { job_id: jobId });
    if (res.data.job) setJob(res.data.job);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await base44.auth.me();
        await poll();
      } catch {
        base44.auth.redirectToLogin('/JobDetail?id=' + jobId);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [jobId]);

  useEffect(() => {
    if (!job || !ACTIVE.includes(job.status)) return;
    const t = setInterval(poll, 2000);
    return () => clearInterval(t);
  }, [job?.status]);

  // Auto-poll export status
  useEffect(() => {
    if (job?.export_status !== 'preparing') return;
    const t = setInterval(async () => {
      const res = await base44.functions.invoke('pollJob', { job_id: jobId });
      if (res.data.job) setJob(res.data.job);
    }, 4000);
    return () => clearInterval(t);
  }, [job?.export_status]);

  const handleCancel = async () => {
    setCancelling(true);
    await base44.functions.invoke('cancelJob', { job_id: jobId });
    setJob(j => ({ ...j, status: 'cancelled', stage: 'Cancelled' }));
    setCancelling(false);
  };

  const handleRetry = async () => {
    await base44.functions.invoke('startJob', { job_id: jobId });
    setJob(j => ({ ...j, status: 'queued', stage: 'Queued', progress: 0 }));
  };

  const [autoTagging, setAutoTagging] = useState(false);

  const handleTagChange = async (tags) => {
    setJob(j => ({ ...j, tags }));
    await base44.functions.invoke('updateJobTags', { job_id: jobId, tags });
  };

  const handleAutoTag = async () => {
    setAutoTagging(true);
    const res = await base44.functions.invoke('autoTagJob', { job_id: jobId });
    if (res.data?.tags) setJob(j => ({ ...j, tags: res.data.tags }));
    setAutoTagging(false);
  };

  const handleSaveToDrive = async () => {
    setDriveMsg('');
    try {
      const stems = job.stems || {};
      const folder = `Auralyn – ${job.title || 'Stems'}`;
      const uploads = Object.entries(stems).map(([n, url]) =>
        base44.functions.invoke('googleDriveUpload', { file_url: url, file_name: `${n}.${job.output_format || 'wav'}`, folder_name: folder })
      );
      if (job.output_zip_file) uploads.push(base44.functions.invoke('googleDriveUpload', { file_url: job.output_zip_file, file_name: `${job.title || 'stems'}_all.zip`, folder_name: folder }));
      await Promise.all(uploads);
      setDriveMsg('Saved to Google Drive ✓');
    } catch {
      setDriveMsg('Failed to save to Drive.');
    }
  };

  const handlePresetChange = async (preset) => {
    setJob(j => ({ ...j, export_preset_json: preset }));
    await base44.entities.Job.update(jobId, { export_preset_json: preset });
  };

  if (loading || !job) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#1EA0FF' }} /></div>;
  }

  const isActive = ACTIVE.includes(job.status);
  const isDone = job.status === 'done';
  const isFailed = job.status === 'failed';
  const hasStems = isDone && job.stems && Object.keys(job.stems).length > 0;
  const backendNotConnected = job.stage === 'Backend not connected';
  const analysis = job.analysis || {};
  const showExport = job.kind === 'stems' && isDone;
  const showConsole = job.kind === 'stems' && isDone;
  const clipRange = job.clip_start_sec != null && job.clip_end_sec != null;

  const showEnhance = job.clean_audio_enabled;
  const showHarmony = job.kind === 'stems';

  const visibleTabs = TABS.filter(t => {
    if (t === 'console') return showConsole;
    if (t === 'export') return showExport;
    if (t === 'enhance') return showEnhance;
    if (t === 'harmony') return showHarmony;
    if (t === 'song info') return job.kind === 'stems';
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to={createPageUrl('Jobs')} className="inline-flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: '#9CB2D6' }}
          onMouseEnter={e => e.currentTarget.style.color = '#EAF2FF'}
          onMouseLeave={e => e.currentTarget.style.color = '#9CB2D6'}>
          <ArrowLeft className="w-3.5 h-3.5" /> All jobs
        </Link>
        {job.project_id && (
          <Link to={`${createPageUrl('ProjectDetail')}?id=${job.project_id}`}
            className="inline-flex items-center gap-1.5 text-xs transition-colors px-2 py-0.5 rounded"
            style={{ backgroundColor: '#1EA0FF10', color: '#1EA0FF', border: '1px solid #1EA0FF20' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1EA0FF18'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1EA0FF10'}>
            <FolderOpen className="w-3 h-3" /> View project
          </Link>
        )}
      </div>

      {/* Header card */}
      <Card>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <h1 className="text-base font-bold truncate" style={{ color: '#EAF2FF' }}>
              {job.title || job.input_file_name || 'Untitled'}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: '#9CB2D6' }}>
              {job.kind}
              {job.mode ? ` · ${job.mode === 'four_stems' ? '4 stems' : '2 stems'}` : ''}
              {job.quality ? ` · ${job.quality}` : ''}
              {job.output_format ? ` · ${job.output_format.toUpperCase()}` : ''}
              {clipRange ? ` · ${Math.round(job.clip_start_sec)}s–${Math.round(job.clip_end_sec)}s` : ''}
            </p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <TagEditor tags={job.tags || []} onChange={handleTagChange} readonly={!editTags} />
          <button onClick={() => setEditTags(v => !v)} className="text-[11px] transition-colors"
            style={{ color: '#9CB2D6' }}
            onMouseEnter={e => e.target.style.color = '#1EA0FF'}
            onMouseLeave={e => e.target.style.color = '#9CB2D6'}>
            {editTags ? 'Done' : '+ tags'}
          </button>
          <button onClick={handleAutoTag} disabled={autoTagging}
            className="flex items-center gap-1 text-[11px] px-2 h-6 rounded disabled:opacity-40 transition-colors"
            style={{ backgroundColor: '#9B74FF15', color: '#9B74FF', border: '1px solid #9B74FF25' }}>
            {autoTagging ? <Loader2 className="w-3 h-3 animate-spin" /> : '✦'}
            {autoTagging ? 'Tagging…' : 'AI tags'}
          </button>
        </div>

        {isActive && (
          <div className="space-y-1.5 mt-3 pt-3 border-t" style={{ borderColor: '#1C2A44' }}>
            {backendNotConnected ? (
              <div className="rounded-lg p-3 text-xs" style={{ backgroundColor: '#FFB02010', border: '1px solid #FFB02030', color: '#FFB020' }}>
                Backend GPU not connected yet. Job is queued — it will run once the processing backend is wired up.
              </div>
            ) : (
              <>
                <div className="flex justify-between text-xs" style={{ color: '#9CB2D6' }}>
                  <span>{job.stage || 'Processing…'}</span>
                  <span className="tabular-nums font-mono">{job.progress || 0}%</span>
                </div>
                <Progress value={job.progress || 0} className="h-1.5" style={{ backgroundColor: '#1C2A44' }} />
                <p className="text-[11px]" style={{ color: '#9CB2D6' }}>Typically 2–10 minutes. You can leave and come back.</p>
              </>
            )}
          </div>
        )}

        {isFailed && (
          <div className="mt-3 pt-3 border-t p-3 rounded-lg text-xs" style={{ borderColor: '#1C2A44', backgroundColor: '#FF4D6D10', color: '#FF4D6D' }}>
            {job.error_message || 'An error occurred during processing.'}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t" style={{ borderColor: '#1C2A44' }}>
          {isActive && !backendNotConnected && (
            <button onClick={handleCancel} disabled={cancelling}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium disabled:opacity-50"
              style={{ border: '1px solid #FF4D6D30', color: '#FF4D6D' }}>
              {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
              Cancel
            </button>
          )}
          {isFailed && (
            <button onClick={handleRetry}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium"
              style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          )}
          {hasStems && (
            <button onClick={handleSaveToDrive}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border"
              style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}>
              <Cloud className="w-3.5 h-3.5" /> Save to Drive
            </button>
          )}
          {isDirector && isDone && (
            <button onClick={() => setShowPublishModal(true)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium"
              style={{ backgroundColor: '#9B74FF18', color: '#9B74FF', border: '1px solid #9B74FF30' }}>
              <Upload className="w-3.5 h-3.5" /> Publish to Choir
            </button>
          )}
          {job.output_zip_file && (
            <a href={job.output_zip_file} download
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium"
              style={{ backgroundColor: '#1EA0FF18', color: '#1EA0FF', border: '1px solid #1EA0FF30' }}>
              <Download className="w-3.5 h-3.5" /> Download ZIP
            </a>
          )}
        </div>
        {driveMsg && <p className="text-xs mt-2" style={{ color: driveMsg.includes('✓') ? '#19D3A2' : '#FF4D6D' }}>{driveMsg}</p>}
      </Card>

      {showPublishModal && <PublishToChoirModal job={job} onClose={() => setShowPublishModal(false)} />}

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto" style={{ borderColor: '#1C2A44' }}>
        {visibleTabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2.5 text-xs font-medium capitalize transition-colors border-b-2 -mb-px whitespace-nowrap"
            style={{
              color: tab === t ? '#EAF2FF' : '#9CB2D6',
              borderBottomColor: tab === t ? '#1EA0FF' : 'transparent',
            }}>
            {t === 'console' ? 'Mix Console' : t === 'export' ? 'Export to DAW' : t === 'song info' ? 'Song Info' : t === 'enhance' ? 'Enhance' : t === 'harmony' ? 'Harmony' : t}
          </button>
        ))}
      </div>

      {/* Results */}
      {tab === 'results' && (
        <div className="space-y-5">
          {!isDone ? (
            <Card className="text-center py-12">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" style={{ color: isActive ? '#1EA0FF' : '#9CB2D6' }} />
              <p className="text-sm font-medium" style={{ color: '#EAF2FF' }}>{isActive ? 'Processing…' : job.status}</p>
              <p className="text-xs mt-1" style={{ color: '#9CB2D6' }}>{job.stage || ''}</p>
            </Card>
          ) : job.kind === 'stems' && hasStems ? (
            <Card>
              <CardHeader title="Stems" subtitle="Click to preview · download individual files" />
              <div className="space-y-2">
                {Object.entries(job.stems).map(([name, url]) => (
                  <StemPlayer key={name} name={name} url={url} format={job.output_format || 'wav'} />
                ))}
              </div>
            </Card>
          ) : job.kind === 'reference' ? (
            <Card>
              <CardHeader title="Reference Analysis" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <MetricBlock label="Integrated LUFS" value={analysis.lufs || analysis.integrated_lufs} unit="LUFS" />
                <MetricBlock label="True Peak" value={analysis.true_peak} unit="dBTP" />
                <MetricBlock label="Loudness Range" value={analysis.lra || analysis.loudness_range} unit="LU" />
                <MetricBlock label="Crest Factor" value={analysis.crest_factor} unit="dB" />
                <MetricBlock label="Stereo Corr." value={analysis.stereo_correlation} />
                <MetricBlock label="Sample Rate" value={job.sample_rate ? `${(job.sample_rate / 1000).toFixed(1)}k` : null} unit="Hz" />
              </div>
              {!analysis.lufs && !analysis.integrated_lufs && (
                <div className="text-center py-6 mt-3 rounded-lg" style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
                  <BarChart2 className="w-6 h-6 mx-auto mb-2 opacity-20" style={{ color: '#9CB2D6' }} />
                  <p className="text-xs" style={{ color: '#9CB2D6' }}>Metrics appear here once backend is connected.</p>
                </div>
              )}
            </Card>
          ) : null}
        </div>
      )}

      {/* Mix Console */}
      {tab === 'console' && showConsole && (
        <div>
          <MixConsole
            stems={job.stems}
            format={job.output_format || 'wav'}
            initialPreset={job.export_preset_json}
            onPresetChange={handlePresetChange}
          />
        </div>
      )}

      {/* Export to DAW */}
      {tab === 'export' && showExport && (
        <Card>
          <CardHeader title="Export to DAW Session" subtitle="Generate a project file you can open directly in your DAW" />
          <ExportPanel job={job} onJobUpdate={setJob} />
        </Card>
      )}

      {/* Enhance */}
      {tab === 'enhance' && showEnhance && (
        <EnhanceTab job={job} onJobUpdate={setJob} jobId={jobId} />
      )}

      {/* Harmony */}
      {tab === 'harmony' && showHarmony && (
        <HarmonyTab job={job} onJobUpdate={setJob} jobId={jobId} />
      )}

      {/* Song Info */}
      {tab === 'song info' && (
        <Card>
          <CardHeader title="Song Info" subtitle="BPM, key, and time signature" />
          <SongInfoPanel
            data={{
              bpm_detected: job.bpm_detected,
              bpm_confirmed: job.bpm_confirmed,
              bpm_confidence: job.bpm_confidence,
              key_detected: job.key_detected,
              key_confirmed: job.key_confirmed,
              key_confidence: job.key_confidence,
              time_signature_detected: job.time_signature_detected,
              time_signature_confirmed: job.time_signature_confirmed,
              time_signature_confidence: job.time_signature_confidence,
            }}
            onSave={async (vals) => {
              await base44.functions.invoke('saveSongInfo', { job_id: job.id, ...vals });
              setJob(j => ({ ...j, ...vals }));
            }}
          />
        </Card>
      )}

      {/* Technical */}
      {tab === 'technical' && (
        <Card>
          <CardHeader title="Technical metadata" />
          <div className="space-y-0">
            {[
              ['Job ID', job.id],
              ['Kind', job.kind],
              ['Status', job.status],
              ['Clip range', clipRange ? `${job.clip_start_sec.toFixed(1)}s – ${job.clip_end_sec.toFixed(1)}s` : 'Full track'],
              ['Duration', job.duration_seconds ? `${job.duration_seconds.toFixed(1)}s` : '—'],
              ['Sample rate', job.sample_rate ? `${job.sample_rate} Hz` : '—'],
              ['Channels', job.channels],
              ['File name', job.input_file_name || job.input_filename],
              ['File size', job.input_file_size_bytes ? `${(job.input_file_size_bytes / 1024 / 1024).toFixed(2)} MB` : '—'],
              ['Provider job ID', job.provider_job_id || '—'],
              ['Export status', job.export_status || 'none'],
              ['Created', job.created_date ? format(new Date(job.created_date), 'MMM d, yyyy h:mm:ss a') : '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b text-xs"
                style={{ borderColor: '#1C2A44' }}>
                <span style={{ color: '#9CB2D6' }}>{label}</span>
                <span className="font-mono text-right max-w-[60%] truncate" style={{ color: '#EAF2FF' }}>{value || '—'}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Files */}
      {tab === 'files' && (
        <Card>
          <CardHeader title="Job files" />
          {job.stems && Object.keys(job.stems).length > 0 ? (
            <div className="space-y-2">
              {job.output_zip_file && (
                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
                  <div className="flex items-center gap-2.5">
                    <FileAudio className="w-4 h-4" style={{ color: '#FFB020' }} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: '#EAF2FF' }}>All stems (ZIP)</p>
                      <p className="text-[11px]" style={{ color: '#9CB2D6' }}>zip archive</p>
                    </div>
                  </div>
                  <a href={job.output_zip_file} download
                    className="h-7 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5"
                    style={{ backgroundColor: '#1EA0FF18', color: '#1EA0FF' }}>
                    <Download className="w-3 h-3" /> Download
                  </a>
                </div>
              )}
              {Object.entries(job.stems).map(([name, url]) => (
                <div key={name} className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
                  <div className="flex items-center gap-2.5">
                    <FileAudio className="w-4 h-4" style={{ color: '#1EA0FF' }} />
                    <div>
                      <p className="text-xs font-medium capitalize" style={{ color: '#EAF2FF' }}>{name.replace('_', ' ')}</p>
                      <p className="text-[11px]" style={{ color: '#9CB2D6' }}>{job.output_format?.toUpperCase() || 'WAV'}</p>
                    </div>
                  </div>
                  <a href={url} download={`${name}.${job.output_format || 'wav'}`}
                    className="h-7 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5"
                    style={{ backgroundColor: '#1C2A44', color: '#9CB2D6' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#1EA0FF18'; e.currentTarget.style.color = '#1EA0FF'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1C2A44'; e.currentTarget.style.color = '#9CB2D6'; }}>
                    <Download className="w-3 h-3" /> Download
                  </a>
                </div>
              ))}
              {job.export_asset_url && (
                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ backgroundColor: '#0B1220', border: '1px solid #19D3A230' }}>
                  <div className="flex items-center gap-2.5">
                    <Music2 className="w-4 h-4" style={{ color: '#19D3A2' }} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: '#EAF2FF' }}>DAW Session</p>
                      <p className="text-[11px]" style={{ color: '#9CB2D6' }}>Reaper .rpp</p>
                    </div>
                  </div>
                  <a href={job.export_asset_url} download
                    className="h-7 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5"
                    style={{ backgroundColor: '#19D3A218', color: '#19D3A2' }}>
                    <Download className="w-3 h-3" /> Download
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-center py-6" style={{ color: '#9CB2D6' }}>No files available yet.</p>
          )}
        </Card>
      )}
    </div>
  );
}