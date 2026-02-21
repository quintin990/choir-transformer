import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function StereoWidthDisplay({ analysis }) {
  const stereoWidth = analysis.stereo_width || {
    overall_width: 75,
    low_freq_width: 45,
    mid_freq_width: 80,
    high_freq_width: 90,
    correlation: 0.85
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stereo Width Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">Overall Stereo Width</p>
              <p className="text-5xl font-bold text-purple-600">{stereoWidth.overall_width}%</p>
            </div>
            <Progress value={stereoWidth.overall_width} className="h-3" />
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Low Frequencies (20-250Hz)</span>
                <span className="text-gray-600">{stereoWidth.low_freq_width}%</span>
              </div>
              <Progress value={stereoWidth.low_freq_width} className="h-2 bg-blue-100" />
              <p className="text-xs text-gray-500 mt-1">Narrow for solid bass foundation</p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Mid Frequencies (250Hz-2kHz)</span>
                <span className="text-gray-600">{stereoWidth.mid_freq_width}%</span>
              </div>
              <Progress value={stereoWidth.mid_freq_width} className="h-2 bg-green-100" />
              <p className="text-xs text-gray-500 mt-1">Balanced width for clarity</p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">High Frequencies (2kHz+)</span>
                <span className="text-gray-600">{stereoWidth.high_freq_width}%</span>
              </div>
              <Progress value={stereoWidth.high_freq_width} className="h-2 bg-purple-100" />
              <p className="text-xs text-gray-500 mt-1">Wide for spacious highs</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Phase Correlation</p>
              <p className="text-2xl font-bold text-blue-600">{stereoWidth.correlation}</p>
              <p className="text-xs text-gray-500 mt-1">
                {stereoWidth.correlation > 0.8 ? 'Excellent mono compatibility' : 
                 stereoWidth.correlation > 0.6 ? 'Good compatibility' : 'Check for phase issues'}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Stereo Image</p>
              <p className="text-2xl font-bold text-purple-600">
                {stereoWidth.overall_width > 70 ? 'Wide' : 
                 stereoWidth.overall_width > 50 ? 'Balanced' : 'Narrow'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Overall stereo impression</p>
            </div>
          </div>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <p className="font-medium mb-2">Stereo Width Tips</p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Keep bass centered (below 250Hz) for punch and clarity</li>
                <li>• Use stereo widening on high frequencies for spaciousness</li>
                <li>• Maintain phase correlation above 0.7 for mono compatibility</li>
                <li>• Pan individual instruments rather than widening the entire mix</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}