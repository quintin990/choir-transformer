import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Loader2, Music2 } from 'lucide-react';

export default function NewJob() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [separationMode, setSeparationMode] = useState('two_stems');
  const [separationModel, setSeparationModel] = useState('balanced');
  const [outputFormat, setOutputFormat] = useState('wav');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    base44.auth.me().catch(() => base44.auth.redirectToLogin('/NewJob'));
  }, []);

  const handleFile = (f) => {
    if (!f) return;
    const valid = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/x-flac', 'audio/aac', 'audio/ogg'];
    const validExt = /\.(mp3|wav|flac|aac|ogg|m4a)$/i;
    if (!valid.includes(f.type) && !validExt.test(f.name)) {
      setError('Please upload an audio file (MP3, WAV, FLAC, etc.)');
      return;
    }
    if (f.size > 200 * 1024 * 1024) {
      setError('File must be under 200MB');
      return;
    }
    setFile(f);
    setTitle(f.name.replace(/\.[^.]+$/, ''));
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select an audio file'); return; }

    setLoading(true);
    setUploading(true);
    setError('');

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploading(false);

      const res = await base44.functions.invoke('createJobAndStart', {
        title,
        input_file_url: file_url,
        input_file_meta: { filename: file.name, mime: file.type, size: file.size },
        separation_mode: separationMode,
        separation_model: separationModel,
        output_format: outputFormat,
        apply_repair: false,
      });

      navigate(`${createPageUrl('JobDetail')}?id=${res.data.job_id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start job. Please try again.');
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Separate Track</h1>
        <p className="text-white/40 text-sm mt-1">Upload an audio file and split it into stems with AI.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Alert className="bg-red-500/10 border-red-500/20">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {/* File drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer
            ${drag ? 'border-violet-400 bg-violet-400/5' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}
          onClick={() => document.getElementById('audio-file').click()}
        >
          <input id="audio-file" type="file" accept=".mp3,.wav,.flac,.aac,.ogg,.m4a,audio/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <Music2 className="w-5 h-5 text-violet-400 shrink-0" />
              <div className="text-left">
                <p className="text-white text-sm font-medium truncate max-w-[260px]">{file.name}</p>
                <p className="text-white/30 text-xs">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              <button type="button" onClick={e => { e.stopPropagation(); setFile(null); setTitle(''); }} className="ml-2 text-white/30 hover:text-white/60">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/60 text-sm font-medium">Drop audio file here or click to browse</p>
              <p className="text-white/25 text-xs mt-1">MP3, WAV, FLAC, AAC · max 200MB</p>
            </>
          )}
        </div>

        {/* Title */}
        {file && (
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Title</Label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50"
              placeholder="Track title"
            />
          </div>
        )}

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Stems</Label>
            <Select value={separationMode} onValueChange={setSeparationMode}>
              <SelectTrigger className="bg-white/[0.04] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="two_stems">2 Stems</SelectItem>
                <SelectItem value="four_stems">4 Stems</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Model</Label>
            <Select value={separationModel} onValueChange={setSeparationModel}>
              <SelectTrigger className="bg-white/[0.04] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">Fast</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="high_quality">High Quality</SelectItem>
                <SelectItem value="artifact_free">Artifact-Free</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-white/60 text-xs">Format</Label>
            <Select value={outputFormat} onValueChange={setOutputFormat}>
              <SelectTrigger className="bg-white/[0.04] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wav">WAV</SelectItem>
                <SelectItem value="flac">FLAC</SelectItem>
                <SelectItem value="mp3">MP3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" disabled={loading || !file} className="w-full bg-violet-600 hover:bg-violet-500 text-white border-0 h-11">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" />{uploading ? 'Uploading…' : 'Starting…'}</>
          ) : 'Start Separation'}
        </Button>
      </form>
    </div>
  );
}