import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Zap } from 'lucide-react';
import Tooltip from '../auralyn/Tooltip';

export default function PracticePlayer({ stems, userPart = 'soprano', onSessionLog }) {
  const audioRefs = useRef({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tempoMultiplier, setTempoMultiplier] = useState(1);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(null);
  const [isLooping, setIsLooping] = useState(false);
  const [volumes, setVolumes] = useState(() => {
    const v = {};
    stems.forEach(s => {
      v[s.name] = s.name.toLowerCase() === userPart.toLowerCase() ? 1 : 0.5;
    });
    return v;
  });
  const [soloStem, setSoloStem] = useState(null);
  const [contextMix, setContextMix] = useState('all');
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const animationRef = useRef(null);

  useEffect(() => {
    // Initialize audio elements
    stems.forEach(stem => {
      if (!audioRefs.current[stem.name] && stem.url) {
        const audio = new Audio(stem.url);
        audio.addEventListener('loadedmetadata', () => {
          if (duration === 0) setDuration(audio.duration);
        });
        audio.addEventListener('timeupdate', () => {
          setCurrentTime(audio.currentTime);
        });
        audioRefs.current[stem.name] = audio;
      }
    });

    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [stems, duration]);

  const togglePlay = () => {
    if (!isPlaying) {
      if (!sessionStartTime) setSessionStartTime(Date.now());
      Object.entries(audioRefs.current).forEach(([name, audio]) => {
        const shouldPlay = !soloStem || soloStem === name;
        if (shouldPlay) audio.play().catch(() => {});
      });
      setIsPlaying(true);
    } else {
      Object.values(audioRefs.current).forEach(audio => audio.pause());
      setIsPlaying(false);
    }
  };

  const handleSeek = (time) => {
    setCurrentTime(time);
    Object.values(audioRefs.current).forEach(audio => {
      audio.currentTime = time;
    });
    if (isLooping && (time < loopStart || time > (loopEnd || duration))) {
      Object.values(audioRefs.current).forEach(audio => {
        audio.currentTime = loopStart;
      });
      setCurrentTime(loopStart);
    }
  };

  const handleStop = () => {
    Object.values(audioRefs.current).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    setIsPlaying(false);
    setCurrentTime(0);
    if (sessionStartTime && onSessionLog) {
      onSessionLog({
        duration_seconds: Math.round((Date.now() - sessionStartTime) / 1000),
        loops_used: isLooping,
        tempo_used: tempoMultiplier,
      });
    }
    setSessionStartTime(null);
  };

  const updateVolume = (stemName, value) => {
    setVolumes(prev => ({ ...prev, [stemName]: value }));
    if (audioRefs.current[stemName]) {
      audioRefs.current[stemName].volume = value;
    }
  };

  const toggleSolo = (stemName) => {
    if (soloStem === stemName) {
      setSoloStem(null);
      Object.values(audioRefs.current).forEach(audio => {
        audio.volume = 0.8;
      });
    } else {
      setSoloStem(stemName);
    }
  };

  const applyContextMix = (mix) => {
    setContextMix(mix);
    const mixes = {
      all: {},
      my_part_soft: {},
      choir_only: {},
      instrumental_only: {},
    };

    stems.forEach(stem => {
      const name = stem.name.toLowerCase();
      const isUserPart = name === userPart.toLowerCase();

      switch (mix) {
        case 'my_part_soft':
          mixes['my_part_soft'][stem.name] = isUserPart ? 0.8 : 0.2;
          break;
        case 'choir_only':
          mixes['choir_only'][stem.name] = isUserPart ? 0 : 0.8;
          break;
        case 'instrumental_only':
          mixes['instrumental_only'][stem.name] = isUserPart ? 0 : 0.8;
          break;
        default:
          mixes['all'][stem.name] = 0.8;
      }
    });

    const newVolumes = mixes[mix] || {};
    Object.entries(newVolumes).forEach(([name, vol]) => {
      updateVolume(name, vol);
    });
  };

  const formatTime = (seconds) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6" style={{ backgroundColor: 'hsl(var(--color-card))', border: `1px solid hsl(var(--color-border))`, borderRadius: '0.75rem', padding: '1.5rem' }}>
      {/* Playback Controls */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Tooltip text={isPlaying ? 'Pause' : 'Play'} position="top">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              style={{ backgroundColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-primary-foreground))' }}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
          </Tooltip>

          <div className="flex-1 flex items-center gap-2">
            <span className="text-xs font-mono" style={{ color: 'hsl(var(--color-muted))' }}>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={e => handleSeek(parseFloat(e.target.value))}
              className="flex-1 h-1 rounded-full accent-[hsl(var(--color-primary))]"
            />
            <span className="text-xs font-mono" style={{ color: 'hsl(var(--color-muted))' }}>{formatTime(duration)}</span>
          </div>

          <Tooltip text="Stop & log" position="top">
            <button
              onClick={handleStop}
              className="px-3 h-9 rounded-lg text-xs font-medium transition-colors"
              style={{ backgroundColor: 'hsl(var(--color-input))', color: 'hsl(var(--color-muted))', border: `1px solid hsl(var(--color-border))` }}
            >
              Stop
            </button>
          </Tooltip>
        </div>

        {/* Tempo Control */}
        <div className="flex items-center gap-3">
          <Tooltip text="Slow down tempo" position="right">
            <button
              onClick={() => setTempoMultiplier(Math.max(0.5, tempoMultiplier - 0.1))}
              className="px-2 h-8 rounded text-xs font-medium"
              style={{ backgroundColor: 'hsl(var(--color-input))', color: 'hsl(var(--color-muted))' }}
            >
              −
            </button>
          </Tooltip>
          <div className="flex-1 text-center">
            <div className="text-sm font-semibold" style={{ color: 'hsl(var(--color-text))' }}>
              Tempo: {Math.round(tempoMultiplier * 100)}%
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={tempoMultiplier}
              onChange={e => setTempoMultiplier(parseFloat(e.target.value))}
              className="w-full h-1 rounded-full accent-[hsl(var(--color-primary))]"
            />
          </div>
          <Tooltip text="Speed up tempo" position="left">
            <button
              onClick={() => setTempoMultiplier(Math.min(1.5, tempoMultiplier + 0.1))}
              className="px-2 h-8 rounded text-xs font-medium"
              style={{ backgroundColor: 'hsl(var(--color-input))', color: 'hsl(var(--color-muted))' }}
            >
              +
            </button>
          </Tooltip>
        </div>

        {/* Loop Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLooping(!isLooping)}
            className="px-3 h-8 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: isLooping ? 'hsl(var(--color-primary))' : 'hsl(var(--color-input))',
              color: isLooping ? 'hsl(var(--color-primary-foreground))' : 'hsl(var(--color-muted))',
              border: `1px solid hsl(var(--color-border))`
            }}
          >
            {isLooping ? '🔁 Looping' : '🔁 Loop'}
          </button>
          {isLooping && (
            <>
              <input
                type="number"
                min="0"
                max={duration}
                value={Math.round(loopStart)}
                onChange={e => setLoopStart(parseFloat(e.target.value))}
                placeholder="Start"
                className="w-16 h-8 rounded px-2 text-xs"
                style={{ backgroundColor: 'hsl(var(--color-input))', color: 'hsl(var(--color-text))', border: `1px solid hsl(var(--color-border))` }}
              />
              <span style={{ color: 'hsl(var(--color-muted))' }}>–</span>
              <input
                type="number"
                min="0"
                max={duration}
                value={loopEnd ? Math.round(loopEnd) : Math.round(duration)}
                onChange={e => setLoopEnd(parseFloat(e.target.value))}
                placeholder="End"
                className="w-16 h-8 rounded px-2 text-xs"
                style={{ backgroundColor: 'hsl(var(--color-input))', color: 'hsl(var(--color-text))', border: `1px solid hsl(var(--color-border))` }}
              />
            </>
          )}
        </div>
      </div>

      {/* Context Mix Presets */}
      <div className="border-t pt-4 space-y-3" style={{ borderColor: 'hsl(var(--color-border))' }}>
        <div className="text-xs font-semibold" style={{ color: 'hsl(var(--color-text))' }}>Context Mix</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Full Mix', value: 'all' },
            { label: 'My Part Soft', value: 'my_part_soft' },
            { label: 'Choir Only', value: 'choir_only' },
            { label: 'Instrumental', value: 'instrumental_only' },
          ].map(preset => (
            <button
              key={preset.value}
              onClick={() => applyContextMix(preset.value)}
              className="h-8 rounded text-xs font-medium transition-all"
              style={{
                backgroundColor: contextMix === preset.value ? 'hsl(var(--color-primary))' : 'hsl(var(--color-input))',
                color: contextMix === preset.value ? 'hsl(var(--color-primary-foreground))' : 'hsl(var(--color-muted))',
                border: `1px solid hsl(var(--color-border))`
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stem Controls */}
      <div className="border-t pt-4 space-y-3" style={{ borderColor: 'hsl(var(--color-border))' }}>
        <div className="text-xs font-semibold" style={{ color: 'hsl(var(--color-text))' }}>Stem Controls</div>
        <div className="space-y-2">
          {stems.map(stem => {
            const isUser = stem.name.toLowerCase() === userPart.toLowerCase();
            return (
              <div key={stem.name} className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'hsl(var(--color-background))' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium" style={{ color: 'hsl(var(--color-text))' }}>
                    {stem.name}
                    {isUser && <span className="ml-1 text-[10px]" style={{ color: 'hsl(var(--color-primary))' }}>★ YOUR PART</span>}
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volumes[stem.name] || 0.8}
                    onChange={e => updateVolume(stem.name, parseFloat(e.target.value))}
                    className="w-full h-1 rounded-full accent-[hsl(var(--color-primary))]"
                  />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleSolo(stem.name)}
                    className="w-7 h-7 rounded text-[10px] font-bold transition-all"
                    style={{
                      backgroundColor: soloStem === stem.name ? 'hsl(var(--color-accent))' : 'hsl(var(--color-input))',
                      color: soloStem === stem.name ? 'white' : 'hsl(var(--color-muted))',
                    }}
                  >
                    S
                  </button>
                  <button
                    onClick={() => updateVolume(stem.name, volumes[stem.name] > 0 ? 0 : 0.8)}
                    className="w-7 h-7 rounded flex items-center justify-center text-[10px] transition-all"
                    style={{
                      backgroundColor: volumes[stem.name] === 0 ? 'hsl(var(--color-destructive) / 0.7)' : 'hsl(var(--color-input))',
                      color: volumes[stem.name] === 0 ? 'white' : 'hsl(var(--color-muted))',
                    }}
                  >
                    {volumes[stem.name] === 0 ? '✕' : '♪'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}