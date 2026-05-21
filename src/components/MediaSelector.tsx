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
        <span>Tệp Đa Phương Tiện</span>
      </div>

      {!mediaName ? (
        <div
          className={`dropzone ${isDragOver ? 'drag-over' : ''}`}
          onClick={handleDivClick}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          style={{
            borderColor: isDragOver ? 'var(--primary)' : undefined,
            backgroundColor: isDragOver ? 'rgba(139, 92, 246, 0.08)' : undefined,
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
          <p style={{ fontSize: '13px', fontWeight: 600 }}>Tải lên Nhạc hoặc Video nền</p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Kéo thả hoặc click để duyệt file (MP3, WAV, MP4, WebM...)
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
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
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {mediaType === 'video' ? 'Tệp Video' : 'Tệp Âm thanh'}
              </p>
            </div>
          </div>
          <button
            onClick={clearMedia}
            style={{
              background: 'none',
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
