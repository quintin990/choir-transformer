import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Music, AlertCircle, Info, Cloud } from 'lucide-react';
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
  const [cloudFile, setCloudFile] = useState(null); // { file_url, file_name }

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch {
        base44.auth.redirectToLogin('/NewJob');
      }
    };
    loadUser();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(mp3|wav)$/i)) {
      setError('Please upload an MP3 or WAV file');
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSize) {
      setError('File size must be under 50MB. For large WAV files, consider exporting as 16-bit 44.1kHz or MP3 320kbps.');
      return;
    }

    setFile(selectedFile);
    setError('');
    if (!title) {
      setTitle(selectedFile.name.replace(/\.(mp3|wav)$/i, ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an audio file');
      return;
    }

    if (!hasRights) {
      setError('Please confirm you have rights to process this audio');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      let file_url;

      if (cloudFile) {
        // Already uploaded from cloud
        file_url = cloudFile.file_url;
        setUploadProgress(60);
      } else {
        // Upload file first
        setUploadProgress(30);
        const result = await base44.integrations.Core.UploadFile({ file });
        file_url = result.file_url;
        setUploadProgress(60);
      }

      // Build output settings
      const outputSettings = {};
      if (outputFormat === 'mp3') {
        outputSettings.bitrate = mp3Bitrate;
        outputSettings.mode = mp3Mode;
      } else if (outputFormat === 'wav') {
        outputSettings.bit_depth = wavBitDepth;
        outputSettings.sample_rate = wavSampleRate;
      }

      // Create job
      const inputFilename = cloudFile ? cloudFile.file_name : file.name;
      const response = await base44.functions.invoke('createJobAndStart', {
        title: title || inputFilename,
        input_file_url: file_url,
        input_file_meta: {
          filename: inputFilename,
          mime: cloudFile ? 'audio/mpeg' : file.type,
          size: cloudFile ? 0 : file.size
        },
        separation_mode: separationMode,
        separation_model: separationModel,
        output_format: outputFormat,
        output_settings: outputSettings,
        apply_repair: applyRepair
      });

      setUploadProgress(100);

      if (response.data.job_id) {
        navigate('/JobDetail?id=' + response.data.job_id);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create job. Please try again.');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Music className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">New Separation Job</h1>
          <p className="text-gray-600">Upload your audio track and choose separation settings</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="file">Audio File *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    id="file"
                    type="file"
                    accept=".mp3,.wav,audio/mpeg,audio/wav"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    {file || cloudFile ? (
                      <div>
                        <p className="font-medium text-primary">{cloudFile ? cloudFile.file_name : file.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {cloudFile ? 'From Google Drive' : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">Click to upload audio file</p>
                        <p className="text-sm text-muted-foreground mt-1">MP3 or WAV, max 50MB</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">or import from</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setCloudPickerOpen(true)}
                >
                  <Cloud className="w-4 h-4" />
                  Pick from Google Drive
                </Button>

                <CloudFilePicker
                  open={cloudPickerOpen}
                  onClose={() => setCloudPickerOpen(false)}
                  provider="google_drive"
                  onSelect={(f) => {
                    setCloudFile(f);
                    setFile(null);
                    if (!title) setTitle(f.file_name.replace(/\.[^.]+$/, ''));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Track Title (Optional)</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Track"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode">Separation Mode *</Label>
                <Select value={separationMode} onValueChange={setSeparationMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="two_stems">Two Stems (Vocals + Band)</SelectItem>
                    <SelectItem value="four_stems">Four Stems (Vocals + Drums + Bass + Other)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">AI Model *</Label>
                <Select value={separationModel} onValueChange={setSeparationModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fast">Fast (2-3 min, good quality)</SelectItem>
                    <SelectItem value="balanced">Balanced (3-5 min, great quality)</SelectItem>
                    <SelectItem value="high_quality">High Quality (5-8 min, excellent)</SelectItem>
                    <SelectItem value="artifact_free">Artifact-Free (8-12 min, pristine)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="repair"
                  checked={applyRepair}
                  onCheckedChange={setApplyRepair}
                />
                <label htmlFor="repair" className="text-sm cursor-pointer">
                  Apply AI audio repair to reduce separation artifacts
                </label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Output Format *</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wav">WAV (Lossless, uncompressed)</SelectItem>
                    <SelectItem value="flac">FLAC (Lossless, compressed)</SelectItem>
                    <SelectItem value="mp3">MP3 (Lossy, small files)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {outputFormat === 'mp3' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bitrate">MP3 Bitrate</Label>
                    <Select value={mp3Bitrate} onValueChange={setMp3Bitrate}>
                      <SelectTrigger>
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
                  <div className="space-y-2">
                    <Label htmlFor="mp3mode">Encoding Mode</Label>
                    <Select value={mp3Mode} onValueChange={setMp3Mode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cbr">CBR (Constant)</SelectItem>
                        <SelectItem value="vbr">VBR (Variable)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {outputFormat === 'wav' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bitdepth">Bit Depth</Label>
                    <Select value={wavBitDepth} onValueChange={setWavBitDepth}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16">16-bit</SelectItem>
                        <SelectItem value="24">24-bit</SelectItem>
                        <SelectItem value="32">32-bit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="samplerate">Sample Rate</Label>
                    <Select value={wavSampleRate} onValueChange={setWavSampleRate}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="44100">44.1 kHz</SelectItem>
                        <SelectItem value="48000">48 kHz</SelectItem>
                        <SelectItem value="88200">88.2 kHz</SelectItem>
                        <SelectItem value="96000">96 kHz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="rights"
                  checked={hasRights}
                  onCheckedChange={setHasRights}
                />
                <label htmlFor="rights" className="text-sm cursor-pointer">
                  I confirm I have the rights to process this audio file
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={loading || !file || !hasRights}
              >
                {loading ? 'Starting...' : 'Start Separation'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              FAQ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium mb-1">What files are supported?</p>
              <p className="text-gray-600">MP3 and WAV files up to 50MB</p>
            </div>
            <div>
              <p className="font-medium mb-1">Recommended WAV export settings</p>
              <p className="text-gray-600">16-bit, 44.1kHz, stereo - or export as MP3 320kbps for smaller files</p>
            </div>
            <div>
              <p className="font-medium mb-1">How long does processing take?</p>
              <p className="text-gray-600">Typically 2-5 minutes depending on track length</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}