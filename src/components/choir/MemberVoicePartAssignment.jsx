import React, { useState, useEffect } from 'react';
import { Users, User, Music } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const VOICE_PARTS = [
  { id: 'soprano', label: 'Soprano', color: '#FF6B9D', description: 'Highest vocal range' },
  { id: 'alto', label: 'Alto', color: '#9B74FF', description: 'Mid-high range' },
  { id: 'tenor', label: 'Tenor', color: '#1EA0FF', description: 'Mid-low range' },
  { id: 'bass', label: 'Bass', color: '#19D3A2', description: 'Lowest range' },
];

export default function MemberVoicePartAssignment({ choirId, onUpdate }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState({});

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const memberships = await base44.entities.ChoirMembership.filter({
          choir_id: choirId,
          status: 'approved',
        });
        setMembers(memberships);
        const assignmentMap = {};
        memberships.forEach(m => {
          assignmentMap[m.id] = m.part || 'none';
        });
        setAssignments(assignmentMap);
      } catch (err) {
        console.error('Error fetching members:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [choirId]);

  const handlePartAssign = async (memberId, part) => {
    setAssignments({ ...assignments, [memberId]: part });
    const member = members.find(m => m.id === memberId);
    if (member) {
      try {
        await base44.entities.ChoirMembership.update(memberId, { part });
        onUpdate?.();
      } catch (err) {
        console.error('Error updating part:', err);
        setAssignments({ ...assignments, [memberId]: member.part });
      }
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border p-6 text-center" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
        <p style={{ color: '#6A8AAD' }}>Loading members...</p>
      </div>
    );
  }

  // Group members by part
  const membersByPart = {};
  VOICE_PARTS.forEach(part => {
    membersByPart[part.id] = members.filter(m => assignments[m.id] === part.id);
  });
  const unassigned = members.filter(m => assignments[m.id] === 'none' || !assignments[m.id]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
        <div className="flex items-center gap-2 mb-6">
          <Music className="w-5 h-5" style={{ color: '#19D3A2' }} />
          <h3 className="text-lg font-semibold" style={{ color: '#EAF2FF' }}>
            Voice Part Assignments
          </h3>
        </div>

        {/* Voice parts grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {VOICE_PARTS.map(part => (
            <div
              key={part.id}
              className="rounded-lg border p-4"
              style={{
                backgroundColor: 'rgba(30, 160, 255, 0.02)',
                borderColor: part.color + '40',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: part.color }}
                />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#EAF2FF' }}>
                    {part.label}
                  </p>
                  <p className="text-xs" style={{ color: '#6A8AAD' }}>
                    {part.description}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {membersByPart[part.id].length > 0 ? (
                  membersByPart[part.id].map(member => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded text-sm"
                      style={{ backgroundColor: '#0B1220' }}
                    >
                      <span style={{ color: '#9CB2D6' }}>
                        {member.user_name || member.user_email.split('@')[0]}
                      </span>
                      <button
                        onClick={() => handlePartAssign(member.id, 'none')}
                        className="text-xs px-2 py-1 rounded hover:bg-red-500 hover:bg-opacity-10"
                        style={{ color: '#FF4D6D' }}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-center py-2" style={{ color: '#4A6080' }}>
                    No members assigned
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unassigned members */}
      {unassigned.length > 0 && (
        <div className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A4480' }}>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5" style={{ color: '#FF6B9D' }} />
            <h4 className="text-sm font-semibold" style={{ color: '#EAF2FF' }}>
              Unassigned Members ({unassigned.length})
            </h4>
          </div>
          <div className="space-y-2">
            {unassigned.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#0B1220' }}>
                <span style={{ color: '#9CB2D6' }}>
                  {member.user_name || member.user_email.split('@')[0]}
                </span>
                <div className="flex gap-2">
                  {VOICE_PARTS.map(part => (
                    <button
                      key={part.id}
                      onClick={() => handlePartAssign(member.id, part.id)}
                      className="px-2.5 h-7 rounded text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: part.color + '20',
                        color: part.color,
                        border: `1px solid ${part.color}40`,
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = part.color + '30'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = part.color + '20'}
                    >
                      {part.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}