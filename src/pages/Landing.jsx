import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Music, Mic, Drum, Radio } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Choir Transformer
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Advanced AI-powered audio stem separation. Split your tracks into vocals, drums, bass, and more with professional quality.
          </p>
          <Link to={createPageUrl('NewJob')}>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg">
              Start Separation
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-2 hover:border-purple-300 transition-all">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Vocal Isolation</h3>
              <p className="text-sm text-gray-600">Extract clean vocals from any track</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-300 transition-all">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Drum className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Drum Separation</h3>
              <p className="text-sm text-gray-600">Isolate drums and percussion</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-green-300 transition-all">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Radio className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Bass Extraction</h3>
              <p className="text-sm text-gray-600">Separate bass lines perfectly</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-orange-300 transition-all">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Music className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">4-Stem Mode</h3>
              <p className="text-sm text-gray-600">Split into vocals, drums, bass, other</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link to={createPageUrl('Jobs')} className="text-purple-600 hover:text-purple-700 underline mr-6">
            View My Jobs
          </Link>
          <Link to={createPageUrl('About')} className="text-gray-600 hover:text-gray-700 underline">
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}