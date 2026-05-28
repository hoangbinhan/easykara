/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { useKaraokeStore } from '../store/useKaraokeStore';

import type { KaraokeStoreState } from '../store/types';

export interface Syllable {
  id: string;
  text: string;
  startTime: number | null; // in seconds
  endTime: number | null;   // in seconds
}

export interface Line {
  id: string;
  text: string;
  syllables: Syllable[];
  startTime: number | null;
  endTime: number | null;
}

export interface StyleConfig {
  fontFamily: string;
  fontSize: number;
  fillColor: string;
  activeColor: string;
  strokeColor: string;
  strokeWidth: number;
  alignment: 'center' | 'left' | 'right';
  layoutMode: 'traditional' | 'subtitles' | 'classic-2line';
  bgType: 'color' | 'image' | 'video' | 'visuals';
  bgColor: string;
  bgImage: string | null;
  bgVideo: string | null;
  shadowColor: string;
  shadowBlur: number;
}

export interface MediaTrack {
  id: string;
  name: string;
  url: string;
  type: 'audio' | 'video';
  volume: number; // 0 to 1
  offset: number; // in seconds
  duration: number; // in seconds
  waveformData?: {
    peaks: number[];
    duration: number;
    sampleRate: number;
    multiRes?: import('../utils/peakCache').MultiResPeaks | null;
  } | null;
  isMuted?: boolean;
  isSoloed?: boolean;
}

export interface KaraokeState {
  lyricsInput: string;
  lines: Line[];
  currentLineIndex: number;
  currentSyllableIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  mediaUrl: string | null;
  mediaType: 'audio' | 'video' | null;
  mediaName: string | null;
  isRecording: boolean;
  styleConfig: StyleConfig;
  tracks: MediaTrack[];
}

export const KaraokeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export function useKaraoke<T = KaraokeStoreState & { canUndo: boolean; canRedo: boolean }>(
  selector?: (state: KaraokeStoreState & { canUndo: boolean; canRedo: boolean }) => T
): T {
  // Use React state to trigger render only when selected slice actually changes shallowly
  const [slice, setSlice] = React.useState<T>(() => {
    const state = useKaraokeStore.getState();
    const extendedState = {
      ...state,
      canUndo: state.undoStack.length > 0,
      canRedo: state.redoStack.length > 0,
    };
    if (selector) return selector(extendedState);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { currentTime, ...rest } = extendedState;
    return rest as unknown as T;
  });

  const selectorRef = React.useRef(selector);
  const sliceRef = React.useRef(slice);

  // Safely update refs outside of render phase to comply with React 19/ESLint rules
  React.useEffect(() => {
    selectorRef.current = selector;
    sliceRef.current = slice;
  });

  React.useEffect(() => {
    // Subscribe using Zustand's subscribeWithSelector option + custom equality function
    const unsubscribe = useKaraokeStore.subscribe(
      (state) => {
        const extendedState = {
          ...state,
          canUndo: state.undoStack.length > 0,
          canRedo: state.redoStack.length > 0,
        };
        const currentSelector = selectorRef.current;
        if (currentSelector) {
          return currentSelector(extendedState);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { currentTime, ...rest } = extendedState;
        return rest as unknown as T;
      },
      (newSlice) => {
        if (!shallowEqual(sliceRef.current, newSlice)) {
          setSlice(newSlice);
        }
      },
      {
        equalityFn: (a, b) => shallowEqual(a, b),
        fireImmediately: true
      }
    );

    return unsubscribe;
  }, []);

  if (selector) {
    return slice;
  }

  return {
    ...slice,
    currentTime: useKaraokeStore.getState().currentTime,
  } as unknown as T;
}

function shallowEqual(objA: unknown, objB: unknown): boolean {
  if (Object.is(objA, objB)) return true;
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }
  const keysA = Object.keys(objA as Record<string, unknown>);
  const keysB = Object.keys(objB as Record<string, unknown>);
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      !Object.is((objA as Record<string, unknown>)[key], (objB as Record<string, unknown>)[key])
    ) {
      return false;
    }
  }
  return true;
}

