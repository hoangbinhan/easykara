/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';

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
  waveformData?: { peaks: number[] } | null;
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

interface HistoryEntry {
  lines: Line[];
  currentLineIndex: number;
  currentSyllableIndex: number;
}

interface KaraokeContextType extends KaraokeState {
  setLyricsInput: (input: string) => void;
  parseLyrics: (input: string) => void;
  setLines: (lines: Line[]) => void;
  setCurrentLineIndex: (idx: number) => void;
  setCurrentSyllableIndex: (idx: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  loadMedia: (file: File) => void;
  clearMedia: () => void;
  setIsRecording: (recording: boolean) => void;
  updateStyleConfig: (config: Partial<StyleConfig>) => void;

  // Multi-Track actions
  addTrack: (file: File, waveformData?: { peaks: number[]; duration: number } | null) => void;
  removeTrack: (id: string) => void;
  updateTrackOffset: (id: string, offset: number) => void;
  updateTrackVolume: (id: string, volume: number) => void;
  toggleMuteTrack: (id: string) => void;
  toggleSoloTrack: (id: string) => void;
  
  // Sync Actions
  startSyllableSync: (time: number) => void;
  endSyllableSync: (time: number) => void;
  resetSync: () => void;
  jumpToSyllable: (lineIdx: number, sylIdx: number) => void;
  updateSyllableTime: (lineIdx: number, sylIdx: number, start: number | null, end: number | null) => void;
  updateSyllableText: (lineIdx: number, sylIdx: number, text: string) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const defaultStyle: StyleConfig = {
  fontFamily: 'Montserrat',
  fontSize: 42,
  fillColor: '#f7f9fa', // Cloud Whisper
  activeColor: '#af50ff', // Deep Violet
  strokeColor: '#090909', // Midnight Eclipse
  strokeWidth: 6,
  alignment: 'center',
  layoutMode: 'classic-2line',
  bgType: 'color',
  bgColor: '#090909', // Midnight Eclipse
  bgImage: null,
  bgVideo: null,
  shadowColor: 'rgba(0, 0, 0, 0.6)',
  shadowBlur: 10,
};

const parseLyricsText = (input: string): Line[] => {
  const rawLines = input.split('\n');
  return rawLines
    .map((lineText, lIdx) => {
      const trimmed = lineText.trim();
      if (!trimmed) return null;
      
      // Split by whitespaces to get words/syllables
      const words = trimmed.split(/\s+/);
      const syllables: Syllable[] = words.map((word, sIdx) => ({
        id: `syl-${lIdx}-${sIdx}-${Math.random().toString(36).substr(2, 9)}`,
        text: word,
        startTime: null,
        endTime: null,
      }));
      
      return {
        id: `line-${lIdx}-${Math.random().toString(36).substr(2, 9)}`,
        text: trimmed,
        syllables,
        startTime: null,
        endTime: null,
      } as Line;
    })
    .filter((item): item is Line => item !== null);
};

const KaraokeContext = createContext<KaraokeContextType | undefined>(undefined);

export const KaraokeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lyricsInput, setLyricsInputState] = useState<string>(
    'Create custom karaoke videos manually\nSync syllables instantly using spacebar\nBreathtaking celestial tech UI design\nExport subtitle files and premium lyrics'
  );
  const [lines, setLinesState] = useState<Line[]>(() => parseLyricsText(lyricsInput));
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'audio' | 'video' | null>(null);
  const [mediaName, setMediaName] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(defaultStyle);
  const [tracks, setTracks] = useState<MediaTrack[]>([]);
  
  // Undo/Redo Stacks
  const [undoStack, setUndoStack] = useState<HistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryEntry[]>([]);
  
  // Save history state
  const pushHistory = useCallback((currentLines: Line[], lineIdx: number, sylIdx: number) => {
    // Clone lines deeply
    const clonedLines = JSON.parse(JSON.stringify(currentLines));
    setUndoStack(prev => [...prev, { lines: clonedLines, currentLineIndex: lineIdx, currentSyllableIndex: sylIdx }]);
    setRedoStack([]); // Clear redo stack on new action
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    const previous = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    
    // Save current state to redo
    const currentCloned = JSON.parse(JSON.stringify(lines));
    setRedoStack(prev => [...prev, { lines: currentCloned, currentLineIndex, currentSyllableIndex }]);
    
    setLinesState(previous.lines);
    setCurrentLineIndex(previous.currentLineIndex);
    setCurrentSyllableIndex(previous.currentSyllableIndex);
  }, [undoStack, lines, currentLineIndex, currentSyllableIndex]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const next = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    
    // Save current state to undo
    const currentCloned = JSON.parse(JSON.stringify(lines));
    setUndoStack(prev => [...prev, { lines: currentCloned, currentLineIndex, currentSyllableIndex }]);
    
    setLinesState(next.lines);
    setCurrentLineIndex(next.currentLineIndex);
    setCurrentSyllableIndex(next.currentSyllableIndex);
  }, [redoStack, lines, currentLineIndex, currentSyllableIndex]);

  // Parse raw text into structured syllables
  const parseLyrics = useCallback((input: string) => {
    const parsed = parseLyricsText(input);
    setLinesState(parsed);
    setCurrentLineIndex(0);
    setCurrentSyllableIndex(0);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  const setLyricsInput = (input: string) => {
    setLyricsInputState(input);
    const parsed = parseLyricsText(input);
    setLinesState(parsed);
    setCurrentLineIndex(0);
    setCurrentSyllableIndex(0);
    setUndoStack([]);
    setRedoStack([]);
  };

  const setLines = (newLines: Line[]) => {
    pushHistory(lines, currentLineIndex, currentSyllableIndex);
    setLinesState(newLines);
  };

  // Helper to synchronize master track attributes when track collection changes
  const syncMasterTrack = (updatedTracks: MediaTrack[]) => {
    setTracks(updatedTracks);
    
    if (updatedTracks.length === 0) {
      setMediaUrl(null);
      setMediaType(null);
      setMediaName(null);
      setDuration(0);
      setStyleConfig(prev => ({
        ...prev,
        bgType: prev.bgType === 'video' ? 'color' : prev.bgType,
        bgVideo: null,
      }));
      return;
    }
    
    // Video takes precedence as master, otherwise the first loaded track
    const videoTrack = updatedTracks.find(t => t.type === 'video');
    const master = videoTrack || updatedTracks[0];
    
    setMediaUrl(master.url);
    setMediaType(master.type);
    setMediaName(master.name);
    
    if (master.type === 'video') {
      setStyleConfig(prev => ({ ...prev, bgType: 'video', bgVideo: master.url }));
    } else {
      setStyleConfig(prev => ({
        ...prev,
        bgType: prev.bgType === 'video' ? 'color' : prev.bgType,
        bgVideo: null,
      }));
    }
    
    // Set total duration to the maximum span of all tracks combined
    const totalDuration = Math.max(...updatedTracks.map(t => t.offset + t.duration));
    setDuration(totalDuration);
  };

  const getMediaDuration = (file: File, type: 'audio' | 'video'): Promise<number> => {
    return new Promise((resolve) => {
      const el = document.createElement(type);
      el.src = URL.createObjectURL(file);
      el.onloadedmetadata = () => {
        resolve(el.duration || 180);
        URL.revokeObjectURL(el.src);
      };
      el.onerror = () => {
        resolve(180);
      };
    });
  };

  const addTrack = async (file: File, waveformData?: { peaks: number[]; duration: number } | null) => {
    const isVideo = file.type.startsWith('video/');
    const type = isVideo ? 'video' : 'audio';
    
    if (isVideo && tracks.some(t => t.type === 'video')) {
      alert('Maximum 1 video background is supported.');
      return;
    }
    
    const durationVal = waveformData ? waveformData.duration : await getMediaDuration(file, type);
    const url = URL.createObjectURL(file);
    const newTrack: MediaTrack = {
      id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url,
      type,
      volume: 1.0,
      offset: 0,
      duration: durationVal || 180,
      waveformData: waveformData || null,
      isMuted: false,
      isSoloed: false,
    };
    
    const updated = [...tracks, newTrack];
    syncMasterTrack(updated);
  };

  const removeTrack = (id: string) => {
    const track = tracks.find(t => t.id === id);
    if (track) {
      URL.revokeObjectURL(track.url);
    }
    const updated = tracks.filter(t => t.id !== id);
    syncMasterTrack(updated);
  };

  const updateTrackOffset = (id: string, offset: number) => {
    const updated = tracks.map(t => t.id === id ? { ...t, offset: Math.max(0, offset) } : t);
    syncMasterTrack(updated);
  };

  const updateTrackVolume = (id: string, volume: number) => {
    const updated = tracks.map(t => t.id === id ? { ...t, volume: Math.max(0, Math.min(1, volume)) } : t);
    syncMasterTrack(updated);
  };

  const toggleMuteTrack = (id: string) => {
    const updated = tracks.map(t => t.id === id ? { ...t, isMuted: !t.isMuted } : t);
    syncMasterTrack(updated);
  };

  const toggleSoloTrack = (id: string) => {
    const target = tracks.find(t => t.id === id);
    if (!target) return;
    const nextSoloState = !target.isSoloed;
    const updated = tracks.map(t => 
      t.id === id ? { ...t, isSoloed: nextSoloState } : { ...t, isSoloed: false }
    );
    syncMasterTrack(updated);
  };

  const loadMedia = async (file: File) => {
    await addTrack(file);
  };

  const clearMedia = () => {
    tracks.forEach(t => URL.revokeObjectURL(t.url));
    syncMasterTrack([]);
  };

  const updateStyleConfig = (config: Partial<StyleConfig>) => {
    setStyleConfig(prev => ({ ...prev, ...config }));
  };

  // Sync timing actions
  const startSyllableSync = useCallback((time: number) => {
    if (lines.length === 0 || currentLineIndex >= lines.length) return;
    
    const currentLine = lines[currentLineIndex];
    if (currentSyllableIndex >= currentLine.syllables.length) return;
    
    pushHistory(lines, currentLineIndex, currentSyllableIndex);
    
    const newLines = [...lines];
    const targetSyl = { ...newLines[currentLineIndex].syllables[currentSyllableIndex] };
    
    targetSyl.startTime = Number(time.toFixed(3));
    targetSyl.endTime = null; // will be set on release
    
    newLines[currentLineIndex].syllables[currentSyllableIndex] = targetSyl;
    
    // Set line start time if this is the first syllable
    if (currentSyllableIndex === 0) {
      newLines[currentLineIndex].startTime = Number(time.toFixed(3));
    }
    
    setLinesState(newLines);
  }, [lines, currentLineIndex, currentSyllableIndex, pushHistory]);

  const endSyllableSync = useCallback((time: number) => {
    if (lines.length === 0 || currentLineIndex >= lines.length) return;
    
    const currentLine = lines[currentLineIndex];
    if (currentSyllableIndex >= currentLine.syllables.length) return;
    
    const newLines = [...lines];
    const targetSyl = { ...newLines[currentLineIndex].syllables[currentSyllableIndex] };
    
    // Safety check: ensure endTime is greater than startTime
    const endT = Number(time.toFixed(3));
    const startT = targetSyl.startTime !== null ? targetSyl.startTime : endT - 0.1;
    
    targetSyl.startTime = startT;
    targetSyl.endTime = Math.max(endT, startT + 0.05); // Min duration 50ms
    
    newLines[currentLineIndex].syllables[currentSyllableIndex] = targetSyl;
    
    // Set line end time on sync completion of each syllable, keeping track of the latest
    newLines[currentLineIndex].endTime = targetSyl.endTime;
    
    setLinesState(newLines);
    
    // Advance index
    if (currentSyllableIndex + 1 < currentLine.syllables.length) {
      // Next syllable in same line
      setCurrentSyllableIndex(prev => prev + 1);
    } else if (currentLineIndex + 1 < lines.length) {
      // Next line, first syllable
      setCurrentLineIndex(prev => prev + 1);
      setCurrentSyllableIndex(0);
    } else {
      // Finished all lyrics sync!
      setIsRecording(false);
      setCurrentSyllableIndex(prev => prev + 1); // push out of bounds to show complete
    }
  }, [lines, currentLineIndex, currentSyllableIndex]);

  const resetSync = () => {
    pushHistory(lines, currentLineIndex, currentSyllableIndex);
    
    const resetLines = lines.map(line => ({
      ...line,
      startTime: null,
      endTime: null,
      syllables: line.syllables.map(s => ({
        ...s,
        startTime: null,
        endTime: null
      }))
    }));
    
    setLinesState(resetLines);
    setCurrentLineIndex(0);
    setCurrentSyllableIndex(0);
    setIsRecording(false);
  };

  const jumpToSyllable = (lineIdx: number, sylIdx: number) => {
    if (lineIdx >= 0 && lineIdx < lines.length) {
      const line = lines[lineIdx];
      if (sylIdx >= 0 && sylIdx <= line.syllables.length) {
        setCurrentLineIndex(lineIdx);
        setCurrentSyllableIndex(sylIdx);
      }
    }
  };

  const updateSyllableTime = (lineIdx: number, sylIdx: number, start: number | null, end: number | null) => {
    if (lineIdx < 0 || lineIdx >= lines.length) return;
    const line = lines[lineIdx];
    if (sylIdx < 0 || sylIdx >= line.syllables.length) return;
    
    pushHistory(lines, currentLineIndex, currentSyllableIndex);
    
    const newLines = JSON.parse(JSON.stringify(lines)) as Line[];
    const syl = newLines[lineIdx].syllables[sylIdx];
    syl.startTime = start !== null ? Number(start.toFixed(3)) : null;
    syl.endTime = end !== null ? Number(end.toFixed(3)) : null;
    
    // Recalculate line boundaries
    const activeSyls = newLines[lineIdx].syllables.filter(s => s.startTime !== null);
    if (activeSyls.length > 0) {
      newLines[lineIdx].startTime = Math.min(...activeSyls.map(s => s.startTime!));
      newLines[lineIdx].endTime = Math.max(...activeSyls.map(s => s.endTime || s.startTime!));
    } else {
      newLines[lineIdx].startTime = null;
      newLines[lineIdx].endTime = null;
    }
    
    setLinesState(newLines);
  };

  const updateSyllableText = (lineIdx: number, sylIdx: number, text: string) => {
    if (lineIdx < 0 || lineIdx >= lines.length) return;
    const line = lines[lineIdx];
    if (sylIdx < 0 || sylIdx >= line.syllables.length) return;
    
    pushHistory(lines, currentLineIndex, currentSyllableIndex);
    
    const newLines = [...lines];
    const newSyllables = [...newLines[lineIdx].syllables];
    newSyllables[sylIdx] = { ...newSyllables[sylIdx], text: text.trim() };
    newLines[lineIdx] = {
      ...newLines[lineIdx],
      syllables: newSyllables,
      text: newSyllables.map(s => s.text).join(' ')
    };
    
    setLinesState(newLines);
  };

  return (
    <KaraokeContext.Provider
      value={{
        lyricsInput,
        lines,
        currentLineIndex,
        currentSyllableIndex,
        isPlaying,
        currentTime,
        duration,
        playbackRate,
        mediaUrl,
        mediaType,
        mediaName,
        isRecording,
        styleConfig,
        tracks,
        setLyricsInput,
        parseLyrics,
        setLines,
        setCurrentLineIndex,
        setCurrentSyllableIndex,
        setIsPlaying,
        setCurrentTime,
        setDuration,
        setPlaybackRate,
        loadMedia,
        clearMedia,
        setIsRecording,
        updateStyleConfig,
        addTrack,
        removeTrack,
        updateTrackOffset,
        updateTrackVolume,
        toggleMuteTrack,
        toggleSoloTrack,
        startSyllableSync,
        endSyllableSync,
        resetSync,
        jumpToSyllable,
        updateSyllableTime,
        updateSyllableText,
        undo,
        redo,
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0,
      }}
    >
      {children}
    </KaraokeContext.Provider>
  );
};

export const useKaraoke = () => {
  const context = useContext(KaraokeContext);
  if (context === undefined) {
    throw new Error('useKaraoke must be used within a KaraokeProvider');
  }
  return context;
};
