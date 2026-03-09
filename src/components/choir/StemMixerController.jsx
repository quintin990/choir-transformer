import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Music, Settings2, Zap } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

export default function StemMixerController({ jobId, stems, onStemsChange }) {
  const [stemVolumes, setStemVolumes] = useState({});
  const [mode, setMode] = useState('context'); // 'context' or 'isolated'
  const [selectedPart, setSelectedPart] = useState('soprano');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef(null);
  const audioSourcesRef = useRef({});

  // Initialize volumes for all stems
  useEffect(() => {
    if (stems && Object.keys(stems).length > 0) {
      const initialVolumes = {};
      Object.keys(stems).forEach(stemKey => {
        initialVolumes[stemKey] = 1;
      });
      setStemVolumes(initialVolumes);
    }
  }, [stems]);

  const handleVolumeChange = (stemKey, value) => {
    const newVolume = value[0];
    setStemVolumes(prev => ({ ...prev, [stemKey]: newVolume }));
  };

  const toggleMode = () => {
    setMode(mode === 'context' ? 'isolated' : 'context');
    // Stop playback when switching modes
    setIsPlaying(false);
  };

  const getStemLabel = (stemKey) => {
    const labels = {
      'vocals': 'Vocals',
      'piano': 'Piano',
      'drums': 'Drums',
      'bass': 'Bass',
      'guitar': 'Guitar',
      'strings': 'Strings',
      'soprano': 'Soprano',
      'alto': 'Alto',
      'tenor': 'Tenor',
      'bass': 'Bass',
    };
    return labels[stemKey] || stemKey.charAt(0).toUpperCase() + stemKey.slice(1);
  };

  return (
    <div className="rounded-xl border p-6" style={{ backgroundColor: '#0F1A2E', borderColor: '#1C2A44' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" style={{ color: '#1EA0FF' }} />
          <h3 className="text-lg font-semibold" style={{ color: '#EAF2FF' }}>
            Interactive Mixer
          </h3>
        </div>
        <button
          onClick={toggleMode}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: mode === 'isolated' ? '#9B74FF' : '#1C2A44',
            color: mode === 'isolated' ? '#fff' : '#9CB2D6',
          }}
        >
          {mode === 'isolated' ? (
            <>
              <Music className="w-4 h-4" />
              Isolated Part
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Context Mix
            </>
          )}
        </button>
      </div>

      {/* Mode explanation */}
      <p className="text-xs mb-6 pb-4 border-b" style={{ color: '#6A8AAD', borderColor: '#1C2A44' }}>
        {mode === 'isolated'
          ? 'Adjust volumes to isolate your part with context from other stems'
          : 'Full mix with independent control over each stem. Perfect for learning arrangements.'}
      </p>

      {/* Stem sliders */}
      <div className="space-y-5">
        {stems && Object.entries(stems).map(([stemKey, stemUrl]) => (
          <div key={stemKey}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium" style={{ color: '#EAF2FF' }}>
                {getStemLabel(stemKey)}
              </label>
              <span className="text-xs" style={{ color: '#9CB2D6' }}>
                {Math.round((stemVolumes[stemKey] || 1) * 100)}%
              </span>
            </div>
            <Slider
              value={[stemVolumes[stemKey] || 1]}
              onValueChange={(val) => handleVolumeChange(stemKey, val)}
              min={0}
              max={1}
              step={0.01}
              className="h-2"
            />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-6 pt-6 border-t flex items-center gap-3" style={{ borderColor: '#1C2A44' }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex-1 px-4 h-10 rounded-lg text-sm font-semibold transition-all"
          style={{
            backgroundColor: isPlaying ? '#19D3A2' : '#1EA0FF',
            color: '#fff',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          className="px-4 h-10 rounded-lg text-sm font-semibold border transition-all"
          style={{ borderColor: '#1C2A44', color: '#9CB2D6' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#1EA0FF60'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#1C2A44'}
        >
          ↻ Reset
        </button>
      </div>
    </div>
  );
}