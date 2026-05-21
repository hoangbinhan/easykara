import React, { useRef, useEffect, useState } from 'react';
import { useKaraoke } from '../context/KaraokeContext';
import type { Syllable } from '../context/KaraokeContext';
import { ZoomIn, ZoomOut, Edit, HelpCircle } from 'lucide-react';

interface WaveformTimelineProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  waveformData: { peaks: number[] } | null;
  loadingWaveform: boolean;
  waveformProgress: number;
}

export const WaveformTimeline: React.FC<WaveformTimelineProps> = ({
  audioRef,
  waveformData,
  loadingWaveform,
  waveformProgress,
}) => {
  const {
    lines,
    currentTime,
    duration,
    isPlaying,
    setCurrentTime,
    updateSyllableTime,
    updateSyllableText,
  } = useKaraoke();

  const [zoom, setZoom] = useState<number>(60); // pixels per second
  const [scrollLeft, setScrollLeft] = useState<number>(0);
  const [editingSyl, setEditingSyl] = useState<{ lineIdx: number; sylIdx: number; text: string } | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Monitor container width using ResizeObserver to avoid accessing ref value during render
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(container);
    setContainerWidth(container.clientWidth);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Handle Zoom change
  const handleZoomIn = () => setZoom((z) => Math.min(240, z + 30));
  const handleZoomOut = () => setZoom((z) => Math.max(20, z - 30));

  // Sync timeline scroll with playhead
  useEffect(() => {
    if (!isPlaying || !containerRef.current) return;
    
    const container = containerRef.current;
    const playheadPos = currentTime * zoom;
    const halfWidth = container.clientWidth / 2;
    
    // Auto scroll if playhead goes out of middle 50%
    const currentScroll = container.scrollLeft;
    if (playheadPos > currentScroll + halfWidth + 100 || playheadPos < currentScroll + 100) {
      container.scrollLeft = Math.max(0, playheadPos - halfWidth);
    }
  }, [currentTime, zoom, isPlaying]);

  // Track scroll position
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  // Click on timeline background to jump playhead
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current || !audioRef.current || duration === 0) return;
    
    // Check if clicked directly on timeline container, not a word block
    const target = e.target as HTMLElement;
    if (!target.classList.contains('timeline-scrollable') && !target.classList.contains('waveform-canvas')) {
      return;
    }
    
    const rect = scrollRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const time = clickX / zoom;
    
    const targetTime = Math.max(0, Math.min(duration, time));
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  // Draw Audio Waveform on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformData || duration === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Size canvas to fit container viewport
    const width = container.clientWidth;
    const height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const secSpacing = zoom >= 60 ? 1 : 5; // grid spacing in seconds
    for (let sec = 0; sec < duration; sec += secSpacing) {
      const x = sec * zoom - scrollLeft;
      if (x >= 0 && x <= width) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        
        // Add second label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = '9px var(--font-sans)';
        ctx.fillText(`${sec}s`, x + 4, 12);
      }
    }

    // Draw audio peaks
    const { peaks } = waveformData;
    const peaksCount = peaks.length;
    
    ctx.fillStyle = 'rgba(175, 80, 255, 0.3)'; // Deep Violet translucent
    
    const pxPerSecond = peaksCount / duration;
    
    // Find visible index ranges
    const startSec = scrollLeft / zoom;
    const endSec = (scrollLeft + width) / zoom;
    
    const startIdx = Math.max(0, Math.floor(startSec * pxPerSecond));
    const endIdx = Math.min(peaksCount, Math.ceil(endSec * pxPerSecond));
    
    ctx.beginPath();
    for (let i = startIdx; i < endIdx; i++) {
      const t = i / pxPerSecond;
      const x = t * zoom - scrollLeft;
      const peakVal = peaks[i];
      const barHeight = peakVal * (height * 0.65);
      const y = (height - barHeight) / 2;
      
      ctx.fillRect(x, y, Math.max(1, zoom / pxPerSecond - 0.5), barHeight);
    }
    
  }, [waveformData, duration, zoom, scrollLeft]);

  // Handle word block dragging for timing adjustment
  const handleBlockDrag = (
    e: React.MouseEvent,
    lineIdx: number,
    sylIdx: number,
    syl: Syllable,
    type: 'move' | 'resize-start' | 'resize-end'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    
    const startX = e.clientX;
    const initialStart = syl.startTime || 0;
    const initialEnd = syl.endTime || 0;
    const initialDur = initialEnd - initialStart;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaTime = deltaX / zoom;
      
      let newStart = initialStart;
      let newEnd = initialEnd;

      if (type === 'move') {
        newStart = Math.max(0, initialStart + deltaTime);
        newEnd = newStart + initialDur;
      } else if (type === 'resize-start') {
        newStart = Math.max(0, Math.min(initialEnd - 0.05, initialStart + deltaTime));
      } else if (type === 'resize-end') {
        newEnd = Math.max(initialStart + 0.05, initialEnd + deltaTime);
      }

      updateSyllableTime(lineIdx, sylIdx, newStart, newEnd);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleEditClick = (lineIdx: number, sylIdx: number, syl: Syllable, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSyl({ lineIdx, sylIdx, text: syl.text });
  };

  const handleSaveEdit = () => {
    if (editingSyl) {
      updateSyllableText(editingSyl.lineIdx, editingSyl.sylIdx, editingSyl.text);
      setEditingSyl(null);
    }
  };

  const totalWidth = duration * zoom;

  return (
    <div className="timeline-container" style={{ background: 'var(--surface-frosted-pane)', backdropFilter: 'var(--glass-backdrop)', borderRadius: 'var(--radius-cards)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
      {/* Zoom and Info header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-cloud-whisper)', letterSpacing: '-0.01em' }}>
            TIMELINE EDITOR
          </span>
          {loadingWaveform && (
            <span style={{ fontSize: '12px', color: 'var(--color-deep-violet)' }}>
              ⚡ Processing waveform: <strong>{waveformProgress}%</strong>
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 20}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'rgba(247, 249, 250, 0.08)',
              border: 'none',
              color: 'var(--color-cloud-whisper)',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <ZoomOut size={14} />
          </button>
          <span style={{ fontSize: '12px', color: 'var(--color-slate-hint)', width: '60px', textAlign: 'center', fontWeight: 500 }}>{zoom} px/s</span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 240}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'rgba(247, 249, 250, 0.08)',
              border: 'none',
              color: 'var(--color-cloud-whisper)',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      {/* Main timeline scroll area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onClick={handleTimelineClick}
        className="timeline-scrollable"
        style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          position: 'relative',
          background: 'rgba(9, 9, 9, 0.6)',
          border: '1px solid var(--color-steel-accent)',
          borderRadius: 'var(--radius-smallwidgets)',
          cursor: 'ew-resize',
        }}
      >
        {/* Invisible spacer to trigger scroll range */}
        <div
          ref={scrollRef}
          className="timeline-scroll-spacer"
          style={{
            width: `${Math.max(containerWidth, totalWidth)}px`,
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Waveform Canvas */}
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

          {/* Time cursor playhead */}
          {duration > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${currentTime * zoom}px`,
                width: '2px',
                background: 'var(--color-deep-violet)',
                boxShadow: '0 0 10px rgba(175, 80, 255, 0.6)',
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-4px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: 'var(--color-deep-violet)',
                }}
              />
            </div>
          )}

          {/* Syllable blocks overlay */}
          {duration > 0 &&
            lines.map((line, lIdx) =>
              line.syllables.map((syl, sIdx) => {
                if (syl.startTime === null || syl.endTime === null) return null;
                
                const left = syl.startTime * zoom;
                const width = (syl.endTime - syl.startTime) * zoom;
                const isActive = currentTime >= syl.startTime && currentTime <= syl.endTime;

                return (
                  <div
                    key={syl.id}
                    style={{
                      position: 'absolute',
                      left: `${left}px`,
                      width: `${width}px`,
                      height: '32px',
                      bottom: '25px',
                      background: isActive
                        ? 'linear-gradient(to bottom, rgba(175, 80, 255, 0.3), rgba(175, 80, 255, 0.5))'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: isActive
                        ? '1px solid var(--color-deep-violet)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-buttons)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: 'var(--color-cloud-whisper)',
                      fontWeight: 600,
                      cursor: 'grab',
                      userSelect: 'none',
                    }}
                    onMouseDown={(e) => handleBlockDrag(e, lIdx, sIdx, syl, 'move')}
                    title={`${syl.text} (${syl.startTime}s - ${syl.endTime}s)`}
                  >
                    {/* Left Resize Handle */}
                    <div
                      onMouseDown={(e) => handleBlockDrag(e, lIdx, sIdx, syl, 'resize-start')}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '6px',
                        cursor: 'w-resize',
                        background: 'rgba(255,255,255,0.15)',
                        borderTopLeftRadius: '3px',
                        borderBottomLeftRadius: '3px',
                      }}
                    />

                    {/* Syllable Text */}
                    <span
                      style={{
                        padding: '0 8px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {syl.text}
                    </span>

                    {/* Small Edit Icon */}
                    <button
                      onClick={(e) => handleEditClick(lIdx, sIdx, syl, e)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        background: 'none',
                        color: 'rgba(255,255,255,0.4)',
                        display: 'none', // Shown on hover
                      }}
                      className="edit-icon-btn"
                    >
                      <Edit size={10} />
                    </button>

                    {/* Right Resize Handle */}
                    <div
                      onMouseDown={(e) => handleBlockDrag(e, lIdx, sIdx, syl, 'resize-end')}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '6px',
                        cursor: 'e-resize',
                        background: 'rgba(255,255,255,0.15)',
                        borderTopRightRadius: '3px',
                        borderBottomRightRadius: '3px',
                      }}
                    />
                    
                    {/* CSS Hack to show Edit Button on Hover */}
                    <style>{`
                      .timeline-scroll-spacer > div:hover .edit-icon-btn {
                        display: flex !important;
                      }
                    `}</style>
                  </div>
                );
              })
            )}
        </div>
      </div>

      {/* Editing Dialog Tooltip */}
      {editingSyl && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'var(--color-midnight-eclipse)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-cards)',
            padding: '24px',
            zIndex: 1000,
            width: '320px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <h4 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-cloud-whisper)', margin: 0, letterSpacing: '-0.019em' }}>Edit Syllable</h4>
          <input
            type="text"
            className="input-styled"
            value={editingSyl.text}
            onChange={(e) => setEditingSyl({ ...editingSyl, text: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
            autoFocus
            style={{
              background: 'rgba(9, 9, 9, 0.8)',
              border: '1px solid var(--color-steel-accent)',
              borderRadius: 'var(--radius-buttons)',
              padding: '10px 16px',
              color: 'var(--color-cloud-whisper)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setEditingSyl(null)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-buttons)',
                fontSize: '14px',
                fontWeight: 600,
                background: 'rgba(247, 249, 250, 0.08)',
                border: 'none',
                color: 'var(--color-cloud-whisper)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-buttons)',
                fontSize: '14px',
                fontWeight: 600,
                background: 'var(--color-deep-violet)',
                border: 'none',
                color: 'var(--color-cloud-whisper)',
                cursor: 'pointer',
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Helper Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--color-slate-hint)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '8px',
          marginTop: '8px',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HelpCircle size={12} /> Drag block to reposition | Drag side handles to adjust syllable duration. Click to edit.
        </span>
        <span>Zoom in for precise timeline adjustments.</span>
      </div>
    </div>
  );
};
