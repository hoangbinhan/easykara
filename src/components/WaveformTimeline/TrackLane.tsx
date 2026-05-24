import React from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { useLanguage } from '../../context/LanguageContext';
import type { MediaTrack } from '../../context/KaraokeContext';
import { Music, Video, Volume2 } from 'lucide-react';

interface TrackLaneProps {
  track: MediaTrack;
  zoom: number;
  onDragStart: (e: React.MouseEvent, track: MediaTrack) => void;
  totalWidth: number;
}

export const TrackLane: React.FC<TrackLaneProps> = ({
  track,
  zoom,
  onDragStart,
  totalWidth,
}) => {
  const { toggleMuteTrack, toggleSoloTrack, updateTrackVolume } = useKaraoke();
  const { t } = useLanguage();

  const peaks = track.waveformData?.peaks;

  // Dynamically calculate and memoize symmetric vector path for SVG Waveform to avoid rebuilding on every re-render
  const svgPath = React.useMemo(() => {
    if (!peaks) return '';
    const svgHeight = 36;
    const pointsTop: string[] = [];
    const pointsBottom: string[] = [];

    peaks.forEach((p, i) => {
      const x = (i / peaks.length) * 100;
      // Symmetric top and bottom boundaries from center axis
      const topY = (1 - p) * (svgHeight / 2);
      const bottomY = (1 + p) * (svgHeight / 2);
      
      pointsTop.push(`${x.toFixed(1)},${topY.toFixed(1)}`);
      pointsBottom.unshift(`${x.toFixed(1)},${bottomY.toFixed(1)}`);
    });

    return `M 0,${svgHeight / 2} L ${pointsTop.join(' L ')} L 100,${svgHeight / 2} L ${pointsBottom.join(' L ')} Z`;
  }, [peaks]);

  const renderSVGWaveform = () => {
    if (!svgPath) return null;
    return (
      <svg
        className="w-full h-full text-neon-glow/20 absolute inset-0 pointer-events-none"
        viewBox="0 0 100 36"
        preserveAspectRatio="none"
      >
        <path d={svgPath} fill="currentColor" />
      </svg>
    );
  };

  const blockLeft = track.offset * zoom;
  const blockWidth = track.duration * zoom;

  return (
    <div className="h-[54px] border-b border-graphite-light/25 flex bg-blackout select-none relative group items-center">
      {/* Left Column: Track Mixer Console Header (Sticky) */}
      <div className="w-[180px] min-w-[180px] h-full sticky left-0 bg-graphite-deep border-r border-graphite-light flex flex-col p-2 justify-between z-10 select-none shadow-[4px_0_10px_rgba(0,0,0,0.4)]">
        {/* Track Title */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          {track.type === 'video' ? (
            <Video size={11} className="text-neon-glow shrink-0" />
          ) : (
            <Music size={11} className="text-neon-glow shrink-0" />
          )}
          <span
            className="font-sans text-[11px] font-medium text-whiteout truncate select-text"
            title={track.name}
          >
            {track.name}
          </span>
        </div>

        {/* Mixer knobs */}
        <div className="flex items-center justify-between gap-2.5">
          {/* Quick volume input indicator */}
          <div className="flex items-center gap-1 flex-1">
            <Volume2 size={10} className="text-ash shrink-0" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={track.volume}
              onChange={(e) => updateTrackVolume(track.id, parseFloat(e.target.value))}
              className="w-full h-1 bg-graphite rounded-lg appearance-none cursor-pointer accent-neon-glow"
            />
          </div>

          {/* Quick Mute/Solo buttons */}
          <div className="flex gap-0.5 shrink-0">
            <button
              onClick={() => toggleMuteTrack(track.id)}
              className={`w-4 h-4 rounded-[2px] text-[8px] font-mono font-bold flex items-center justify-center cursor-pointer border ${
                track.isMuted
                  ? 'bg-system-warning/20 border-system-warning text-system-warning'
                  : 'bg-transparent border-graphite-light text-ash hover:text-whiteout'
              }`}
              title={t('mediaSelector.tooltipMute')}
            >
              M
            </button>
            <button
              onClick={() => toggleSoloTrack(track.id)}
              className={`w-4 h-4 rounded-[2px] text-[8px] font-mono font-bold flex items-center justify-center cursor-pointer border ${
                track.isSoloed
                  ? 'bg-neon-muted/30 border-neon-glow text-neon-glow'
                  : 'bg-transparent border-graphite-light text-ash hover:text-whiteout'
              }`}
              title={t('mediaSelector.tooltipSolo')}
            >
              S
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Scrollable lane content */}
      <div 
        className="flex-1 h-full relative overflow-hidden bg-blackout/10 pointer-events-none"
        style={{ width: `${totalWidth}px` }}
      >
        {/* Draggable audio segment block */}
        <div
          onMouseDown={(e) => onDragStart(e, track)}
          className={`absolute top-[6px] bottom-[6px] rounded-[4px] border bg-graphite-deep/80 hover:bg-graphite/70 cursor-grab active:cursor-grabbing flex items-center px-3 gap-2 select-none pointer-events-auto transition-all duration-150 active:scale-[0.99] active:border-neon-glow active:bg-graphite z-[1] ${
            track.isMuted
              ? 'border-system-warning/30 opacity-40'
              : 'border-graphite-light hover:border-neon-glow/40'
          }`}
          style={{
            left: `${blockLeft}px`,
            width: `${blockWidth}px`,
          }}
        >
          {/* Audio Waveform Peaks Vector Background */}
          {track.waveformData?.peaks ? (
            renderSVGWaveform()
          ) : (
            // Scanning design grid fallback
            <div className="absolute inset-0 bg-scanline-stripes opacity-[0.03] pointer-events-none" />
          )}

          {/* Block Text Description */}
          <span className="font-sans text-[10px] font-semibold text-whiteout/80 truncate z-10 select-none">
            {track.type === 'video' ? `📺 ${t('timeline.trackVideo')}` : `🎵 ${t('timeline.trackAudio')}`}
          </span>
          <span className="font-mono text-[9px] text-ash shrink-0 z-10 select-none track-offset-text">
            {track.duration.toFixed(1)}s ({t('timeline.offset')}: {track.offset.toFixed(2)}s)
          </span>
        </div>
      </div>
    </div>
  );
};
