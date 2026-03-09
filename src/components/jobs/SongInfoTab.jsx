import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, Music2 } from 'lucide-react';
import Card, { CardHeader } from '../auralyn/Card';
import SongInfoPanel from '../auralyn/SongInfoPanel';

export default function SongInfoTab({ job, jobId, onJobUpdate }) {
  const [detecting, setDetecting] = useState(false);
  const [detectedData, setDetectedData] = useState(null);

  const hasData = job.bpm_detected || job.key_detected || job.time_signature_detected;

  const handleDetect = async () => {
    setDetecting(true);
    try {
      const res = await base44.functions.invoke('detectSongInfo', {
        input_file_url: job.input_file_url || job.input_file,
        clip_start_sec: job.clip_start_sec || 0,
        clip_end_sec: job.clip_end_sec || null,
      });
      const d = res.data;
      setDetectedData(d);
      if (onJobUpdate) onJobUpdate(prev => ({ ...prev, ...d }));
    } catch (e) {
      console.error(e);
    } finally {
      setDetecting(false);
    }
  };

  const songData = detectedData || {
    bpm_detected: job.bpm_detected,
    bpm_confirmed: job.bpm_confirmed,
    bpm_confidence: job.bpm_confidence,
    key_detected: job.key_detected,
    key_confirmed: job.key_confirmed,
    key_confidence: job.key_confidence,
    time_signature_detected: job.time_signature_detected,
    time_signature_confirmed: job.time_signature_confirmed,
    time_signature_confidence: job.time_signature_confidence,
  };

  return (
    <div className="space-y-4">
      {!hasData && !detectedData ? (
        <div className="rounded-xl border p-8 flex flex-col items-center text-center gap-4"
          style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: '#1EA0FF12' }}>
            <Music2 className="w-6 h-6" style={{ color: '#1EA0FF' }} />
          </div>
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: '#EAF2FF' }}>Detect song metadata</p>
            <p className="text-xs leading-relaxed max-w-xs" style={{ color: '#9CB2D6' }}>
              Automatically detect BPM, musical key, and time signature from the audio.
              You can confirm or adjust the values afterward.
            </p>
          </div>
          <button onClick={handleDetect} disabled={detecting}
            className="flex items-center gap-2 h-10 px-5 rounded-xl text-sm font-semibold disabled:opacity-50"
            style={{ backgroundColor: '#1EA0FF', color: '#fff' }}>
            {detecting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Detecting…</>
              : <><Sparkles className="w-4 h-4" /> Detect BPM, Key & Time Signature</>}
          </button>
        </div>
      ) : (
        <Card>
          <CardHeader
            title="Song Info"
            subtitle="Auto-detected values — confirm if correct or adjust as needed"
            action={
              <button onClick={handleDetect} disabled={detecting}
                className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11px] font-medium border disabled:opacity-40"
                style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}>
                {detecting ? <><Loader2 className="w-3 h-3 animate-spin" /> Re-detecting…</> : <><Sparkles className="w-3 h-3" /> Re-detect</>}
              </button>
            }
          />
          <SongInfoPanel
            data={songData}
            onSave={async (vals) => {
              await base44.functions.invoke('saveSongInfo', { job_id: jobId, ...vals });
              if (onJobUpdate) onJobUpdate(j => ({ ...j, ...vals }));
            }}
          />
        </Card>
      )}
    </div>
  );
}