import React, { useState } from 'react';
import { Upload, Music2, X } from 'lucide-react';

const ACCEPTED = /\.(mp3|wav|flac|aiff|aif|m4a)$/i;
const MAX_BYTES = 200 * 1024 * 1024;

function fmtSize(bytes) {
  if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export default function FileDropZone({ file, onFile, error }) {
  const [drag, setDrag] = useState(false);

  const validate = (f) => {
    if (!ACCEPTED.test(f.name)) return 'Unsupported format. Use MP3, WAV, FLAC, AIFF, or M4A.';
    if (f.size > MAX_BYTES) return 'File exceeds 200 MB limit.';
    return null;
  };

  const handle = (f) => {
    if (!f) return;
    onFile(f, validate(f));
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false); }}
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}
      onClick={() => !file && document.getElementById('auralyn-file').click()}
      className="rounded-xl border-2 border-dashed transition-all cursor-pointer select-none"
      style={{
        borderColor: drag ? '#1EA0FF' : error ? '#FF4D6D40' : file ? '#1EA0FF40' : '#1C2A44',
        backgroundColor: drag ? '#1EA0FF08' : error ? '#FF4D6D08' : file ? '#1EA0FF08' : '#0B1220',
      }}
    >
      <input id="auralyn-file" type="file" accept=".mp3,.wav,.flac,.aiff,.aif,.m4a,audio/*"
        className="hidden" onChange={e => { handle(e.target.files[0]); e.target.value = ''; }} />

      {file ? (
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#1EA0FF18' }}>
            <Music2 className="w-5 h-5" style={{ color: '#1EA0FF' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: '#EAF2FF' }}>{file.name}</p>
            <p className="text-xs mt-0.5" style={{ color: '#9CB2D6' }}>{fmtSize(file.size)}</p>
            {error && <p className="text-xs mt-0.5" style={{ color: '#FF4D6D' }}>{error}</p>}
          </div>
          <button type="button" onClick={e => { e.stopPropagation(); onFile(null, null); }}
            className="shrink-0 transition-colors" style={{ color: '#9CB2D6' }}
            onMouseEnter={e => e.currentTarget.style.color='#EAF2FF'}
            onMouseLeave={e => e.currentTarget.style.color='#9CB2D6'}>
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="py-12 text-center px-6">
          <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center transition-colors"
            style={{ backgroundColor: drag ? '#1EA0FF18' : '#1C2A44' }}>
            <Upload className="w-5 h-5" style={{ color: drag ? '#1EA0FF' : '#9CB2D6' }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: drag ? '#EAF2FF' : '#9CB2D6' }}>
            {drag ? 'Drop to upload' : 'Drop audio file here'}
          </p>
          <p className="text-xs" style={{ color: '#9CB2D6' }}>
            or click to browse · MP3, WAV, FLAC, AIFF · max 200 MB
          </p>
        </div>
      )}
    </div>
  );
}