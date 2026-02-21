import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Shield, Clock, Mail } from 'lucide-react';

export default function About() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    try {
      await base44.integrations.Core.SendEmail({
        to: 'support@choirtransformer.com',
        subject: `Contact Form: ${name}`,
        body: `From: ${name} (${email})\n\n${message}`
      });
      setSent(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About Choir Transformer</h1>
          <p className="text-xl text-gray-600">
            Professional AI-powered audio stem separation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Music className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">High Quality</h3>
              <p className="text-sm text-gray-600">
                State-of-the-art AI models for professional-grade stem separation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Secure & Private</h3>
              <p className="text-sm text-gray-600">
                Your files are processed securely and auto-deleted after 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Fast Processing</h3>
              <p className="text-sm text-gray-600">
                GPU-accelerated processing completes most jobs in 2-5 minutes
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Privacy & Data Retention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              At Choir Transformer, we take your privacy seriously. Here's what you need to know about how we handle your audio files:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>All uploaded files are encrypted during transfer and storage</li>
              <li>Your audio files are only accessible to you</li>
              <li>Input files and output stems are automatically deleted after 7 days</li>
              <li>We never use your audio files for training or any other purpose</li>
              <li>You can download your stems anytime before the 7-day retention period</li>
            </ul>
            <p className="text-sm text-gray-600 mt-4">
              For questions about our privacy practices, please contact us using the form below.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sent && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-6">
                Thank you! We've received your message and will respond soon.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" disabled={sending} className="w-full">
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link to="/Landing">
            <Button variant="ghost">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}