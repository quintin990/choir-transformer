import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TABS = ['Results', 'Song Info', 'Enhance', 'Technical', 'Files'];

export default function JobDetail() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('id');
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Results');

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobData = await base44.entities.Job.filter({ id: jobId });
        if (jobData.length > 0) setJob(jobData[0]);
      } catch (err) {
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };
    if (jobId) fetchJob();
  }, [jobId]);

  if (loading) return <div style={{ color: 'hsl(var(--color-muted))' }}>Loading job...</div>;
  if (!job) return <div style={{ color: 'hsl(var(--color-destructive))' }}>Job not found.</div>;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Results':
        return (
          <div className="space-y-6">
            <div className="rounded-xl border p-6"
              style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))' }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: 'hsl(var(--color-text))' }}>Stems</h3>
              {job.stems && Object.entries(job.stems).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(job.stems).map(([stemKey, stemUrl]) => (
                    <div key={stemKey} className="flex items-center justify-between p-4 rounded-lg"
                      style={{ backgroundColor: 'hsl(var(--color-background))' }}>
                      <div className="flex items-center gap-3">
                        <button className="p-2 rounded transition-colors" style={{ color: 'hsl(var(--color-primary))' }}>
                          <Play className="w-4 h-4" />
                        </button>
                        <span style={{ color: 'hsl(var(--color-text))', fontWeight: 'bold' }}>
                          {stemKey.charAt(0).toUpperCase() + stemKey.slice(1)}
                        </span>
                      </div>
                      <a href={stemUrl} download className="p-2 rounded transition-colors"
                        style={{ color: 'hsl(var(--color-primary))' }}>
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'hsl(var(--color-muted))' }}>No stems available yet.</p>
              )}
            </div>
          </div>
        );
      case 'Song Info':
        return (
          <div className="rounded-xl border p-6"
            style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'hsl(var(--color-text))' }}>Song Information</h3>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              {[
                { label: 'BPM', value: job.bpm_confirmed || job.bpm_detected },
                { label: 'Key', value: job.key_confirmed || job.key_detected },
                { label: 'Time Signature', value: job.time_signature_confirmed || job.time_signature_detected },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ color: 'hsl(var(--color-muted))' }}>{label}</p>
                  <p className="font-semibold mt-1" style={{ color: 'hsl(var(--color-text))' }}>{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Technical':
        return (
          <div className="rounded-xl border p-6"
            style={{ backgroundColor: 'hsl(var(--color-card))', borderColor: 'hsl(var(--color-border))' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'hsl(var(--color-text))' }}>Technical Details</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Duration', value: job.duration_seconds ? `${(job.duration_seconds / 60).toFixed(2)}min` : '—' },
                { label: 'Sample Rate', value: job.sample_rate ? `${job.sample_rate / 1000}kHz` : '—' },
                { label: 'Channels', value: job.channels || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between" style={{ color: 'hsl(var(--color-muted))' }}>
                  <span>{label}</span><span>{value}</span>
                </div>
              ))}
              <div className="flex justify-between" style={{ color: 'hsl(var(--color-muted))' }}>
                <span>Status</span>
                <span style={{ color: 'hsl(var(--color-accent))' }}>{job.status}</span>
              </div>
            </div>
          </div>
        );
      default:
        return <div style={{ color: 'hsl(var(--color-muted))' }}>Tab content pending implementation.</div>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--color-text))', letterSpacing: '-0.03em' }}>
          {job.title}
        </h1>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{
              backgroundColor: job.status === 'done' ? 'hsl(var(--color-accent) / 0.12)' : 'hsl(var(--color-amber) / 0.12)',
              color: job.status === 'done' ? 'hsl(var(--color-accent))' : 'hsl(var(--color-amber))',
            }}>
            {job.status.toUpperCase()}
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ backgroundColor: 'hsl(var(--color-primary) / 0.1)', color: 'hsl(var(--color-primary))' }}>
            {job.kind}
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b mb-8 overflow-x-auto" style={{ borderColor: 'hsl(var(--color-border))' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap"
            style={{
              color: activeTab === tab ? 'hsl(var(--color-text))' : 'hsl(var(--color-muted))',
              borderColor: activeTab === tab ? 'hsl(var(--color-primary))' : 'transparent',
            }}>
            {tab}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
}