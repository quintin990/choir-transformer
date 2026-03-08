import React, { useEffect, useRef } from 'react';

function drawStatic(canvas, buffer, color) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  if (!buffer) return;

  const data = buffer.getChannelData(0);
  const step = Math.ceil(data.length / w);

  ctx.beginPath();
  ctx.strokeStyle = color + '35';
  ctx.lineWidth = 1;
  for (let i = 0; i < w; i++) {
    let min = 1, max = -1;
    for (let j = 0; j < step; j++) {
      const d = data[i * step + j] || 0;
      if (d < min) min = d;
      if (d > max) max = d;
    }
    ctx.moveTo(i, ((1 + min) / 2) * h);
    ctx.lineTo(i, ((1 + max) / 2) * h);
  }
  ctx.stroke();
}

function drawProgress(canvas, buffer, color, currentTime, duration) {
  drawStatic(canvas, buffer, color);
  if (!duration || !buffer) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const px = Math.min((currentTime / duration) * w, w);

  const data = buffer.getChannelData(0);
  const step = Math.ceil(data.length / w);

  ctx.beginPath();
  ctx.strokeStyle = color + 'bb';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < px; i++) {
    let min = 1, max = -1;
    for (let j = 0; j < step; j++) {
      const d = data[i * step + j] || 0;
      if (d < min) min = d;
      if (d > max) max = d;
    }
    ctx.moveTo(i, ((1 + min) / 2) * h);
    ctx.lineTo(i, ((1 + max) / 2) * h);
  }
  ctx.stroke();

  // Playhead
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1;
  ctx.moveTo(px, 0);
  ctx.lineTo(px, h);
  ctx.stroke();
}

export default function WaveformCanvas({ analyserNode, color, isActive, buffer, currentTime, duration }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  // Static/progress draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !buffer) return;
    if (!isActive) drawProgress(canvas, buffer, color, currentTime, duration);
  }, [currentTime, duration, buffer, color, isActive]);

  // Live oscilloscope while playing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!isActive || !analyserNode) {
      cancelAnimationFrame(animRef.current);
      return;
    }

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext('2d');
      const w = c.width;
      const h = c.height;

      drawProgress(c, buffer, color, currentTime, duration);

      const bufLen = analyserNode.frequencyBinCount;
      const dataArr = new Uint8Array(bufLen);
      analyserNode.getByteTimeDomainData(dataArr);

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      const slice = w / bufLen;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const v = dataArr[i] / 128;
        const y = (v * h) / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += slice;
      }
      ctx.lineTo(w, h / 2);
      ctx.stroke();
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isActive, analyserNode, buffer, color, currentTime, duration]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={40}
      className="w-full h-full block"
    />
  );
}