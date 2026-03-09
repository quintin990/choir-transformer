import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Loader2, Music2 } from 'lucide-react';
import Card, { CardHeader } from '../auralyn/Card';
import SATBMixer from '../harmony/SATBMixer';

const SATB_META = [
  { type: 'satb_soprano', id: 'soprano', label: 'Soprano', color: '#1EA0FF', kind: 'voice' },
  { type: 'satb_alto',    id: 'alto',    label: 'Alto',    color: '#19D3A2', kind: 'voice' },
  { type: 'satb_tenor',   id: 'tenor',   label: 'Tenor',   color: '#FFB020', kind: 'voice' },
  { type: 'satb_bass',    id: 'bass',    label: 'Bass',    color: '#9B74FF', kind: 'voice' },
];

// Presets — volumes keyed by track id
const SATB_PRESETS = [
  { label: 'All Parts',       volumes: { soprano: 1,    alto: 1,    tenor: 1,    bass: 1 } },
  { label: 'Soprano only',    volumes: { soprano: 1,    alto: 0,    tenor: 0,    bass: 0 } },
  { label: 'Alto only',       volumes: { soprano: 0,    alto: 1,    tenor: 0,    bass: 0 } },
  { label: 'Tenor only',      volumes: { soprano: 0,    alto: 0,    tenor: 1,    bass: 0 } },
  { label: 'Bass only',       volumes: { soprano: 0,    alto: 0,    tenor: 0,    bass: 1 } },
  { label: 'Upper voices',    volumes: { soprano: 1,    alto: 1,    tenor: 0,    bass: 0 } },
  { label: 'Lower voices',    volumes: { soprano: 0,    alto: 0,    tenor: 1,    bass: 1 } },
  { label: 'No Soprano',      volumes: { soprano: 0,    alto: 1,    tenor: 1,    bass: 1 } },
  { label: 'No Bass',         volumes: { soprano: 1,    alto: 1,    tenor: 1,    bass: 0 } },
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

export default function HarmonyTab({ job, onJobUpdate, jobId }) {
  const [assets, setAssets] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [msg, setMsg] = useState('');

  const isGuide = job.harmony_mode === 'guide';
  const isSATB  = job.harmony_mode === 'satb_experimental';
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

  // Build mixer tracks for SATB when assets are available
  const mixerTracks = isSATB
    ? SATB_META.map(m => {
        const asset = getAsset(m.type);
        return { ...m, url: asset?.url || null };
      }).filter(t => t.url)
    : [];

  const hasMixerTracks = mixerTracks.length >= 2;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title={isGuide ? 'Harmony Guide' : 'SATB Split'}
          subtitle={isGuide
            ? 'Generate a rehearsal-friendly harmony guide from the vocal stem.'
            : 'Experimental: attempts to split choir vocals into soprano, alto, tenor, bass.'}
        />

        {/* Guide mode */}
        {isGuide && (
          <div className="space-y-3">
            {getAsset('harmony_guide') ? (
              <div className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                style={{ backgroundColor: '#0B1220', border: '1px solid #9B74FF30' }}>
                <div className="flex items-center gap-2.5">
                  <Music2 className="w-4 h-4" style={{ color: '#9B74FF' }} />
                  <span className="text-xs font-medium" style={{ color: '#EAF2FF' }}>Harmony Guide</span>
                </div>
                <a href={getAsset('harmony_guide').url} download="harmony_guide.wav"
                  className="h-7 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5"
                  style={{ backgroundColor: '#9B74FF18', color: '#9B74FF' }}>
                  <Download className="w-3 h-3" /> Download
                </a>
              </div>
            ) : (
              <div className="rounded-lg p-4 text-center" style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
                <Music2 className="w-5 h-5 mx-auto mb-2 opacity-20" style={{ color: '#9B74FF' }} />
                <p className="text-xs" style={{ color: '#9CB2D6' }}>Harmony guide stem will appear here once processed.</p>
              </div>
            )}
          </div>
        )}

        {/* SATB: confidence + individual downloads */}
        {isSATB && (
          <div className="space-y-4">
            {/* Confidence breakdown */}
            {Object.keys(satbConf).length > 0 && (
              <div className="rounded-lg p-3 space-y-3" style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
                <p className="text-xs font-medium" style={{ color: '#EAF2FF' }}>Separation confidence per part</p>
                {SATB_META.map(({ id, label, color }) => {
                  return satbConf[id] != null
                    ? <ConfidenceBar key={id} label={label} value={satbConf[id]} color={color} />
                    : null;
                })}
                <p className="text-[10px]" style={{ color: '#9CB2D6' }}>
                  In sections with tight harmonies, traces of other parts may appear — this is normal for closely-voiced choir recordings.
                </p>
              </div>
            )}

            {/* Individual downloads */}
            {assets.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium" style={{ color: '#9CB2D6' }}>Download individual parts</p>
                {SATB_META.map(({ type, label, color }) => {
                  const asset = getAsset(type);
                  if (!asset) return null;
                  return (
                    <div key={type} className="flex items-center justify-between px-3 py-2 rounded-lg"
                      style={{ backgroundColor: '#0B1220', border: `1px solid ${color}25` }}>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-xs" style={{ color: '#EAF2FF' }}>{label}</span>
                      </div>
                      <a href={asset.url} download={`${label.toLowerCase()}.${job.output_format || 'wav'}`}
                        className="h-6 px-2.5 rounded text-[11px] font-medium flex items-center gap-1"
                        style={{ backgroundColor: color + '18', color }}>
                        <Download className="w-2.5 h-2.5" /> Download
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Request button if no assets yet */}
        {job.status === 'done' && assets.length === 0 && (
          <button onClick={handleRequest} disabled={requesting}
            className="w-full h-10 mt-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: '#9B74FF', color: '#fff' }}>
            {requesting ? <><Loader2 className="w-4 h-4 animate-spin" /> Requesting…</> : <><Music2 className="w-4 h-4" /> Request Harmony Processing</>}
          </button>
        )}

        {msg && <p className="text-xs mt-2" style={{ color: msg.includes('not connected') ? '#FFB020' : '#9B74FF' }}>{msg}</p>}
      </Card>

      {/* Interactive SATB Mixer */}
      {isSATB && hasMixerTracks && (
        <div>
          <p className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#9CB2D6' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#9B74FF' }} />
            Interactive Mixer — mix parts live, solo for rehearsal
          </p>
          <SATBMixer
            tracks={mixerTracks}
            presets={SATB_PRESETS}
            title={job.title || 'SATB Parts'}
          />
          <p className="text-[11px] mt-2" style={{ color: '#9CB2D6' }}>
            Tip: Enable Rehearsal Mode and solo your part to practice with the other voices softly in the background.
          </p>
        </div>
      )}

      {/* Pending SATB tracks list when only some loaded */}
      {isSATB && !hasMixerTracks && assets.length > 0 && (
        <Card>
          <p className="text-xs font-medium mb-2" style={{ color: '#9CB2D6' }}>Parts available</p>
          <div className="space-y-1.5">
            {SATB_META.map(({ type, label, color }) => {
              const asset = getAsset(type);
              return (
                <div key={type} className="flex items-center gap-2 text-xs py-1"
                  style={{ color: asset ? '#EAF2FF' : '#9CB2D6' }}>
                  <div className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: asset ? color : '#1C2A44' }} />
                  {label} {!asset && '— pending'}
                </div>
              );
            })}
          </div>
          <p className="text-[11px] mt-3" style={{ color: '#9CB2D6' }}>
            Interactive mixer appears once at least 2 parts are ready.
          </p>
        </Card>
      )}
    </div>
  );
}