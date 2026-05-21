import React, { useRef, useEffect, useState } from 'react';
import { useKaraoke } from '../context/KaraokeContext';
import type { Syllable } from '../context/KaraokeContext';
import { ZoomIn, ZoomOut, Edit, HelpCircle } from 'lucide-react';

interface WaveformTimelineProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  waveformData: any;
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

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    
    ctx.fillStyle = 'rgba(139, 92, 246, 0.25)'; // Semitransparent violet
    
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
    <div className="timeline-container">
      {/* Zoom and Info header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
            DÒNG THỜI GIAN (TIMELINE EDITOR)
          </span>
          {loadingWaveform && (
            <span style={{ fontSize: '11px', color: 'var(--primary)' }}>
              ⚡ Đang xử lý dạng sóng âm: <strong>{waveformProgress}%</strong>
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 20}
            style={{
              padding: '4px',
              borderRadius: '4px',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-muted)',
              display: 'flex',
            }}
          >
            <ZoomOut size={14} />
          </button>
          <span style={{ fontSize: '11px', width: '40px', textAlign: 'center' }}>{zoom} px/s</span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 240}
            style={{
              padding: '4px',
              borderRadius: '4px',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-muted)',
              display: 'flex',
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
          background: 'rgba(5, 6, 12, 0.6)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '8px',
          cursor: 'ew-resize',
        }}
      >
        {/* Invisible spacer to trigger scroll range */}
        <div
          ref={scrollRef}
          className="timeline-scroll-spacer"
          style={{
            width: `${Math.max(containerRef.current?.clientWidth || 0, totalWidth)}px`,
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
              width: `${containerRef.current?.clientWidth || 0}px`,
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
                background: 'var(--secondary)',
                boxShadow: '0 0 8px var(--secondary-glow)',
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
                  background: 'var(--secondary)',
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
                        ? 'linear-gradient(to bottom, rgba(236,72,153,0.3), rgba(139,92,246,0.3))'
                        : 'linear-gradient(to bottom, rgba(139,92,246,0.12), rgba(139,92,246,0.06))',
                      border: isActive
                        ? '1px solid var(--secondary)'
                        : '1px solid rgba(139, 92, 246, 0.4)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'grab',
                      userSelect: 'none',
                      boxShadow: isActive ? '0 0 10px rgba(236,72,153,0.2)' : 'none',
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
            background: 'var(--bg-surface-solid)',
            border: '1px solid var(--primary)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 0 30px rgba(0,0,0,0.8)',
            zIndex: 1000,
            width: '280px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <h4 style={{ fontSize: '13px', color: 'var(--primary)' }}>Chỉnh sửa từ</h4>
          <input
            type="text"
            className="input-styled"
            value={editingSyl.text}
            onChange={(e) => setEditingSyl({ ...editingSyl, text: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setEditingSyl(null)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text-muted)',
              }}
            >
              Hủy
            </button>
            <button
              onClick={handleSaveEdit}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                background: 'var(--primary)',
                color: 'white',
              }}
            >
              Lưu
            </button>
          </div>
        </div>
      )}

      {/* Helper Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: 'var(--text-dark)',
          borderTop: '1px solid rgba(255,255,255,0.02)',
          paddingTop: '4px',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <HelpCircle size={10} /> Kéo thả block để di chuyển | Kéo 2 viền bên để co giãn thời lượng của từ. Click đúp để sửa chữ.
        </span>
        <span>Phóng to timeline để zoom sâu, dễ tinh chỉnh mốc thời gian hơn.</span>
      </div>
    </div>
  );
};
