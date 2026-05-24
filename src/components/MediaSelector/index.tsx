import React, { useRef, useState } from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Upload, Music, Video, X } from 'lucide-react';

interface MediaSelectorProps {
  onMediaLoaded?: (file: File) => void;
}

export const MediaSelector: React.FC<MediaSelectorProps> = ({ onMediaLoaded }) => {
  const { loadMedia, clearMedia, mediaName, mediaType } = useKaraoke();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      loadMedia(file);
      if (onMediaLoaded) onMediaLoaded(file);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        loadMedia(file);
        if (onMediaLoaded) onMediaLoaded(file);
      }
    }
  };

  const handleDivClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-graphite-deep border border-graphite-light rounded-[4px] p-4 flex flex-col gap-3 transition-colors duration-200 hover:border-neon-glow/40">
      <div className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wider text-neon-glow">
        {mediaType === 'video' ? <Video size={14} /> : <Music size={14} />}
        <span>{t('mediaSelector.title')}</span>
      </div>

      {!mediaName ? (
        <div
          className={`border border-dashed rounded-[4px] p-6 text-center cursor-pointer flex flex-col items-center gap-2 bg-blackout transition-all duration-200 ${
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
            className="hidden"
          />
          <Upload className="text-ash group-hover:text-neon-glow transition-colors duration-200" size={28} />
          <p className="font-sans text-xs font-semibold text-whiteout">{t('mediaSelector.uploadPrompt')}</p>
          <p className="font-sans text-[10px] text-ash">
            {t('mediaSelector.uploadInstructions')}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-blackout border border-graphite-light rounded-[4px] px-3.5 py-2.5 gap-3 overflow-hidden">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {mediaType === 'video' ? (
              <Video size={16} className="text-neon-glow shrink-0" />
            ) : (
              <Music size={16} className="text-neon-glow shrink-0" />
            )}
            <div className="overflow-hidden">
              <p className="font-sans text-xs font-semibold text-whiteout truncate">
                {mediaName}
              </p>
              <p className="font-mono text-[10px] text-ash uppercase">
                {mediaType === 'video' ? t('mediaSelector.videoFileType') : t('mediaSelector.audioFileType')}
              </p>
            </div>
          </div>
          <button
            onClick={clearMedia}
            className="p-1 bg-transparent border-none text-ash hover:text-system-warning rounded-full transition-colors duration-200 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
