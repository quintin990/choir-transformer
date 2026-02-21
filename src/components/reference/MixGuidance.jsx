import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Sliders, Zap, Target } from 'lucide-react';

export default function MixGuidance({ analysis }) {
  const guidance = analysis.guidance || {
    vocals: {
      eq: 'Boost 3-5kHz for presence, cut 200-400Hz for clarity',
      compression: 'Use 3:1 ratio, medium attack, fast release',
      reverb: 'Short plate reverb, 1.2s decay'
    },
    drums: {
      eq: 'Boost kick at 60Hz and 3kHz, snare at 200Hz and 5kHz',
      compression: 'Parallel compression, 4:1 ratio',
      processing: 'Light saturation for punch'
    },
    bass: {
      eq: 'Fundamental around 80-100Hz, harmonics at 400Hz',
      compression: 'Gentle compression, 2:1 ratio, slow attack',
      processing: 'Keep centered in stereo field'
    },
    other: {
      eq: 'Reduce low-end below 80Hz, enhance air above 10kHz',
      compression: 'Bus compression, 2:1 ratio',
      spatial: 'Wider stereo image, use delays for depth'
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            AI-Powered Mix Guidance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            Based on the reference track analysis, here are specific recommendations for processing 
            your separated stems to achieve a similar sound profile.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sliders className="w-5 h-5 text-purple-600" />
              Vocals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-100 text-purple-700">EQ</Badge>
              </div>
              <p className="text-sm text-gray-700">{guidance.vocals.eq}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-100 text-blue-700">Compression</Badge>
              </div>
              <p className="text-sm text-gray-700">{guidance.vocals.compression}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-100 text-green-700">Reverb</Badge>
              </div>
              <p className="text-sm text-gray-700">{guidance.vocals.reverb}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-blue-600" />
              Drums
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-100 text-purple-700">EQ</Badge>
              </div>
              <p className="text-sm text-gray-700">{guidance.drums.eq}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-100 text-blue-700">Compression</Badge>
              </div>
              <p className="text-sm text-gray-700">{guidance.drums.compression}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-orange-100 text-orange-700">Processing</Badge>
              </div>
              <p className="text-sm text-gray-700">{guidance.drums.processing}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-green-600" />
              Bass
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-100 text-purple-700">EQ</Badge>
              </div>
              <p className="text-sm text-gray-700">{guidance.bass.eq}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-100 text-blue-700">Compression</Badge>
              </div>
              <p className="text-sm text-gray-700">{guidance.bass.compression}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-100 text-green-700">Spatial</Badge>
              </div>
              <p className="text-sm text-gray-700">{guidance.bass.processing}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sliders className="w-5 h-5 text-orange-600" />
              Other Instruments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-purple-100 text-purple-700">EQ</Badge>
              </div>
              <p className="text-sm text-gray-700">{guidance.other.eq}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-100 text-blue-700">Compression</Badge>
              </div>
              <p className="text-sm text-gray-700">{guidance.other.compression}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-pink-100 text-pink-700">Spatial</Badge>
              </div>
              <p className="text-sm text-gray-700">{guidance.other.spatial}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <p className="font-medium mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            General Mixing Tips
          </p>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Reference in mono periodically to check phase relationships</li>
            <li>• Take breaks every 45-60 minutes to maintain perspective</li>
            <li>• Use subtractive EQ before additive to create space</li>
            <li>• Compare your mix to the reference at matched loudness levels</li>
            <li>• Save multiple versions as you work for A/B comparison</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}