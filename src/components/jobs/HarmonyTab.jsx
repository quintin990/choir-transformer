import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Loader2, Music2, Mic2, Layers, Sparkles, ChevronRight, Info } from 'lucide-react';
import Card, { CardHeader } from '../auralyn/Card';
import SATBMixer from '../harmony/SATBMixer';

const SATB_META = [
  { type: 'satb_soprano', id: 'soprano', label: 'Soprano', color: '#1EA0FF' },
  { type: 'satb_alto',    id: 'alto',    label: 'Alto',    color: '#19D3A2' },
  { type: 'satb_tenor',   id: 'tenor',   label: 'Tenor',   color: '#FFB020' },
  { type: 'satb_bass',    id: 'bass',    label: 'Bass',    color: '#9B74FF' },
];

const SATB_PRESETS = [
  { label: 'All Parts',    volumes: { soprano: 1, alto: 1, tenor: 1, bass: 1 } },
  { label: 'Soprano only', volumes: { soprano: 1, alto: 0, tenor: 0, bass: 0 } },
  { label: 'Alto only',    volumes: { soprano: 0, alto: 1, tenor: 0, bass: 0 } },
  { label: 'Tenor only',   volumes: { soprano: 0, alto: 0, tenor: 1, bass: 0 } },
  { label: 'Bass only',    volumes: { soprano: 0, alto: 0, tenor: 0, bass: 1 } },
  { label: 'Upper voices', volumes: { soprano: 1, alto: 1, tenor: 0, bass: 0 } },
  { label: 'Lower voices', volumes: { soprano: 0, alto: 0, tenor: 1, bass: 1 } },
  { label: 'No Soprano',   volumes: { soprano: 0, alto: 1, tenor: 1, bass: 1 } },
  { label: 'No Bass',      volumes: { soprano: 1, alto: 1, tenor: 1, bass: 0 } },
];

function ConfidenceBar({ label, value, color }) {
  const pct = Math.round((value || 0) * 100);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: '#9CB2D6' }}>{label}</span>
        <span className="text-xs tabular-nums" style={{ fontFamily: "'DM Mono', monospace", color: pct >= 70 ? '#19D3A2' : pct >= 40 ? '#FFB020' : '#9CB2D6' }}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: '#1C2A44' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

const MODES = [
  {
    id: 'guide',
    label: 'Harmony Guide',
    icon: Mic2,
    color: '#9B74FF',
    desc: 'Generates a clean rehearsal guide from the vocal stem — ideal for choir directors sharing parts.',
    best: 'Best for: lead vocals, small ensembles',
  },
  {
    id: 'satb_experimental',
    label: 'SATB Split',
    icon: Layers,
    color: '#1EA0FF',
    badge: 'Experimental',
    desc: 'Attempts to separate choir recordings into Soprano, Alto, Tenor, Bass for individual rehearsal.',
    best: 'Best for: choir recordings with clear part separation',
  },
];

export default function HarmonyTab({ job, onJobUpdate, jobId }) {
  const [assets, setAssets] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [msg, setMsg] = useState('');

  const harmonyMode = job.harmony_mode;
  const isNone = !harmonyMode || harmonyMode === 'none';
  const isGuide = harmonyMode === 'guide';
  const isSATB  = harmonyMode === 'satb_experimental';
  const satbConf = job.satb_confidence_json || {};

  const relevantTypes = isGuide
    ? ['harmony_guide']
    : ['satb_soprano', 'satb_alto', 'satb_tenor', 'satb_bass'];

  useEffect(() => {
    if (!isNone) {
      base44.entities.JobAsset.filter({ job_id: jobId })
        .then(all => setAssets(all.filter(a => relevantTypes.includes(a.type))))
        .catch(() => {});
    }
  }, [jobId, harmonyMode]);

  const handleRequest = async () => {
    const mode = isNone ? selectedMode : harmonyMode;
    if (!mode) return;
    setRequesting(true);
    setMsg('');
    const res = await base44.functions.invoke('requestHarmony', { job_id: jobId, harmony_mode: mode });
    if (onJobUpdate) onJobUpdate({ ...job, harmony_mode: mode });
    setMsg(res.data?.stage === 'Backend not connected'
      ? 'Backend not connected yet — will run once the processing backend is wired up.'
      : 'Harmony processing queued.');
    setRequesting(false);
  };

  const getAsset = (type) => assets.find(a => a.type === type);

  const mixerTracks = isSATB
    ? SATB_META.map(m => { const a = getAsset(m.type); return { ...m, url: a?.url || null }; }).filter(t => t.url)
    : [];

  const hasMixerTracks = mixerTracks.length >= 2;

  // ── Mode picker (not yet run) ──────────────────────────────────────────────
  if (isNone) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl p-4" style={{ backgroundColor: '#0F1A2E', border: '1px solid #1C2A44' }}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4" style={{ color: '#9B74FF' }} />
            <h3 className="text-sm font-semibold" style={{ color: '#EAF2FF' }}>Harmony Engine</h3>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#9CB2D6' }}>
            Choose a harmony mode to run on the vocals from this job. This uses the separated vocal stem as input.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {MODES.map(mode => {
            const Icon = mode.icon;
            const selected = selectedMode === mode.id;
            return (
              <button key={mode.id} onClick={() => setSelectedMode(mode.id)}
                className="text-left rounded-xl p-4 space-y-2.5 transition-all"
                style={{
                  backgroundColor: selected ? mode.color + '12' : '#0F1A2E',
                  border: `1px solid ${selected ? mode.color + '60' : '#1C2A44'}`,
                }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: mode.color + '18' }}>
                      <Icon className="w-4 h-4" style={{ color: mode.color }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color: '#EAF2FF' }}>{mode.label}</span>
                  </div>
                  {mode.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0"
                      style={{ backgroundColor: '#FFB02015', color: '#FFB020', border: '1px solid #FFB02030' }}>
                      {mode.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#9CB2D6' }}>{mode.desc}</p>
                <p className="text-[11px]" style={{ color: mode.color + 'bb' }}>{mode.best}</p>
              </button>
            );
          })}
        </div>

        {selectedMode && (
          <button onClick={handleRequest} disabled={requesting || !job.status === 'done'}
            className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#9B74FF', color: '#fff' }}>
            {requesting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</>
              : <><Sparkles className="w-4 h-4" /> Run {MODES.find(m => m.id === selectedMode)?.label}</>}
          </button>
        )}
        {msg && <p className="text-xs mt-1" style={{ color: msg.includes('not connected') ? '#FFB020' : '#9B74FF' }}>{msg}</p>}
      </div>
    );
  }

  // ── Results ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Mode header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isGuide ? <Mic2 className="w-4 h-4" style={{ color: '#9B74FF' }} /> : <Layers className="w-4 h-4" style={{ color: '#1EA0FF' }} />}
          <span className="text-sm font-semibold" style={{ color: '#EAF2FF' }}>
            {isGuide ? 'Harmony Guide' : 'SATB Split'}
          </span>
          {isSATB && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
              style={{ backgroundColor: '#FFB02015', color: '#FFB020', border: '1px solid #FFB02030' }}>
              Experimental
            </span>
          )}
        </div>
      </div>

      {/* Guide output */}
      {isGuide && (
        <Card>
          {getAsset('harmony_guide') ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#9B74FF18' }}>
                  <Music2 className="w-4 h-4" style={{ color: '#9B74FF' }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#EAF2FF' }}>Harmony Guide</p>
                  <p className="text-xs" style={{ color: '#9CB2D6' }}>Ready to download</p>
                </div>
              </div>
              <a href={getAsset('harmony_guide').url} download="harmony_guide.wav"
                className="h-8 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                style={{ backgroundColor: '#9B74FF', color: '#fff' }}>
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#9B74FF10' }}>
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#9B74FF' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium mb-1" style={{ color: '#EAF2FF' }}>Processing harmony guide…</p>
                <p className="text-xs" style={{ color: '#9CB2D6' }}>This may take a few minutes.</p>
              </div>
              {job.status === 'done' && assets.length === 0 && (
                <button onClick={handleRequest} disabled={requesting}
                  className="h-8 px-4 rounded-lg text-xs font-semibold disabled:opacity-50"
                  style={{ backgroundColor: '#9B74FF', color: '#fff' }}>
                  {requesting ? 'Requesting…' : 'Retry'}
                </button>
              )}
            </div>
          )}
        </Card>
      )}

      {/* SATB output */}
      {isSATB && (
        <div className="space-y-4">
          {/* Confidence */}
          {Object.keys(satbConf).length > 0 && (
            <Card>
              <CardHeader title="Separation confidence" subtitle="How cleanly each part was isolated" />
              <div className="space-y-3">
                {SATB_META.map(({ id, label, color }) =>
                  satbConf[id] != null
                    ? <ConfidenceBar key={id} label={label} value={satbConf[id]} color={color} />
                    : null
                )}
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t items-start" style={{ borderColor: '#1C2A44' }}>
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#9CB2D6' }} />
                <p className="text-[11px] leading-relaxed" style={{ color: '#9CB2D6' }}>
                  In tightly-voiced sections, traces of other parts may bleed through — this is inherent to close-harmony recordings.
                </p>
              </div>
            </Card>
          )}

          {/* Part downloads */}
          {assets.length > 0 ? (
            <Card>
              <CardHeader title="Individual parts" subtitle="Download any part for focused rehearsal" />
              <div className="space-y-2">
                {SATB_META.map(({ type, label, color }) => {
                  const asset = getAsset(type);
                  return (
                    <div key={type} className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                      style={{ backgroundColor: '#0B1220', border: `1px solid ${asset ? color + '30' : '#1C2A44'}` }}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: asset ? color : '#1C2A44' }} />
                        <span className="text-xs font-medium" style={{ color: asset ? '#EAF2FF' : '#9CB2D6' }}>{label}</span>
                        {!asset && <span className="text-[10px]" style={{ color: '#9CB2D6' }}>processing…</span>}
                      </div>
                      {asset && (
                        <a href={asset.url} download={`${label.toLowerCase()}.${job.output_format || 'wav'}`}
                          className="h-7 px-3 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                          style={{ backgroundColor: color + '18', color }}>
                          <Download className="w-3 h-3" /> Download
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <Card>
              <div className="flex flex-col items-center py-6 gap-3">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#1EA0FF' }} />
                <div className="text-center">
                  <p className="text-sm font-medium mb-1" style={{ color: '#EAF2FF' }}>Separating SATB parts…</p>
                  <p className="text-xs" style={{ color: '#9CB2D6' }}>This can take 5–15 minutes depending on length.</p>
                </div>
              </div>
            </Card>
          )}

          {/* Interactive mixer */}
          {hasMixerTracks && (
            <div>
              <p className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#9CB2D6' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#9B74FF' }} />
                Interactive Mixer — blend parts live for rehearsal
              </p>
              <SATBMixer tracks={mixerTracks} presets={SATB_PRESETS} title={job.title || 'SATB Parts'} />
              <p className="text-[11px] mt-2" style={{ color: '#9CB2D6' }}>
                Tip: Enable Rehearsal Mode and solo your part to practice alongside the other voices.
              </p>
            </div>
          )}
          {!hasMixerTracks && assets.length > 0 && (
            <p className="text-[11px] text-center py-2" style={{ color: '#9CB2D6' }}>
              Interactive mixer available once at least 2 parts are ready.
            </p>
          )}
        </div>
      )}

      {msg && <p className="text-xs mt-1" style={{ color: msg.includes('not connected') ? '#FFB020' : '#9B74FF' }}>{msg}</p>}
    </div>
  );
}