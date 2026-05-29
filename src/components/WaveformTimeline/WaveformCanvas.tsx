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

    // 1. Draw audio waveform peaks first (only visible peaks with dynamic LOD)
    const peaks = getPeaksForZoom(waveformData, zoom);
    const peaksCount = peaks.length;

    ctx.fillStyle = 'rgba(175, 80, 255, 0.35)'; // Deep Violet Theme Accent
    const pxPerSecond = peaksCount / duration;

    const startPeakIdx = Math.max(0, Math.floor((scrollLeft / zoom) * pxPerSecond) - 1);
    const endPeakIdx = Math.min(
      peaksCount - 1,
      Math.ceil(((scrollLeft + canvasWidth) / zoom) * pxPerSecond) + 1
    );

    ctx.beginPath();
    for (let i = startPeakIdx; i <= endPeakIdx; i++) {
      const t = i / pxPerSecond;
      const x = t * zoom - scrollLeft;
      const peakVal = peaks[i];
      const barHeight = peakVal * (canvas.height * 0.65);
      const y = (canvas.height - barHeight) / 2;

      ctx.fillRect(x, y, Math.max(1, zoom / pxPerSecond - 0.5), barHeight);
    }

    // 2. Draw ruler background and separator border to clip any waveform peaks exceeding y=20
    ctx.fillStyle = '#151617'; // Graphite Deep
    ctx.fillRect(0, 0, canvasWidth, 20);

    ctx.strokeStyle = '#303236'; // Graphite Light divider
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(canvasWidth, 20);
    ctx.stroke();

    // 3. Draw vertical timeline grid ticks and labels (only visible ticks)
    const secSpacing = zoom >= 60 ? 1 : 5;

    const startSec = Math.max(0, Math.floor(scrollLeft / zoom) - 1);
    const endSec = Math.min(duration, Math.ceil((scrollLeft + canvasWidth) / zoom) + 1);

    for (let sec = startSec; sec <= endSec; sec++) {
      const x = sec * zoom - scrollLeft;
      const isMajor = sec % secSpacing === 0;

      // Draw faint vertical alignment line across the entire waveform track height
      ctx.strokeStyle = isMajor ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)';
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();

      // Draw tick marks inside the ruler bar (from bottom edge y=20 pointing upwards)
      ctx.strokeStyle = isMajor ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.moveTo(x, isMajor ? 10 : 15);
      ctx.lineTo(x, 20);
      ctx.stroke();

      if (isMajor) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'; // Stark contrast white/gray label (45% opacity)
        ctx.font = '9px var(--font-geistmono), var(--font-mono), monospace';
        ctx.fillText(`${sec}s`, x + 4, 12);
      }
    }
  }, [waveformData, duration, zoom, containerWidth, containerHeight, scrollLeft, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      className="waveform-canvas pointer-events-auto cursor-ew-resize absolute inset-y-0 left-0 h-full"
      style={{
        width: `${Math.max(100, containerWidth || 800)}px`,
        transform: `translateX(${scrollLeft}px)`,
      }}
    />
  );
};
