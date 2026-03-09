import React, { useState } from 'react';
import { GripVertical, Trash2, Edit2, Check, X } from 'lucide-react';

export default function SetlistSongRow({ song, readiness, onNotesChange, onRemove, isEditing, onEditToggle }) {
  const [notes, setNotes] = useState(song.notes || '');

  const masteredCount = readiness.filter(r => r.status === 'mastered').length;
  const totalCount = readiness.length;
  const readinessPercent = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  const handleSaveNotes = () => {
    onNotesChange(notes);
    onEditToggle(false);
  };

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg border transition-all"
      style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}
    >
      {/* Drag handle */}
      <GripVertical className="w-4 h-4 text-gray-500 shrink-0 cursor-grab" />

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm" style={{ color: '#EAF2FF' }}>
          {song.song_title}
        </p>
        {!isEditing && song.notes && (
          <p className="text-xs mt-1" style={{ color: '#6A8AAD' }}>
            {song.notes}
          </p>
        )}

        {isEditing && (
          <div className="mt-2 space-y-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add performance notes..."
              className="w-full px-2 py-1.5 rounded text-xs border bg-opacity-50"
              style={{ backgroundColor: '#0B1220', borderColor: '#243550', color: '#EAF2FF' }}
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveNotes}
                className="flex items-center gap-1.5 px-2 py-1 text-xs rounded font-medium"
                style={{ backgroundColor: '#1EA0FF15', color: '#1EA0FF' }}
              >
                <Check className="w-3 h-3" /> Save
              </button>
              <button
                onClick={() => {
                  setNotes(song.notes || '');
                  onEditToggle(false);
                }}
                className="flex items-center gap-1.5 px-2 py-1 text-xs rounded font-medium"
                style={{ backgroundColor: '#EF444415', color: '#EF4444' }}
              >
                <X className="w-3 h-3" /> Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Readiness stats */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm" 
          style={{ backgroundColor: '#1C2A4455', color: '#1EA0FF' }}>
          {readinessPercent}%
        </div>
        <p className="text-xs" style={{ color: '#6A8AAD' }}>
          {masteredCount}/{totalCount}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {!isEditing && (
          <button
            onClick={() => onEditToggle(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: '#9CB2D6' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1C2A44'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onRemove}
          className="p-2 rounded-lg transition-colors"
          style={{ color: '#EF4444' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EF444415'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}