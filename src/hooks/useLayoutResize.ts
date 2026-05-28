import { useState, useCallback } from 'react';

export const useLayoutResize = () => {
  const [leftWidth, setLeftWidth] = useState<number>(() => {
    const saved = localStorage.getItem('easykara-layout-left');
    return saved ? parseInt(saved, 10) : 340;
  });
  const [rightWidth, setRightWidth] = useState<number>(() => {
    const saved = localStorage.getItem('easykara-layout-right');
    return saved ? parseInt(saved, 10) : 360;
  });
  const [timelineHeight, setTimelineHeight] = useState<number>(() => {
    const saved = localStorage.getItem('easykara-layout-timeline');
    return saved ? parseInt(saved, 10) : 160;
  });

  const [isDraggingLeft, setIsDraggingLeft] = useState<boolean>(false);
  const [isDraggingRight, setIsDraggingRight] = useState<boolean>(false);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState<boolean>(false);

  const startResizeLeft = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDraggingLeft(true);

      let finalWidth = leftWidth;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        // Clamp left sidebar width between 250px and 600px
        finalWidth = Math.max(250, Math.min(600, moveEvent.clientX));
        setLeftWidth(finalWidth);
      };

      const handleMouseUp = () => {
        setIsDraggingLeft(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        localStorage.setItem('easykara-layout-left', finalWidth.toString());
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [leftWidth]
  );

  const startResizeRight = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDraggingRight(true);

      let finalWidth = rightWidth;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        // Clamp right sidebar width between 250px and 600px
        finalWidth = Math.max(250, Math.min(600, window.innerWidth - moveEvent.clientX));
        setRightWidth(finalWidth);
      };

      const handleMouseUp = () => {
        setIsDraggingRight(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        localStorage.setItem('easykara-layout-right', finalWidth.toString());
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [rightWidth]
  );

  const startResizeTimeline = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDraggingTimeline(true);

      let finalHeight = timelineHeight;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        // Clamp bottom timeline height between 120px and 450px
        finalHeight = Math.max(120, Math.min(450, window.innerHeight - moveEvent.clientY));
        setTimelineHeight(finalHeight);
      };

      const handleMouseUp = () => {
        setIsDraggingTimeline(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        localStorage.setItem('easykara-layout-timeline', finalHeight.toString());
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [timelineHeight]
  );

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
