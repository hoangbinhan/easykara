import React from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { useLanguage } from '../../context/LanguageContext';
import type { MediaTrack } from '../../context/KaraokeContext';
import { Music, Video, Volume2, Trash2 } from 'lucide-react';

interface TrackMixerHeaderProps {
  track: MediaTrack;
}

export const TrackMixerHeader: React.FC<TrackMixerHeaderProps> = ({ track }) => {
  const { toggleMuteTrack, toggleSoloTrack, updateTrackVolume, removeTrack } = useKaraoke(
    React.useCallback(
      (state) => ({
        toggleMuteTrack: state.toggleMuteTrack,
        toggleSoloTrack: state.toggleSoloTrack,
        updateTrackVolume: state.updateTrackVolume,
        removeTrack: state.removeTrack,
      }),
      []
    )
  );
  const { t } = useLanguage();

  return (
    <div className="w-[180px] min-w-[180px] h-full sticky left-0 bg-graphite-deep border-r border-graphite-light flex flex-col p-2 justify-between z-10 select-none shadow-[4px_0_10px_rgba(0,0,0,0.4)]">
      {/* Track Title & Delete Button */}
      <div className="flex items-center justify-between gap-1 overflow-hidden w-full">
        <div className="flex items-center gap-1.5 overflow-hidden min-w-0 flex-1">
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
        <button
          onClick={() => removeTrack(track.id)}
          className="p-1 bg-transparent border-none text-ash hover:text-system-warning rounded-full transition-colors duration-200 cursor-pointer shrink-0"
          title={t('mediaSelector.tooltipRemove')}
        >
          <Trash2 size={11} />
        </button>
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
  );
};

