import React from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useKaraokeStore } from '../../store/useKaraokeStore';
import { HelpCircle } from 'lucide-react';
import { TimelineControls } from './TimelineControls';
import { WaveformCanvas } from './WaveformCanvas';
import { SyllableBlocks } from './SyllableBlocks';
import { SyllableEditModal } from './SyllableEditModal';
import { useTimelineDrag } from './useTimelineDrag';
import { TimeGrid } from './TimeGrid';
import { TrackLane } from './TrackLane';
import { useTrackDrag } from './useTrackDrag';

import type { WaveformData } from '../../hooks/useAudioAnalyzer';

interface WaveformTimelineProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  waveformData: WaveformData | null;
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
    duration,
    setCurrentTime,
    updateSyllableTime,
    updateSyllableText,
    tracks,
  } = useKaraoke();

  const { t } = useLanguage();

  const {
    zoom,
    editingSyl,
    setEditingSyl,
    containerWidth,
    containerRef,
    scrollRef,
    canvasRef,
    handleZoomIn,
    handleZoomOut,
    handleBlockDrag,
    handleEditClick,
    handleSaveEdit,
  } = useTimelineDrag({
    duration,
    setCurrentTime,
    updateSyllableTime,
    updateSyllableText,
    audioRef,
  });

  const playheadRef = React.useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = React.useState(0);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollLeft(container.scrollLeft);
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', handleScroll);
    setScrollLeft(container.scrollLeft);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef]);

  React.useEffect(() => {
    const unsubscribe = useKaraokeStore.subscribe(
      (state) => state.currentTime,
      (currentTime) => {
        // Move playhead DOM element directly at 60fps
        if (playheadRef.current) {
          playheadRef.current.style.left = `${180 + currentTime * zoom}px`;
        }

        // Auto-scroll timeline container directly without state updates
        const isPlayingState = useKaraokeStore.getState().isPlaying;
        if (isPlayingState && containerRef.current) {
          const container = containerRef.current;
          const playheadPos = currentTime * zoom;
          const halfWidth = container.clientWidth / 2;
          const currentScroll = container.scrollLeft;

          if (playheadPos > currentScroll + halfWidth + 100 || playheadPos < currentScroll + 100) {
            container.scrollLeft = Math.max(0, playheadPos - halfWidth);
          }
        }
      }
    );
    return unsubscribe;
  }, [zoom, containerRef]);

  const { handleTrackDrag } = useTrackDrag({ zoom });
  const totalWidth = duration * zoom;

  const updateTimeFromX = (clientX: number, rect: DOMRect) => {
    if (!audioRef.current) return;
    const clickX = clientX - rect.left - 180;
    const targetTime = Math.max(0, Math.min(duration, clickX / zoom));
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current || !audioRef.current || duration === 0) return;
    const target = e.target as HTMLElement;
    if (!target.classList.contains('timeline-scrollable') && !target.classList.contains('waveform-canvas')) return;

    const rect = scrollRef.current.getBoundingClientRect();
    updateTimeFromX(e.clientX, rect);

    const handleMouseMove = (moveEvent: MouseEvent) => updateTimeFromX(moveEvent.clientX, rect);
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handlePlayheadMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current || !audioRef.current || duration === 0) return;
    e.stopPropagation();
    e.preventDefault();

    const rect = scrollRef.current.getBoundingClientRect();
    const handleMouseMove = (moveEvent: MouseEvent) => updateTimeFromX(moveEvent.clientX, rect);
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
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
        onMouseDown={handleRulerMouseDown}
        className="flex-1 overflow-x-auto overflow-y-auto relative bg-blackout/40 border border-graphite-light rounded-[4px] cursor-ew-resize timeline-scrollable"
      >
        <div
          ref={scrollRef}
          className="min-h-full relative pointer-events-auto flex flex-col timeline-scrollable"
          style={{ width: `${Math.max(containerWidth, 180 + totalWidth)}px` }}
        >
          {/* Background Ruler grid ticks, offset by 180px */}
          <div className="absolute inset-y-0 left-[180px] pointer-events-none z-0">
            <TimeGrid duration={duration} zoom={zoom} totalWidth={totalWidth} />
          </div>

          {/* Row 1: Syllables Alignment Lane */}
          <div className="h-[90px] min-h-[90px] border-b border-graphite-light/25 flex bg-blackout select-none relative items-center z-10">
            {/* Syllables Left Sticky Header */}
            <div className="w-[180px] min-w-[180px] h-full sticky left-0 bg-graphite-deep border-r border-graphite-light flex flex-col p-2.5 justify-between z-10 select-none shadow-[4px_0_10px_rgba(0,0,0,0.4)]">
              <span className="font-sans text-[11px] font-semibold text-whiteout uppercase tracking-wider">{t('timeline.syllableTitle')}</span>
              <span className="font-sans text-[9px] text-ash">{t('timeline.syllableDesc')}</span>
            </div>

            {/* Syllable Canvas Block Area */}
            <div className="flex-1 h-full relative overflow-hidden bg-blackout/10 pointer-events-auto" style={{ width: `${totalWidth}px` }}>
              <WaveformCanvas
                canvasRef={canvasRef}
                waveformData={waveformData}
                duration={duration}
                zoom={zoom}
                containerWidth={Math.max(100, containerWidth - 180)}
                containerHeight={80}
                scrollLeft={scrollLeft}
              />
              {duration > 0 && (
                <SyllableBlocks
                  lines={lines}
                  zoom={zoom}
                  handleBlockDrag={handleBlockDrag}
                  handleEditClick={handleEditClick}
                />
              )}
            </div>
          </div>

          {/* Rows 2+: Loaded Media Track Lanes */}
          {tracks.map(track => (
            <TrackLane key={track.id} track={track} zoom={zoom} onDragStart={handleTrackDrag} totalWidth={totalWidth} />
          ))}

          {/* Global DAW vertical Playhead */}
          {duration > 0 && (
            <div
              ref={playheadRef}
              onMouseDown={handlePlayheadMouseDown}
              className="absolute top-0 bottom-0 w-[2px] bg-neon-glow z-20 cursor-col-resize shadow-[0_0_10px_#34d59a] pointer-events-auto group/playhead"
              style={{ left: `${180 + useKaraokeStore.getState().currentTime * zoom}px` }}
            >
              <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 rounded-full bg-neon-glow cursor-col-resize shadow-[0_0_12px_#34d59a] border border-whiteout scale-100 group-hover/playhead:scale-125 transition-transform duration-100 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-blackout" />
              </div>
            </div>
          )}
        </div>
      </div>

      <SyllableEditModal editingSyl={editingSyl} setEditingSyl={setEditingSyl} handleSaveEdit={handleSaveEdit} />

      <div className="flex justify-between font-sans text-[10px] text-ash border-t border-graphite-light pt-2 mt-1 select-none">
        <span className="flex items-center gap-1.5"><HelpCircle size={10} /> {t('timeline.helpInstructions')}</span>
        <span>{t('timeline.helpZoom')}</span>
      </div>
      
      <style>{`
        .cursor-ew-resize div:hover .edit-icon-btn { display: flex !important; }
      `}</style>
    </div>
  );
};
