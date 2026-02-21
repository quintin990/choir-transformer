import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Activity, Volume2 } from 'lucide-react';

export default function DynamicRangeDisplay({ analysis }) {
  const lufs = analysis.lufs || -14.2;
  const peakDb = analysis.peak_db || -1.2;
  const compressionRatio = analysis.compression_ratio || 3.5;
  const dynamicRange = analysis.dynamic_range || {
    crest_factor: 12.5,
    loudness_range: 8.2,
    rms: -18.5
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dynamic Range Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Volume2 className="w-5 h-5 text-purple-600" />
                <p className="font-semibold">Loudness</p>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Integrated LUFS</span>
                    <span className="font-bold text-purple-600">{lufs} LUFS</span>
                  </div>
                  <Progress value={Math.min(((lufs + 23) / 23) * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">True Peak</span>
                    <span className="font-bold text-blue-600">{peakDb} dBTP</span>
                  </div>
                  <Progress value={Math.min(((peakDb + 6) / 6) * 100, 100)} className="h-2" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-green-600" />
                <p className="font-semibold">Dynamics</p>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Compression Ratio</span>
                    <span className="font-bold text-green-600">{compressionRatio}:1</span>
                  </div>
                  <Progress value={Math.min((compressionRatio / 10) * 100, 100)} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Loudness Range</span>
                    <span className="font-bold text-teal-600">{dynamicRange.loudness_range} LU</span>
                  </div>
                  <Progress value={Math.min((dynamicRange.loudness_range / 20) * 100, 100)} className="h-2" />
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <p className="font-medium mb-2">Recommendations for Your Mix</p>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• Target {lufs} LUFS for similar loudness perception</li>
                <li>• Apply gentle compression (ratio ~{compressionRatio}:1) on mix bus</li>
                <li>• Leave at least {Math.abs(peakDb)} dB headroom before limiting</li>
                <li>• Maintain dynamic range of {dynamicRange.loudness_range} LU for natural sound</li>
              </ul>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Crest Factor</p>
              <p className="text-xl font-bold">{dynamicRange.crest_factor} dB</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">RMS Average</p>
              <p className="text-xl font-bold">{dynamicRange.rms} dB</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Headroom</p>
              <p className="text-xl font-bold">{Math.abs(peakDb)} dB</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}