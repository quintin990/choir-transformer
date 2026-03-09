import React from 'react';
import { Music2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FOCUS_OPTIONS = [
  { value: 'lead_vocal', label: 'Lead vocal' },
  { value: 'choir_blend', label: 'Choir blend' },
];

const OUTPUT_OPTIONS = [
  { key: 'guide_stem', label: 'Guide stem' },
  { key: 'notes',      label: 'Notes (MIDI-friendly)' },
];

export default function HarmonyPanel({ mode, onMode, options, onOptions }) {
  const [open, setOpen] = React.useState(false);
  const [satbConfirmed, setSatbConfirmed] = React.useState(false);

  const setOpt = (key, val) => onOptions({ ...options, [key]: val });
  const toggleOpt = (key) => onOptions({ ...options, [key]: !options[key] });

  const modeLabel = { none: null, guide: 'Harmony Guide', satb_experimental: 'SATB Split' }[mode];

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Music2 className="w-3.5 h-3.5" style={{ color: '#9CB2D6' }} />
          <span className="text-xs font-medium" style={{ color: '#9CB2D6' }}>Harmony Engine</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#1C2A44', color: '#9CB2D6' }}>optional</span>
          {mode !== 'none' && (
            <span className="text-[10px]" style={{ color: '#9B74FF' }}>{modeLabel}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5" style={{ color: '#9CB2D6' }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: '#9CB2D6' }} />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t space-y-4" style={{ borderColor: '#1C2A44' }}>
          <div className="pt-3">
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CB2D6' }}>Harmony mode</label>
            <Select value={mode} onValueChange={onMode}>
              <SelectTrigger className="h-9 text-sm rounded-lg" style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', color: '#EAF2FF' }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="guide">Harmony Guide — recommended</SelectItem>
                <SelectItem value="satb_experimental">SATB Split — experimental</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === 'guide' && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: '#9CB2D6' }}>
                Generate a rehearsal-friendly harmony guide from the vocal stem.
              </p>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CB2D6' }}>Focus</label>
                <Select value={options.focus || 'lead_vocal'} onValueChange={v => setOpt('focus', v)}>
                  <SelectTrigger className="h-9 text-sm rounded-lg" style={{ backgroundColor: '#0B1220', borderColor: '#1C2A44', color: '#EAF2FF' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOCUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#9CB2D6' }}>Output</label>
                <div className="space-y-2">
                  {OUTPUT_OPTIONS.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={!!options[key]} onChange={() => toggleOpt(key)}
                        className="w-3.5 h-3.5 rounded cursor-pointer accent-[#9B74FF]" />
                      <span className="text-xs" style={{ color: options[key] ? '#EAF2FF' : '#9CB2D6' }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {mode === 'satb_experimental' && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: '#9CB2D6' }}>
                Experimental: attempts to split choir vocals into soprano, alto, tenor, bass.
              </p>
              <div className="rounded-lg p-3 space-y-1.5" style={{ backgroundColor: '#FFB02010', border: '1px solid #FFB02030' }}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#FFB020' }} />
                  <div className="space-y-1">
                    <p className="text-xs font-medium" style={{ color: '#FFB020' }}>Experimental — best on clear choir recordings</p>
                    <p className="text-xs" style={{ color: '#FFB020' }}>You may need to verify parts manually after export.</p>
                  </div>
                </div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={satbConfirmed} onChange={e => setSatbConfirmed(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 cursor-pointer accent-[#FFB020]" />
                <span className="text-xs" style={{ color: satbConfirmed ? '#EAF2FF' : '#9CB2D6' }}>
                  I understand this is experimental
                </span>
              </label>
              {!satbConfirmed && (
                <p className="text-[10px]" style={{ color: '#9CB2D6' }}>Check the box above to enable SATB Split.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}