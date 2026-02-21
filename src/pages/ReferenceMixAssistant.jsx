import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Upload, TrendingUp, Radio, Activity, Loader2, CheckCircle, ArrowLeft, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function ReferenceMixAssistant() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch {
        base44.auth.redirectToLogin('/ReferenceMixAssistant');
      }
    };
    loadUser();
  }, []);

  const { data: analyses, refetch } = useQuery({
    queryKey: ['reference-analyses'],
    queryFn: () => base44.entities.ReferenceAnalysis.list('-created_date'),
    initialData: [],
    enabled: !!user
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(mp3|wav|flac)$/i)) {
      setError('Please upload an MP3, WAV, or FLAC file');
      return;
    }

    setFile(selectedFile);
    setError('');
    if (!title) {
      setTitle(selectedFile.name.replace(/\.(mp3|wav|flac)$/i, ''));
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      setAnalyzing(true);
      setUploading(false);

      const response = await base44.functions.invoke('analyzeReference', {
        title: title || file.name,
        reference_file_url: file_url,
        reference_filename: file.name
      });

      if (response.data.analysis_id) {
        refetch();
        setFile(null);
        setTitle('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze reference. Please try again.');
    } finally {
      setUploading(false);
      setAnalyzing(false);
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
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <Link to="/Landing">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold">Reference Mix Assistant</h1>
          </div>
          <p className="text-gray-600">AI-powered mix analysis and guidance to achieve professional-sounding mixes</p>
        </div>

        <Tabs defaultValue="analyze" className="mb-6">
          <TabsList>
            <TabsTrigger value="analyze">Analyze New Track</TabsTrigger>
            <TabsTrigger value="history">My Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Reference Track</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAnalyze} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="file">Reference Audio File</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                      <input
                        id="file"
                        type="file"
                        accept=".mp3,.wav,.flac,audio/mpeg,audio/wav,audio/flac"
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
                            <p className="font-medium">Click to upload reference track</p>
                            <p className="text-sm text-gray-500 mt-1">MP3, WAV, or FLAC</p>
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
                      placeholder="Professional Mix Reference"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={uploading || analyzing || !file}
                  >
                    {uploading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                    ) : analyzing ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" /> Analyze Track</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-2 border-purple-200">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">EQ Curve Analysis</h3>
                  <p className="text-sm text-gray-600">Detailed frequency response analysis with visual graphs</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Dynamic Range</h3>
                  <p className="text-sm text-gray-600">Compression and loudness metrics</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Radio className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Stereo Width</h3>
                  <p className="text-sm text-gray-600">Spatial distribution and imaging</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2">LUFS Targets</h3>
                  <p className="text-sm text-gray-600">Industry-standard loudness measurements</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {analyses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">No analyses yet</p>
                  <p className="text-sm text-gray-500">Upload a reference track to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {analyses.map((analysis) => (
                  <Link key={analysis.id} to={'/ReferenceDetail?id=' + analysis.id}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{analysis.title}</h3>
                            <p className="text-sm text-gray-500">{analysis.reference_filename}</p>
                          </div>
                          {analysis.status === 'analyzing' ? (
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          ) : analysis.status === 'done' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : null}
                        </div>
                        {analysis.status === 'done' && analysis.analysis_data && (
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="bg-purple-50 p-2 rounded">
                              <p className="text-gray-600">LUFS</p>
                              <p className="font-medium">{analysis.lufs?.toFixed(1)} dB</p>
                            </div>
                            <div className="bg-blue-50 p-2 rounded">
                              <p className="text-gray-600">Peak</p>
                              <p className="font-medium">{analysis.peak_db?.toFixed(1)} dB</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}