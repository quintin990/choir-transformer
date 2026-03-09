import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, List, Lock } from 'lucide-react';
import Card, { CardHeader } from '../components/auralyn/Card';
import BatchUploadManager from '../components/queue/BatchUploadManager';
import QueueDashboard from '../components/queue/QueueDashboard';
import { ProBadge } from '../components/auralyn/ProBadge';

export default function QueueManager() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [mode, setMode] = useState('two_stems');
  const [quality, setQuality] = useState('balanced');
  const [outputFormat, setOutputFormat] = useState('wav');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState('free');
  const [error, setError] = useState('');

  React.useEffect(() => {
    base44.auth.me().catch(() => base44.auth.redirectToLogin('/QueueManager'));
    base44.functions.invoke('syncProfilePlan', {}).then(res => setPlan(res.data?.plan || 'free')).catch(() => {});
  }, []);

  const handleStart = async () => {
    if (files.length === 0) {
      setError('Select at least one file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        await base44.functions.invoke('createJob', {
          kind: 'stems',
          title: file.name.replace(/\.[^.]+$/, ''),
          input_file_url: file_url,
          input_file_name: file.name,
          input_file_size_bytes: file.size,
          input_mime: file.type,
          mode,
          quality,
          output_format: outputFormat,
          rights_confirmed: true,
        });
      }
      setFiles([]);
      navigate(createPageUrl('Jobs'));
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-2.5 mb-1.5">
          <List className="w-4 h-4" style={{ color: '#1EA0FF' }} />
          <h1 className="text-xl font-bold" style={{ color: '#EAF2FF', letterSpacing: '-0.02em' }}>Batch Upload</h1>
        </div>
        <p className="text-sm" style={{ color: '#9CB2D6' }}>Upload multiple tracks and process them in the background.</p>
      </div>

      {error && (
        <div className="rounded-lg border px-4 py-3 text-sm" style={{ backgroundColor: '#FF4D6D10', borderColor: '#FF4D6D30', color: '#FF4D6D' }}>
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Upload */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Add audio files" subtitle="Upload up to 10 files at once" />
            <BatchUploadManager onFilesSelected={setFiles} maxFiles={10} />
          </Card>
        </div>

        {/* Settings */}
        <Card>
          <CardHeader title="Settings" />
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CB2D6' }}>Separation mode</label>
              <Select value={mode} onValueChange={v => { if (v === 'four_stems' && plan === 'free') return; setMode(v); }}>
                <SelectTrigger className="h-9 text-sm rounded-lg" style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', color: '#EAF2FF' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="two_stems">2 Stems</SelectItem>
                  <SelectItem value="four_stems" disabled={plan === 'free'}>
                    <span className="flex items-center gap-1">
                      {plan === 'free' && <Lock className="w-3 h-3" />}
                      4 Stems {plan === 'free' && <ProBadge />}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CB2D6' }}>Quality</label>
              <Select value={quality} onValueChange={v => { if (v === 'hq' && plan === 'free') return; setQuality(v); }}>
                <SelectTrigger className="h-9 text-sm rounded-lg" style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', color: '#EAF2FF' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="hq" disabled={plan === 'free'}>HQ {plan === 'free' && <ProBadge />}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CB2D6' }}>Format</label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger className="h-9 text-sm rounded-lg" style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', color: '#EAF2FF' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wav">WAV</SelectItem>
                  <SelectItem value="mp3">MP3</SelectItem>
                  <SelectItem value="flac">FLAC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <button disabled={!files.length || loading} onClick={handleStart}
              className="w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</> : `Process ${files.length} file${files.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </Card>
      </div>

      {/* Queue Dashboard */}
      <Card>
        <CardHeader title="Processing Queue" subtitle="Monitor all your jobs in real-time" />
        <div className="pt-4">
          <QueueDashboard />
        </div>
      </Card>
    </div>
  );
}