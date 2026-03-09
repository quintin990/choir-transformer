import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, HelpCircle, ChevronDown } from 'lucide-react';
import FileDropZone from '../components/jobs/FileDropZone';

const FAQ = [
  { q: 'What file formats are supported?', a: 'MP3, WAV, FLAC, AIFF, and M4A. Maximum file size is 200 MB.' },
  { q: 'How long does processing take?', a: 'Typically 2–10 minutes depending on file length and chosen quality.' },
  { q: 'What happens to my files?', a: 'Your files are stored for 7 days then permanently deleted from our servers.' },
  { q: 'What is the difference between 2 and 4 stems?', a: '2 stems gives you Vocals + Band (everything else). 4 stems splits further into Vocals, Drums, Bass, and Other.' },
];

export default function NewJob() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
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

  const handleFile = (f, err) => {
    setFile(f);
    setFileError(err || '');
    if (f && !err) setTitle(f.name.replace(/\.[^.]+$/, ''));
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
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">New Job</h1>
        <p className="text-white/40 text-sm mt-1">Upload a track and configure your separation settings.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert className="bg-red-500/10 border-red-500/20">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {/* Drop zone */}
        <div className="space-y-2">
          <Label className="text-white/60 text-xs font-medium">Audio File</Label>
          <FileDropZone file={file} onFile={handleFile} />
          {fileError && <p className="text-red-400 text-xs mt-1">{fileError}</p>}
        </div>

        {/* Title */}
        {file && !fileError && (
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs font-medium">Title</Label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Track title"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/60 transition-colors"
            />
          </div>
        )}

        {/* Settings row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs font-medium">Stems</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="bg-white/[0.04] border-white/10 text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="two_stems">2 Stems – Vocals & Band</SelectItem>
                <SelectItem value="four_stems">4 Stems – Full Split</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs font-medium">Quality</Label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="bg-white/[0.04] border-white/10 text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">Fast</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="high_quality">High Quality</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs font-medium">Format</Label>
            <Select value={outputFormat} onValueChange={setOutputFormat}>
              <SelectTrigger className="bg-white/[0.04] border-white/10 text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wav">WAV (Lossless)</SelectItem>
                <SelectItem value="flac">FLAC (Compressed)</SelectItem>
                <SelectItem value="mp3">MP3 (Lossy)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rights checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={rights}
            onChange={handleRights}
            className="mt-0.5 accent-violet-500 w-4 h-4 shrink-0"
          />
          <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors leading-relaxed">
            I confirm I own or have the necessary rights to process this audio file.
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />{uploadProgress || 'Processing…'}</>
          ) : 'Upload & Start'}
        </button>
      </form>

      {/* FAQ */}
      <div className="border-t border-white/5 pt-6 space-y-0.5">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-4 h-4 text-white/30" />
          <span className="text-xs font-semibold text-white/30 uppercase tracking-widest">FAQ</span>
        </div>
        {FAQ.map((faq, i) => (
          <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/[0.03] transition-all text-left"
            >
              {faq.q}
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
            </button>
            {openFaq === i && (
              <div className="px-4 pb-3 text-sm text-white/40 leading-relaxed">{faq.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}