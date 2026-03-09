import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, X, Loader2, FlaskConical, Music2, ChevronRight, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import ReferenceMetrics from '../components/reference/ReferenceMetrics';
import ReferenceEQChart from '../components/reference/ReferenceEQChart';
import GuidanceList from '../components/reference/GuidanceList';
import JobComparisonPicker from '../components/reference/JobComparisonPicker';

// ── Upload / drop zone ──────────────────────────────────────────────
function UploadZone({ onFile, uploading }) {
  const [drag, setDrag] = useState(false);

  const validate = (f) => {
    const validExt = /\.(mp3|wav|flac|aiff|aif|m4a)$/i;
    if (!validExt.test(f.name)) return 'Use MP3, WAV, FLAC, AIFF, or M4A.';
    if (f.size > 200 * 1024 * 1024) return 'Max 200 MB.';
    return null;
  };

  const pick = (f) => {
    if (!f) return;
    const err = validate(f);
    if (err) { alert(err); return; }
    onFile(f);
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
      onClick={() => !uploading && document.getElementById('ref-file-input').click()}
      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer select-none
        ${drag ? 'border-sky-400 bg-sky-400/5' : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.03]'}
        ${uploading ? 'pointer-events-none opacity-60' : ''}`}
    >
      <input id="ref-file-input" type="file" accept=".mp3,.wav,.flac,.aiff,.aif,.m4a,audio/*" className="hidden"
        onChange={e => { pick(e.target.files[0]); e.target.value = ''; }} />
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
          <p className="text-white/50 text-sm">Uploading & analysing…</p>
          <p className="text-white/25 text-xs">This may take a minute</p>
        </div>
      ) : (
        <>
          <Upload className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 font-medium text-sm mb-1">Drop reference track here</p>
          <p className="text-white/25 text-xs">MP3 · WAV · FLAC · AIFF · M4A · up to 200 MB</p>
        </>
      )}
    </div>
  );
}

// ── Analysis result view ────────────────────────────────────────────
function AnalysisResult({ analysis, onDelete }) {
  const [compareJob, setCompareJob] = useState(null);

  const eqData = analysis.eq_curve;
  const compareEqData = compareJob?.analysis?.eq_curve || null;

  // Build side-by-side stat comparison
  const refLufs = analysis.lufs;
  const cmpLufs = compareJob?.analysis?.lufs ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 flex items-center justify-center shrink-0">
            <Music2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-semibold truncate">{analysis.title || analysis.reference_filename || 'Reference Track'}</h2>
            <p className="text-white/30 text-xs mt-0.5">{format(new Date(analysis.created_date), 'MMM d, yyyy · h:mm a')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <JobComparisonPicker selectedJob={compareJob} onSelect={setCompareJob} />
          <button onClick={onDelete} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/25 hover:text-red-400 hover:bg-white/5 transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* If comparing, show a side-by-side header */}
      {compareJob && (
        <div className="grid grid-cols-2 gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl text-xs">
          <div>
            <p className="text-sky-300 font-semibold mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
              Reference
            </p>
            <p className="text-white/60 truncate">{analysis.title || analysis.reference_filename}</p>
            {refLufs != null && <p className="text-white/35 mt-0.5">{refLufs.toFixed(1)} LUFS</p>}
          </div>
          <div>
            <p className="text-emerald-300 font-semibold mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Your Track
            </p>
            <p className="text-white/60 truncate">{compareJob.input_filename || compareJob.title}</p>
            {cmpLufs != null && <p className="text-white/35 mt-0.5">{cmpLufs.toFixed(1)} LUFS</p>}
          </div>
        </div>
      )}

      {/* Key metrics */}
      <ReferenceMetrics analysis={analysis} />

      {/* EQ chart */}
      <ReferenceEQChart
        eqData={eqData}
        compareData={compareEqData}
        compareName={compareJob ? (compareJob.input_filename || 'Your Track') : null}
      />

      {/* Dynamics / Stereo text + guidance */}
      <GuidanceList
        guidance={analysis.guidance}
        dynamicAnalysis={analysis.dynamic_range?.analysis}
        stereoAnalysis={analysis.stereo_width?.analysis}
      />

      {/* Side-by-side diff recommendations when comparing */}
      {compareJob && (refLufs != null || cmpLufs != null) && (
        <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-5 space-y-3">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Comparison Insights</p>
          {refLufs != null && cmpLufs != null && (
            <div className="text-sm text-white/60 leading-relaxed">
              <span className="text-white font-medium">Loudness gap: </span>
              {Math.abs(refLufs - cmpLufs).toFixed(1)} LUFS.{' '}
              {refLufs > cmpLufs
                ? `Your reference is louder than the separated track by ${Math.abs(refLufs - cmpLufs).toFixed(1)} LUFS. Consider applying more limiting or gain on the separated stems.`
                : `The separated track is louder than your reference. Pull back the master fader or reduce limiter ceiling by ${Math.abs(refLufs - cmpLufs).toFixed(1)} dB.`
              }
            </div>
          )}
          {compareJob.stereo_width && analysis.stereo_width && (
            <div className="text-sm text-white/60 leading-relaxed">
              <span className="text-white font-medium">Stereo width: </span>
              Reference is {analysis.stereo_width.width_percentage?.toFixed(0)}% vs your track's {compareJob.analysis?.stereo_width?.width_percentage?.toFixed(0) ?? '?'}%.
              {' '}Adjust stereo imaging plugins on the master bus accordingly.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────
export default function ReferenceMixAssistant() {
  const [uploading, setUploading] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    base44.auth.me().catch(() => base44.auth.redirectToLogin('/ReferenceMixAssistant'));
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    setLoadingHistory(true);
    const list = await base44.entities.ReferenceAnalysis.list('-created_date', 20);
    setAnalyses(list);
    if (list.length > 0 && !selected) setSelected(list[0]);
    setLoadingHistory(false);
  };

  const handleFile = async (file) => {
    setUploading(true);
    setError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.functions.invoke('analyzeReference', {
        title: file.name.replace(/\.[^.]+$/, ''),
        reference_file_url: file_url,
        reference_filename: file.name,
      });
      await loadAnalyses();
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (analysis) => {
    await base44.entities.ReferenceAnalysis.delete(analysis.id);
    const updated = analyses.filter(a => a.id !== analysis.id);
    setAnalyses(updated);
    setSelected(updated[0] || null);
  };

  const doneAnalyses = analyses.filter(a => a.status === 'done');

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-sky-500/20 flex items-center justify-center">
          <FlaskConical className="w-4 h-4 text-sky-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Reference Mix Assistant</h1>
          <p className="text-white/35 text-sm mt-0.5">Upload a reference track to get LUFS, EQ, dynamics, and stereo analysis.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
          <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Layout: history sidebar + main content */}
      <div className="flex gap-5">
        {/* Sidebar: history */}
        <div className="w-48 shrink-0 space-y-2">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest px-1">History</p>
          {loadingHistory ? (
            <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
          ) : doneAnalyses.length === 0 ? (
            <p className="text-white/20 text-xs px-1 py-4">No analyses yet.</p>
          ) : (
            doneAnalyses.map(a => (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all ${
                  selected?.id === a.id
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/20'
                    : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <p className="font-medium truncate">{a.title || a.reference_filename}</p>
                <p className="text-white/25 mt-0.5 tabular-nums">{format(new Date(a.created_date), 'MMM d')}</p>
              </button>
            ))
          )}

          <button
            onClick={() => setSelected(null)}
            className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-400/10 transition-all flex items-center gap-1.5 mt-1"
          >
            <Upload className="w-3 h-3" />
            New analysis
          </button>
        </div>

        {/* Main panel */}
        <div className="flex-1 min-w-0">
          {selected && selected.status === 'done' ? (
            <AnalysisResult
              key={selected.id}
              analysis={selected}
              onDelete={() => handleDelete(selected)}
            />
          ) : selected && selected.status === 'analyzing' ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
              <p className="text-white/50 text-sm">Analysing your reference track…</p>
              <button onClick={loadAnalyses} className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
          ) : (
            <UploadZone onFile={handleFile} uploading={uploading} />
          )}
        </div>
      </div>
    </div>
  );
}