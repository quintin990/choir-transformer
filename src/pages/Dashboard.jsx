import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Music2, Scissors, Upload, ArrowRight, CheckCircle, Loader2, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const STATUS_ICON = {
  done: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  running: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
  queued: <Clock className="w-4 h-4 text-white/30" />,
  failed: <XCircle className="w-4 h-4 text-red-400" />,
  cancelled: <XCircle className="w-4 h-4 text-white/20" />,
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        const recent = await base44.entities.Job.list('-created_date', 5);
        setJobs(recent);
      } catch {
        base44.auth.redirectToLogin('/Dashboard');
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

  const doneJobs = jobs.filter(j => j.status === 'done').length;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-white/40 text-sm mt-1">Separate and remix your audio stems with AI.</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to={createPageUrl('NewJob')} className="group bg-violet-600/10 border border-violet-500/20 rounded-xl p-5 hover:bg-violet-600/20 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-violet-600/20 flex items-center justify-center mb-3">
            <Scissors className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-white font-medium text-sm">Separate Track</p>
          <p className="text-white/40 text-xs mt-0.5">Upload and split a new audio file</p>
          <ArrowRight className="w-4 h-4 text-violet-400 mt-3 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link to={createPageUrl('BatchUpload')} className="group bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:bg-white/[0.06] transition-colors">
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center mb-3">
            <Upload className="w-4 h-4 text-white/50" />
          </div>
          <p className="text-white font-medium text-sm">Batch Upload</p>
          <p className="text-white/40 text-xs mt-0.5">Process multiple files at once</p>
          <ArrowRight className="w-4 h-4 text-white/30 mt-3 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link to={createPageUrl('Jobs')} className="group bg-white/[0.03] border border-white/5 rounded-xl p-5 hover:bg-white/[0.06] transition-colors">
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center mb-3">
            <Music2 className="w-4 h-4 text-white/50" />
          </div>
          <p className="text-white font-medium text-sm">My Jobs</p>
          <p className="text-white/40 text-xs mt-0.5">View all your separation jobs</p>
          <ArrowRight className="w-4 h-4 text-white/30 mt-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Recent jobs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-white/50">Recent Jobs</h2>
          <Link to={createPageUrl('Jobs')}>
            <Button variant="ghost" size="sm" className="text-white/30 hover:text-white/60 text-xs h-7">
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
            <Music2 className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No jobs yet — upload your first track to get started.</p>
            <Link to={createPageUrl('NewJob')}>
              <Button size="sm" className="mt-4 bg-violet-600 hover:bg-violet-500 text-white border-0">
                Separate a track
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map(job => (
              <Link key={job.id} to={`${createPageUrl('JobDetail')}?id=${job.id}`}>
                <div className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3 hover:bg-white/[0.06] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {STATUS_ICON[job.status] || STATUS_ICON.queued}
                    <span className="text-sm text-white truncate">{job.title || job.input_filename || 'Untitled'}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4 text-xs text-white/30">
                    <span className="hidden sm:block capitalize">{job.separation_mode?.replace('_', ' ')}</span>
                    <span>{format(new Date(job.created_date), 'MMM d')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}