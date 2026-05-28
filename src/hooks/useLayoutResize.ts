import { useState, useCallback } from 'react';

// ============================================================================
// Layout Dimension Defaults (Magic Numbers Avoidance)
// ============================================================================
const DEFAULT_LEFT_WIDTH = 340;
const DEFAULT_RIGHT_WIDTH = 360;
const DEFAULT_TIMELINE_HEIGHT = 160;

// ============================================================================
// Layout Boundary Constraints (Magic Numbers Avoidance)
// ============================================================================
const MIN_SIDEBAR_WIDTH = 250;
const MAX_SIDEBAR_WIDTH = 600;
const MIN_TIMELINE_HEIGHT = 120;
const MAX_TIMELINE_HEIGHT = 450;

// ============================================================================
// Local Storage Keys for Persistent Layout State (Magic Strings Avoidance)
// ============================================================================
const STORAGE_KEY_LEFT_WIDTH = 'easykara-layout-left';
const STORAGE_KEY_RIGHT_WIDTH = 'easykara-layout-right';
const STORAGE_KEY_TIMELINE_HEIGHT = 'easykara-layout-timeline';

// Numeric decimal base radix (Magic Numbers Avoidance)
const RADIX_DECIMAL = 10;

/**
 * Custom hook to manage responsive sidebar and timeline panel resizing.
 * Utilizes persistent localStorage state with a zero-FOUC (Flash of Unstyled Content) design.
 */
export const useLayoutResize = () => {
  // --------------------------------------------------------------------------
  // Synchronous State Initialization (Zero-FOUC Technique)
  // --------------------------------------------------------------------------
  // Reading localStorage synchronously inside useState callbacks ensures that React
  // renders the component with saved custom layout sizes immediately during the initial mount phase.
  // This completely eliminates visual popping or sidebar jumping (FOUC) during load.

  const [leftWidth, setLeftWidth] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LEFT_WIDTH);
    return saved ? parseInt(saved, RADIX_DECIMAL) : DEFAULT_LEFT_WIDTH;
  });

  const [rightWidth, setRightWidth] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RIGHT_WIDTH);
    return saved ? parseInt(saved, RADIX_DECIMAL) : DEFAULT_RIGHT_WIDTH;
  });

  const [timelineHeight, setTimelineHeight] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TIMELINE_HEIGHT);
    return saved ? parseInt(saved, RADIX_DECIMAL) : DEFAULT_TIMELINE_HEIGHT;
  });

  const [isDraggingLeft, setIsDraggingLeft] = useState<boolean>(false);
  const [isDraggingRight, setIsDraggingRight] = useState<boolean>(false);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // Left Sidebar Drag Handlers
  // --------------------------------------------------------------------------
  const startResizeLeft = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDraggingLeft(true);

      // Captured variable to hold latest position during drag stream
      let finalWidth = leftWidth;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        // Clamp left sidebar width within min/max boundaries
        finalWidth = Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, moveEvent.clientX));
        setLeftWidth(finalWidth);
      };

      const handleMouseUp = () => {
        setIsDraggingLeft(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        // Persist final size to localStorage exactly once on mouseUp to keep 60 FPS dragging jank-free
        localStorage.setItem(STORAGE_KEY_LEFT_WIDTH, finalWidth.toString());
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [leftWidth]
  );

  // --------------------------------------------------------------------------
  // Right Sidebar Drag Handlers
  // --------------------------------------------------------------------------
  const startResizeRight = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDraggingRight(true);

      // Captured variable to hold latest position during drag stream
      let finalWidth = rightWidth;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        // Clamp right sidebar width within min/max boundaries based on viewport width
        finalWidth = Math.max(
          MIN_SIDEBAR_WIDTH,
          Math.min(MAX_SIDEBAR_WIDTH, window.innerWidth - moveEvent.clientX)
        );
        setRightWidth(finalWidth);
      };

      const handleMouseUp = () => {
        setIsDraggingRight(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        // Persist final size to localStorage exactly once on mouseUp to keep 60 FPS dragging jank-free
        localStorage.setItem(STORAGE_KEY_RIGHT_WIDTH, finalWidth.toString());
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [rightWidth]
  );

  // --------------------------------------------------------------------------
  // Bottom Timeline Panel Drag Handlers
  // --------------------------------------------------------------------------
  const startResizeTimeline = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDraggingTimeline(true);

      // Captured variable to hold latest position during drag stream
      let finalHeight = timelineHeight;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        // Clamp bottom timeline height within boundaries based on viewport height
        finalHeight = Math.max(
          MIN_TIMELINE_HEIGHT,
          Math.min(MAX_TIMELINE_HEIGHT, window.innerHeight - moveEvent.clientY)
        );
        setTimelineHeight(finalHeight);
      };

      const handleMouseUp = () => {
        setIsDraggingTimeline(false);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        // Persist final size to localStorage exactly once on mouseUp to keep 60 FPS dragging jank-free
        localStorage.setItem(STORAGE_KEY_TIMELINE_HEIGHT, finalHeight.toString());
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
