import React, { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';

const SUGGESTED = ['vocal-chops', 'demo', 'final', 'hip-hop', 'electronic', 'rock', 'pop', 'jazz', 'archive', 'client'];

export default function TagEditor({ tags = [], onChange, readonly = false }) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);

  const addTag = (tag) => {
    const t = tag.trim().toLowerCase().replace(/\s+/g, '-');
    if (!t || tags.includes(t)) return;
    onChange([...tags, t]);
    setInput('');
  };

  const removeTag = (t) => onChange(tags.filter(x => x !== t));

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); }
    if (e.key === 'Backspace' && !input && tags.length) removeTag(tags[tags.length - 1]);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 items-center min-h-[28px]">
        <Tag className="w-3 h-3 shrink-0" style={{ color: '#9CB2D6' }} />
        {tags.map(t => (
          <span key={t} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium"
            style={{ backgroundColor: '#1EA0FF18', color: '#1EA0FF', border: '1px solid #1EA0FF30' }}>
            {t}
            {!readonly && (
              <button onClick={() => removeTag(t)} className="hover:opacity-70 transition-opacity ml-0.5">
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </span>
        ))}
        {!readonly && (
          <div className="relative">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Add tag…"
              className="text-xs px-2 py-0.5 rounded-md outline-none bg-transparent w-20 placeholder-[#9CB2D6]/40"
              style={{ color: '#EAF2FF', border: '1px dashed #1C2A44' }}
            />
            {open && (
              <div className="absolute top-full left-0 mt-1 z-20 rounded-lg border shadow-lg p-2 w-44 space-y-0.5"
                style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
                <p className="text-[10px] px-1 mb-1" style={{ color: '#9CB2D6' }}>Suggestions</p>
                {SUGGESTED.filter(s => !tags.includes(s) && s.includes(input)).slice(0, 6).map(s => (
                  <button key={s} onMouseDown={() => addTag(s)}
                    className="w-full text-left text-xs px-2 py-1 rounded transition-colors"
                    style={{ color: '#EAF2FF' }}
                    onMouseEnter={e => e.target.style.backgroundColor='#1C2A44'}
                    onMouseLeave={e => e.target.style.backgroundColor='transparent'}>
                    {s}
                  </button>
                ))}
                {input && !SUGGESTED.includes(input) && (
                  <button onMouseDown={() => addTag(input)}
                    className="w-full text-left text-xs px-2 py-1 rounded flex items-center gap-1.5"
                    style={{ color: '#1EA0FF' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor='#1C2A44'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
                    <Plus className="w-3 h-3" /> Add "{input}"
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}