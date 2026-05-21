import React from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { HelpCircle } from 'lucide-react';
import { TimelineControls } from './TimelineControls';
import { WaveformCanvas } from './WaveformCanvas';
import { SyllableBlocks } from './SyllableBlocks';
import { SyllableEditModal } from './SyllableEditModal';
import { useTimelineDrag } from './useTimelineDrag';

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

  const {
    zoom,
    scrollLeft,
    editingSyl,
    setEditingSyl,
    containerWidth,
    containerRef,
    scrollRef,
    canvasRef,
    handleZoomIn,
    handleZoomOut,
    handleScroll,
    handleTimelineClick,
    handleBlockDrag,
    handleEditClick,
    handleSaveEdit,
  } = useTimelineDrag({
    currentTime,
    duration,
    isPlaying,
    setCurrentTime,
    updateSyllableTime,
    updateSyllableText,
    audioRef,
  });

  const totalWidth = duration * zoom;

  return (
    <div className="timeline-container" style={{ background: 'var(--surface-frosted-pane)', backdropFilter: 'var(--glass-backdrop)', borderRadius: 'var(--radius-cards)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '20px' }}>
      <TimelineControls
        zoom={zoom}
        handleZoomIn={handleZoomIn}
        handleZoomOut={handleZoomOut}
        loadingWaveform={loadingWaveform}
        waveformProgress={waveformProgress}
      />

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
        <div
          ref={scrollRef}
          className="timeline-scroll-spacer"
          style={{
            width: `${Math.max(containerWidth, totalWidth)}px`,
            height: '100%',
            position: 'relative',
          }}
        >
          <WaveformCanvas
            canvasRef={canvasRef}
            waveformData={waveformData}
            duration={duration}
            zoom={zoom}
            scrollLeft={scrollLeft}
            containerWidth={containerWidth}
            containerHeight={containerRef.current?.clientHeight || 120}
          />

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

          {duration > 0 && (
            <SyllableBlocks
              lines={lines}
              currentTime={currentTime}
              zoom={zoom}
              handleBlockDrag={handleBlockDrag}
              handleEditClick={handleEditClick}
            />
          )}
        </div>
      </div>

      <SyllableEditModal
        editingSyl={editingSyl}
        setEditingSyl={setEditingSyl}
        handleSaveEdit={handleSaveEdit}
      />

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
      
      <style>{`
        .timeline-scroll-spacer > div:hover .edit-icon-btn {
          display: flex !important;
        }
      `}</style>
    </div>
  );
};
