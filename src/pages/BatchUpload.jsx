import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Loader2, Files, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BatchUpload() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [separationMode, setSeparationMode] = useState('two_stems');
  const [separationModel, setSeparationModel] = useState('balanced');
  const [outputFormat, setOutputFormat] = useState('wav');
  const [applyRepair, setApplyRepair] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch {
        base44.auth.redirectToLogin('/BatchUpload');
      }
    };
    loadUser();
  }, []);

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    
    for (const file of selectedFiles) {
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
      if (validTypes.includes(file.type) || file.name.match(/\.(mp3|wav)$/i)) {
        const maxSize = 50 * 1024 * 1024;
        if (file.size <= maxSize) {
          validFiles.push(file);
        }
      }
    }
    
    setFiles([...files, ...validFiles]);
    setError('');
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (files.length === 0) {
      setError('Please select at least one audio file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await base44.functions.invoke('createBatchJob', {
        files_count: files.length,
        separation_mode: separationMode,
        separation_model: separationModel,
        output_format: outputFormat,
        apply_repair: applyRepair
      });

      const batchJobId = response.data.batch_job_id;

      // Upload and create jobs for each file
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        await base44.functions.invoke('createJobAndStart', {
          title: file.name.replace(/\.(mp3|wav)$/i, ''),
          input_file_url: file_url,
          input_file_meta: {
            filename: file.name,
            mime: file.type,
            size: file.size
          },
          separation_mode: separationMode,
          separation_model: separationModel,
          output_format: outputFormat,
          apply_repair: applyRepair,
          batch_job_id: batchJobId
        });
      }

      navigate('/BatchDetail?id=' + batchJobId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create batch job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Link to="/Landing">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Files className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold">Batch Processing</h1>
          </div>
          <p className="text-gray-600">Upload and process multiple audio files at once</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Multiple Files</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Audio Files (MP3 or WAV, max 50MB each)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                  <input
                    id="files"
                    type="file"
                    accept=".mp3,.wav,audio/mpeg,audio/wav"
                    onChange={handleFilesChange}
                    className="hidden"
                    multiple
                  />
                  <label htmlFor="files" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="font-medium">Click to select multiple files</p>
                    <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                  </label>
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files ({files.length})</Label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(idx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Separation Mode</Label>
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
                <Label>AI Model</Label>
                <Select value={separationModel} onValueChange={setSeparationModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fast">Fast (2-3 min per file)</SelectItem>
                    <SelectItem value="balanced">Balanced (3-5 min per file)</SelectItem>
                    <SelectItem value="high_quality">High Quality (5-8 min per file)</SelectItem>
                    <SelectItem value="artifact_free">Artifact-Free (8-12 min per file)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wav">WAV (Lossless)</SelectItem>
                    <SelectItem value="flac">FLAC (Lossless Compressed)</SelectItem>
                    <SelectItem value="mp3">MP3 (Lossy)</SelectItem>
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
                  Apply AI audio repair to all files
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={loading || files.length === 0}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <>Start Batch Processing ({files.length} files)</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}