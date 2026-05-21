import React, { useEffect } from 'react';
import type { Line, StyleConfig } from '../../context/KaraokeContext';
import { drawLine, drawBackground } from './canvasHelpers';

interface CanvasPlayerProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  lines: Line[];
  currentTime: number;
  mediaType: 'audio' | 'video' | null;
  styleConfig: StyleConfig;
}

export const CanvasPlayer: React.FC<CanvasPlayerProps> = ({
  canvasRef,
  videoRef,
  lines,
  currentTime,
  mediaType,
  styleConfig,
}) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1280;
    canvas.height = 720;

    const renderClassic2Line = (ctx: CanvasRenderingContext2D, width: number) => {
      let activeLineIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startTime !== null && line.endTime !== null) {
          if (currentTime >= line.startTime - 2.0 && currentTime <= line.endTime + 1.0) {
            activeLineIdx = i;
            break;
          }
        }
      }

      if (activeLineIdx === -1) {
        drawLine(ctx, lines[0], 520, false, width, styleConfig, currentTime);
        if (lines[1]) drawLine(ctx, lines[1], 600, false, width, styleConfig, currentTime);
        return;
      }

      const currentLine = lines[activeLineIdx];
      const isOdd = activeLineIdx % 2 === 0;
      
      if (isOdd) {
        drawLine(ctx, currentLine, 520, true, width, styleConfig, currentTime);
        const nextLine = lines[activeLineIdx + 1];
        if (nextLine) drawLine(ctx, nextLine, 600, false, width, styleConfig, currentTime);
        else {
          const prevLine = lines[activeLineIdx - 1];
          if (prevLine) drawLine(ctx, prevLine, 600, false, width, styleConfig, currentTime);
        }
      } else {
        drawLine(ctx, currentLine, 600, true, width, styleConfig, currentTime);
        const nextLine = lines[activeLineIdx + 1];
        if (nextLine) drawLine(ctx, nextLine, 520, false, width, styleConfig, currentTime);
        else {
          const prevLine = lines[activeLineIdx - 1];
          if (prevLine) drawLine(ctx, prevLine, 520, false, width, styleConfig, currentTime);
        }
      }
    };

    const renderSubtitles = (ctx: CanvasRenderingContext2D, width: number) => {
      let activeLine: Line | null = null;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startTime !== null && line.endTime !== null) {
          if (currentTime >= line.startTime - 1.0 && currentTime <= line.endTime + 0.5) {
            activeLine = line;
            break;
          }
        }
      }

      if (activeLine) {
        drawLine(ctx, activeLine, 580, true, width, styleConfig, currentTime);
      } else {
        const upcoming = lines.find(line => line.startTime !== null && line.startTime > currentTime);
        if (upcoming && upcoming.startTime! - currentTime < 4.0) {
          drawLine(ctx, upcoming, 580, false, width, styleConfig, currentTime);
        }
      }
    };

    let animationId: number;
    const render = () => {
      drawBackground(ctx, canvas, styleConfig, videoRef, mediaType);
      if (lines.length > 0) {
        if (styleConfig.layoutMode === 'classic-2line') renderClassic2Line(ctx, canvas.width);
        else renderSubtitles(ctx, canvas.width);
      } else {
        ctx.font = 'bold 24px Montserrat';
        ctx.fillStyle = '#6b6b6b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('EasyKara Preview Canvas', canvas.width / 2, canvas.height / 2);
      }
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [lines, currentTime, styleConfig, mediaType, videoRef, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
};
