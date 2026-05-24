/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { useKaraokeStore } from '../store/useKaraokeStore';

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

export const useKaraoke = () => {
  const store = useKaraokeStore();
  
  return {
    ...store,
    canUndo: store.undoStack.length > 0,
    canRedo: store.redoStack.length > 0,
  };
};
