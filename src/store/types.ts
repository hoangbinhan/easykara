import type { Line, StyleConfig, MediaTrack } from '../context/KaraokeContext';
import type { WaveformData } from '../hooks/useAudioAnalyzer';

export interface HistoryEntry {
  lines: Line[];
  currentLineIndex: number;
  currentSyllableIndex: number;
}

export interface TracksSlice {
  tracks: MediaTrack[];
  mediaUrl: string | null;
  mediaType: 'audio' | 'video' | null;
  mediaName: string | null;
  cachedPeaks: Record<string, WaveformData>;
  cachePeaks: (key: string, data: WaveformData) => void;
  updateTrackWaveformData: (id: string, waveformData: WaveformData) => void;
  addTrack: (file: File, waveformData?: MediaTrack['waveformData']) => Promise<void>;
  removeTrack: (id: string) => void;
  updateTrackOffset: (id: string, offset: number) => void;
  updateTrackVolume: (id: string, volume: number) => void;
  toggleMuteTrack: (id: string) => void;
  toggleSoloTrack: (id: string) => void;
  loadMedia: (file: File) => Promise<void>;
  clearMedia: () => void;
  syncMasterTrack: (updatedTracks: MediaTrack[]) => void;
}

export interface TimelineSlice {
  lyricsInput: string;
  lines: Line[];
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
  setLyricsInput: (input: string) => void;
  parseLyrics: (input: string) => void;
  setLines: (lines: Line[]) => void;
  updateSyllableTime: (lineIdx: number, sylIdx: number, start: number | null, end: number | null) => void;
  updateSyllableText: (lineIdx: number, sylIdx: number, text: string) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: (currentLines: Line[], lineIdx: number, sylIdx: number) => void;
}

export interface SyncSlice {
  currentLineIndex: number;
  currentSyllableIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isRecording: boolean;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  setIsRecording: (recording: boolean) => void;
  startSyllableSync: (time: number) => void;
  endSyllableSync: (time: number) => void;
  resetSync: () => void;
  jumpToSyllable: (lineIdx: number, sylIdx: number) => void;
}

export interface StyleSlice {
  styleConfig: StyleConfig;
  updateStyleConfig: (config: Partial<StyleConfig>) => void;
}

export type KaraokeStoreState = TracksSlice & TimelineSlice & SyncSlice & StyleSlice;
