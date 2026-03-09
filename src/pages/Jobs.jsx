import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Plus, Search, Loader2, Music2 } from 'lucide-react';
import { format } from 'date-fns';
import JobStatusBadge from '../components/jobs/JobStatusBadge';
import { Progress } from '@/components/ui/progress';

const STATUSES = ['all', 'queued', 'running', 'done', 'failed', 'cancelled'];
const MODES = ['all', 'two_stems', 'four_stems'];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');

  useEffect(() => {
    const init = async () => {
      try {
        await base44.auth.me();
        const all = await base44.entities.Job.list('-created_date', 200);
        setJobs(all);
      } catch {
        base44.auth.redirectToLogin('/Jobs');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const filtered = jobs.filter(j => {
    const matchSearch = !search || (j.input_filename || j.title || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || j.status === statusFilter;
    const matchMode = modeFilter === 'all' || j.separation_mode === modeFilter;
    return matchSearch && matchStatus && matchMode;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Jobs</h1>
          <p className="text-white/40 text-sm mt-0.5">{jobs.length} total</p>
        </div>
        <Link
          to={createPageUrl('NewJob')}
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl h-9 px-4 text-sm font-medium transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          New job
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by filename…"
            className="bg-white/[0.04] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500/50 w-52"
          />
        </div>

        <div className="flex gap-1.5">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition-all capitalize ${
                statusFilter === s
                  ? 'bg-violet-600 text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {MODES.map(m => (
            <button
              key={m}
              onClick={() => setModeFilter(m)}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition-all ${
                modeFilter === m
                  ? 'bg-violet-600 text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              {m === 'all' ? 'All modes' : m === 'two_stems' ? '2 Stems' : '4 Stems'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Music2 className="w-10 h-10 text-white/10 mx-auto mb-3" />
          {jobs.length === 0 ? (
            <>
              <p className="text-white/30 text-sm mb-4">No jobs yet.</p>
              <Link to={createPageUrl('NewJob')} className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors">
                <Plus className="w-4 h-4" /> Start your first job
              </Link>
            </>
          ) : (
            <p className="text-white/30 text-sm">No jobs match your filters.</p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['File Name', 'Mode', 'Quality', 'Status', 'Progress', 'Created', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-white/30 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(job => (
                <tr key={job.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-0">
                  <td className="px-4 py-3.5 max-w-[200px]">
                    <Link to={`${createPageUrl('JobDetail')}?id=${job.id}`} className="text-white hover:text-violet-300 transition-colors font-medium truncate block">
                      {job.input_filename || job.title || 'Untitled'}
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-white/50 whitespace-nowrap">
                    {job.separation_mode === 'two_stems' ? '2 Stems' : '4 Stems'}
                  </td>
                  <td className="px-4 py-3.5 text-white/50 capitalize whitespace-nowrap">
                    {job.separation_model || 'balanced'}
                  </td>
                  <td className="px-4 py-3.5">
                    <JobStatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3.5 min-w-[100px]">
                    <div className="space-y-1">
                      <Progress value={job.progress || 0} className="h-1 bg-white/10" />
                      <span className="text-xs text-white/30">{job.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-white/40 whitespace-nowrap text-xs">
                    {format(new Date(job.created_date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Link
                      to={`${createPageUrl('JobDetail')}?id=${job.id}`}
                      className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}