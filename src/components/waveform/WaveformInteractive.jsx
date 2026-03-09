import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

const COLORS = {
  waveform: '#1EA0FF',
  selection: '#1EA0FF',
  selectionBg: '#1EA0FF20',
  handle: '#1EA0FF',
  playhead: '#19D3A2',
};

const CANVAS_HEIGHT = 120;
const HANDLE_WIDTH = 8;

export default function WaveformInteractive({ audioFile, onRangeChange, minClip = 5, maxClip = 120 }) {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioBufferRef = useRef(null);
  const peakDataRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrent] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const audioElementRef = useRef(null);
  const animationIdRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  // Initialize audio and decode
  useEffect(() => {
    if (!audioFile) return;

    const loadAudio = async () => {
      try {
        const url = URL.createObjectURL(audioFile);
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = ctx;

        const buffer = await ctx.decodeAudioData(arrayBuffer);
        audioBufferRef.current = buffer;

        const channelData = buffer.getChannelData(0);
        const sampleRate = buffer.sampleRate;
        const dur = buffer.duration;
        setDuration(dur);
        setEndTime(Math.min(dur, 30));

        // Generate peak data
        const samples = Math.floor(sampleRate * dur / 100);
        const peaks = new Float32Array(samples);
        const blockSize = Math.floor(channelData.length / samples);

        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[i * blockSize + j]);
          }
          peaks[i] = sum / blockSize;
        }
        peakDataRef.current = peaks;

        // Create audio element for playback
        if (!audioElementRef.current) {
          const audio = new Audio(url);
          audio.volume = volume;
          audioElementRef.current = audio;
          audio.addEventListener('ended', () => setIsPlaying(false));
        }

        draw();
      } catch (err) {
        console.error('Audio loading error:', err);
      }
    };

    loadAudio();

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [audioFile]);

  // Report range change
  useEffect(() => {
    if (onRangeChange && duration > 0) {
      onRangeChange({
        start: startTime,
        end: endTime || duration,
        duration: (endTime || duration) - startTime,
      });
    }
  }, [startTime, endTime, duration, onRangeChange]);

  const draw = () => {
    if (!canvasRef.current || !peakDataRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.offsetWidth;
    const height = CANVAS_HEIGHT;

    canvas.width = width;
    canvas.height = height;

    const peaks = peakDataRef.current;
    const midY = height / 2;

    // Background
    ctx.fillStyle = '#0F1A2E';
    ctx.fillRect(0, 0, width, height);

    // Selection background
    if (startTime != null && (endTime || duration) != null) {
      const startX = (startTime / duration) * width;
      const endX = ((endTime || duration) / duration) * width;
      ctx.fillStyle = COLORS.selectionBg;
      ctx.fillRect(startX, 0, endX - startX, height);
    }

    // Draw waveform
    ctx.strokeStyle = COLORS.waveform;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let i = 0; i < peaks.length; i++) {
      const x = (i / peaks.length) * width;
      const amplitude = Math.min(peaks[i] * 100, 1);
      const y = midY - amplitude * (midY - 4);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Mirror bottom half
    ctx.beginPath();
    for (let i = peaks.length - 1; i >= 0; i--) {
      const x = (i / peaks.length) * width;
      const amplitude = Math.min(peaks[i] * 100, 1);
      const y = midY + amplitude * (midY - 4);

      if (i === peaks.length - 1) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Selection borders
    ctx.strokeStyle = COLORS.selection;
    ctx.lineWidth = 2;
    const startX = (startTime / duration) * width;
    const endX = ((endTime || duration) / duration) * width;
    ctx.strokeRect(startX, 2, endX - startX, height - 4);

    // Handles
    ctx.fillStyle = COLORS.handle;
    ctx.fillRect(startX - HANDLE_WIDTH / 2, midY - 20, HANDLE_WIDTH, 40);
    ctx.fillRect(endX - HANDLE_WIDTH / 2, midY - 20, HANDLE_WIDTH, 40);

    // Playhead
    if (isPlaying && audioElementRef.current) {
      const playX = (audioElementRef.current.currentTime / duration) * width;
      ctx.strokeStyle = COLORS.playhead;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playX, 0);
      ctx.lineTo(playX, height);
      ctx.stroke();
    }

    if (isPlaying || animationIdRef.current) {
      animationIdRef.current = requestAnimationFrame(draw);
    }
  };

  const handleCanvasMouseDown = (e) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const startX = (startTime / duration) * rect.width;
    const endX = ((endTime || duration) / duration) * rect.width;

    if (Math.abs(x - startX) < 15) {
      setDragging('start');
    } else if (Math.abs(x - endX) < 15) {
      setDragging('end');
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!canvasRef.current || !dragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let newTime = Math.max(0, Math.min(duration, (x / rect.width) * duration));

    if (dragging === 'start') {
      newTime = Math.min(newTime, (endTime || duration) - minClip);
      setStartTime(newTime);
    } else {
      newTime = Math.max(newTime, startTime + minClip);
      newTime = Math.min(newTime, startTime + maxClip);
      setEndTime(newTime);
    }

    draw();
  };

  const handleCanvasMouseUp = () => {
    setDragging(null);
  };

  const togglePlay = () => {
    if (!audioElementRef.current) return;

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.currentTime = startTime;
      audioElementRef.current.play();
      setIsPlaying(true);

      const updateCurrent = () => {
        setCurrent(audioElementRef.current?.currentTime || 0);
        if (isPlaying || audioElementRef.current?.playing) {
          animationIdRef.current = requestAnimationFrame(updateCurrent);
        }
      };
      animationIdRef.current = requestAnimationFrame(updateCurrent);
    }
  };

  const formatTime = (seconds) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg p-4" style={{ backgroundColor: '#0F1A2E', border: '1px solid #1C2A44' }}>
        <div
          ref={canvasRef}
          className="w-full cursor-pointer rounded"
          style={{ height: CANVAS_HEIGHT }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
              style={{ backgroundColor: '#1EA0FF', color: '#fff' }}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" style={{ color: '#9CB2D6' }} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (audioElementRef.current) {
                    audioElementRef.current.volume = parseFloat(e.target.value);
                  }
                }}
                className="w-20"
              />
            </div>
          </div>

          <div className="text-xs flex gap-4" style={{ color: '#9CB2D6' }}>
            <span>{formatTime(startTime)}</span>
            <span>–</span>
            <span>{formatTime(endTime || duration)}</span>
            <span>({Math.round((endTime || duration) - startTime)}s)</span>
          </div>
        </div>
      </div>
    </div>
  );
}