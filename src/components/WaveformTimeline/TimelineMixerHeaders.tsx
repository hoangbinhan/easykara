import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { TrackMixerHeader } from './TrackMixerHeader';
import type { MediaTrack } from '../../context/KaraokeContext';

interface TimelineMixerHeadersProps {
  tracks: MediaTrack[];
}

export const TimelineMixerHeaders = React.forwardRef<HTMLDivElement, TimelineMixerHeadersProps>(
  ({ tracks }, ref) => {
    const { t } = useLanguage();

    return (
      <div
        ref={ref}
        className="w-[180px] min-w-[180px] flex flex-col shrink-0 border-r border-graphite-light bg-graphite-deep select-none overflow-hidden scrollbar-none z-10 shadow-[4px_0_10px_rgba(0,0,0,0.4)]"
      >
        {/* Row 1: Syllables Header */}
        <div className="h-[90px] min-h-[90px] border-b border-graphite-light/25 flex flex-col p-2.5 justify-between">
          <span className="font-sans text-[11px] font-semibold text-whiteout uppercase tracking-wider">
            {t('timeline.syllableTitle')}
          </span>
          <span className="font-sans text-[9px] text-ash">{t('timeline.syllableDesc')}</span>
        </div>

        {/* Rows 2+: Track Mixer Headers */}
        {tracks.map((track) => (
          <div key={track.id} className="h-[54px] border-b border-graphite-light/25">
            <TrackMixerHeader track={track} />
          </div>
        ))}
      </div>
    );
  }
);

TimelineMixerHeaders.displayName = 'TimelineMixerHeaders';
