import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import type { MediaTrack } from '../../context/KaraokeContext';

interface TrackLaneProps {
  track: MediaTrack;
  zoom: number;
  totalWidth: number;
}

export const TrackLane: React.FC<TrackLaneProps> = ({ track, zoom, totalWidth }) => {
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
    <div
      className="h-[54px] border-b border-graphite-light/25 bg-blackout select-none relative group items-center overflow-hidden bg-blackout/10 pointer-events-none flex"
      style={{ width: `${totalWidth}px` }}
    >
      {/* Draggable audio segment block */}
      <div
        className={`absolute top-[6px] bottom-[6px] rounded-[4px] border bg-graphite-deep/80 hover:bg-graphite/70 flex items-center px-3 gap-2 select-none pointer-events-auto transition-all duration-150 z-[1] ${
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
          {track.type === 'video'
            ? `📺 ${t('timeline.trackVideo')}`
            : `🎵 ${t('timeline.trackAudio')}`}
        </span>
        <span className="font-mono text-[9px] text-ash shrink-0 z-10 select-none track-offset-text">
          {track.duration.toFixed(1)}s ({t('timeline.offset')}: {track.offset.toFixed(2)}s)
        </span>
      </div>
    </div>
  );
};


