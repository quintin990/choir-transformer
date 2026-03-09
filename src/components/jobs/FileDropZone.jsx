import React, { useState } from 'react';
import { Upload, X, Music2 } from 'lucide-react';

const ACCEPTED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/x-flac', 'audio/aiff', 'audio/x-aiff', 'audio/m4a', 'audio/mp4', 'audio/x-m4a'];
const ACCEPTED_EXT = /\.(mp3|wav|flac|aiff|aif|m4a)$/i;
const MAX_SIZE = 200 * 1024 * 1024;

export default function FileDropZone({ onFile, file }) {
  const [dragging, setDragging] = useState(false);

  const validate = (f) => {
    if (!ACCEPTED_TYPES.includes(f.type) && !ACCEPTED_EXT.test(f.name))
      return 'Unsupported format. Use MP3, WAV, FLAC, AIFF, or M4A.';
    if (f.size > MAX_SIZE) return 'File exceeds 200 MB limit.';
    return null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f, validate(f));
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !file && document.getElementById('audio-drop-input').click()}
      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all select-none ${
        dragging ? 'border-sky-400 bg-sky-500/5' :
        file ? 'border-sky-500/30 bg-sky-500/5 cursor-default' :
        'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] cursor-pointer'
      }`}
    >
      <input
        id="audio-drop-input"
        type="file"
        accept=".mp3,.wav,.flac,.aiff,.aif,.m4a,audio/*"
        className="hidden"
        onChange={e => { const f = e.target.files[0]; if (f) onFile(f, validate(f)); e.target.value = ''; }}
      />

      {file ? (
        <div className="flex items-center justify-center gap-4">
          <Music2 className="w-8 h-8 text-sky-400 shrink-0" />
          <div className="text-left min-w-0">
            <p className="text-white font-medium truncate max-w-xs">{file.name}</p>
            <p className="text-white/40 text-sm mt-0.5">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onFile(null, null); }}
            className="ml-2 text-white/30 hover:text-white/70 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <>
          <Upload className="w-10 h-10 text-white/20 mx-auto mb-4" />
          <p className="text-white/70 font-medium mb-1">Drop your audio file here</p>
          <p className="text-white/30 text-sm">or click to browse</p>
          <p className="text-white/20 text-xs mt-3">MP3 · WAV · FLAC · AIFF · M4A · up to 200 MB</p>
        </>
      )}
    </div>
  );
}