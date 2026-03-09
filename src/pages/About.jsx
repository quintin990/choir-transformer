import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Shield, Clock, Music2, Mail } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 space-y-12">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
            <Music2 className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-white font-semibold">StemForge</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">About StemForge</h1>
        <p className="text-white/50 leading-relaxed">
          StemForge is a professional audio stem separation tool that uses state-of-the-art AI models (Demucs) to isolate instruments and vocals from any audio track. Whether you're a producer, remixer, DJ, or music educator, StemForge gives you clean, high-quality stems in minutes — straight from your browser.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">How it works</h2>
        <div className="space-y-3 text-white/50 leading-relaxed text-sm">
          <p>When you submit a job, your audio file is uploaded to secure object storage. It is then sent to a GPU-powered serverless worker running Demucs, one of the best open-source models for stem separation.</p>
          <p>The worker separates the audio into 2 or 4 stems (depending on your choice) and uploads the results back to storage, where they become available for immediate download or streaming preview directly in the browser.</p>
          <p>All processing happens in isolated, ephemeral containers — your audio is never shared, logged for training, or retained beyond the stated period.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {([
          {
            Icon: Shield,
            title: 'Your rights matter',
            desc: 'We require you to confirm ownership or rights before processing any audio. We do not process copyrighted material without authorisation.',
          },
          {
            Icon: Clock,
            title: 'Auto-deletion',
            desc: 'All uploaded files and generated stems are permanently deleted after 7 days (30 days for Pro). No copies are kept.',
          },
          {
            Icon: Mail,
            title: 'Get in touch',
            desc: 'Questions, feedback, or issues? Email us at support@stemforge.app and we\'ll respond within 24 hours.',
          },
        ]).map(({ Icon, title, desc }) => (
          <div key={title} className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <Icon className="w-5 h-5 text-violet-400 mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1.5">{title}</h3>
            <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-white/5 pt-6">
        <p className="text-white/30 text-sm">
          Ready to try?{' '}
          <Link to={createPageUrl('NewJob')} className="text-violet-400 hover:text-violet-300 transition-colors">
            Start a new job →
          </Link>
        </p>
      </div>
    </div>
  );
}