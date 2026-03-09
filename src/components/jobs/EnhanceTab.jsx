import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Loader2, Sparkles } from 'lucide-react';
import Card, { CardHeader } from '../auralyn/Card';

const OPTION_LABELS = {
  vocal_denoise:      'Vocal denoise',
  de_reverb:          'De-reverb vocals',
  reduce_hum:         'Reduce hum',
  loudness_normalize: 'Loudness normalize stems',
  de_noise:           'De-noise',
  normalize:          'Normalize',
};

const ASSET_LABELS = {
  clean_vocals: 'Clean Vocals',
  clean_band:   'Clean Band',
};

function AssetRow({ label, url, format }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg"
      style={{ backgroundColor: '#0B1220', border: '1px solid #19D3A230' }}>
      <div className="flex items-center gap-2.5">
        <Sparkles className="w-4 h-4" style={{ color: '#19D3A2' }} />
        <span className="text-xs font-medium" style={{ color: '#EAF2FF' }}>{label}</span>
      </div>
      <a href={url} download={`${label.toLowerCase().replace(' ', '_')}.${format || 'wav'}`}
        className="h-7 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5"
        style={{ backgroundColor: '#19D3A218', color: '#19D3A2' }}>
        <Download className="w-3 h-3" /> Download
      </a>
    </div>
  );
}

export default function EnhanceTab({ job, onJobUpdate, jobId }) {
  const [assets, setAssets] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    base44.entities.JobAsset.filter({ job_id: jobId })
      .then(all => setAssets(all.filter(a => ['clean_vocals', 'clean_band'].includes(a.type))))
      .catch(() => {});
  }, [jobId]);

  const opts = job.clean_audio_options_json || {};
  const activeOpts = Object.entries(opts).filter(([, v]) => v).map(([k]) => OPTION_LABELS[k] || k);

  const handleRequest = async () => {
    setRequesting(true);
    setMsg('');
    const res = await base44.functions.invoke('requestEnhance', { job_id: jobId });
    setMsg(res.data?.stage === 'Backend not connected'
      ? 'Backend not connected yet — will run once the processing backend is wired up.'
      : 'Enhancement queued.');
    setRequesting(false);
  };

  return (
    <Card>
      <CardHeader title="Clean Audio" subtitle="Reduce noise and room sound before exporting stems." />

      {/* What was requested */}
      <div className="mb-4">
        <p className="text-xs font-medium mb-2" style={{ color: '#9CB2D6' }}>Options selected at submission</p>
        {activeOpts.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {activeOpts.map(o => (
              <span key={o} className="text-[11px] px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#19D3A215', color: '#19D3A2', border: '1px solid #19D3A230' }}>
                {o}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: '#9CB2D6' }}>No options recorded.</p>
        )}
      </div>

      {/* Clean outputs */}
      {assets.length > 0 ? (
        <div className="space-y-2 mb-4">
          <p className="text-xs font-medium mb-2" style={{ color: '#9CB2D6' }}>Clean stems</p>
          {assets.map(a => (
            <AssetRow key={a.id} label={ASSET_LABELS[a.type] || a.name || a.type} url={a.url} format={job.output_format} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg p-4 text-center mb-4" style={{ backgroundColor: '#0B1220', border: '1px solid #1C2A44' }}>
          <Sparkles className="w-5 h-5 mx-auto mb-2 opacity-20" style={{ color: '#9CB2D6' }} />
          <p className="text-xs" style={{ color: '#9CB2D6' }}>Clean stems will appear here once processed.</p>
        </div>
      )}

      {job.status === 'done' && assets.length === 0 && (
        <button onClick={handleRequest} disabled={requesting}
          className="w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: '#19D3A2', color: '#0B1220' }}>
          {requesting ? <><Loader2 className="w-4 h-4 animate-spin" /> Requesting…</> : <><Sparkles className="w-4 h-4" /> Request Enhancement</>}
        </button>
      )}

      {msg && <p className="text-xs mt-2" style={{ color: msg.includes('not connected') ? '#FFB020' : '#19D3A2' }}>{msg}</p>}
    </Card>
  );
}