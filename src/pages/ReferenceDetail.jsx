import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, Sparkles, BarChart3, Activity, Radio, TrendingUp } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ReferenceDetail() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const analysisId = params.get('id');

  const [user, setUser] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        const analyses = await base44.entities.ReferenceAnalysis.filter({ id: analysisId });
        if (analyses.length > 0) {
          setAnalysis(analyses[0]);
        }
      } catch {
        base44.auth.redirectToLogin('/ReferenceDetail?id=' + analysisId);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [analysisId]);

  if (loading || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <p className="text-gray-600">Loading analysis...</p>
      </div>
    );
  }

  const eqData = analysis.eq_curve || {};
  const dynamicData = analysis.dynamic_range || {};
  const stereoData = analysis.stereo_width || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <Link to="/ReferenceMixAssistant">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assistant
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{analysis.title}</h1>
          <p className="text-gray-600">{analysis.reference_filename}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Loudness Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Integrated LUFS</p>
                  <p className="text-3xl font-bold text-purple-600">{analysis.lufs?.toFixed(1)} dB</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">True Peak</p>
                  <p className="text-3xl font-bold text-blue-600">{analysis.peak_db?.toFixed(1)} dB</p>
                </div>
              </div>
              {dynamicData.dynamic_range && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Dynamic Range</p>
                  <p className="text-2xl font-bold text-green-600">{dynamicData.dynamic_range.toFixed(1)} dB</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5" />
                Stereo Field
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stereoData.width_percentage ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Stereo Width</span>
                      <span className="font-medium">{stereoData.width_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full"
                        style={{ width: `${stereoData.width_percentage}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {stereoData.width_percentage > 80 
                      ? 'Wide stereo image with excellent spatial distribution'
                      : stereoData.width_percentage > 50
                      ? 'Moderate stereo width, good for most genres'
                      : 'Narrow stereo field, more centered mix'}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Stereo analysis data not available</p>
              )}
            </CardContent>
          </Card>
        </div>

        {eqData.frequencies && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Frequency Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={eqData.frequencies}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="freq" label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Level (dB)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="level" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Actionable Guidance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.guidance && analysis.guidance.length > 0 ? (
              <div className="space-y-3">
                {analysis.guidance.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No specific guidance available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}