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
import { Upload, Music, AlertCircle, Info } from 'lucide-react';

export default function NewJob() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [separationMode, setSeparationMode] = useState('two_stems');
  const [outputFormat, setOutputFormat] = useState('wav');
  const [hasRights, setHasRights] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

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
      // Upload file first
      setUploadProgress(30);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setUploadProgress(60);

      // Create job
      const response = await base44.functions.invoke('createJobAndStart', {
        title: title || file.name,
        input_file_url: file_url,
        input_file_meta: {
          filename: file.name,
          mime: file.type,
          size: file.size
        },
        separation_mode: separationMode,
        output_format: outputFormat
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                  <input
                    id="file"
                    type="file"
                    accept=".mp3,.wav,audio/mpeg,audio/wav"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    {file ? (
                      <div>
                        <p className="font-medium text-purple-600">{file.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">Click to upload audio file</p>
                        <p className="text-sm text-gray-500 mt-1">MP3 or WAV, max 50MB</p>
                      </div>
                    )}
                  </label>
                </div>
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
                <Label htmlFor="format">Output Format *</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wav">WAV (Lossless)</SelectItem>
                    <SelectItem value="mp3">MP3 (Compressed)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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