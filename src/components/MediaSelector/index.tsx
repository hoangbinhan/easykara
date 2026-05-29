import React, { useRef, useState } from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Upload, Music } from 'lucide-react';

interface MediaSelectorProps {
  onMediaLoaded?: (file: File) => void;
}

export const MediaSelector: React.FC<MediaSelectorProps> = React.memo(({ onMediaLoaded }) => {
  const { tracks, addTrack } = useKaraoke(
    React.useCallback(
      (state) => ({
        tracks: state.tracks,
        addTrack: state.addTrack,
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
    </div>
  );
});

MediaSelector.displayName = 'MediaSelector';

