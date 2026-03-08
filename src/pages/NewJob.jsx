import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Music2, AlertCircle, Cloud, Loader2, X } from 'lucide-react';
import CloudFilePicker from '../components/cloud/CloudFilePicker';

export default function NewJob() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [separationMode, setSeparationMode] = useState('two_stems');
  const [separationModel, setSeparationModel] = useState('balanced');
  const [applyRepair, setApplyRepair] = useState(false);
  const [outputFormat, setOutputFormat] = useState('wav');
  const [mp3Bitrate, setMp3Bitrate] = useState('320');
  const [mp3Mode, setMp3Mode] = useState('cbr');
  const [wavSampleRate, setWavSampleRate] = useState('44100');
  const [wavBitDepth, setWavBitDepth] = useState('16');
  const [hasRights, setHasRights] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cloudPickerOpen, setCloudPickerOpen] = useState(false);
  const [cloudFile, setCloudFile] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin('/NewJob'));
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/x-wav'];
    if (!validTypes.includes(f.type) && !f.name.match(/\.(mp3|wav|flac|m4a|aiff)$/i)) {
      setError('Please upload an audio file (MP3, WAV, FLAC)');
      return;
    }
    if (f.size > 200 * 1024 * 1024) {
      setError('File must be under 200MB');
      return;
    }
    setFile(f);
    setCloudFile(null);
    setError('');
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !cloudFile) { setError('Please select an audio file'); return; }
    if (!hasRights) { setError('Please confirm you have the rights to process this file'); return; }

    setLoading(true);
    setError('');
    setUploadProgress(10);

    try {
      let file_url;
      if (cloudFile) {
        file_url = cloudFile.file_url;
        setUploadProgress(50);
      } else {
        setUploadProgress(30);
        const result = await base44.integrations.Core.UploadFile({ file });
        file_url = result.file_url;
        setUploadProgress(60);
      }

      const outputSettings = {};
      if (outputFormat === 'mp3') { outputSettings.bitrate = mp3Bitrate; outputSettings.mode = mp3Mode; }
      else if (outputFormat === 'wav') { outputSettings.bit_depth = wavBitDepth; outputSettings.sample_rate = wavSampleRate; }

      const inputFilename = cloudFile ? cloudFile.file_name : file.name;
      const response = await base44.functions.invoke('createJobAndStart', {
        title: title || inputFilename,
        input_file_url: file_url,
        input_file_meta: { filename: inputFilename, mime: cloudFile ? 'audio/mpeg' : file.type, size: cloudFile ? 0 : file.size },
        separation_mode: separationMode,
        separation_model: separationModel,
        output_format: outputFormat,
        output_settings: outputSettings,
        apply_repair: applyRepair,
      });

      setUploadProgress(100);
      if (response.data.job_id) navigate('/JobDetail?id=' + response.data.job_id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create job. Please try again.');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
      </div>
    );
  }

  const activeFile = cloudFile || file;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">New separation job</h1>
        <p className="text-white/40 text-sm mt-0.5">Upload a track and choose your settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* File upload */}
        <div className="space-y-2">
          <Label className="text-white/60 text-xs uppercase tracking-wider">Audio file</Label>
          {activeFile ? (
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3">
              <Music2 className="w-4 h-4 text-violet-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{cloudFile ? cloudFile.file_name : file.name}</p>
                <p className="text-xs text-white/30">
                  {cloudFile ? 'From Google Drive' : `${(file.size / 1024 / 1024).toFixed(1)} MB`}
                </p>
              </div>
              <button type="button" onClick={() => { setFile(null); setCloudFile(null); }} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label htmlFor="file-input" className="flex flex-col items-center justify-center bg-white/[0.02] border-2 border-dashed border-white/10 rounded-xl p-8 cursor-pointer hover:border-violet-500/40 hover:bg-white/[0.04] transition-all">
              <Upload className="w-6 h-6 text-white/30 mb-2" />
              <p className="text-sm text-white/50">Drop audio file or click to browse</p>
              <p className="text-xs text-white/25 mt-1">MP3, WAV, FLAC · max 200MB</p>
              <input id="file-input" type="file" accept=".mp3,.wav,.flac,.m4a,.aiff,audio/*" onChange={handleFileChange} className="hidden" />
            </label>
          )}
          <button
            type="button"
            onClick={() => setCloudPickerOpen(true)}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-violet-400 transition-colors py-1"
          >
            <Cloud className="w-3.5 h-3.5" />
            Import from Google Drive
          </button>
          <CloudFilePicker
            open={cloudPickerOpen}
            onClose={() => setCloudPickerOpen(false)}
            provider="google_drive"
            onSelect={(f) => { setCloudFile(f); setFile(null); if (!title) setTitle(f.file_name.replace(/\.[^.]+$/, '')); }}
          />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-white/60 text-xs uppercase tracking-wider">Track title (optional)</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My track"
            className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus:border-violet-500/50"
          />
        </div>

        {/* Settings grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-white/60 text-xs uppercase tracking-wider">Stems</Label>
            <Select value={separationMode} onValueChange={setSeparationMode}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="two_stems">2 stems (vocals + band)</SelectItem>
                <SelectItem value="four_stems">4 stems (vocals, drums, bass, other)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white/60 text-xs uppercase tracking-wider">Model quality</Label>
            <Select value={separationModel} onValueChange={setSeparationModel}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">Fast (~2 min)</SelectItem>
                <SelectItem value="balanced">Balanced (~4 min)</SelectItem>
                <SelectItem value="high_quality">High quality (~7 min)</SelectItem>
                <SelectItem value="artifact_free">Artifact-free (~12 min)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white/60 text-xs uppercase tracking-wider">Output format</Label>
            <Select value={outputFormat} onValueChange={setOutputFormat}>
              <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wav">WAV (lossless)</SelectItem>
                <SelectItem value="flac">FLAC (compressed)</SelectItem>
                <SelectItem value="mp3">MP3 (lossy)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {outputFormat === 'mp3' && (
            <div className="space-y-2">
              <Label className="text-white/60 text-xs uppercase tracking-wider">MP3 bitrate</Label>
              <Select value={mp3Bitrate} onValueChange={setMp3Bitrate}>
                <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="128">128 kbps</SelectItem>
                  <SelectItem value="192">192 kbps</SelectItem>
                  <SelectItem value="256">256 kbps</SelectItem>
                  <SelectItem value="320">320 kbps</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {outputFormat === 'wav' && (
            <div className="space-y-2">
              <Label className="text-white/60 text-xs uppercase tracking-wider">Bit depth</Label>
              <Select value={wavBitDepth} onValueChange={setWavBitDepth}>
                <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16">16-bit</SelectItem>
                  <SelectItem value="24">24-bit</SelectItem>
                  <SelectItem value="32">32-bit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Repair checkbox */}
        <div className="flex items-center gap-3">
          <Checkbox
            id="repair"
            checked={applyRepair}
            onCheckedChange={setApplyRepair}
            className="border-white/20"
          />
          <label htmlFor="repair" className="text-sm text-white/50 cursor-pointer">Apply AI audio repair (+1 credit)</label>
        </div>

        {/* Progress */}
        {loading && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-white/40">
              <span>Uploading…</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5">
              <div className="bg-violet-500 h-1.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        {/* Rights + submit */}
        <div className="space-y-4 pt-1">
          <div className="flex items-start gap-3">
            <Checkbox
              id="rights"
              checked={hasRights}
              onCheckedChange={setHasRights}
              className="border-white/20 mt-0.5"
            />
            <label htmlFor="rights" className="text-xs text-white/40 cursor-pointer leading-relaxed">
              I confirm I have the rights to process this audio file
            </label>
          </div>

          <Button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-500 text-white border-0 h-11"
            disabled={loading || (!file && !cloudFile) || !hasRights}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing…</>
            ) : (
              'Start separation'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}