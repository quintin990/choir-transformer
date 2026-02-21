import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, Music, AlertCircle, X, CheckCircle } from 'lucide-react';

export default function BatchProcessing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [separationMode, setSeparationMode] = useState('two_stems');
  const [aiModel, setAiModel] = useState('balanced');
  const [audioRepair, setAudioRepair] = useState(false);
  const [outputFormat, setOutputFormat] = useState('wav');
  const [hasRights, setHasRights] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch {
        base44.auth.redirectToLogin('/BatchProcessing');
      }
    };
    loadUser();
  }, []);

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    let hasError = false;

    for (const file of selectedFiles) {
      const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav)$/i)) {
        setError('All files must be MP3 or WAV format');
        hasError = true;
        break;
      }

      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('All files must be under 50MB');
        hasError = true;
        break;
      }

      validFiles.push(file);
    }

    if (!hasError) {
      setFiles(validFiles);
      setError('');
    }
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

    if (!hasRights) {
      setError('Please confirm you have rights to process these files');
      return;
    }

    setProcessing(true);
    setError('');

    const batchId = crypto.randomUUID();
    const progress = {};

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        progress[i] = 0;
        setUploadProgress({ ...progress });

        // Upload file
        progress[i] = 30;
        setUploadProgress({ ...progress });
        
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        progress[i] = 60;
        setUploadProgress({ ...progress });

        // Create job
        await base44.functions.invoke('createJobAndStart', {
          title: file.name.replace(/\.(mp3|wav)$/i, ''),
          input_file_url: file_url,
          input_file_meta: {
            filename: file.name,
            mime: file.type,
            size: file.size
          },
          separation_mode: separationMode,
          ai_model: aiModel,
          audio_repair: audioRepair,
          output_format: outputFormat,
          is_batch: true,
          batch_id: batchId
        });

        progress[i] = 100;
        setUploadProgress({ ...progress });
      }

      // Navigate to jobs page
      navigate('/Jobs');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process batch. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Music className="w-12 h-12 text-purple-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Batch Processing</h1>
          <p className="text-gray-600">Process multiple audio files with the same settings</p>
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

              <div className="space-y-2">
                <Label htmlFor="files">Audio Files *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                  <input
                    id="files"
                    type="file"
                    accept=".mp3,.wav,audio/mpeg,audio/wav"
                    multiple
                    onChange={handleFilesChange}
                    className="hidden"
                  />
                  <label htmlFor="files" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    {files.length > 0 ? (
                      <p className="font-medium text-purple-600">{files.length} files selected</p>
                    ) : (
                      <div>
                        <p className="font-medium">Click to upload audio files</p>
                        <p className="text-sm text-gray-500 mt-1">MP3 or WAV, max 50MB each</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files</Label>
                  <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3 flex-1">
                          <Music className="w-5 h-5 text-purple-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            {uploadProgress[index] > 0 && uploadProgress[index] < 100 && (
                              <Progress value={uploadProgress[index]} className="h-1 mt-2" />
                            )}
                            {uploadProgress[index] === 100 && (
                              <div className="flex items-center gap-1 mt-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span className="text-xs text-green-600">Uploaded</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {!processing && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mode">Separation Mode *</Label>
                  <Select value={separationMode} onValueChange={setSeparationMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="two_stems">Two Stems</SelectItem>
                      <SelectItem value="four_stems">Four Stems</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiModel">AI Model *</Label>
                  <Select value={aiModel} onValueChange={setAiModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">Fast</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="high_quality">High Quality</SelectItem>
                      <SelectItem value="artifact_reduction">Artifact Reduction</SelectItem>
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
                      <SelectItem value="wav">WAV</SelectItem>
                      <SelectItem value="flac">FLAC</SelectItem>
                      <SelectItem value="mp3">MP3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="audioRepair"
                    checked={audioRepair}
                    onCheckedChange={setAudioRepair}
                  />
                  <label htmlFor="audioRepair" className="text-sm cursor-pointer">
                    Enable AI audio repair
                  </label>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="rights"
                  checked={hasRights}
                  onCheckedChange={setHasRights}
                />
                <label htmlFor="rights" className="text-sm cursor-pointer">
                  I confirm I have the rights to process these audio files
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                disabled={processing || files.length === 0 || !hasRights}
              >
                {processing ? `Processing ${files.length} files...` : `Process ${files.length} Files`}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Batch Processing Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <p>• All files will be processed with the same settings</p>
            <p>• You can monitor progress on the Jobs page</p>
            <p>• Processing time scales with the number of files and selected AI model</p>
            <p>• Consider using "Fast" model for large batches to reduce wait time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}