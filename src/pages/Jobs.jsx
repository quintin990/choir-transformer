import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Music2, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { createPageUrl } from '@/utils';

const FILTERS = ['all', 'queued', 'running', 'done', 'failed'];

const STATUS_ICON = {
  done: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  running: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
  queued: <Clock className="w-4 h-4 text-amber-400" />,
  failed: <XCircle className="w-4 h-4 text-red-400" />,
  cancelled: <XCircle className="w-4 h-4 text-white/20" />,
};

const STATUS_COLOR = {
  done: 'text-emerald-400 bg-emerald-400/10',
  running: 'text-blue-400 bg-blue-400/10',
  queued: 'text-amber-400 bg-amber-400/10',
  failed: 'text-red-400 bg-red-400/10',
  cancelled: 'text-white/30 bg-white/5',
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        await base44.auth.me();
        const all = await base44.entities.Job.list('-created_date');
        setJobs(all);
      } catch {
        base44.auth.redirectToLogin('/Jobs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = jobs.filter(j => filter === 'all' || j.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">My Jobs</h1>
          <p className="text-white/40 text-sm mt-0.5">{jobs.length} total jobs</p>
        </div>
        <Link to={createPageUrl('NewJob')}>
          <Button size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-500 text-white border-0">
            <Plus className="w-3.5 h-3.5" />
            New job
          </Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/5 rounded-xl p-1 w-fit">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === f
                ? 'bg-violet-600 text-white'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-12 text-center">
          <Music2 className="w-8 h-8 mx-auto mb-3 text-white/20" />
          <p className="text-white/40 text-sm mb-4">No jobs found</p>
          <Link to={createPageUrl('NewJob')}>
            <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white border-0">
              Create a job
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(job => (
            <Link key={job.id} to={`/JobDetail?id=${job.id}`}>
              <div className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-xl px-4 py-3.5 transition-colors cursor-pointer">
                <div className="flex items-center gap-3 min-w-0">
                  {STATUS_ICON[job.status] || STATUS_ICON.queued}
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{job.title || 'Untitled'}</p>
                    <p className="text-xs text-white/30 mt-0.5">
                      {job.separation_mode === 'two_stems' ? '2-stem' : '4-stem'} · {job.output_format?.toUpperCase()} · {format(new Date(job.created_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {(job.status === 'running' || job.status === 'queued') && (
                    <div className="w-24 hidden sm:flex flex-col gap-1">
                      <span className="text-xs text-white/30 text-right">{job.progress || 0}%</span>
                      <Progress value={job.progress || 0} className="h-1 bg-white/5" />
                    </div>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${STATUS_COLOR[job.status] || STATUS_COLOR.queued}`}>
                    {job.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}