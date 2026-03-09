import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, Music2, X, ChevronDown, HelpCircle } from 'lucide-react';

const ACCEPTED_EXT = /\.(mp3|wav|flac|aiff|aif|m4a)$/i;
const MAX_SIZE = 200 * 1024 * 1024;

const FAQ = [
  { q: 'What file formats are supported?', a: 'MP3, WAV, FLAC, AIFF, and M4A. Maximum file size is 200 MB.' },
  { q: 'How long does processing take?', a: 'Typically 1–5 minutes depending on track length and quality setting.' },
  { q: 'What happens to my files?', a: 'Files are stored for 7 days then permanently deleted from our servers.' },
  { q: '2 stems vs 4 stems?', a: '2 stems gives you Vocals + Band. 4 stems splits into Vocals, Drums, Bass, and Other.' },
];

export default function NewJob() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState('two_stems');
  const [quality, setQuality] = useState('balanced');
  const [outputFormat, setOutputFormat] = useState('wav');
  const [rights, setRights] = useState(false);
  const [rightsAt, setRightsAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    base44.auth.me().catch(() => base44.auth.redirectToLogin('/NewJob'));
  }, []);

  const validate = (f) => {
    if (!ACCEPTED_EXT.test(f.name)) return 'Unsupported format. Use MP3, WAV, FLAC, AIFF, or M4A.';
    if (f.size > MAX_SIZE) return 'File exceeds 200 MB limit.';
    return null;
  };

  const pickFile = (f) => {
    if (!f) return;
    const err = validate(f);
    setFile(f);
    setFileError(err || '');
    if (!err) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files[0]);
  };

  const handleRights = (e) => {
    setRights(e.target.checked);
    setRightsAt(e.target.checked ? new Date().toISOString() : null);
  };

  const canSubmit = file && !fileError && rights && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    setUploadProgress('Uploading file…');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadProgress('Starting separation…');
      const res = await base44.functions.invoke('createJobAndStart', {
        title,
        input_file_url: file_url,
        input_file_meta: { filename: file.name, mime: file.type, size: file.size },
        separation_mode: mode,
        separation_model: quality,
        output_format: outputFormat,
        apply_repair: false,
        rights_confirmed: true,
        rights_confirmed_at: rightsAt,
      });
      navigate(`${createPageUrl('JobDetail')}?id=${res.data.job_id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-8 pt-2">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Separate your track</h1>
        <p className="text-white/35 text-sm mt-1.5">Drag in a song and we'll split it into stems using AI.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Alert className="bg-red-500/10 border-red-500/20">
            <AlertDescription className="text-red-400 text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !file && document.getElementById('audio-input').click()}
          className={`rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none
            ${dragging ? 'border-sky-400 bg-sky-500/5' :
              file && !fileError ? 'border-sky-500/30 bg-sky-500/5 cursor-default' :
              'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.03]'}
            ${fileError ? 'border-red-500/40 bg-red-500/5' : ''}
          `}
        >
          <input
            id="audio-input" type="file"
            accept=".mp3,.wav,.flac,.aiff,.aif,.m4a,audio/*"
            className="hidden"
            onChange={e => { pickFile(e.target.files[0]); e.target.value = ''; }}
          />
          {file ? (
            <div className="px-6 py-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center shrink-0">
                <Music2 className="w-5 h-5 text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate text-sm">{file.name}</p>
                <p className="text-white/35 text-xs mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                {fileError && <p className="text-red-400 text-xs mt-0.5">{fileError}</p>}
              </div>
              <button type="button" onClick={e => { e.stopPropagation(); setFile(null); setFileError(''); }}
                className="text-white/30 hover:text-white/70 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="py-14 text-center px-6">
              <Upload className="w-9 h-9 text-white/15 mx-auto mb-4" />
              <p className="text-white/60 font-medium text-sm mb-1">Drop your audio file here</p>
              <p className="text-white/25 text-xs">or click to browse · MP3, WAV, FLAC, AIFF · up to 200 MB</p>
            </div>
          )}
        </div>

        {/* Title (only when file selected) */}
        {file && !fileError && (
          <div>
            <label className="text-xs text-white/40 font-medium block mb-1.5">Track title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Track title"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-sky-500/50 transition-colors"
            />
          </div>
        )}

        {/* Settings */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Stems', value: mode, onChange: setMode,
              options: [{ v: 'two_stems', l: '2 Stems' }, { v: 'four_stems', l: '4 Stems' }]
            },
            {
              label: 'Quality', value: quality, onChange: setQuality,
              options: [{ v: 'fast', l: 'Fast' }, { v: 'balanced', l: 'Balanced' }, { v: 'high_quality', l: 'High Quality' }]
            },
            {
              label: 'Format', value: outputFormat, onChange: setOutputFormat,
              options: [{ v: 'wav', l: 'WAV' }, { v: 'flac', l: 'FLAC' }, { v: 'mp3', l: 'MP3' }]
            },
          ].map(({ label, value, onChange, options }) => (
            <div key={label}>
              <label className="text-xs text-white/40 font-medium block mb-1.5">{label}</label>
              <Select value={value} onValueChange={onChange}>
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

        {/* Rights */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input type="checkbox" checked={rights} onChange={handleRights}
            className="mt-0.5 accent-sky-500 w-4 h-4 shrink-0" />
          <span className="text-sm text-white/45 group-hover:text-white/65 transition-colors leading-relaxed">
            I own or have the necessary rights to process this audio file.
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full h-12 rounded-full bg-sky-500 hover:bg-sky-400 disabled:opacity-35 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />{uploadProgress || 'Processing…'}</>
          ) : 'Upload & Start Separation'}
        </button>
      </form>

      {/* FAQ */}
      <div className="border-t border-white/[0.05] pt-6 space-y-1">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-3.5 h-3.5 text-white/20" />
          <span className="text-xs font-semibold text-white/25 uppercase tracking-[0.15em]">FAQ</span>
        </div>
        {FAQ.map((faq, i) => (
          <div key={i} className="rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.03] transition-all text-left rounded-xl"
            >
              {faq.q}
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform text-white/25 ${openFaq === i ? 'rotate-180' : ''}`} />
            </button>
            {openFaq === i && (
              <div className="px-4 pb-3 text-sm text-white/35 leading-relaxed">{faq.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}