import React, { useEffect, useRef, useState } from 'react';
import { useKaraokeStore } from '../../store/useKaraokeStore';
import type { Line, StyleConfig } from '../../context/KaraokeContext';
import { DOMLyricLine } from './DOMLyricLine';

interface CanvasPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  lines: Line[];
  mediaType: 'audio' | 'video' | null;
  styleConfig: StyleConfig;
  isPlaying: boolean;
}

export const CanvasPlayer: React.FC<CanvasPlayerProps> = ({
  lines,
  mediaType,
  styleConfig,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);

  // 1. Subscribe to timeline currentTime at 60fps from Zustand store
  useEffect(() => {
    const unsubscribe = useKaraokeStore.subscribe(
      (state) => state.currentTime,
      (time) => {
        setCurrentTime(time);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. Measure container sizing dynamically with ResizeObserver for responsiveness
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setScale(entry.contentRect.width / 1280);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // 3. Helper to determine which line index is currently active
  const getActiveLineIndex = () => {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startTime !== null && line.endTime !== null) {
        if (currentTime >= line.startTime - 2.0 && currentTime <= line.endTime + 1.0) {
          return i;
        }
      }
    }
    return -1;
  };

  const activeLineIdx = getActiveLineIndex();

  // 4. Alignments Mapping
  const getAlignmentClass = () => {
    if (styleConfig.alignment === 'left') return 'justify-start text-left px-[120px]';
    if (styleConfig.alignment === 'right') return 'justify-end text-right px-[120px]';
    return 'justify-center text-center';
  };

  const alignmentClass = getAlignmentClass();

  // 5. Classic 2-Line Layout Renderer
  const renderClassic2Line = () => {
    let line1: Line | null;
    let line2: Line | null;
    let isLine1Active = false;
    let isLine2Active = false;

    if (activeLineIdx === -1) {
      line1 = lines[0] || null;
      line2 = lines[1] || null;
    } else {
      const currentLine = lines[activeLineIdx];
      const isOdd = activeLineIdx % 2 === 0;

      if (isOdd) {
        line1 = currentLine;
        isLine1Active = true;
        line2 = lines[activeLineIdx + 1] || lines[activeLineIdx - 1] || null;
      } else {
        line2 = currentLine;
        isLine2Active = true;
        line1 = lines[activeLineIdx + 1] || lines[activeLineIdx - 1] || null;
      }
    }

    return (
      <>
        {/* Line 1 - Positioned at top: 72.22% */}
        <div 
          className={`absolute left-0 right-0 w-full flex ${alignmentClass} select-none`}
          style={{ top: '72.22%', transform: 'translateY(-50%)' }}
        >
          {line1 && (
            <DOMLyricLine 
              line={line1}
              currentTime={currentTime}
              scale={scale}
              styleConfig={styleConfig}
              isActive={isLine1Active}
            />
          )}
        </div>

        {/* Line 2 - Positioned at top: 83.33% */}
        <div 
          className={`absolute left-0 right-0 w-full flex ${alignmentClass} select-none`}
          style={{ top: '83.33%', transform: 'translateY(-50%)' }}
        >
          {line2 && (
            <DOMLyricLine 
              line={line2}
              currentTime={currentTime}
              scale={scale}
              styleConfig={styleConfig}
              isActive={isLine2Active}
            />
          )}
        </div>
      </>
    );
  };

  // 6. Subtitle Layout Renderer
  const renderSubtitles = () => {
    let activeLine: Line | null = null;
    let isActive = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startTime !== null && line.endTime !== null) {
        if (currentTime >= line.startTime - 1.0 && currentTime <= line.endTime + 0.5) {
          activeLine = line;
          isActive = true;
          break;
        }
      }
    }

    if (!activeLine) {
      const upcoming = lines.find(line => line.startTime !== null && line.startTime > currentTime);
      if (upcoming && upcoming.startTime! - currentTime < 4.0) {
        activeLine = upcoming;
      }
    }

    return (
      <div 
        className={`absolute left-0 right-0 w-full flex ${alignmentClass} select-none`}
        style={{ top: '80.56%', transform: 'translateY(-50%)' }}
      >
        {activeLine && (
          <DOMLyricLine 
            line={activeLine}
            currentTime={currentTime}
            scale={scale}
            styleConfig={styleConfig}
            isActive={isActive}
          />
        )}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none"
    >
      {/* 1. Background Layers */}
      {styleConfig.bgType === 'color' && (
        <div 
          className="absolute inset-0 z-0" 
          style={{ backgroundColor: styleConfig.bgColor }} 
        />
      )}

      {styleConfig.bgType === 'image' && styleConfig.bgImage && (
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src={styleConfig.bgImage} 
            className="w-full h-full object-cover" 
            alt="Background" 
          />
          <div className="absolute inset-0 bg-black/35 z-10 pointer-events-none" />
        </div>
      )}

      {/* Grid Pattern / Default Backings */}
      {styleConfig.bgType !== 'color' && styleConfig.bgType !== 'image' && !(styleConfig.bgType === 'video' && mediaType === 'video') && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundColor: '#090909',
            backgroundImage: `
              linear-gradient(to right, rgba(175, 80, 255, 0.02) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(175, 80, 255, 0.02) 1px, transparent 1px)
            `,
            backgroundSize: `${64 * scale}px ${64 * scale}px`,
          }}
        />
      )}

      {/* Dimmer overlay for playing backgrounds */}
      {styleConfig.bgType === 'video' && mediaType === 'video' && (
        <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
      )}

      {/* 2. Responsive Lyrics Layer */}
      <div className="absolute inset-0 z-20 w-full h-full pointer-events-none">
        {lines.length > 0 ? (
          styleConfig.layoutMode === 'classic-2line' ? renderClassic2Line() : renderSubtitles()
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ash font-sans font-bold text-center" style={{ fontSize: `${24 * scale}px` }}>
            EasyKara Preview Player
          </div>
        )}
      </div>
    </div>
  );
};
