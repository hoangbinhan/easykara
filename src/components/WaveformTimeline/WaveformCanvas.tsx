import React, { useEffect } from 'react';
import type { WaveformData } from '../../hooks/useAudioAnalyzer';
import { getPeaksForZoom } from '../../utils/peakCache';

interface WaveformCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  waveformData: WaveformData | null;
  duration: number;
  zoom: number;
  containerWidth: number;
  containerHeight: number;
  scrollLeft: number;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  canvasRef,
  waveformData,
  duration,
  zoom,
  containerWidth,
  containerHeight,
  scrollLeft,
}) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformData || duration === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const canvasWidth = Math.max(100, containerWidth || 800);
    canvas.width = canvasWidth;
    canvas.height = containerHeight || 80;
    
    ctx.clearRect(0, 0, canvasWidth, canvas.height);
    
    // Draw vertical timeline grid ticks (only visible ticks)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const secSpacing = zoom >= 60 ? 1 : 5;
    
    const startSec = Math.max(0, Math.floor(scrollLeft / zoom) - 1);
    const endSec = Math.min(duration, Math.ceil((scrollLeft + canvasWidth) / zoom) + 1);
    
    for (let sec = startSec; sec <= endSec; sec++) {
      if (sec % secSpacing !== 0) continue;
      
      const x = sec * zoom - scrollLeft;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.font = '9px var(--font-sans)';
      ctx.fillText(`${sec}s`, x + 4, 12);
    }

    // Draw audio waveform peaks (only visible peaks with dynamic LOD)
    const peaks = getPeaksForZoom(waveformData, zoom);
    const peaksCount = peaks.length;
    
    ctx.fillStyle = 'rgba(175, 80, 255, 0.35)'; // Deep Violet Theme Accent
    const pxPerSecond = peaksCount / duration;
    
    const startPeakIdx = Math.max(0, Math.floor((scrollLeft / zoom) * pxPerSecond) - 1);
    const endPeakIdx = Math.min(peaksCount - 1, Math.ceil(((scrollLeft + canvasWidth) / zoom) * pxPerSecond) + 1);
    
    ctx.beginPath();
    for (let i = startPeakIdx; i <= endPeakIdx; i++) {
      const t = i / pxPerSecond;
      const x = t * zoom - scrollLeft;
      const peakVal = peaks[i];
      const barHeight = peakVal * (canvas.height * 0.65);
      const y = (canvas.height - barHeight) / 2;
      
      ctx.fillRect(x, y, Math.max(1, zoom / pxPerSecond - 0.5), barHeight);
    }
  }, [waveformData, duration, zoom, containerWidth, containerHeight, scrollLeft, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      className="waveform-canvas pointer-events-none absolute inset-y-0 left-0 h-full"
      style={{
        width: `${Math.max(100, containerWidth || 800)}px`,
        transform: `translateX(${scrollLeft}px)`,
      }}
    />
  );
};


