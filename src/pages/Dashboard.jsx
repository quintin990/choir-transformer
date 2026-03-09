import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Plus, ListMusic, FlaskConical, Loader2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import JobStatusBadge from '../components/jobs/JobStatusBadge';
import { Progress } from '@/components/ui/progress';

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

  const done = jobs.filter(j => j.status === 'done').length;
  const active = jobs.filter(j => ['queued', 'uploading', 'running'].includes(j.status)).length;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-white/40 text-sm mt-1">Your stem separation workspace.</p>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link
          to={createPageUrl('NewJob')}
          className="group bg-violet-600/20 border border-violet-500/30 hover:bg-violet-600/30 rounded-2xl p-5 flex flex-col justify-between transition-all"
        >
          <Plus className="w-6 h-6 text-violet-400 mb-8" />
          <div>
            <p className="text-white font-semibold text-sm mb-0.5">New Job</p>
            <p className="text-white/40 text-xs">Upload and separate a track</p>
          </div>
        </Link>

        <Link
          to={createPageUrl('Jobs')}
          className="group bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] rounded-2xl p-5 flex flex-col justify-between transition-all"
        >
          <ListMusic className="w-6 h-6 text-white/40 mb-8" />
          <div>
            <p className="text-white font-semibold text-sm mb-0.5">My Jobs</p>
            <p className="text-white/40 text-xs">Browse all your separations</p>
          </div>
        </Link>

        <Link
          to={createPageUrl('ReferenceMixAssistant')}
          className="group bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] rounded-2xl p-5 flex flex-col justify-between transition-all"
        >
          <FlaskConical className="w-6 h-6 text-white/40 mb-8" />
          <div>
            <p className="text-white font-semibold text-sm mb-0.5">Reference Mix</p>
            <p className="text-white/40 text-xs">Analyse a reference track</p>
          </div>
        </Link>
      </div>

      {/* Stats */}
      {jobs.length > 0 && (
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-2xl font-bold text-white">{jobs.length}</span>
            <span className="text-white/30 ml-2 text-xs">recent job{jobs.length !== 1 ? 's' : ''}</span>
          </div>
          {done > 0 && (
            <div>
              <span className="text-2xl font-bold text-emerald-400">{done}</span>
              <span className="text-white/30 ml-2 text-xs">completed</span>
            </div>
          )}
          {active > 0 && (
            <div>
              <span className="text-2xl font-bold text-blue-400">{active}</span>
              <span className="text-white/30 ml-2 text-xs">active</span>
            </div>
          )}
        </div>
      )}

      {/* Recent jobs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-widest text-xs">Recent Jobs</h2>
          <Link to={createPageUrl('Jobs')} className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-10 text-center">
            <p className="text-white/25 text-sm mb-3">No jobs yet.</p>
            <Link to={createPageUrl('NewJob')} className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors">
              <Plus className="w-4 h-4" /> Start your first separation
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map(job => (
              <Link
                key={job.id}
                to={`${createPageUrl('JobDetail')}?id=${job.id}`}
                className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3.5 hover:bg-white/[0.05] transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white font-medium truncate">{job.input_filename || job.title || 'Untitled'}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-white/25">{format(new Date(job.created_date), 'MMM d, h:mm a')}</span>
                    {['queued', 'running', 'uploading'].includes(job.status) && (
                      <div className="flex items-center gap-1.5">
                        <Progress value={job.progress || 0} className="h-1 w-16 bg-white/10" />
                        <span className="text-xs text-white/30 tabular-nums">{job.progress || 0}%</span>
                      </div>
                    )}
                  </div>
                </div>
                <JobStatusBadge status={job.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}