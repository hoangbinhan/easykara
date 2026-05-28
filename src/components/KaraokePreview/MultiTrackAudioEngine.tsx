import React, { useEffect, useRef } from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import type { MediaTrack } from '../../context/KaraokeContext';
import { useKaraokeStore } from '../../store/useKaraokeStore';

interface SecondaryPlayerProps {
  track: MediaTrack;
}

const SecondaryAudioPlayer: React.FC<SecondaryPlayerProps> = React.memo(({ track }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Initial sync of volume based on mute/solo status
    const initialTracks = useKaraokeStore.getState().tracks;
    const hasSoloActive = initialTracks.some(t => t.isSoloed);
    const isSilenced = track.isMuted || (hasSoloActive && !track.isSoloed);
    audio.volume = isSilenced ? 0 : track.volume;

    // Direct high-frequency subscription using Zustand selector + equalityFn
    const unsubscribe = useKaraokeStore.subscribe(
      (state) => ({
        currentTime: state.currentTime,
        isPlaying: state.isPlaying,
        tracks: state.tracks,
      }),
      ({ currentTime, isPlaying, tracks }) => {
        const audio = audioRef.current;
        if (!audio) return;

        // Extract fresh settings for this specific track from the store array
        const currentTrackState = tracks.find(t => t.id === track.id) || track;
        const activeTracksSolo = tracks.some(t => t.isSoloed);
        const trackSilenced = currentTrackState.isMuted || (activeTracksSolo && !currentTrackState.isSoloed);

        audio.volume = trackSilenced ? 0 : currentTrackState.volume;

        const relativeTime = currentTime - currentTrackState.offset;
        const isActive = relativeTime >= 0 && relativeTime < currentTrackState.duration;

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
      },
      {
        equalityFn: (a, b) => 
          a.currentTime === b.currentTime && 
          a.isPlaying === b.isPlaying &&
          JSON.stringify(a.tracks.map(t => ({ id: t.id, volume: t.volume, isMuted: t.isMuted, isSoloed: t.isSoloed }))) ===
          JSON.stringify(b.tracks.map(t => ({ id: t.id, volume: t.volume, isMuted: t.isMuted, isSoloed: t.isSoloed })))
      }
    );

    return () => {
      unsubscribe();
    };
  }, [track.id, track.offset, track.duration, track.volume, track.isMuted, track]);

  return (
    <audio
      ref={audioRef}
      src={track.url}
      preload="auto"
      className="hidden"
    />
  );
});

SecondaryAudioPlayer.displayName = 'SecondaryAudioPlayer';

export const MultiTrackAudioEngine: React.FC = () => {
  const { tracks, mediaUrl } = useKaraoke(
    React.useCallback(
      (state) => ({
        tracks: state.tracks,
        mediaUrl: state.mediaUrl,
      }),
      []
    )
  );

  // Secondary tracks are tracks that are not acting as the master clock
  const secondaryTracks = tracks.filter(t => t.url !== mediaUrl);

  return (
    <>
      {secondaryTracks.map(track => (
        <SecondaryAudioPlayer
          key={track.id}
          track={track}
        />
      ))}
    </>
  );
};

