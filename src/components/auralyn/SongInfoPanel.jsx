import React, { useState, useEffect } from 'react';
import { Music2, CheckCircle2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

const KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
               'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'];
const TIME_SIGS = ['4/4', '3/4', '6/8', '5/4', '7/8', '2/4', '12/8'];

function ConfidencePill({ value }) {
  if (value == null) return null;
  const label = value >= 0.7 ? 'High' : value >= 0.4 ? 'Medium' : 'Low';
  const color = value >= 0.7 ? '#19D3A2' : value >= 0.4 ? '#FFB020' : '#9CB2D6';
  return (
    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
      style={{ backgroundColor: color + '18', color, border: `1px solid ${color}30` }}>
      {label}
    </span>
  );
}

export default function SongInfoPanel({ data = {}, onSave, readOnly = false }) {
  const [bpm, setBpm] = useState('');
  const [key, setKey] = useState('');
  const [timeSig, setTimeSig] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setBpm(String(data.bpm_confirmed ?? data.bpm_detected ?? ''));
    setKey(data.key_confirmed ?? data.key_detected ?? '');
    setTimeSig(data.time_signature_confirmed ?? data.time_signature_detected ?? '');
  }, [data.bpm_detected, data.bpm_confirmed, data.key_detected, data.key_confirmed, data.time_signature_detected, data.time_signature_confirmed]);

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    await onSave({
      bpm_confirmed: bpm ? parseFloat(bpm) : null,
      key_confirmed: key || null,
      time_signature_confirmed: timeSig || null,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
  };

  const handleReset = () => {
    setBpm(String(data.bpm_detected ?? ''));
    setKey(data.key_detected ?? '');
    setTimeSig(data.time_signature_detected ?? '');
  };

  const isMock = data.mock;

  return (
    <div className="space-y-4">
      {isMock && (
        <div className="px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: '#FFB02010', border: '1px solid #FFB02030', color: '#FFB020' }}>
          Detection backend not connected — showing placeholder values.
        </div>
      )}
      <p className="text-xs" style={{ color: '#9CB2D6' }}>
        Auto-detection is a best estimate. Confirm values if you know them.
      </p>

      {/* BPM */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <label className="text-xs font-medium" style={{ color: '#9CB2D6' }}>BPM</label>
          <ConfidencePill value={data.bpm_confidence} />
          {data.bpm_detected && <span className="text-[10px]" style={{ color: '#9CB2D6' }}>detected: {data.bpm_detected}</span>}
        </div>
        <input
          type="number"
          value={bpm}
          onChange={e => setBpm(e.target.value)}
          disabled={readOnly}
          placeholder="e.g. 128"
          min="40" max="300" step="0.5"
          className="w-full rounded-lg px-3 h-9 text-sm outline-none disabled:opacity-60"
          style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#EAF2FF' }}
          onFocus={e => e.target.style.borderColor = '#1EA0FF'}
          onBlur={e => e.target.style.borderColor = '#1C2A44'}
        />
      </div>

      {/* Key */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <label className="text-xs font-medium" style={{ color: '#9CB2D6' }}>Key</label>
          <ConfidencePill value={data.key_confidence} />
          {data.key_detected && <span className="text-[10px]" style={{ color: '#9CB2D6' }}>detected: {data.key_detected}</span>}
        </div>
        <select
          value={key}
          onChange={e => setKey(e.target.value)}
          disabled={readOnly}
          className="w-full rounded-lg px-3 h-9 text-sm outline-none cursor-pointer disabled:opacity-60"
          style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: key ? '#EAF2FF' : '#9CB2D6' }}
        >
          <option value="">— select key —</option>
          {KEYS.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      {/* Time Signature */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <label className="text-xs font-medium" style={{ color: '#9CB2D6' }}>Time signature</label>
          <ConfidencePill value={data.time_signature_confidence} />
          {data.time_signature_detected && <span className="text-[10px]" style={{ color: '#9CB2D6' }}>detected: {data.time_signature_detected}</span>}
        </div>
        <select
          value={timeSig}
          onChange={e => setTimeSig(e.target.value)}
          disabled={readOnly}
          className="w-full rounded-lg px-3 h-9 text-sm outline-none cursor-pointer disabled:opacity-60"
          style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: timeSig ? '#EAF2FF' : '#9CB2D6' }}
        >
          <option value="">— select —</option>
          {TIME_SIGS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {!readOnly && onSave && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 h-8 px-4 rounded-lg text-xs font-semibold disabled:opacity-50"
            style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Confirm values'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border"
            style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}>
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      )}
    </div>
  );
}

export function SongInfoCollapsible({ file, inputFileUrl, clipStart, clipEnd, onDetected }) {
  const [open, setOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [data, setData] = useState(null);
  const { base44 } = require('@/api/base44Client');

  const handleDetect = async () => {
    setDetecting(true);
    try {
      const res = await base44.functions.invoke('detectSongInfo', {
        input_file_url: inputFileUrl,
        clip_start_sec: clipStart || 0,
        clip_end_sec: clipEnd || null,
      });
      setData(res.data);
      if (onDetected) onDetected(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setDetecting(false);
    }
  };

  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Music2 className="w-3.5 h-3.5" style={{ color: '#9CB2D6' }} />
          <span className="text-xs font-medium" style={{ color: '#9CB2D6' }}>Song Info</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#1C2A44', color: '#9CB2D6' }}>optional</span>
          {data && (
            <span className="text-[10px]" style={{ color: '#19D3A2' }}>
              {data.bpm_detected} BPM · {data.key_detected} · {data.time_signature_detected}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5" style={{ color: '#9CB2D6' }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: '#9CB2D6' }} />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: '#1C2A44' }}>
          <div className="pt-4">
            {!data ? (
              <div className="space-y-3">
                <p className="text-xs" style={{ color: '#9CB2D6' }}>
                  Detect BPM, key and time signature from the uploaded file.
                </p>
                <button
                  onClick={handleDetect}
                  disabled={!file && !inputFileUrl || detecting}
                  className="flex items-center gap-2 h-8 px-4 rounded-lg text-xs font-semibold disabled:opacity-40"
                  style={{ backgroundColor: '#1C2A44', color: '#EAF2FF' }}>
                  {detecting
                    ? <><span className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor: '#9CB2D6' }} /> Detecting…</>
                    : <><Music2 className="w-3.5 h-3.5" /> Detect BPM, key and time signature</>}
                </button>
              </div>
            ) : (
              <SongInfoPanel
                data={data}
                onSave={async (vals) => {
                  if (onDetected) onDetected({ ...data, ...vals });
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}