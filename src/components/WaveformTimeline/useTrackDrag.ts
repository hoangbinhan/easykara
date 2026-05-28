import React, { useCallback } from 'react';
import { useKaraoke } from '../../context/KaraokeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useKaraokeStore } from '../../store/useKaraokeStore';
import type { MediaTrack } from '../../context/KaraokeContext';

interface UseTrackDragProps {
  zoom: number;
}

export const useTrackDrag = ({ zoom }: UseTrackDragProps) => {
  const updateTrackOffset = useKaraoke(useCallback((state) => state.updateTrackOffset, []));
  const { t } = useLanguage();

  const handleTrackDrag = useCallback(
    (e: React.MouseEvent, track: MediaTrack) => {
      e.stopPropagation();
      e.preventDefault();

      const startX = e.clientX;
      const initialOffset = track.offset;
      const snapTolerancePx = 10; // Pixel radius for snapping
      const snapToleranceSeconds = snapTolerancePx / zoom;
      const blockElement = e.currentTarget as HTMLElement;
      const textSpan = blockElement.querySelector('.track-offset-text') as HTMLElement;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaTime = deltaX / zoom;
        let targetOffset = initialOffset + deltaTime;

        // Smart Snapping Logic
        const currentTime = useKaraokeStore.getState().currentTime;
        if (Math.abs(targetOffset - currentTime) < snapToleranceSeconds) {
          targetOffset = currentTime;
        } else {
          const roundedSec = Math.round(targetOffset);
          if (Math.abs(targetOffset - roundedSec) < snapToleranceSeconds) {
            targetOffset = roundedSec;
          }
        }

        const clampedOffset = Math.max(0, targetOffset);

        // Perform Direct DOM updates to bypass React re-renders at 60fps
        blockElement.style.left = `${clampedOffset * zoom}px`;
        if (textSpan) {
          textSpan.textContent = `${track.duration.toFixed(1)}s (${t('timeline.offset')}: ${clampedOffset.toFixed(2)}s)`;
        }
      };

      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);

        // Pull the final position from the DOM styled properties to fire a single React state sync
        const finalLeftPx = parseFloat(blockElement.style.left);
        const finalOffset = finalLeftPx / zoom;
        updateTrackOffset(track.id, finalOffset);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [zoom, updateTrackOffset, t]
  );

  return {
    handleTrackDrag,
  };
};
