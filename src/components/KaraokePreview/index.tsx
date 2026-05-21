import React, { useRef } from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { CanvasPlayer } from './CanvasPlayer';

interface KaraokePreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const KaraokePreview: React.FC<KaraokePreviewProps> = ({ videoRef }) => {
  const {
    lines,
    currentTime,
    isPlaying,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    mediaUrl,
    mediaType,
    styleConfig,
  } = useKaraoke();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const handleTogglePlay = () => {
    if (!mediaUrl || !videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        maxWidth: '720px',
      }}
    >
      {/* Real-time Render Canvas */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          aspectRatio: '16/9',
          overflow: 'hidden',
          position: 'relative',
          background: '#090909',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-cards)',
        }}
      >
        <CanvasPlayer
          canvasRef={canvasRef}
          videoRef={videoRef}
          lines={lines}
          currentTime={currentTime}
          mediaType={mediaType}
          styleConfig={styleConfig}
        />

        {/* Hidden unified video player */}
        {mediaUrl && (
          <video
            ref={videoRef}
            src={mediaUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            style={{
              display: 'none',
            }}
          />
        )}
      </div>

      {/* Under-canvas Toolbar */}
      {mediaUrl && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            background: 'rgba(9, 9, 9, 0.6)',
            border: '1px solid var(--color-steel-accent)',
            padding: '12px 20px',
            borderRadius: 'var(--radius-smallwidgets)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={handleTogglePlay}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--color-deep-violet)',
                color: 'var(--color-cloud-whisper)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" />}
            </button>
            
            <span style={{ fontSize: '14px', color: 'var(--color-slate-hint)' }}>
              {mediaType === 'video' ? '📺 Background Video' : '🎵 Audio Track'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  setCurrentTime(0);
                }
              }}
              style={{
                background: 'rgba(247, 249, 250, 0.08)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 'var(--radius-buttons)',
                color: 'var(--color-cloud-whisper)',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={12} />
              <span>Restart</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
