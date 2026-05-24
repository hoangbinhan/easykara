import React, { useEffect, useRef } from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import type { MediaTrack } from '../../context/KaraokeContext';

interface SecondaryPlayerProps {
  track: MediaTrack;
  isPlaying: boolean;
  masterTime: number;
  hasSoloActive: boolean;
}

const SecondaryAudioPlayer: React.FC<SecondaryPlayerProps> = ({
  track,
  isPlaying,
  masterTime,
  hasSoloActive,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Compute if this track should be active at the current playhead
  const relativeTime = masterTime - track.offset;
  const isActive = relativeTime >= 0 && relativeTime < track.duration;

  // Track is silenced if it's muted OR if another track has Solo active and this track is not soloed
  const isSilenced = track.isMuted || (hasSoloActive && !track.isSoloed);

  // Sync Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isSilenced ? 0 : track.volume;
    }
  }, [track.volume, isSilenced]);

  // Sync Playback and Seeking
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && isActive) {
      // Seek if desynchronized by more than 100ms
      const diff = Math.abs(audio.currentTime - relativeTime);
      if (diff > 0.1) {
        audio.currentTime = relativeTime;
      }
      
      if (audio.paused) {
        audio.play().catch(err => console.error('Audio play failed:', err));
      }
    } else {
      if (!audio.paused) {
        audio.pause();
      }
      
      // Reset playhead if timeline is scrolled back before the track start
      if (relativeTime < 0 && audio.currentTime !== 0) {
        audio.currentTime = 0;
      }
    }
  }, [isPlaying, isActive, relativeTime, isSilenced]);

  return (
    <audio
      ref={audioRef}
      src={track.url}
      preload="auto"
      className="hidden"
    />
  );
};

export const MultiTrackAudioEngine: React.FC = () => {
  const { tracks, isPlaying, currentTime, mediaUrl } = useKaraoke();

  // Secondary tracks are tracks that are not acting as the master clock
  const secondaryTracks = tracks.filter(t => t.url !== mediaUrl);
  const hasSoloActive = tracks.some(t => t.isSoloed);

  return (
    <>
      {secondaryTracks.map(track => (
        <SecondaryAudioPlayer
          key={track.id}
          track={track}
          isPlaying={isPlaying}
          masterTime={currentTime}
          hasSoloActive={hasSoloActive}
        />
      ))}
    </>
  );
};
