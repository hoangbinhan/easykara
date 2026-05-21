import React from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { Film, Video, Disc } from 'lucide-react';
import { useVideoRecorder } from './useVideoRecorder';

interface VideoRecorderProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isSyncReady: boolean;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ videoRef, isSyncReady }) => {
  const { mediaUrl } = useKaraoke();
  const {
    isRecordingVideo,
    recordProgress,
    handleStartRecording,
    handleStopRecordingVideo,
  } = useVideoRecorder({ videoRef, mediaUrl });

  return (
    <div
      style={{
        border: '1px solid var(--color-steel-accent)',
        background: 'rgba(9, 9, 9, 0.4)',
        borderRadius: 'var(--radius-smallwidgets)',
        padding: '12px',
        marginTop: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-deep-violet)', fontWeight: 700 }}>
        <Film size={14} className="brand-icon" />
        <span>Export to Video File (.webm)</span>
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
        Record the live karaoke canvas and merge it with the source audio to download a video directly from your browser!
      </p>

      {!isRecordingVideo ? (
        <button
          onClick={handleStartRecording}
          disabled={!isSyncReady || !mediaUrl}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: 'var(--radius-buttons)',
            background: isSyncReady && mediaUrl ? 'var(--color-deep-violet)' : 'rgba(255,255,255,0.05)',
            color: isSyncReady && mediaUrl ? 'var(--color-cloud-whisper)' : 'rgba(255,255,255,0.3)',
            fontWeight: 700,
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: isSyncReady && mediaUrl ? 'pointer' : 'not-allowed',
            opacity: isSyncReady && mediaUrl ? 1 : 0.5,
            boxShadow: isSyncReady && mediaUrl ? '0 0 12px rgba(175, 80, 255, 0.3)' : 'none',
          }}
        >
          <Video size={14} />
          <span>Record Karaoke Video</span>
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-deep-violet)' }}>
              <Disc size={12} className="glow-pulse" style={{ color: 'var(--color-deep-violet)', animationDuration: '1s' }} />
              Recording video...
            </span>
            <span>{recordProgress}%</span>
          </div>
          <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${recordProgress}%`, background: 'var(--color-deep-violet)', transition: 'width 0.2s ease' }} />
          </div>

          <button
            onClick={handleStopRecordingVideo}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: 'var(--radius-buttons)',
              background: 'var(--danger)',
              color: 'white',
              fontWeight: 600,
              fontSize: '11px',
            }}
          >
            Stop & Save Video Now
          </button>
        </div>
      )}
    </div>
  );
};
