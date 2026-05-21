import React, { useRef, useState } from 'react';
import { useKaraoke } from '../context/KaraokeContext';
import { Upload, Music, Video, X } from 'lucide-react';

interface MediaSelectorProps {
  onMediaLoaded?: (file: File) => void;
}

export const MediaSelector: React.FC<MediaSelectorProps> = ({ onMediaLoaded }) => {
  const { loadMedia, clearMedia, mediaName, mediaType } = useKaraoke();
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
      // Accept only audio/video
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
    <div className="panel-card">
      <div className="card-title">
        {mediaType === 'video' ? <Video size={16} /> : <Music size={16} />}
        <span>Media Asset</span>
      </div>

      {!mediaName ? (
        <div
          className={`dropzone ${isDragOver ? 'drag-over' : ''}`}
          onClick={handleDivClick}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          style={{
            borderColor: isDragOver ? 'var(--color-deep-violet)' : undefined,
            backgroundColor: isDragOver ? 'rgba(175, 80, 255, 0.08)' : undefined,
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*,video/*"
            style={{ display: 'none' }}
          />
          <Upload className="dropzone-icon" size={32} />
          <p style={{ fontSize: '13px', fontWeight: 600 }}>Upload Music or Background Video</p>
          <p style={{ fontSize: '11px', color: 'var(--color-slate-hint)' }}>
            Drag & drop or click to browse files (MP3, WAV, MP4, WebM...)
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(247, 249, 250, 0.02)',
            border: '1px solid var(--color-steel-accent)',
            borderRadius: 'var(--radius-smallwidgets)',
            padding: '10px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            {mediaType === 'video' ? (
              <Video size={18} className="brand-icon" style={{ flexShrink: 0 }} />
            ) : (
              <Music size={18} className="brand-icon" style={{ flexShrink: 0 }} />
            )}
            <div style={{ overflow: 'hidden' }}>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {mediaName}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-slate-hint)' }}>
                {mediaType === 'video' ? 'Video File' : 'Audio File'}
              </p>
            </div>
          </div>
          <button
            onClick={clearMedia}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-slate-hint)',
              padding: '4px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ff453a')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-slate-hint)')}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
