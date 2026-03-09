import React, { useRef, useState } from 'react';
import { Play, Pause, Download } from 'lucide-react';
import Tooltip from '../auralyn/Tooltip';

export default function StemPlayer({ name, url, format = 'wav' }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current || !audioRef.current.duration) return;
    setCurrentTime(audioRef.current.currentTime);
    setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleEnded = () => setPlaying(false);

  const handleSeek = (e) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * audioRef.current.duration;
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const STEM_COLORS = {
    vocals: 'bg-sky-500',
    drums: 'bg-blue-500',
    bass: 'bg-emerald-500',
    other: 'bg-amber-500',
    no_vocals: 'bg-cyan-500',
  };

  const color = STEM_COLORS[name?.toLowerCase()] || 'bg-sky-500';

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl px-4 py-3.5 transition-all hover:border-white/10 hover:bg-white/[0.04]">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      <div className="flex items-center gap-3">
        <Tooltip text={playing ? 'Pause' : 'Play'} position="top">
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-400 flex items-center justify-center shrink-0 transition-all transform hover:scale-110 active:scale-95"
          >
            {playing
              ? <Pause className="w-3.5 h-3.5 text-white" />
              : <Play className="w-3.5 h-3.5 text-white ml-0.5" />
            }
          </button>
        </Tooltip>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-white capitalize font-medium">{name}</span>
            <span className="text-xs text-white/30 tabular-nums">
              {playing ? fmt(currentTime) : fmt(duration)} / {fmt(duration)}
            </span>
          </div>
          <div
            className="h-1.5 bg-white/10 rounded-full cursor-pointer overflow-hidden transition-colors hover:bg-white/15"
            onClick={handleSeek}
          >
            <div
              className={`h-full ${color} rounded-full transition-all duration-100`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Tooltip text="Download" position="top">
          <a
            href={url}
            download={`${name}.${format}`}
            onClick={e => e.stopPropagation()}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all transform hover:scale-110 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        </Tooltip>
      </div>
    </div>
  );
}