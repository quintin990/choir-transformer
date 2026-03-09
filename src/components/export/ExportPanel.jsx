import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Loader2, Music2 } from 'lucide-react';

const FORMATS = [
  { value: 'reaper', label: 'Reaper (.rpp)', sub: 'Full session with tracks, gain staging, and loop region.', supported: true },
  { value: 'ableton', label: 'Ableton Live (.als)', sub: 'Coming soon', supported: false },
];

const OPTIONS = [
  { key: 'includeStems', label: 'Include stems as audio tracks' },
  { key: 'applyGain', label: 'Apply stem gain levels from console' },
  { key: 'applyPan', label: 'Apply pan settings' },
  { key: 'applyEQ', label: 'Apply EQ nodes (if configured)' },
  { key: 'setLoopToClip', label: 'Set clip range as session loop region' },
];

export default function ExportPanel({ job, onJobUpdate }) {
  const [dawFormat, setDawFormat] = useState('reaper');
  const [opts, setOpts] = useState({ includeStems: true, applyGain: true, applyPan: true, applyEQ: false, setLoopToClip: true });
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState('');

  const toggle = (k) => setOpts(o => ({ ...o, [k]: !o[k] }));

  const handleGenerate = async () => {
    setRequesting(true);
    setError('');
    try {
      await base44.functions.invoke('requestExport', { job_id: job.id, daw_format: dawFormat, options: opts });
      if (onJobUpdate) onJobUpdate({ ...job, export_status: 'preparing' });
    } catch (err) {
      setError(err.response?.data?.error || 'Export request failed. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  const exportStatus = job.export_status || 'none';

  return (
    <div className="space-y-5">
      {/* Format selector */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: '#9CB2D6' }}>DAW format</p>
        <div className="space-y-2">
          {FORMATS.map(({ value, label, sub, supported }) => (
            <label key={value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${!supported ? 'opacity-50' : ''}`}
              style={{
                backgroundColor: dawFormat === value ? '#1EA0FF08' : '#0B1220',
                borderColor: dawFormat === value ? '#1EA0FF40' : '#1C2A44',
              }}>
              <input type="radio" name="dawfmt" value={value} checked={dawFormat === value}
                onChange={() => supported && setDawFormat(value)} disabled={!supported}
                className="mt-0.5 accent-[#1EA0FF]" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium" style={{ color: '#EAF2FF' }}>{label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: supported ? '#9CB2D6' : '#FF4D6D66' }}>{sub}</p>
              </div>
              {supported && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0"
                  style={{ backgroundColor: '#19D3A218', color: '#19D3A2' }}>Ready</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Options */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: '#9CB2D6' }}>Session options</p>
        <div className="space-y-2">
          {OPTIONS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={opts[key]} onChange={() => toggle(key)}
                className="w-4 h-4 rounded cursor-pointer accent-[#1EA0FF]" />
              <span className="text-xs" style={{ color: opts[key] ? '#EAF2FF' : '#9CB2D6' }}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Action / status */}
      {exportStatus === 'none' && (
        <button onClick={handleGenerate} disabled={requesting}
          className="w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
          {requesting
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Requesting…</>
            : <><Music2 className="w-4 h-4" /> Generate Session File</>}
        </button>
      )}

      {exportStatus === 'preparing' && (
        <div className="flex items-center gap-3 p-3 rounded-lg border"
          style={{ backgroundColor: '#1EA0FF08', borderColor: '#1EA0FF20' }}>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" style={{ color: '#1EA0FF' }} />
          <p className="text-xs" style={{ color: '#9CB2D6' }}>Generating your session file… This may take a moment.</p>
        </div>
      )}

      {exportStatus === 'ready' && job.export_asset_url && (
        <a href={job.export_asset_url} download
          className="flex items-center justify-center gap-2 w-full h-10 rounded-lg text-sm font-semibold"
          style={{ backgroundColor: '#19D3A2', color: '#0B1220' }}>
          <Download className="w-4 h-4" /> Download Session File
        </a>
      )}

      {exportStatus === 'failed' && (
        <div className="space-y-3">
          <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: '#FF4D6D10', border: '1px solid #FF4D6D30', color: '#FF4D6D' }}>
            {job.export_error_message || 'Export failed.'}
          </div>
          <button onClick={handleGenerate} disabled={requesting}
            className="w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: '#1C2A44', color: '#EAF2FF' }}>
            {requesting ? <><Loader2 className="w-4 h-4 animate-spin" /> Retrying…</> : 'Try again'}
          </button>
        </div>
      )}

      {error && <p className="text-xs" style={{ color: '#FF4D6D' }}>{error}</p>}

      <div className="p-3 rounded-lg text-xs leading-relaxed" style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44', color: '#9CB2D6' }}>
        <span style={{ color: '#EAF2FF' }}>Reaper:</span> Exports a .rpp project file with stems loaded as individual tracks, gain and pan staging pre-applied, and the selected clip range set as the session loop. Open directly in Reaper 6+.
      </div>
    </div>
  );
}