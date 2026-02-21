import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp, Radio, Activity } from 'lucide-react';

export default function ReferenceMixAssistant() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
            Coming Soon
          </div>
          <h1 className="text-4xl font-bold mb-4">Reference Mix Assistant</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered mix analysis and guidance to help you achieve professional-sounding mixes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-2 border-purple-200">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Reference Track Analysis</h3>
              <p className="text-gray-600">
                Upload a reference track and get detailed analysis of frequency balance, dynamics, and stereo width
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Mix Match Report</h3>
              <p className="text-gray-600">
                Compare your mix to the reference and get actionable suggestions to bridge the gap
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Radio className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Mix Bus Guidance</h3>
              <p className="text-gray-600">
                Get EQ and compression recommendations for your mix bus to achieve that polished sound
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Technical Targets</h3>
              <p className="text-gray-600">
                LUFS loudness analysis, stereo width measurements, and frequency spectrum comparison
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
          <CardContent className="pt-6 text-center">
            <h3 className="text-2xl font-bold mb-4">Launching Soon</h3>
            <p className="text-gray-700 mb-6 max-w-xl mx-auto">
              The Reference Mix Assistant will be available in the next major update. 
              Sign up for our newsletter to be notified when it launches.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to={createPageUrl('Landing')}>
                <Button variant="outline">Back to Home</Button>
              </Link>
              <Link to={createPageUrl('About')}>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Contact Us
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}