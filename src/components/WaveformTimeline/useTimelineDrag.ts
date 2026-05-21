import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Syllable } from '../../context/KaraokeContext';

interface UseTimelineDragProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  setCurrentTime: (time: number) => void;
  updateSyllableTime: (lineIdx: number, sylIdx: number, start: number, end: number) => void;
  updateSyllableText: (lineIdx: number, sylIdx: number, text: string) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export const useTimelineDrag = ({
  currentTime,
  duration,
  isPlaying,
  setCurrentTime,
  updateSyllableTime,
  updateSyllableText,
  audioRef,
}: UseTimelineDragProps) => {
  const [zoom, setZoom] = useState<number>(60);
  const [scrollLeft, setScrollLeft] = useState<number>(0);
  const [editingSyl, setEditingSyl] = useState<{ lineIdx: number; sylIdx: number; text: string } | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(container);
    setContainerWidth(container.clientWidth);

    return () => resizeObserver.disconnect();
  }, []);

  const handleZoomIn = () => setZoom((z) => Math.min(240, z + 30));
  const handleZoomOut = () => setZoom((z) => Math.max(20, z - 30));

  useEffect(() => {
    if (!isPlaying || !containerRef.current) return;
    
    const container = containerRef.current;
    const playheadPos = currentTime * zoom;
    const halfWidth = container.clientWidth / 2;
    
    const currentScroll = container.scrollLeft;
    if (playheadPos > currentScroll + halfWidth + 100 || playheadPos < currentScroll + 100) {
      container.scrollLeft = Math.max(0, playheadPos - halfWidth);
    }
  }, [currentTime, zoom, isPlaying]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current || !audioRef.current || duration === 0) return;
    
    const target = e.target as HTMLElement;
    if (!target.classList.contains('timeline-scrollable') && !target.classList.contains('waveform-canvas')) {
      return;
    }
    
    const rect = scrollRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const time = clickX / zoom;
    
    const targetTime = Math.max(0, Math.min(duration, time));
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleBlockDrag = useCallback((
    e: React.MouseEvent,
    lineIdx: number,
    sylIdx: number,
    syl: Syllable,
    type: 'move' | 'resize-start' | 'resize-end'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    
    const startX = e.clientX;
    const initialStart = syl.startTime || 0;
    const initialEnd = syl.endTime || 0;
    const initialDur = initialEnd - initialStart;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaTime = deltaX / zoom;
      
      let newStart = initialStart;
      let newEnd = initialEnd;

      if (type === 'move') {
        newStart = Math.max(0, initialStart + deltaTime);
        newEnd = newStart + initialDur;
      } else if (type === 'resize-start') {
        newStart = Math.max(0, Math.min(initialEnd - 0.05, initialStart + deltaTime));
      } else if (type === 'resize-end') {
        newEnd = Math.max(initialStart + 0.05, initialEnd + deltaTime);
      }

      updateSyllableTime(lineIdx, sylIdx, newStart, newEnd);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [zoom, updateSyllableTime]);

  const handleEditClick = useCallback((lineIdx: number, sylIdx: number, syl: Syllable, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSyl({ lineIdx, sylIdx, text: syl.text });
  }, []);

  const handleSaveEdit = () => {
    if (editingSyl) {
      updateSyllableText(editingSyl.lineIdx, editingSyl.sylIdx, editingSyl.text);
      setEditingSyl(null);
    }
  };

  return {
    zoom,
    scrollLeft,
    editingSyl,
    setEditingSyl,
    containerWidth,
    containerRef,
    scrollRef,
    canvasRef,
    handleZoomIn,
    handleZoomOut,
    handleScroll,
    handleTimelineClick,
    handleBlockDrag,
    handleEditClick,
    handleSaveEdit,
  };
};
