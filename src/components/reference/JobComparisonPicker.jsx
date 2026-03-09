import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { GitCompare, ChevronDown } from 'lucide-react';

export default function JobComparisonPicker({ selectedJob, onSelect }) {
  const [jobs, setJobs] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    base44.entities.Job.filter({ status: 'done' }, '-created_date', 20).then(setJobs).catch(() => {});
  }, []);

  const doneJobs = jobs.filter(j => j.analysis || j.duration_seconds);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 h-8 px-3 rounded-lg border border-white/10 text-xs text-white/50 hover:text-white hover:bg-white/5 transition-all"
      >
        <GitCompare className="w-3.5 h-3.5" />
        {selectedJob ? (selectedJob.input_filename || selectedJob.title || 'Untitled') : 'Compare with job…'}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-50 w-72 bg-[#0f0f17] border border-white/10 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 space-y-0.5 max-h-60 overflow-y-auto">
            {selectedJob && (
              <button
                onClick={() => { onSelect(null); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-white/5 rounded-lg transition-colors"
              >
                Clear comparison
              </button>
            )}
            {doneJobs.length === 0 ? (
              <p className="px-3 py-4 text-xs text-white/30 text-center">No completed jobs with analysis data yet.</p>
            ) : (
              doneJobs.map(job => (
                <button
                  key={job.id}
                  onClick={() => { onSelect(job); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                    selectedJob?.id === job.id ? 'bg-violet-600/20 text-violet-300' : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <p className="font-medium truncate">{job.input_filename || job.title || 'Untitled'}</p>
                  <p className="text-white/30 mt-0.5">{job.separation_mode === 'two_stems' ? '2 Stems' : '4 Stems'} · {job.output_format?.toUpperCase()}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}