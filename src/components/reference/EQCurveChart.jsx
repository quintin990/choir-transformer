import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function EQCurveChart({ analysis }) {
  const eqData = analysis.eq_curve || {
    frequencies: [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000],
    magnitudes: [0, 2, 1, 0, -1, 0, 2, 3, 1, -2]
  };

  const chartData = eqData.frequencies.map((freq, i) => ({
    frequency: freq < 1000 ? `${freq}Hz` : `${(freq / 1000).toFixed(1)}k`,
    magnitude: eqData.magnitudes[i]
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequency Response Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="frequency" />
              <YAxis label={{ value: 'dB', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="magnitude" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Low End</p>
              <p className="text-2xl font-bold text-purple-600">
                {eqData.magnitudes[2] >= 0 ? '+' : ''}{eqData.magnitudes[2]} dB
              </p>
              <p className="text-xs text-gray-500 mt-1">~100Hz</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Midrange</p>
              <p className="text-2xl font-bold text-blue-600">
                {eqData.magnitudes[5] >= 0 ? '+' : ''}{eqData.magnitudes[5]} dB
              </p>
              <p className="text-xs text-gray-500 mt-1">~1kHz</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">High End</p>
              <p className="text-2xl font-bold text-green-600">
                {eqData.magnitudes[7] >= 0 ? '+' : ''}{eqData.magnitudes[7]} dB
              </p>
              <p className="text-xs text-gray-500 mt-1">~5kHz</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium mb-2">EQ Characteristics</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Bass emphasis around 100Hz provides warmth and weight</li>
              <li>• Presence boost at 5kHz adds clarity and definition</li>
              <li>• Slight high-end roll-off prevents harshness</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}