import React, { useEffect } from 'react';

interface WaveformCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  waveformData: { peaks: number[] } | null;
  duration: number;
  zoom: number;
  scrollLeft: number;
  containerWidth: number;
  containerHeight: number;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  canvasRef,
  waveformData,
  duration,
  zoom,
  scrollLeft,
  containerWidth,
  containerHeight,
}) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformData || duration === 0 || containerWidth === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = containerWidth;
    canvas.height = containerHeight || 120;
    
    ctx.clearRect(0, 0, containerWidth, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const secSpacing = zoom >= 60 ? 1 : 5;
    for (let sec = 0; sec < duration; sec += secSpacing) {
      const x = sec * zoom - scrollLeft;
      if (x >= 0 && x <= containerWidth) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = '9px var(--font-sans)';
        ctx.fillText(`${sec}s`, x + 4, 12);
      }
    }

    // Draw audio peaks
    const { peaks } = waveformData;
    const peaksCount = peaks.length;
    
    ctx.fillStyle = 'rgba(175, 80, 255, 0.3)';
    
    const pxPerSecond = peaksCount / duration;
    
    const startSec = scrollLeft / zoom;
    const endSec = (scrollLeft + containerWidth) / zoom;
    
    const startIdx = Math.max(0, Math.floor(startSec * pxPerSecond));
    const endIdx = Math.min(peaksCount, Math.ceil(endSec * pxPerSecond));
    
    ctx.beginPath();
    for (let i = startIdx; i < endIdx; i++) {
      const t = i / pxPerSecond;
      const x = t * zoom - scrollLeft;
      const peakVal = peaks[i];
      const barHeight = peakVal * (canvas.height * 0.65);
      const y = (canvas.height - barHeight) / 2;
      
      ctx.fillRect(x, y, Math.max(1, zoom / pxPerSecond - 0.5), barHeight);
    }
  }, [waveformData, duration, zoom, scrollLeft, containerWidth, containerHeight, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      className="waveform-canvas"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: `${containerWidth}px`,
        transform: `translateX(${scrollLeft}px)`,
        pointerEvents: 'none',
      }}
    />
  );
};
