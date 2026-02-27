import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Music } from 'lucide-react';

export default function EnhancementUploader({ file, onFileChange, title, onTitleChange }) {
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) onFileChange(f);
  };

  return (
    <div className="space-y-3">
      {!file ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-8 text-center cursor-pointer transition-colors"
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Drop audio file here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">WAV, MP3, FLAC · up to 200MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={e => onFileChange(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
          <Music className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>
          <button onClick={() => onFileChange(null)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div>
        <Label className="text-sm mb-1 block">Job Title (optional)</Label>
        <Input
          placeholder="e.g. Podcast Ep. 12 – Noise Reduction"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
        />
      </div>
    </div>
  );
}