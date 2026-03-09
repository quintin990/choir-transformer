import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Download, RefreshCw, X, Cloud, Loader2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import JobStatusBadge from '../components/jobs/JobStatusBadge';
import StemPlayer from '../components/jobs/StemPlayer';
import AnalysisPanel from '../components/jobs/AnalysisPanel';

export default function JobDetail() {
  const location = useLocation();
  const jobId = new URLSearchParams(location.search).get('id');

  const [job, setJob] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [savingToDrive, setSavingToDrive] = useState(false);
  const [driveStatus, setDriveStatus] = useState('');
  const logRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        await base44.auth.me();
        const jobs = await base44.entities.Job.filter({ id: jobId });
        if (jobs.length > 0) setJob(jobs[0]);
        const evts = await base44.entities.JobEvent.filter({ job_id: jobId }, '-created_date', 20);
        setEvents(evts.reverse());
      } catch {
        base44.auth.redirectToLogin('/JobDetail?id=' + jobId);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [jobId]);

  // Poll while active
  useEffect(() => {
    if (!job || ['done', 'failed', 'cancelled'].includes(job.status)) return;
    const interval = setInterval(async () => {
      const res = await base44.functions.invoke('providerPollStatus', { job_id: jobId });
      if (res.data.job) {
        setJob(res.data.job);
        // Also refresh events
        const evts = await base44.entities.JobEvent.filter({ job_id: jobId }, '-created_date', 20);
        setEvents(evts.reverse());
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [job?.status]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [events]);

  const handleCancel = async () => {
    setCancelling(true);
    await base44.functions.invoke('cancelJob', { job_id: jobId });
    setJob(j => ({ ...j, status: 'cancelled', stage: 'Cancelled' }));
    setCancelling(false);
  };

  const handleRetry = async () => {
    const res = await base44.functions.invoke('createJobAndStart', {
      title: job.title,
      input_file_url: job.input_file,
      input_file_meta: { filename: job.input_filename, mime: job.input_mime, size: job.input_size_bytes },
      separation_mode: job.separation_mode,
      separation_model: job.separation_model,
      output_format: job.output_format,
      apply_repair: false,
    });
    if (res.data.job_id) window.location.href = createPageUrl('JobDetail') + '?id=' + res.data.job_id;
  };

  const handleSaveToDrive = async () => {
    setSavingToDrive(true);
    setDriveStatus('');
    try {
      const stems = job.stems || {};
      const folderName = `StemForge – ${job.title || job.input_filename || 'Stems'}`;
      const uploads = Object.entries(stems).map(([name, url]) =>
        base44.functions.invoke('googleDriveUpload', {
          file_url: url,
          file_name: `${name}.${job.output_format || 'wav'}`,
          folder_name: folderName
        })
      );
      if (job.output_zip_file) {
        uploads.push(base44.functions.invoke('googleDriveUpload', {
          file_url: job.output_zip_file,
          file_name: `${job.title || 'stems'}_all.zip`,
          folder_name: folderName
        }));
      }
      await Promise.all(uploads);
      setDriveStatus('success');
    } catch {
      setDriveStatus('error');
    } finally {
      setSavingToDrive(false);
    }
  };

  if (loading || !job) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
      </div>
    );
  }

  const isActive = ['queued', 'uploading', 'running'].includes(job.status);
  const isDone = job.status === 'done';
  const isFailed = job.status === 'failed';
  const hasStemData = isDone && job.stems && Object.keys(job.stems).length > 0;

  const LOG_COLORS = {
    info: 'text-white/60',
    warn: 'text-amber-400',
    error: 'text-red-400',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link to={createPageUrl('Jobs')} className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        All jobs
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-white truncate">{job.title || job.input_filename || 'Untitled job'}</h1>
          <p className="text-white/30 text-xs mt-1">
            {job.input_filename} · {job.separation_mode === 'two_stems' ? '2 Stems' : '4 Stems'} · {job.separation_model} · {job.output_format?.toUpperCase()} · {format(new Date(job.created_date), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
        <JobStatusBadge status={job.status} />
      </div>

      {/* Progress */}
      {isActive && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 space-y-3">
          <div className="flex justify-between text-xs text-white/40">
            <span>{job.stage || 'Processing…'}</span>
            <span className="tabular-nums">{job.progress || 0}%</span>
          </div>
          <Progress value={job.progress || 0} className="h-1.5 bg-white/5" />
          <p className="text-xs text-white/25">This typically takes 2–10 minutes. You can leave this page and come back.</p>
        </div>
      )}

      {/* Error */}
      {isFailed && (
        <Alert className="bg-red-500/10 border-red-500/20">
          <XCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">{job.error_message || 'An unknown error occurred.'}</AlertDescription>
        </Alert>
      )}

      {/* Log */}
      {events.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-white/5 text-xs font-medium text-white/30 uppercase tracking-widest">Activity Log</div>
          <div ref={logRef} className="max-h-40 overflow-y-auto p-4 space-y-1.5 font-mono text-xs">
            {events.map(evt => (
              <div key={evt.id} className="flex items-start gap-3">
                <span className="text-white/20 shrink-0 tabular-nums">{format(new Date(evt.created_date), 'HH:mm:ss')}</span>
                <span className={LOG_COLORS[evt.level] || 'text-white/60'}>{evt.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stems */}
      {hasStemData && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Stems</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToDrive}
                disabled={savingToDrive}
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
              >
                {savingToDrive ? <Loader2 className="w-3 h-3 animate-spin" /> : <Cloud className="w-3 h-3" />}
                Save to Drive
              </button>
              {job.output_zip_file && (
                <a
                  href={job.output_zip_file}
                  download
                  className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Download all (ZIP)
                </a>
              )}
            </div>
          </div>

          {driveStatus === 'success' && <p className="text-xs text-emerald-400">Saved to Google Drive ✓</p>}
          {driveStatus === 'error' && <p className="text-xs text-red-400">Failed to save to Drive.</p>}

          <div className="space-y-2">
            {Object.entries(job.stems).map(([name, url]) => (
              <StemPlayer key={name} name={name} url={url} format={job.output_format || 'wav'} />
            ))}
          </div>
        </div>
      )}

      {/* Analysis */}
      {isDone && <AnalysisPanel job={job} />}

      {/* Actions */}
      <div className="flex gap-3">
        {isActive && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-all disabled:opacity-50"
          >
            {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
            Cancel job
          </button>
        )}

        {isFailed && (
          <>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            <a
              href="mailto:support@stemforge.app"
              className="inline-flex items-center h-9 px-4 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-sm transition-all"
            >
              Contact support
            </a>
          </>
        )}
      </div>
    </div>
  );
}