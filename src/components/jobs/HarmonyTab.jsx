import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Loader2, Music2 } from 'lucide-react';
import Card, { CardHeader } from '../auralyn/Card';

const SATB_TYPES = [
  { type: 'satb_soprano', label: 'Soprano', color: '#1EA0FF' },
  { type: 'satb_alto',    label: 'Alto',    color: '#19D3A2' },
  { type: 'satb_tenor',   label: 'Tenor',   color: '#FFB020' },
  { type: 'satb_bass',    label: 'Bass',    color: '#9B74FF' },
];

function ConfidenceBar({ label, value, color }) {
  const pct = Math.round((value || 0) * 100);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: '#9CB2D6' }}>{label}</span>
        <span className="text-xs font-mono tabular-nums" style={{ color: pct >= 70 ? '#19D3A2' : pct >= 40 ? '#FFB020' : '#9CB2D6' }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: '#1C2A44' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function AssetRow({ label, url, format, color }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg"
      style={{ backgroundColor: '#0B1220', border: `1px solid ${color}30` }}>
      <div className="flex items-center gap-2.5">
        <Music2 className="w-4 h-4" style={{ color }} />
        <span className="text-xs font-medium" style={{ color: '#EAF2FF' }}>{label}</span>
      </div>
      <a href={url} download={`${label.toLowerCase()}.${format || 'wav'}`}
        className="h-7 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5"
        style={{ backgroundColor: color + '18', color }}>
        <Download className="w-3 h-3" /> Download
      </a>
    </div>
  );
}

export default function HarmonyTab({ job, onJobUpdate, jobId }) {
  const [assets, setAssets] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [msg, setMsg] = useState('');

  const isGuide = job.harmony_mode === 'guide';
  const isSATB = job.harmony_mode === 'satb_experimental';
  const satbConf = job.satb_confidence_json || {};

  const relevantTypes = isGuide
    ? ['harmony_guide']
    : ['satb_soprano', 'satb_alto', 'satb_tenor', 'satb_bass'];

  useEffect(() => {
    base44.entities.JobAsset.filter({ job_id: jobId })
      .then(all => setAssets(all.filter(a => relevantTypes.includes(a.type))))
      .catch(() => {});
  }, [jobId]);

  const handleRequest = async () => {
    setRequesting(true);
    setMsg('');
    const res = await base44.functions.invoke('requestHarmony', { job_id: jobId });
    setMsg(res.data?.stage === 'Backend not connected'
      ? 'Backend not connected yet — will run once the processing backend is wired up.'
      : 'Harmony processing queued.');
    setRequesting(false);
  };

  const getAsset = (type) => assets.find(a => a.type === type);

  return (
    <Card>
      <CardHeader
        title={isGuide ? 'Harmony Guide' : 'SATB Split'}
        subtitle={isGuide
          ? 'Generate a rehearsal-friendly harmony guide from the vocal stem.'
          : 'Experimental: attempts to split choir vocals into soprano, alto, tenor, bass.'}
      />

      {isGuide && (
        <div className="space-y-3">
          {getAsset('harmony_guide') ? (
            <AssetRow label="Harmony Guide" url={getAsset('harmony_guide').url} format={job.output_format} color="#9B74FF" />
          ) : (
            <div className="rounded-lg p-4 text-center" style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
              <Music2 className="w-5 h-5 mx-auto mb-2 opacity-20" style={{ color: '#9B74FF' }} />
              <p className="text-xs" style={{ color: '#9CB2D6' }}>Harmony guide stem will appear here once processed.</p>
            </div>
          )}
        </div>
      )}

      {isSATB && (
        <div className="space-y-4">
          {/* Downloads */}
          <div className="space-y-2">
            {SATB_TYPES.map(({ type, label, color }) => {
              const asset = getAsset(type);
              return asset
                ? <AssetRow key={type} label={label} url={asset.url} format={job.output_format} color={color} />
                : (
                  <div key={type} className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                    style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
                    <div className="flex items-center gap-2.5">
                      <Music2 className="w-4 h-4 opacity-30" style={{ color }} />
                      <span className="text-xs" style={{ color: '#9CB2D6' }}>{label} — pending</span>
                    </div>
                  </div>
                );
            })}
          </div>

          {/* Confidence breakdown */}
          {Object.keys(satbConf).length > 0 && (
            <div className="rounded-lg p-3 space-y-3" style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
              <p className="text-xs font-medium" style={{ color: '#EAF2FF' }}>Confidence per part</p>
              {SATB_TYPES.map(({ type, label, color }) => {
                const key = label.toLowerCase();
                return satbConf[key] != null
                  ? <ConfidenceBar key={type} label={label} value={satbConf[key]} color={color} />
                  : null;
              })}
            </div>
          )}
        </div>
      )}

      {job.status === 'done' && assets.length === 0 && (
        <button onClick={handleRequest} disabled={requesting}
          className="w-full h-10 mt-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: '#9B74FF', color: '#fff' }}>
          {requesting ? <><Loader2 className="w-4 h-4 animate-spin" /> Requesting…</> : <><Music2 className="w-4 h-4" /> Request Harmony Processing</>}
        </button>
      )}

      {msg && <p className="text-xs mt-2" style={{ color: msg.includes('not connected') ? '#FFB020' : '#9B74FF' }}>{msg}</p>}
    </Card>
  );
}