import React, { useCallback } from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import type { MediaTrack } from '../../context/KaraokeContext';

interface UseTrackDragProps {
  zoom: number;
}

export const useTrackDrag = ({ zoom }: UseTrackDragProps) => {
  const { updateTrackOffset, currentTime } = useKaraoke();

  const handleTrackDrag = useCallback((
    e: React.MouseEvent,
    track: MediaTrack
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const initialOffset = track.offset;
    const snapTolerancePx = 10; // Pixel radius for snapping
    const snapToleranceSeconds = snapTolerancePx / zoom;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaTime = deltaX / zoom;
      let targetOffset = initialOffset + deltaTime;

      // Smart Snapping Logic
      // 1. Snap to Active Playhead (currentTime)
      if (Math.abs(targetOffset - currentTime) < snapToleranceSeconds) {
        targetOffset = currentTime;
      }
      // 2. Snap to Integer Seconds Grid
      else {
        const roundedSec = Math.round(targetOffset);
        if (Math.abs(targetOffset - roundedSec) < snapToleranceSeconds) {
          targetOffset = roundedSec;
        }
      }

      // Clamp so track offset is never below 0s
      updateTrackOffset(track.id, Math.max(0, targetOffset));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [zoom, currentTime, updateTrackOffset]);

  return {
    handleTrackDrag,
  };
};
