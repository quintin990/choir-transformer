import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Sparkles, Upload, TrendingUp, Radio, Activity, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import EQCurveChart from '../components/reference/EQCurveChart';
import DynamicRangeDisplay from '../components/reference/DynamicRangeDisplay';
import StereoWidthDisplay from '../components/reference/StereoWidthDisplay';
import MixGuidance from '../components/reference/MixGuidance';

export default function ReferenceMixAssistant() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
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

  const { data: analyses = [], isLoading, refetch } = useQuery({
    queryKey: ['referenceAnalyses'],
    queryFn: () => base44.entities.ReferenceAnalysis.list('-created_date'),
    enabled: !!user,
    initialData: []
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(mp3|wav)$/i)) {
      setError('Please upload an MP3 or WAV file');
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB for reference tracks
    if (selectedFile.size > maxSize) {
      setError('File size must be under 100MB');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setAnalyzing(true);
    setError('');

    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Create analysis record
      const analysis = await base44.entities.ReferenceAnalysis.create({
        reference_file: file_url,
        reference_filename: file.name,
        analysis_status: 'processing'
      });

      // Trigger AI analysis
      await base44.functions.invoke('analyzeReferenceTrack', {
        analysis_id: analysis.id,
        file_url: file_url
      });

      setFile(null);
      refetch();
      setSelectedAnalysis(analysis.id);

      // Poll for completion
      const pollInterval = setInterval(async () => {
        const updated = await base44.entities.ReferenceAnalysis.filter({ id: analysis.id });
        if (updated.length > 0 && updated[0].analysis_status !== 'processing') {
          setAnalyzing(false);
          clearInterval(pollInterval);
          refetch();
        }
      }, 3000);

      setTimeout(() => {
        clearInterval(pollInterval);
        setAnalyzing(false);
      }, 60000);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze reference track');
      setAnalyzing(false);
    } finally {
      setUploading(false);
    }
  };

  const currentAnalysis = analyses.find(a => a.id === selectedAnalysis);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-purple-600 animate-pulse" />
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
              Back
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Reference Mix Assistant</h1>
          <p className="text-xl text-gray-600">
            Analyze reference tracks and get AI-powered mixing guidance
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-purple-200">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-sm text-gray-600">
                Deep learning models analyze frequency balance, dynamics, and spatial characteristics
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Match Reports</h3>
              <p className="text-sm text-gray-600">
                Compare your mixes to reference targets with detailed metrics and visualizations
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Radio className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Mix Guidance</h3>
              <p className="text-sm text-gray-600">
                Get specific EQ, compression, and processing suggestions for your stems
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Reference Track</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
                <input
                  id="referenceFile"
                  type="file"
                  accept=".mp3,.wav,audio/mpeg,audio/wav"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="referenceFile" className="cursor-pointer">
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
                      <p className="text-sm text-gray-500 mt-1">MP3 or WAV, max 100MB</p>
                    </div>
                  )}
                </label>
              </div>

              <Button 
                onClick={handleUpload}
                disabled={!file || uploading || analyzing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {uploading ? 'Uploading...' : analyzing ? 'Analyzing...' : 'Analyze Reference Track'}
              </Button>

              {analyzing && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 text-center">
                    AI is analyzing your reference track...
                  </p>
                  <Progress value={66} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {analyses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Reference Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    onClick={() => setSelectedAnalysis(analysis.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedAnalysis === analysis.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Activity className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium">{analysis.reference_filename}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(analysis.created_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        {analysis.analysis_status === 'processing' && (
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                        )}
                        {analysis.analysis_status === 'completed' && (
                          <div className="text-sm text-green-600 font-medium">Completed</div>
                        )}
                        {analysis.analysis_status === 'failed' && (
                          <div className="text-sm text-red-600 font-medium">Failed</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {currentAnalysis && currentAnalysis.analysis_status === 'completed' && (
          <div className="mt-6">
            <Tabs defaultValue="eq" className="space-y-6">
              <TabsList>
                <TabsTrigger value="eq">EQ Curve</TabsTrigger>
                <TabsTrigger value="dynamics">Dynamics</TabsTrigger>
                <TabsTrigger value="stereo">Stereo Width</TabsTrigger>
                <TabsTrigger value="guidance">Mix Guidance</TabsTrigger>
              </TabsList>

              <TabsContent value="eq">
                <EQCurveChart analysis={currentAnalysis} />
              </TabsContent>

              <TabsContent value="dynamics">
                <DynamicRangeDisplay analysis={currentAnalysis} />
              </TabsContent>

              <TabsContent value="stereo">
                <StereoWidthDisplay analysis={currentAnalysis} />
              </TabsContent>

              <TabsContent value="guidance">
                <MixGuidance analysis={currentAnalysis} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}