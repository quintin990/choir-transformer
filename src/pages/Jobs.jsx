import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Music2, CheckCircle, Loader2, Clock, XCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const STATUS_ICON = {
  done: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  running: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
  queued: <Clock className="w-4 h-4 text-white/30" />,
  failed: <XCircle className="w-4 h-4 text-red-400" />,
  cancelled: <XCircle className="w-4 h-4 text-white/20" />,
};

const STATUS_LABEL = {
  done: 'text-emerald-400',
  running: 'text-blue-400',
  queued: 'text-white/30',
  failed: 'text-red-400',
  cancelled: 'text-white/20',
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await base44.auth.me();
        const all = await base44.entities.Job.list('-created_date', 100);
        setJobs(all);
      } catch {
        base44.auth.redirectToLogin('/Jobs');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Jobs</h1>
          <p className="text-white/40 text-sm mt-1">{jobs.length} job{jobs.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link to={createPageUrl('NewJob')}>
          <Button className="bg-violet-600 hover:bg-violet-500 text-white border-0 gap-2">
            <Plus className="w-4 h-4" />
            New Job
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Music2 className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No jobs yet.</p>
          <Link to={createPageUrl('NewJob')}>
            <Button size="sm" className="mt-4 bg-violet-600 hover:bg-violet-500 text-white border-0">
              Separate your first track
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map(job => (
            <Link key={job.id} to={`${createPageUrl('JobDetail')}?id=${job.id}`}>
              <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3.5 hover:bg-white/[0.06] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  {STATUS_ICON[job.status] || STATUS_ICON.queued}
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{job.title || job.input_filename || 'Untitled'}</p>
                    <p className="text-xs text-white/25 mt-0.5">{format(new Date(job.created_date), 'MMM d, yyyy · h:mm a')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4 text-xs">
                  <span className="hidden sm:block text-white/30 capitalize">{job.separation_mode?.replace('_', ' ')}</span>
                  <span className="hidden md:block text-white/30 uppercase">{job.output_format}</span>
                  <span className={`capitalize font-medium ${STATUS_LABEL[job.status] || 'text-white/30'}`}>{job.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}