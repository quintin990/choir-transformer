import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Play, Pause, Trash2, RotateCw } from 'lucide-react';
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
        if (jobData.length > 0) {
          setJob(jobData[0]);
        }
      } catch (err) {
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  if (loading) {
    return <div style={{ color: '#6A8AAD' }}>Loading job...</div>;
  }

  if (!job) {
    return <div style={{ color: '#FF4D6D' }}>Job not found.</div>;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Results':
        return (
          <div className="space-y-6">
            <div className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: '#EAF2FF' }}>Stems</h3>
              {job.stems && Object.entries(job.stems).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(job.stems).map(([stemKey, stemUrl]) => (
                    <div key={stemKey} className="flex items-center justify-between p-4 rounded-lg"
                      style={{ backgroundColor: '#0B1220' }}>
                      <div className="flex items-center gap-3">
                        <button className="p-2 rounded hover:bg-blue-500 hover:bg-opacity-10">
                          <Play className="w-4 h-4" style={{ color: '#1EA0FF' }} />
                        </button>
                        <span style={{ color: '#EAF2FF', fontWeight: 'bold' }}>
                          {stemKey.charAt(0).toUpperCase() + stemKey.slice(1)}
                        </span>
                      </div>
                      <a href={stemUrl} download className="p-2 rounded hover:bg-blue-500 hover:bg-opacity-10">
                        <Download className="w-4 h-4" style={{ color: '#1EA0FF' }} />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6A8AAD' }}>No stems available yet.</p>
              )}
            </div>
          </div>
        );
      case 'Song Info':
        return (
          <div className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#EAF2FF' }}>Song Information</h3>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p style={{ color: '#6A8AAD' }}>BPM</p>
                <p className="font-semibold mt-1" style={{ color: '#EAF2FF' }}>
                  {job.bpm_confirmed || job.bpm_detected || '—'}
                </p>
              </div>
              <div>
                <p style={{ color: '#6A8AAD' }}>Key</p>
                <p className="font-semibold mt-1" style={{ color: '#EAF2FF' }}>
                  {job.key_confirmed || job.key_detected || '—'}
                </p>
              </div>
              <div>
                <p style={{ color: '#6A8AAD' }}>Time Signature</p>
                <p className="font-semibold mt-1" style={{ color: '#EAF2FF' }}>
                  {job.time_signature_confirmed || job.time_signature_detected || '—'}
                </p>
              </div>
            </div>
          </div>
        );
      case 'Technical':
        return (
          <div className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#EAF2FF' }}>Technical Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between" style={{ color: '#9CB2D6' }}>
                <span>Duration</span>
                <span>{job.duration_seconds ? `${(job.duration_seconds / 60).toFixed(2)}s` : '—'}</span>
              </div>
              <div className="flex justify-between" style={{ color: '#9CB2D6' }}>
                <span>Sample Rate</span>
                <span>{job.sample_rate ? `${job.sample_rate / 1000}kHz` : '—'}</span>
              </div>
              <div className="flex justify-between" style={{ color: '#9CB2D6' }}>
                <span>Channels</span>
                <span>{job.channels || '—'}</span>
              </div>
              <div className="flex justify-between" style={{ color: '#9CB2D6' }}>
                <span>Status</span>
                <span style={{ color: '#19D3A2' }}>{job.status}</span>
              </div>
            </div>
          </div>
        );
      default:
        return <div style={{ color: '#6A8AAD' }}>Tab content pending implementation.</div>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#EAF2FF', letterSpacing: '-0.03em' }}>
          {job.title}
        </h1>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{
              backgroundColor: job.status === 'done' ? '#19D3A210' : '#FFB02010',
              color: job.status === 'done' ? '#19D3A2' : '#FFB020',
            }}>
            {job.status.toUpperCase()}
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ backgroundColor: '#1EA0FF10', color: '#1EA0FF' }}>
            {job.kind}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b mb-8 overflow-x-auto" style={{ borderColor: '#1C2A44' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-3 text-sm font-medium border-b-2 transition-all"
            style={{
              color: activeTab === tab ? '#EAF2FF' : '#9CB2D6',
              borderColor: activeTab === tab ? '#1EA0FF' : 'transparent',
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}