import React from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { HelpCircle } from 'lucide-react';
import { TimelineControls } from './TimelineControls';
import { WaveformCanvas } from './WaveformCanvas';
import { SyllableBlocks } from './SyllableBlocks';
import { SyllableEditModal } from './SyllableEditModal';
import { useTimelineDrag } from './useTimelineDrag';
import { TimeGrid } from './TimeGrid';
import { TrackLane } from './TrackLane';
import { useTrackDrag } from './useTrackDrag';

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
    tracks,
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

  const { handleTrackDrag } = useTrackDrag({ zoom });

  const totalWidth = duration * zoom;

  // We handle click seeking but adjust for the 180px left sticky columns
  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current || !audioRef.current || duration === 0) return;
    const target = e.target as HTMLElement;
    if (!target.classList.contains('timeline-scrollable') && !target.classList.contains('waveform-canvas')) {
      return;
    }
    const rect = scrollRef.current.getBoundingClientRect();
    // Offset click coordinate by 180px header
    const clickX = e.clientX - rect.left - 180;
    if (clickX >= 0) {
      const time = clickX / zoom;
      const targetTime = Math.max(0, Math.min(duration, time));
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

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
        onClick={handleRulerClick}
        className="flex-1 overflow-x-auto overflow-y-auto relative bg-blackout/40 border border-graphite-light rounded-[4px] cursor-ew-resize timeline-scrollable"
      >
        <div
          ref={scrollRef}
          className="min-h-full relative pointer-events-auto flex flex-col timeline-scrollable"
          style={{
            width: `${Math.max(containerWidth, 180 + totalWidth)}px`,
          }}
        >
          {/* Background Ruler grid ticks, offset by 180px */}
          <div className="absolute inset-y-0 left-[180px] pointer-events-none z-0">
            <TimeGrid
              duration={duration}
              zoom={zoom}
              totalWidth={totalWidth}
            />
          </div>

          {/* Row 1: Syllables Alignment Lane */}
          <div className="h-[90px] min-h-[90px] border-b border-graphite-light/25 flex bg-blackout select-none relative items-center">
            {/* Syllables Left Sticky Header */}
            <div className="w-[180px] min-w-[180px] h-full bg-graphite-deep border-r border-graphite-light flex flex-col p-2.5 justify-between z-10 select-none shadow-[4px_0_10px_rgba(0,0,0,0.4)]">
              <span className="font-sans text-[11px] font-semibold text-whiteout uppercase tracking-wider">
                Syllable Sync
              </span>
              <span className="font-sans text-[9px] text-ash">
                Align lyric syllables with audio peaks
              </span>
            </div>

            {/* Syllable Canvas Block Area */}
            <div
              className="flex-1 h-full relative overflow-hidden bg-blackout/10 pointer-events-none"
              style={{ width: `${totalWidth}px` }}
            >
              <WaveformCanvas
                canvasRef={canvasRef}
                waveformData={waveformData}
                duration={duration}
                zoom={zoom}
                scrollLeft={scrollLeft}
                containerWidth={containerWidth}
                containerHeight={80}
              />

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

          {/* Rows 2+: Loaded Media Track Lanes */}
          {tracks.map(track => (
            <TrackLane
              key={track.id}
              track={track}
              zoom={zoom}
              onDragStart={handleTrackDrag}
              totalWidth={totalWidth}
            />
          ))}

          {/* Global DAW vertical Playhead */}
          {duration > 0 && (
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-neon-glow z-20 pointer-events-none shadow-[0_0_10px_#34d59a]"
              style={{
                left: `${180 + currentTime * zoom}px`,
              }}
            >
              <div className="absolute top-0 -left-1 w-2.5 h-2.5 rounded-full bg-neon-glow" />
            </div>
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
          <HelpCircle size={10} /> Drag syllable blocks to align | Drag track blocks to adjust audio offsets. Use Mute/Solo.
        </span>
        <span>Zoom in (+ / -) for micro-adjustments. Playhead snapping active.</span>
      </div>
      
      <style>{`
        .cursor-ew-resize div:hover .edit-icon-btn {
          display: flex !important;
        }
      `}</style>
    </div>
  );
};
