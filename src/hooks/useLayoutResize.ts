import { useState, useCallback } from 'react';

export const useLayoutResize = () => {
  const [leftWidth, setLeftWidth] = useState<number>(340);
  const [rightWidth, setRightWidth] = useState<number>(360);
  const [timelineHeight, setTimelineHeight] = useState<number>(160);

  const [isDraggingLeft, setIsDraggingLeft] = useState<boolean>(false);
  const [isDraggingRight, setIsDraggingRight] = useState<boolean>(false);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState<boolean>(false);

  const startResizeLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingLeft(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Clamp left sidebar width between 250px and 600px
      const newWidth = Math.max(250, Math.min(600, moveEvent.clientX));
      setLeftWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  const startResizeRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingRight(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Clamp right sidebar width between 250px and 600px
      const newWidth = Math.max(250, Math.min(600, window.innerWidth - moveEvent.clientX));
      setRightWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDraggingRight(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  const startResizeTimeline = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingTimeline(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Clamp bottom timeline height between 120px and 450px
      const newHeight = Math.max(120, Math.min(450, window.innerHeight - moveEvent.clientY));
      setTimelineHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDraggingTimeline(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  return {
    leftWidth,
    rightWidth,
    timelineHeight,
    isDraggingLeft,
    isDraggingRight,
    isDraggingTimeline,
    startResizeLeft,
    startResizeRight,
    startResizeTimeline,
  };
};
