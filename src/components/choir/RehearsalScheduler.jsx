import React, { useState } from 'react';
import { Calendar, Plus, Trash2, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RehearsalScheduler({ choirId, onScheduleAdded }) {
  const [schedule, setSchedule] = useState([
    { id: 1, date: '2026-03-16', milestone: 'Learn Soprano & Alto parts', status: 'upcoming' },
    { id: 2, date: '2026-03-23', milestone: 'Full ensemble run-through', status: 'upcoming' },
    { id: 3, date: '2026-03-30', milestone: 'Performance ready', status: 'upcoming' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ date: '', milestone: '' });

  const handleAddMilestone = () => {
    if (newMilestone.date && newMilestone.milestone) {
      setSchedule([
        ...schedule,
        {
          id: Math.max(...schedule.map(s => s.id), 0) + 1,
          ...newMilestone,
          status: 'upcoming',
        },
      ]);
      setNewMilestone({ date: '', milestone: '' });
      setShowForm(false);
      onScheduleAdded?.();
    }
  };

  const handleDelete = (id) => {
    setSchedule(schedule.filter(s => s.id !== id));
  };

  const upcoming = schedule.filter(s => s.status === 'upcoming').sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" style={{ color: '#9B74FF' }} />
          <h3 className="text-lg font-semibold" style={{ color: '#EAF2FF' }}>
            Rehearsal Schedule
          </h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold transition-all"
          style={{ backgroundColor: '#1EA0FF', color: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#3BAEFF'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1EA0FF'}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Milestone
        </button>
      </div>

      {/* Add milestone form */}
      {showForm && (
        <div className="mb-6 pb-6 border-b space-y-3" style={{ borderColor: '#1C2A44' }}>
          <Input
            type="date"
            value={newMilestone.date}
            onChange={e => setNewMilestone({ ...newMilestone, date: e.target.value })}
            className="text-sm"
            style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', color: '#EAF2FF' }}
          />
          <Input
            placeholder="e.g., Learn Soprano & Alto parts"
            value={newMilestone.milestone}
            onChange={e => setNewMilestone({ ...newMilestone, milestone: e.target.value })}
            className="text-sm"
            style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', color: '#EAF2FF' }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddMilestone}
              className="flex-1 h-9 rounded-lg text-sm font-semibold transition-all"
              style={{ backgroundColor: '#19D3A2', color: '#fff' }}
            >
              Add
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 h-9 rounded-lg text-sm font-semibold border"
              style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-3">
        {upcoming.length > 0 ? (
          upcoming.map((item, idx) => (
            <div
              key={item.id}
              className="flex items-start gap-4 pb-3"
              style={{ borderBottom: idx < upcoming.length - 1 ? '1px solid #1C2A44' : 'none' }}
            >
              <div className="flex flex-col items-center gap-2 shrink-0">
                <Flag className="w-4 h-4" style={{ color: '#9B74FF' }} />
                <div className="w-0.5 h-12" style={{ backgroundColor: '#1C2A44' }} />
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-xs font-semibold" style={{ color: '#9B74FF' }}>
                  {new Date(item.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                </p>
                <p className="text-sm mt-1" style={{ color: '#EAF2FF' }}>
                  {item.milestone}
                </p>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 rounded hover:bg-red-500 hover:bg-opacity-10 transition-all"
              >
                <Trash2 className="w-4 h-4" style={{ color: '#FF4D6D' }} />
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-center py-4" style={{ color: '#6A8AAD' }}>
            No upcoming milestones. Add one to get started.
          </p>
        )}
      </div>
    </div>
  );
}