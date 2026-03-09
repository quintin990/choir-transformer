import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

export default function BatchUploadManager({ onFilesSelected, maxFiles = 10 }) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndAddFiles = (fileList) => {
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/aiff'];
    const newFiles = [];

    for (const file of fileList) {
      if ((validTypes.includes(file.type) || /\.(mp3|wav|flac|aiff)$/i.test(file.name)) && file.size <= 200 * 1024 * 1024) {
        newFiles.push(file);
      }
    }

    const combined = [...files, ...newFiles].slice(0, maxFiles);
    setFiles(combined);
    onFilesSelected(combined);
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    validateAndAddFiles(e.dataTransfer.files);
  };

  const handleChange = (e) => {
    validateAndAddFiles(e.target.files);
  };

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesSelected(updated);
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className="relative rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer"
        style={{
          backgroundColor: dragActive ? '#1EA0FF08' : '#0B1220',
          borderColor: dragActive ? '#1EA0FF' : '#1C2A44',
        }}
      >
        <input ref={inputRef} type="file" multiple accept=".mp3,.wav,.flac,.aiff,audio/*" onChange={handleChange} className="hidden" />
        <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: '#1EA0FF' }} />
        <p className="text-sm font-medium" style={{ color: '#EAF2FF' }}>Drag files here or click to select</p>
        <p className="text-xs mt-1" style={{ color: '#9CB2D6' }}>MP3, WAV, FLAC, AIFF · Max 200 MB each · {maxFiles - files.length} slots remaining</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="absolute inset-0" />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium" style={{ color: '#9CB2D6' }}>Selected files ({files.length})</p>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#0F1A2E', border: '1px solid #1C2A44' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: '#EAF2FF' }}>{file.name}</p>
                  <p className="text-[11px]" style={{ color: '#9CB2D6' }}>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <button type="button" onClick={() => removeFile(idx)} className="ml-2 p-1.5 rounded hover:opacity-70 transition-opacity" style={{ color: '#9CB2D6' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}