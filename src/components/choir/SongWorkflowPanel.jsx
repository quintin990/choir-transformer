import React, { useState } from 'react';
import { Upload, Wand2, Music, Mic, Star, ChevronRight, Mail, Loader2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STAGES = [
  {
    id: 'uploaded',
    icon: Upload,
    label: 'Uploaded',
    description: 'Audio file received',
    color: '#9CB2D6',
  },
  {
    id: 'separated',
    icon: Wand2,
    label: 'AI Separated',
    description: 'Stems & SATB extracted',
    color: '#1EA0FF',
  },
  {
    id: 'parts_published',
    icon: Music,
    label: 'Parts Published',
    description: 'Members can download',
    color: '#A78BFA',
  },
  {
    id: 'in_rehearsal',
    icon: Mic,
    label: 'In Rehearsal',
    description: 'Active practice',
    color: '#F59E0B',
  },
  {
    id: 'performance_ready',
    icon: Star,
    label: 'Performance Ready',
    description: 'Concert-ready',
    color: '#19D3A2',
  },
];

function deriveCurrentStage(job, assets, memberCount, readinessStats) {
  if (!job) return -1;
  if (job.status !== 'done') return 0;             // uploaded (processing)
  if (assets.length === 0) return 1;               // separated but not published
  const masteredPct = memberCount > 0 ? (readinessStats?.mastered || 0) / memberCount : 0;
  if (masteredPct >= 0.8) return 4;                // performance ready
  if ((readinessStats?.total || 0) > 0) return 3; // in rehearsal
  return 2;                                        // parts published
}

export default function SongWorkflowPanel({ song, job, assets = [], memberCount = 0, readinessStats = {}, choirId, onNotifySent }) {
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);

  const currentStageIdx = deriveCurrentStage(job, assets, memberCount, readinessStats);

  const handleNotify = async () => {
    setNotifying(true);
    try {
      await base44.functions.invoke('notifyMembersNewParts', {
        choir_song_id: song?.id,
        choir_id: choirId,
        song_title: song?.title || 'a song',
        asset_names: assets.map(a => a.name),
      });
      setNotified(true);
      if (onNotifySent) onNotifySent();
      setTimeout(() => setNotified(false), 4000);
    } catch (e) {
      alert('Failed to send notifications: ' + e.message);
    } finally {
      setNotifying(false);
    }
  };

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#1C2A44' }}>
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#EAF2FF' }}>Song Lifecycle</h3>
          <p className="text-[11px] mt-0.5" style={{ color: '#9CB2D6' }}>
            {currentStageIdx >= 0 ? STAGES[currentStageIdx]?.label : 'Not started'}
          </p>
        </div>
        {currentStageIdx >= 2 && (
          <button
            onClick={handleNotify}
            disabled={notifying || notified}
            className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-60"
            style={{
              backgroundColor: notified ? '#19D3A222' : '#1EA0FF22',
              color: notified ? '#19D3A2' : '#1EA0FF',
              border: `1px solid ${notified ? '#19D3A240' : '#1EA0FF40'}`,
            }}>
            {notifying ? <Loader2 className="w-3 h-3 animate-spin" />
              : notified ? <Check className="w-3 h-3" />
              : <Mail className="w-3 h-3" />}
            {notified ? 'Sent!' : 'Notify Members'}
          </button>
        )}
      </div>

      {/* Stage pipeline */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-0 overflow-x-auto">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isDone = idx <= currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            const color = isDone ? stage.color : '#2A3A55';
            const textColor = isDone ? stage.color : '#4A6080';

            return (
              <React.Fragment key={stage.id}>
                <div className="flex flex-col items-center shrink-0" style={{ minWidth: '80px' }}>
                  {/* Icon circle */}
                  <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: isDone ? color + '20' : '#1C2A44',
                      border: `2px solid ${isCurrent ? color : isDone ? color + '60' : '#1C2A44'}`,
                      boxShadow: isCurrent ? `0 0 12px ${color}40` : 'none',
                    }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  {/* Label */}
                  <p className="text-[10px] font-medium mt-1.5 text-center leading-tight px-1"
                    style={{ color: textColor }}>
                    {stage.label}
                  </p>
                  {isCurrent && (
                    <div className="w-1 h-1 rounded-full mt-1" style={{ backgroundColor: color }} />
                  )}
                </div>
                {idx < STAGES.length - 1 && (
                  <div className="flex-1 h-px mx-1 transition-all" style={{ minWidth: '12px',
                    backgroundColor: idx < currentStageIdx ? STAGES[idx + 1].color + '40' : '#1C2A44',
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Stats row */}
      {currentStageIdx >= 2 && (
        <div className="px-4 pb-4 grid grid-cols-3 gap-3">
          {[
            { label: 'Mastered', count: readinessStats.mastered || 0, color: '#19D3A2' },
            { label: 'Learning', count: readinessStats.learning || 0, color: '#1EA0FF' },
            { label: 'Need Help', count: readinessStats.need_help || 0, color: '#F59E0B' },
          ].map(stat => {
            const pct = memberCount > 0 ? Math.round((stat.count / memberCount) * 100) : 0;
            return (
              <div key={stat.label} className="rounded-lg p-2.5 text-center"
                style={{ backgroundColor: stat.color + '10', border: `1px solid ${stat.color}20` }}>
                <p className="text-lg font-bold" style={{ color: stat.color }}>{pct}%</p>
                <p className="text-[10px] font-medium" style={{ color: stat.color + 'cc' }}>{stat.label}</p>
                <p className="text-[10px]" style={{ color: '#4A6080' }}>{stat.count}/{memberCount}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}