import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Search, List, Layers, Activity, ChevronRight, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import Card from '../components/auralyn/Card';
import StatusBadge from '../components/auralyn/StatusBadge';
import TagEditor from '../components/auralyn/TagEditor';

const KIND_ICONS = { stems: Layers, reference: Activity };
const KIND_COLORS = { stems: '#1EA0FF', reference: '#19D3A2', match: '#9B74FF' };
const ALL_STATUSES = ['queued', 'uploading', 'processing', 'packaging', 'done', 'failed', 'cancelled'];
const ALL_KINDS = ['stems', 'reference', 'match'];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [kindFilter, setKindFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('');
  const [editTagsId, setEditTagsId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await base44.auth.me();
        const data = await base44.entities.Job.list('-created_date', 50);
        setJobs(data);
      } catch {
        base44.auth.redirectToLogin('/Jobs');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleTagChange = async (jobId, tags) => {
    setJobs(j => j.map(job => job.id === jobId ? { ...job, tags } : job));
    await base44.functions.invoke('updateJobTags', { job_id: jobId, tags });
  };

  const allTags = [...new Set(jobs.flatMap(j => j.tags || []))];

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const matchSearch = !q || j.title?.toLowerCase().includes(q) || j.input_file_name?.toLowerCase().includes(q) || j.input_filename?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || j.status === statusFilter;
    const matchKind = kindFilter === 'all' || j.kind === kindFilter;
    const matchTag = !tagFilter || (j.tags || []).includes(tagFilter);
    return matchSearch && matchStatus && matchKind && matchTag;
  });

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#EAF2FF', letterSpacing: '-0.02em' }}>Jobs</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9CB2D6' }}>Your splits and analyses · {jobs.length} total</p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl('StemsNew')}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold transition-all"
            style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
            <Layers className="w-3.5 h-3.5" /> New Stems
          </Link>
          <Link to={createPageUrl('ReferenceNew')}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold transition-all border"
            style={{ backgroundColor: 'transparent', color: '#EAF2FF', borderColor: '#1C2A44' }}>
            <Activity className="w-3.5 h-3.5" /> New Reference
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card padding="p-4" className="mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#9CB2D6' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or filename…"
              className="w-full pl-9 pr-3 h-9 rounded-lg text-sm outline-none"
              style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF' }}
              onFocus={e => e.target.style.borderColor='#1EA0FF'}
              onBlur={e => e.target.style.borderColor='#1C2A44'} />
          </div>

          {/* Status */}
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg text-xs outline-none cursor-pointer"
            style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF' }}>
            <option value="all">All statuses</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Kind */}
          <select value={kindFilter} onChange={e => setKindFilter(e.target.value)}
            className="h-9 px-3 rounded-lg text-xs outline-none cursor-pointer"
            style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF' }}>
            <option value="all">All types</option>
            {ALL_KINDS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t" style={{ borderColor: '#1C2A44' }}>
            <button
              onClick={() => setTagFilter('')}
              className="text-[11px] px-2 py-0.5 rounded-md font-medium transition-all"
              style={{
                backgroundColor: !tagFilter ? '#1EA0FF' : '#1C2A44',
                color: !tagFilter ? '#fff' : '#9CB2D6',
              }}>
              All
            </button>
            {allTags.map(t => (
              <button key={t} onClick={() => setTagFilter(tagFilter === t ? '' : t)}
                className="text-[11px] px-2 py-0.5 rounded-md font-medium transition-all"
                style={{
                  backgroundColor: tagFilter === t ? '#1EA0FF18' : '#1C2A44',
                  color: tagFilter === t ? '#1EA0FF' : '#9CB2D6',
                  border: tagFilter === t ? '1px solid #1EA0FF40' : '1px solid transparent',
                }}>
                {t}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16" style={{ color: '#9CB2D6' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <List className="w-8 h-8 mx-auto mb-3 opacity-20" style={{ color: '#9CB2D6' }} />
          <p className="text-sm" style={{ color: '#9CB2D6' }}>No jobs found.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(job => {
            const KindIcon = KIND_ICONS[job.kind] || List;
            const kindColor = KIND_COLORS[job.kind] || '#9CB2D6';
            const isActive = ['queued', 'uploading', 'processing', 'packaging'].includes(job.status);
            const showTagEditor = editTagsId === job.id;

            return (
              <Card key={job.id} padding="p-4" className="hover:border-[#1EA0FF30] transition-all">
                <div className="flex items-start gap-4">
                  {/* Kind icon */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${kindColor}18` }}>
                    <KindIcon className="w-3.5 h-3.5" style={{ color: kindColor }} />
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate" style={{ color: '#EAF2FF' }}>
                        {job.title || job.input_file_name || job.input_filename || 'Untitled'}
                      </p>
                      <span className="text-[10px] capitalize px-1.5 py-0.5 rounded font-medium"
                        style={{ backgroundColor: `${kindColor}15`, color: kindColor }}>
                        {job.kind}
                      </span>
                      {job.mode && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: '#1C2A44', color: '#9CB2D6' }}>
                          {job.mode === 'four_stems' ? '4 stems' : '2 stems'}
                        </span>
                      )}
                    </div>

                    {/* Progress */}
                    {isActive && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-[11px]" style={{ color: '#9CB2D6' }}>
                          <span>{job.stage || 'Processing…'}</span>
                          <span className="tabular-nums">{job.progress || 0}%</span>
                        </div>
                        <Progress value={job.progress || 0} className="h-1" style={{ backgroundColor: '#1C2A44' }} />
                      </div>
                    )}

                    {/* Tags row */}
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      {(job.tags || []).length > 0 && (
                        <TagEditor tags={job.tags || []} onChange={tags => handleTagChange(job.id, tags)} readonly={!showTagEditor} />
                      )}
                      {!showTagEditor && (
                        <button
                          onClick={() => setEditTagsId(showTagEditor ? null : job.id)}
                          className="text-[11px] flex items-center gap-1 transition-colors"
                          style={{ color: '#9CB2D6' }}
                          onMouseEnter={e => e.currentTarget.style.color='#1EA0FF'}
                          onMouseLeave={e => e.currentTarget.style.color='#9CB2D6'}>
                          <Tag className="w-3 h-3" /> {(job.tags || []).length === 0 ? 'Add tags' : 'Edit'}
                        </button>
                      )}
                      {showTagEditor && (
                        <>
                          <TagEditor tags={job.tags || []} onChange={tags => handleTagChange(job.id, tags)} />
                          <button onClick={() => setEditTagsId(null)} className="text-[11px]" style={{ color: '#9CB2D6' }}>Done</button>
                        </>
                      )}
                    </div>

                    <p className="text-[11px] mt-1.5" style={{ color: '#9CB2D6' }}>
                      {format(new Date(job.created_date), 'MMM d, yyyy · h:mm a')}
                    </p>
                  </div>

                  {/* Right: status + action */}
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={job.status} />
                    <Link to={`${createPageUrl('JobDetail')}?id=${job.id}`}
                      className="flex items-center gap-1 text-xs font-medium transition-colors"
                      style={{ color: '#9CB2D6' }}
                      onMouseEnter={e => e.currentTarget.style.color='#1EA0FF'}
                      onMouseLeave={e => e.currentTarget.style.color='#9CB2D6'}>
                      View <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}