import React, { useRef, useState } from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Upload, Music, Video, Volume2, Trash2 } from 'lucide-react';

interface MediaSelectorProps {
  onMediaLoaded?: (file: File) => void;
}

export const MediaSelector: React.FC<MediaSelectorProps> = React.memo(({ onMediaLoaded }) => {
  const { tracks, addTrack, removeTrack, updateTrackVolume, toggleMuteTrack, toggleSoloTrack } =
    useKaraoke(
      React.useCallback(
        (state) => ({
          tracks: state.tracks,
          addTrack: state.addTrack,
          removeTrack: state.removeTrack,
          updateTrackVolume: state.updateTrackVolume,
          toggleMuteTrack: state.toggleMuteTrack,
          toggleSoloTrack: state.toggleSoloTrack,
        }),
        []
      )
    );

  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => {
        addTrack(file);
        if (onMediaLoaded) onMediaLoaded(file);
      });
      // Reset the file input value so that the exact same file can be uploaded again if removed
      e.target.value = '';
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      Array.from(e.dataTransfer.files).forEach((file) => {
        if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
          addTrack(file);
          if (onMediaLoaded) onMediaLoaded(file);
        }
      });
    }
  };

  const handleDivClick = () => {
    fileInputRef.current?.click();
  };

  const hasVideo = tracks.some((t) => t.type === 'video');

  return (
    <div className="bg-graphite-deep border border-graphite-light rounded-[4px] p-4 flex flex-col gap-4 transition-colors duration-200 hover:border-neon-glow/40">
      {/* Panel Title Header */}
      <div className="flex items-center justify-between border-b border-graphite-light pb-2 select-none">
        <div className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wider text-neon-glow">
          <Music size={14} />
          <span>{t('mediaSelector.title')}</span>
        </div>
        {tracks.length > 0 && (
          <span className="font-mono text-[10px] text-ash">
            {tracks.length} {t('mediaSelector.channels')}
          </span>
        )}
      </div>

      {/* Upload Drag Area */}
      <div
        className={`border border-dashed rounded-[4px] p-4 text-center cursor-pointer flex flex-col items-center gap-1.5 bg-blackout transition-all duration-200 ${
          isDragOver
            ? 'border-neon-glow bg-neon-muted/10'
            : 'border-graphite-light hover:border-neon-glow/60 hover:bg-neon-muted/5'
        }`}
        onClick={handleDivClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="audio/*,video/*"
          multiple
          className="hidden"
        />
        <Upload
          className="text-ash hover:text-neon-glow transition-colors duration-200"
          size={24}
        />
        <p className="font-sans text-xs font-semibold text-whiteout">
          {hasVideo ? t('mediaSelector.uploadPromptActive') : t('mediaSelector.uploadPrompt')}
        </p>
        <p className="font-sans text-[9px] text-ash">
          {hasVideo
            ? t('mediaSelector.uploadInstructionsActive')
            : t('mediaSelector.uploadInstructions')}
        </p>
      </div>

      {/* Multi-Track Console Mixer Board */}
      {tracks.length > 0 && (
        <div className="flex flex-col gap-3 pt-2">
          <div className="text-[10px] uppercase font-mono text-ash tracking-widest font-semibold border-b border-graphite-light/40 pb-1">
            {t('mediaSelector.mixerTitle')}
          </div>

          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="bg-blackout border border-graphite-light rounded-[4px] p-2.5 flex flex-col gap-2 relative overflow-hidden"
              >
                {/* Track details header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 overflow-hidden flex-1">
                    {track.type === 'video' ? (
                      <Video size={12} className="text-neon-glow shrink-0" />
                    ) : (
                      <Music size={12} className="text-neon-glow shrink-0" />
                    )}
                    <span
                      className="font-sans text-xs font-medium text-whiteout truncate select-text"
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
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Mixing board controls */}
                <div className="flex items-center justify-between gap-3">
                  {/* Slider control */}
                  <div className="flex items-center gap-1.5 flex-1">
                    <Volume2 size={11} className="text-ash shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={track.volume}
                      onChange={(e) => updateTrackVolume(track.id, parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-graphite rounded-lg appearance-none cursor-pointer accent-neon-glow"
                    />
                    <span className="font-mono text-[9px] text-ash w-6 text-right shrink-0">
                      {Math.round(track.volume * 100)}%
                    </span>
                  </div>

                  {/* Mute and Solo buttons */}
                  <div className="flex gap-1 shrink-0 select-none">
                    <button
                      onClick={() => toggleMuteTrack(track.id)}
                      className={`w-5 h-5 rounded-[4px] text-[10px] font-mono font-semibold flex items-center justify-center cursor-pointer transition-all duration-200 border ${
                        track.isMuted
                          ? 'bg-system-warning/20 border-system-warning text-system-warning'
                          : 'bg-transparent border-graphite-light text-ash hover:border-ash hover:text-whiteout'
                      }`}
                      title={t('mediaSelector.tooltipMute')}
                    >
                      M
                    </button>
                    <button
                      onClick={() => toggleSoloTrack(track.id)}
                      className={`w-5 h-5 rounded-[4px] text-[10px] font-mono font-semibold flex items-center justify-center cursor-pointer transition-all duration-200 border ${
                        track.isSoloed
                          ? 'bg-neon-muted/30 border-neon-glow text-neon-glow'
                          : 'bg-transparent border-graphite-light text-ash hover:border-ash hover:text-whiteout'
                      }`}
                      title={t('mediaSelector.tooltipSolo')}
                    >
                      S
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

MediaSelector.displayName = 'MediaSelector';
