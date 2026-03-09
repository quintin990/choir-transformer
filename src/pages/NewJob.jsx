import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, Music2, X, CheckCircle2, AlertCircle, Clock, ArrowRight, ChevronDown, HelpCircle } from 'lucide-react';

const ACCEPTED_EXT = /\.(mp3|wav|flac|aiff|aif|m4a)$/i;
const MAX_SIZE = 200 * 1024 * 1024;

const FAQ = [
  { q: 'Can I process multiple tracks at once?', a: 'Yes — drop multiple files at once. They process sequentially, one after another.' },
  { q: 'What formats are supported?', a: 'MP3, WAV, FLAC, AIFF, and M4A. Up to 200 MB per file.' },
  { q: 'How long does processing take?', a: 'Typically 1–5 minutes per track depending on length and quality setting.' },
  { q: '2 stems vs 4 stems?', a: '2 stems gives you Vocals + Band. 4 stems splits into Vocals, Drums, Bass, and Other.' },
];

const STATUS_CONFIG = {
  waiting:    { icon: Clock,          color: 'text-white/30', bg: 'bg-white/5',        label: 'Waiting' },
  uploading:  { icon: Loader2,        color: 'text-sky-400',  bg: 'bg-sky-500/10',     label: 'Uploading…', spin: true },
  processing: { icon: Loader2,        color: 'text-indigo-400', bg: 'bg-indigo-500/10', label: 'Processing…', spin: true },
  done:       { icon: CheckCircle2,   color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Done' },
  error:      { icon: AlertCircle,    color: 'text-red-400',  bg: 'bg-red-500/10',     label: 'Failed' },
};

let idCounter = 0;
const mkId = () => ++idCounter;

export default function NewJob() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState('two_stems');
  const [quality, setQuality] = useState('balanced');
  const [outputFormat, setOutputFormat] = useState('wav');
  const [rights, setRights] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    base44.auth.me().catch(() => base44.auth.redirectToLogin('/NewJob'));
  }, []);

  const validate = (f) => {
    if (!ACCEPTED_EXT.test(f.name)) return 'Unsupported format';
    if (f.size > MAX_SIZE) return 'Exceeds 200 MB';
    return null;
  };

  const addFiles = useCallback((files) => {
    const newItems = Array.from(files).map(f => ({
      id: mkId(),
      file: f,
      title: f.name.replace(/\.[^.]+$/, ''),
      error: validate(f),
      status: 'waiting',
      jobId: null,
    }));
    setQueue(q => [...q, ...newItems]);
  }, []);

  const removeItem = (id) => setQueue(q => q.filter(item => item.id !== id));
  const updateTitle = (id, title) => setQueue(q => q.map(item => item.id === id ? { ...item, title } : item));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const validQueue = queue.filter(item => !item.error);
  const canSubmit = validQueue.length > 0 && rights && !processing;

  const processQueue = async () => {
    setProcessing(true);
    const rightsAt = new Date().toISOString();
    let lastJobId = null;

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.error || item.status === 'done') continue;

      setQueue(q => q.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f));
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: item.file });
        setQueue(q => q.map((f, idx) => idx === i ? { ...f, status: 'processing' } : f));
        const res = await base44.functions.invoke('createJobAndStart', {
          title: item.title,
          input_file_url: file_url,
          input_file_meta: { filename: item.file.name, mime: item.file.type, size: item.file.size },
          separation_mode: mode,
          separation_model: quality,
          output_format: outputFormat,
          apply_repair: false,
          rights_confirmed: true,
          rights_confirmed_at: rightsAt,
        });
        lastJobId = res.data.job_id;
        setQueue(q => q.map((f, idx) => idx === i ? { ...f, status: 'done', jobId: res.data.job_id } : f));
      } catch (err) {
        setQueue(q => q.map((f, idx) => idx === i ? { ...f, status: 'error', error: err.response?.data?.error || 'Failed' } : f));
      }
    }
    setProcessing(false);
    if (lastJobId) navigate(`${createPageUrl('JobDetail')}?id=${lastJobId}`);
    else navigate(createPageUrl('Jobs'));
  };

  const totalValid = queue.filter(i => !i.error).length;
  const totalDone = queue.filter(i => i.status === 'done').length;

  return (
    <div className="max-w-xl mx-auto space-y-7 pt-2">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Separate your tracks</h1>
        <p className="text-white/35 text-sm mt-1">Drop one or multiple audio files to create a processing queue.</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
        onDrop={handleDrop}
        onClick={() => document.getElementById('audio-input').click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none
          ${dragging ? 'border-sky-400 bg-sky-500/8 scale-[1.01]' : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.03]'}
        `}
      >
        <input
          id="audio-input" type="file" multiple
          accept=".mp3,.wav,.flac,.aiff,.aif,.m4a,audio/*"
          className="hidden"
          onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
        />
        <div className="py-10 text-center px-6">
          <div className={`w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-colors ${dragging ? 'bg-sky-500/20' : 'bg-white/5'}`}>
            <Upload className={`w-5 h-5 transition-colors ${dragging ? 'text-sky-400' : 'text-white/25'}`} />
          </div>
          <p className="text-white/60 font-medium text-sm mb-1">
            {dragging ? 'Release to add files' : 'Drop audio files here'}
          </p>
          <p className="text-white/25 text-xs">or click to browse · MP3, WAV, FLAC, AIFF, M4A · up to 200 MB each</p>
        </div>
      </div>

      {/* Queue list */}
      {queue.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Queue · {queue.length} {queue.length === 1 ? 'file' : 'files'}
            </span>
            {processing && (
              <span className="text-xs text-sky-400 tabular-nums">{totalDone}/{totalValid} done</span>
            )}
          </div>

          {/* Progress bar when processing */}
          {processing && totalValid > 0 && (
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${(totalDone / totalValid) * 100}%` }}
              />
            </div>
          )}

          <div className="space-y-1.5">
            {queue.map((item, idx) => {
              const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.waiting;
              const Icon = cfg.icon;
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all
                    ${item.error ? 'border-red-500/20 bg-red-500/5' : `border-white/[0.06] bg-white/[0.025] ${item.status === 'done' ? 'opacity-60' : ''}`}
                  `}
                >
                  {/* Index */}
                  <span className="text-[11px] text-white/20 font-mono w-4 shrink-0 text-center">{idx + 1}</span>

                  {/* Icon */}
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${cfg.color} ${cfg.spin ? 'animate-spin' : ''}`} />
                  </div>

                  {/* Title input */}
                  <div className="flex-1 min-w-0">
                    {item.error ? (
                      <div>
                        <p className="text-sm text-white/60 truncate">{item.file.name}</p>
                        <p className="text-xs text-red-400 mt-0.5">{item.error}</p>
                      </div>
                    ) : (
                      <div>
                        <input
                          value={item.title}
                          onChange={e => updateTitle(item.id, e.target.value)}
                          disabled={processing}
                          className="w-full bg-transparent text-sm text-white placeholder-white/25 focus:outline-none disabled:opacity-50"
                        />
                        <p className="text-[11px] text-white/25 mt-0.5">
                          {(item.file.size / 1024 / 1024).toFixed(1)} MB
                          {item.status !== 'waiting' && ` · ${cfg.label}`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Remove / View */}
                  {item.status === 'done' && item.jobId ? (
                    <a
                      href={`${createPageUrl('JobDetail')}?id=${item.jobId}`}
                      className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 shrink-0"
                    >
                      View <ArrowRight className="w-3 h-3" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled={processing}
                      onClick={() => removeItem(item.id)}
                      className="text-white/20 hover:text-white/60 transition-colors disabled:opacity-30 shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="space-y-4">
        <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Settings</span>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Stems', value: mode, onChange: setMode, options: [{ v: 'two_stems', l: '2 Stems' }, { v: 'four_stems', l: '4 Stems' }] },
            { label: 'Quality', value: quality, onChange: setQuality, options: [{ v: 'fast', l: 'Fast' }, { v: 'balanced', l: 'Balanced' }, { v: 'high_quality', l: 'High Quality' }] },
            { label: 'Format', value: outputFormat, onChange: setOutputFormat, options: [{ v: 'wav', l: 'WAV' }, { v: 'flac', l: 'FLAC' }, { v: 'mp3', l: 'MP3' }] },
          ].map(({ label, value, onChange, options }) => (
            <div key={label}>
              <label className="text-xs text-white/35 font-medium block mb-1.5">{label}</label>
              <Select value={value} onValueChange={onChange} disabled={processing}>
                <SelectTrigger className="bg-white/[0.04] border-white/10 text-white rounded-xl h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      {/* Rights */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input type="checkbox" checked={rights} onChange={e => setRights(e.target.checked)}
          disabled={processing}
          className="mt-0.5 accent-sky-500 w-4 h-4 shrink-0 cursor-pointer" />
        <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors leading-relaxed">
          I own or have the necessary rights to process {queue.length > 1 ? 'these audio files' : 'this audio file'}.
        </span>
      </label>

      {/* Submit */}
      <button
        onClick={processQueue}
        disabled={!canSubmit}
        className="w-full h-12 rounded-full bg-sky-500 hover:bg-sky-400 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
      >
        {processing ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Processing {totalDone + 1} of {totalValid}…</>
        ) : (
          <>
            {queue.length > 1 ? `Process ${totalValid} track${totalValid !== 1 ? 's' : ''}` : 'Upload & Separate'}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* FAQ */}
      <div className="border-t border-white/[0.05] pt-6 space-y-0.5">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-3.5 h-3.5 text-white/20" />
          <span className="text-xs font-semibold text-white/25 uppercase tracking-[0.15em]">FAQ</span>
        </div>
        {FAQ.map((faq, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between px-3 py-3 text-sm text-white/45 hover:text-white/75 hover:bg-white/[0.03] transition-all text-left rounded-xl"
            >
              {faq.q}
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform text-white/20 ${openFaq === i ? 'rotate-180' : ''}`} />
            </button>
            {openFaq === i && (
              <div className="px-3 pb-3 text-sm text-white/30 leading-relaxed">{faq.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}