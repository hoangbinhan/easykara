import React, { useEffect } from 'react';

interface WaveformCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  waveformData: { peaks: number[] } | null;
  duration: number;
  zoom: number;
  containerWidth: number;
  containerHeight: number;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  canvasRef,
  waveformData,
  duration,
  zoom,
  containerHeight,
}) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformData || duration === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const totalWidth = duration * zoom;
    canvas.width = totalWidth;
    canvas.height = containerHeight || 80;
    
    ctx.clearRect(0, 0, totalWidth, canvas.height);
    
    // Draw vertical timeline grid ticks
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const secSpacing = zoom >= 60 ? 1 : 5;
    for (let sec = 0; sec < duration; sec += secSpacing) {
      const x = sec * zoom;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.font = '9px var(--font-sans)';
      ctx.fillText(`${sec}s`, x + 4, 12);
    }

    // Draw audio waveform peaks
    const { peaks } = waveformData;
    const peaksCount = peaks.length;
    
    ctx.fillStyle = 'rgba(175, 80, 255, 0.35)'; // Deep Violet Theme Accent
    const pxPerSecond = peaksCount / duration;
    
    ctx.beginPath();
    for (let i = 0; i < peaksCount; i++) {
      const t = i / pxPerSecond;
      const x = t * zoom;
      const peakVal = peaks[i];
      const barHeight = peakVal * (canvas.height * 0.65);
      const y = (canvas.height - barHeight) / 2;
      
      ctx.fillRect(x, y, Math.max(1, zoom / pxPerSecond - 0.5), barHeight);
    }
  }, [waveformData, duration, zoom, containerHeight, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      className="waveform-canvas pointer-events-none absolute inset-y-0 left-0 h-full"
      style={{
        width: `${duration * zoom}px`,
      }}
    />
  );
};
