import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, RefreshCw, ArrowLeft, Clock, CheckCircle, XCircle, Loader2, Cloud, Music2, SlidersHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';
import StemMixer from '../components/stems/StemMixer';
import ExportPresetModal from '../components/exports/ExportPresetModal';

const STATUS_CONFIG = {
  queued:    { icon: Clock, color: 'text-amber-400 bg-amber-400/10', label: 'Queued' },
  running:   { icon: Loader2, color: 'text-blue-400 bg-blue-400/10', label: 'Processing', spin: true },
  done:      { icon: CheckCircle, color: 'text-emerald-400 bg-emerald-400/10', label: 'Done' },
  failed:    { icon: XCircle, color: 'text-red-400 bg-red-400/10', label: 'Failed' },
  cancelled: { icon: XCircle, color: 'text-white/30 bg-white/5', label: 'Cancelled' },
};

export default function JobDetail() {
  const location = useLocation();
  const jobId = new URLSearchParams(location.search).get('id');

  const [job, setJob] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingToDrive, setSavingToDrive] = useState(false);
  const [driveStatus, setDriveStatus] = useState('');
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await base44.auth.me();
        const jobs = await base44.entities.Job.filter({ id: jobId });
        if (jobs.length > 0) setJob(jobs[0]);
        const evts = await base44.entities.JobEvent.filter({ job_id: jobId }, '-created_date', 10);
        setEvents(evts);
        // Auto-load default preset
        const presets = await base44.entities.ExportPreset.filter({ user_id: user.id, is_default: true });
        if (presets.length > 0) setActivePreset(presets[0]);
      } catch {
        base44.auth.redirectToLogin('/JobDetail?id=' + jobId);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [jobId]);

  useEffect(() => {
    if (!job || !['queued', 'running'].includes(job.status)) return;
    const interval = setInterval(async () => {
      const res = await base44.functions.invoke('providerPollStatus', { job_id: jobId });
      if (res.data.job) setJob(res.data.job);
    }, 3000);
    return () => clearInterval(interval);
  }, [job]);

  const resolveFolder = (template) =>
    (template || 'StemForge - {title}')
      .replace('{title}', job.title || 'Stems')
      .replace('{date}', new Date().toISOString().slice(0, 10))
      .replace('{format}', job.output_format || 'wav');

  const handleSaveToDrive = async (preset) => {
    const p = preset || activePreset;
    setSavingToDrive(true);
    setDriveStatus('');
    try {
      const stems = job.stems || {};
      const folder = resolveFolder(p?.folder_template);
      const uploads = [];
      const includeStems = p ? p.include_individual_stems : true;
      const includeZip = p ? p.include_zip : true;

      if (includeStems) {
        Object.entries(stems).forEach(([name, url]) =>
          uploads.push(base44.functions.invoke('googleDriveUpload', { file_url: url, file_name: `${name}.${job.output_format || 'wav'}`, folder_name: folder }))
        );
      }
      if (includeZip && job.output_zip_file) {
        uploads.push(base44.functions.invoke('googleDriveUpload', { file_url: job.output_zip_file, file_name: `${job.title || 'stems'}_all.zip`, folder_name: folder }));
      }
      await Promise.all(uploads);
      setDriveStatus('success');
    } catch {
      setDriveStatus('error');
    } finally {
      setSavingToDrive(false);
    }
  };

  const handleApplyPreset = (preset) => {
    setActivePreset(preset);
    setShowPresetModal(false);
  };

  const handleRetry = async () => {
    const res = await base44.functions.invoke('createJobAndStart', {
      title: job.title, input_file_url: job.input_file,
      input_file_meta: { filename: job.input_filename, mime: job.input_mime, size: job.input_size_bytes },
      separation_mode: job.separation_mode, output_format: job.output_format,
    });
    if (res.data.job_id) window.location.href = '/JobDetail?id=' + res.data.job_id;
  };

  if (loading || !job) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
      </div>
    );
  }

  const sc = STATUS_CONFIG[job.status] || STATUS_CONFIG.queued;
  const StatusIcon = sc.icon;
  const hasStemsForMixer = job.status === 'done' && job.stems && Object.keys(job.stems).length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back + header */}
      <div>
        <Link to={createPageUrl('Jobs')} className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          All jobs
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">{job.title || 'Untitled job'}</h1>
            <p className="text-white/30 text-sm mt-0.5">
              {format(new Date(job.created_date), 'MMM d, yyyy · h:mm a')}
            </p>
          </div>
          <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium shrink-0 ${sc.color}`}>
            <StatusIcon className={`w-3.5 h-3.5 ${sc.spin ? 'animate-spin' : ''}`} />
            {sc.label}
          </span>
        </div>
      </div>

      {/* Job meta */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {[
            ['Stems', job.separation_mode === 'two_stems' ? '2-stem' : '4-stem'],
            ['Format', job.output_format?.toUpperCase()],
            ['Model', job.separation_model || 'balanced'],
            ['Duration', job.duration_seconds ? `${Math.round(job.duration_seconds)}s` : '—'],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-white/30 text-xs mb-1">{k}</p>
              <p className="text-white capitalize">{v}</p>
            </div>
          ))}
        </div>

        {['queued', 'running'].includes(job.status) && (
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs text-white/40">
              <span>{job.stage || 'Processing…'}</span>
              <span>{job.progress || 0}%</span>
            </div>
            <Progress value={job.progress || 0} className="h-1.5 bg-white/5" />
          </div>
        )}

        {job.status === 'failed' && job.error_message && (
          <Alert variant="destructive" className="mt-4 bg-red-500/10 border-red-500/20">
            <XCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">{job.error_message}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Stem Mixer — shown when done */}
      {hasStemsForMixer && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-white/60">Stem Mixer</h2>
          <StemMixer stems={job.stems} />
        </div>
      )}

      {/* Downloads */}
      {job.status === 'done' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-white/60">Downloads</h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowPresetModal(true)}
                title="Manage export presets"
                className="flex items-center gap-1.5 h-7 px-2 rounded-md border border-white/10 text-white/40 hover:text-white hover:bg-white/5 text-xs transition-all"
              >
                <SlidersHorizontal className="w-3 h-3" />
                {activePreset ? <span className="max-w-[80px] truncate">{activePreset.name}</span> : 'Presets'}
              </button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSaveToDrive()}
                disabled={savingToDrive}
                className="gap-1.5 border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-xs"
              >
                {savingToDrive ? <Loader2 className="w-3 h-3 animate-spin" /> : <Cloud className="w-3 h-3" />}
                Save to Drive
              </Button>
            </div>
          </div>

          {activePreset && (
            <p className="text-xs text-violet-400/70">Using preset: <span className="text-violet-300 font-medium">{activePreset.name}</span> · folder: <span className="font-mono">{resolveFolder(activePreset.folder_template)}</span></p>
          )}
          {driveStatus === 'success' && <p className="text-xs text-emerald-400">Saved to Google Drive!</p>}
          {driveStatus === 'error' && <p className="text-xs text-red-400">Failed to save to Drive</p>}

          {job.output_zip_file && (
            <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm text-white font-medium">All stems (ZIP)</p>
                <p className="text-xs text-white/30 mt-0.5">Download everything in one file</p>
              </div>
              <a href={job.output_zip_file} download>
                <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white border-0 gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Download
                </Button>
              </a>
            </div>
          )}

          {job.stems && Object.keys(job.stems).length > 0 && (
            <div className="space-y-2">
              {Object.entries(job.stems).map(([name, url]) => (
                <div key={name} className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Music2 className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-sm text-white capitalize font-medium">{name}</span>
                  </div>
                  <a href={url} download>
                    <Button size="sm" variant="outline" className="gap-1.5 border-white/10 text-white/50 hover:text-white hover:bg-white/5 h-7 text-xs">
                      <Download className="w-3 h-3" />
                      Download
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Retry */}
      {job.status === 'failed' && (
        <Button onClick={handleRetry} variant="outline" className="w-full border-white/10 text-white/60 hover:text-white hover:bg-white/5 gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry job
        </Button>
      )}

      {/* Activity log */}
      {events.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-white/40 mb-3">Activity log</h2>
          <div className="space-y-2">
            {events.map((event) => (
              <div key={event.id} className="flex items-start gap-3 text-sm">
                <div className="w-1 h-1 rounded-full bg-white/20 mt-2 shrink-0" />
                <div>
                  <p className="text-white/60">{event.message}</p>
                  <p className="text-white/25 text-xs mt-0.5">{format(new Date(event.created_date), 'h:mm:ss a')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}