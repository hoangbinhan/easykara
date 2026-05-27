import React, { useEffect } from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { CanvasPlayer } from './CanvasPlayer';
import { MultiTrackAudioEngine } from './MultiTrackAudioEngine';

interface KaraokePreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export const KaraokePreview: React.FC<KaraokePreviewProps> = ({ videoRef }) => {
  const {
    lines,
    isPlaying,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    mediaUrl,
    mediaType,
    styleConfig,
    tracks,
  } = useKaraoke(
    React.useCallback(
      (state) => ({
        lines: state.lines,
        isPlaying: state.isPlaying,
        setIsPlaying: state.setIsPlaying,
        setCurrentTime: state.setCurrentTime,
        setDuration: state.setDuration,
        mediaUrl: state.mediaUrl,
        mediaType: state.mediaType,
        styleConfig: state.styleConfig,
        tracks: state.tracks,
      }),
      []
    )
  );

  const { t } = useLanguage();

  // Synchronize master video element volume, Mute, and Solo states
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const masterTrack = tracks.find(t => t.url === mediaUrl);
    if (masterTrack) {
      const hasSoloActive = tracks.some(t => t.isSoloed);
      const isSilenced = !!(masterTrack.isMuted || (hasSoloActive && !masterTrack.isSoloed));
      
      video.muted = isSilenced;
      video.volume = isSilenced ? 0 : masterTrack.volume;
    }
  }, [tracks, mediaUrl, videoRef]);

  // High-precision 60fps clock updater driven by requestAnimationFrame during active playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    let animationId: number;

    const updateClock = () => {
      if (video && !video.paused) {
        setCurrentTime(video.currentTime);
      }
      animationId = requestAnimationFrame(updateClock);
    };

    animationId = requestAnimationFrame(updateClock);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, setCurrentTime, videoRef]);

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
    <div className="flex flex-col items-center gap-3 w-full max-w-[720px]">
      {/* Real-time Render Canvas */}
      <div className="w-full aspect-video overflow-hidden relative bg-blackout border border-graphite-light rounded-[4px]">
        <CanvasPlayer
          videoRef={videoRef}
          lines={lines}
          mediaType={mediaType}
          styleConfig={styleConfig}
          isPlaying={isPlaying}
        />

        {/* Dynamic Multi-track Audio Playback Sync */}
        <MultiTrackAudioEngine />

        {/* Unified video player (Natively renders background when selected) */}
        {mediaUrl && (
          <video
            ref={videoRef}
            src={mediaUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            className={
              styleConfig.bgType === 'video' && mediaType === 'video'
                ? "absolute inset-0 w-full h-full object-cover z-0 opacity-100 pointer-events-none"
                : "absolute inset-0 opacity-0 pointer-events-none z-0"
            }
          />
        )}
      </div>

      {/* Under-canvas Toolbar */}
      {mediaUrl && (
        <div className="flex justify-between items-center w-full bg-graphite-deep border border-graphite-light px-5 py-3 rounded-[4px]">
          <div className="flex items-center gap-3.5">
            <button
              onClick={handleTogglePlay}
              className="w-9 h-9 rounded-full bg-whiteout hover:bg-cloud text-graphite-deep flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
            </button>
            
            <span className="text-sm text-ash font-sans font-medium">
              {mediaType === 'video' ? `📺 ${t('preview.videoLabel')}` : `🎵 ${t('preview.audioLabel')}`}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  setCurrentTime(0);
                }
              }}
              className="px-4 py-2 bg-graphite hover:bg-graphite-light text-whiteout font-sans text-xs font-semibold rounded-full border border-graphite-light hover:border-whiteout transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>{t('preview.btnRestart')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
