import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Music, Shield, Clock, Mail, CheckCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';

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
        to: 'support@stemforge.ai',
        subject: `Contact Form: ${name}`,
        body: `From: ${name} (${email})\n\n${message}`
      });
      setSent(true);
      setName(''); setEmail(''); setMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">About StemForge</h1>
        <p className="text-white/40">Professional AI-powered audio stem separation</p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {[
          { icon: Music, title: 'High Quality', desc: 'State-of-the-art AI models for professional-grade stem separation.', color: 'text-violet-400 bg-violet-600/15' },
          { icon: Shield, title: 'Secure & Private', desc: 'Your files are processed securely and auto-deleted after 7 days.', color: 'text-blue-400 bg-blue-600/15' },
          { icon: Clock, title: 'Fast Processing', desc: 'GPU-accelerated processing completes most jobs in 2–5 minutes.', color: 'text-emerald-400 bg-emerald-600/15' },
        ].map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-center">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-3 ${color}`}>
              <Icon className="w-4.5 h-4.5" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1.5">{title}</h3>
            <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
        <h2 className="font-semibold text-white mb-4">Privacy & Data Retention</h2>
        <ul className="space-y-2.5">
          {[
            'All uploaded files are encrypted during transfer and storage',
            'Your audio files are only accessible to you',
            'Input files and output stems are automatically deleted after 7 days',
            'We never use your audio files for training or any other purpose',
            'You can download your stems anytime before the 7-day retention period',
          ].map(item => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-white/50">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Mail className="w-4 h-4 text-violet-400" />
          Contact Us
        </h2>
        {sent ? (
          <div className="flex items-center gap-2 text-emerald-400 text-sm py-2">
            <CheckCircle className="w-4 h-4" />
            Message sent! We'll get back to you soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/20" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/50 text-xs">Email</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/20" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/50 text-xs">Message</Label>
              <Textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} required className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 resize-none" />
            </div>
            <Button type="submit" disabled={sending} className="bg-violet-600 hover:bg-violet-500 text-white border-0">
              {sending ? 'Sending…' : 'Send Message'}
            </Button>
          </form>
        )}
      </div>

      <div className="text-center pb-4">
        <Link to={createPageUrl('Landing')}>
          <Button variant="ghost" className="text-white/40 hover:text-white">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}