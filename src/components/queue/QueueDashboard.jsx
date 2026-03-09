import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, CheckCircle2, AlertCircle, Clock, Play } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function QueueDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await base44.entities.Job.list('-created_date', 50);
        setJobs(data);
      } catch {
        // Fail silently
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
    const unsubscribe = base44.entities.Job.subscribe(({ type, data }) => {
      setJobs(prev => {
        if (type === 'create') return [data, ...prev];
        if (type === 'update') return prev.map(j => j.id === data.id ? data : j);
        if (type === 'delete') return prev.filter(j => j.id !== data.id);
        return prev;
      });
    });

    return unsubscribe;
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="w-4 h-4" style={{ color: '#19D3A2' }} />;
      case 'failed': case 'cancelled': return <AlertCircle className="w-4 h-4" style={{ color: '#FF4D6D' }} />;
      case 'queued': return <Clock className="w-4 h-4" style={{ color: '#9CB2D6' }} />;
      default: return <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#1EA0FF' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return '#19D3A2';
      case 'failed': case 'cancelled': return '#FF4D6D';
      case 'queued': return '#9CB2D6';
      default: return '#1EA0FF';
    }
  };

  const getProgressPercent = (status, progress) => {
    if (status === 'done') return 100;
    if (status === 'failed' || status === 'cancelled') return 0;
    return progress || 0;
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" style={{ color: '#1EA0FF' }} /></div>;

  const activeJobs = jobs.filter(j => ['queued', 'uploading', 'processing', 'packaging'].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'done');
  const failedJobs = jobs.filter(j => ['failed', 'cancelled'].includes(j.status));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active', count: activeJobs.length, color: '#1EA0FF' },
          { label: 'Completed', count: completedJobs.length, color: '#19D3A2' },
          { label: 'Failed', count: failedJobs.length, color: '#FF4D6D' },
        ].map(({ label, count, color }) => (
          <div key={label} className="p-4 rounded-lg" style={{ backgroundColor: '#0F1A2E', border: '1px solid #1C2A44' }}>
            <p className="text-xs" style={{ color: '#9CB2D6' }}>{label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color }}>{count}</p>
          </div>
        ))}
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: '#EAF2FF' }}>Processing</h3>
          <div className="space-y-2">
            {activeJobs.map(job => (
              <Link key={job.id} to={`${createPageUrl('JobDetail')}?id=${job.id}`} className="block p-3 rounded-lg hover:opacity-80 transition-opacity" style={{ backgroundColor: '#0F1A2E', border: '1px solid #1C2A44' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getStatusIcon(job.status)}
                    <span className="text-sm font-medium truncate" style={{ color: '#EAF2FF' }}>{job.title}</span>
                  </div>
                  <span className="text-xs" style={{ color: '#9CB2D6' }}>{Math.round((job.progress || 0) * 100)}%</span>
                </div>
                <Progress value={getProgressPercent(job.status, job.progress * 100)} className="h-1" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Completed Jobs */}
      {completedJobs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold" style={{ color: '#EAF2FF' }}>Completed</h3>
          <div className="space-y-2">
            {completedJobs.slice(0, 5).map(job => (
              <Link key={job.id} to={`${createPageUrl('JobDetail')}?id=${job.id}`} className="flex items-center justify-between p-3 rounded-lg hover:opacity-80 transition-opacity" style={{ backgroundColor: '#0F1A2E', border: '1px solid #1C2A44' }}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#19D3A2' }} />
                  <span className="text-sm truncate" style={{ color: '#EAF2FF' }}>{job.title}</span>
                </div>
                <Play className="w-3.5 h-3.5" style={{ color: '#1EA0FF' }} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No Jobs */}
      {activeJobs.length === 0 && completedJobs.length === 0 && failedJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm" style={{ color: '#9CB2D6' }}>No jobs yet. Start processing audio files.</p>
        </div>
      )}
    </div>
  );
}