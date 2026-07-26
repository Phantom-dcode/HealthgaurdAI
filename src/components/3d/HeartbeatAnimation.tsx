import React, { useEffect, useRef } from 'react';

interface HeartbeatAnimationProps {
  bpm?: number;
  className?: string;
  isAlert?: boolean;
}

export const HeartbeatAnimation: React.FC<HeartbeatAnimationProps> = ({
  bpm = 72,
  className = '',
  isAlert = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();

    window.addEventListener('resize', resize);

    // Speed scales with bpm
    const speed = (bpm / 60) * 2.2;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Grid background
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // ECG Wave path
      ctx.beginPath();
      const waveColor = isAlert ? '#ef4444' : bpm > 100 ? '#f59e0b' : '#06b6d4';
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = waveColor;
      ctx.shadowBlur = 8;

      const wavelength = 180;

      for (let x = 0; x < width; x++) {
        const xOffset = (x + step * speed) % wavelength;
        let y = centerY;

        // P-Q-R-S-T wave model
        if (xOffset > 40 && xOffset < 55) {
          // P Wave
          y -= Math.sin(((xOffset - 40) / 15) * Math.PI) * (height * 0.12);
        } else if (xOffset >= 70 && xOffset < 75) {
          // Q Dip
          y += height * 0.15;
        } else if (xOffset >= 75 && xOffset < 88) {
          // R Spike
          y -= (height * 0.38) * Math.sin(((xOffset - 75) / 13) * Math.PI);
        } else if (xOffset >= 88 && xOffset < 95) {
          // S Dip
          y += height * 0.22;
        } else if (xOffset >= 115 && xOffset < 140) {
          // T Wave
          y -= Math.sin(((xOffset - 115) / 25) * Math.PI) * (height * 0.18);
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();

      step += 1;
      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [bpm, isAlert]);

  return (
    <div className={`relative w-full h-24 overflow-hidden rounded-xl bg-slate-900/60 border border-slate-800 ${className}`} id="ecg-pulse-canvas">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute top-2 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-xs font-mono font-medium text-cyan-400">
        <span className={`w-2 h-2 rounded-full ${isAlert ? 'bg-red-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
        <span>ECG: {bpm} BPM</span>
      </div>
    </div>
  );
};
