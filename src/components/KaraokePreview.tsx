import React, { useRef, useEffect } from 'react';
import { useKaraoke } from '../context/KaraokeContext';
import type { Line } from '../context/KaraokeContext';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface KaraokePreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const KaraokePreview: React.FC<KaraokePreviewProps> = ({ videoRef }) => {
  const {
    lines,
    currentTime,
    isPlaying,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    mediaUrl,
    mediaType,
    styleConfig,
  } = useKaraoke();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // Sync playhead state with video element
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  // Re-draw Canvas at 60fps
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set fixed standard render size (1280x720 - HD 16:9)
    canvas.width = 1280;
    canvas.height = 720;

    // Heavy helper to draw a single karaoke line with sweeping text overlay
    const drawLine = (
      ctx: CanvasRenderingContext2D,
      line: Line,
      y: number,
      isActive: boolean,
      canvasWidth: number
    ) => {
      ctx.font = `bold ${styleConfig.fontSize}px "${styleConfig.fontFamily}", sans-serif`;
      ctx.lineWidth = styleConfig.strokeWidth;
      ctx.lineJoin = 'round';
      
      // Calculate total text width to align
      const text = line.text;
      const textWidth = ctx.measureText(text).width;
      
      // Align X coordinate
      let startX = (canvasWidth - textWidth) / 2; // Center default
      if (styleConfig.alignment === 'left') {
        startX = 120;
      } else if (styleConfig.alignment === 'right') {
        startX = canvasWidth - textWidth - 120;
      }

      // If the line is NOT active (upcoming or past), draw static background style
      if (!isActive || line.startTime === null) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'; // Faded white
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        
        // Draw Stroke
        ctx.strokeText(text, startX, y);
        // Draw Fill
        ctx.fillText(text, startX, y);
        return;
      }

      // Line is ACTIVE: Draw syllables word-by-word with progressive sweep-color filling
      let currentX = startX;

      line.syllables.forEach((syl) => {
        const sylWidth = ctx.measureText(syl.text).width;
        
        // Measure spacing to next syllable
        const spaceWidth = ctx.measureText(' ').width;

        // Draw Syllable Background (Inactive State)
        ctx.fillStyle = styleConfig.fillColor;
        ctx.strokeStyle = styleConfig.strokeColor;
        ctx.strokeText(syl.text, currentX, y);
        ctx.fillText(syl.text, currentX, y);

        // Compute sweep progress (pct)
        let pct = 0;
        if (syl.startTime !== null && syl.endTime !== null) {
          if (currentTime >= syl.endTime) {
            pct = 1;
          } else if (currentTime >= syl.startTime) {
            pct = (currentTime - syl.startTime) / (syl.endTime - syl.startTime);
          }
        }

        // Draw Syllable Active Overflow (Sweeping Color)
        if (pct > 0) {
          ctx.save();
          
          // Create clipping region matching the swept width
          ctx.beginPath();
          ctx.rect(currentX - 5, y - styleConfig.fontSize - 15, (sylWidth + 10) * pct, styleConfig.fontSize + 30);
          ctx.clip();

          // Draw active color
          ctx.fillStyle = styleConfig.activeColor;
          ctx.strokeStyle = styleConfig.strokeColor;
          ctx.strokeText(syl.text, currentX, y);
          ctx.fillText(syl.text, currentX, y);

          ctx.restore();
        }

        // Advance cursor
        currentX += sylWidth + spaceWidth;
      });
    };

    // Render method for Vietnamese Alternating 2-Lines
    const renderClassic2Line = (ctx: CanvasRenderingContext2D, width: number) => {
      // Find active singing line
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
        // If no line is singing, show first 2 lines as upcoming
        drawLine(ctx, lines[0], 520, false, width);
        if (lines[1]) drawLine(ctx, lines[1], 600, false, width);
        return;
      }

      // Determine current display line and upcoming line
      const currentLine = lines[activeLineIdx];
      const isOdd = activeLineIdx % 2 === 0; // 0-indexed, so 0 is Line 1 (Odd), 1 is Line 2 (Even)
      
      // Display Line 1 (y: 520) and Line 2 (y: 600)
      if (isOdd) {
        // Line L is on Line 1 (Active)
        drawLine(ctx, currentLine, 520, true, width);
        
        // Line L + 1 is upcoming on Line 2
        const nextLine = lines[activeLineIdx + 1];
        if (nextLine) {
          drawLine(ctx, nextLine, 600, false, width);
        } else {
          // Fading out finished Line L - 1 on Line 2
          const prevLine = lines[activeLineIdx - 1];
          if (prevLine) drawLine(ctx, prevLine, 600, false, width);
        }
      } else {
        // Line L is on Line 2 (Active)
        drawLine(ctx, currentLine, 600, true, width);
        
        // Line L + 1 is upcoming on Line 1
        const nextLine = lines[activeLineIdx + 1];
        if (nextLine) {
          drawLine(ctx, nextLine, 520, false, width);
        } else {
          // Fading out finished Line L - 1 on Line 1
          const prevLine = lines[activeLineIdx - 1];
          if (prevLine) drawLine(ctx, prevLine, 520, false, width);
        }
      }
    };

    // Render method for Modern Centered Subtitles (Single line)
    const renderSubtitles = (ctx: CanvasRenderingContext2D, width: number) => {
      // Find active line
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
        drawLine(ctx, activeLine, 580, true, width);
      } else {
        // Search for the closest upcoming line
        const upcoming = lines.find(line => line.startTime !== null && line.startTime > currentTime);
        if (upcoming && upcoming.startTime! - currentTime < 4.0) {
          drawLine(ctx, upcoming, 580, false, width);
        }
      }
    };

    const render = () => {
      // 1. Draw Background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (styleConfig.bgType === 'color') {
        ctx.fillStyle = styleConfig.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (styleConfig.bgType === 'video' && videoRef.current && mediaType === 'video') {
        // Draw active video frame
        try {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          // Darken video overlay for better subtitle legibility
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } catch {
          // Video frame not ready, fallback to pitch black
          ctx.fillStyle = '#090909';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else if (styleConfig.bgType === 'image' && styleConfig.bgImage) {
        // Draw background image
        const img = new Image();
        img.src = styleConfig.bgImage;
        try {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } catch {
          ctx.fillStyle = '#090909';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else {
        // Fallback/Visuals (Subtle minimal space grid)
        ctx.fillStyle = '#090909';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw subtle grid lines
        ctx.strokeStyle = 'rgba(175, 80, 255, 0.02)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 64) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, canvas.height);
          ctx.stroke();
        }
        for (let j = 0; j < canvas.height; j += 64) {
          ctx.beginPath();
          ctx.moveTo(0, j);
          ctx.lineTo(canvas.width, j);
          ctx.stroke();
        }
      }

      // 2. Draw Karaoke Lyrics
      if (lines.length > 0) {
        if (styleConfig.layoutMode === 'classic-2line') {
          renderClassic2Line(ctx, canvas.width);
        } else {
          renderSubtitles(ctx, canvas.width);
        }
      } else {
        // Draw empty state text
        ctx.font = 'bold 24px Montserrat';
        ctx.fillStyle = '#6b6b6b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('EasyKara Preview Canvas', canvas.width / 2, canvas.height / 2);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [lines, currentTime, styleConfig, mediaType, videoRef]);

  const handleTogglePlay = () => {
    if (!mediaUrl || !videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        maxWidth: '720px',
      }}
    >
      {/* Real-time Render Canvas */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          aspectRatio: '16/9',
          overflow: 'hidden',
          position: 'relative',
          background: '#090909',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-cards)',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />

        {/* Hidden unified video player */}
        {mediaUrl && (
          <video
            ref={videoRef}
            src={mediaUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            style={{
              display: 'none', // completely hidden
            }}
          />
        )}
      </div>

      {/* Under-canvas Toolbar */}
      {mediaUrl && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            background: 'rgba(9, 9, 9, 0.6)',
            border: '1px solid var(--color-steel-accent)',
            padding: '12px 20px',
            borderRadius: 'var(--radius-smallwidgets)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={handleTogglePlay}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--color-deep-violet)',
                color: 'var(--color-cloud-whisper)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
            </button>
            
            <span style={{ fontSize: '14px', color: 'var(--color-slate-hint)' }}>
              {mediaType === 'video' ? '📺 Background Video' : '🎵 Audio Track'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  setCurrentTime(0);
                }
              }}
              style={{
                background: 'rgba(247, 249, 250, 0.08)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--radius-buttons)',
                color: 'var(--color-cloud-whisper)',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={12} />
              <span>Restart</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
