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
  height: number;
}

export const WaveformTimeline: React.FC<WaveformTimelineProps> = ({
  audioRef,
  waveformData,
  loadingWaveform,
  waveformProgress,
  height,
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
    containerHeight,
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
    <div
      className="w-full min-h-[120px] border-t border-graphite-light bg-blackout flex flex-col p-4 gap-2 z-10 relative"
      style={{ height: `${height}px` }}
    >
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
        className="flex-1 overflow-x-auto overflow-y-hidden relative bg-blackout/40 border border-graphite-light rounded-[4px] cursor-ew-resize"
      >
        <div
          ref={scrollRef}
          className="h-full relative pointer-events-auto"
          style={{
            width: `${Math.max(containerWidth, totalWidth)}px`,
          }}
        >
          <WaveformCanvas
            canvasRef={canvasRef}
            waveformData={waveformData}
            duration={duration}
            zoom={zoom}
            scrollLeft={scrollLeft}
            containerWidth={containerWidth}
            containerHeight={containerHeight}
          />

          {duration > 0 && (
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-neon-glow z-10 pointer-events-none shadow-[0_0_10px_#34d59a]"
              style={{
                left: `${currentTime * zoom}px`,
              }}
            >
              <div className="absolute top-0 -left-1 w-2.5 h-2.5 rounded-full bg-neon-glow" />
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

      <div className="flex justify-between font-sans text-[10px] text-ash border-t border-graphite-light pt-2 mt-1 select-none">
        <span className="flex items-center gap-1.5">
          <HelpCircle size={10} /> Drag block to reposition | Drag side handles to adjust syllable duration. Click to edit.
        </span>
        <span>Zoom in for precise timeline adjustments.</span>
      </div>
      
      <style>{`
        .cursor-ew-resize div:hover .edit-icon-btn {
          display: flex !important;
        }
      `}</style>
    </div>
  );
};
